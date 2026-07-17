export default function PostFeed() {
    // TODO: Later you will fetch posts here (or pass them as props) and map over them.
    // const [posts, setPosts] = useState([]);

    return (
        <div className="flex flex-col gap-6">
            
            {/* Empty State / Placeholder */}
            <div className="w-full py-16 flex flex-col items-center justify-center text-center border border-white/5 rounded-3xl bg-surface/30 backdrop-blur-sm">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-text">No posts yet</h3>
                <p className="text-sm text-muted mt-2 max-w-xs">
                    Follow some users or create a post to start filling up your feed.
                </p>
            </div>

        </div>
    );
}