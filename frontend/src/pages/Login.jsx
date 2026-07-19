import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// 1. Import the hooks for Redux and React Router
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// 2. Import the action we created in the authSlice
import { setCredentials } from '../redux/authSlice';

export default function Login() {
    const backendUrl = import.meta.env.VITE_backendUrl;
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    // 3. Initialize the dispatch and navigate functions
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

        const toastId = toast.loading('Logging in...');

        try {
            const response = await axios.post(`${backendUrl}/api/auth/login`, formData, {
                withCredentials: true,
            });

            const loggedInUser = response.data;

            dispatch(setCredentials(loggedInUser));

            toast.success(`Welcome back, ${loggedInUser.fullname || loggedInUser.username}!`, { id: toastId });

            navigate('/');

        } catch (error) {
            const errorMessage = error.response?.data || 'Login failed. Please try again.';
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 w-full flex items-center justify-center py-12 bg-bg text-text px-4 selection:bg-primary selection:text-bg">

            {/* Translucent Glassmorphism Card */}
            <div className="w-full max-w-md bg-surface/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300">

                {/* Header / Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center rounded-xl bg-linear-to-tr from-primary to-secondary px-6 py-2 mb-4 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                        <h1 className="text-bg font-extrabold text-2xl tracking-tighter">JSocial</h1>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-text">Welcome back</h2>
                    <p className="text-sm text-muted mt-2">
                        Enter your credentials to access your account
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

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

                    {/* Password Input */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                                Password
                            </label>
                        </div>
                        <input
                            type="password"
                            name="password"
                            required
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
                        className="w-full mt-4 bg-linear-to-r from-primary to-secondary text-bg font-bold text-sm py-3.5 rounded-xl transition-all duration-300 hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                {/* Footer Link */}
                <p className="text-center text-xs text-muted mt-6">
                    Don't have an account yet?{' '}
                    <a href="/register" className="text-primary font-semibold hover:underline transition-all">
                        Sign Up
                    </a>
                </p>
            </div>
        </div>
    );
}