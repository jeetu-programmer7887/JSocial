import { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function UserListPage() {
    const { username } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_backendUrl || '';

    // Determine if we are looking at followers or following based on the URL
    const isFollowers = location.pathname.includes('followers');
    const pageType = isFollowers ? 'followers' : 'following';

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${backendUrl}/api/user/profile/${username}/${pageType}`, {
                    withCredentials: true
                });
                
                if (res.data?.success) {
                    setUsers(res.data.users);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to load users");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [username, pageType, backendUrl]);

    return (
        <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-6">
            
            {/* Header Area */}
            <div className="flex items-center gap-4 bg-surface/60 backdrop-blur-xl border border-white/5 rounded-3xl p-4 shadow-md">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                </button>
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-text capitalize">{pageType}</h2>
                    <span className="text-sm text-muted">@{username}</span>
                </div>
            </div>

            {/* List Area */}
            <div className="bg-surface/60 backdrop-blur-xl border border-white/5 rounded-3xl p-4 shadow-md min-h-[50vh]">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20 text-muted">
                        <p className="font-bold">No {pageType} yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {users.map((user) => (
                            <Link 
                                to={`/profile/${user.username}`} 
                                key={user._id} 
                                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group border border-transparent hover:border-white/5"
                            >
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-linear-to-tr from-primary to-secondary shrink-0 flex items-center justify-center text-bg font-bold">
                                    {user.profileImg ? (
                                        <img src={user.profileImg} alt={user.username} className="w-full h-full object-cover" />
                                    ) : (
                                        user.fullname?.charAt(0).toUpperCase() || 'U'
                                    )}
                                </div>
                                
                                {/* Info */}
                                <div className="flex flex-col flex-1">
                                    <span className="font-bold text-text group-hover:text-primary transition-colors">
                                        {user.fullname || user.username}
                                    </span>
                                    <span className="text-sm text-muted">@{user.username}</span>
                                </div>

                                {/* Go Arrow */}
                                <div className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}