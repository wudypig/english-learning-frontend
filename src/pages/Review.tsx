import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { BookOpen, PenTool, ChevronDown, ChevronUp, Award, Calendar } from 'lucide-react';

const Review: React.FC = () => {
    const [history, setHistory] = useState<any[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        api.get('/user/history').then(res => setHistory(res.data));
    }, []);

    const toggleExpand = (id: string) => {
        setExpanded(expanded === id ? null : id);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <header>
                <h1 className="text-3xl font-bold text-slate-100 mb-2">History Review</h1>
                <p className="text-slate-400">Review your past tests and track your progress</p>
            </header>

            <div className="card-dark overflow-hidden">
                {history.map((record, idx) => (
                    <div key={record.id} className="border-b border-slate-700 last:border-0">
                        <div
                            onClick={() => toggleExpand(record.id)}
                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-700/30 transition-colors"
                        >
                            <div className="flex items-center space-x-4 flex-1">
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
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-bold text-slate-100 capitalize">{record.type}</span>
                                        <span className="text-slate-600">•</span>
                                        <div className="flex items-center text-sm text-slate-400">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(record.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-400 truncate">{record.content?.substring(0, 80)}...</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 ml-4">
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 mb-1">Score</p>
                                    <div className="flex items-center">
                                        <Award className="w-4 h-4 text-amber-400 mr-1" />
                                        <span className={`text-xl font-bold ${Number(record.score) >= (record.type === 'essay' ? 6 : 60)
                                                ? 'text-emerald-400'
                                                : 'text-orange-400'
                                            }`}>
                                            {Number(record.score).toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                                {expanded === record.id ? (
                                    <ChevronUp className="w-5 h-5 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-slate-400" />
                                )}
                            </div>
                        </div>

                        {expanded === record.id && (
                            <div className="px-6 py-6 bg-slate-700/20 border-t border-slate-700 space-y-5 animate-slide-up">
                                <div>
                                    <h4 className="font-semibold text-slate-100 text-sm mb-3 flex items-center">
                                        <div className="w-1 h-4 gradient-bg-purple rounded-full mr-2"></div>
                                        Content
                                    </h4>
                                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                        {record.content}
                                    </p>
                                </div>

                                {record.type === 'essay' && (
                                    <>
                                        <div>
                                            <h4 className="font-semibold text-slate-100 text-sm mb-3 flex items-center">
                                                <div className="w-1 h-4 gradient-bg-blue rounded-full mr-2"></div>
                                                Your Essay
                                            </h4>
                                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                                {record.answers}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-100 text-sm mb-3 flex items-center">
                                                <div className="w-1 h-4 gradient-bg-emerald rounded-full mr-2"></div>
                                                AI Feedback
                                            </h4>
                                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                                {record.feedback}
                                            </p>
                                        </div>
                                    </>
                                )}

                                {record.type === 'reading' && (
                                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                                        <p className="text-sm italic text-slate-400">
                                            Detailed question review not available for reading tests.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {history.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700/50 mb-4">
                            <BookOpen className="w-8 h-8 text-slate-500" />
                        </div>
                        <p className="text-slate-400 mb-4">No history found.</p>
                        <p className="text-sm text-slate-500">Complete some tests to see your progress here!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Review;
