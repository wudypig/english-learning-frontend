import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, GraduationCap, Save, Lock } from 'lucide-react';

const Settings: React.FC = () => {
    const { user, login } = useAuth();
    const [nickname, setNickname] = useState(user?.nickname || '');
    const [difficultyLevel, setDifficultyLevel] = useState(user?.difficultyLevel || '7th');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [dashboardVisibility, setDashboardVisibility] = useState('private');
    const [activitiesVisibility, setActivitiesVisibility] = useState('private');
    const [privacyLoading, setPrivacyLoading] = useState(false);
    const [privacyMessage, setPrivacyMessage] = useState('');

    useEffect(() => {
        if (user) {
            setNickname(user.nickname || '');
            setDifficultyLevel(user.difficultyLevel || '7th');
        }
        const fetchPrivacySettings = async () => {
            try {
                const response = await api.get('/user/privacy-settings');
                setDashboardVisibility(response.data.dashboardVisibility);
                setActivitiesVisibility(response.data.activitiesVisibility);
            } catch (error) {
                console.error('Failed to fetch privacy settings:', error);
            }
        };
        fetchPrivacySettings();
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
        } catch {
            setMessage('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrivacySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPrivacyLoading(true);
        setPrivacyMessage('');
        try {
            await api.put('/user/privacy-settings', { dashboardVisibility, activitiesVisibility });
            setPrivacyMessage('Privacy settings updated successfully!');
            setTimeout(() => setPrivacyMessage(''), 3000);
        } catch {
            setPrivacyMessage('Failed to update privacy settings.');
        } finally {
            setPrivacyLoading(false);
        }
    };

    const gradeLevels = ['7th', '8th', '9th', '10th', '11th', '12th'];

    return (
        <div className="max-w-xl mx-auto animate-fade-in">
            <header className="mb-7">
                <h1 className="text-2xl font-semibold text-stone-900 mb-1">Settings</h1>
                <p className="text-stone-500 text-sm">Manage your profile and preferences</p>
            </header>

            {/* Profile */}
            <div className="card-dark p-6 mb-5">
                <h2 className="text-base font-semibold text-stone-800 mb-5 flex items-center gap-2">
                    <User className="w-4 h-4 text-stone-400" />
                    Profile Settings
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {message && (
                        <div className={`p-3.5 rounded-lg text-sm animate-slide-up ${
                            message.includes('success')
                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                            {message}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-stone-400" />
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={user?.email}
                            disabled
                            className="input-dark"
                        />
                        <p className="mt-1.5 text-xs text-stone-400">Email cannot be changed</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-stone-400" />
                            Nickname
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
                        <label className="block text-sm font-medium text-stone-700 mb-1.5 flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                            Difficulty Level
                        </label>
                        <select
                            value={difficultyLevel}
                            onChange={(e) => setDifficultyLevel(e.target.value)}
                            className="input-dark"
                        >
                            {gradeLevels.map((level) => (
                                <option key={level} value={level}>{level} Grade</option>
                            ))}
                        </select>
                        <p className="mt-1.5 text-xs text-stone-400">
                            Sets the difficulty of AI-generated essays and reading tests
                        </p>
                    </div>

                    <div className="pt-2 border-t border-[#E2DDD6]">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gradient-purple flex items-center"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Privacy */}
            <div className="card-dark p-6">
                <h2 className="text-base font-semibold text-stone-800 mb-1 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-stone-400" />
                    Privacy Settings
                </h2>
                <p className="text-xs text-stone-400 mb-5">Control what information other users can see</p>

                <form onSubmit={handlePrivacySubmit} className="space-y-4">
                    {privacyMessage && (
                        <div className={`p-3.5 rounded-lg text-sm animate-slide-up ${
                            privacyMessage.includes('success')
                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                            {privacyMessage}
                        </div>
                    )}

                    {/* Dashboard Visibility */}
                    <div className="flex items-center justify-between p-4 bg-[#F7F4EF] rounded-lg border border-[#E2DDD6]">
                        <div className="flex-1 mr-4">
                            <p className="text-sm font-medium text-stone-700 mb-0.5">Dashboard Visibility</p>
                            <p className="text-xs text-stone-400">
                                Allow others to view your statistics and performance summary
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setDashboardVisibility(dashboardVisibility === 'private' ? 'public' : 'private')}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                                dashboardVisibility === 'public' ? 'bg-blue-600' : 'bg-stone-300'
                            }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                dashboardVisibility === 'public' ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                        </button>
                    </div>

                    {/* Activities Visibility */}
                    <div className="flex items-center justify-between p-4 bg-[#F7F4EF] rounded-lg border border-[#E2DDD6]">
                        <div className="flex-1 mr-4">
                            <p className="text-sm font-medium text-stone-700 mb-0.5">Activities Visibility</p>
                            <p className="text-xs text-stone-400">
                                Allow others to view your recent test history and activities
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setActivitiesVisibility(activitiesVisibility === 'private' ? 'public' : 'private')}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                                activitiesVisibility === 'public' ? 'bg-blue-600' : 'bg-stone-300'
                            }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                activitiesVisibility === 'public' ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                        </button>
                    </div>

                    <div className="pt-2 border-t border-[#E2DDD6]">
                        <button
                            type="submit"
                            disabled={privacyLoading}
                            className="btn-gradient-purple flex items-center"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {privacyLoading ? 'Saving…' : 'Save Privacy Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
