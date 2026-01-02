import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { PenTool, BookOpen } from 'lucide-react';

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
        // Default to not showing if not found or assumes 0? 
        // Logic says default created on use. If not here, maybe 0 or 3?
        // Let's assume 3 if undefined for display? No, better show what server has or 'Checking...'.
        // Actually the server creates it on first check. So it might be undefined here.
        // We can just say "Start to see limit" or hide it.
        return limit ? limit.remainingAttempts : 'N/A';
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.nickname}!</h1>
                <p className="text-gray-500 mt-2">Ready to improve your English today?</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Essay Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <PenTool className="w-8 h-8 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">
                            Attempts: {getRemaining('essay')}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Essay Writing</h3>
                    <p className="text-gray-600 mb-4">
                        Practice your writing skills with AI-generated topics and get instant feedback.
                    </p>
                    <Link
                        to="/essay"
                        className="inline-block w-full text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Start Writing
                    </Link>
                </div>

                {/* Reading Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <BookOpen className="w-8 h-8 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">
                            Attempts: {getRemaining('reading')}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Reading Test</h3>
                    <p className="text-gray-600 mb-4">
                        Test your comprehension with articles and questions tailored to your level.
                    </p>
                    <Link
                        to="/reading"
                        className="inline-block w-full text-center py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Start Test
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {stats?.history?.length > 0 ? (
                        stats.history.map((record: any) => (
                            <div key={record.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-lg ${record.type === 'essay' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                        {record.type === 'essay' ? <PenTool className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 capitalize">{record.type} Test</p>
                                        <p className="text-sm text-gray-500">{new Date(record.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        Score: {record.score.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No activities yet. Start a test!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
