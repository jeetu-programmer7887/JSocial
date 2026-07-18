import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../redux/authSlice';

export default function SuggestedUsers() {
    const { user: currentUser } = useSelector((state) => state.auth);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const backendUrl = import.meta.env.VITE_backendUrl || '';
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchSuggestions = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${backendUrl}/api/user/suggested`, {
                    withCredentials: true
                });
                setSuggestions(res.data.SuggestedUser);
            } catch (error) {
                console.error("Failed to fetch suggestions", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [backendUrl]);

    const handleFollow = async (userId) => {
        if (!currentUser) {
            toast.error("Please log in to follow users");
            return;
        }

        setActionLoading(userId);
        try {
            const res = await axios.post(`${backendUrl}/api/user/follow/${userId}`, {}, {
                withCredentials: true
            });

            toast.success(res.data);

            // 1. Remove the followed user from the suggestions list in the UI
            setSuggestions((prev) => prev.filter((u) => u._id !== userId));

            // 2. Fetch the authenticated user's updated data to keep Redux synced
            const meRes = await axios.get(`${backendUrl}/api/auth/me`, { withCredentials: true });
            dispatch(setCredentials(meRes.data));

        } catch (error) {
            toast.error(error.response?.data || "Failed to follow user");
        } finally {
            setActionLoading(null);
        }
    };

    // --- RENDER: Loading Skeleton ---
    if (isLoading) {
        return (
            <div className="bg-surface/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 w-full animate-pulse shadow-lg">
                <div className="h-4 bg-white/10 rounded w-1/2 mb-6"></div>
                {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 shrink-0"></div>
                        <div className="flex-1">
                            <div className="h-3 bg-white/10 rounded w-3/4 mb-2"></div>
                            <div className="h-2 bg-white/5 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // --- RENDER: Hidden if no suggestions ---
    if (suggestions.length === 0) return null; 

    return (
        <div className="bg-surface/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] sticky top-28">
            <h3 className="text-sm font-bold text-muted mb-4 uppercase tracking-widest">Suggested for you</h3>

            <div className="space-y-4">
                {suggestions.map((suggestedUser) => (
                    <div key={suggestedUser._id} className="flex items-center justify-between gap-3 group">

                        {/* 🚨 CLICKABLE PROFILE LINK: This redirects to /profile/:username */}
                        <Link 
                            to={`/profile/${suggestedUser.username}`} 
                            className="flex items-center gap-3 overflow-hidden flex-1 p-1 -ml-1 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                            title={`View @${suggestedUser.username}'s profile`}
                        >
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-tr from-primary to-secondary shrink-0 border border-white/10 shadow-sm">
                                {suggestedUser.profileImg ? (
                                    <img src={suggestedUser.profileImg} alt={suggestedUser.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-bg font-bold text-sm">
                                        {suggestedUser.fullname.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col truncate">
                                <span className="text-sm font-bold text-text truncate group-hover:text-primary transition-colors">
                                    {suggestedUser.fullname}
                                </span>
                                <span className="text-xs text-muted truncate">
                                    @{suggestedUser.username}
                                </span>
                            </div>
                        </Link>

                        {/* FOLLOW BUTTON: Independent from the Link above */}
                        <button
                            onClick={() => handleFollow(suggestedUser._id)}
                            disabled={actionLoading === suggestedUser._id}
                            className="bg-white/5 hover:bg-primary/20 text-text hover:text-primary border border-white/10 hover:border-primary/50 text-xs font-bold px-4 py-1.5 rounded-full transition-all duration-300 whitespace-nowrap disabled:opacity-50 active:scale-95"
                        >
                            {actionLoading === suggestedUser._id ? '...' : 'Follow'}
                        </button>

                    </div>
                ))}
            </div>
        </div>
    );
}