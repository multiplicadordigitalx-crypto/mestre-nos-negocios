import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Brain, Target, TrendingUp, BookOpen, Activity, Clock, Mic, Globe } from '../../Icons';
import { Languages } from '../../../Icons';
import { useAuth } from '../../../hooks/useAuth';


const StatCard = ({ icon: Icon, label, value, subtext, color }: any) => (
    <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-2xl flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color === 'yellow' ? 'bg-yellow-500/10 text-yellow-500' : color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">{label}</p>
            <h4 className="text-2xl font-black text-white">{value}</h4>
            {subtext && <p className="text-[10px] text-gray-500">{subtext}</p>}
        </div>
    </div>
);

const EvolutionBar = ({ label, initial, current, max = 100 }: any) => (
    <div className="mb-4">
        <div className="flex justify-between mb-1">
            <span className="text-xs font-bold text-gray-400">{label}</span>
            <span className="text-xs font-bold text-green-400">+{current - initial}% Evolução</span>
        </div>
        <div className="h-4 bg-gray-800 rounded-full overflow-hidden relative">
            <div
                className="absolute top-0 bottom-0 bg-gray-600 border-r-2 border-white/20 z-10"
                style={{ width: `${initial}%` }}
                title="Nível Inicial"
            />
            <motion.div
                initial={{ width: `${initial}%` }}
                animate={{ width: `${current}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-600 to-green-500"
            />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-600">
            <span>Nível Inicial ({initial}%)</span>
            <span>Atual ({current}%)</span>
        </div>
    </div>
);

export const LanguagePerformanceDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState<'imersao' | 'pratica'>('imersao');

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in">
            {/* AI Welcome Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 p-5 md:p-8 rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center justify-center gap-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0 mx-auto">
                        <Globe className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white mb-2">Análise Nexus Poliglota</h2>
                        <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed text-sm">
                            Olá, <strong>{user?.displayName || 'Estudante'}</strong>. Sua fluência está evoluindo rapidamente.
                            Você teve uma evolução de <span className="text-green-400 font-bold">+35%</span> em vocabulário e pronúncia nesta semana.
                        </p>
                    </div>
                </div>
            </div>

            {/* Evolution Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-[2rem]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                        </div>
                        <h3 className="font-bold text-white text-lg">Sua Fluência</h3>
                    </div>

                    <div className="space-y-6">
                        <EvolutionBar label="Vocabulário & Gramática" initial={20} current={65} />
                        <EvolutionBar label="Pronúncia & Entonação" initial={15} current={58} />
                        <EvolutionBar label="Compreensão Cultural" initial={5} current={45} />
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatCard icon={Zap} label="XP Linguístico" value="8.320" subtext="Nível Intermediário" color="yellow" />
                    <StatCard icon={Languages} label="Palavras" value="1.240" subtext="Vocabulário Ativo" color="blue" />
                    <StatCard icon={BookOpen} label="Lições" value="12/40" subtext="Módulo 2" color="green" />
                    <StatCard icon={Activity} label="Sequência" value="5 Dias" subtext="Mantenha o ritmo!" color="green" />
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex justify-center">
                <div className="bg-gray-900 border border-gray-800 p-1.5 rounded-full inline-flex w-full md:w-auto">
                    <button
                        onClick={() => setActiveSection('imersao')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-bold transition-all ${activeSection === 'imersao' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Imersão Cultural
                    </button>
                    <button
                        onClick={() => setActiveSection('pratica')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-bold transition-all ${activeSection === 'pratica' ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'text-gray-400 hover:text-white'}`}
                    >
                        Laboratório de Voz
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-[2.5rem] p-5 md:p-8">
                {activeSection === 'imersao' ? (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
                            <h3 className="text-xl font-bold text-white">Estudo & Contexto</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-full self-start md:self-auto">
                                <Clock className="w-3 h-3" />
                                <span>Atualizado: Hoje</span>
                            </div>
                        </div>

                        {/* Flashcards Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <Brain className="w-5 h-5 text-purple-500" />
                                        <h4 className="font-bold text-white">Flashcards Gamified</h4>
                                    </div>
                                    <span className="text-xs font-bold text-purple-400">Nível 3</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-2xl font-black text-white">340</span>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Cartas Memorizadas</p>
                                    </div>
                                    <div className="h-10 w-24 flex items-end gap-1">
                                        <div className="w-1/4 bg-purple-900 h-full rounded-t-sm relative"><div className="absolute bottom-0 w-full bg-purple-500 h-[50%]"></div></div>
                                        <div className="w-1/4 bg-purple-900 h-full rounded-t-sm relative"><div className="absolute bottom-0 w-full bg-purple-500 h-[70%]"></div></div>
                                        <div className="w-1/4 bg-purple-900 h-full rounded-t-sm relative"><div className="absolute bottom-0 w-full bg-purple-500 h-[40%]"></div></div>
                                        <div className="w-1/4 bg-purple-900 h-full rounded-t-sm relative"><div className="absolute bottom-0 w-full bg-purple-500 h-[90%]"></div></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-blue-500" />
                                        <h4 className="font-bold text-white">Culture Explorer</h4>
                                    </div>
                                    <span className="text-xs font-bold text-blue-400">Viajante</span>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                            <span>Curiosidades Desbloqueadas</span>
                                            <span>12/50</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-[24%]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
                            <h3 className="text-xl font-bold text-white">Prática de Conversação</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-full self-start md:self-auto">
                                <Clock className="w-3 h-3" />
                                <span>Atualizado: Ontem</span>
                            </div>
                        </div>

                        {/* Voice Lab Stats */}
                        <div className="bg-gray-800 p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-green-500/10 p-2 rounded-lg">
                                    <Mic className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Nexus Voice Lab</h4>
                                    <p className="text-xs text-gray-400">Precisão de pronúncia nas últimas sessões</p>
                                </div>
                            </div>

                            <div className="h-32 flex items-end gap-4 px-4 pb-2 border-b border-gray-700">
                                <div className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-gray-700 h-full rounded-t-lg relative overflow-hidden">
                                        <div className="absolute bottom-0 w-full bg-green-500 h-[60%] group-hover:bg-green-400 transition-colors"></div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-bold">Sess 1</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-gray-700 h-full rounded-t-lg relative overflow-hidden">
                                        <div className="absolute bottom-0 w-full bg-green-500 h-[75%] group-hover:bg-green-400 transition-colors"></div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-bold">Sess 2</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-gray-700 h-full rounded-t-lg relative overflow-hidden">
                                        <div className="absolute bottom-0 w-full bg-green-500 h-[65%] group-hover:bg-green-400 transition-colors"></div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-bold">Sess 3</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-gray-700 h-full rounded-t-lg relative overflow-hidden">
                                        <div className="absolute bottom-0 w-full bg-green-500 h-[85%] group-hover:bg-green-400 transition-colors"></div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-bold">Sess 4</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-gray-700 h-full rounded-t-lg relative overflow-hidden">
                                        <div className="absolute bottom-0 w-full bg-green-500 h-[92%] group-hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]"></div>
                                    </div>
                                    <span className="text-xs text-white font-bold">Sess 5</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
