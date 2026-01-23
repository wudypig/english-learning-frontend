import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, PenTool, LayoutDashboard, Settings, LogOut, History, Menu, X, ChevronDown, User } from 'lucide-react';

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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setUserDropdownOpen(false);
            }
        };

        if (userDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userDropdownOpen]);

    if (!user) {
        return <>{children}</>;
    }

    const navItems = [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Essay Writing', path: '/essay', icon: PenTool },
        { label: 'Reading Test', path: '/reading', icon: BookOpen },
        { label: 'Review', path: '/review', icon: History },
    ];

    return (
        <div className="min-h-screen bg-[#0F172A]">
            {/* Top Navigation Bar */}
            <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold gradient-text-purple">
                                Write Nest
                            </h1>
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
                                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                                ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-700'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* User Dropdown (Desktop) */}
                        <div className="hidden md:block relative" ref={dropdownRef}>
                            <button
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full gradient-bg-purple flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    {user.nickname?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden lg:block text-left">
                                    <p className="text-sm font-medium text-slate-200">{user.nickname || 'User'}</p>
                                    <p className="text-xs text-slate-400">{user.email}</p>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {userDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 card-dark shadow-2xl animate-slide-up overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-700">
                                        <p className="text-sm font-medium text-slate-200">{user.nickname || 'User'}</p>
                                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                    </div>
                                    <div className="py-2">
                                        <Link
                                            to="/settings"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                                        >
                                            <Settings className="w-4 h-4 mr-3" />
                                            Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
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
                            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-700 bg-slate-800 animate-slide-up">
                        <div className="px-4 py-3 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                                ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white'
                                                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 mr-3" />
                                        {item.label}
                                    </Link>
                                );
                            })}

                            {/* Mobile User Section */}
                            <div className="border-t border-slate-700 mt-3 pt-3">
                                <div className="flex items-center px-4 py-2 mb-2">
                                    <div className="w-10 h-10 rounded-full gradient-bg-purple flex items-center justify-center text-white font-bold shadow-lg">
                                        {user.nickname?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-slate-200">{user.nickname || 'User'}</p>
                                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <Link
                                    to="/settings"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                                >
                                    <Settings className="w-5 h-5 mr-3" />
                                    Settings
                                </Link>
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                >
                                    <LogOut className="w-5 h-5 mr-3" />
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
