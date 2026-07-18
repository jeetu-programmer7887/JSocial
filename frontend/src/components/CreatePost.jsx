import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast'; 

export default function CreatePost() {
    const { user } = useSelector((state) => state.auth);
    const backendUrl = import.meta.env.VITE_backendUrl || '';

    const [caption, setCaption] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (imagePreview) URL.revokeObjectURL(imagePreview); 
            
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file)); 
        }
    };

    const handleRemoveImage = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview); 
        
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();

        if (!imageFile) {
            toast.error("Please select an image for your post!");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('Uploading post...');

        try {
            const formData = new FormData();
            formData.append('caption', caption);
            formData.append('image', imageFile); 

            const response = await axios.post(`${backendUrl}/api/post/create`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data?.success) {
                toast.success('Post published successfully!', { id: toastId });
                
                // Clear the form
                setCaption('');
                handleRemoveImage();

                // TODO: Trigger a re-fetch of the feed here!
            } else {
                toast.error(response.data?.message || 'Failed to publish post', { id: toastId });
            }

        } catch (error) {
            // Check for specific backend error messages, fallback to default
            const errorMessage = error.response?.data?.message || 'Failed to create post. Please try again.';
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsLoading(false);
        }
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

                {/* Form Area */}
                <form onSubmit={handleCreatePost} className="flex-1">
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="What's happening?"
                        className="w-full bg-transparent text-text text-lg sm:text-base placeholder-muted resize-none focus:outline-none min-h-15 py-2"
                        rows="2"
                        required
                    />

                    {/* Image Preview Container */}
                    {imagePreview && (
                        <div className="relative mt-2 mb-4 rounded-2xl overflow-hidden border border-white/10 group">
                            <img src={imagePreview} alt="Preview" className="w-full max-h-80 object-cover" />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-md transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="text-primary cursor-pointer hover:bg-primary/10 p-2 rounded-full transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <span className="text-xs font-bold hidden sm:block">Add Photo</span>
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || (!caption.trim() && !imageFile)}
                            className="bg-primary text-bg font-bold text-sm px-6 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
                        >
                            {isLoading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}