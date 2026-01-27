
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SupportAgent } from '../../../types';
import Card from '../../../components/Card';
import {
    CheckCircle, Star, Clock, Trophy, TrendingUp,
    Brain, Zap, ActivityIcon, MessageSquare, Award
} from '../../../components/Icons';
import RankingSection from '../../../components/RankingSection';

export const ProductivityView: React.FC<{ agent: SupportAgent }> = ({ agent }) => {

    // Mock Data para o Rank
    const teamRank = [
        { name: 'Ana Suporte', resolved: 145, nps: 4.9, status: 'online' },
        { name: agent.displayName, resolved: agent.ticketsResolved, nps: agent.npsScore, status: 'online' },
        { name: 'Carlos Tech', resolved: 112, nps: 4.7, status: 'busy' },
        { name: 'Mariana', resolved: 98, nps: 4.8, status: 'offline' }
    ].sort((a, b) => b.resolved - a.resolved);

    const myRankPosition = teamRank.findIndex(r => r.name === agent.displayName) + 1;

    // Horas logadas simuladas
    const loggedTime = "06h 42m";
    const dailyGoal = 40;
    const progress = Math.min(100, (agent.ticketsResolved % 100)); // Simulação de meta diária de 100 tickets

    return (
        <div className="p-4 md:p-6 overflow-y-auto h-full custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-6 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <ActivityIcon className="w-8 h-8 text-brand-primary" /> Painel de Produtividade
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Sua performance em tempo real monitorada pelo Nexus.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-5 border-l-4 border-l-green-500 bg-gray-800">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Tickets Resolvidos</p>
                        <h3 className="text-3xl font-black text-white mt-1">{agent.ticketsResolved}</h3>
                        <p className="text-[10px] text-green-400 mt-2 flex items-center gap-1 font-bold">
                            <TrendingUp className="w-3 h-3" /> +12% vs Ontem
                        </p>
                    </Card>
                    <Card className="p-5 border-l-4 border-l-yellow-500 bg-gray-800">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Satisfação (NPS)</p>
                        <h3 className="text-3xl font-black text-yellow-400 mt-1">{agent.npsScore}</h3>
                        <div className="flex text-yellow-500 mt-2">
                            <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                        </div>
                    </Card>
                    <Card className="p-5 border-l-4 border-l-blue-500 bg-gray-800">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Tempo Logado</p>
                        <h3 className="text-3xl font-black text-white mt-1">{loggedTime}</h3>
                        <p className="text-[10px] text-gray-500 mt-2">Sessão atual: 2h 15m</p>
                    </Card>
                    <Card className="p-5 border-l-4 border-l-purple-500 bg-gray-800">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Posição no Rank</p>
                        <h3 className="text-3xl font-black text-purple-400 mt-1">#{myRankPosition}</h3>
                        <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase">Entre {teamRank.length} agentes</p>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* NEXUS COACH CARD */}
                    <div className="lg:col-span-2">
                        <Card className="p-8 bg-gradient-to-br from-purple-900/40 via-gray-900 to-gray-900 border border-purple-500/30 relative overflow-hidden h-full shadow-2xl">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Brain className="w-32 h-32 text-purple-400" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-900/40">
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Nexus Coach: Dicas de Sucesso</h3>
                                        <p className="text-purple-300 text-xs font-bold uppercase">Inteligência Artificial Ativa</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 shrink-0">
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed">
                                            Seu tempo de resposta médio está em <strong className="text-white">45 segundos</strong>. Isso é <strong className="text-green-400">excelente</strong> e aumenta a retenção em 15%.
                                        </p>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30 shrink-0">
                                            <Star className="w-4 h-4 text-yellow-400" />
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed">
                                            Notei que em casos de reembolso, usar a palavra <span className="text-white font-bold italic">"Entendo sua frustração"</span> no início gerou 20% mais reversões esta semana.
                                        </p>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0">
                                            <ActivityIcon className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed">
                                            O pico de chamados hoje será às <strong className="text-white">15:00</strong>. Prepare-se para uma carga maior.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-10 pt-6 border-t border-gray-800">
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-gray-400 font-bold uppercase">Meta Diária de Resoluções</span>
                                        <span className="text-brand-primary font-black">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden border border-gray-700">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className="h-full bg-brand-primary shadow-[0_0_10px_#FACC15]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* RANKING TABLE */}
                    <div className="lg:col-span-1">
                        <Card className="bg-gray-800 border-gray-700 h-full overflow-hidden flex flex-col">
                            <div className="p-5 border-b border-gray-700 bg-gray-900/50">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-yellow-500" /> Rank da Equipe
                                </h3>
                            </div>
                            <div className="flex-1 overflow-x-auto">
                                <div className="min-w-[300px]">
                                    {teamRank.map((r, i) => (
                                        <div key={i} className={`p-4 border-b border-gray-700/50 flex items-center justify-between transition-colors ${r.name === agent.displayName ? 'bg-brand-primary/5 border-l-4 border-l-brand-primary' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-black w-4 ${i === 0 ? 'text-yellow-500' : 'text-gray-500'}`}>{i + 1}º</span>
                                                <div>
                                                    <p className="text-sm font-bold text-white leading-tight">{r.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'online' ? 'bg-green-500' : r.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'}`}></span>
                                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">{r.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-white">{r.resolved}</p>
                                                <p className="text-[9px] text-yellow-500 flex items-center justify-end gap-1 font-bold">
                                                    <Star className="w-2 h-2 fill-current" /> {r.nps}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-900/80 text-center">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                    Atualizado a cada 5 minutos
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>

                <RankingSection title="Rankings de Produtividade (Tempo Real)" />
            </div>
        </div>
    );
};
