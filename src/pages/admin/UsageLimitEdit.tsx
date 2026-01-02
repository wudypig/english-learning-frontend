import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';

interface UsageLimit {
    id: string;
    testType: string;
    remainingAttempts: number;
    lastReset: string;
}

export default function UsageLimitEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [limits, setLimits] = useState<UsageLimit[]>([]);
    const [essayLimit, setEssayLimit] = useState(0);
    const [readingLimit, setReadingLimit] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchLimits();
    }, [id]);

    const fetchLimits = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/users/${id}/limits`);
            const limitsData = response.data;
            setLimits(limitsData);

            // Set current values
            const essay = limitsData.find((l: UsageLimit) => l.testType === 'essay');
            const reading = limitsData.find((l: UsageLimit) => l.testType === 'reading');

            setEssayLimit(essay?.remainingAttempts || 0);
            setReadingLimit(reading?.remainingAttempts || 0);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch limits');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const limitsToUpdate = [
                { testType: 'essay', remainingAttempts: essayLimit },
                { testType: 'reading', remainingAttempts: readingLimit }
            ];

            await api.put(`/admin/users/${id}/limits`, { limits: limitsToUpdate });
            setSuccess('Usage limits updated successfully');

            // Refresh limits
            await fetchLimits();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update limits');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center mt-8">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Back to Users
                </button>
            </div>

            <h1 className="text-3xl font-bold mb-6">Edit Usage Limits</h1>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                    {success}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Essay Attempts
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={essayLimit}
                            onChange={(e) => setEssayLimit(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Number of essay generation attempts remaining
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reading Test Attempts
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={readingLimit}
                            onChange={(e) => setReadingLimit(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Number of reading test generation attempts remaining
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Update Limits'}
                    </button>
                </form>

                {/* Current Limits Display */}
                {limits.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                        <h3 className="text-lg font-semibold mb-3">Current Limits</h3>
                        <div className="space-y-2">
                            {limits.map((limit) => (
                                <div key={limit.id} className="flex justify-between text-sm">
                                    <span className="capitalize">{limit.testType}:</span>
                                    <span className="font-medium">{limit.remainingAttempts} attempts</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
