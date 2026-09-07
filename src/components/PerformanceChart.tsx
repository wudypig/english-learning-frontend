import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DailyData } from '../utils/analytics';

interface PerformanceChartProps {
    data: DailyData[];
}

type TimePeriod = '7d' | '14d' | '30d' | 'all';

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
    const [period, setPeriod] = useState<TimePeriod>('30d');

    const filteredData = React.useMemo(() => {
        if (period === 'all') return data;
        const days = period === '7d' ? 7 : period === '14d' ? 14 : 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
        return data.filter(item => item.date >= cutoffDateStr);
    }, [data, period]);

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
                            <span className="font-bold text-stone-800">
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
        { value: '7d',  label: '7 Days' },
        { value: '14d', label: '14 Days' },
        { value: '30d', label: '30 Days' },
        { value: 'all', label: 'All Time' },
    ];

    if (filteredData.length === 0) {
        return (
            <div className="card-dark p-8 text-center">
                <p className="text-stone-400 text-sm">No data available for the selected period</p>
            </div>
        );
    }

    return (
        <div className="card-dark p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h3 className="text-base font-semibold text-stone-800">Performance Trends</h3>
                <div className="flex flex-wrap gap-1.5">
                    {periods.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
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
                    <Line
                        type="monotone"
                        dataKey="essayAvg"
                        stroke="#1D4ED8"
                        strokeWidth={2.5}
                        name="Essay Score"
                        dot={{ fill: '#1D4ED8', r: 3.5 }}
                        activeDot={{ r: 5, fill: '#1E40AF' }}
                        connectNulls
                    />
                    <Line
                        type="monotone"
                        dataKey="readingAvg"
                        stroke="#047857"
                        strokeWidth={2.5}
                        name="Reading Score"
                        dot={{ fill: '#047857', r: 3.5 }}
                        activeDot={{ r: 5, fill: '#065F46' }}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>

            <p className="text-xs text-stone-400 mt-3 text-center">
                Reading scores normalized to 0–10 scale for comparison
            </p>
        </div>
    );
};

export default PerformanceChart;
