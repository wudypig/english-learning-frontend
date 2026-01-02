import React, { useState } from 'react';
import api from '../lib/api';
import { FileText, Send, RefreshCw, HelpCircle, AlertCircle } from 'lucide-react';

const Essay: React.FC = () => {
    const [article, setArticle] = useState('');
    const [essay, setEssay] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [explaining, setExplaining] = useState(false);
    const [explanation, setExplanation] = useState('');
    const [error, setError] = useState('');

    const startNew = async () => {
        setLoading(true);
        setArticle('');
        setEssay('');
        setResult(null);
        setExplanation('');
        setError('');
        try {
            const res = await api.post('/content/essay/generate');
            setArticle(res.data.article);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate topic.');
        } finally {
            setLoading(false);
        }
    };

    const submitEssay = async () => {
        if (!essay.trim()) return;
        setLoading(true);
        try {
            const res = await api.post('/submit/essay', { article, essay });
            setResult(res.data.record);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit essay.');
        } finally {
            setLoading(false);
        }
    };

    const explainArticle = async () => {
        if (!article) return;
        setExplaining(true);
        try {
            const res = await api.post('/content/explain', { text: article, language: 'Chinese' });
            setExplanation(res.data.explanation);
        } catch (err) {
            alert('Failed to explain.');
        } finally {
            setExplaining(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Essay Writing</h1>
                <button
                    onClick={startNew}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading && !article ? 'animate-spin' : ''}`} />
                    {article ? 'New Topic' : 'Start Writing'}
                </button>
            </header>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            {!article && !loading && !error && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Click "Start Writing" to generate a topic.</p>
                </div>
            )}

            {article && (
                <div className="space-y-6">
                    {/* Row 1: Article */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-gray-700">Topic Article</h3>
                            {result && (
                                <button
                                    onClick={explainArticle}
                                    disabled={explaining}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                    <HelpCircle className="w-4 h-4 mr-1" />
                                    {explaining ? 'Explaining...' : 'Explain in Chinese'}
                                </button>
                            )}
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
                            {article}
                        </div>
                        {explanation && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800 border border-yellow-100">
                                <h4 className="font-bold mb-1">Explanation:</h4>
                                {explanation}
                            </div>
                        )}
                    </div>

                    {/* Row 2: Answer Section */}
                    {!result && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-700 mb-4">Your Essay</h3>
                            <textarea
                                value={essay}
                                onChange={(e) => setEssay(e.target.value)}
                                placeholder="Write your essay here..."
                                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[300px]"
                            />
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={submitEssay}
                                    disabled={loading || !essay.trim()}
                                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {loading ? 'Grading...' : 'Submit Essay'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Row 3: Feedback */}
                    {result && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900">Result</h3>
                                <div className="text-2xl font-bold text-blue-600">
                                    {result.score.toFixed(1)} <span className="text-sm text-gray-400 font-normal">/ 10</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Feedback</h4>
                                    <p className="text-gray-600 text-sm whitespace-pre-line bg-gray-50 p-3 rounded-lg">
                                        {result.feedback}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={startNew}
                                className="mt-6 w-full py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium"
                            >
                                Try Another Topic
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Essay;
