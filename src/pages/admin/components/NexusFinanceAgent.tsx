
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Sparkles, AlertTriangle, TrendingUp,
    MessageSquare, CheckCircle, Search, ArrowRight
} from '../../../components/Icons';
import Button from '../../../components/Button';

interface Insight {
    id: string;
    type: 'alert' | 'opportunity' | 'success';
    message: string;
    impact: string;
    action?: string;
}

export const NexusFinanceAgent: React.FC = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [showFullReport, setShowFullReport] = useState(false);

    useEffect(() => {
        // Auto-run analysis on mount
        runAnalysis();
    }, []);

    const runAnalysis = async () => {
        setIsAnalyzing(true);
        setInsights([]);

        // Simulating AI Thinking
        await new Promise(r => setTimeout(r, 2000));

        // Mock Insights based on "Financial Command Center" logic
        setInsights([
            {
                id: '1',
                type: 'alert',
                message: 'A taxa de reembolso do produto "Mentoria 10x" subiu 15% esta semana.',
                impact: 'Impacto projetado: -R$ 4.500,00 no lucro mensal.',
                action: 'Verificar módulo 3 (maior índice de drop-off).'
            },
            {
                id: '2',
                type: 'opportunity',
                message: 'O produtor "Carlos Silva" atingiu o nível Black. Aumentar limite de saque?',
                impact: 'Retenção de parceiro estratégico.',
                action: 'Aprovar novo limite'
            },
            {
                id: '3',
                type: 'success',
                message: 'Margem líquida da plataforma cresceu 8% após ajuste nas taxas de gateway.',
                impact: 'Lucro Adicional: +R$ 12.000,00',
            }
        ]);
        setIsAnalyzing(false);
    };

    return (
        <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Brain className="w-32 h-32 text-indigo-400 animate-pulse" />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${isAnalyzing ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse' : 'bg-indigo-900/50 border-indigo-500/50'}`}>
                            <Sparkles className={`w-6 h-6 text-white ${isAnalyzing ? 'animate-spin-slow' : ''}`} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white flex items-center gap-2">
                                Nexus CFO AI
                                <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Beta</span>
                            </h3>
                            <p className="text-indigo-200 text-sm">Monitoramento financeiro e detecção de anomalias em tempo real.</p>
                        </div>
                    </div>

                    <Button
                        onClick={runAnalysis}
                        disabled={isAnalyzing}
                        className="bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/50 shadow-indigo-900/20"
                    >
                        {isAnalyzing ? 'Analisando dados...' : 'Rodar Nova Análise'}
                    </Button>
                </div>

                {isAnalyzing ? (
                    <div className="py-8 text-center space-y-3">
                        <div className="w-full max-w-md mx-auto h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 animate-progress-indeterminate"></div>
                        </div>
                        <p className="text-indigo-300 text-sm animate-pulse">Cruzando dados de vendas, reembolsos e margens...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {insights.map((insight, idx) => (
                                <motion.div
                                    key={insight.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`p-4 rounded-xl border backdrop-blur-sm ${insight.type === 'alert' ? 'bg-red-500/10 border-red-500/30' :
                                            insight.type === 'opportunity' ? 'bg-blue-500/10 border-blue-500/30' :
                                                'bg-green-500/10 border-green-500/30'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className={`p-1.5 rounded-lg ${insight.type === 'alert' ? 'bg-red-500/20 text-red-400' :
                                                insight.type === 'opportunity' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-green-500/20 text-green-400'
                                            }`}>
                                            {insight.type === 'alert' ? <AlertTriangle className="w-4 h-4" /> :
                                                insight.type === 'opportunity' ? <Search className="w-4 h-4" /> :
                                                    <TrendingUp className="w-4 h-4" />}
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                            {insight.type === 'alert' ? 'Risco Detectado' :
                                                insight.type === 'opportunity' ? 'Oportunidade' :
                                                    'Performance'}
                                        </span>
                                    </div>
                                    <p className="text-white text-sm font-bold leading-tight mb-2">{insight.message}</p>
                                    <div className="text-xs text-gray-300 bg-black/20 p-2 rounded border border-white/5">
                                        <span className="block font-medium text-indigo-300 mb-0.5">Impacto:</span>
                                        {insight.impact}
                                    </div>
                                    {insight.action && (
                                        <button className="mt-3 w-full text-xs flex items-center justify-center gap-1 text-white bg-white/10 hover:bg-white/20 py-1.5 rounded transition-colors font-bold">
                                            {insight.action} <ArrowRight className="w-3 h-3" />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};
