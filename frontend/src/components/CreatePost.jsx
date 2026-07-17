import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function CreatePost() {
    const { user } = useSelector((state) => state.auth);
    const [postText, setPostText] = useState('');

    const handleCreatePost = (e) => {
        e.preventDefault();
        // TODO: Hit your backend to create the post
        console.log("Posting:", postText);
        setPostText('');
    };

    return (
        <div className="bg-surface/60 backdrop-blur-xl border border-white/5 rounded-3xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all">
            <div className="flex gap-4">
                {/* User Avatar */}
                <Link to={`/profile/${user?.username}`} className="shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-bg font-bold shadow-md">
                        {user?.profileImg ? (
                            <img src={user.profileImg} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            user?.fullname?.charAt(0).toUpperCase() || 'U'
                        )}
                    </div>
                </Link>

                {/* Input Area */}
                <form onSubmit={handleCreatePost} className="flex-1">
                    <textarea
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        placeholder="What's happening?"
                        className="w-full bg-transparent text-text text-lg sm:text-xl placeholder-muted resize-none focus:outline-none min-h-15 py-2"
                        rows="2"
                    />
                    
                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
                        <div className="flex items-center gap-2">
                            {/* Image Upload Icon */}
                            <button type="button" className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </button>
                        </div>
                        
                        {/* Submit Button */}
                        <button 
                            type="submit"
                            disabled={!postText.trim()}
                            className="bg-primary text-bg font-bold text-sm px-6 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                        >
                            Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}