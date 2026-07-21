import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useSocket } from '../Layout/SocketContext.jsx';

export default function Messages() {
    const { user } = useSelector((state) => state.auth);
    const { onlineUsers } = useSocket();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const backendUrl = import.meta.env.VITE_backendUrl || 'http://localhost:3000';

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/messages/conversations`, {
                    withCredentials: true
                });

                if (res.data.success) {
                    const fetchedConvos = res.data.conversations;
                    setConversations(fetchedConvos);

                    // 👇 NEW: Calculate total unread red dots
                    const unreadCount = fetchedConvos.filter(conv => 
                        conv.lastMessage?.status !== 'read' && 
                        conv.lastMessage?.senderId === conv.otherUser._id
                    ).length;

                    // 👇 NEW: Broadcast the exact number to the Navbar!
                    window.dispatchEvent(new CustomEvent('updateMessageBadge', { detail: unreadCount }));
                }
            } catch (error) {
                console.error("Failed to fetch conversations", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, [backendUrl]);

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 mt-16 sm:mt-20">
            <div className="bg-surface/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">

                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-text">Messages</h2>
                    <Link to="/explore" className="text-sm text-primary hover:underline">
                        New Message
                    </Link>
                </div>

                <div className="flex flex-col">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted font-bold animate-pulse">Loading messages...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-12 text-center text-muted">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                            </div>
                            <h3 className="text-lg font-bold text-text mb-2">No messages yet</h3>
                            <p className="text-sm">Start a conversation with someone you follow!</p>
                        </div>
                    ) : (
                        conversations.map((conv) => {
                            const otherUser = conv.otherUser;
                            const isOnline = onlineUsers.includes(otherUser._id);
                            const isUnread = conv.lastMessage?.status !== 'read' && conv.lastMessage?.senderId === otherUser._id;

                            return (
                                <div
                                    key={conv._id}
                                    onClick={() => navigate(`/messages/${otherUser._id}`)}
                                    className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
                                >
                                    <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border border-white/10 bg-surface flex items-center justify-center font-bold text-xl text-text">
                                        {otherUser.profileImg ? (
                                            <img src={otherUser.profileImg} className="w-full h-full object-cover" alt={otherUser.username} />
                                        ) : (
                                            otherUser.username?.charAt(0).toUpperCase()
                                        )}
                                        {isOnline && (
                                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-surface rounded-full shadow-sm"></div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className={`text-base truncate pr-4 ${isUnread ? 'font-bold text-text' : 'font-semibold text-text/90'}`}>
                                                {otherUser.fullname}
                                            </h4>
                                            <span className="text-xs text-muted whitespace-nowrap shrink-0">
                                                {formatTime(conv.lastMessage?.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4">
                                            <p className={`text-sm truncate ${isUnread ? 'text-text font-bold' : 'text-muted'}`}>
                                                {conv.lastMessage?.senderId === user._id ? 'You: ' : ''}
                                                {conv.lastMessage?.text || (conv.lastMessage?.imgUrl ? '📷 Sent a photo' : 'Started a conversation')}
                                            </p>

                                            {isUnread && (
                                                <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </div>
    );
}