import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, PenTool, LayoutDashboard, Settings, LogOut, History, Menu, X, ChevronDown } from 'lucide-react';
import SearchBar from './SearchBar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setUserDropdownOpen(false);
            }
        };
        if (userDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [userDropdownOpen]);

    if (!user) return <>{children}</>;

    const navItems = [
        { label: 'Dashboard',    path: '/',        icon: LayoutDashboard },
        { label: 'Essay Writing', path: '/essay',   icon: PenTool },
        { label: 'Reading Test',  path: '/reading', icon: BookOpen },
        { label: 'Review',        path: '/review',  icon: History },
    ];

    return (
        <div className="min-h-screen bg-[#F7F4EF]">
            {/* Top Navigation Bar */}
            <nav className="bg-white border-b border-[#E2DDD6] sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <h1 className="text-xl font-display font-bold text-[#1D4ED8] tracking-tight">
                                Write Nest
                            </h1>
                        </div>

                        {/* Search Bar (Desktop) */}
                        <div className="hidden lg:flex flex-1 max-w-sm mx-8">
                            <SearchBar />
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                                            isActive
                                                ? 'bg-blue-700 text-white shadow-sm'
                                                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 mr-1.5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* User Dropdown (Desktop) */}
                        <div className="hidden md:block relative ml-4" ref={dropdownRef}>
                            <button
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full gradient-bg-purple flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                    {user.nickname?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden lg:block text-left">
                                    <p className="text-sm font-medium text-stone-800 leading-tight">{user.nickname || 'User'}</p>
                                    <p className="text-xs text-stone-500">{user.email}</p>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {userDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 card-dark shadow-lg animate-slide-up overflow-hidden">
                                    <div className="px-4 py-3 border-b border-[#E2DDD6]">
                                        <p className="text-sm font-semibold text-stone-800">{user.nickname || 'User'}</p>
                                        <p className="text-xs text-stone-500 truncate">{user.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            to="/settings"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                                        >
                                            <Settings className="w-4 h-4 mr-3 text-stone-400" />
                                            Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4 mr-3" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-[#E2DDD6] bg-white animate-slide-up">
                        <div className="px-4 pt-3 pb-2">
                            <SearchBar />
                        </div>
                        <div className="px-4 py-2 space-y-0.5">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                            isActive
                                                ? 'bg-blue-700 text-white'
                                                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 mr-3" />
                                        {item.label}
                                    </Link>
                                );
                            })}

                            <div className="border-t border-[#E2DDD6] mt-2 pt-2">
                                <div className="flex items-center px-3 py-2 mb-1">
                                    <div className="w-9 h-9 rounded-full gradient-bg-purple flex items-center justify-center text-white font-semibold shadow-sm">
                                        {user.nickname?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-stone-800">{user.nickname || 'User'}</p>
                                        <p className="text-xs text-stone-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <Link
                                    to="/settings"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                                >
                                    <Settings className="w-4 h-4 mr-3 text-stone-400" />
                                    Settings
                                </Link>
                                <button
                                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                                    className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                >
                                    <LogOut className="w-4 h-4 mr-3" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
