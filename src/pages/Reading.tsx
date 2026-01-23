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
            if (answers[idx] === q.correctOptionIndex) {
                correctCount++;
            }
        });

        const calculatedScore = (correctCount / test.questions.length) * 100;
        setScore(calculatedScore);

        setLoading(true);
        try {
            await api.post('/submit/reading', {
                article: test.article,
                questions: test.questions,
                answers: answers,
                score: calculatedScore
            });
            setSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit result.');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 mb-2">Reading Test</h1>
                    <p className="text-slate-400">Test your comprehension with AI-generated articles</p>
                </div>
                <button
                    onClick={startTest}
                    disabled={loading}
                    className="btn-gradient-emerald flex items-center"
                >
                    <BookOpen className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Generating...' : (test ? 'New Test' : 'Start Test')}
                </button>
            </header>

            {error && (
                <div className="card-dark border-red-500/50 bg-red-500/10 p-4 flex items-start animate-slide-up">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-red-400">{error}</span>
                </div>
            )}

            {!test && !loading && !error && (
                <div className="text-center py-20 card-dark border-dashed">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-bg-emerald mb-6 glow-emerald">
                        <BookOpen className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-100 mb-2">Ready to Test Your Skills?</h3>
                    <p className="text-slate-400 mb-6">Click "Start Test" to begin your reading comprehension test</p>
                </div>
            )}

            {test && (
                <div className="space-y-6">
                    {/* Article Section */}
                    <div className="card-dark p-6 animate-scale-in">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-lg gradient-bg-emerald flex items-center justify-center mr-3">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-100">Article</h3>
                        </div>
                        <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-line">
                            {test.article}
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="card-dark p-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                        <h3 className="text-xl font-bold text-slate-100 mb-6">Questions</h3>
                        <div className="space-y-8">
                            {test.questions.map((q: any, idx: number) => (
                                <div key={idx} className="space-y-3">
                                    <p className="font-semibold text-slate-100 text-lg">
                                        {idx + 1}. {q.text}
                                    </p>
                                    <div className="space-y-2 pl-2">
                                        {q.options.map((opt: string, optIdx: number) => {
                                            const isSelected = answers[idx] === optIdx;
                                            const isCorrect = q.correctOptionIndex === optIdx;
                                            let optionClass = "border-slate-600 bg-slate-700/30 hover:bg-slate-700/50 text-slate-300";
                                            let icon = null;

                                            if (submitted) {
                                                if (isCorrect) {
                                                    optionClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300";
                                                    icon = <CheckCircle className="w-5 h-5 text-emerald-400 ml-auto" />;
                                                } else if (isSelected && !isCorrect) {
                                                    optionClass = "bg-red-500/20 border-red-500/50 text-red-300";
                                                    icon = <XCircle className="w-5 h-5 text-red-400 ml-auto" />;
                                                } else {
                                                    optionClass = "opacity-50 border-slate-700";
                                                }
                                            } else if (isSelected) {
                                                optionClass = "bg-violet-500/20 border-violet-500/50 text-violet-200 ring-2 ring-violet-500/30";
                                            }

                                            return (
                                                <div
                                                    key={optIdx}
                                                    onClick={() => handleSelect(idx, optIdx)}
                                                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${optionClass} ${!submitted ? 'hover:scale-[1.02]' : ''}`}
                                                >
                                                    <span className="font-medium text-sm">
                                                        {String.fromCharCode(65 + optIdx)}.
                                                    </span>
                                                    <span className="ml-3 flex-1">{opt}</span>
                                                    {icon}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!submitted ? (
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={submitTest}
                                    disabled={loading || Object.keys(answers).length < test.questions.length}
                                    className="btn-gradient-blue"
                                >
                                    Submit Answers
                                </button>
                            </div>
                        ) : (
                            <div className="mt-8 card-dark bg-slate-700/30 p-6 text-center border-slate-600 relative overflow-hidden">
                                {/* Decorative gradient */}
                                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"></div>

                                <div className="relative">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-bg-emerald mb-4 glow-emerald">
                                        <Award className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-100 mb-2">Test Completed!</h3>
                                    <p className="text-slate-300 mb-4">
                                        You scored <span className="text-3xl font-bold gradient-text-emerald">{score.toFixed(0)}%</span>
                                    </p>
                                    <button
                                        onClick={startTest}
                                        className="mt-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg font-medium transition-colors"
                                    >
                                        Take Another Test
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reading;
