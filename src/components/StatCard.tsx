import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    gradient: 'purple' | 'emerald' | 'blue' | 'orange';
    icon: React.ReactNode;
    trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, gradient, icon, trend }) => {
    const bgClass = {
        purple:  'gradient-bg-purple',
        emerald: 'gradient-bg-emerald',
        blue:    'gradient-bg-blue',
        orange:  'gradient-bg-orange',
    }[gradient];

    const glowClass = {
        purple:  'glow-purple',
        emerald: 'glow-emerald',
        blue:    'glow-blue',
        orange:  'glow-orange',
    }[gradient];

    return (
        <div className="card-dark p-5 transition-shadow duration-200 hover:shadow-md">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${bgClass} ${glowClass} mb-3`}>
                {icon}
            </div>
            <p className="text-xs text-stone-400 mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-stone-900">{value}</h3>
                {trend !== undefined && trend !== 0 && (
                    <span className={`flex items-center text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {trend > 0
                            ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                            : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                        }
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
        </div>
    );
};

export default StatCard;
