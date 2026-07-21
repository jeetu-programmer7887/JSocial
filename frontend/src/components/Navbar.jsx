import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '../Layout/SocketContext.jsx';

export default function Navbar() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const isFullyLoggedIn = isAuthenticated && user && user.username;
    
    const { socket } = useSocket();
    
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

    const isNotificationsPage = location.pathname.startsWith('/notifications');
    const displayAlertsCount = isNotificationsPage ? 0 : unreadAlertsCount;

    // 👇 NEW: Listen for the custom event from Messages.jsx
    useEffect(() => {
        const handleBadgeUpdate = (e) => {
            setUnreadMessageCount(e.detail); // e.detail contains the unreadCount
        };
        
        window.addEventListener('updateMessageBadge', handleBadgeUpdate);
        
        return () => {
            window.removeEventListener('updateMessageBadge', handleBadgeUpdate);
        };
    }, []);

    // Socket listener for real-time pop-ups
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = () => {
            // Only bump the count blindly if they aren't looking at the messages list
            if (!window.location.pathname.startsWith('/messages')) {
                setUnreadMessageCount((prev) => prev + 1);
            }
        };

        const handleNewAlert = () => {
            if (!window.location.pathname.startsWith('/notifications')) {
                setUnreadAlertsCount((prev) => prev + 1);
            }
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("newNotification", handleNewAlert); 

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("newNotification", handleNewAlert);
        };
    }, [socket]);

    return (
        <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-[90%] lg:w-[85%] max-w-6xl">
            <nav className="bg-surface/70 backdrop-blur-xl border border-white/10 rounded-full px-3 py-2 sm:px-6 sm:py-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300">
                <div className="flex items-center justify-between">

                    <Link to="/" className="flex items-center group transition-transform hover:scale-105">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full overflow-hidden shadow-lg shadow-primary/20 mr-2 sm:mr-3 group-hover:shadow-primary/40 transition-shadow bg-surface">
                            <img src="/jsocial.png" alt="JSocial Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-text font-bold tracking-tight hidden md:block text-lg">JSocial</span>
                    </Link>

                    <div className="flex items-center space-x-0.5 sm:space-x-1 bg-bg/40 border border-white/5 rounded-full px-1 py-1">
                        <Link to="/" className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${isActive('/') ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-text hover:bg-white/5'}`}>
                            Feed
                        </Link>
                        <Link to="/explore" className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${isActive('/explore') ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-text hover:bg-white/5'}`}>
                            Explore
                        </Link>

                        <Link to="/notifications" onClick={() => setUnreadAlertsCount(0)} className={`flex items-center px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${isNotificationsPage ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-text hover:bg-white/5'}`}>
                            Alerts
                            {displayAlertsCount > 0 && (
                                <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                                    {displayAlertsCount > 9 ? '9+' : displayAlertsCount}
                                </span>
                            )}
                        </Link>
                        
                        {/* Messages Tab */}
                        <Link to="/messages" className={`flex items-center px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${isActive('/messages') || location.pathname.startsWith('/messages') ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-text hover:bg-white/5'}`}>
                            Messages
                            {/* Uses the true synchronized count now */}
                            {unreadMessageCount > 0 && (
                                <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                                    {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4 pl-1 sm:pl-2">
                        {!isFullyLoggedIn ? (
                            <>
                                <Link to="/login" className="hidden sm:block text-xs sm:text-sm font-medium text-text px-2 sm:px-4 py-2 rounded-full hover:bg-white/5 transition-colors">Log in</Link>
                                <Link to="/register" className="text-xs sm:text-sm font-bold bg-primary text-bg px-4 sm:px-6 py-1.5 sm:py-2 rounded-full hover:bg-opacity-90 transition-all shadow-md shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap">Sign up</Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to={`/profile`} className="flex items-center gap-2 group cursor-pointer hover:bg-white/5 p-1 pr-3 rounded-full transition-colors">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-bg font-bold text-xs shadow-sm overflow-hidden">
                                        {user?.profileImg ? <img src={user.profileImg} alt="Profile" className="w-full h-full object-cover" /> : user?.fullname?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden sm:block text-xs sm:text-sm font-medium text-text group-hover:text-primary transition-colors">@{user.username}</span>
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </nav>
        </div>
    );
}