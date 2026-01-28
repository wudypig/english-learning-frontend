import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DailyData } from '../utils/analytics';

interface PerformanceChartProps {
    data: DailyData[];
}

type TimePeriod = '7d' | '14d' | '30d' | 'all';

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
    const [period, setPeriod] = useState<TimePeriod>('30d');

    // Filter data based on selected period
    const filteredData = React.useMemo(() => {
        if (period === 'all') return data;

        const days = period === '7d' ? 7 : period === '14d' ? 14 : 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

        return data.filter(item => item.date >= cutoffDateStr);
    }, [data, period]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="card-dark p-4 shadow-xl border border-slate-600">
                    <p className="text-slate-300 font-medium mb-2">
                        {new Date(label).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <span className="text-sm" style={{ color: entry.color }}>
                                {entry.name}:
                            </span>
                            <span className="font-bold text-slate-100">
                                {entry.value !== null ? entry.value.toFixed(1) : 'N/A'}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const periods: { value: TimePeriod; label: string }[] = [
        { value: '7d', label: '7 Days' },
        { value: '14d', label: '14 Days' },
        { value: '30d', label: '30 Days' },
        { value: 'all', label: 'All Time' },
    ];

    if (filteredData.length === 0) {
        return (
            <div className="card-dark p-8 text-center">
                <p className="text-slate-400">No data available for the selected period</p>
            </div>
        );
    }

    return (
        <div className="card-dark p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold text-slate-100">Performance Trends</h3>
                <div className="flex flex-wrap gap-2">
                    {periods.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${period === p.value
                                    ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg'
                                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filteredData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                        dataKey="date"
                        stroke="#94A3B8"
                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                    />
                    <YAxis
                        stroke="#94A3B8"
                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                        domain={[0, 10]}
                        ticks={[0, 2, 4, 6, 8, 10]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ color: '#94A3B8' }}
                        iconType="line"
                    />
                    <Line
                        type="monotone"
                        dataKey="essayAvg"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        name="Essay Score"
                        dot={{ fill: '#8B5CF6', r: 4 }}
                        activeDot={{ r: 6, fill: '#EC4899' }}
                        connectNulls
                    />
                    <Line
                        type="monotone"
                        dataKey="readingAvg"
                        stroke="#10B981"
                        strokeWidth={3}
                        name="Reading Score"
                        dot={{ fill: '#10B981', r: 4 }}
                        activeDot={{ r: 6, fill: '#14B8A6' }}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>

            <p className="text-xs text-slate-500 mt-4 text-center">
                Reading scores normalized to 0-10 scale for comparison
            </p>
        </div>
    );
};

export default PerformanceChart;
