import React, { useState } from 'react';
import api from '../lib/api';
import { BookOpen, CheckCircle, XCircle, HelpCircle, AlertCircle } from 'lucide-react';

const Reading: React.FC = () => {
    const [test, setTest] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [explaining, setExplaining] = useState(false);
    const [explanation, setExplanation] = useState('');
    const [score, setScore] = useState(0);

    const startTest = async () => {
        setLoading(true);
        setTest(null);
        setAnswers({});
        setSubmitted(false);
        setExplanation('');
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

        // Calculate score locally for immediate feedback (or backend can do it)
        let correctCount = 0;
        test.questions.forEach((q: any, idx: number) => {
            // q.correctOptionIndex comes from backend (assuming it is sent, if not we need verify endpoint)
            // In content.ts I generate JSON with correctOptionIndex.
            if (answers[idx] === q.correctOptionIndex) {
                correctCount++;
            }
        });

        // Pass/Fail score? usually percentage or raw. 10.0 scale?
        // Guidelines say score from 1.0 to 10.0 for Essay, Reading test pass/fail?
        // "must select the right one to get passed"
        // Let's settle on a score out of 100 or 10.
        // Let's use 100.
        const calculatedScore = (correctCount / test.questions.length) * 100;
        setScore(calculatedScore);

        setLoading(true);
        try {
            await api.post('/submit/reading', {
                article: test.article,
                questions: test.questions,
                answers: answers, // Note: sending indices
                score: calculatedScore
            });
            setSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit result.');
        } finally {
            setLoading(false);
        }
    };

    const explainArticle = async () => {
        if (!test?.article) return;
        setExplaining(true);
        try {
            const res = await api.post('/content/explain', { text: test.article, language: 'Chinese' });
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
                <h1 className="text-2xl font-bold text-gray-900">Reading Test</h1>
                <button
                    onClick={startTest}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <BookOpen className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Generating...' : (test ? 'New Test' : 'Start Test')}
                </button>
            </header>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            {!test && !loading && !error && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Click "Start Test" to begin.</p>
                </div>
            )}

            {test && (
                <div className="grid grid-cols-1 gap-6">
                    {/* Article Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-gray-700">Article</h3>
                            <button
                                onClick={explainArticle}
                                disabled={explaining}
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                                <HelpCircle className="w-4 h-4 mr-1" />
                                {explaining ? 'Explaining...' : 'Explain in Chinese'}
                            </button>
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                            {test.article}
                        </div>
                        {explanation && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800 border border-yellow-100">
                                <h4 className="font-bold mb-1">Explanation:</h4>
                                {explanation}
                            </div>
                        )}
                    </div>

                    {/* Questions Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-700 mb-6">Questions</h3>
                        <div className="space-y-8">
                            {test.questions.map((q: any, idx: number) => (
                                <div key={idx} className="space-y-3">
                                    <p className="font-medium text-gray-900">{idx + 1}. {q.text}</p>
                                    <div className="space-y-2 pl-4">
                                        {q.options.map((opt: string, optIdx: number) => {
                                            const isSelected = answers[idx] === optIdx;
                                            const isCorrect = q.correctOptionIndex === optIdx;
                                            let optionClass = "border-gray-200 hover:bg-gray-50";
                                            let icon = null;

                                            if (submitted) {
                                                if (isCorrect) {
                                                    optionClass = "bg-green-50 border-green-200 text-green-700";
                                                    icon = <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />;
                                                } else if (isSelected && !isCorrect) {
                                                    optionClass = "bg-red-50 border-red-200 text-red-700";
                                                    icon = <XCircle className="w-4 h-4 text-red-600 ml-auto" />;
                                                } else {
                                                    optionClass = "opacity-50";
                                                }
                                            } else if (isSelected) {
                                                optionClass = "bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-500";
                                            }

                                            return (
                                                <div
                                                    key={optIdx}
                                                    onClick={() => handleSelect(idx, optIdx)}
                                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${optionClass}`}
                                                >
                                                    <span className="text-sm">{String.fromCharCode(65 + optIdx)}. {opt}</span>
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
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Submit Answers
                                </button>
                            </div>
                        ) : (
                            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
                                <h3 className="text-lg font-bold mb-2">Test Completed</h3>
                                <p className="text-gray-600">You scored <span className="font-bold text-gray-900">{score.toFixed(0)}%</span></p>
                                <button
                                    onClick={startTest}
                                    className="mt-3 text-blue-600 font-medium hover:underline"
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
