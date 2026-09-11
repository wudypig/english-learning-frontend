import { useState } from 'react';
import api from '../lib/api';

export const useResendVerification = (email: string) => {
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSent, setResendSent] = useState(false);

    const handleResend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setResendLoading(true);
        try {
            await api.post('/auth/resend-verification', { email });
            setResendSent(true);
        } finally {
            setResendLoading(false);
        }
    };

    return { resendLoading, resendSent, handleResend };
};
