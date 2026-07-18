import CreatePost from '../components/CreatePost';
import PostFeed from '../components/PostFeed';

export default function Home() {
    return (
        // 🚨 Main container expanded to max-w-7xl to give the post grid room to breathe
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 selection:bg-primary selection:text-bg min-h-screen flex flex-col gap-10">
            
            {/* 1. Create Post Widget */}
            {/* 🚨 Constrained to max-w-2xl and centered so the input box doesn't stretch across the whole monitor */}
            <div className="w-full max-w-2xl mx-auto">
                <CreatePost />
            </div>

            {/* 2. Feed Timeline */}
            {/* 🚨 Unconstrained! Takes the full width of the 7xl parent so the 3-column grid looks perfect */}
            <div className="w-full">
                <PostFeed />
            </div>

        </div>
    );
}