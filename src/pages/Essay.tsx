import React, { useState } from 'react';
import api from '../lib/api';
import { FileText, Send, RefreshCw, HelpCircle, AlertCircle, Sparkles, Award } from 'lucide-react';
import EssayScoreBreakdown from '../components/EssayScoreBreakdown';
import { parseEssayMetadata } from '../utils/analytics';
import type { TestRecord } from '../utils/analytics';

const Essay: React.FC = () => {
    const [article, setArticle] = useState('');
    const [essay, setEssay] = useState('');
    const [result, setResult] = useState<TestRecord | null>(null);
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
        } catch {
            alert('Failed to explain.');
        } finally {
            setExplaining(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-stone-900 mb-1">Essay Writing</h1>
                    <p className="text-stone-500 text-sm">Practice your writing with AI-generated topics</p>
                </div>
                <button
                    onClick={startNew}
                    disabled={loading}
                    className="btn-gradient-purple flex items-center"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Generating…' : (article ? 'New Topic' : 'Start Writing')}
                </button>
            </header>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start animate-slide-up">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-red-700 text-sm">{error}</span>
                </div>
            )}

            {/* Empty state */}
            {!article && !loading && !error && (
                <div className="text-center py-20 card-dark border-dashed">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-bg-purple mb-5 glow-purple">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-stone-800 mb-1.5">Ready to Start?</h3>
                    <p className="text-stone-500 text-sm">Click "Start Writing" to generate your first topic</p>
                </div>
            )}

            {article && (
                <div className="space-y-5">
                    {/* Topic Article */}
                    <div className="card-dark p-6 animate-scale-in">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-lg gradient-bg-purple flex items-center justify-center mr-3">
                                    <FileText className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-base font-semibold text-stone-800">Topic Article</h3>
                            </div>
                            {result && (
                                <button
                                    onClick={explainArticle}
                                    disabled={explaining}
                                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center transition-colors"
                                >
                                    <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                                    {explaining ? 'Explaining…' : 'Explain in Chinese'}
                                </button>
                            )}
                        </div>

                        {/* Article body in reading font */}
                        <div className="font-reading text-stone-800 whitespace-pre-line">
                            {article}
                        </div>

                        {explanation && (
                            <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-lg animate-slide-up">
                                <h4 className="text-sm font-semibold text-amber-700 mb-2 flex items-center">
                                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                    Chinese Explanation
                                </h4>
                                <p className="text-amber-800 text-sm leading-relaxed">{explanation}</p>
                            </div>
                        )}
                    </div>

                    {/* Essay Textarea */}
                    {!result && (
                        <div className="card-dark p-6 animate-scale-in" style={{ animationDelay: '0.05s' }}>
                            <h3 className="text-base font-semibold text-stone-800 mb-3">Your Essay</h3>
                            <textarea
                                value={essay}
                                onChange={(e) => setEssay(e.target.value)}
                                placeholder="Write your essay here…"
                                className="textarea-dark min-h-[280px]"
                            />
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-xs text-stone-400">
                                    {essay.trim().split(/\s+/).filter(Boolean).length} words
                                </p>
                                <button
                                    onClick={submitEssay}
                                    disabled={loading || !essay.trim()}
                                    className="btn-gradient-emerald"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {loading ? 'Grading…' : 'Submit Essay'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Feedback */}
                    {result && (
                        <div className="card-dark p-6 animate-scale-in" style={{ animationDelay: '0.05s' }}>
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center">
                                    <div className="w-9 h-9 rounded-lg gradient-bg-purple flex items-center justify-center mr-3">
                                        <Award className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-base font-semibold text-stone-800">Your Result</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-stone-400 mb-0.5">Overall Score</p>
                                    <p className="text-3xl font-bold text-[#1D4ED8]">
                                        {result.score?.toFixed(1) ?? '—'}
                                        <span className="text-base font-normal text-stone-400 ml-1">/10</span>
                                    </p>
                                </div>
                            </div>

                            {parseEssayMetadata(result.metadata) && (
                                <div className="mb-5">
                                    <EssayScoreBreakdown metadata={parseEssayMetadata(result.metadata)!} />
                                </div>
                            )}

                            <div className="bg-[#F7F4EF] rounded-lg p-5 border border-[#E2DDD6]">
                                <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3 flex items-center">
                                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#1D4ED8]" />
                                    AI Feedback
                                </h4>
                                <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line font-reading">
                                    {result.feedback}
                                </p>
                            </div>

                            <button
                                onClick={startNew}
                                className="mt-5 w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-sm font-medium transition-colors border border-[#E2DDD6]"
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
