
import React from 'react';
import { AlertTriangle, CheckCircle } from '../../../components/Icons';
import { HealthMetric } from '../types';

interface MetricCardProps {
    title: string;
    icon: React.ReactNode;
    metrics: HealthMetric[];
    onClick: () => void;
    color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
    title, 
    icon, 
    metrics, 
    onClick, 
    color = "text-brand-primary" 
}) => {
    return (
        <div 
            onClick={onClick}
            className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-brand-primary/50 transition-all cursor-pointer group shadow-lg hover:shadow-brand-primary/5 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg bg-gray-900 border border-gray-700 ${color}`}>
                        {icon}
                    </div>
                    <h3 className="font-bold text-white text-sm uppercase tracking-wide">{title}</h3>
                </div>
                {metrics.some(m => m.status === 'critical') ? (
                    <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse"/>
                ) : metrics.some(m => m.status === 'warning') ? (
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                ) : (
                    <CheckCircle className="w-5 h-5 text-green-500 opacity-50"/>
                )}
            </div>

            <div className="space-y-3 relative z-10">
                {metrics.map((m, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">{m.label}</span>
                        <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${m.status === 'critical' ? 'text-red-400' : m.status === 'warning' ? 'text-yellow-400' : 'text-white'}`}>
                                {m.value}{m.unit}
                            </span>
                            {/* Simple Sparkline Mock */}
                            <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden flex items-end">
                                <div className={`w-full ${m.status === 'good' ? 'bg-green-500' : m.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{height: `${Math.random() * 60 + 40}%`}}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-700/50 flex justify-between items-center text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                <span>Tempo Real</span>
                <span className="group-hover:text-brand-primary transition-colors">Ver Detalhes →</span>
            </div>
        </div>
    );
};
