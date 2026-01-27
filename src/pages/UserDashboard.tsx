import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, PenTool, BookOpen, Flame, Lock, Calendar } from 'lucide-react';
import api from '../lib/api';
import StatCard from '../components/StatCard';
import UserAvatar from '../components/UserAvatar';

interface UserDashboardData {
    user: {
        id: string;
        nickname: string | null;
        email: string;
        avatar: string | null;
    };
    totalTests: number;
    averageEssayScore: number;
    averageReadingScore: number;
    currentStreak: number;
    recentActivities: Array<{
        id: string;
        type: string;
        score: number;
        createdAt: string;
    }>;
}

const UserDashboard: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [data, setData] = useState<UserDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPrivate, setIsPrivate] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            if (!userId) return;

            setIsLoading(true);
            setError(null);
            setIsPrivate(false);

            try {
                const response = await api.get(`/user/${userId}/dashboard`);
                setData(response.data);
            } catch (err: any) {
                if (err.response?.status === 403) {
                    setIsPrivate(true);
                    setError(err.response?.data?.error || 'This user\'s dashboard is private');
                } else if (err.response?.status === 404) {
                    setError('User not found');
                } else {
                    setError('Failed to load user dashboard');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, [userId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
            </div>
        );
    }

    if (isPrivate || error) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Go Back
                </button>

                <div className="card-dark p-12 text-center">
                    <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">
                        {error || 'Profile is Private'}
                    </h3>
                    <p className="text-slate-400">
                        This user has chosen to keep their dashboard private
                    </p>
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>
            </div>

            {/* User Info Card */}
            <div className="card-dark p-6">
                <div className="flex items-center gap-4">
                    <UserAvatar user={data.user} size="lg" />
                    <div>
                        <h1 className="text-2xl font-bold gradient-text-purple">
                            {data.user.nickname || 'User'}
                        </h1>
                        <p className="text-slate-400">{data.user.email}</p>
                    </div>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Tests"
                    value={data.totalTests}
                    gradient="purple"
                    icon={<Trophy className="w-6 h-6 text-white" />}
                />
                <StatCard
                    label="Avg Essay Score"
                    value={data.averageEssayScore.toFixed(1)}
                    gradient="emerald"
                    icon={<PenTool className="w-6 h-6 text-white" />}
                />
                <StatCard
                    label="Avg Reading Score"
                    value={data.averageReadingScore.toFixed(1)}
                    gradient="blue"
                    icon={<BookOpen className="w-6 h-6 text-white" />}
                />
                <StatCard
                    label="Current Streak"
                    value={`${data.currentStreak} days`}
                    gradient="orange"
                    icon={<Flame className="w-6 h-6 text-white" />}
                />
            </div>

            {/* Recent Activities */}
            {data.recentActivities && data.recentActivities.length > 0 && (
                <div className="card-dark p-6">
                    <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-violet-400" />
                        Recent Activities
                    </h2>
                    <div className="space-y-3">
                        {data.recentActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.type === 'essay' ? 'gradient-bg-emerald' : 'gradient-bg-blue'
                                        }`}>
                                        {activity.type === 'essay' ? (
                                            <PenTool className="w-5 h-5 text-white" />
                                        ) : (
                                            <BookOpen className="w-5 h-5 text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-200 capitalize">
                                            {activity.type} Test
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            {formatDate(activity.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-slate-200">
                                        {activity.score.toFixed(1)}
                                    </p>
                                    <p className="text-xs text-slate-400">Score</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Activities */}
            {(!data.recentActivities || data.recentActivities.length === 0) && (
                <div className="card-dark p-8 text-center">
                    <p className="text-slate-400">No recent activities</p>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
