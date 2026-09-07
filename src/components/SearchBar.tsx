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
            } catch {
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) return;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => prev < results.length - 1 ? prev + 1 : prev);
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (results.length > 0) setIsOpen(true); }}
                    placeholder="Search users…"
                    className="w-full pl-9 pr-9 py-2 bg-[#F7F4EF] border border-[#E2DDD6] rounded-lg text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && results.length > 0 && (
                <div className="absolute top-full mt-1.5 w-full card-dark shadow-lg max-h-80 overflow-y-auto z-50 animate-slide-up">
                    {results.slice(0, 5).map((user, index) => (
                        <button
                            key={user.id}
                            onClick={() => handleViewProfile(user.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors ${
                                index === selectedIndex ? 'bg-stone-50' : ''
                            } ${index > 0 ? 'border-t border-[#F0ECE5]' : ''}`}
                        >
                            <UserAvatar user={user} size="sm" />
                            <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-medium text-stone-800 truncate">
                                    {user.nickname || 'No nickname'}
                                </p>
                                <p className="text-xs text-stone-400 truncate">{user.email}</p>
                            </div>
                            <span className="text-xs text-blue-600 flex-shrink-0">View Profile</span>
                        </button>
                    ))}

                    {results.length > 5 && (
                        <button
                            onClick={handleSeeAllResults}
                            className="w-full px-4 py-3 text-sm text-center text-blue-600 hover:text-blue-700 hover:bg-stone-50 transition-colors border-t border-[#F0ECE5]"
                        >
                            See all {results.length} results
                        </button>
                    )}
                </div>
            )}

            {/* Empty State */}
            {isOpen && !isLoading && query.trim().length > 0 && results.length === 0 && (
                <div className="absolute top-full mt-1.5 w-full card-dark shadow-lg p-4 z-50 animate-slide-up">
                    <p className="text-sm text-stone-400 text-center">No users found</p>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
