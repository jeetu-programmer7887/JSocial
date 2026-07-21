import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { setCredentials } from '../redux/authSlice';

export default function OtherUser() {
    const { username } = useParams();
    const { user: currentUser } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_backendUrl || '';

    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Modal & Interaction States
    const [selectedPost, setSelectedPost] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [doubleTapHeart, setDoubleTapHeart] = useState(null);

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

            const isCurrentlyFollowing = currentUser.following?.includes(profile._id);
            setProfile(prev => ({
                ...prev,
                followers: isCurrentlyFollowing
                    ? prev.followers.filter(id => id !== currentUser._id)
                    : [...prev.followers, currentUser._id]
            }));

            const meRes = await axios.get(`${backendUrl}/api/auth/me`, { withCredentials: true });
            dispatch(setCredentials(meRes.data));
        } catch (error) {
            toast.error(error.response?.data || "Failed to update follow status");
        } finally {
            setIsActionLoading(false);
        }
    };

    // 3. Handle Like (Optimistic UI)
    const handleLike = async (postId) => {
        if (!currentUser) return toast.error("Please log in to like posts!", { icon: '🔒' });

        // Optimistically update both the grid array AND the active modal post
        const updateLikes = (hasLiked, likesArray) =>
            hasLiked ? likesArray.filter(id => id !== currentUser._id) : [...likesArray, currentUser._id];

        setProfile(prev => ({
            ...prev,
            posts: prev.posts.map(p =>
                p._id === postId ? { ...p, likes: updateLikes(p.likes.includes(currentUser._id), p.likes) } : p
            )
        }));

        if (selectedPost?._id === postId) {
            setSelectedPost(prev => ({
                ...prev,
                likes: updateLikes(prev.likes.includes(currentUser._id), prev.likes)
            }));
        }

        try {
            await axios.post(`${backendUrl}/api/post/like/${postId}`, {}, { withCredentials: true });
        } catch (error) {
            toast.error("Failed to like post", error.message);
        }
    };

    // 4. Handle Double Tap Animation
    const handleDoubleTap = (postId, hasLiked) => {
        if (!currentUser) return toast.error("Please log in to like posts!");

        setDoubleTapHeart(postId);
        setTimeout(() => setDoubleTapHeart(null), 1000);

        if (!hasLiked) handleLike(postId);
    };

    // 5. Handle Comment Submission
    const handleCommentSubmit = async (e, postId) => {
        e.preventDefault();
        if (!currentUser) return toast.error("Please log in to comment!", { icon: '🔒' });
        if (!commentText.trim()) return;

        try {
            const res = await axios.post(`${backendUrl}/api/post/comment/${postId}`, { text: commentText }, { withCredentials: true });
            if (res.data?.success) {
                // Update grid
                setProfile(prev => ({
                    ...prev,
                    posts: prev.posts.map(p =>
                        p._id === postId ? { ...p, comments: [...p.comments, res.data.comment] } : p
                    )
                }));
                // Update modal
                setSelectedPost(prev => ({
                    ...prev,
                    comments: [...prev.comments, res.data.comment]
                }));

                setCommentText("");
                toast.success("Comment added!");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to post comment");
        }
    };

    // --- 6. Handle Share ---
    const handleShare = (username) => {
        // Construct the full URL pointing to this specific post
        const postUrl = `${window.location.origin}/profile/${username}`;

        // Copy to clipboard
        navigator.clipboard.writeText(postUrl)
            .then(() => {
                toast.success("Link copied to clipboard!", {
                    icon: '🔗',
                    position: 'bottom-center'
                });
            })
            .catch(() => {
                toast.error("Failed to copy link");
            });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-32 w-full">
                <div className="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
                <h2 className="text-2xl font-bold text-text">User not found</h2>
                <Link to="/" className="text-primary hover:underline font-bold mt-2">Go back home</Link>
            </div>
        );
    }

    const isOwner = currentUser?._id === profile._id;
    const isFollowing = currentUser?.following?.includes(profile._id);

    return (
        <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-10">

            {/* --- TOP: Profile Header --- */}
            <div className="bg-surface/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
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
                            {isOwner ? (
                                <button className="bg-white/10 hover:bg-white/20 text-text font-bold px-6 py-2 rounded-xl transition-colors text-sm w-full sm:w-auto">
                                    Edit Profile
                                </button>
                            ) : (
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={isActionLoading}
                                    className={`font-bold px-8 py-2 cursor-pointer rounded-xl transition-all text-sm w-full sm:w-auto disabled:opacity-50 active:scale-95 ${isFollowing
                                        ? 'bg-white/10 hover:bg-white/20 text-text border border-white/10'
                                        : 'bg-primary hover:bg-primary/90 text-bg shadow-md shadow-primary/20'
                                        }`}
                                >
                                    {isActionLoading ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
                                </button>
                            )}
                            <button
                                onClick={() => navigate(`/messages/${profile._id}`)}
                                className="px-6 py-2 bg-secondary text-amber-800 font-bold rounded-full hover:bg-secondary/80 transition-colors"
                            >
                                Message
                            </button>
                            <button
                                onClick={() => handleShare(profile.username)}
                                className="px-6 py-2 bg-secondary text-amber-800 font-bold rounded-full hover:bg-secondary/80 transition-colors"
                            >
                                <span className='lg:hidden'>Share Profile</span>
                                <span className='hidden lg:block'>Share</span>
                            </button>
                        </div>

                        {/* Stats Row */}
                        <div className="flex gap-8 mb-6 w-full justify-center sm:justify-start">
                            <div className="flex flex-col sm:flex-row sm:gap-1.5 items-center">
                                <span className="font-bold text-text text-lg">{profile.posts?.length || 0}</span>
                                <span className="text-muted text-sm">posts</span>
                            </div>
                            <Link to={`/profile/${profile.username}/followers`} className="flex flex-col sm:flex-row sm:gap-1.5 items-center cursor-pointer hover:opacity-80 transition-opacity">
                                <span className="font-bold text-text text-lg">{profile.followers?.length || 0}</span>
                                <span className="text-muted text-sm">followers</span>
                            </Link>
                            <Link to={`/profile/${profile.username}/following`} className="flex flex-col sm:flex-row sm:gap-1.5 items-center cursor-pointer hover:opacity-80 transition-opacity">
                                <span className="font-bold text-text text-lg">{profile.following?.length || 0}</span>
                                <span className="text-muted text-sm">following</span>
                            </Link>
                        </div>

                        <div className="text-center sm:text-left w-full">
                            <h1 className="font-bold text-text text-lg">{profile.fullname}</h1>
                            {profile.bio && <p className="text-sm text-text/80 mt-2 max-w-lg whitespace-pre-wrap leading-relaxed">{profile.bio}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BOTTOM: Posts Grid --- */}
            <div className="border-t border-white/10 pt-8">
                <div className="flex justify-center gap-12 mb-8">
                    <div className="flex items-center gap-2 text-text border-t-2 border-primary -mt-8.25 pt-7.75 font-bold text-xs uppercase tracking-widest cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                        Posts
                    </div>
                </div>

                {profile.posts?.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-muted bg-surface/30 rounded-3xl border border-white/5">
                        <h3 className="text-xl font-bold text-text mb-2">No Posts Yet</h3>
                        <p className="text-sm max-w-xs text-center">When @{profile.username} shares photos, they will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                        {profile.posts.map((post) => (
                            <div
                                key={post._id}
                                onClick={() => setSelectedPost(post)}
                                className="relative aspect-square group cursor-pointer bg-surface overflow-hidden"
                            >
                                {post.imgUrl ? (
                                    <img src={post.imgUrl} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center p-4 text-center bg-white/5 text-sm text-text">
                                        {post.caption?.substring(0, 50)}...
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 backdrop-blur-[2px]">
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
                                        <span>{post.likes?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"></path></svg>
                                        <span>{post.comments?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- POST MODAL OVERLAY --- */}
            {selectedPost && (
                <div
                    className="fixed inset-0 z-100 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-fade-in"
                    onClick={() => setSelectedPost(null)}
                >
                    {/* Close Button */}
                    <button className="absolute top-4 right-4 text-white hover:text-primary transition-colors p-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>

                    <div
                        className="w-full max-w-5xl max-h-[90vh] bg-surface border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
                        onClick={(e) => e.stopPropagation()} // Prevents clicks inside modal from closing it
                    >
                        {/* Left Side: Image */}
                        <div
                            className="w-full md:w-3/5 bg-black flex items-center justify-center relative cursor-pointer group/image"
                            onDoubleClick={() => handleDoubleTap(selectedPost._id, selectedPost.likes?.includes(currentUser?._id))}
                        >
                            {selectedPost.imgUrl && (
                                <img src={selectedPost.imgUrl} className="w-full h-full object-contain max-h-[50vh] md:max-h-[90vh]" alt="Post content" />
                            )}

                            {/* Double-Tap Heart Overlay */}
                            {doubleTapHeart === selectedPost._id && (
                                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                    <svg className="w-32 h-32 text-primary drop-shadow-2xl animate-heart-pop" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Right Side: Details & Comments */}
                        <div className="w-full md:w-2/5 flex flex-col bg-surface h-[40vh] md:h-auto border-l border-white/5">

                            {/* Modal Header */}
                            <div className="p-4 border-b border-white/10 flex items-center gap-3 shrink-0">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 shrink-0">
                                    {profile.profileImg ? <img src={profile.profileImg} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary flex items-center justify-center text-bg font-bold text-xs">{profile.fullname.charAt(0)}</div>}
                                </div>
                                <span className="font-bold text-text text-sm">{profile.username}</span>
                            </div>

                            {/* Comments Scroll Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {/* The Post Caption (rendered as first comment) */}
                                {selectedPost.caption && (
                                    <div className="flex gap-3 items-start">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 shrink-0 mt-1">
                                            {profile.profileImg ? <img src={profile.profileImg} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary flex items-center justify-center text-bg font-bold text-xs">{profile.fullname.charAt(0)}</div>}
                                        </div>
                                        <div>
                                            <span className="font-bold text-text text-sm mr-2">{profile.username}</span>
                                            <span className="text-sm text-text whitespace-pre-wrap">{selectedPost.caption}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Actual Comments */}
                                {selectedPost.comments?.map(comment => (
                                    <div key={comment._id} className="flex gap-3 items-start">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 shrink-0 mt-1">
                                            {comment.user?.profileImg ? <img src={comment.user.profileImg} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-secondary flex items-center justify-center text-bg font-bold text-xs">{comment.user?.fullname?.charAt(0) || 'U'}</div>}
                                        </div>
                                        <div>
                                            <span className="font-bold text-text text-sm mr-2">{comment.user?.username || 'unknown'}</span>
                                            <span className="text-sm text-text">{comment.text}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Bar (Like Button) */}
                            <div className="p-4 border-t border-white/10 shrink-0">
                                <button onClick={() => handleLike(selectedPost._id)} className="flex items-center gap-2 group mb-2 active:scale-95 transition-transform">
                                    <svg className={`w-7 h-7 transition-colors ${selectedPost.likes?.includes(currentUser?._id) ? 'text-red-500 fill-red-500' : 'text-text group-hover:text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                </button>
                                <div className="font-bold text-sm text-text">{selectedPost.likes?.length || 0} likes</div>
                            </div>

                            {/* Add Comment Input */}
                            <form onSubmit={(e) => handleCommentSubmit(e, selectedPost._id)} className="px-4 py-3 border-t border-white/10 flex gap-2 shrink-0 bg-surface/50">
                                <input
                                    type="text"
                                    placeholder={currentUser ? "Add a comment..." : "Log in to comment..."}
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    disabled={!currentUser}
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-text disabled:opacity-50"
                                />
                                <button type="submit" disabled={!currentUser || !commentText.trim()} className="text-primary font-bold text-sm disabled:opacity-30">
                                    Send
                                </button>
                            </form>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}