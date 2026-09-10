import React, { useEffect, useState, useMemo } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { PenTool, BookOpen, TrendingUp, Award, ArrowRight, Target, Flame, TrendingDown } from 'lucide-react';
import StatCard from '../components/StatCard';
import PerformanceChart from '../components/PerformanceChart';
import DimensionTrendChart from '../components/DimensionTrendChart';
import { calculateTotalTests, calculateAverageScore, calculateStreak, groupByDate, calculateDimensionAverages, getWeakestDimension, groupDimensionsByDate } from '../utils/analytics';

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

    const getRemaining = (type: string) => {
        const limit = stats?.user?.usageLimits?.find((l: any) => l.testType === type);
        if (!limit) return 'N/A';
        if (limit.remainingAttempts === -1) return '∞';
        return limit.remainingAttempts;
    };

    const analytics = useMemo(() => {
        const history = stats?.history || [];
        const dimensionAvgs = calculateDimensionAverages(history);
        return {
            totalTests: calculateTotalTests(history),
            avgEssay: calculateAverageScore(history, 'essay'),
            avgReading: calculateAverageScore(history, 'reading'),
            streak: calculateStreak(history),
            chartData: groupByDate(history),
            dimensionAvgs,
            weakestDimension: dimensionAvgs ? getWeakestDimension(dimensionAvgs) : null,
            dimensionChartData: groupDimensionsByDate(history),
        };
    }, [stats]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Header */}
            <header>
                <h1 className="text-3xl md:text-4xl font-semibold text-stone-900 mb-1">
                    Welcome back, <span className="text-[#1D4ED8]">{user?.nickname || 'Learner'}</span>
                </h1>
                <p className="text-stone-500">Ready to improve your English today?</p>
            </header>

            {/* Stats */}
            {stats?.history && stats.history.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Tests"
                        value={analytics.totalTests}
                        gradient="blue"
                        icon={<Target className="w-5 h-5 text-white" />}
                    />
                    <StatCard
                        label="Avg Essay Score"
                        value={analytics.avgEssay > 0 ? analytics.avgEssay.toFixed(1) : 'N/A'}
                        gradient="purple"
                        icon={<PenTool className="w-5 h-5 text-white" />}
                    />
                    <StatCard
                        label="Avg Reading Score"
                        value={analytics.avgReading > 0 ? analytics.avgReading.toFixed(1) : 'N/A'}
                        gradient="emerald"
                        icon={<BookOpen className="w-5 h-5 text-white" />}
                    />
                    <StatCard
                        label="Current Streak"
                        value={`${analytics.streak} ${analytics.streak === 1 ? 'day' : 'days'}`}
                        gradient="orange"
                        icon={<Flame className="w-5 h-5 text-white" />}
                    />
                </div>
            )}

            {/* Weakest Dimension Insight */}
            {analytics.weakestDimension && (() => {
                const { weakestDimension, dimensionAvgs } = analytics;
                if (!weakestDimension || !dimensionAvgs) return null;
                return (
                    <div className="card-dark p-5 flex items-center gap-4 border-l-4 border-[#B91C1C] animate-fade-in">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex-shrink-0">
                            <TrendingDown className="w-5 h-5 text-[#B91C1C]" />
                        </div>
                        <div>
                            <p className="text-xs text-[#A8A29E] mb-0.5 font-body">Needs Most Improvement</p>
                            <h3 className="text-lg font-bold text-[#1C1917] capitalize font-body">
                                {weakestDimension}
                            </h3>
                            <p className="text-xs text-[#78716C] font-body">
                                Average: {dimensionAvgs[weakestDimension].toFixed(1)} / 10
                                {' · '}
                                Based on {dimensionAvgs.sampleCount}{' '}
                                {dimensionAvgs.sampleCount === 1 ? 'essay' : 'essays'}
                            </p>
                        </div>
                    </div>
                );
            })()}

            {/* Performance Chart */}
            {stats?.history && stats.history.length > 0 && analytics.chartData.length > 0 && (
                <PerformanceChart data={analytics.chartData} />
            )}

            {/* Dimension Trend Chart */}
            {analytics.dimensionChartData.length > 0 && (
                <DimensionTrendChart data={analytics.dimensionChartData} />
            )}

            {/* Practice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Essay Writing */}
                <div className="card-dark-hover overflow-hidden group relative animate-scale-in">
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl gradient-bg-purple glow-purple">
                                <PenTool className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-stone-400 mb-0.5">Attempts Left</p>
                                <p className="text-xl font-bold text-[#1D4ED8]">{getRemaining('essay')}</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-stone-900 mb-2">Essay Writing</h3>
                        <p className="text-stone-500 text-sm mb-5 leading-relaxed">
                            Practice writing with AI-generated topics and receive instant, detailed feedback.
                        </p>
                        <Link
                            to="/essay"
                            className="btn-gradient-purple w-full"
                        >
                            Start Writing
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Reading Test */}
                <div className="card-dark-hover overflow-hidden group relative animate-scale-in" style={{ animationDelay: '0.05s' }}>
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl gradient-bg-emerald glow-emerald">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-stone-400 mb-0.5">Attempts Left</p>
                                <p className="text-xl font-bold text-[#047857]">{getRemaining('reading')}</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-stone-900 mb-2">Reading Test</h3>
                        <p className="text-stone-500 text-sm mb-5 leading-relaxed">
                            Test your comprehension with articles and questions tailored to your level.
                        </p>
                        <Link
                            to="/reading"
                            className="btn-gradient-emerald w-full"
                        >
                            Start Test
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card-dark overflow-hidden animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <div className="px-6 py-4 border-b border-[#E2DDD6] flex items-center justify-between">
                    <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-[#1D4ED8] mr-2.5" />
                        <h3 className="text-base font-semibold text-stone-800">Recent Activity</h3>
                    </div>
                    <Link to="/review" className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium">
                        View All
                    </Link>
                </div>

                <div className="divide-y divide-[#F0ECE5]">
                    {stats?.history?.length > 0 ? (
                        stats.history.slice(0, 5).map((record: any) => (
                            <div
                                key={record.id}
                                className="px-6 py-4 hover:bg-stone-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3.5">
                                        <div className={`p-2.5 rounded-lg ${record.type === 'essay' ? 'gradient-bg-purple' : 'gradient-bg-emerald'}`}>
                                            {record.type === 'essay'
                                                ? <PenTool className="w-4 h-4 text-white" />
                                                : <BookOpen className="w-4 h-4 text-white" />
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-stone-800 capitalize">
                                                {record.type} Test
                                            </p>
                                            <p className="text-xs text-stone-400">
                                                {new Date(record.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Award className="w-4 h-4 text-amber-500 mr-1.5" />
                                        <span className="text-base font-bold text-stone-800">
                                            {record.score.toFixed(1)}
                                        </span>
                                        <span className="text-xs text-stone-400 ml-0.5">/10</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-12 text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-stone-100 mb-4">
                                <TrendingUp className="w-7 h-7 text-stone-400" />
                            </div>
                            <p className="text-stone-500 mb-4 text-sm">No activities yet. Start a test to see your progress!</p>
                            <div className="flex gap-4 justify-center">
                                <Link to="/essay" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                    Start Essay →
                                </Link>
                                <Link to="/reading" className="text-sm text-emerald-700 hover:text-emerald-800 font-medium transition-colors">
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
