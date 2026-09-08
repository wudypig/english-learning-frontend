import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { BookOpen, PenTool, ChevronDown, ChevronUp, Award, Calendar, HelpCircle, Sparkles } from 'lucide-react';

const Review: React.FC = () => {
    const [history, setHistory] = useState<any[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [explanations, setExplanations] = useState<Record<string, string>>({});
    const [explaining, setExplaining] = useState<string | null>(null);

    useEffect(() => {
        api.get('/user/history').then(res => setHistory(res.data));
    }, []);

    const toggleExpand = (id: string) => {
        setExpanded(expanded === id ? null : id);
    };

    const explainContent = async (recordId: string, content: string) => {
        if (explanations[recordId]) return;
        setExplaining(recordId);
        try {
            const res = await api.post('/content/explain', { text: content, language: 'Chinese' });
            setExplanations(prev => ({ ...prev, [recordId]: res.data.explanation }));
        } catch {
            alert('Failed to explain.');
        } finally {
            setExplaining(null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <header>
                <h1 className="text-2xl font-semibold text-stone-900 mb-1">History Review</h1>
                <p className="text-stone-500 text-sm">Review your past tests and track your progress</p>
            </header>

            <div className="card-dark overflow-hidden">
                {history.map((record) => (
                    <div key={record.id} className="border-b border-[#F0ECE5] last:border-0">
                        {/* Row header */}
                        <div
                            onClick={() => toggleExpand(record.id)}
                            className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
                        >
                            <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                                <div className={`p-2.5 rounded-lg flex-shrink-0 ${record.type === 'essay' ? 'gradient-bg-purple' : 'gradient-bg-emerald'}`}>
                                    {record.type === 'essay'
                                        ? <PenTool className="w-4 h-4 text-white" />
                                        : <BookOpen className="w-4 h-4 text-white" />
                                    }
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-sm font-semibold text-stone-800 capitalize">{record.type}</span>
                                        <span className="text-stone-300">·</span>
                                        <span className="flex items-center text-xs text-stone-400">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(record.createdAt).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-stone-400 truncate">{record.content?.substring(0, 80)}…</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                                <div className="text-right">
                                    <p className="text-xs text-stone-400 mb-0.5">Score</p>
                                    <div className="flex items-center">
                                        <Award className="w-3.5 h-3.5 text-amber-500 mr-1" />
                                        <span className={`text-base font-bold ${
                                            Number(record.score) >= (record.type === 'essay' ? 6 : 60)
                                                ? 'text-emerald-700'
                                                : 'text-amber-600'
                                        }`}>
                                            {Number(record.score).toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                                {expanded === record.id
                                    ? <ChevronUp className="w-4 h-4 text-stone-400" />
                                    : <ChevronDown className="w-4 h-4 text-stone-400" />
                                }
                            </div>
                        </div>

                        {/* Expanded content */}
                        {expanded === record.id && (
                            <div className="px-5 py-5 bg-[#F7F4EF] border-t border-[#E2DDD6] space-y-5 animate-slide-up">
                                {/* Article */}
                                <div>
                                    <div className="flex items-center justify-between mb-2.5">
                                        <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide flex items-center">
                                            <span className="w-1 h-3.5 gradient-bg-purple rounded-full mr-2 inline-block"></span>
                                            Content
                                        </h4>
                                        <button
                                            onClick={() => explainContent(record.id, record.content)}
                                            disabled={explaining === record.id}
                                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center transition-colors"
                                        >
                                            <HelpCircle className="w-3.5 h-3.5 mr-1" />
                                            {explaining === record.id ? 'Explaining…' : 'Explain in Chinese'}
                                        </button>
                                    </div>
                                    <div className="font-reading text-stone-700 whitespace-pre-line bg-white p-4 rounded-lg border border-[#E2DDD6] text-[0.95rem]">
                                        {record.content}
                                    </div>
                                    {explanations[record.id] && (
                                        <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg animate-slide-up">
                                            <h5 className="text-xs font-semibold text-amber-700 mb-2 flex items-center">
                                                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                                Chinese Explanation
                                            </h5>
                                            <p className="text-amber-800 text-sm leading-relaxed">{explanations[record.id]}</p>
                                        </div>
                                    )}
                                </div>

                                {record.type === 'essay' && (
                                    <>
                                        <div>
                                            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2.5 flex items-center">
                                                <span className="w-1 h-3.5 gradient-bg-blue rounded-full mr-2 inline-block"></span>
                                                Your Essay
                                            </h4>
                                            <div className="font-reading text-stone-700 whitespace-pre-line bg-white p-4 rounded-lg border border-[#E2DDD6] text-[0.95rem]">
                                                {record.answers}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2.5 flex items-center">
                                                <span className="w-1 h-3.5 gradient-bg-emerald rounded-full mr-2 inline-block"></span>
                                                AI Feedback
                                            </h4>
                                            <div className="text-stone-700 text-sm leading-relaxed whitespace-pre-line bg-white p-4 rounded-lg border border-[#E2DDD6]">
                                                {record.feedback}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {record.type === 'reading' && (
                                    <div className="bg-white p-4 rounded-lg border border-[#E2DDD6]">
                                        <p className="text-xs italic text-stone-400">
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
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-stone-100 mb-4">
                            <BookOpen className="w-7 h-7 text-stone-400" />
                        </div>
                        <p className="text-stone-500 text-sm mb-1">No history found.</p>
                        <p className="text-xs text-stone-400">Complete some tests to see your progress here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Review;
