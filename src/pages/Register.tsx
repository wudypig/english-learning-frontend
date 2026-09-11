import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { UserPlus, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { useResendVerification } from '../hooks/useResendVerification';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [registered, setRegistered] = useState(false);

    const { resendLoading, resendSent, handleResend } = useResendVerification(email);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/register', { email, password, nickname });
            setRegistered(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to register');
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

                    {registered ? (
                        <div className="text-center">
                            <CheckCircle className="mx-auto mb-4 text-emerald-600" size={48} />
                            <h2 className="text-xl font-semibold text-stone-900 mb-2">Check your inbox</h2>
                            <p className="text-stone-600 text-sm mb-1">
                                We've sent a verification link to
                            </p>
                            <p className="font-medium text-[#1C1917] text-sm mb-6">{email}</p>
                            <p className="text-stone-500 text-sm mb-5">
                                Click the link in the email to activate your account. The link expires in 24 hours.
                            </p>
                            {resendSent ? (
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3.5 text-sm mb-4">
                                    A new verification link has been sent.
                                </div>
                            ) : (
                                <button
                                    onClick={handleResend}
                                    disabled={resendLoading}
                                    className="text-[#1D4ED8] hover:text-[#1E40AF] text-sm font-medium underline disabled:opacity-60 mb-4 block mx-auto"
                                >
                                    {resendLoading ? 'Sending…' : 'Resend verification email'}
                                </button>
                            )}
                            <Link to="/login" className="text-stone-500 hover:text-stone-700 text-sm transition-colors">
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold text-stone-900 mb-6">Create your account</h2>

                            {error && (
                                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-slide-up">
                                    {error}
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
                                        Nickname <span className="text-stone-400 font-normal">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                        <input
                                            type="text"
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            className="input-dark pl-10"
                                            placeholder="Your name"
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
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    {loading ? 'Creating Account…' : 'Create Account'}
                                </button>
                            </form>

                            <p className="mt-5 text-center text-sm text-stone-500">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                    Login
                                </Link>
                            </p>
                        </>
                    )}

                </div>

                <p className="text-center text-stone-400 text-xs mt-6">
                    Join us and start your English learning journey
                </p>
            </div>
        </div>
    );
};

export default Register;
