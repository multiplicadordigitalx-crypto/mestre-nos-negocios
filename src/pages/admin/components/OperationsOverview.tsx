
import React, { useState, useEffect } from 'react';
import { OperationsMetric } from '../../../types/legacy';
import { getOperationsMetrics } from '../../../services/mockFirebase';
import * as Icons from '../../../components/Icons';

const OperationsOverview: React.FC = () => {
    const [metrics, setMetrics] = useState<OperationsMetric[]>([]);

    useEffect(() => {
        getOperationsMetrics().then(setMetrics);
    }, []);

    const getIcon = (iconName: string) => {
        const Icon = (Icons as any)[iconName] || Icons.ActivityIcon;
        return <Icon className="w-5 h-5 text-white" />;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'good': return 'bg-green-500';
            case 'warning': return 'bg-orange-500';
            case 'critical': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric, idx) => (
                <div key={idx} className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-brand-primary/50 transition-all flex items-center justify-between group shadow-lg">
                    <div>
                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(metric.status)}`}></div>
                            {metric.label}
                        </div>
                        <h3 className="text-2xl font-black text-white">{metric.value}</h3>
                        {metric.trendValue && (
                            <p className={`text-xs mt-1 font-bold ${metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                                {metric.trend === 'up' ? '▲' : metric.trend === 'down' ? '▼' : '•'} {metric.trendValue}
                            </p>
                        )}
                    </div>
                    <div className="p-3 bg-gray-700/50 rounded-lg group-hover:bg-brand-primary/20 group-hover:scale-110 transition-all">
                        {getIcon(metric.icon)}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OperationsOverview;
