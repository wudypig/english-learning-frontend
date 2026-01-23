import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    gradient: 'purple' | 'emerald' | 'blue' | 'orange';
    icon: React.ReactNode;
    trend?: number; // Percentage change, positive or negative
}

const StatCard: React.FC<StatCardProps> = ({ label, value, gradient, icon, trend }) => {
    const gradientClasses = {
        purple: 'gradient-bg-purple',
        emerald: 'gradient-bg-emerald',
        blue: 'gradient-bg-blue',
        orange: 'gradient-bg-orange',
    };

    const glowClasses = {
        purple: 'glow-purple',
        emerald: 'glow-emerald',
        blue: 'glow-blue',
        orange: 'glow-orange',
    };

    return (
        <div className="card-dark p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            {/* Subtle gradient background effect */}
            <div className={`absolute inset-0 ${gradientClasses[gradient]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

            <div className="relative">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${gradientClasses[gradient]} ${glowClasses[gradient]} mb-4`}>
                    {icon}
                </div>

                {/* Label */}
                <p className="text-sm text-slate-400 mb-2">{label}</p>

                {/* Value and Trend */}
                <div className="flex items-baseline gap-3">
                    <h3 className="text-3xl font-bold text-slate-100">{value}</h3>
                    {trend !== undefined && trend !== 0 && (
                        <div className={`flex items-center text-sm font-medium ${trend > 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                            {trend > 0 ? (
                                <TrendingUp className="w-4 h-4 mr-1" />
                            ) : (
                                <TrendingDown className="w-4 h-4 mr-1" />
                            )}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
