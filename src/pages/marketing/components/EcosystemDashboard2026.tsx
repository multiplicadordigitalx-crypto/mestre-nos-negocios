
import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import { DollarSign, TrendingUp, Users, Zap, MessageSquare, Activity, Phone, Layers, Mail, Brain } from '../../../components/Icons';
import { getSalesTeam, getInfluencers, getLeads, getUsageLimit } from '../../../services/mockFirebase';
import { motion } from 'framer-motion';

export const EcosystemDashboard2026: React.FC = () => {
    const [metrics, setMetrics] = useState({
        totalRevenue: 245890.00,
        activeLeads: 12450,
        aiTasks: 8420,
        messagesSent: 142500,
        conversionRate: 8.4,
        emailOpenRate: 42.5,
        funnelVisits: 89400,
        activeCampaigns: 12
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sales, infs, leads, limit] = await Promise.all([
                    getSalesTeam(),
                    getInfluencers(),
                    getLeads(),
                    getUsageLimit()
                ]);
                
                const salesRevenue = sales.reduce((acc, s) => acc + s.revenueToday, 0);
                const infRevenue = infs.reduce((acc, i) => acc + i.totalEarnings, 0);
                const liveRevenue = 245890.00 + salesRevenue + infRevenue; 
                
                const liveLeads = 12450 + leads.length;
                const liveTasks = 8420 + Math.floor(limit.current_usage * 5);
                
                setMetrics(prev => ({
                    ...prev,
                    totalRevenue: liveRevenue,
                    activeLeads: liveLeads,
                    aiTasks: liveTasks,
                    messagesSent: 142500 + Math.floor(Math.random() * 100),
                }));
            } catch (e) { console.error(e); }
        };
        
        fetchData();
        const interval = setInterval(fetchData, 5000); 
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 border-l-4 border-l-green-500 bg-gray-800">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs text-gray-400 uppercase font-bold">Receita Total do Ecossistema</p>
                        <div className="p-1.5 bg-green-500/10 rounded-lg text-green-400"><DollarSign className="w-4 h-4"/></div>
                    </div>
                    <h3 className="text-2xl font-black text-white">R$ {metrics.totalRevenue.toLocaleString('pt-BR')}</h3>
                    <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +18% esta semana</p>
                </Card>

                <Card className="p-4 border-l-4 border-l-blue-500 bg-gray-800">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs text-gray-400 uppercase font-bold">Leads Ativos (Funil + Bot)</p>
                        <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400"><Users className="w-4 h-4"/></div>
                    </div>
                    <h3 className="text-2xl font-black text-white">{metrics.activeLeads.toLocaleString()}</h3>
                    <p className="text-[10px] text-gray-500 mt-1">Origem: 45% Orgânico / 55% Pago</p>
                </Card>

                <Card className="p-4 border-l-4 border-l-yellow-500 bg-gray-800">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs text-gray-400 uppercase font-bold">Produtividade IA (Tarefas)</p>
                        <div className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-400"><Zap className="w-4 h-4"/></div>
                    </div>
                    <h3 className="text-2xl font-black text-white">{metrics.aiTasks.toLocaleString()}</h3>
                    <p className="text-[10px] text-gray-500 mt-1">Economia estimada: R$ 42k em salários</p>
                </Card>

                <Card className="p-4 border-l-4 border-l-purple-500 bg-gray-800">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs text-gray-400 uppercase font-bold">Engajamento Automático</p>
                        <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400"><MessageSquare className="w-4 h-4"/></div>
                    </div>
                    <h3 className="text-2xl font-black text-white">{metrics.messagesSent.toLocaleString()}</h3>
                    <p className="text-[10px] text-gray-500 mt-1">Msgs (WhatsApp + E-mail + Direct)</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 bg-gray-800 border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-brand-primary"/> Performance por Canal (24h)
                        </h3>
                        <div className="flex gap-2">
                            <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-500/20 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Tempo Real</span>
                        </div>
                    </div>
                    
                    <div className="space-y-5">
                        <div className="relative">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-white font-bold flex items-center gap-2"><Phone className="w-4 h-4 text-green-500"/> Bot WhatsApp (Evolution)</span>
                                <span className="text-green-400 font-bold">R$ 145.200 (59%)</span>
                            </div>
                            <div className="w-full bg-gray-700 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full w-[59%]"></div>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">Conversão: 12.4% • Tempo Resposta: 4s</p>
                        </div>

                        <div className="relative">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-white font-bold flex items-center gap-2"><Layers className="w-4 h-4 text-blue-500"/> Páginas de Venda (Funil)</span>
                                <span className="text-blue-400 font-bold">R$ 68.400 (28%)</span>
                            </div>
                            <div className="w-full bg-gray-700 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full w-[28%]"></div>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">Visitas: {metrics.funnelVisits.toLocaleString()} • Conv. Página: 4.8%</p>
                        </div>

                        <div className="relative">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-white font-bold flex items-center gap-2"><Mail className="w-4 h-4 text-yellow-500"/> E-mail Marketing AI</span>
                                <span className="text-yellow-400 font-bold">R$ 32.290 (13%)</span>
                            </div>
                            <div className="w-full bg-gray-700 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-yellow-500 h-full w-[13%]"></div>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">Open Rate: {metrics.emailOpenRate}% • Recuperação: R$ 12k</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gray-800 border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-500"/> Eficiência da Máquina
                    </h3>
                    
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative w-40 h-40">
                             <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-700/30" />
                                <motion.circle
                                    cx="80" cy="80" r="70"
                                    stroke="currentColor" strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray="440"
                                    strokeDashoffset="440" 
                                    animate={{ strokeDashoffset: 440 - (440 * 0.94) }} 
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    className="text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-3xl font-black text-white">94%</span>
                                <span className="text-[10px] text-gray-400 uppercase">Automação</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-gray-900 rounded border border-gray-700">
                            <span className="text-xs text-gray-400">Intervenção Humana</span>
                            <span className="text-xs font-bold text-white">6% (Baixa)</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-900 rounded border border-gray-700">
                            <span className="text-xs text-gray-400">Erros / Falhas</span>
                            <span className="text-xs font-bold text-green-400">0.02%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-900 rounded border border-gray-700">
                            <span className="text-xs text-gray-400">Uptime dos Agentes</span>
                            <span className="text-xs font-bold text-white">99.9%</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
