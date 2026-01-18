
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertTriangle, Settings, CheckCircle } from '../../../components/Icons';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import toast from 'react-hot-toast';
import { generateNexusDailyReport, runNexusFeedbackLoop } from '../../../services/mockFirebase';
import { NexusDailyReport, NexusTrendAlert, NexusSystemOptimization } from '../../../types';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

const NexusEvolutionLoop: React.FC = () => {
    const [report, setReport] = useState<NexusDailyReport | null>(null);
    const [alerts, setAlerts] = useState<NexusTrendAlert[]>([]);
    const [optimizations, setOptimizations] = useState<NexusSystemOptimization[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'auto_tuning'>('overview');

    useEffect(() => {
        loadAnalysis();
    }, []);

    const loadAnalysis = async () => {
        setLoading(true);
        try {
            const dailyReport = await generateNexusDailyReport();
            setReport(dailyReport);

            const loopResult = await runNexusFeedbackLoop();
            setAlerts(loopResult.alerts);
            setOptimizations(loopResult.optimizations);
        } catch (e) {
            toast.error("Erro ao carregar análise evolutiva.");
        } finally {
            setLoading(false);
        }
    };

    const handleApplyOptimization = (id: string) => {
        setOptimizations(prev => prev.map(opt => opt.id === id ? { ...opt, status: 'applied' } : opt));
        toast.success("Otimização aplicada ao sistema! (Simulação)", { icon: '🚀' });
    };

    return (
        <Card className="bg-gray-800 border-l-4 border-l-indigo-500 p-6 relative overflow-hidden mt-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                        <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin-slow"/> Nexus Evolução Contínua (Etapa 7)
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 max-w-2xl">
                        O cérebro central que fecha o ciclo. Analisa resultados globais, aprende com o sucesso dos alunos e propõe melhorias automáticas na plataforma.
                    </p>
                </div>
                <Button onClick={loadAnalysis} variant="secondary" className="!py-1.5 !px-3 !text-xs">
                    <RefreshCw className={`w-3 h-3 mr-2 ${loading ? 'animate-spin' : ''}`}/> Atualizar Ciclo
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-700 pb-1 relative z-10">
                <button 
                    onClick={() => setActiveTab('overview')} 
                    className={`px-4 py-2 text-xs font-bold uppercase transition-colors border-b-2 ${activeTab === 'overview' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Relatório de Inteligência
                </button>
                <button 
                    onClick={() => setActiveTab('alerts')} 
                    className={`px-4 py-2 text-xs font-bold uppercase transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'alerts' ? 'border-red-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Alertas de Tendência {alerts.length > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 rounded-full">{alerts.length}</span>}
                </button>
                <button 
                    onClick={() => setActiveTab('auto_tuning')} 
                    className={`px-4 py-2 text-xs font-bold uppercase transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'auto_tuning' ? 'border-green-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Auto-Otimização (RL) {optimizations.filter(o => o.status === 'proposed').length > 0 && <span className="bg-green-500 text-black text-[9px] px-1.5 rounded-full">{optimizations.filter(o => o.status === 'proposed').length}</span>}
                </button>
            </div>

            <div className="min-h-[250px] relative z-10">
                {loading ? (
                    <div className="flex justify-center items-center h-full py-10">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && report && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Aprendizado da IA</p>
                                    <h4 className="text-2xl font-black text-indigo-400">+{report.learningProgress}%</h4>
                                    <p className="text-[10px] text-gray-400 mt-1">Precisão aprimorada hoje</p>
                                </div>
                                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Satisfação Média</p>
                                    <h4 className="text-2xl font-black text-yellow-400">{report.avgSatisfaction}/5.0</h4>
                                    <p className="text-[10px] text-gray-400 mt-1">Baseado em feedback real</p>
                                </div>
                                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Uso Total IA</p>
                                    <h4 className="text-2xl font-black text-white">{report.totalUsage.toLocaleString()}</h4>
                                    <p className="text-[10px] text-gray-400 mt-1">Requisições processadas</p>
                                </div>
                                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Ferramentas Top 3</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {report.topTools.map((tool, i) => (
                                            <span key={i} className="text-[9px] bg-gray-800 px-2 py-0.5 rounded text-gray-300">{tool}</span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'alerts' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                                {alerts.map(alert => (
                                    <div key={alert.id} className={`p-4 rounded-lg border flex items-start gap-3 ${
                                        alert.severity === 'high' || alert.severity === 'critical' ? 'bg-red-900/10 border-red-500/30' : 'bg-yellow-900/10 border-yellow-500/30'
                                    }`}>
                                        <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${alert.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`}/>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className={`text-sm font-bold ${alert.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}`}>
                                                    Alerta de Tendência: {alert.category.replace('_', ' ').toUpperCase()}
                                                </h4>
                                                <span className="text-[10px] text-gray-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                            <p className="text-xs text-gray-300 mb-2">{alert.message}</p>
                                            {alert.recommendedAutoAction && (
                                                <div className="bg-black/30 p-2 rounded text-[10px] text-gray-400 font-mono">
                                                    <strong className="text-gray-300">Sugestão:</strong> {alert.recommendedAutoAction}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {alerts.length === 0 && <p className="text-gray-500 text-center py-4">Nenhuma anomalia detectada.</p>}
                            </motion.div>
                        )}

                        {activeTab === 'auto_tuning' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                                <p className="text-xs text-gray-400 mb-2 bg-indigo-900/20 p-2 rounded border border-indigo-500/20">
                                    O Nexus propõe ajustes nos parâmetros do sistema baseados em Reinforcement Learning (Aprendizado por Reforço) para maximizar o sucesso dos alunos.
                                </p>
                                {optimizations.map(opt => (
                                    <div key={opt.id} className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="p-2 bg-gray-800 rounded-lg border border-gray-600">
                                                <Settings className="w-5 h-5 text-indigo-400"/>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-bold text-white">{opt.targetModule}</span>
                                                    <span className="text-[9px] bg-gray-800 px-2 py-0.5 rounded text-gray-400 uppercase">{opt.changeType.replace('_', ' ')}</span>
                                                </div>
                                                <p className="text-xs text-gray-400">{opt.description}</p>
                                                <p className="text-[10px] text-green-400 mt-1 font-bold">Confiança da IA: {opt.confidenceScore}%</p>
                                            </div>
                                        </div>
                                        {opt.status === 'proposed' ? (
                                            <Button onClick={() => handleApplyOptimization(opt.id)} className="!bg-indigo-600 hover:!bg-indigo-500 !text-xs whitespace-nowrap">
                                                Aprovar & Aplicar
                                            </Button>
                                        ) : (
                                            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded border border-green-500/20 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3"/> Aplicado
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </Card>
    );
};

export default NexusEvolutionLoop;
