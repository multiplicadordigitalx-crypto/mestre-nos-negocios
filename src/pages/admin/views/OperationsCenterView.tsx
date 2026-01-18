
import React, { useState } from 'react';
import OperationsOverview from '../components/OperationsOverview';
import EscalationsQueue from '../components/EscalationsQueue';
import { FinancialSupportView } from './FinancialSupportView';
import { TeamChatView } from './TeamChatView';
import { Activity, MessageSquare, Users, Zap, Shield, Lock, Smartphone } from '../../../components/Icons';
import Button from '../../../components/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface OperationsCenterViewProps {
    user: any;
}

const OperationsCenterView: React.FC<OperationsCenterViewProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'monitor' | 'support' | 'team'>('monitor');

    // Quick Actions Component
    const QuickActions = () => (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 h-full shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" /> Ações Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-3 bg-red-900/20 border border-red-500/30 rounded-xl hover:bg-red-900/40 transition-all group">
                    <Lock className="w-6 h-6 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-red-300">Bloquear Usuário</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 bg-blue-900/20 border border-blue-500/30 rounded-xl hover:bg-blue-900/40 transition-all group">
                    <Shield className="w-6 h-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-blue-300">Auditoria Global</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 bg-green-900/20 border border-green-500/30 rounded-xl hover:bg-green-900/40 transition-all group">
                    <Smartphone className="w-6 h-6 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-green-300">Notificar App</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 bg-purple-900/20 border border-purple-500/30 rounded-xl hover:bg-purple-900/40 transition-all group">
                    <Activity className="w-6 h-6 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-purple-300">Systema Reset</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col space-y-6 animate-fade-in min-h-[calc(100vh-100px)]">
            {/* Header Tabs */}
            <div className="flex bg-gray-900/50 p-1.5 rounded-xl border border-gray-700 w-fit backdrop-blur-sm sticky top-0 z-20">
                <button
                    onClick={() => setActiveTab('monitor')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'monitor' ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                    <Activity className="w-4 h-4" /> Monitoramento & Escalonamento
                </button>
                <div className="w-px bg-gray-700 mx-1 h-6 self-center"></div>
                <button
                    onClick={() => setActiveTab('support')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'support' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                    <MessageSquare className="w-4 h-4" /> Atendimento Direto
                </button>
                <button
                    onClick={() => setActiveTab('team')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'team' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                    <Users className="w-4 h-4" /> Equipe Nexus
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'monitor' && (
                        <motion.div
                            key="monitor"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="h-full flex flex-col space-y-6"
                        >
                            <OperationsOverview />
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                                <div className="lg:col-span-2 h-[500px]">
                                    <EscalationsQueue />
                                </div>
                                <div className="h-[500px]">
                                    <QuickActions />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'support' && (
                        <motion.div
                            key="support"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="h-[calc(100vh-180px)] border border-gray-700 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <FinancialSupportView user={user} />
                        </motion.div>
                    )}

                    {activeTab === 'team' && (
                        <motion.div
                            key="team"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="h-[calc(100vh-180px)] border border-gray-700 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <TeamChatView user={user} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OperationsCenterView;
