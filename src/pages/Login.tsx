import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useResendVerification } from '../hooks/useResendVerification';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [unverified, setUnverified] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const { resendLoading, resendSent, handleResend } = useResendVerification(email);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setUnverified(false);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { accessToken, refreshToken, user } = response.data;
            login(accessToken, refreshToken, user);
            navigate('/');
        } catch (err: any) {
            if (err.response?.data?.error === 'email_not_verified') {
                setUnverified(true);
            } else {
                setError(err.response?.data?.error || 'Failed to login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-page)' }}>
            <div className="w-full max-w-md animate-fade-in">

                {/* Brand */}
                <div className="text-center mb-8">
                    <h1 className="font-display text-4xl font-bold text-[#1D4ED8] mb-1">Write Nest</h1>
                    <p className="text-stone-500 text-sm">AI-Powered English Learning</p>
                </div>

                {/* Card */}
                <div className="card-dark p-8 animate-scale-in">
                    <h2 className="text-xl font-semibold text-stone-900 mb-6">Welcome back</h2>

                    {error && (
                        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-slide-up">
                            {error}
                        </div>
                    )}

                    {unverified && (
                        <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm animate-slide-up">
                            <p className="font-medium mb-1">Email not verified</p>
                            <p className="mb-2">Please verify your email before logging in.</p>
                            {resendSent ? (
                                <p className="text-emerald-700 font-medium">Verification email sent! Check your inbox.</p>
                            ) : (
                                <button
                                    onClick={handleResend}
                                    disabled={resendLoading}
                                    className="text-[#1D4ED8] hover:text-[#1E40AF] font-medium underline disabled:opacity-60"
                                >
                                    {resendLoading ? 'Sending…' : 'Resend verification email'}
                                </button>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-dark pl-10"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-dark pl-10"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-gradient-purple mt-2"
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            {loading ? 'Logging in…' : 'Login'}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-sm text-stone-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>

                <p className="text-center text-stone-400 text-xs mt-6">
                    Improve your English with AI-powered feedback
                </p>
            </div>
        </div>
    );
};

export default Login;
