import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { PenTool, BookOpen, TrendingUp, Award, ArrowRight } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/user/profile');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProfile();
    }, []);

    // Helper to find remaining attempts
    const getRemaining = (type: string) => {
        const limit = stats?.user?.usageLimits?.find((l: any) => l.testType === type);
        if (!limit) return 'N/A';
        if (limit.remainingAttempts === -1) return '∞';
        return limit.remainingAttempts;
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Header */}
            <header className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-3">
                    Welcome back, <span className="gradient-text-purple">{user?.nickname || 'Learner'}</span>! 👋
                </h1>
                <p className="text-slate-400 text-lg">Ready to improve your English today?</p>
            </header>

            {/* Practice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Essay Writing Card */}
                <div className="card-dark-hover overflow-hidden group relative animate-scale-in">
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                    <div className="relative p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl gradient-bg-purple shadow-lg glow-purple">
                                <PenTool className="w-7 h-7 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 mb-1">Attempts Left</p>
                                <p className="text-2xl font-bold gradient-text-purple">{getRemaining('essay')}</p>
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-slate-100 mb-3">Essay Writing</h3>
                        <p className="text-slate-400 mb-6 leading-relaxed">
                            Practice your writing skills with AI-generated topics and get instant, detailed feedback to improve.
                        </p>

                        <Link
                            to="/essay"
                            className="btn-gradient-purple w-full flex items-center justify-center group"
                        >
                            Start Writing
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Reading Test Card */}
                <div className="card-dark-hover overflow-hidden group relative animate-scale-in" style={{ animationDelay: '0.1s' }}>
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                    <div className="relative p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl gradient-bg-emerald shadow-lg glow-emerald">
                                <BookOpen className="w-7 h-7 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 mb-1">Attempts Left</p>
                                <p className="text-2xl font-bold gradient-text-emerald">{getRemaining('reading')}</p>
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-slate-100 mb-3">Reading Test</h3>
                        <p className="text-slate-400 mb-6 leading-relaxed">
                            Test your comprehension with articles and questions tailored to challenge your understanding.
                        </p>

                        <Link
                            to="/reading"
                            className="btn-gradient-emerald w-full flex items-center justify-center group"
                        >
                            Start Test
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card-dark overflow-hidden animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <div className="px-6 py-5 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <TrendingUp className="w-5 h-5 text-violet-400 mr-3" />
                            <h3 className="text-xl font-bold text-slate-100">Recent Activity</h3>
                        </div>
                        <Link to="/review" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                            View All
                        </Link>
                    </div>
                </div>

                <div className="divide-y divide-slate-700">
                    {stats?.history?.length > 0 ? (
                        stats.history.slice(0, 5).map((record: any, idx: number) => (
                            <div
                                key={record.id}
                                className="px-6 py-4 hover:bg-slate-700/30 transition-colors"
                                style={{ animationDelay: `${0.3 + idx * 0.05}s` }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-3 rounded-lg ${record.type === 'essay'
                                                ? 'gradient-bg-purple'
                                                : 'gradient-bg-emerald'
                                            }`}>
                                            {record.type === 'essay' ? (
                                                <PenTool className="w-5 h-5 text-white" />
                                            ) : (
                                                <BookOpen className="w-5 h-5 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-200 capitalize">
                                                {record.type} Test
                                            </p>
                                            <p className="text-sm text-slate-400">
                                                {new Date(record.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Award className="w-4 h-4 text-amber-400 mr-2" />
                                        <span className="text-lg font-bold text-slate-100">
                                            {record.score.toFixed(1)}
                                        </span>
                                        <span className="text-sm text-slate-400 ml-1">/10</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700/50 mb-4">
                                <TrendingUp className="w-8 h-8 text-slate-500" />
                            </div>
                            <p className="text-slate-400 mb-4">No activities yet. Start a test to see your progress!</p>
                            <div className="flex gap-3 justify-center">
                                <Link to="/essay" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                                    Start Essay →
                                </Link>
                                <Link to="/reading" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                                    Start Reading →
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
