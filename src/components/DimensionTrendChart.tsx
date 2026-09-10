import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DailyDimensionData, DimensionKey } from '../utils/analytics';

interface DimensionTrendChartProps {
    data: DailyDimensionData[];
}

type TimePeriod = '7d' | '14d' | '30d' | 'all';

const DIMENSION_LINES: { key: DimensionKey; label: string; color: string }[] = [
    { key: 'grammar',       label: 'Grammar',       color: '#1D4ED8' },
    { key: 'vocabulary',    label: 'Vocabulary',    color: '#047857' },
    { key: 'coherence',     label: 'Coherence',     color: '#B45309' },
    { key: 'relevance',     label: 'Relevance',     color: '#7C3AED' },
    { key: 'argumentation', label: 'Argumentation', color: '#BE185D' },
    { key: 'mechanics',     label: 'Mechanics',     color: '#0369A1' },
];

const PERIODS: { value: TimePeriod; label: string }[] = [
    { value: '7d',  label: '7 Days' },
    { value: '14d', label: '14 Days' },
    { value: '30d', label: '30 Days' },
    { value: 'all', label: 'All Time' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="card-dark p-3 shadow-lg text-sm">
                <p className="text-stone-500 font-medium mb-1.5">
                    {new Date(label).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                    })}
                </p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4">
                        <span style={{ color: entry.color }}>{entry.name}:</span>
                        <span className="font-bold text-stone-800">{entry.value.toFixed(1)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const DimensionTrendChart: React.FC<DimensionTrendChartProps> = ({ data }) => {
    const [period, setPeriod] = useState<TimePeriod>('30d');

    const filteredData = React.useMemo(() => {
        if (period === 'all') return data;
        const days = period === '7d' ? 7 : period === '14d' ? 14 : 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
        return data.filter(item => item.date >= cutoffDateStr);
    }, [data, period]);

    if (data.length === 0) {
        return (
            <div className="card-dark p-8 text-center animate-fade-in">
                <p className="text-[#A8A29E] text-sm font-body">
                    No breakdown data yet. Complete an essay to see dimension trends.
                </p>
            </div>
        );
    }

    return (
        <div className="card-dark p-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h3 className="text-base font-semibold text-stone-800 font-body">Essay Dimension Trends</h3>
                <div className="flex flex-wrap gap-1.5">
                    {PERIODS.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap font-body ${
                                period === p.value
                                    ? 'bg-blue-700 text-white shadow-sm'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {filteredData.length === 0 ? (
                <p className="text-[#A8A29E] text-sm text-center py-8 font-body">
                    No data available for the selected period.
                </p>
            ) : (
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={filteredData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE5" />
                        <XAxis
                            dataKey="date"
                            stroke="#E2DDD6"
                            tick={{ fill: '#A8A29E', fontSize: 11 }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getMonth() + 1}/${date.getDate()}`;
                            }}
                        />
                        <YAxis
                            stroke="#E2DDD6"
                            tick={{ fill: '#A8A29E', fontSize: 11 }}
                            domain={[0, 10]}
                            ticks={[0, 2, 4, 6, 8, 10]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ color: '#78716C', fontSize: '13px' }}
                            iconType="line"
                        />
                        {DIMENSION_LINES.map(({ key, label, color }) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={color}
                                strokeWidth={2}
                                name={label}
                                dot={false}
                                activeDot={{ r: 4, fill: color }}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default DimensionTrendChart;
