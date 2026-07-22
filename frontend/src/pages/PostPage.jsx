import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function PostPage() {
    const { id } = useParams();
    const backendUrl = import.meta.env.VITE_backendUrl || '';

    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        let isCancelled = false;

        const fetchPost = async () => {
            setIsLoading(true);
            setLoadError(null);

            try {
                const res = await axios.get(`${backendUrl}/api/post/${id}`);
                if (isCancelled) return;

                if (res.data.success) {
                    setPost(res.data.post);
                }
            } catch (error) {
                if (isCancelled) return;
                if (error.response?.status === 404) {
                    setLoadError("This post doesn't exist or may have been deleted.");
                } else {
                    setLoadError("Couldn't load this post. Check your connection and try again.");
                }
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        fetchPost();

        return () => {
            isCancelled = true;
        };
    }, [id, backendUrl]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 lg:p-8 mt-16 sm:mt-20">
                <div className="bg-surface/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl animate-pulse">
                    <div className="flex items-center gap-3 p-4">
                        <div className="w-10 h-10 rounded-full bg-white/10" />
                        <div className="h-3 w-32 bg-white/10 rounded" />
                    </div>
                    <div className="w-full aspect-square bg-white/5" />
                    <div className="p-4 space-y-2">
                        <div className="h-3 w-3/4 bg-white/10 rounded" />
                        <div className="h-3 w-1/2 bg-white/5 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 lg:p-8 mt-16 sm:mt-20">
                <div className="bg-surface/60 backdrop-blur-xl border border-white/5 rounded-3xl p-10 text-center flex flex-col items-center gap-4 shadow-2xl">
                    <svg className="w-12 h-12 text-red-400 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <p className="font-bold text-text">{loadError}</p>
                    <Link to="/" className="text-sm text-primary hover:underline font-semibold">
                        Back to feed
                    </Link>
                </div>
            </div>
        );
    }

    if (!post) return null;

    return (
        <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 lg:p-8 mt-16 sm:mt-20">
            <div className="bg-surface/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">

                {/* Author header */}
                <div className="flex items-center gap-3 p-4 border-b border-white/5">
                    <Link to={`/profile/${post.user.username}`} className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-white/10 border border-white/5">
                        {post.user.profileImg ? (
                            <img src={post.user.profileImg} className="w-full h-full object-cover" alt={post.user.username} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-bg font-bold bg-secondary text-sm">
                                {post.user.fullname?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </Link>
                    <div className="flex flex-col leading-tight">
                        <Link to={`/profile/${post.user.username}`} className="font-bold text-text hover:underline text-sm">
                            {post.user.username}
                        </Link>
                        <span className="text-xs text-muted">{formatDate(post.createdAt)}</span>
                    </div>
                </div>

                {/* Image */}
                <div className="w-full bg-black/20">
                    <img src={post.imgUrl} alt="Post" className="w-full h-auto max-h-150 object-contain mx-auto" />
                </div>

                {/* Likes + caption */}
                <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-4 text-muted text-sm">
                        <div className="flex items-center gap-1.5">
                            <svg className="w-5 h-5 text-red-500 fill-red-500" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span className="font-semibold text-text">{post.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="font-semibold text-text">{post.comments?.length || 0}</span>
                        </div>
                    </div>

                    <p className="text-[15px] text-text leading-relaxed whitespace-pre-wrap">
                        <Link to={`/profile/${post.user.username}`} className="font-bold hover:underline mr-1.5">
                            {post.user.username}
                        </Link>
                        {post.caption}
                    </p>
                </div>

                {/* Comments */}
                {post.comments?.length > 0 && (
                    <div className="border-t border-white/5 p-4 flex flex-col gap-3 max-h-80 overflow-y-auto custom-scrollbar">
                        {post.comments.map((comment) => (
                            <div key={comment._id} className="flex items-start gap-3">
                                <Link to={`/profile/${comment.user.username}`} className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/10 border border-white/5">
                                    {comment.user.profileImg ? (
                                        <img src={comment.user.profileImg} className="w-full h-full object-cover" alt={comment.user.username} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-bg font-bold bg-secondary text-xs">
                                            {comment.user.fullname?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </Link>
                                <p className="text-sm text-text leading-snug">
                                    <Link to={`/profile/${comment.user.username}`} className="font-bold hover:underline mr-1.5">
                                        {comment.user.username}
                                    </Link>
                                    {comment.text}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}