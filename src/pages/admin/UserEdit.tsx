import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';

interface UserDetails {
    id: string;
    email: string;
    nickname: string | null;
    role: string;
    difficultyLevel: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function UserEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserDetails | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        nickname: '',
        role: 'user',
        isActive: true
    });
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/users/${id}`);
            const userData = response.data;
            setUser(userData);
            setFormData({
                email: userData.email,
                nickname: userData.nickname || '',
                role: userData.role,
                isActive: userData.isActive
            });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch user');
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

            await api.put(`/admin/users/${id}`, formData);
            setSuccess('User updated successfully');

            // Refresh user data
            await fetchUser();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!newPassword || newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setSaving(true);
            setError('');
            await api.put(`/admin/users/${id}/password`, { newPassword });
            setSuccess('Password reset successfully');
            setNewPassword('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center mt-8">Loading...</div>;
    if (error && !user) return <div className="text-center mt-8 text-red-600">{error}</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Back to Users
                </button>
            </div>

            <h1 className="text-3xl font-bold mb-6">Edit User</h1>

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

            <div className="space-y-6">
                {/* User Information Form */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">User Information</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nickname
                            </label>
                            <input
                                type="text"
                                value={formData.nickname}
                                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="h-4 w-4 text-blue-600"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                Account Active
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>

                {/* Password Reset */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Enter new password (min 6 characters)"
                            />
                        </div>

                        <button
                            onClick={handlePasswordReset}
                            disabled={saving || !newPassword}
                            className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                        >
                            {saving ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </div>

                {/* User Metadata */}
                {user && (
                    <div className="bg-gray-100 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Metadata</h2>
                        <div className="space-y-2 text-sm">
                            <div><strong>User ID:</strong> {user.id}</div>
                            <div><strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}</div>
                            <div><strong>Updated:</strong> {new Date(user.updatedAt).toLocaleString()}</div>
                            <div><strong>Difficulty Level:</strong> {user.difficultyLevel}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
