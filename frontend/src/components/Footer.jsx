import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-surface/30 backdrop-blur-md border-t border-white/5 py-12 lg:py-16 selection:bg-primary selection:text-bg mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Section: Brand & Core Links */}
        <div className="flex flex-col md:flex-row justify-between gap-8 pb-12 border-b border-white/5">

          {/* Brand Column */}
          <div className="space-y-4 max-w-sm">
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
            <p className="text-sm text-muted leading-relaxed">
              A modern, aesthetic social hub built for creators and developers to connect, share ideas, and showcase their journeys.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-3 md:min-w-37.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted hover:text-text transition-colors">Feed</Link>
              </li>
              <li>
                <Link to="/explore" className="text-sm text-muted hover:text-text transition-colors">Explore</Link>
              </li>
              <li>
                <Link to="/notifications" className="text-sm text-muted hover:text-text transition-colors">Alerts</Link>
              </li>
              <li>
                <Link to="/messages" className="text-sm text-muted hover:text-text transition-colors">Messages</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section: Developer Credit & Social Elements */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8">
          <p className="text-xs text-muted text-center sm:text-left">
            &copy; {new Date().getFullYear()} JSocial. Developed & maintained by <span className="font-bold text-text">Jeetu Prasad</span>.
          </p>

          {/* Developer Links */}
          <div className="flex items-center space-x-3">

            {/* GitHub Link */}
            <a
              href="https://github.com/jeetu-programmer7887"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-bg/50 border border-white/5 flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300"
              aria-label="GitHub Profile"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>

            {/* Portfolio / Website Link */}
            <a
              href="https://www.jeetuprasad.in"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-bg/50 border border-white/5 flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300"
              aria-label="Developer Website"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </a>

          </div>
        </div>
      </div>
    </footer>
  );
}