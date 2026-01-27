import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import api from '../lib/api';
import UserAvatar from '../components/UserAvatar';

interface SearchResult {
    id: string;
    nickname: string | null;
    email: string;
    avatar: string | null;
}

const SearchResults: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await api.get(`/user/search?q=${encodeURIComponent(query)}`);
                setResults(response.data);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    const handleViewDashboard = (userId: string) => {
        navigate(`/users/${userId}`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text-purple mb-2">
                        Search Results
                    </h1>
                    {query && (
                        <p className="text-slate-400">
                            Showing results for "<span className="text-slate-200">{query}</span>"
                        </p>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
                </div>
            )}

            {/* Results Grid */}
            {!isLoading && results.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map((user) => (
                        <div
                            key={user.id}
                            className="card-dark p-6 hover:shadow-xl transition-all duration-200"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <UserAvatar user={user} size="lg" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-slate-200 truncate">
                                        {user.nickname || 'No nickname'}
                                    </h3>
                                    <p className="text-sm text-slate-400 truncate">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleViewDashboard(user.id)}
                                className="w-full px-4 py-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                <User className="w-4 h-4" />
                                View Dashboard
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && query && results.length === 0 && (
                <div className="card-dark p-12 text-center">
                    <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">
                        No users found
                    </h3>
                    <p className="text-slate-400">
                        Try searching with a different keyword
                    </p>
                </div>
            )}

            {/* No Query State */}
            {!isLoading && !query && (
                <div className="card-dark p-12 text-center">
                    <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">
                        Start searching
                    </h3>
                    <p className="text-slate-400">
                        Use the search bar to find other users
                    </p>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
