import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
// You might need to import a thunk or action to update the Redux user's following list, 
// but re-fetching /api/auth/me is the easiest way to keep it perfectly synced.
import { setCredentials } from '../redux/authSlice';

export default function SuggestedUsers() {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const backendUrl = import.meta.env.VITE_backendUrl || '';
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                // Ensure your route matches this! (e.g., router.get('/suggested', ProtectedRoute, suggestedUser))
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
        setActionLoading(userId);
        try {
            // Ensure your route matches this! (e.g., router.post('/follow/:id', ProtectedRoute, FollowUnfollow))
            const res = await axios.post(`${backendUrl}/api/user/follow/${userId}`, {}, {
                withCredentials: true
            });

            toast.success(res.data);

            // 1. Remove the followed user from the suggestions list in the UI
            setSuggestions((prev) => prev.filter((u) => u._id !== userId));

            // 2. Fetch the authenticated user's updated data so the Redux following count updates instantly!
            const meRes = await axios.get(`${backendUrl}/api/auth/me`, { withCredentials: true });
            dispatch(setCredentials(meRes.data));

        } catch (error) {
            toast.error(error.response?.data || "Failed to follow user");
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-surface/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 w-full animate-pulse">
                <div className="h-4 bg-white/10 rounded w-1/2 mb-6"></div>
                {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white/10"></div>
                        <div className="flex-1">
                            <div className="h-3 bg-white/10 rounded w-3/4 mb-2"></div>
                            <div className="h-2 bg-white/5 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (suggestions.length === 0) return null; // Don't render the widget if no suggestions exist

    return (
        <div className="bg-surface/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 w-full shadow-lg">
            <h3 className="text-sm font-bold text-text mb-4 uppercase tracking-wider">Suggestion to follow</h3>

            <div className="space-y-4">
                {suggestions.map((suggestedUser) => (
                    <div key={suggestedUser._id} className="flex items-center justify-between gap-3 group">

                        {/* User Info (Clickable to go to profile) */}
                        <Link to={`/profile/${suggestedUser.username}`} className="flex items-center gap-3 overflow-hidden flex-1">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-tr from-primary to-secondary shrink-0 border border-white/10">
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

                        {/* Follow Button */}
                        <button
                            onClick={() => handleFollow(suggestedUser._id)}
                            disabled={actionLoading === suggestedUser._id}
                            className="bg-white/5 hover:bg-primary/20 text-text hover:text-primary border border-white/10 hover:border-primary/50 text-xs font-bold px-4 py-1.5 rounded-full transition-all duration-300 whitespace-nowrap disabled:opacity-50"
                        >
                            {actionLoading === suggestedUser._id ? '...' : 'Follow'}
                        </button>

                    </div>
                ))}
            </div>
        </div>
    );
}