import React, { useState } from 'react';
import api from '../lib/api';
import { FileText, Send, RefreshCw, HelpCircle, AlertCircle, Sparkles, Award } from 'lucide-react';

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
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 mb-2">Essay Writing</h1>
                    <p className="text-slate-400">Practice your writing skills with AI-generated topics</p>
                </div>
                <button
                    onClick={startNew}
                    disabled={loading}
                    className="btn-gradient-purple flex items-center"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Generating...' : (article ? 'New Topic' : 'Start Writing')}
                </button>
            </header>

            {error && (
                <div className="card-dark border-red-500/50 bg-red-500/10 p-4 flex items-start animate-slide-up">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-red-400">{error}</span>
                </div>
            )}

            {!article && !loading && !error && (
                <div className="text-center py-20 card-dark border-dashed">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-bg-purple mb-6 glow-purple">
                        <FileText className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-100 mb-2">Ready to Start?</h3>
                    <p className="text-slate-400 mb-6">Click "Start Writing" to generate your first topic</p>
                </div>
            )}

            {article && (
                <div className="space-y-6">
                    {/* Article Card */}
                    <div className="card-dark p-6 animate-scale-in">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-lg gradient-bg-purple flex items-center justify-center mr-3">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-100">Topic Article</h3>
                            </div>
                            {result && (
                                <button
                                    onClick={explainArticle}
                                    disabled={explaining}
                                    className="text-sm text-violet-400 hover:text-violet-300 flex items-center transition-colors"
                                >
                                    <HelpCircle className="w-4 h-4 mr-1" />
                                    {explaining ? 'Explaining...' : 'Explain in Chinese'}
                                </button>
                            )}
                        </div>
                        <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-line">
                            {article}
                        </div>
                        {explanation && (
                            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg animate-slide-up">
                                <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Chinese Explanation
                                </h4>
                                <p className="text-amber-200/90 text-sm leading-relaxed">{explanation}</p>
                            </div>
                        )}
                    </div>

                    {/* Essay Writing Section */}
                    {!result && (
                        <div className="card-dark p-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                            <h3 className="text-xl font-bold text-slate-100 mb-4">Your Essay</h3>
                            <textarea
                                value={essay}
                                onChange={(e) => setEssay(e.target.value)}
                                placeholder="Write your essay here..."
                                className="textarea-dark min-h-[300px]"
                            />
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={submitEssay}
                                    disabled={loading || !essay.trim()}
                                    className="btn-gradient-emerald flex items-center"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {loading ? 'Grading...' : 'Submit Essay'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Feedback Card */}
                    {result && (
                        <div className="card-dark p-6 animate-scale-in overflow-hidden relative" style={{ animationDelay: '0.1s' }}>
                            {/* Decorative gradient */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-pink-500/10 rounded-full blur-3xl"></div>

                            <div className="relative">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-xl gradient-bg-purple flex items-center justify-center mr-3">
                                            <Award className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-100">Your Result</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-400 mb-1">Score</p>
                                        <p className="text-4xl font-bold gradient-text-purple">
                                            {result.score.toFixed(1)}
                                            <span className="text-lg text-slate-400 ml-1">/10</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-700/30 rounded-lg p-5 border border-slate-600/50">
                                    <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                                        <Sparkles className="w-4 h-4 mr-2 text-violet-400" />
                                        AI Feedback
                                    </h4>
                                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                                        {result.feedback}
                                    </p>
                                </div>

                                <button
                                    onClick={startNew}
                                    className="mt-6 w-full py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-100 rounded-lg font-medium transition-colors border border-slate-600"
                                >
                                    Try Another Topic
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Essay;
