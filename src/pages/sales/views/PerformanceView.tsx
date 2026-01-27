
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SalesPerson } from '@/types';
import {
    ActivityIcon, BarChart3, Brain, Zap, Sparkles, Trophy,
    DollarSign, ShoppingBag
} from '@/components/Icons';
import Card from '@/components/Card';
import RankingSection from '@/components/RankingSection';
import CampaignBanner from '@/components/CampaignBanner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getSalesCoachTips } from '@/services/mestreIaService';

interface PerformanceViewProps {
    salesPerson: SalesPerson;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({ salesPerson }) => {
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
    const [aiTips, setAiTips] = useState<{ tips: string[], top1_insight: string }>({ tips: [], top1_insight: '' });
    const [loadingTips, setLoadingTips] = useState(false);

    const stats = useMemo(() => {
        let multiplier = 1;
        if (period === 'week') multiplier = 7;
        if (period === 'month') multiplier = 30;
        return {
            leads: Math.floor(42 * multiplier * (0.8 + Math.random() * 0.4)),
            sales: Math.floor(salesPerson.salesToday * multiplier * (0.8 + Math.random() * 0.4)),
            revenue: salesPerson.revenueToday * multiplier,
            conversion: ((Math.floor(salesPerson.salesToday * multiplier) / Math.floor(42 * multiplier)) * 100).toFixed(1) + '%'
        };
    }, [period, salesPerson]);

    useEffect(() => {
        setLoadingTips(true);
        getSalesCoachTips(salesPerson.displayName || 'Vendedor', stats).then(res => {
            setAiTips(res);
            setLoadingTips(false);
        });
    }, [period]);

    const chartData = useMemo(() => {
        const points = period === 'day' ? 12 : period === 'week' ? 7 : 12;
        return Array.from({ length: points }).map((_, i) => {
            const leads = Math.floor(Math.random() * 80) + 20;
            const sales = Math.floor(leads * (Math.random() * 0.3));
            return { leads, sales, label: period === 'day' ? `${i * 2}h` : period === 'week' ? `Dia ${i + 1}` : `Sem ${i + 1}` };
        });
    }, [period]);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 h-full overflow-y-auto pb-20 custom-scrollbar pr-2">
            <CampaignBanner user={salesPerson} />

            {/* CARD DICAS NEXUS IA */}
            <div className="bg-gradient-to-br from-purple-900/40 via-gray-900 to-gray-900 border border-purple-500/30 p-6 rounded-2xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Brain className="w-32 h-32 text-purple-500" /></div>
                <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-purple-600 rounded-lg shadow-lg">
                                <Sparkles className="w-5 h-5 text-white animate-pulse" />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Dicas Nexus: Comportamento de Elite</h3>
                        </div>

                        {loadingTips ? (
                            <div className="flex items-center gap-3 text-gray-500 text-sm"><LoadingSpinner size="sm" /> Coletando padrões do Top 1...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    {aiTips.tips.map((tip, i) => (
                                        <div key={i} className="flex gap-3 items-start">
                                            <div className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                                <Zap className="w-3 h-3 text-green-400" />
                                            </div>
                                            <p className="text-xs text-gray-300 leading-relaxed">{tip}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-black/40 p-4 rounded-xl border border-gray-800">
                                    <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Trophy className="w-3 h-3" /> Insight do Líder da Semana
                                    </p>
                                    <p className="text-xs text-gray-400 italic">"{aiTips.top1_insight}"</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-2 gap-4">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <ActivityIcon className="w-7 h-7 text-brand-primary" /> Performance Comercial
                </h2>
                <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700 shadow-lg">
                    {(['day', 'week', 'month'] as const).map(p => (
                        <button key={p} onClick={() => setPeriod(p)} className={`px-5 py-2 rounded-lg text-xs font-black uppercase transition-all ${period === p ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>{p === 'day' ? 'Hoje' : p === 'week' ? '7 Dias' : '30 Dias'}</button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 border-l-4 border-l-blue-500 bg-gray-900 shadow-xl"><p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Leads Atendidos</p><h3 className="text-3xl font-black text-white mt-1">{stats.leads}</h3></Card>
                <Card className="p-5 border-l-4 border-l-green-500 bg-gray-900 shadow-xl"><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Vendas Fechadas</p><h3 className="text-3xl font-black text-green-400 mt-1">{stats.sales}</h3></Card>
                <Card className="p-5 border-l-4 border-l-yellow-500 bg-gray-900 shadow-xl"><p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Sua Comissão</p><h3 className="text-3xl font-black text-yellow-400 mt-1">R$ {(stats.revenue * 0.1).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3></Card>
                <Card className="p-5 border-l-4 border-l-purple-500 bg-gray-900 shadow-xl"><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Taxa Conversão</p><h3 className="text-3xl font-black text-white mt-1">{stats.conversion}</h3></Card>
            </div>

            {/* CHART & RANKING SECTION - REPOSITIONED FOR BETTER RESPONSIVENESS */}
            <div className="flex flex-col gap-8">
                <Card className="w-full p-6 bg-gray-900 border-gray-800 flex flex-col h-[400px] shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-black text-white uppercase text-sm tracking-widest flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500" /> Performance de Vendas</h3>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase">Métrica: <span className="text-blue-500 font-bold">Atendimento</span> vs <span className="text-brand-primary font-bold">Conversão</span></p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-600"></div><span className="text-[9px] text-gray-500 font-bold uppercase">Leads</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-brand-primary"></div><span className="text-[9px] text-gray-500 font-bold uppercase">Vendas</span></div>
                        </div>
                    </div>
                    <div className="flex-1 flex items-end gap-3 px-2 pb-2">
                        {chartData.map((d, i) => (
                            <div key={i} className="flex-1 bg-blue-900/10 rounded-t-lg relative group h-full flex flex-col justify-end">
                                <motion.div initial={{ height: 0 }} animate={{ height: `${(d.leads / 100) * 100}%` }} className="w-full bg-blue-600/40 rounded-t-lg relative flex flex-col justify-end">
                                    <motion.div initial={{ height: 0 }} animate={{ height: `${(d.sales / d.leads) * 100}%` }} className="w-full bg-brand-primary rounded-t-sm shadow-lg shadow-yellow-500/10" />
                                </motion.div>
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-2xl border border-gray-200">
                                    <p className="text-blue-600">Atendimentos: {d.leads}</p>
                                    <p className="text-yellow-600">Vendas: {d.sales}</p>
                                    <p className="text-black border-t border-gray-100 mt-1 pt-1">Conv: {((d.sales / d.leads) * 100).toFixed(0)}%</p>
                                </div>
                                <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[9px] text-gray-600 font-bold uppercase">{d.label}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <RankingSection title="Elite Comercial & Rankings" className="w-full" />
            </div>
        </motion.div>
    );
};
