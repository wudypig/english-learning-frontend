import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { BookOpen, PenTool, ChevronDown, ChevronUp, Award, Calendar, HelpCircle, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import EssayScoreBreakdown from '../components/EssayScoreBreakdown';
import { parseEssayMetadata } from '../utils/analytics';
import type { TestRecord } from '../utils/analytics';

const Review: React.FC = () => {
    const [history, setHistory] = useState<TestRecord[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [explanations, setExplanations] = useState<Record<string, string>>({});
    const [explaining, setExplaining] = useState<string | null>(null);
    const [questionExplanations, setQuestionExplanations] = useState<Record<string, string>>({});
    const [explainingQuestion, setExplainingQuestion] = useState<string | null>(null);

    useEffect(() => {
        api.get('/user/history').then(res => setHistory(res.data));
    }, []);

    const toggleExpand = (id: string) => {
        setExpanded(expanded === id ? null : id);
    };

    const explainQuestion = async (
        key: string,
        article: string,
        question: { text: string; options: string[]; correctOptionIndex: number },
        userAnswerIdx: number
    ) => {
        if (questionExplanations[key]) return;
        setExplainingQuestion(key);
        try {
            const wrongPart = userAnswerIdx !== question.correctOptionIndex
                ? `\nMy incorrect answer: "${question.options[userAnswerIdx]}"`
                : '';
            const text = `Article (excerpt): "${article.substring(0, 600)}"\n\nQuestion: ${question.text}\nCorrect answer: "${question.options[question.correctOptionIndex]}"${wrongPart}\n\nPlease explain in Chinese why the correct answer is right, referencing the article.`;
            const res = await api.post('/content/explain', { text, language: 'Chinese' });
            setQuestionExplanations(prev => ({ ...prev, [key]: res.data.explanation }));
        } catch {
            alert('Failed to explain.');
        } finally {
            setExplainingQuestion(null);
        }
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
                                            <div className="text-stone-700 text-sm leading-relaxed whitespace-pre-line bg-white p-4 rounded-lg border border-[#E2DDD6] font-reading">
                                                {record.feedback}
                                            </div>
                                        </div>
                                        {(() => {
                                            const meta = parseEssayMetadata(record.metadata);
                                            return meta ? (
                                                <div>
                                                    <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2.5 flex items-center">
                                                        <span className="w-1 h-3.5 gradient-bg-purple rounded-full mr-2 inline-block"></span>
                                                        Score Breakdown
                                                    </h4>
                                                    <EssayScoreBreakdown metadata={meta} compact={true} />
                                                </div>
                                            ) : null;
                                        })()}
                                    </>
                                )}

                                {record.type === 'reading' && (() => {
                                    let questions: { id: number; text: string; options: string[]; correctOptionIndex: number }[] = [];
                                    let answers: Record<number, number> = {};
                                    try {
                                        questions = record.questions ? JSON.parse(record.questions) : [];
                                        answers = record.answers ? JSON.parse(record.answers) : {};
                                    } catch {
                                        // malformed stored JSON — fall through to the empty guard below
                                    }

                                    if (!questions.length) {
                                        return (
                                            <div className="bg-white p-4 rounded-lg border border-[#E2DDD6]">
                                                <p className="text-xs italic text-stone-400">
                                                    Question data not available for this record.
                                                </p>
                                            </div>
                                        );
                                    }

                                    const correctCount = questions.filter((q, idx) => answers[idx] === q.correctOptionIndex).length;
                                    const passMark = Math.ceil(questions.length / 2);

                                    return (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide flex items-center">
                                                    <span className="w-1 h-3.5 gradient-bg-emerald rounded-full mr-2 inline-block"></span>
                                                    Questions & Answers
                                                </h4>
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                    correctCount >= passMark
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {correctCount} / {questions.length} correct
                                                </span>
                                            </div>

                                            {questions.map((q, idx) => {
                                                const userAnswer: number | undefined = answers[idx];
                                                const isCorrect = userAnswer !== undefined && userAnswer === q.correctOptionIndex;
                                                const questionKey = `${record.id}-q${idx}`;

                                                return (
                                                    <div
                                                        key={q.id}
                                                        className={`bg-white rounded-lg border p-4 ${isCorrect ? 'border-emerald-200' : 'border-red-200'}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3 mb-3">
                                                            <p className="text-sm font-medium text-stone-800 leading-snug flex items-start gap-2">
                                                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold flex-shrink-0 mt-0.5 ${
                                                                    isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                    {idx + 1}
                                                                </span>
                                                                {q.text}
                                                            </p>
                                                            <button
                                                                onClick={() => explainQuestion(questionKey, record.content, q, userAnswer ?? q.correctOptionIndex)}
                                                                disabled={explainingQuestion === questionKey}
                                                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center whitespace-nowrap transition-colors flex-shrink-0 disabled:opacity-50"
                                                            >
                                                                <HelpCircle className="w-3 h-3 mr-1" />
                                                                {explainingQuestion === questionKey ? 'Explaining…' : 'Explain'}
                                                            </button>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            {q.options.map((option, optIdx) => {
                                                                const isCorrectOption = q.correctOptionIndex === optIdx;
                                                                const isUserChoice = userAnswer === optIdx;
                                                                let optionClass = 'border border-stone-200 bg-stone-50 text-stone-500';
                                                                if (isCorrectOption) {
                                                                    optionClass = 'border-2 border-emerald-400 bg-emerald-50 text-emerald-900';
                                                                } else if (isUserChoice) {
                                                                    optionClass = 'border-2 border-red-400 bg-red-50 text-red-900';
                                                                }
                                                                return (
                                                                    <div key={optIdx} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${optionClass}`}>
                                                                        <span className="font-semibold text-xs w-4 flex-shrink-0">
                                                                            {String.fromCharCode(65 + optIdx)}.
                                                                        </span>
                                                                        <span className="flex-1">{option}</span>
                                                                        {isCorrectOption && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                                                                        {isUserChoice && !isCorrectOption && <XCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {questionExplanations[questionKey] && (
                                                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg animate-slide-up">
                                                                <h6 className="text-xs font-semibold text-amber-700 mb-1.5 flex items-center">
                                                                    <Sparkles className="w-3 h-3 mr-1.5" />
                                                                    Chinese Explanation
                                                                </h6>
                                                                <p className="text-amber-800 text-xs leading-relaxed">{questionExplanations[questionKey]}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
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
