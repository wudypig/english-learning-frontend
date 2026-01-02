import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
    const { user, login } = useAuth(); // login updates context
    const [nickname, setNickname] = useState(user?.nickname || '');
    const [difficultyLevel, setDifficultyLevel] = useState(user?.difficultyLevel || '7th');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Sync state with user context when it changes
    useEffect(() => {
        if (user) {
            setNickname(user.nickname || '');
            setDifficultyLevel(user.difficultyLevel || '7th');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await api.put('/user/settings', { nickname, difficultyLevel });
            // Update context
            const token = localStorage.getItem('token') || '';
            login(token, res.data); // Update user in state
            setMessage('Profile updated successfully!');
        } catch (error) {
            setMessage('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const gradeLevels = ['7th', '8th', '9th', '10th', '11th', '12th'];

    return (
        <div className="max-w-xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {message && <div className={`p-3 rounded text-sm ${message.includes('Success') ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{message}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={user?.email}
                            disabled
                            className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 text-gray-500 border p-2 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nickname</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
                        <select
                            value={difficultyLevel}
                            onChange={(e) => setDifficultyLevel(e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
                        >
                            {gradeLevels.map((level) => (
                                <option key={level} value={level}>
                                    {level} Grade
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-sm text-gray-500">
                            Choose your grade level to customize the difficulty of essays and reading tests
                        </p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
