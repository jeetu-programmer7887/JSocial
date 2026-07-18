import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { setCredentials } from '../redux/authSlice';
import SuggestedUsers from '../components/SuggestedUser';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_backendUrl || '';

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- POSTS STATE ---
  const [posts, setPosts] = useState([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);

  // Previews
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // Refs
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullname: user?.fullname || '',
    username: user?.username || '',
    email: user?.email || '',
    currentPass: '',
    newPass: '',
    profileImg: '',
    coverImg: '',
  });

  // --- FETCH USER POSTS ---
  useEffect(() => {
    if (!user?.username) return;

    const fetchMyPosts = async () => {
      setIsPostsLoading(true);
      try {
        // Re-using the profile endpoint you already have to get the user's populated posts
        const res = await axios.get(`${backendUrl}/api/user/profile/${user.username}`, {
          withCredentials: true
        });
        
        if (res.data?.success) {
          setPosts(res.data.profile?.posts || []);
        }
      } catch (error) {
        console.error("Failed to fetch posts", error);
      } finally {
        setIsPostsLoading(false);
      }
    };

    fetchMyPosts();
  }, [user?.username, backendUrl]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setFormData({ ...formData, [type]: reader.result });
        if (type === 'profileImg') setProfilePreview(reader.result);
        if (type === 'coverImg') setCoverPreview(reader.result);
      };
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading('Updating profile...');

    try {
      const res = await axios.put(`${backendUrl}/api/auth/update`, formData, {
        withCredentials: true,
      });

      dispatch(setCredentials(res.data));
      toast.success('Profile updated successfully!', { id: toastId });

      setIsEditing(false);
      setFormData(prev => ({ ...prev, currentPass: '', newPass: '', profileImg: '', coverImg: '' }));
      setProfilePreview(null);
      setCoverPreview(null);

    } catch (error) {
      const errorMessage = error.response?.data || 'Failed to update profile.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // --- DELETE POST HANDLER ---
  const handleDeletePost = async (postId) => {
    // Add a quick confirmation so users don't accidentally delete memories
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;
    
    const toastId = toast.loading("Deleting post...");
    try {
      // 🚨 Ensure this matches your backend delete route! (e.g., /api/post/:id or /api/post/delete/:id)
      await axios.delete(`${backendUrl}/api/post/delete/${postId}`, { 
        withCredentials: true 
      });
      
      // Optimistically update the UI by filtering out the deleted post
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      toast.success("Post deleted successfully", { id: toastId });

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete post", { id: toastId });
    }
  };


  if (!user) return <div className="flex-1 flex items-center justify-center text-muted">Loading...</div>;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 selection:bg-primary selection:text-bg">
      <Toaster position="top-center" reverseOrder={false} />

      {/* --- PROFILE HEADER CARD --- */}
      <div className="w-full bg-surface/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative">

        <div
          className={`h-32 sm:h-48 w-full bg-bg/50 relative overflow-hidden ${isEditing ? 'cursor-pointer group' : ''}`}
          onClick={() => isEditing && coverInputRef.current?.click()}
        >
          {isEditing && (
            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all z-20">
              <span className="text-text text-sm font-bold bg-surface/80 px-4 py-2 rounded-full backdrop-blur-md">Change Cover</span>
            </div>
          )}
          <input type="file" hidden ref={coverInputRef} onChange={(e) => handleImageChange(e, 'coverImg')} accept="image/*" />
          {coverPreview || user.coverImg ? (
            <img src={coverPreview || user.coverImg} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-secondary/20 backdrop-blur-[100px]"></div>
          )}
        </div>

        <div className="px-6 sm:px-10 pb-8 relative">

          <div className="flex justify-between items-end -mt-12 sm:-mt-16 mb-4">
            <div
              className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-surface bg-surface overflow-hidden relative z-10 shadow-xl ${isEditing ? 'cursor-pointer group' : ''}`}
              onClick={() => isEditing && profileInputRef.current?.click()}
            >
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all z-20">
                  <span className="text-text text-xs font-bold text-center leading-tight">Change<br />Image</span>
                </div>
              )}
              <input type="file" hidden ref={profileInputRef} onChange={(e) => handleImageChange(e, 'profileImg')} accept="image/*" />
              {profilePreview || user.profileImg ? (
                <img src={profilePreview || user.profileImg} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-bg font-bold text-3xl sm:text-5xl">
                  {user.fullname?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (isEditing) {
                  setFormData({
                    fullname: user?.fullname || '',
                    username: user?.username || '',
                    email: user?.email || '',
                    currentPass: '',
                    newPass: '',
                    profileImg: '',
                    coverImg: ''
                  });
                  setProfilePreview(null);
                  setCoverPreview(null);
                }
                setIsEditing(!isEditing);
              }}
              className="mb-2 sm:mb-4 px-5 py-2 rounded-full text-xs sm:text-sm font-bold border border-white/10 hover:bg-white/5 transition-colors text-text z-20"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">{user.fullname}</h1>
                <p className="text-muted text-sm sm:text-base">@{user.username}</p>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <Link
                  to={`/profile/${user.username}/following`}
                  className="flex gap-1.5 items-baseline hover:underline cursor-pointer decoration-white/30 transition-all"
                >
                  <span className="text-text font-bold text-lg">{user.following?.length || 0}</span>
                  <span className="text-muted text-sm">Following</span>
                </Link>

                <Link
                  to={`/profile/${user.username}/followers`}
                  className="flex gap-1.5 items-baseline hover:underline cursor-pointer decoration-white/30 transition-all"
                >
                  <span className="text-text font-bold text-lg">{user.followers?.length || 0}</span>
                  <span className="text-muted text-sm">Followers</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-5 pt-4 max-w-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Full Name</label>
                  <input type="text" name="fullname" value={formData.fullname} onChange={handleChange} className="w-full bg-bg/50 text-text border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Username</label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full bg-bg/50 text-text border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-bg/50 text-text border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>

              <div className="pt-4 border-t border-white/5">
                <h3 className="text-sm font-bold text-text mb-4">Change Password (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <input type="password" name="currentPass" placeholder="Current Password" value={formData.currentPass} onChange={handleChange} className="w-full bg-bg/50 text-text border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-muted/40" />
                  </div>
                  <div>
                    <input type="password" name="newPass" placeholder="New Password" value={formData.newPass} onChange={handleChange} className="w-full bg-bg/50 text-text border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-muted/40" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 bg-linear-to-r from-primary to-secondary text-bg font-bold text-sm py-3.5 rounded-xl transition-all duration-300 hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

        </div>
      </div>

      {/* --- MY POSTS GRID --- */}
      <div className="mt-12 w-full">
        <h3 className="text-xl font-bold text-text mb-6">My Posts</h3>
        
        {isPostsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-square bg-surface border border-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-surface/30 border border-white/5 rounded-3xl">
            <p className="text-muted font-bold text-sm">You haven't posted anything yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
            {posts.map((post) => (
              <div key={post._id} className="relative aspect-square group bg-surface border border-white/5 rounded-2xl overflow-hidden">
                
                {/* Image or Text Fallback */}
                {post.imgUrl ? (
                  <img src={post.imgUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Post" />
                ) : (
                  <div className="w-full h-full p-4 flex items-center justify-center text-center text-sm text-text bg-surface/50">
                    {post.caption?.substring(0, 80)}{post.caption?.length > 80 ? '...' : ''}
                  </div>
                )}

                {/* 📱 MOBILE ONLY: Top-Right Delete Button */}
                <button
                  onClick={() => handleDeletePost(post._id)}
                  className="lg:hidden absolute top-2 right-2 bg-black/50 hover:bg-red-500/80 text-white p-2 rounded-full backdrop-blur-md active:scale-90 z-20 border border-white/10 transition-colors"
                >
                  <svg className="w-4 h-4 text-red-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>

                {/* 📱 MOBILE ONLY: Bottom Stats Gradient */}
                <div className="lg:hidden absolute bottom-0 inset-x-0 bg-linear-to-t from-black/80 to-transparent p-2 pt-8 flex gap-3 text-white text-xs font-bold z-10 pointer-events-none">
                  <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg> 
                      {post.likes?.length || 0}
                  </span>
                  <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"></path></svg> 
                      {post.comments?.length || 0}
                  </span>
                </div>

                {/* 💻 DESKTOP ONLY: Full Hover Overlay */}
                <div className="hidden lg:flex absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-col items-center justify-center backdrop-blur-[2px] z-10">
                  
                  {/* Stats */}
                  <div className="flex gap-4 text-white font-bold mb-4">
                    <span className="flex items-center gap-1"><svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg> {post.likes?.length || 0}</span>
                    <span className="flex items-center gap-1"><svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"></path></svg> {post.comments?.length || 0}</span>
                  </div>

                  {/* Delete Action */}
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500 px-5 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-2 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Delete Post
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='mt-12'>
        <SuggestedUsers />
      </div>

    </div>
  );
}