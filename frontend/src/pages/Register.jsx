import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// 1. Import Redux and Router hooks
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../redux/authSlice';

export default function Register() {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_backendUrl || '';

  // 2. Initialize dispatch and navigate
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const toastId = toast.loading('Creating your account...');

    try {

      await axios.post(`${backendUrl}/api/auth/register`, formData, {
        withCredentials: true,
      });

      const loginResponse = await axios.post(`${backendUrl}/api/auth/login`, {
        username: formData.username,
        password: formData.password
      }, {
        withCredentials: true,
      });

      const loggedInUser = loginResponse.data;

      dispatch(setCredentials(loggedInUser));

      toast.success('Welcome to JSocial!', { id: toastId });

      navigate('/');

    } catch (error) {
      const errorMessage = error.response?.data || 'Registration failed. Please try again.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center bg-bg text-text px-4 py-12 selection:bg-primary selection:text-bg">

      <div className="w-full max-w-md bg-surface/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300">
        
        {/* Header / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center rounded-xl bg-linear-to-tr from-primary to-secondary px-6 py-2 mb-4 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <h1 className="text-bg font-extrabold text-2xl tracking-tighter">JSocial</h1>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text">Create your account</h2>
          <p className="text-sm text-muted mt-2">
            Join the community and start connecting
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullname"
              required
              value={formData.fullname}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full bg-bg/50 text-text border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-muted/40"
            />
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe123"
              className="w-full bg-bg/50 text-text border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-muted/40"
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-bg/50 text-text border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-muted/40"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-bg/50 text-text border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-muted/40"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer mt-4 bg-linear-to-r from-primary to-secondary text-bg font-bold text-sm py-3.5 rounded-xl transition-all duration-300 hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Sign Up'}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-muted mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-primary font-semibold hover:underline transition-all">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}