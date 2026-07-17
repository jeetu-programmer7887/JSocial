import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle newsletter subscription logic safely here
    console.log('Subscribed:', email);
    setEmail('');
  };

  return (
    <footer className="w-full bg-surface/30 backdrop-blur-md border-t border-white/5 py-12 lg:py-16 selection:bg-primary selection:text-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Grid for Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-white/5">
          
          {/* Brand Column (Spans 2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center group w-fit">
              <div className="w-9 h-9 flex items-center justify-center rounded-full overflow-hidden shadow-lg shadow-primary/10 mr-3 group-hover:shadow-primary/30 transition-shadow bg-surface">
                <img 
                  src="/jsocial.png" 
                  alt="JSocial Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-text font-bold tracking-tight text-xl">JSocial</span>
            </Link>
            <p className="text-sm text-muted max-w-sm leading-relaxed">
              A modern, aesthetic social hub built for creators and developers to connect, share ideas, and showcase their journeys.
            </p>
          </div>

          {/* Column 1: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted hover:text-text transition-colors">Feed</Link>
              </li>
              <li>
                <Link to="/explore" className="text-sm text-muted hover:text-text transition-colors">Trends</Link>
              </li>
              <li>
                <Link to="/communities" className="text-sm text-muted hover:text-text transition-colors">Communities</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Legal / Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-secondary">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-sm text-muted hover:text-text transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted hover:text-text transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/security" className="text-sm text-muted hover:text-text transition-colors">Security Blueprint</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Newsletter Action */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text">Stay Updated</h4>
            <p className="text-xs text-muted leading-relaxed">
              Subscribe to get the latest platform updates and community releases.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full max-w-xs pt-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-bg/60 text-text border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors placeholder-muted/30"
              />
              <button
                type="submit"
                className="bg-primary text-bg font-bold text-xs px-3 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/10 whitespace-nowrap"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Section: Copyright & Social Elements */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8">
          <p className="text-xs text-muted text-center sm:text-left">
            &copy; {new Date().getFullYear()} JSocial. All rights reserved. Designed for optimal scaling.
          </p>
          
          {/* Decorative Social Icon Shortcuts */}
          <div className="flex items-center space-x-3">
            <a 
              href="https://github.com/jeetu-programmer7887" 
              className="w-8 h-8 rounded-full bg-bg/50 border border-white/5 flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300"
              aria-label="GitHub"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a 
              href="https://x.com/jeetu_prasad78" 
              className="w-8 h-8 rounded-full bg-bg/50 border border-white/5 flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300"
              aria-label="Twitter"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}