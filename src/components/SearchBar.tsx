import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import api from '../lib/api';
import UserAvatar from './UserAvatar';

interface SearchResult {
    id: string;
    nickname: string | null;
    email: string;
    avatar: string | null;
}

const SearchBar: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Debounced search
    useEffect(() => {
        if (query.trim().length === 0) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/user/search?q=${encodeURIComponent(query)}`);
                setResults(response.data);
                setIsOpen(true);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    handleViewProfile(results[selectedIndex].id);
                } else {
                    handleSeeAllResults();
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const handleViewProfile = (userId: string) => {
        navigate(`/users/${userId}`);
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(-1);
    };

    const handleSeeAllResults = () => {
        navigate(`/search?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(-1);
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-md">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                    placeholder="Search users..."
                    className="w-full px-4 py-2 pl-10 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-violet-400 animate-spin" />
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full card-dark shadow-2xl max-h-96 overflow-y-auto z-50 animate-slide-up">
                    {results.slice(0, 5).map((user, index) => (
                        <button
                            key={user.id}
                            onClick={() => handleViewProfile(user.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors ${index === selectedIndex ? 'bg-slate-700' : ''
                                } ${index > 0 ? 'border-t border-slate-700' : ''}`}
                        >
                            <UserAvatar user={user} size="sm" />
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-slate-200">
                                    {user.nickname || 'No nickname'}
                                </p>
                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                            </div>
                            <span className="text-xs text-violet-400">View Profile</span>
                        </button>
                    ))}

                    {results.length > 5 && (
                        <button
                            onClick={handleSeeAllResults}
                            className="w-full px-4 py-3 text-sm text-center text-violet-400 hover:text-violet-300 hover:bg-slate-700 transition-colors border-t border-slate-700"
                        >
                            See all {results.length} results
                        </button>
                    )}
                </div>
            )}

            {/* Empty State */}
            {isOpen && !isLoading && query.trim().length > 0 && results.length === 0 && (
                <div className="absolute top-full mt-2 w-full card-dark shadow-2xl p-4 z-50 animate-slide-up">
                    <p className="text-sm text-slate-400 text-center">No users found</p>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
