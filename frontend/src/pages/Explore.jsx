import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SuggestedUsers from '../components/SuggestedUser'; // Ensure filename matches exactly
import PostFeed from '../components/PostFeed';

export default function Explore() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isFeedLoading, setIsFeedLoading] = useState(true);

    const backendUrl = import.meta.env.VITE_backendUrl || '';

    // --- FEED LOADING SIMULATION ---
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFeedLoading(false);
        }, 1000); // Adjust this delay (in milliseconds) as needed

        return () => clearTimeout(timer);
    }, []);

    // --- DEBOUNCED SEARCH LOGIC ---
    useEffect(() => {
        // If search is empty, clear results immediately
        if (!searchQuery.trim()) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSearchResults([]);
            return;
        }

        // Set a timer to wait 300ms after the user stops typing
        const delaySearch = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await axios.get(`${backendUrl}/api/user/search?query=${searchQuery}`, {
                    withCredentials: true
                });

                if (res.data?.success) {
                    setSearchResults(res.data.users);
                }
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        }, 300); // 300 millisecond delay

        // Cleanup function: If the user types again before 300ms, cancel the previous timer
        return () => clearTimeout(delaySearch);

    }, [searchQuery, backendUrl]);

    return (
        /* Outer container is wide (max-w-7xl) for the Post Grid */
        <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-10">

            {/* 1. Sticky Search Header */}
            <div className="top-20 z-40 backdrop-blur-xl py-4 border-b border-white/5 -mx-4 px-4 sm:mx-0 sm:px-0">
                {/* Search input is constrained and centered (max-w-2xl) */}
                <div className="relative w-full max-w-2xl mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>

                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface/60 border border-white/10 rounded-full py-3 pl-12 pr-10 text-text placeholder-muted focus:outline-none focus:border-primary transition-colors shadow-inner"
                    />

                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted hover:text-text transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* 2. Live Search Results */}
            {searchQuery && (
                <div className="w-full flex justify-center -mt-6 z-30">
                    {/* Dropdown is perfectly aligned with the search bar (max-w-2xl) */}
                    <div className="w-full max-w-2xl bg-surface/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl flex flex-col gap-2">
                        <h3 className="text-sm font-bold text-muted px-2 uppercase tracking-widest mb-2">Search Results</h3>

                        {isSearching ? (
                            <div className="flex justify-center py-6">
                                <div className="w-6 h-6 border-2 border-white/20 border-t-primary rounded-full animate-spin"></div>
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="text-center text-muted py-6 text-sm">
                                No users found for "{searchQuery}"
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {searchResults.map((user) => (
                                    <Link
                                        to={`/profile/${user.username}`}
                                        key={user._id}
                                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/5">
                                            {user.profileImg ? (
                                                <img src={user.profileImg} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-bg font-bold bg-linear-to-tr from-primary to-secondary text-sm">
                                                    {user.fullname?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className="font-bold text-text group-hover:text-primary transition-colors">
                                                {user.fullname}
                                            </span>
                                            <span className="text-sm text-muted">@{user.username}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 3. Default Content (Visible when NOT searching) */}
            {!searchQuery && (
                <div className="flex flex-col gap-12 w-full">

                    {/* Suggested Users Section */}
                    {/* Constrained to max-w-3xl so it doesn't look stretched out */}
                    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
                        <h3 className="text-xl font-bold text-text ml-2">Discover People</h3>
                        {/* Note: I removed the extra border/bg wrapper so it uses your SuggestedUsers component's native styling cleanly */}
                        <SuggestedUsers />
                    </div>

                    {/* Explore Posts Section */}
                    {/* Unconstrained! Takes full width of the 7xl parent for the grid */}
                    <div className="w-full flex flex-col gap-6">
                        <h3 className="text-xl font-bold text-text">Explore Posts</h3>

                        {isFeedLoading ? (
                            /* Updated skeleton layout to match the responsive 1/2/3 column layout of PostFeed */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="aspect-square bg-surface border border-white/5 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <PostFeed />
                        )}
                    </div>

                </div>
            )}

        </div>
    );
}