import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import type { EssayMetadata } from '../utils/analytics';

interface EssayScoreBreakdownProps {
    metadata: EssayMetadata;
    compact?: boolean;
}

const SCORE_THEME = (s: number) =>
    s >= 8 ? { text: 'text-[#047857]', bg: 'bg-[#047857]' }
    : s >= 6 ? { text: 'text-[#B45309]', bg: 'bg-[#B45309]' }
    :           { text: 'text-[#B91C1C]', bg: 'bg-[#B91C1C]' };

const DIMENSION_LABELS: { key: keyof EssayMetadata['scores']; label: string }[] = [
    { key: 'grammar',       label: 'Grammar' },
    { key: 'vocabulary',    label: 'Vocabulary' },
    { key: 'coherence',     label: 'Coherence' },
    { key: 'relevance',     label: 'Relevance' },
    { key: 'argumentation', label: 'Argumentation' },
    { key: 'mechanics',     label: 'Mechanics' },
];

const TAG_GROUPS = [
    { label: 'Strengths',  labelColor: 'text-[#047857]', tagClass: 'bg-emerald-50 border border-emerald-200 text-[#047857]', key: 'strengths'  as const },
    { label: 'Weaknesses', labelColor: 'text-[#B91C1C]', tagClass: 'bg-red-50 border border-red-200 text-[#B91C1C]',         key: 'weaknesses' as const },
];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; payload: { dimension: string } }[] }) => {
    if (active && payload && payload.length) {
        return (
            <div className="card-dark p-3 shadow-lg text-sm">
                <p className="text-[#78716C] font-medium mb-1">{payload[0].payload.dimension}</p>
                <p className="font-bold text-[#1C1917]">{payload[0].value} / 10</p>
            </div>
        );
    }
    return null;
};

export default function EssayScoreBreakdown({ metadata, compact = false }: EssayScoreBreakdownProps) {
    return (
        <div className="animate-slide-up space-y-4">
            {/* Section 1 — Radar chart */}
            {!compact && (
                <ResponsiveContainer width="100%" height={260}>
                    <RadarChart
                        data={DIMENSION_LABELS.map(({ key, label }) => ({ dimension: label, score: metadata.scores[key] ?? 0 }))}
                        margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                    >
                        <PolarGrid stroke="#E2DDD6" />
                        <PolarAngleAxis
                            dataKey="dimension"
                            tick={{ fill: '#78716C', fontSize: 12, fontFamily: 'DM Sans' }}
                        />
                        <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                        <Radar
                            dataKey="score"
                            fill="#1D4ED8"
                            fillOpacity={0.15}
                            stroke="#1D4ED8"
                            strokeWidth={2}
                        />
                        <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                </ResponsiveContainer>
            )}

            {/* Section 2 — Score cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DIMENSION_LABELS.map(({ key, label }) => {
                    const score = metadata.scores[key] ?? 0;
                    const theme = SCORE_THEME(score);
                    return (
                        <div key={key} className="card-dark p-4">
                            <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wide font-body mb-1">
                                {label}
                            </p>
                            <p className={`text-2xl font-bold font-body ${theme.text}`}>
                                {score.toFixed(1)}
                            </p>
                            <div className="h-1.5 rounded-full bg-[#E2DDD6] mt-2">
                                <div
                                    className={`h-full rounded-full ${theme.bg}`}
                                    style={{ width: `${(score / 10) * 100}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Section 3 — Strengths and weaknesses */}
            <div className="space-y-3">
                {TAG_GROUPS.map(({ label, labelColor, tagClass, key }) =>
                    metadata[key].length > 0 ? (
                        <div key={key}>
                            <p className={`text-xs font-semibold ${labelColor} uppercase tracking-wide mb-1.5 font-body`}>
                                {label}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {metadata[key].map((item) => (
                                    <span key={item} className={`${tagClass} text-xs px-2.5 py-1 rounded-full font-body`}>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : null
                )}
            </div>

            {/* Section 4 — Improvement tips */}
            {metadata.improvement_tips.length > 0 && (
                <div className="p-4 rounded-lg border border-[#E2DDD6] bg-[#F0ECE5]">
                    <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wide mb-3 font-body">
                        Improvement Tips
                    </p>
                    <ol className="space-y-2 list-decimal list-inside">
                        {metadata.improvement_tips.map((tip) => (
                            <li key={tip} className="text-sm text-[#1C1917] leading-relaxed font-reading">
                                {tip}
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}
