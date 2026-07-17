import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-[90%] lg:w-[85%] max-w-6xl">
            {/* Width Fix: Changed max-w-3xl to max-w-6xl for wider screens.
        Mobile Fix: Adjusted top spacing (top-4 to sm:top-6) 
      */}
            <nav className="bg-surface/70 backdrop-blur-xl border border-white/10 rounded-full px-3 py-2 sm:px-6 sm:py-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300">
                <div className="flex items-center justify-between">

                    {/* Brand / Logo */}
                    <Link
                        to="/"
                        className="flex items-center group transition-transform hover:scale-105"
                    >
                        {/* Updated to bg-linear-to-tr to clear the ESLint warning */}
                        <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full overflow-hidden shadow-lg shadow-primary/20 mr-2 sm:mr-3 group-hover:shadow-primary/40 transition-shadow bg-surface">
                            <img
                                src="/jsocial.png"
                                alt="JSocial Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-text font-bold tracking-tight hidden md:block text-lg">JSocial</span>
                    </Link>

                    {/* Center Links */}
                    <div className="flex items-center space-x-0.5 sm:space-x-1 bg-bg/40 border border-white/5 rounded-full px-1 py-1">
                        <Link
                            to="/"
                            className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${isActive('/')
                                    ? 'bg-surface text-primary shadow-sm'
                                    : 'text-muted hover:text-text hover:bg-white/5'
                                }`}
                        >
                            Feed
                        </Link>
                        <Link
                            to="/explore"
                            className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${isActive('/explore')
                                    ? 'bg-surface text-primary shadow-sm'
                                    : 'text-muted hover:text-text hover:bg-white/5'
                                }`}
                        >
                            Explore
                        </Link>
                        <Link
                            to="/notifications"
                            className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${isActive('/notifications')
                                    ? 'bg-surface text-primary shadow-sm'
                                    : 'text-muted hover:text-text hover:bg-white/5'
                                }`}
                        >
                            Alerts
                        </Link>
                    </div>

                    {/* Auth Actions */}
                    <div className="flex items-center space-x-2 sm:space-x-4 pl-1 sm:pl-2">
                        <Link
                            to="/login"
                            className="hidden sm:block text-xs sm:text-sm font-medium text-text px-2 sm:px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
                        >
                            Log in
                        </Link>
                        <Link
                            to="/register"
                            className="text-xs sm:text-sm font-bold bg-primary text-bg px-4 sm:px-6 py-1.5 sm:py-2 rounded-full hover:bg-opacity-90 transition-all shadow-md shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                        >
                            Sign up
                        </Link>
                    </div>

                </div>
            </nav>
        </div>
    );
}