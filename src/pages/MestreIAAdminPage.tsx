
import React, { useState, useEffect, useMemo } from 'react';
import { Crown, TrendingUp, Users, Zap, Settings, DollarSign, ActivityIcon, Save, Download, Trash, PlusCircle, Search, CheckCircle, AlertTriangle, X as XIcon, LockClosed, PieChart, BarChart3, Filter, Clock, Link as LinkIcon, ClipboardCopy, Key, ShoppingBag, CreditCard, PlayCircle, FileText, Database, RefreshCw, ShieldAlert, Coins, UserCog, Table, Pencil, HeartPulse, Server, Globe, ShieldCheck, Brain, Mail as MailIcon, Robot, Film, Image } from '../components/Icons';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getSystemSettings, saveSystemSettings, getCustomPrompts, saveCustomPrompt, getUsageLimit, updateUsageLimit, toggleEmergencyStop, resetCurrentUsage } from '../services/mockFirebase';
import { UsageLimit } from '../types';
import { MESTRE_IA_PROMPTS } from '../services/prompts';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { GuardianMonitor } from './admin/mestre-ia/components/GuardianMonitor';
import { AiCostWidget } from './admin/mestre-ia/components/AiCostWidget';
import { FLOWS_CONFIG } from './mestre-ia/data/flows';

interface MestreIAAdminPageProps {
    onTestMode?: () => void;
    onUseTool?: () => void;
}

const DetailModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[80] p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-800 w-full max-w-4xl rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-2xl flex-shrink-0">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ActivityIcon className="w-6 h-6 text-brand-primary" /> {title}
                    </h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-800 rounded-b-2xl">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

const MestreIAAdminPage: React.FC<MestreIAAdminPageProps> = ({ onTestMode, onUseTool }) => {
    const [stats, setStats] = useState({
        faturamento: 122000,
        recordeFaturamento: 115000,
        tarefasHoje: 4821,
        tarefasOntem: 4100,
        alunosAtivos: 1683,
        creditosVendidos: 24500,
    });

    const [activeModal, setActiveModal] = useState<'revenue' | 'tasks' | 'students' | 'credits' | 'settings' | null>(null);

    const isRecord = stats.faturamento > stats.recordeFaturamento;
    const growth = ((stats.tarefasHoje - stats.tarefasOntem) / stats.tarefasOntem) * 100;
    const isHighGrowth = growth > 10;

    const flowUsageStats = useMemo(() => [
        { label: 'Mestre dos Negócios 👔', val: 15, color: 'bg-blue-600' },
        { label: 'Vendas Hoje 💰', val: 12, color: 'bg-green-500' },
        { label: 'Kwai Turbinado 🔥', val: 10, color: 'bg-orange-500' },
        { label: 'InfoProduto PDF 📄', val: 8, color: 'bg-indigo-500' },
        { label: 'UGC Automático 🤳', val: 7, color: 'bg-yellow-400' },
        { label: 'Logomarcas ✒️', val: 6, color: 'bg-red-600' },
        { label: 'Páginas de Venda 🚀', val: 6, color: 'bg-purple-600' },
        { label: 'Conteúdo Viral 🔥', val: 5, color: 'bg-pink-500' },
        { label: 'Criativos & Arts 🎨', val: 5, color: 'bg-pink-400' },
        { label: 'SEO Otimizador 📈', val: 4, color: 'bg-green-600' },
        { label: 'Roteiros UGC 🎥', val: 4, color: 'bg-yellow-500' },
        { label: 'Google Ads 🗂️', val: 3, color: 'bg-red-500' },
        { label: 'Meta Ads 📱', val: 3, color: 'bg-blue-500' },
        { label: 'Lançamento 🎯', val: 2, color: 'bg-red-600' },
        { label: 'Influencer Strategy 🌟', val: 2, color: 'bg-yellow-400' },
        { label: 'Email Marketing 📧', val: 2, color: 'bg-yellow-500' },
        { label: 'Thumbnails 🖼️', val: 1, color: 'bg-blue-400' },
        { label: 'Ofertas 💎', val: 1, color: 'bg-teal-400' },
        { label: 'Espiar Concorrente 🔍', val: 1, color: 'bg-rose-500' },
        { label: 'Planejar Mês 📅', val: 1, color: 'bg-amber-500' },
        { label: 'TikTok Ads 🎵', val: 1, color: 'bg-fuchsia-500' },
        { label: 'YouTube Zero ▶️', val: 0.5, color: 'bg-red-700' },
        { label: 'Traffic Squad 👥', val: 0.2, color: 'bg-indigo-600' },
        { label: 'Recover Cart 🛒', val: 0.2, color: 'bg-orange-400' },
        { label: 'WhatsApp 1x1 💬', val: 0.1, color: 'bg-green-600' },
    ], []);

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                tarefasHoje: prev.tarefasHoje + Math.floor(Math.random() * 5),
                faturamento: prev.faturamento + (Math.random() > 0.8 ? 97 : 0)
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-4 lg:p-6 animate-fade-in space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-primary/10 rounded-lg border border-brand-primary/20">
                        <Crown className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">Mestre IA <span className="text-brand-primary">Analytics</span></h1>
                        <p className="text-xs text-gray-400">Visibilidade completa das {FLOWS_CONFIG.length} ferramentas estratégicas.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveModal('settings')}
                        className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition border border-gray-700 group flex items-center justify-center"
                        title="Configurações Gerais"
                    >
                        <Settings className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    </button>
                    <button
                        onClick={onUseTool}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 px-4 rounded-full shadow-md shadow-purple-900/20 flex items-center gap-2 transition"
                    >
                        <PlayCircle className="w-3 h-3" />
                        USAR FERRAMENTA ({FLOWS_CONFIG.length})
                    </button>
                    <button
                        onClick={onTestMode}
                        className="bg-gradient-to-r from-brand-primary to-yellow-500 hover:from-yellow-500 hover:to-brand-primary 
                        text-black font-bold text-xs py-2 px-4 rounded-full 
                        shadow-md shadow-brand-primary/20 flex items-center gap-2 transform hover:scale-105 transition"
                    >
                        <Crown className="w-3 h-3" />
                        TESTAR COMO ALUNO
                    </button>
                </div>
            </div>

            <GuardianMonitor />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div onClick={() => setActiveModal('revenue')} className="bg-gray-800 border border-gray-700 p-3 rounded-xl flex flex-col justify-between hover:border-brand-primary transition-all cursor-pointer shadow-sm group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-1 relative z-10">
                        <div className="p-1.5 bg-brand-primary/10 rounded-lg text-brand-primary group-hover:bg-brand-primary group-hover:text-black transition-colors">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        {isRecord && <span className="text-[9px] font-bold bg-yellow-500 text-black px-2 py-0.5 rounded-full animate-pulse">Recorde 🔥</span>}
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Faturamento IA</p>
                        <p className="text-lg font-black text-white group-hover:text-brand-primary transition-colors">R$ {stats.faturamento.toLocaleString()}</p>
                    </div>
                </div>

                <div onClick={() => setActiveModal('tasks')} className="bg-gray-800 border border-gray-700 p-3 rounded-xl flex flex-col justify-between hover:border-blue-500 transition-all cursor-pointer shadow-sm group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-1 relative z-10">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        {isHighGrowth && <span className="text-green-400 text-[10px] font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">+{growth.toFixed(1)}%</span>}
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Tarefas Hoje</p>
                        <p className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">{stats.tarefasHoje.toLocaleString()}</p>
                    </div>
                </div>

                <div onClick={() => setActiveModal('students')} className="bg-gray-800 border border-gray-700 p-3 rounded-xl flex flex-col justify-between hover:border-purple-500 transition-all cursor-pointer shadow-sm group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-1 relative z-10">
                        <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Alunos Ativos</p>
                        <p className="text-lg font-black text-white group-hover:text-purple-400 transition-colors">{stats.alunosAtivos.toLocaleString()}</p>
                    </div>
                </div>

                <div onClick={() => setActiveModal('credits')} className="bg-gray-800 border border-gray-700 p-3 rounded-xl flex flex-col justify-between hover:border-green-500 transition-all cursor-pointer shadow-sm group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-1 relative z-10">
                        <div className="p-1.5 bg-green-500/10 rounded-lg text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <Zap className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Créditos Vendidos</p>
                        <p className="text-lg font-black text-white group-hover:text-green-400 transition-colors">{stats.creditosVendidos.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="w-full bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <ActivityIcon className="w-4 h-4 text-brand-primary" /> Atividade Recente (Tarefas/Hora)
                        </h3>
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Ao Vivo
                        </span>
                    </div>
                    <div className="h-40 flex items-end gap-2 md:gap-3">
                        {[35, 50, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                            <div key={i} className="flex-1 bg-gray-700/30 rounded-t relative group hover:bg-brand-primary/10 transition-colors h-full flex items-end">
                                <div
                                    className="w-full bg-brand-primary rounded-t transition-all duration-500 ease-out group-hover:bg-yellow-400 opacity-90"
                                    style={{ height: `${h}%` }}
                                ></div>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none border border-gray-700 shadow-lg">
                                    {h * 12} tarefas
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-sm flex flex-col h-full">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" /> Popularidade das {FLOWS_CONFIG.length} Ferramentas (%)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto pr-2 max-h-[400px] lg:max-h-[600px] custom-scrollbar">
                        {flowUsageStats.map((item) => (
                            <div key={item.label} className="w-full bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                                <div className="flex justify-between text-xs text-gray-200 mb-1.5">
                                    <span className="truncate mr-2 font-bold" title={item.label}>{item.label}</span>
                                    <span className="font-bold">{item.val}%</span>
                                </div>
                                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 animate-fade-in">
                <AiCostWidget />
            </div>

            <DetailModal isOpen={activeModal === 'revenue'} onClose={() => setActiveModal(null)} title="Relatório Financeiro Detalhado">
                <div className="space-y-4 p-4 text-center text-gray-400">
                    <DollarSign className="w-16 h-16 mx-auto mb-2 opacity-20" />
                    <p>Análise completa de lucro por card e margem de API.</p>
                </div>
            </DetailModal>
        </div>
    );
};

export default MestreIAAdminPage;
