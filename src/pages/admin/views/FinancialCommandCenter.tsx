
import React, { useState, useEffect } from 'react';
import {
    DollarSign, TrendingUp, PieChart, CreditCard,
    ShieldCheck, ArrowUpRight, BarChart3, Filter, Calendar,
    MoreVertical, Download, Eye, Layers, Settings, User as UserIcon, Users, Package, MessageSquare, Search
} from '../../../components/Icons';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { ProductFinanceStats } from '../../../types/legacy';
import { loadJSON, getProducerWallet } from '../../../services/mockFirebase';
import { SharedWithdrawalModal } from '../../../components/modals/SharedWithdrawalModal';
import { NexusFinanceAgent } from '../components/NexusFinanceAgent';
import { SeasonalFilterDropdown, SeasonalCampaign } from '../components/SeasonalFilterDropdown';
import { FinancialGoalGauge } from '../components/FinancialGoalGauge';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { DeepEntityAuditModal } from '../modals/DeepEntityAuditModal';
import { getGlobalPlatformStats, getWinningProducts } from '../../../services/mockFirebase';
import { WinningProduct } from '../../../types/legacy';

export const FinancialCommandCenter: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<any>('30d');
    const [stats, setStats] = useState({
        totalNetRevenue: 0,
        ownSalesVolume: 0,
        platformFees: 0,
        totalLiability: 0,
        corporateBalance: 0
    });

    const [globalPlatformStats, setGlobalPlatformStats] = useState<any>(null);
    const [winningPlatformProducts, setWinningPlatformProducts] = useState<WinningProduct[]>([]);
    const [winningPartnerProducts, setWinningPartnerProducts] = useState<WinningProduct[]>([]);
    const [activeWinningTab, setActiveWinningTab] = useState<'platform' | 'partner'>('platform');

    // Search and Audit State
    const [searchTerm, setSearchTerm] = useState('');
    const [auditEntity, setAuditEntity] = useState<{ type: 'student' | 'product', id: string } | null>(null);

    // Financial Goals & Costs State
    const [monthlyGoal, setMonthlyGoal] = useState(150000); // R$ 150k target
    const [operationalCosts, setOperationalCosts] = useState(12500); // R$ 12.5k fixed costs

    const [ownProducts, setOwnProducts] = useState<ProductFinanceStats[]>([]);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [activePnlProduct, setActivePnlProduct] = useState<ProductFinanceStats | null>(null);

    // Derived Metrics & Helpers
    const getMultiplier = (range: string) => {
        switch (range) {
            case 'today': return 0.03;
            case '7d': return 0.25;
            case 'black_friday': return 2.0;
            case 'trim1': return 3.0;
            case 'trim2': return 3.2;
            case 'sem1': return 6.0;
            case 'year': return 12.0;
            default: return 1;
        }
    };

    const multiplier = getMultiplier(dateRange);
    const bottomLine = stats.totalNetRevenue - (operationalCosts * (multiplier > 1 ? multiplier : 1)); // Lucro Real
    const projectedRevenue = stats.totalNetRevenue * (dateRange === '30d' ? 1.2 : 1);

    useEffect(() => {
        loadData();
    }, [dateRange]);

    const loadData = async () => {
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 600));

            const [allProducts, wallet, gStats, winPlat, winPart] = await Promise.all([
                loadJSON<ProductFinanceStats[]>('mockProductFinanceStats', []),
                getProducerWallet(),
                getGlobalPlatformStats(),
                getWinningProducts('platform'),
                getWinningProducts('partner')
            ]);

            const mult = getMultiplier(dateRange);
            const myProducts = allProducts.filter(p => p.productId === 'credit_recharges_global' || p.productId.includes('official'));

            let fees = 0;
            let ownSales = 0;

            allProducts.forEach(p => {
                fees += p.costs.platformFees * mult;
                if (p.productId === 'credit_recharges_global' || p.productId.includes('official')) {
                    ownSales += p.netProfit * mult;
                }
            });

            setStats({
                totalNetRevenue: fees + ownSales,
                ownSalesVolume: ownSales,
                platformFees: fees,
                totalLiability: 45000,
                corporateBalance: wallet.balance
            });

            setGlobalPlatformStats(gStats);
            setWinningPlatformProducts(winPlat);
            setWinningPartnerProducts(winPart);
            setOwnProducts(myProducts);

        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeepSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm) return;

        // Simple heuristic: if it has 'win', it's a product, else student (for this demo)
        const type = searchTerm.includes('win') || searchTerm.includes('official') ? 'product' : 'student';
        setAuditEntity({ type, id: searchTerm });
        setSearchTerm('');
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Nexus Intelligence Center</h2>
                    <p className="text-gray-400">Auditoria Financeira, Propriedade Direta e Deep Intel</p>
                </div>

                <div className="flex items-center gap-3">
                    <form onSubmit={handleDeepSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Buscar Aluno ou Produto (#id)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 pl-10 text-sm text-white focus:border-brand-primary outline-none transition-all w-64"
                        />
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                    </form>
                    <SeasonalFilterDropdown value={dateRange} onChange={setDateRange} />
                </div>
            </div>

            {/* 1. Global Platform Stats Strip */}
            {globalPlatformStats && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        { label: 'Total Produtos', value: globalPlatformStats.totalProducts, icon: Package, color: 'text-blue-400' },
                        { label: 'Total Alunos', value: globalPlatformStats.totalStudents, icon: UserIcon, color: 'text-green-400' },
                        { label: 'Parceiros Nexus', value: globalPlatformStats.totalPartners, icon: Users, color: 'text-purple-400' },
                        { label: 'Equipe Comercial', value: globalPlatformStats.totalCommercialTeam, icon: DollarSign, color: 'text-yellow-400' },
                        { label: 'Suporte Ativo', value: globalPlatformStats.activeSupportAgents, icon: MessageSquare, color: 'text-orange-400' },
                    ].map((s, idx) => (
                        <div key={idx} className="bg-gray-800/50 p-3 rounded-2xl border border-gray-700 flex items-center gap-3">
                            <div className={`p-2 bg-gray-900 rounded-xl ${s.color}`}>
                                <s.icon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">{s.label}</p>
                                <h4 className="text-sm font-bold text-white">{s.value.toLocaleString()}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 2. Nexus CFO AI Agent */}
            <NexusFinanceAgent />

            {/* 3. Main KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* ... existing KPIs ... */}
                <div className="md:col-span-1">
                    <FinancialGoalGauge currentAmount={stats.totalNetRevenue} targetAmount={monthlyGoal} projectedAmount={projectedRevenue} />
                </div>

                <Card className="bg-gray-800 p-6 relative overflow-hidden group border-t-4 border-t-brand-primary md:col-span-1 flex flex-col justify-center">
                    <p className="text-gray-400 font-bold text-xs uppercase mb-2">Receita Líquida (Operacional)</p>
                    <h3 className="text-3xl font-black text-white mb-1">
                        R$ {stats.totalNetRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                    <div className="text-xs text-gray-500 mt-2 space-y-1">
                        <div className="flex justify-between">
                            <span>Vendas Próprias:</span>
                            <span className="text-gray-300">R$ {stats.ownSalesVolume.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Taxas (Comissões):</span>
                            <span className="text-gray-300">R$ {stats.platformFees.toLocaleString()}</span>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gray-900 border border-gray-700 p-6 relative overflow-hidden group md:col-span-1 flex flex-col justify-center">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Layers className="w-16 h-16 text-white" /></div>
                    <p className="text-gray-400 font-bold text-xs uppercase mb-2">Lucro Corporativo Real (Net)</p>
                    <h3 className={`text-3xl font-black mb-1 ${bottomLine >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        R$ {bottomLine.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-2">Dedução de custos op (R$ {(operationalCosts * (multiplier > 1 ? multiplier : 1)).toLocaleString()}).</p>
                </Card>

                <Card className="bg-green-900/10 border-green-500/30 p-6 flex flex-col justify-between relative overflow-hidden md:col-span-1">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="w-16 h-16 text-green-400" /></div>
                    <div>
                        <p className="text-green-400 font-bold text-xs uppercase mb-1">Caixa Disponível</p>
                        <h3 className="text-3xl font-black text-white">R$ {stats.corporateBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    </div>
                    <Button onClick={() => setIsWithdrawModalOpen(true)} className="mt-4 !bg-green-600 hover:!bg-green-500 shadow-lg shadow-green-900/40 w-full uppercase font-bold text-xs">Sacar Dividendos</Button>
                </Card>
            </div>

            {/* 4. Winning Products & Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-800 rounded-3xl border border-gray-700 overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-brand-primary" />
                                Produtos Vencedores & Propriedade
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Análise de tração e margem direta vs. parceiros.</p>
                        </div>
                        <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700">
                            <button
                                onClick={() => setActiveWinningTab('platform')}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeWinningTab === 'platform' ? 'bg-brand-primary text-black' : 'text-gray-400 hover:text-white'}`}
                            >
                                Próprios (Oficiais)
                            </button>
                            <button
                                onClick={() => setActiveWinningTab('partner')}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeWinningTab === 'partner' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Parceiros Nexus
                            </button>
                        </div>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(activeWinningTab === 'platform' ? winningPlatformProducts : winningPartnerProducts).map((product, idx) => (
                            <div key={idx} className="bg-gray-900 p-4 rounded-2xl border border-gray-700 hover:border-brand-primary/30 transition-all group flex flex-col justify-between h-40">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="text-white font-bold text-sm line-clamp-1">{product.name}</h4>
                                        <span className="text-[10px] text-gray-500 font-mono">#{product.id}</span>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${product.status === 'high_performance' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {product.status.replace('_', ' ')}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <div className="bg-gray-800/50 p-2 rounded-lg">
                                        <p className="text-[9px] text-gray-500 font-bold uppercase">Volume</p>
                                        <p className="text-sm font-black text-white">{product.unitsSold.toLocaleString()} un</p>
                                    </div>
                                    <div className="bg-gray-800/50 p-2 rounded-lg text-right">
                                        <p className="text-[9px] text-gray-500 font-bold uppercase">Margem</p>
                                        <p className="text-sm font-black text-green-400">{product.netMargin}%</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setAuditEntity({ type: 'product', id: product.id })}
                                    className="mt-3 text-[10px] font-bold text-brand-primary flex items-center gap-1 hover:translate-x-1 transition-all"
                                >
                                    Auditoria Deep Intel <ArrowUpRight className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800 rounded-3xl border border-gray-700 overflow-hidden flex flex-col shadow-2xl">
                    <div className="p-6 border-b border-gray-700 bg-gray-900/50">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-yellow-500" />
                            Fechamentos Periódicos
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Projeção de Resultado</p>
                            <div className="bg-gray-900 p-4 rounded-2xl border border-gray-700">
                                <p className="text-2xl font-black text-white">R$ {(stats.totalNetRevenue * 1.5).toLocaleString()}</p>
                                <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                                    <TrendingUp className="w-3 h-3" /> +18% vs período anterior
                                </p>
                            </div>
                        </div>
                        <div className="h-px bg-gray-700"></div>
                        <div className="grid grid-cols-2 gap-3">
                            {['trim1', 'trim2', 'sem1', 'year'].map((range: any) => (
                                <button
                                    key={range}
                                    onClick={() => setDateRange(range)}
                                    className={`p-3 rounded-xl border font-bold text-xs uppercase transition-all ${dateRange === range ? 'bg-brand-primary border-brand-primary text-black' : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white'}`}
                                >
                                    {range === 'trim1' ? '1º Trimestre' : range === 'trim2' ? '2º Trimestre' : range === 'sem1' ? '1º Semestre' : 'Balanço Anual'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {auditEntity && (
                    <DeepEntityAuditModal
                        type={auditEntity.type}
                        entityId={auditEntity.id}
                        onClose={() => setAuditEntity(null)}
                    />
                )}
            </AnimatePresence>

            {isWithdrawModalOpen && (
                <SharedWithdrawalModal
                    isOpen={isWithdrawModalOpen}
                    onClose={() => setIsWithdrawModalOpen(false)}
                    balance={stats.corporateBalance}
                    producerId="admin-01"
                    producerName="Mestre nos Negócios (Sede)"
                    pixKey="33.444.555/0001-99"
                    bankInfo="Banco Inter (077)"
                    sourceType="manual_sales"
                    onSuccess={() => {
                        toast.success("Saque Solicitado!");
                        loadData();
                    }}
                />
            )}
        </div>
    );
};
