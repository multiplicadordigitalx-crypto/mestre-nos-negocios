
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layers, Settings, DollarSign, MousePointer, Activity,
    ShieldCheck, Brain, Globe, TrendingUp, GitBranch,
    Zap, BarChart3, Target
} from '../components/Icons';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useFunnelsData } from './funnels/hooks/useFunnelsData';
import { MestreFullModal } from './funnels/modals/FunnelsModals';
import { MestreFullConfigModal } from './funnels/modals/MestreFullConfigModal';
import { OverviewTab } from './funnels/tabs/OverviewTab';
import { BuilderTab } from './funnels/tabs/BuilderTab';
import { OptimizerTab } from './funnels/tabs/OptimizerTab';
import { StrategiesTab } from './funnels/tabs/StrategiesTab';
import { AnalyticsTab } from './funnels/tabs/AnalyticsTab';
import { PersonaTab } from './funnels/tabs/PersonaTab';

const FunnelsPage: React.FC = () => {
    const { user } = useAuth();
    const isStudent = user?.role === 'student' || user?.role === 'influencer' || !user?.role;
    const studentTitle = "Meus Funis de Venda";
    const adminTitle = "Funil & PGS";

    const [isMestreFullMode, setIsMestreFullMode] = useState(false);
    const [showFullModeModal, setShowFullModeModal] = useState(false);
    const [showConfigModal, setShowConfigModal] = useState(false);

    // TABS CONFIG
    const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'optimizer' | 'strategies' | 'analytics' | 'persona'>('overview');

    // Data Hook
    const {
        activePages,
        variations,
        mestreFullConfig,
        updateMestreFullConfig,
        budgetCap,
        setBudgetCap,
        handlePageCreated
    } = useFunnelsData();

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 md:p-8 animate-fade-in pb-20">
            <div className={`border rounded-2xl p-6 relative overflow-hidden shadow-2xl transition-all duration-500 mb-8 ${isMestreFullMode ? 'bg-gray-800 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)]' : 'bg-gray-900 border-gray-800 opacity-90'}`}>
                {isMestreFullMode && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-yellow-500 to-green-500"></div>}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div>
                        <h2 className={`text-2xl font-black uppercase tracking-wider flex items-center gap-3 ${isMestreFullMode ? 'text-white' : 'text-gray-400'}`}>
                            <Layers className={`w-8 h-8 ${isMestreFullMode ? 'text-brand-primary' : 'text-gray-600'}`} />
                            {isStudent ? studentTitle : adminTitle}
                            <span className={`text-xs px-2 py-1 rounded border font-normal normal-case ml-2 ${isMestreFullMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>Mestre das Conversões</span>
                        </h2>
                        <p className="text-gray-400 text-sm mt-1 max-w-2xl">
                            Arquiteto supremo de fluxos. Deixe a IA criar, testar e escalar suas páginas de vendas automaticamente.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {!isStudent && (
                            <button
                                onClick={() => setShowConfigModal(true)}
                                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-2 text-gray-400 hover:text-white transition-colors"
                                title="Configurar Parâmetros Mestre Full"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        )}
                        <div className={`flex items-center gap-4 p-3 rounded-xl border shadow-inner ${isMestreFullMode ? 'bg-gray-900 border-gray-700' : 'bg-black border-gray-800'}`}>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Modo Mestre Full</p>
                                <p className={`text-xs font-bold ${isMestreFullMode ? 'text-yellow-400 animate-pulse' : 'text-gray-500'}`}>
                                    {isMestreFullMode ? 'ATIVADO • PILOTO AUTOMÁTICO' : 'DESATIVADO'}
                                </p>
                            </div>
                            <button
                                onClick={() => !isMestreFullMode ? setShowFullModeModal(true) : setIsMestreFullMode(false)}
                                className={`w-14 h-8 rounded-full relative transition-all duration-300 ease-in-out shadow-inner border-2 ${isMestreFullMode ? 'bg-yellow-500 border-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-gray-800 border-gray-600'}`}
                            >
                                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-md ${isMestreFullMode ? 'left-6' : 'left-0.5'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t ${isMestreFullMode ? 'border-gray-700' : 'border-gray-800 opacity-50'}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><DollarSign className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">ROAS Global</p>
                            <p className="text-xl font-black text-white">5.4x</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><MousePointer className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Conv. Página</p>
                            <p className="text-xl font-black text-white">24.5%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Activity className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Testes Ativos</p>
                            <p className="text-xl font-black text-white">3 <span className="text-xs font-normal text-gray-500">variações</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><ShieldCheck className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Proteção</p>
                            <p className="text-sm font-bold text-white">R$ {budgetCap.toFixed(2)} Teto Ativo</p>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isMestreFullMode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-800/80 border border-yellow-500/30 rounded-xl p-6 shadow-2xl relative overflow-hidden mb-6"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-white uppercase flex items-center gap-3">
                                    <Brain className="w-6 h-6 text-brand-primary" /> Centro de Controle AI (Autônomo)
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-bold bg-green-900/30 text-green-400 px-3 py-1 rounded border border-green-500/30 animate-pulse">
                                        Ciclo Ativo: Analisando Variação B...
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 text-center text-gray-400 text-sm">
                                Painel de controle autônomo ativo. Monitorando métricas de segurança, escala e desgaste em tempo real.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar mb-6">
                <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-brand-primary text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>Visão Geral</button>
                <button onClick={() => setActiveTab('builder')} className={`px-6 py-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'builder' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}><Brain className="w-4 h-4" /> Construtor AI</button>
                <button onClick={() => setActiveTab('optimizer')} className={`px-6 py-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'optimizer' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}><Zap className="w-4 h-4" /> Otimizador 24h</button>
                <button onClick={() => setActiveTab('strategies')} className={`px-6 py-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'strategies' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}><GitBranch className="w-4 h-4" /> Estratégias de Funis</button>
                <button onClick={() => setActiveTab('analytics')} className={`px-6 py-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}><Activity className="w-4 h-4" /> Deep Analytics 24h</button>
                <button onClick={() => setActiveTab('persona')} className={`px-6 py-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'persona' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}><Target className="w-4 h-4" /> Persona</button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && <OverviewTab activePages={activePages} />}
                {activeTab === 'builder' && <BuilderTab onPageCreated={handlePageCreated} setActiveTab={setActiveTab} />}
                {activeTab === 'optimizer' && <OptimizerTab variations={variations} budgetCap={budgetCap} setBudgetCap={setBudgetCap} />}
                {activeTab === 'strategies' && <StrategiesTab />}
                {activeTab === 'analytics' && <AnalyticsTab />}
                {activeTab === 'persona' && <PersonaTab />}
            </AnimatePresence>

            <MestreFullModal
                isOpen={showFullModeModal}
                onClose={() => setShowFullModeModal(false)}
                currentBalance={user?.creditBalance || 0}
                estimatedDailyCost={25}
                onConfirm={() => {
                    if ((user?.creditBalance || 0) < 10) {
                        toast.error("Saldo insuficiente para iniciar o Mestre Full. Recarregue seus créditos.", { icon: '🚫' });
                        return;
                    }
                    setIsMestreFullMode(true);
                    setShowFullModeModal(false);
                    toast.success("MODO MESTRE FULL ATIVADO! A MÁQUINA ESTÁ VIVA.", { icon: '⚡' });
                }}
            />
            <MestreFullConfigModal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} config={mestreFullConfig} onSave={updateMestreFullConfig} />
        </div>
    );
};

export default FunnelsPage;
