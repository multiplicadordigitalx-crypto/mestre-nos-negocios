import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Brain, Target, TrendingUp, BookOpen, Activity, Lock, CheckCircle, BarChart2, Clock } from '../Icons';
import { useAuth } from '../../hooks/useAuth';

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
            {/* Initial Level Marker */}
            <div
                className="absolute top-0 bottom-0 bg-gray-600 border-r-2 border-white/20 z-10"
                style={{ width: `${initial}%` }}
                title="Nível Inicial"
            />
            {/* Current Growth */}
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

export const PerformanceDashboard = () => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState<'sabedoria' | 'pratica'>('sabedoria');

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in">
            {/* AI Welcome Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 p-5 md:p-8 rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-black text-white mb-2">Análise Nexus AI</h2>
                        <p className="text-gray-300 max-w-2xl leading-relaxed text-sm">
                            Olá, <strong>{user?.displayName || 'Doutor(a)'}</strong>. Analisei seus dados de navegação e exercícios.
                            Você teve uma evolução de <span className="text-green-400 font-bold">+42%</span> em conhecimentos práticos desde que começou o curso de IA Jurídica.
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
                        <h3 className="font-bold text-white text-lg">Sua Evolução</h3>
                    </div>

                    <div className="space-y-6">
                        <EvolutionBar label="Fundamentação Jurídica" initial={30} current={75} />
                        <EvolutionBar label="Oratória & Argumentação" initial={40} current={68} />
                        <EvolutionBar label="Uso de IA na Prática" initial={10} current={85} />
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatCard icon={Zap} label="XP Total" value="12.450" subtext="Nível Senior" color="yellow" />
                    <StatCard icon={Target} label="Questões" value="342" subtext="85% Acerto" color="green" />
                    <StatCard icon={BookOpen} label="Aulas" value="24/60" subtext="Módulo 3" color="blue" />
                    <StatCard icon={Activity} label="Consistência" value="12 Dias" subtext="Maior sequência" color="green" />
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex justify-center">
                <div className="bg-gray-900 border border-gray-800 p-1.5 rounded-full inline-flex w-full md:w-auto">
                    <button
                        onClick={() => setActiveSection('sabedoria')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-bold transition-all ${activeSection === 'sabedoria' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Imersão
                    </button>
                    <button
                        onClick={() => setActiveSection('pratica')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-bold transition-all ${activeSection === 'pratica' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-400 hover:text-white'}`}
                    >
                        Alta Performance
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-[2.5rem] p-5 md:p-8">
                {activeSection === 'sabedoria' ? (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
                            <h3 className="text-xl font-bold text-white">Progresso no Curso & Estudo</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-full self-start md:self-auto">
                                <Clock className="w-3 h-3" />
                                <span>Atualizado: Hoje</span>
                            </div>
                        </div>

                        {/* Nexus Player Progress */}
                        <div className="bg-gray-800 p-5 md:p-6 rounded-2xl flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
                            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path className="text-blue-500" strokeDasharray="40, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                </svg>
                                <span className="absolute text-sm font-bold text-white">40%</span>
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg mb-1">Nexus Player - Curso IA</h4>
                                <p className="text-gray-400 text-sm mb-2">Módulo Atual: Engenharia de Prompts Jurídicos</p>
                                <div className="flex gap-2">
                                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">Em andamento</span>
                                    <span className="text-[10px] bg-gray-700 text-gray-400 px-2 py-0.5 rounded border border-gray-600"> Aula 24 de 60</span>
                                </div>
                            </div>
                            <button className="md:ml-auto w-full md:w-auto bg-white text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors">
                                Continuar Aula
                            </button>
                        </div>

                        {/* JurisMemoria Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <Brain className="w-5 h-5 text-purple-500" />
                                        <h4 className="font-bold text-white">JurisMemória</h4>
                                    </div>
                                    <span className="text-xs font-bold text-purple-400">Nível 5</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-2xl font-black text-white">142</span>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Flashcards Dominados</p>
                                    </div>
                                    <div className="h-10 w-24 flex items-end gap-1">
                                        <div className="w-1/4 bg-purple-900 h-full rounded-t-sm relative"><div className="absolute bottom-0 w-full bg-purple-500 h-[40%]"></div></div>
                                        <div className="w-1/4 bg-purple-900 h-full rounded-t-sm relative"><div className="absolute bottom-0 w-full bg-purple-500 h-[60%]"></div></div>
                                        <div className="w-1/4 bg-purple-900 h-full rounded-t-sm relative"><div className="absolute bottom-0 w-full bg-purple-500 h-[30%]"></div></div>
                                        <div className="w-1/4 bg-purple-900 h-full rounded-t-sm relative"><div className="absolute bottom-0 w-full bg-purple-500 h-[80%]"></div></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-pink-500" />
                                        <h4 className="font-bold text-white">Simulador de Audiência</h4>
                                    </div>
                                    <span className="text-xs font-bold text-pink-400">Score 8.5</span>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                            <span>Clareza Vocal</span>
                                            <span>90%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-pink-500 w-[90%]"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                            <span>Argumentação</span>
                                            <span>75%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-pink-500 w-[75%]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
                            <h3 className="text-xl font-bold text-white">Performance Prática</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-full self-start md:self-auto">
                                <Clock className="w-3 h-3" />
                                <span>Atualizado: Ontem</span>
                            </div>
                        </div>

                        {/* OAB Simulator Stats */}
                        <div className="bg-gray-800 p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-red-500/10 p-2 rounded-lg">
                                    <Target className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Simulado OAB</h4>
                                    <p className="text-xs text-gray-400">Taxa de acertos nos últimos 5 simulados</p>
                                </div>
                            </div>

                            <div className="h-32 flex items-end gap-4 px-4 pb-2 border-b border-gray-700">
                                <div className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-gray-700 h-full rounded-t-lg relative overflow-hidden">
                                        <div className="absolute bottom-0 w-full bg-red-500 h-[40%] group-hover:bg-red-400 transition-colors"></div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-bold">Sim 1</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-gray-700 h-full rounded-t-lg relative overflow-hidden">
                                        <div className="absolute bottom-0 w-full bg-red-500 h-[55%] group-hover:bg-red-400 transition-colors"></div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-bold">Sim 2</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-gray-700 h-full rounded-t-lg relative overflow-hidden">
                                        <div className="absolute bottom-0 w-full bg-red-500 h-[45%] group-hover:bg-red-400 transition-colors"></div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-bold">Sim 3</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-gray-700 h-full rounded-t-lg relative overflow-hidden">
                                        <div className="absolute bottom-0 w-full bg-red-500 h-[70%] group-hover:bg-red-400 transition-colors"></div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-bold">Sim 4</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-gray-700 h-full rounded-t-lg relative overflow-hidden">
                                        <div className="absolute bottom-0 w-full bg-green-500 h-[85%] group-hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]"></div>
                                    </div>
                                    <span className="text-xs text-white font-bold">Sim 5</span>
                                </div>
                            </div>
                        </div>

                        {/* Essay Corrector Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-gray-800/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center border border-gray-700/50">
                                <span className="text-3xl font-black text-white mb-1">12</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Peças Enviadas</span>
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center border border-gray-700/50">
                                <span className="text-3xl font-black text-green-500 mb-1">8.2</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Nota Média</span>
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center border border-gray-700/50">
                                <span className="text-3xl font-black text-blue-500 mb-1">94%</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Originalidade</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
