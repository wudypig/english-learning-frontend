import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';

type State = 'loading' | 'success' | 'expired' | 'invalid';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [state, setState] = useState<State>('loading');
    const [resendEmail, setResendEmail] = useState('');
    const [resendSent, setResendSent] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setState('invalid');
            return;
        }

        api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
            .then(() => setState('success'))
            .catch((err) => {
                const error = err.response?.data?.error;
                setState(error === 'token_expired' ? 'expired' : 'invalid');
            });
    }, [searchParams]);

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        setResendLoading(true);
        try {
            await api.post('/auth/resend-verification', { email: resendEmail });
            setResendSent(true);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-page)' }}>
            <div className="card-dark w-full max-w-md p-8 animate-scale-in">

                {state === 'loading' && (
                    <div className="text-center">
                        <Loader className="mx-auto mb-4 animate-spin text-[#1D4ED8]" size={40} />
                        <p className="text-stone-600 font-body">Verifying your email…</p>
                    </div>
                )}

                {state === 'success' && (
                    <div className="text-center">
                        <CheckCircle className="mx-auto mb-4 text-emerald-600" size={48} />
                        <h1 className="text-2xl font-semibold text-[#1C1917] mb-2">Email verified!</h1>
                        <p className="text-stone-600 mb-6">Your account is active. You can now log in.</p>
                        <Link to="/login" className="btn-gradient-purple inline-block px-6 py-2.5 rounded-lg text-sm font-semibold">
                            Go to Login
                        </Link>
                    </div>
                )}

                {state === 'expired' && (
                    <div>
                        <XCircle className="mx-auto mb-4 text-amber-600" size={48} />
                        <h1 className="text-2xl font-semibold text-[#1C1917] mb-2 text-center">Link expired</h1>
                        <p className="text-stone-600 mb-6 text-center">This verification link has expired. Enter your email to receive a new one.</p>
                        {resendSent ? (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3.5 text-sm text-center">
                                A new verification link has been sent. Please check your inbox.
                            </div>
                        ) : (
                            <form onSubmit={handleResend} className="space-y-3">
                                <div className="flex items-center gap-2 input-dark px-3 py-2.5 rounded-lg">
                                    <Mail size={16} className="text-stone-400 shrink-0" />
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={resendEmail}
                                        onChange={(e) => setResendEmail(e.target.value)}
                                        required
                                        className="flex-1 bg-transparent outline-none text-sm text-[#1C1917] placeholder-stone-400"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={resendLoading}
                                    className="btn-gradient-purple w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                                >
                                    {resendLoading ? 'Sending…' : 'Resend verification email'}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {state === 'invalid' && (
                    <div className="text-center">
                        <XCircle className="mx-auto mb-4 text-red-500" size={48} />
                        <h1 className="text-2xl font-semibold text-[#1C1917] mb-2">Invalid link</h1>
                        <p className="text-stone-600 mb-6">This verification link is invalid or has already been used.</p>
                        <Link to="/login" className="text-[#1D4ED8] hover:text-[#1E40AF] text-sm font-medium underline">
                            Back to Login
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
};

export default VerifyEmail;
