import CreatePost from '../components/CreatePost';
import PostFeed from '../components/PostFeed';

export default function Home() {
    return (
        // flex & justify-center keeps the feed perfectly in the middle of the screen
        <div className="w-full flex justify-center px-4 sm:px-6 py-8 selection:bg-primary selection:text-bg min-h-screen">
            
            {/* Main Feed Container - max-w-2xl prevents it from stretching too wide on desktops */}
            <div className="w-full max-w-2xl space-y-6">
                
                {/* 1. Create Post Widget */}
                <CreatePost />

                {/* 2. Feed Timeline (This will map all posts from the user and the people they follow) */}
                <PostFeed />

                {/* 3. Minimal Footer at the bottom of the feed */}
                <div className="pt-8 pb-4 text-center text-xs text-muted flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-white/5">
                    <a href="#terms" className="hover:underline">Terms</a>
                    <a href="#privacy" className="hover:underline">Privacy</a>
                    <a href="#cookies" className="hover:underline">Cookies</a>
                    <span>&copy; {new Date().getFullYear()} JSocial.</span>
                </div>

            </div>
        </div>
    );
}