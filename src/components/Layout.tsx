import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, PenTool, LayoutDashboard, Settings, LogOut, History, Menu, X } from 'lucide-react';
import clsx from 'clsx';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        return <>{children}</>;
    }

    const navItems = [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Essay Writing', path: '/essay', icon: PenTool },
        { label: 'Reading Test', path: '/reading', icon: BookOpen },
        { label: 'Review', path: '/review', icon: History },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold text-blue-600">Write Nest</h1>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Overlay for mobile menu */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={clsx(
                'bg-white border-r border-gray-200 flex flex-col z-50',
                'lg:w-64 lg:relative', // Desktop: fixed width, relative positioning
                'fixed inset-y-0 left-0 w-64 transform transition-transform duration-300', // Mobile: fixed, slide in/out
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0' // Show on desktop, toggle on mobile
            )}>
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-blue-600">Write Nest</h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)} // Close menu on mobile after clicking
                                className={clsx(
                                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                )}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {user.nickname?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">{user.nickname || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate w-32">{user.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto lg:ml-0 pt-16 lg:pt-0">
                <main className="p-4 sm:p-8 max-w-5xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
