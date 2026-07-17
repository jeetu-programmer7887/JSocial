import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    // Uses flex-1 and py-12 so it fits perfectly inside your Layout without stretching
    <div className="flex-1 w-full flex items-center justify-center py-12 px-4 selection:bg-primary selection:text-bg">
      
      <div className="text-center relative z-10 max-w-2xl mx-auto">
        
        {/* Ambient Background Glow (Behind the text) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-62.5 h-62.5 sm:w-100 sm:h-100 bg-primary/20 blur-[100px] sm:blur-[150px] rounded-full pointer-events-none -z-10"></div>
        
        {/* Massive 404 Text */}
        <h1 className="text-[120px] sm:text-[180px] lg:text-[220px] font-extrabold tracking-tighter leading-none bg-linear-to-tr from-primary to-secondary text-transparent bg-clip-text drop-shadow-2xl select-none">
          404
        </h1>
        
        {/* Messaging */}
        <h2 className="text-2xl sm:text-3xl font-bold text-text mt-2 sm:mt-4 tracking-tight">
          Lost in the void
        </h2>
        <p className="text-muted mt-4 max-w-md mx-auto text-sm sm:text-base leading-relaxed px-4">
          We searched everywhere, but the page you're looking for doesn't exist, has been deleted, or was moved to another dimension.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link 
            to="/" 
            className="w-full sm:w-auto bg-primary text-bg font-bold text-sm px-8 py-3.5 rounded-full hover:opacity-90 active:scale-95 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            Take me home
          </Link>
          <Link 
            to="/explore" 
            className="w-full sm:w-auto bg-surface/50 backdrop-blur-md border border-white/10 text-text font-bold text-sm px-8 py-3.5 rounded-full hover:bg-white/5 active:scale-95 transition-all duration-300"
          >
            Explore content
          </Link>
        </div>

      </div>
    </div>
  );
}