import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { BookOpen, PenTool, ChevronDown, ChevronUp } from 'lucide-react';

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
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">History Review</h1>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {history.map((record) => (
                    <div key={record.id} className="border-b border-gray-100 last:border-0">
                        <div
                            onClick={() => toggleExpand(record.id)}
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-lg ${record.type === 'essay' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                    {record.type === 'essay' ? <PenTool className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold text-gray-900 capitalize">{record.type}</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-sm text-gray-500">{new Date(record.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate w-64 md:w-96">{record.content?.substring(0, 100)}...</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">Score</p>
                                    <p className={`text-lg font-bold ${Number(record.score) >= (record.type === 'essay' ? 6 : 60) ? 'text-green-600' : 'text-orange-600'}`}>
                                        {Number(record.score).toFixed(1)}
                                    </p>
                                </div>
                                {expanded === record.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                            </div>
                        </div>

                        {expanded === record.id && (
                            <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm mb-2">Content</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-white p-3 rounded border border-gray-200">
                                        {record.content}
                                    </p>
                                </div>

                                {record.type === 'essay' && (
                                    <>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm mb-2">Your Essay</h4>
                                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-white p-3 rounded border border-gray-200">
                                                {record.answers}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm mb-2">Feedback</h4>
                                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-white p-3 rounded border border-gray-200">
                                                {record.feedback}
                                            </p>
                                        </div>
                                    </>
                                )}

                                {record.type === 'reading' && (
                                    <div>
                                        {/* We could reconstruct the reading test view here if we parsed the 'questions' JSON, 
                                            but let's keep it simple for now or parsing questions if stored as JSON string */}
                                        <p className="text-sm italic text-gray-500">Detailed question review not implemented in this view version.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {history.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No history found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Review;
