import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { setCredentials } from '../redux/authSlice';
import SuggestedUsers from '../components/SuggestedUser';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';


export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_backendUrl || '';
  const navigate = useNavigate();


  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- POSTS STATE ---
  const [posts, setPosts] = useState([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);

  // NEW: State for viewing a post's comments in a modal
  const [selectedPost, setSelectedPost] = useState(null);

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

  // 2. Handle Logout function
  const handleLogout = async () => {
    try {
      // Optional: Call your backend logout route to clear the httpOnly cookie
      await axios.get(`${backendUrl}/api/auth/logout`, { withCredentials: true });

      // Clear the Redux store
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
      // Even if backend fails, force frontend logout for safety
      dispatch(logout());
      navigate('/login');
    }
  };


  // --- Handle Share ---
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

  // --- FETCH USER POSTS ---
  useEffect(() => {
    if (!user?.username) return;

    const fetchMyPosts = async () => {
      setIsPostsLoading(true);
      try {
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
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;

    const toastId = toast.loading("Deleting post...");
    try {
      await axios.delete(`${backendUrl}/api/post/delete/${postId}`, {
        withCredentials: true
      });

      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));

      // Close modal if the deleted post was open
      if (selectedPost?._id === postId) setSelectedPost(null);

      toast.success("Post deleted successfully", { id: toastId });

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete post", { id: toastId });
    }
  };


  if (!user) return <div className="flex-1 flex items-center justify-center text-muted">Loading...</div>;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 selection:bg-primary selection:text-bg">

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

            {/* 👇 Wrapped both buttons in a flex container for perfect alignment 👇 */}
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 z-20">
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
                className="cursor-pointer px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold border border-white/10 hover:bg-white/5 transition-colors text-text"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>

              <button
                onClick={handleLogout}
                className="cursor-pointer px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {!isEditing ? (
            <div className="space-y-4">

              {/* Profile Name & Share Button Row */}
              <div className="flex items-center gap-4 sm:gap-6">

                {/* Name and Username grouped together */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">{user.fullname}</h1>
                  <p className="text-muted text-sm sm:text-base">@{user.username}</p>
                </div>

                {/* Share Button placed to the right */}
                <button
                  onClick={() => handleShare(user.username)}
                  className="cursor-pointer px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold border border-white/10 text-white hover:bg-white/5 transition-colors shrink-0 mt-1 sm:mt-0"
                >
                  <span className='lg:hidden'>Share Profile</span>
                  <span className='hidden lg:inline'>Share</span>
                </button>

              </div>

              {/* Followers / Following Stats */}
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
                className="w-full cursor-pointer mt-6 bg-linear-to-r from-primary to-secondary text-bg font-bold text-sm py-3.5 rounded-xl transition-all duration-300 hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50"
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
              <div
                key={post._id}
                onClick={() => setSelectedPost(post)}
                className="relative aspect-square group bg-surface border border-white/5 rounded-2xl overflow-hidden cursor-pointer"
              >

                {/* Image or Text Fallback */}
                {post.imgUrl ? (
                  <img src={post.imgUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Post" />
                ) : (
                  <div className="w-full h-full p-4 flex items-center justify-center text-center text-sm text-text bg-surface/50">
                    {post.caption?.substring(0, 80)}{post.caption?.length > 80 ? '...' : ''}
                  </div>
                )}

                {/* MOBILE ONLY: Top-Right Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the modal from opening when deleting
                    handleDeletePost(post._id);
                  }}
                  className="lg:hidden cursor-pointer absolute top-2 right-2 bg-black/50 hover:bg-red-500/80 text-white p-2 rounded-full backdrop-blur-md active:scale-90 z-20 border border-white/10 transition-colors"
                >
                  <svg className="w-4 h-4 text-red-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>

                {/* MOBILE ONLY: Bottom Stats Gradient */}
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

                {/* DESKTOP ONLY: Full Hover Overlay */}
                <div className="hidden lg:flex absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-col items-center justify-center backdrop-blur-[2px] z-10">

                  {/* Stats */}
                  <div className="flex gap-4 text-white font-bold mb-4">
                    <span className="flex items-center gap-1"><svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg> {post.likes?.length || 0}</span>
                    <span className="flex items-center gap-1"><svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"></path></svg> {post.comments?.length || 0}</span>
                  </div>

                  {/* Delete Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents the modal from opening when deleting
                      handleDeletePost(post._id);
                    }}
                    className="bg-red-500/20 cursor-pointer text-red-500 hover:bg-red-500 hover:text-white border border-red-500 px-5 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-2 active:scale-95 z-20"
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

      {/* --- POST MODAL (COMMENT VIEWER) --- */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-surface border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black p-2 rounded-full text-white transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            {/* Left Column: Image or Caption Fallback */}
            <div className="w-full md:w-1/2 bg-black flex items-center justify-center min-h-[30vh] md:min-h-[60vh]">
              {selectedPost.imgUrl ? (
                <img src={selectedPost.imgUrl} className="max-w-full max-h-[50vh] md:max-h-[90vh] object-contain" alt="Post" />
              ) : (
                <div className="p-8 text-center text-text">{selectedPost.caption}</div>
              )}
            </div>

            {/* Right Column: Details & Comments */}
            <div className="w-full md:w-1/2 flex flex-col h-[50vh] md:h-auto md:max-h-[90vh] bg-surface/95 border-l border-white/5">

              {/* Header: User Info & Caption */}
              <div className="p-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden shrink-0 border border-white/5 flex justify-center items-center font-bold text-text">
                    {user?.profileImg ? (
                      <img src={user.profileImg} className="w-full h-full object-cover" />
                    ) : (
                      user?.fullname?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-text">{user?.fullname}</span>
                    <span className="text-xs text-muted">@{user?.username}</span>
                  </div>
                </div>
                {selectedPost.caption && (
                  <p className="text-sm text-text whitespace-pre-wrap">{selectedPost.caption}</p>
                )}
              </div>

              {/* Comments Scrollable Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedPost.comments && selectedPost.comments.length > 0 ? (
                  selectedPost.comments.map((comment, index) => (
                    <div key={comment._id || index} className="flex gap-3 items-start">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/5 flex items-center justify-center text-text font-bold text-xs">
                        {comment.user?.profileImg ? (
                          <img src={comment.user.profileImg} className="w-full h-full object-cover" />
                        ) : (
                          comment.user?.username?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>

                      {/* Comment Bubble */}
                      <div className="flex flex-col bg-white/5 p-3 rounded-2xl rounded-tl-none w-full border border-white/5">
                        <span className="text-xs font-bold text-text mb-1">
                          {comment.user?.username || 'User'}
                        </span>
                        <span className="text-sm text-text/90 wrap-break-word">
                          {comment.text}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-muted text-sm font-bold flex-col gap-2">
                    <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    No comments yet.
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}