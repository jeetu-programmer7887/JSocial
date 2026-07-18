import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { setCredentials } from '../redux/authSlice';

export default function OtherUser() {
    const { username } = useParams();
    const { user: currentUser } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const backendUrl = import.meta.env.VITE_backendUrl || '';

    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // 1. Fetch Profile and Posts
    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${backendUrl}/api/user/profile/${username}`, {
                    withCredentials: true
                });

                setProfile(res.data.profile);
            } catch (error) {
                toast.error(error.response?.data?.message || "User not found");
                setProfile(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [username, backendUrl]);

    // 2. Handle Follow / Unfollow logic
    const handleFollowToggle = async () => {
        if (!currentUser) {
            toast.error("Please log in to follow users");
            return;
        }

        setIsActionLoading(true);
        try {
            const res = await axios.post(`${backendUrl}/api/user/follow/${profile._id}`, {}, {
                withCredentials: true
            });

            toast.success(res.data);

            // Optimistically update the local profile state
            const isCurrentlyFollowing = currentUser.following?.includes(profile._id);
            setProfile(prev => ({
                ...prev,
                followers: isCurrentlyFollowing
                    ? prev.followers.filter(id => id !== currentUser._id)
                    : [...prev.followers, currentUser._id]
            }));

            // Refresh the current logged-in user's Redux state
            const meRes = await axios.get(`${backendUrl}/api/auth/me`, { withCredentials: true });
            dispatch(setCredentials(meRes.data));

        } catch (error) {
            toast.error(error.response?.data || "Failed to update follow status");
        } finally {
            setIsActionLoading(false);
        }
    };

    // --- Loading State ---
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-32 w-full">
                <div className="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    // --- Not Found State ---
    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-text">User not found</h2>
                <p className="text-muted">The link you followed may be broken, or the page may have been removed.</p>
                <Link to="/" className="text-primary hover:underline font-bold mt-2">Go back home</Link>
            </div>
        );
    }

    // --- Determine Button State ---
    const isOwner = currentUser?._id === profile._id;
    const isFollowing = currentUser?.following?.includes(profile._id);

    return (
        <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-10">

            {/* --- TOP: Profile Header --- */}
            <div className="bg-surface/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">

                    {/* Avatar */}
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-linear-to-tr from-primary to-secondary shrink-0 border-4 border-surface shadow-xl flex items-center justify-center text-bg font-bold text-5xl">
                        {profile.profileImg ? (
                            <img src={profile.profileImg} alt={profile.username} className="w-full h-full object-cover" />
                        ) : (
                            profile.fullname.charAt(0).toUpperCase()
                        )}
                    </div>

                    {/* User Info & Stats */}
                    <div className="flex flex-col flex-1 w-full items-center sm:items-start">

                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 w-full sm:w-auto">
                            <h2 className="text-2xl font-bold text-text">@{profile.username}</h2>

                            {/* Action Button */}
                            {isOwner ? (
                                <button className="bg-white/10 hover:bg-white/20 text-text font-bold px-6 py-2 rounded-xl transition-colors text-sm w-full sm:w-auto">
                                    Edit Profile
                                </button>
                            ) : (
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={isActionLoading}
                                    className={`font-bold px-8 py-2 rounded-xl transition-all text-sm w-full sm:w-auto disabled:opacity-50 active:scale-95 ${isFollowing
                                        ? 'bg-white/10 hover:bg-white/20 text-text border border-white/10'
                                        : 'bg-primary hover:bg-primary/90 text-bg shadow-md shadow-primary/20'
                                        }`}
                                >
                                    {isActionLoading ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
                                </button>
                            )}
                        </div>

                        {/* Stats Row */}
                        <div className="flex gap-8 mb-6 w-full justify-center sm:justify-start">
                            {/* Posts Count (Not clickable) */}
                            <div className="flex flex-col sm:flex-row sm:gap-1.5 items-center">
                                <span className="font-bold text-text text-lg">{profile.posts?.length || 0}</span>
                                <span className="text-muted text-sm">posts</span>
                            </div>

                            {/* Followers Link */}
                            <Link
                                to={`/profile/${profile.username}/followers`}
                                className="flex flex-col sm:flex-row sm:gap-1.5 items-center cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <span className="font-bold text-text text-lg">{profile.followers?.length || 0}</span>
                                <span className="text-muted text-sm">followers</span>
                            </Link>

                            {/* Following Link */}
                            <Link
                                to={`/profile/${profile.username}/following`}
                                className="flex flex-col sm:flex-row sm:gap-1.5 items-center cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <span className="font-bold text-text text-lg">{profile.following?.length || 0}</span>
                                <span className="text-muted text-sm">following</span>
                            </Link>
                        </div>

                        {/* Fullname & Bio */}
                        <div className="text-center sm:text-left w-full">
                            <h1 className="font-bold text-text text-lg">{profile.fullname}</h1>
                            {profile.bio && (
                                <p className="text-sm text-text/80 mt-2 max-w-lg whitespace-pre-wrap leading-relaxed">
                                    {profile.bio}
                                </p>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* --- BOTTOM: Posts Grid --- */}
            <div className="border-t border-white/10 pt-8">

                {/* Navigation Tabs (Visual only for now) */}
                <div className="flex justify-center gap-12 mb-8">
                    <div className="flex items-center gap-2 text-text border-t-2 border-primary -mt-8.25 pt-7.75 font-bold text-xs uppercase tracking-widest cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                        Posts
                    </div>
                </div>

                {/* Grid Container */}
                {profile.posts?.length === 0 ? (

                    /* Empty State */
                    <div className="py-20 flex flex-col items-center justify-center text-muted bg-surface/30 rounded-3xl border border-white/5">
                        <div className="w-16 h-16 border-2 border-muted rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-text mb-2">No Posts Yet</h3>
                        <p className="text-sm max-w-xs text-center">When @{profile.username} shares photos, they will appear here.</p>
                    </div>

                ) : (

                    /* 3-Column Image Grid */
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                        {profile.posts.map((post) => (
                            <div key={post._id} className="relative aspect-square group cursor-pointer bg-surface overflow-hidden">

                                {/* The Post Image */}
                                {post.imgUrl ? (
                                    <img
                                        src={post.imgUrl}
                                        alt={post.caption}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                ) : (
                                    /* Fallback if a post is text-only (Optional) */
                                    <div className="w-full h-full flex items-center justify-center p-4 text-center bg-white/5 text-sm text-text">
                                        {post.caption?.substring(0, 50)}...
                                    </div>
                                )}

                                {/* Hover Overlay (Shows Likes and Comments) */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 backdrop-blur-[2px]">

                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                                        </svg>
                                        <span>{post.likes?.length || 0}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                                            <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"></path>
                                        </svg>
                                        <span>{post.comments?.length || 0}</span>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>

                )}
            </div>

        </div>
    );
}