import React, { useState } from 'react';
import api from '../lib/api';
import { BookOpen, CheckCircle, XCircle, AlertCircle, Award } from 'lucide-react';

const Reading: React.FC = () => {
    const [test, setTest] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [score, setScore] = useState(0);

    const startTest = async () => {
        setLoading(true);
        setTest(null);
        setAnswers({});
        setSubmitted(false);
        setError('');
        try {
            const res = await api.post('/content/reading/generate');
            setTest(res.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate test.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (questionId: number, optionIndex: number) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const submitTest = async () => {
        if (Object.keys(answers).length < test.questions.length) {
            alert('Please answer all questions');
            return;
        }

        let correctCount = 0;
        test.questions.forEach((q: any, idx: number) => {
            if (answers[idx] === q.correctOptionIndex) correctCount++;
        });

        const calculatedScore = (correctCount / test.questions.length) * 100;
        setScore(calculatedScore);

        setLoading(true);
        try {
            await api.post('/submit/reading', {
                article: test.article,
                questions: test.questions,
                answers,
                score: calculatedScore,
            });
            setSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit result.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-stone-900 mb-1">Reading Test</h1>
                    <p className="text-stone-500 text-sm">Test your comprehension with AI-generated articles</p>
                </div>
                <button
                    onClick={startTest}
                    disabled={loading}
                    className="btn-gradient-emerald flex items-center"
                >
                    <BookOpen className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Generating…' : (test ? 'New Test' : 'Start Test')}
                </button>
            </header>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start animate-slide-up">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-red-700 text-sm">{error}</span>
                </div>
            )}

            {/* Empty state */}
            {!test && !loading && !error && (
                <div className="text-center py-20 card-dark border-dashed">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-bg-emerald mb-5 glow-emerald">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-stone-800 mb-1.5">Ready to Test Your Skills?</h3>
                    <p className="text-stone-500 text-sm">Click "Start Test" to begin your reading comprehension test</p>
                </div>
            )}

            {test && (
                <div className="space-y-5">
                    {/* Article */}
                    <div className="card-dark p-6 animate-scale-in">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 rounded-lg gradient-bg-emerald flex items-center justify-center mr-3">
                                <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-base font-semibold text-stone-800">Article</h3>
                        </div>
                        {/* Reading-optimized article text */}
                        <div className="font-reading text-stone-800 whitespace-pre-line">
                            {test.article}
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="card-dark p-6 animate-scale-in" style={{ animationDelay: '0.05s' }}>
                        <h3 className="text-base font-semibold text-stone-800 mb-5">Questions</h3>
                        <div className="space-y-7">
                            {test.questions.map((q: any, idx: number) => (
                                <div key={idx}>
                                    <p className="font-medium text-stone-800 mb-3 leading-snug">
                                        {idx + 1}. {q.text}
                                    </p>
                                    <div className="space-y-2">
                                        {q.options.map((opt: string, optIdx: number) => {
                                            const isSelected = answers[idx] === optIdx;
                                            const isCorrect = q.correctOptionIndex === optIdx;

                                            let cls = 'border border-[#E2DDD6] bg-white text-stone-700 hover:bg-stone-50 cursor-pointer';
                                            let icon = null;

                                            if (submitted) {
                                                if (isCorrect) {
                                                    cls = 'border-2 border-emerald-400 bg-emerald-50 text-emerald-900 cursor-default';
                                                    icon = <CheckCircle className="w-4 h-4 text-emerald-600 ml-auto flex-shrink-0" />;
                                                } else if (isSelected && !isCorrect) {
                                                    cls = 'border-2 border-red-400 bg-red-50 text-red-900 cursor-default';
                                                    icon = <XCircle className="w-4 h-4 text-red-500 ml-auto flex-shrink-0" />;
                                                } else {
                                                    cls = 'border border-[#E2DDD6] bg-white text-stone-400 opacity-50 cursor-default';
                                                }
                                            } else if (isSelected) {
                                                cls = 'border-2 border-blue-500 bg-blue-50 text-blue-900 cursor-pointer';
                                            }

                                            return (
                                                <div
                                                    key={optIdx}
                                                    onClick={() => handleSelect(idx, optIdx)}
                                                    className={`flex items-center p-3.5 rounded-lg transition-all ${cls}`}
                                                >
                                                    <span className="text-sm font-semibold w-6 flex-shrink-0 text-stone-400">
                                                        {String.fromCharCode(65 + optIdx)}.
                                                    </span>
                                                    <span className="ml-2 text-sm flex-1 leading-snug">{opt}</span>
                                                    {icon}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Submit / Result */}
                        {!submitted ? (
                            <div className="mt-7 flex justify-end">
                                <button
                                    onClick={submitTest}
                                    disabled={loading || Object.keys(answers).length < test.questions.length}
                                    className="btn-gradient-blue"
                                >
                                    Submit Answers
                                </button>
                            </div>
                        ) : (
                            <div className="mt-7 p-6 bg-emerald-50 border border-emerald-200 rounded-lg text-center animate-scale-in">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full gradient-bg-emerald mb-3 glow-emerald">
                                    <Award className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-stone-900 mb-1">Test Completed!</h3>
                                <p className="text-stone-600 mb-4">
                                    You scored{' '}
                                    <span className="text-2xl font-bold text-[#047857]">{score.toFixed(0)}%</span>
                                </p>
                                <button
                                    onClick={startTest}
                                    className="px-5 py-2 bg-white hover:bg-stone-50 text-stone-700 rounded-lg text-sm font-medium transition-colors border border-[#E2DDD6]"
                                >
                                    Take Another Test
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reading;
