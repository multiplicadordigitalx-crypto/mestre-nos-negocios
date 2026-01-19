
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
// Added Clock to the imports from Icons
import { Wallet, PieChart, TrendingUp, Zap, ArrowRight, ShieldCheck, Mail, Video, FileText, Brain, PlusCircle, ShoppingBag, DollarSign, Filter, Calendar, Clock } from '../../../components/Icons';
import { useAlunoData } from '../../../hooks/useAlunoData';
import { StudentPage } from '../../../types';

const TRANSACTION_ICONS: Record<string, any> = {
    'emails_venda_ia': Mail,
    'video_maker': Video,
    'global': Zap,
    'store': DollarSign,
    'mestre_dos_negocios': Brain,
    'ugc_viral_scripts': Video,
    'copy_generator': FileText
};

export const WalletSection: React.FC<{ navigateTo: (p: StudentPage) => void }> = ({ navigateTo }) => {
    const { student } = useAlunoData();
    const [filter, setFilter] = useState<'all' | 'usage' | 'purchase'>('all');

    const buckets = student?.walletBuckets || [];
    const globalBalance = student?.creditBalance || 0;
    const transactions = student?.walletTransactions || [];

    // Filter Logic
    const filteredTransactions = transactions.filter(tx => {
        if (filter === 'all') return true;
        return tx.type === filter;
    });

    // Simulação de ROI por ferramenta para o dashboard visual
    const investmentStats = [
        { label: 'E-mails', value: 45, color: 'bg-blue-500', icon: Mail },
        { label: 'Vídeos', value: 30, color: 'bg-purple-500', icon: Video },
        { label: 'Copy/Ads', value: 25, color: 'bg-yellow-500', icon: FileText },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-yellow-500" />
                        Minha Carteira <span className="text-brand-primary">IA</span>
                    </h1>
                    <p className="text-gray-400 mt-2">Gerencie seus ativos, visualize extratos e recarregue para escalar.</p>
                </div>

                <Button
                    onClick={() => navigateTo('recharge')}
                    className="!py-4 !px-8 !bg-brand-primary text-black font-black uppercase flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform"
                >
                    <PlusCircle className="w-5 h-5" /> RECARREGAR CRÉDITOS
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Coluna 1: Bolsos e Saldos */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Saldo Global */}
                    <Card className="p-6 border-l-4 border-l-brand-primary bg-gray-800 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap className="w-20 h-20 text-brand-primary" />
                        </div>
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" /> Saldo Global (Soberano)
                            </h3>
                            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded font-bold uppercase">Multi-Uso</span>
                        </div>
                        <div className="flex items-baseline gap-2 relative z-10">
                            <span className="text-5xl font-black text-white">{globalBalance}</span>
                            <span className="text-gray-500 font-bold uppercase text-xs">Créditos Avulsos</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-4 leading-relaxed relative z-10">
                            Este saldo pode ser utilizado em qualquer ferramenta da plataforma. Seus créditos nunca expiram.
                        </p>
                    </Card>

                    {/* Bolsos Especializados */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" /> Bolsos Especializados (Por Ferramenta)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {buckets.length === 0 ? (
                                <div className="col-span-full p-8 border-2 border-dashed border-gray-700 rounded-2xl text-center text-gray-500 bg-gray-800/30">
                                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-medium">Nenhum pacote especializado ativo.</p>
                                    <p className="text-xs mt-1">Compre combos específicos para reduzir custos.</p>
                                </div>
                            ) : (
                                buckets.map(bucket => (
                                    <Card key={bucket.toolId} className="p-5 bg-gray-900 border-gray-700 hover:border-brand-primary transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-gray-800 rounded-lg text-brand-primary group-hover:bg-brand-primary group-hover:text-black transition-colors">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <span className="text-2xl font-black text-white">{bucket.balance}</span>
                                        </div>
                                        <p className="text-sm font-bold text-white uppercase">{bucket.label}</p>
                                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tight">Válido para: {bucket.toolId.replace(/_/g, ' ')}</p>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* EXTRATO DE ATIVOS (Movido para cá) */}
                    <div className="pt-6 border-t border-gray-700">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-400" /> Extrato de Movimentações
                            </h3>
                            <div className="flex bg-gray-800 p-1 rounded-lg">
                                {['all', 'usage', 'purchase'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f as any)}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all capitalize ${filter === f ? 'bg-brand-primary text-black' : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {f === 'all' ? 'Tudo' : f === 'usage' ? 'Uso' : 'Compras'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {filteredTransactions.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                                    Nenhuma movimentação encontrada neste filtro.
                                </div>
                            ) : (
                                filteredTransactions.map((tx, idx) => {
                                    const Icon = TRANSACTION_ICONS[tx.toolId] || Zap;
                                    const isPositive = tx.amount > 0;

                                    return (
                                        <motion.div
                                            key={tx.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center justify-between hover:border-gray-600 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {isPositive ? <DollarSign className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm">{tx.description}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" /> {new Date(tx.timestamp).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                            {/* Fixed Clock missing error on next line */}
                                                            <Clock className="w-3 h-3" /> {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className={`text-[9px] px-1.5 rounded uppercase border ${tx.pocketUsed === 'specialized' ? 'text-purple-400 border-purple-500/30 bg-purple-500/10' : 'text-gray-400 border-gray-600 bg-gray-700/30'}`}>
                                                            {tx.pocketUsed === 'specialized' ? 'Bolso Específico' : 'Global'}
                                                        </span>
                                                        {tx.gatewayId && (
                                                            <span className="text-[9px] font-mono text-gray-400 bg-gray-900 px-1.5 rounded border border-gray-700">Ref: {tx.gatewayId}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-black ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                                    {isPositive ? '+' : ''}{tx.amount}
                                                </p>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Créditos</p>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Coluna 2: Análise e Sugestões */}
                <div className="space-y-6">
                    <Card className="p-6 bg-gray-800 border-gray-700 shadow-xl">
                        <h3 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-purple-400" /> Distribuição de Uso (IA)
                        </h3>
                        <div className="flex justify-center mb-8">
                            <div className="relative w-40 h-40">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="15" fill="transparent" className="text-gray-700/30" />
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="15" fill="transparent" strokeDasharray="440" strokeDashoffset="242" className="text-blue-500" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <TrendingUp className="w-8 h-8 text-white opacity-20" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {investmentStats.map(item => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                        <span className="text-xs text-gray-400 font-medium">{item.label}</span>
                                    </div>
                                    <span className="text-xs font-bold text-white">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-6 rounded-2xl border border-purple-500/20">
                        <h4 className="text-purple-400 font-bold text-xs uppercase mb-3 flex items-center gap-2">
                            <Brain className="w-4 h-4" /> Nexus Advisory
                        </h4>
                        <p className="text-xs text-gray-300 leading-relaxed italic">
                            "Com base no seu histórico, detectamos alta performance em seus disparos de e-mail. Para escalar seu ROI, recomendamos adquirir o 'Pack Especialista em E-mail' e reduzir o custo por disparo em 40%."
                        </p>
                        <Button
                            onClick={() => navigateTo('recharge')}
                            className="w-full mt-4 !py-2 !text-xs !bg-purple-600 hover:!bg-purple-500 font-bold"
                        >
                            VER PACOTE RECOMENDADO
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
