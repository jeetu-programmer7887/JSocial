import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Alerts() {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const backendUrl = import.meta.env.VITE_backendUrl || '';

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/notifications`, {
                    withCredentials: true
                });
                if (res.data?.success) {
                    setNotifications(res.data.notifications);
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, [backendUrl]);

    const clearAll = async () => {
        try {
            await axios.delete(`${backendUrl}/api/notifications`, { withCredentials: true });
            setNotifications([]);
            toast.success("Alerts cleared");
        } catch (error) {
            toast.error("Failed to clear alerts", error.message);
        }
    };

    return (
        <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
            
            {/* Header */}
            <div className="flex items-center justify-between bg-surface/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-md sticky top-20 z-40">
                <h2 className="text-2xl font-bold text-text">Alerts</h2>
                {notifications.length > 0 && (
                    <button 
                        onClick={clearAll}
                        className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors bg-red-500/10 px-4 py-2 rounded-full"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="bg-surface/40 backdrop-blur-xl border border-white/5 rounded-3xl p-4 sm:p-6 shadow-md flex flex-col gap-2 min-h-[50vh]">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center gap-3 text-muted">
                        <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        <p className="font-bold">No new alerts.</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div key={notification._id} className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${notification.read ? 'hover:bg-white/5' : 'bg-primary/10 border border-primary/20'}`}>
                            
                            {/* Icon Indicator */}
                            <div className="shrink-0">
                                {notification.type === 'like' && <svg className="w-8 h-8 text-red-500 fill-red-500" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>}
                                {notification.type === 'comment' && <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>}
                                {notification.type === 'follow' && <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>}
                            </div>

                            {/* Avatar */}
                            <Link to={`/profile/${notification.sender.username}`} className="w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/5">
                                {notification.sender.profileImg ? (
                                    <img src={notification.sender.profileImg} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-bg font-bold bg-secondary text-sm">
                                        {notification.sender.fullname?.charAt(0)}
                                    </div>
                                )}
                            </Link>

                            {/* Text Content */}
                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <Link to={`/profile/${notification.sender.username}`} className="font-bold text-text hover:underline">
                                    {notification.sender.username}
                                </Link>
                                <span className="text-muted text-sm">
                                    {notification.type === 'like' && 'liked your post.'}
                                    {notification.type === 'comment' && 'commented on your post.'}
                                    {notification.type === 'follow' && 'started following you.'}
                                </span>
                            </div>

                            {/* Optional: Post Thumbnail */}
                            {notification.post?.imgUrl && (
                                <Link to={`/post/${notification.post._id}`} className="w-10 h-10 rounded-md overflow-hidden shrink-0 ml-2 border border-white/10">
                                    <img src={notification.post.imgUrl} className="w-full h-full object-cover" />
                                </Link>
                            )}

                        </div>
                    ))
                )}
            </div>
        </div>
    );
}