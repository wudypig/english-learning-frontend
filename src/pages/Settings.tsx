import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, GraduationCap, Save } from 'lucide-react';

const Settings: React.FC = () => {
    const { user, login } = useAuth();
    const [nickname, setNickname] = useState(user?.nickname || '');
    const [difficultyLevel, setDifficultyLevel] = useState(user?.difficultyLevel || '7th');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

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
            const token = localStorage.getItem('token') || '';
            login(token, res.data);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const gradeLevels = ['7th', '8th', '9th', '10th', '11th', '12th'];

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-100 mb-2">Settings</h1>
                <p className="text-slate-400">Manage your profile and preferences</p>
            </header>

            <div className="card-dark p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {message && (
                        <div className={`p-4 rounded-lg text-sm animate-slide-up ${message.includes('success')
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                : 'bg-red-500/10 border border-red-500/30 text-red-400'
                            }`}>
                            {message}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                            <div className="flex items-center mb-2">
                                <Mail className="w-4 h-4 mr-2" />
                                Email Address
                            </div>
                        </label>
                        <input
                            type="email"
                            value={user?.email}
                            disabled
                            className="w-full px-4 py-3 bg-slate-700/30 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                        />
                        <p className="mt-2 text-xs text-slate-500">Email cannot be changed</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                            <div className="flex items-center mb-2">
                                <User className="w-4 h-4 mr-2" />
                                Nickname
                            </div>
                        </label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="input-dark"
                            placeholder="Enter your nickname"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                            <div className="flex items-center mb-2">
                                <GraduationCap className="w-4 h-4 mr-2" />
                                Difficulty Level
                            </div>
                        </label>
                        <select
                            value={difficultyLevel}
                            onChange={(e) => setDifficultyLevel(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                        >
                            {gradeLevels.map((level) => (
                                <option key={level} value={level}>
                                    {level} Grade
                                </option>
                            ))}
                        </select>
                        <p className="mt-2 text-sm text-slate-400">
                            Choose your grade level to customize the difficulty of essays and reading tests
                        </p>
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gradient-purple w-full sm:w-auto flex items-center justify-center"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
