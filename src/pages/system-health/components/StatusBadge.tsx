
import React from 'react';

export const StatusBadge: React.FC<{ status: 'good' | 'warning' | 'critical' }> = ({ status }) => {
    const colors = {
        good: 'bg-green-500/20 text-green-400 border-green-500/30',
        warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        critical: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${colors[status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'good' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></span>
            {status === 'good' ? 'Normal' : status === 'warning' ? 'Atenção' : 'Crítico'}
        </span>
    );
};
