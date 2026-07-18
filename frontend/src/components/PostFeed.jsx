import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

export default function PostFeed() {
    const { user } = useSelector((state) => state.auth);
    const backendUrl = import.meta.env.VITE_backendUrl || '';

    // --- State ---
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const [activeCommentBox, setActiveCommentBox] = useState(null);
    const [commentText, setCommentText] = useState("");

    // --- 1. Fetch Posts & Deduplicate ---
    useEffect(() => {
        const fetchPosts = async () => {
            if (!hasMore) return;
            setIsLoading(true);

            try {
                const res = await axios.get(`${backendUrl}/api/post/all?page=${page}&limit=10`, {
                    withCredentials: true
                });

                if (res.data?.success) {
                    setPosts((prevPosts) => {
                        const uniqueNewPosts = res.data.allPosts.filter(
                            (newPost) => !prevPosts.some((existingPost) => existingPost._id === newPost._id)
                        );
                        return [...prevPosts, ...uniqueNewPosts];
                    });

                    setHasMore(res.data.hasMore);
                }
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, [page, backendUrl, hasMore]);

    // --- 2. Infinite Scroll (Intersection Observer) ---
    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    // --- 3. Handle Like (Optimistic UI) ---
    const handleLike = async (postId) => {
        if (!user) {
            toast.error("Please log in to like posts!", {
                icon: '🔒',
                position: 'bottom-center'
            });
            return;
        }

        try {
            setPosts((prevPosts) => prevPosts.map(post => {
                if (post._id === postId) {
                    const hasLiked = post.likes.includes(user._id);
                    return {
                        ...post,
                        likes: hasLiked
                            ? post.likes.filter(id => id !== user._id) 
                            : [...post.likes, user._id]                
                    };
                }
                return post;
            }));

            await axios.post(`${backendUrl}/api/post/like/${postId}`, {}, { withCredentials: true });
        } catch (error) {
            toast.error("Failed to like post");
            console.log("Error in liking : ", error)
        }
    };

    // --- 4. Handle Comment ---
    const handleCommentSubmit = async (e, postId) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please log in to comment!", {
                icon: '🔒',
                position: 'bottom-center'
            });
            return;
        }
        if (!commentText.trim()) return;

        try {
            const res = await axios.post(`${backendUrl}/api/post/comment/${postId}`, { text: commentText }, { withCredentials: true });

            if (res.data?.success) {
                setPosts((prevPosts) => prevPosts.map(post => {
                    if (post._id === postId) {
                        return { ...post, comments: [...post.comments, res.data.comment] };
                    }
                    return post;
                }));

                setCommentText(""); 
                toast.success("Comment added!");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to post comment");
        }
    };

    // --- Render: Empty State ---
    if (posts.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="w-full py-16 flex flex-col items-center justify-center text-center border border-white/5 rounded-3xl bg-surface/30 backdrop-blur-sm">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-text">No posts yet</h3>
                    <p className="text-sm text-muted mt-2 max-w-xs">Follow some users or create a post to start filling up your feed.</p>
                </div>
            </div>
        );
    }

  // --- Render: Feed ---
    return (
        <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
            {/* 🚨 UPDATED CONTAINER: Grid layout with responsive columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                {posts.map((post, index) => {
                    const isLastPost = posts.length === index + 1;
                    const hasLiked = user ? post.likes.includes(user._id) : false;

                    return (
                        <div
                            key={post._id}
                            ref={isLastPost ? lastPostElementRef : null}
                            // Removed max-w classes here so the card naturally fills the grid column
                            className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col w-full h-full"
                        >
                            {/* 1. Header: User Info */}
                            <div className="p-4 flex items-center justify-between shrink-0">
                                <Link to={`/profile/${post.user?.username}`} className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/5 shadow-sm">
                                        {post.user?.profileImg ? (
                                            <img src={post.user.profileImg} alt={post.user?.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-bg font-bold bg-linear-to-tr from-primary to-secondary">
                                                {post.user?.fullname?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-text group-hover:underline transition-all">{post.user?.fullname || 'Unknown User'}</span>
                                        <span className="text-xs text-muted">@{post.user?.username || 'unknown'}</span>
                                    </div>
                                </Link>
                            </div>

                            {/* 2. Body: Image (Adjusted object-fit for grid) */}
                            {post.imgUrl && (
                                <div className="w-full bg-black/90 relative flex items-center justify-center overflow-hidden border-y border-white/5 grow aspect-square">
                                    <img 
                                        src={post.imgUrl} 
                                        alt="Post" 
                                        className="w-full h-full object-cover" 
                                        loading="lazy" 
                                    />
                                </div>
                            )}

                            {/* 3. Footer: Action Bar */}
                            <div className="px-4 py-3 flex items-center gap-6 shrink-0">
                                {/* Like Button */}
                                <button
                                    onClick={() => handleLike(post._id)}
                                    className="flex items-center gap-2 group transition-all cursor-pointer active:scale-90"
                                >
                                    <svg className={`w-7 h-7 transition-colors ${hasLiked ? 'text-red-500 fill-red-500' : 'text-text group-hover:text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                    <span className={`text-sm font-bold ${hasLiked ? 'text-red-500' : 'text-text group-hover:text-red-500'}`}>
                                        {post.likes?.length || 0}
                                    </span>
                                </button>

                                {/* Comment Toggle Button */}
                                <button
                                    onClick={() => setActiveCommentBox(activeCommentBox === post._id ? null : post._id)}
                                    className="flex items-center gap-2 group transition-all"
                                >
                                    <svg className="w-7 h-7 text-text group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                    <span className="text-sm font-bold text-text group-hover:text-primary">
                                        {post.comments?.length || 0}
                                    </span>
                                </button>
                            </div>

                            {/* 4. Caption Area */}
                            {post.caption && (
                                <div className="px-4 pb-3 shrink-0">
                                    <span className="font-bold text-sm text-text mr-2">{post.user?.username || 'user'}</span>
                                    <span className="text-sm text-text whitespace-pre-wrap">{post.caption}</span>
                                </div>
                            )}

                            {/* 5. Comment Section (Expands if active) */}
                            {activeCommentBox === post._id && (
                                <div className="px-4 pb-4 bg-white/5 border-t border-white/10 pt-4 shrink-0 mt-auto">

                                    {/* Recent Comments */}
                                    <div className="space-y-4 mb-4 max-h-40 overflow-y-auto">
                                        {post.comments.length === 0 ? (
                                            <p className="text-xs text-muted text-center py-2">No comments yet. Be the first!</p>
                                        ) : (
                                            post.comments.slice(-5).map(comment => (
                                                <div key={comment._id} className="flex gap-3 items-start">
                                                    <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10 shrink-0 shadow-sm border border-white/5">
                                                        {comment.user?.profileImg ? (
                                                            <img src={comment.user.profileImg} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold bg-primary text-bg">
                                                                {comment.user?.fullname?.charAt(0) || 'U'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col bg-surface/50 rounded-2xl rounded-tl-none px-3 py-2 border border-white/5 shadow-sm">
                                                        <span className="text-xs font-bold text-text">{comment.user?.username || 'unknown'}</span>
                                                        <span className="text-sm text-text mt-0.5">{comment.text}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Add Comment Form */}
                                    <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10 shrink-0">
                                            {user?.profileImg ? (
                                                <img src={user.profileImg} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold bg-primary text-bg">
                                                    {user?.fullname?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={user ? "Add a comment..." : "Log in..."}
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            disabled={!user}
                                            className="flex-1 bg-transparent border-b border-white/20 px-2 py-1 text-sm text-text focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!user || !commentText.trim()}
                                            className="text-primary text-sm font-bold hover:opacity-80 disabled:opacity-30 transition-opacity"
                                        >
                                            Post
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Loading Indicator for Next Page */}
            {isLoading && posts.length > 0 && (
                <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-primary rounded-full animate-spin"></div>
                </div>
            )}

            {/* End of Feed */}
            {!hasMore && posts.length > 0 && (
                <div className="text-center py-8 text-muted text-sm font-bold flex items-center justify-center gap-2">
                    <div className="h-px bg-white/10 flex-1 max-w-12.5"></div>
                    You're all caught up
                    <div className="h-px bg-white/10 flex-1 max-w-12.5"></div>
                </div>
            )}
        </div>
    );
}