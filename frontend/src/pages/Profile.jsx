import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { setCredentials } from '../redux/authSlice';
import SuggestedUsers from '../components/SuggestedUser';

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_backendUrl || '';

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 Dynamic image handler for both profile and cover
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

  if (!user) return <div className="flex-1 flex items-center justify-center text-muted">Loading...</div>;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 selection:bg-primary selection:text-bg">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full bg-surface/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative">

        {/* 🚀 Cover Photo Area - Now Clickable */}
        <div
          className={`h-32 sm:h-48 w-full bg-bg/50 relative overflow-hidden ${isEditing ? 'cursor-pointer group' : ''}`}
          onClick={() => isEditing && coverInputRef.current?.click()}
        >
          {/* Cover Edit Overlay */}
          {isEditing && (
            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all z-20">
              <span className="text-text text-sm font-bold bg-surface/80 px-4 py-2 rounded-full backdrop-blur-md">Change Cover</span>
            </div>
          )}

          <input type="file" hidden ref={coverInputRef} onChange={(e) => handleImageChange(e, 'coverImg')} accept="image/*" />

          {/* Render Cover or Fallback */}
          {coverPreview || user.coverImg ? (
            <img src={coverPreview || user.coverImg} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-secondary/20 backdrop-blur-[100px]"></div>
          )}
        </div>

        <div className="px-6 sm:px-10 pb-8 relative">

          <div className="flex justify-between items-end -mt-12 sm:-mt-16 mb-4">

            {/* Avatar Profile Photo */}
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
                  // If we are currently editing and clicking "Cancel", reset the form to the original Redux user data!
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
                // Toggle the edit mode
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
                <div className="flex gap-1.5 items-baseline hover:underline cursor-pointer decoration-white/30">
                  <span className="text-text font-bold text-lg">{user.following?.length || 0}</span>
                  <span className="text-muted text-sm">Following</span>
                </div>
                <div className="flex gap-1.5 items-baseline hover:underline cursor-pointer decoration-white/30">
                  <span className="text-text font-bold text-lg">{user.followers?.length || 0}</span>
                  <span className="text-muted text-sm">Followers</span>
                </div>
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
      <div className='mt-8'>
        <SuggestedUsers />
      </div>

    </div>
  );
}