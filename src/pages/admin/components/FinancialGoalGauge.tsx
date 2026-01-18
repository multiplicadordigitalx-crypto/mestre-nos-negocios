
import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, AlertTriangle } from '../../../components/Icons';

interface FinancialGoalGaugeProps {
    currentAmount: number;
    targetAmount: number;
    label?: string;
    projectedAmount?: number;
}

export const FinancialGoalGauge: React.FC<FinancialGoalGaugeProps> = ({
    currentAmount,
    targetAmount,
    label = 'Meta Mensal',
    projectedAmount
}) => {
    const percentage = Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));
    const projectedPercentage = projectedAmount ? Math.min(100, Math.max(0, (projectedAmount / targetAmount) * 100)) : 0;

    const isAbovePace = projectedAmount && projectedAmount >= targetAmount;

    return (
        <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 relative overflow-hidden flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-500/20 p-1.5 rounded-lg">
                        <Target className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-gray-500 block">Alvo</span>
                    <span className="text-sm font-black text-gray-300">R$ {targetAmount.toLocaleString('pt-BR', { notation: 'compact' })}</span>
                </div>
            </div>

            <div className="relative pt-2 pb-1">
                <div className="flex items-end justify-between mb-1">
                    <span className="text-2xl font-black text-white">
                        {percentage.toFixed(0)}%
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                        R$ {currentAmount.toLocaleString('pt-BR', { notation: 'compact' })}
                    </span>
                </div>

                {/* Progress Bar Container */}
                <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden relative">
                    {/* Projected Marker (Ghost Bar) */}
                    {projectedAmount && (
                        <div
                            className="absolute top-0 left-0 h-full bg-blue-500/30 transition-all duration-1000 ease-out border-r border-blue-400/50"
                            style={{ width: `${projectedPercentage}%` }}
                        />
                    )}
                    {/* Actual Progress */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${percentage >= 100 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-blue-500'}`}
                    />
                </div>
            </div>

            {projectedAmount && (
                <div className={`mt-2 text-xs flex items-center gap-1.5 p-2 rounded-lg border ${isAbovePace
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                    }`}>
                    {isAbovePace ? <TrendingUp className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    <span className="font-medium">
                        {isAbovePace
                            ? `Projeção: Bater meta (R$ ${projectedAmount.toLocaleString('pt-BR', { notation: 'compact' })})`
                            : `Atenção: Projeção abaixo (R$ ${projectedAmount.toLocaleString('pt-BR', { notation: 'compact' })})`
                        }
                    </span>
                </div>
            )}
        </div>
    );
};
