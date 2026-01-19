import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { RefundRequest, ProductFinanceStats, ProducerWallet } from '../../types/legacy';
import { mockRefundRequests, sendSystemNotification, loadJSON, getProductFinanceStats, getProducerWallet, getStudentWalletBalance } from '../../services/mockFirebase';
import { DollarSign, CheckCircle, Clock, ArrowLeft, ArrowRight, BarChart2, TrendingUp, TrendingDown, Layers, Monitor, Briefcase, PlusCircle, FileText, Wallet, ArrowLeftRight, ShoppingCart } from '../../components/Icons';
import Button from '../../components/Button';
import { NexusConsultancyModal } from './modals/NexusConsultancyModal';
import { CreditShopModal } from './modals/CreditShopModal';
import { WalletTransferModal } from './modals/WalletTransferModal';
import { SharedWithdrawalModal } from '../../components/modals/SharedWithdrawalModal';
import { WithdrawalRequest } from '../../types/legacy';
import { getWithdrawalQueue } from '../../services/mockFirebase';
import { toast } from 'react-hot-toast';

export const ProducerFinancePage: React.FC = () => {
    const { user } = useAuth();
    const [productStats, setProductStats] = useState<ProductFinanceStats[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('all');
    const [consultancyProduct, setConsultancyProduct] = useState<{ id: string, name: string } | null>(null);
    const [refunds, setRefunds] = useState<RefundRequest[]>([]);
    const [wallet, setWallet] = useState<ProducerWallet | null>(null);

    // Unified Wallet State
    const [studentBalance, setStudentBalance] = useState<number>(0);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [shopTarget, setShopTarget] = useState<'student' | 'producer'>('producer');
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [pendingWithdrawals, setPendingWithdrawals] = useState<WithdrawalRequest[]>([]);

    // UI State
    const [activeTab, setActiveTab] = useState<'overview' | 'wallet' | 'refunds'>('overview');
    const [extratoFilter, setExtratoFilter] = useState<number>(30); // Default 30 days
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
        const interval = setInterval(() => {
            setRefunds(current => [...current]);
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        const data = loadJSON('mockRefundRequests', mockRefundRequests);
        setRefunds(data);
        const stats = await getProductFinanceStats();
        setProductStats(stats);

        await loadWalletData();
    };

    const loadWalletData = async () => {
        const walletData = await getProducerWallet();
        setWallet(walletData);
        const sBal = await getStudentWalletBalance('student-01');
        setStudentBalance(sBal);

        // Load Withdrawals
        const queue = await getWithdrawalQueue();
        setPendingWithdrawals(queue.filter(q => q.producerId === walletData.producerId && (q.status === 'pending' || q.status === 'processing')));
    };

    const handleSendRetentionLink = async (refundId: string, studentName: string) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        const retentionLink = `https://mestre-nos-negocios.nexus/reverter/${refundId}`;
        await sendSystemNotification('whatsapp', studentName, 'video_retention', { message: `Olá ${studentName}, vimos que solicitou reembolso. Antes de continuarmos, o produtor gravou um vídeo especial para você: ${retentionLink}` });
        await sendSystemNotification('email', studentName, 'refund_retention', { subject: 'Mensagem importante sobre seu reembolso', message: `Clique aqui para ver a mensagem do produtor: ${retentionLink}` });
        toast.success('Link de reversão enviado com sucesso!');
        setLoading(false);
    };

    const handleApproveRefund = async (refundId: string) => {
        if (!confirm('Tem certeza que deseja processar este reembolso imediatamente? Esta ação é irreversível.')) return;
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefunds(current => current.map(r => r.id === refundId ? { ...r, status: 'refunded', processedAt: new Date().toISOString() } : r));
        toast.success('Reembolso processado com sucesso.');
        setLoading(false);
    };

    const handleOpenShop = (target: 'student' | 'producer') => {
        setShopTarget(target);
        setIsShopOpen(true);
    };

    const getTimeRemaining = (deadline: string) => {
        const total = Date.parse(deadline) - Date.parse(new Date().toISOString());
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        return total > 0 ? `${hours}h ${minutes}m` : 'Expirado';
    };

    const pendingRefunds = refunds.filter(r => r.status === 'pending_retention');
    const selectedStat = selectedProductId === 'all' ? null : productStats.find(p => p.productId === selectedProductId);

    return (
        <div className="h-full flex flex-col overflow-hidden text-white">
            {consultancyProduct && (
                <NexusConsultancyModal productId={consultancyProduct.id} productName={consultancyProduct.name} onClose={() => setConsultancyProduct(null)} />
            )}

            {/* MODALS */}
            {isShopOpen && (
                <CreditShopModal
                    target={shopTarget}
                    onClose={() => setIsShopOpen(false)}
                    onSuccess={loadWalletData}
                />
            )}
            {isTransferOpen && wallet && (
                <WalletTransferModal
                    producerId={wallet.producerId}
                    onClose={() => setIsTransferOpen(false)}
                    onSuccess={loadWalletData}
                />
            )}
            {isWithdrawModalOpen && wallet && (
                <SharedWithdrawalModal
                    isOpen={isWithdrawModalOpen}
                    onClose={() => setIsWithdrawModalOpen(false)}
                    balance={wallet.balance}
                    producerId={wallet.producerId}
                    producerName={user?.displayName || 'Produtor'}
                    pixKey={user?.producerData?.pixKey}
                    bankInfo={`${user?.producerData?.bank || ''} - Ag: ${user?.producerData?.agency || ''}`}
                    sourceType="manual_sales"
                    onSuccess={loadWalletData}
                />
            )}

            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <DollarSign className="text-green-400 w-8 h-8" /> Financeiro
                    </h1>
                    <p className="text-gray-400 mt-2">Gerencie seus ganhos, carteira unificada e reembolsos.</p>
                </div>
                <div>
                    <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 outline-none"
                    >
                        <option value="all">Visão Geral (Todos os Produtos)</option>
                        {productStats.map(product => (
                            <option key={product.productId} value={product.productId}>{product.productName}</option>
                        ))}
                    </select>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-700 mb-6 overflow-x-auto">
                <button onClick={() => setActiveTab('overview')} className={`pb-3 px-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-white'}`}>
                    {selectedStat ? 'DRE do Produto' : 'Visão Geral'}
                </button>
                <button onClick={() => setActiveTab('wallet')} className={`pb-3 px-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'wallet' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-white'}`}>
                    <Briefcase className="w-4 h-4" /> Carteira de Creditos
                </button>
                <button onClick={() => setActiveTab('refunds')} className={`pb-3 px-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'refunds' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-white'}`}>
                    Reembolsos {pendingRefunds.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingRefunds.length}</span>}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
                {activeTab === 'overview' && (
                    <>
                        {selectedStat ? (
                            <div className="space-y-6 animate-fade-in-up">
                                {/* PRODUCT HEADER CARD */}
                                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-1">{selectedStat.productName}</h2>
                                        <div className="flex gap-4 text-sm text-gray-400">
                                            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Ativo</span>
                                            <span>{selectedStat.salesCount} Vendas</span>
                                            <span>Ticket Médio: R$ {selectedStat.averageTicket?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0">
                                        <button
                                            onClick={() => setConsultancyProduct({ id: selectedStat.productId, name: selectedStat.productName })}
                                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                                        >
                                            <Monitor className="w-5 h-5" />
                                            Analisar com Nexus IA
                                        </button>
                                    </div>
                                </div>

                                {/* DRE CARDS */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {/* REVENUE */}
                                    <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <TrendingUp className="w-16 h-16 text-green-500" />
                                        </div>
                                        <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">Receita Bruta</h3>
                                        <p className="text-2xl font-bold text-white">R$ {selectedStat.revenue.toFixed(2)}</p>
                                        <div className="w-full bg-gray-700 h-1 mt-3 rounded-full overflow-hidden">
                                            <div className="bg-green-500 h-full w-full" />
                                        </div>
                                    </div>

                                    {/* COSTS */}
                                    <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <TrendingDown className="w-16 h-16 text-red-500" />
                                        </div>
                                        <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">Custos Totais</h3>
                                        <p className="text-2xl font-bold text-red-400">
                                            R$ {(selectedStat.revenue - selectedStat.netProfit).toFixed(2)}
                                        </p>
                                        <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
                                            <span>Taxas: R$ {selectedStat.costs.platformFees + selectedStat.costs.taxes}</span>
                                            <span>•</span>
                                            <span>Comissões: R$ {selectedStat.costs.affiliateCommissions + selectedStat.costs.teamCommissions}</span>
                                        </div>
                                    </div>

                                    {/* NET PROFIT */}
                                    <div className="bg-gradient-to-br from-green-900/40 to-gray-800 p-5 rounded-xl border border-green-500/30 relative overflow-hidden">
                                        <h3 className="text-green-400 text-xs font-bold uppercase mb-1">Lucro Líquido</h3>
                                        <p className="text-3xl font-bold text-white">R$ {selectedStat.netProfit.toFixed(2)}</p>
                                        <p className="text-xs text-green-300 mt-1 font-mono">No Bolso</p>
                                    </div>

                                    {/* MARGIN */}
                                    <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex flex-col justify-center items-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        <div className="relative w-24 h-24">
                                            <svg className="w-full h-full drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" viewBox="0 0 36 36">
                                                <defs>
                                                    <linearGradient id="marginGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#10B981" />
                                                        <stop offset="100%" stopColor="#34D399" />
                                                    </linearGradient>
                                                </defs>
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1F2937" strokeWidth="3" />
                                                <path
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="url(#marginGradient)"
                                                    strokeWidth="3"
                                                    strokeDasharray={`${selectedStat.margin}, 100`}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000 ease-out"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                <span className="text-2xl font-black text-white">{selectedStat.margin}%</span>
                                                <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Margem</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* DETAILED COSTS BREAKDOWN ROW */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Layers className="w-4 h-4 text-gray-400" /> Composição de Custos</h3>
                                        <div className="space-y-4">
                                            {/* Cost Items */}
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Taxas da Plataforma (5%)</span>
                                                <span className="text-white">R$ {selectedStat.costs.platformFees.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Impostos / NF-e (Simples Nacional)</span>
                                                <span className="text-white">R$ {selectedStat.costs.taxes.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Comissões de Afiliados</span>
                                                <span className="text-white">R$ {selectedStat.costs.affiliateCommissions.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Comissões de Equipe (Vendas)</span>
                                                <span className="text-white">R$ {selectedStat.costs.teamCommissions.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm border-t border-gray-700 pt-2 mt-2">
                                                <span className="text-gray-400">Investimento em Ads (Tráfego)</span>
                                                <span className="text-yellow-400">R$ {selectedStat.costs.adsSpend?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* MOCK CHART AREA */}
                                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center">
                                        <BarChart2 className="w-12 h-12 text-gray-600 mb-4" />
                                        <h3 className="text-gray-300 font-bold">Histórico de Performance</h3>
                                        <p className="text-sm text-gray-500 max-w-xs mt-2">O gráfico de evolução de Roi e Lucro Líquido dos últimos 6 meses aparecerá aqui.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                    <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Saldo Disponível</h3>
                                    {/* USAGE-BASED: Available = Realized Commission from actual usage (affiliateCommissions) */}
                                    <p className="text-4xl font-bold text-white">
                                        R$ {(productStats.reduce((acc, p) => acc + p.costs.affiliateCommissions, 0)).toFixed(2)}
                                    </p>
                                    <span className="text-green-400 text-sm mt-2 block flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Liberado para saque</span>
                                </div>
                                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                    <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">A Receber (Bloqueado)</h3>
                                    {/* USAGE-BASED: Pending = Projected Liability from unspent credits (projectedCommissions) */}
                                    <p className="text-4xl font-bold text-gray-300">
                                        R$ {(productStats.reduce((acc, p) => acc + (p.costs.projectedCommissions || 0), 0)).toFixed(2)}
                                    </p>
                                    <span className="text-yellow-500 text-sm mt-2 block flex items-center gap-1"><Clock className="w-3 h-3" /> Libera conforme uso do aluno</span>
                                </div>
                                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                    <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Total Reembolsado (Mês)</h3>
                                    <p className="text-4xl font-bold text-red-400">R$ {productStats.reduce((acc, p) => acc + (p.refundCount * (p.averageTicket || 0)), 0).toFixed(2)}</p>
                                    <span className="text-gray-500 text-sm mt-2 block">
                                        {(productStats.reduce((acc, p) => acc + p.refundCount, 0) / Math.max(1, productStats.reduce((acc, p) => acc + p.salesCount, 0)) * 100).toFixed(1)}% das Vendas
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'wallet' && wallet && (
                    <div className="space-y-6 animate-fade-in-up">
                        {/* UNIFIED WALLET HEADER */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* CORPORATE WALLET */}
                            <div className="bg-gradient-to-br from-indigo-900 to-gray-900 p-6 rounded-xl border border-indigo-500/30 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4">
                                    <Briefcase className="w-12 h-12 text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors" />
                                </div>
                                <h3 className="text-indigo-300 text-sm font-bold uppercase mb-2">Carteira Corporativa</h3>
                                <div className="flex items-end gap-2 mb-4">
                                    <p className="text-4xl font-black text-white">{wallet.balance}</p>
                                    <span className="text-sm font-bold text-gray-400 mb-2">créditos</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleOpenShop('producer')}
                                        className="!bg-indigo-600 hover:!bg-indigo-500 font-bold flex items-center justify-center gap-2 text-xs flex-1"
                                    >
                                        <ShoppingCart className="w-3 h-3" /> Comprar
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setIsTransferOpen(true)}
                                        className="font-bold flex items-center justify-center gap-2 text-xs flex-1"
                                    >
                                        <ArrowLeftRight className="w-3 h-3" /> Transferir
                                    </Button>
                                    <Button
                                        onClick={() => setIsWithdrawModalOpen(true)}
                                        className="!bg-green-600 hover:!bg-green-500 font-bold flex items-center justify-center gap-2 text-xs flex-1 shadow-lg shadow-green-900/20"
                                    >
                                        <DollarSign className="w-3 h-3" /> Sacar
                                    </Button>
                                </div>
                                {pendingWithdrawals.length > 0 && (
                                    <div className="mt-3 bg-black/20 rounded-lg p-2 border border-white/10">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Saques em Andamento</p>
                                        {pendingWithdrawals.map(w => (
                                            <div key={w.id} className="flex justify-between items-center text-xs">
                                                <span className="text-gray-300">{new Date(w.requestedAt).toLocaleDateString()}</span>
                                                <span className="text-yellow-400 font-mono">R$ {w.amount.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* PERSONAL WALLET */}
                            <div className="bg-gradient-to-br from-purple-900 to-gray-900 p-6 rounded-xl border border-purple-500/30 relative overflow-hidden group opacity-90">
                                <div className="absolute top-0 right-0 p-4">
                                    <Wallet className="w-12 h-12 text-purple-500/20 group-hover:text-purple-500/40 transition-colors" />
                                </div>
                                <h3 className="text-purple-300 text-sm font-bold uppercase mb-2">Carteira Pessoal (Aluno)</h3>
                                <div className="flex items-end gap-2 mb-4">
                                    <p className="text-4xl font-black text-white">{studentBalance}</p>
                                    <span className="text-sm font-bold text-gray-400 mb-2">créditos</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleOpenShop('student')}
                                        className="!bg-purple-600 hover:!bg-purple-500 font-bold flex items-center justify-center gap-2 text-xs flex-1"
                                    >
                                        <ShoppingCart className="w-3 h-3" /> Comprar
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setIsTransferOpen(true)}
                                        className="font-bold flex items-center justify-center gap-2 text-xs flex-1"
                                    >
                                        <ArrowLeftRight className="w-3 h-3" /> Transferir
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* USAGE INFO */}
                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <h3 className="text-white font-bold flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-gray-400" /> Extrato de Transações (Corporativo)
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 font-bold uppercase">Filtrar:</span>
                                        <select
                                            value={extratoFilter}
                                            onChange={(e) => setExtratoFilter(Number(e.target.value))}
                                            className="bg-gray-900 border border-gray-700 text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:border-brand-primary"
                                        >
                                            <option value={1}>Último Dia</option>
                                            <option value={7}>Últimos 7 dias</option>
                                            <option value={15}>Últimos 15 dias</option>
                                            <option value={30}>Últimos 30 dias</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                    {wallet.transactions
                                        .filter(tx => {
                                            const txDate = new Date(tx.timestamp).getTime();
                                            const filterDate = Date.now() - (extratoFilter * 24 * 60 * 60 * 1000);
                                            return txDate >= filterDate;
                                        })
                                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                        .map(tx => (
                                            <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:bg-gray-900 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {tx.type === 'credit' ? <ArrowLeft className="w-4 h-4 rotate-45" /> : <ArrowRight className="w-4 h-4 -rotate-45" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{tx.description}</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleDateString()} às {new Date(tx.timestamp).toLocaleTimeString()}</p>
                                                            {tx.gatewayId && (
                                                                <span className="text-[9px] font-mono text-gray-600 bg-black/30 px-1.5 rounded">{tx.gatewayId}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`font-mono font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                                    {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                                                </span>
                                            </div>
                                        ))}
                                    {wallet.transactions.filter(tx => {
                                        const txDate = new Date(tx.timestamp).getTime();
                                        const filterDate = Date.now() - (extratoFilter * 24 * 60 * 60 * 1000);
                                        return txDate >= filterDate;
                                    }).length === 0 && (
                                            <div className="text-center py-10 text-gray-500">
                                                <p>Nenhuma transação encontrada neste período.</p>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'refunds' && (
                    <div className="space-y-4 max-w-4xl">
                        {/* Refund Cards Logic - Kept Same */}
                        {refunds.map(refund => (
                            <div key={refund.id} className={`bg-gray-800 rounded-xl p-6 border ${refund.status === 'pending_retention' ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-gray-700 opacity-75'}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${refund.status === 'pending_retention' ? 'bg-yellow-900/30 text-yellow-500' : refund.status === 'refunded' ? 'bg-red-900/30 text-red-500' : 'bg-green-900/30 text-green-500'}`}>
                                            {refund.status === 'pending_retention' ? <Clock className="w-5 h-5" /> : refund.status === 'refunded' ? <ArrowLeft className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{refund.productName}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                                <span>Aluno: <span className="text-white">{refund.studentName}</span></span>
                                                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                                                <span>Data Compra: {new Date(refund.purchaseDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="mt-3 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                                                <p className="text-sm italic text-gray-300">"{refund.reason}"</p>
                                            </div>
                                            {refund.status === 'cancelled' && (
                                                <div className="mt-2 bg-green-900/20 p-2 rounded border border-green-500/20">
                                                    <p className="text-xs text-green-400 font-bold">Reversão Confirmada pelo Aluno:</p>
                                                    <p className="text-xs text-green-300 italic">"{refund.reversalJustification}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-xl font-bold">R$ {refund.amount.toFixed(2)}</span>
                                        <span className={`text-xs px-2 py-1 rounded uppercase font-bold tracking-wider ${refund.status === 'pending_retention' ? 'bg-yellow-500 text-black' : refund.status === 'refunded' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                            {refund.status === 'pending_retention' ? 'Aguardando Decisão' : refund.status === 'refunded' ? 'Reembolsado' : 'Cancelado'}
                                        </span>
                                    </div>
                                </div>

                                {refund.status === 'pending_retention' && (
                                    <div className="mt-6 pt-4 border-t border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center justify-center sm:justify-start gap-2 text-yellow-500 bg-yellow-900/20 px-3 py-2 rounded-lg border border-yellow-500/20 w-full sm:w-auto">
                                            <Clock className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-sm font-bold whitespace-nowrap">Auto: {getTimeRemaining(refund.retentionDeadline)}</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleSendRetentionLink(refund.id, refund.studentName)}
                                                disabled={loading}
                                                className="!bg-blue-600/10 text-blue-400 border-blue-600/30 hover:!bg-blue-600 hover:text-white justify-center flex-1 sm:flex-initial"
                                            >
                                                <ArrowRight className="w-4 h-4 mr-2" /> Tentar Reverter
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleApproveRefund(refund.id)}
                                                disabled={loading}
                                                className="!bg-red-600/10 text-red-400 border-red-600/30 hover:!bg-red-600 hover:text-white justify-center flex-1 sm:flex-initial"
                                            >
                                                Estornar
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

