
import React, { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { Wallet, CheckCircle, Clock, Ban, DollarSign, BarChart3, Filter, X as XIcon, Server, AlertTriangle, Shield, Brain } from '@/components/Icons';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { transactionService } from '@/services/transactionMockService';
import { Transaction, TransactionStats } from '@/types/finance';
import { TransactionTable } from '@/components/finance/TransactionTable';
import { TransactionDetailModal, RefundModal } from '../../finance/modals/TransactionModals';

const AdminWithdrawalModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const available = 15420.00;
    const platformBalances = [
        { id: 'hotmart', name: 'Hotmart', value: 8500.00, icon: '🔥' },
        { id: 'kiwify', name: 'Kiwify', value: 4200.00, icon: '🥝' },
        { id: 'eduzz', name: 'Eduzz', value: 2720.00, icon: '🎓' }
    ];

    const handleConfirm = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(2);
            toast.success("Saques processados com sucesso via API!");
        }, 2000);
    }

    const handleClose = () => {
        setStep(1);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150] p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-800 w-full max-w-md rounded-2xl border border-green-500/50 shadow-2xl overflow-hidden relative"
            >
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-green-500" /> Realizar Saque
                    </h3>
                    <button onClick={handleClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                <div className="p-6">
                    {step === 1 ? (
                        <>
                            <div className="text-center mb-6">
                                <p className="text-gray-400 text-sm mb-1">Saldo Total Disponível</p>
                                <h2 className="text-3xl font-black text-white">R$ {available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                            </div>

                            <div className="space-y-3 mb-6">
                                <p className="text-xs text-gray-500 uppercase font-bold">Detalhamento por Plataforma</p>
                                {platformBalances.map(p => (
                                    <div key={p.id} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center border border-gray-600">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{p.icon}</span>
                                            <span className="text-white font-bold text-sm">{p.name}</span>
                                        </div>
                                        <span className="text-green-400 font-mono font-bold">R$ {p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30 mb-6 flex gap-3">
                                <Server className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-200">
                                    Ao confirmar, o sistema enviará requisições de saque via API para todas as plataformas conectadas.
                                </p>
                            </div>

                            <Button onClick={handleConfirm} isLoading={loading} className="w-full !py-3 font-bold !bg-green-600 hover:!bg-green-500 text-lg shadow-lg shadow-green-900/30">
                                CONFIRMAR SAQUE TOTAL
                            </Button>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                                <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Saque Solicitado!</h3>
                            <p className="text-gray-300 text-sm mb-6">
                                As ordens de pagamento foram enviadas com sucesso para Hotmart, Kiwify e Eduzz.
                            </p>
                            <Button onClick={handleClose} className="w-full">Voltar ao Painel</Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

const FinancialView: React.FC<{ user?: any, permissions?: any }> = ({ user, permissions }) => {
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
    const [platform, setPlatform] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    // Transaction Manager State
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState<TransactionStats>({ totalGross: 0, totalNet: 0, totalRefunds: 0, refundRate: 0, avgTicket: 0, count: 0 });
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isRefundOpen, setIsRefundOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initial Data Load & Polling
    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // 30s poll
        return () => clearInterval(interval);
    }, [period, platform, searchTerm]);

    const loadData = () => {
        setLoading(true);
        // Simulate network delay slightly for realism in mock
        setTimeout(() => {
            const currentStats = transactionService.getStats(period);
            const currentTxs = transactionService.search({
                search: searchTerm,
                platform: platform,
                // Date filters would go here based on period
            });

            setStats(currentStats);
            setTransactions(currentTxs.slice(0, 50)); // Limit display
            setLoading(false);
        }, 300);
    };

    const handleRefundRequest = (tx: Transaction) => {
        setIsDetailOpen(false);
        setSelectedTx(tx);
        setIsRefundOpen(true);
    };

    const handleConfirmRefund = (reason: string) => {
        if (selectedTx) {
            transactionService.refund(selectedTx.id, reason, user?.uid || 'admin', user?.displayName || 'Admin');
            toast.success("Reembolso processado com sucesso!");
            setIsRefundOpen(false);
            loadData(); // Refresh list
        }
    };

    const PLATFORMS = ['Todos', 'Hotmart', 'Kirvano', 'Kiwify', 'Braip', 'Eduzz', 'Keoto', 'Stripe', 'Vindi'];

    // Mock balances for the cards (could request from service too in future)
    const mockAvailable = 15420.00;
    const mockPending = 8250.00;
    const mockCanceled = 1120.00;

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header / Stats Section */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-green-400" /> Gestão Financeira & Transações
                </h2>

                {/* Admin Cards - Only for Admin */}
                {user?.role === 'admin' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* AVAILABLE CARD */}
                        <Card className="p-6 border-l-4 border-l-green-500 bg-gray-800 flex flex-col justify-between shadow-lg relative overflow-hidden group">
                            {/* ... (Same as before) ... */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-xl -mr-10 -mt-10 group-hover:bg-green-500/20 transition-all"></div>
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Disponível para Saque</p>
                                    <div className="p-2 bg-green-500/10 rounded-lg text-green-400 border border-green-500/20">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black text-white mb-1">R$ {mockAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                                <p className="text-[10px] text-gray-500 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Liberado nas plataformas</p>
                            </div>
                            <Button
                                onClick={() => setIsWithdrawModalOpen(true)}
                                className="w-full mt-6 !bg-green-600 hover:!bg-green-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                            >
                                <DollarSign className="w-4 h-4" /> REALIZAR SAQUE
                            </Button>
                        </Card>

                        {/* PENDING CARD */}
                        <Card className="p-6 border-l-4 border-l-yellow-500 bg-gray-800 flex flex-col justify-between shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl -mr-10 -mt-10"></div>
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Saldo Pendente</p>
                                    <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500 border border-yellow-500/20"><Clock className="w-5 h-5" /></div>
                                </div>
                                <h3 className="text-3xl font-black text-yellow-400 mb-1">R$ {mockPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                                <p className="text-[10px] text-gray-500">Aguardando garantia (7-30 dias)</p>
                            </div>
                        </Card>

                        {/* CANCELED CARD */}
                        <Card className="p-6 border-l-4 border-l-red-500 bg-gray-800 flex flex-col justify-between shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-xl -mr-10 -mt-10"></div>
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Reembolsado (30d)</p>
                                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500 border border-red-500/20"><Ban className="w-5 h-5" /></div>
                                </div>
                                <h3 className="text-3xl font-black text-red-400 mb-1">R$ {mockCanceled.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                                <p className="text-[10px] text-gray-500">Chargebacks e devoluções</p>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl mb-6 flex items-start gap-4">
                        <Shield className="w-6 h-6 text-blue-400 mt-1" />
                        <div>
                            <h3 className="font-bold text-white text-lg">Modo Auditoria & Suporte</h3>
                            <p className="text-gray-300 text-sm">
                                Você tem permissão para visualizar transações, logs de auditoria e processar reembolsos solicitados.
                                <br />Withdrawal actions are restricted to Administrators.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* KPI STRIP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 border-l-4 border-l-blue-500 bg-gray-800">
                    <p className="text-gray-400 text-xs font-bold uppercase">Volume de Vendas</p>
                    <h3 className="text-xl font-bold text-white mt-1">R$ {stats.totalGross.toLocaleString('pt-BR')}</h3>
                </Card>
                <Card className="p-4 border-l-4 border-l-green-500 bg-gray-800">
                    <p className="text-gray-400 text-xs font-bold uppercase">Receita Líquida</p>
                    <h3 className="text-xl font-bold text-green-400 mt-1">R$ {stats.totalNet.toLocaleString('pt-BR')}</h3>
                </Card>
                <Card className="p-4 border-l-4 border-l-red-500 bg-gray-800">
                    <p className="text-gray-400 text-xs font-bold uppercase">Total Reembolsado</p>
                    <h3 className="text-xl font-bold text-red-400 mt-1">R$ {stats.totalRefunds.toLocaleString('pt-BR')}</h3>
                    <span className="text-xs text-gray-500">Taxa: {stats.refundRate.toFixed(2)}%</span>
                </Card>
                <Card className="p-4 border-l-4 border-l-yellow-500 bg-gray-800">
                    <p className="text-gray-400 text-xs font-bold uppercase">Ticket Médio</p>
                    <h3 className="text-xl font-bold text-white mt-1">R$ {stats.avgTicket.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</h3>
                </Card>
            </div>

            {/* ADMIN CONFIG: AI CREDITS PROFIT */}
            {user?.role === 'admin' && (
                <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-purple-400" /> Custos e Preços
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">Gerencie as margens de lucro sobre serviços de IA.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 relative group">
                            <div className="absolute top-3 right-3 p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                <Brain className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-white text-sm mb-1">Créditos de Cursos de IA</h4>
                            <p className="text-[10px] text-gray-500 mb-4 h-8">Margem de lucro aplicada sobre o custo base dos tokens (Nexus Player).</p>

                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Margem Admin (%)</label>
                                    <input
                                        type="number"
                                        defaultValue={30}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white font-bold text-center focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Custo Final</label>
                                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-purple-400 font-bold text-center">
                                        R$ 0.04 <span className="text-[8px] text-gray-500">/crédito</span>
                                    </div>
                                </div>
                            </div>
                            <Button size="sm" className="w-full mt-2" variant="secondary">Atualizar Margem</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* SEARCH CONSOLE & TABLE */}
            <Card className="overflow-visible bg-gray-900/50 border border-gray-700">
                {/* Controls */}
                <div className="p-4 border-b border-gray-700 bg-gray-900 rounded-t-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="font-bold text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-brand-primary" /> Transações Recentes</h3>
                        <p className="text-xs text-gray-400">Gerencie e audite pagamentos em tempo real.</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar CPF, Email, ID..."
                                className="bg-gray-800 text-white text-sm rounded-lg pl-3 pr-10 py-2 border border-gray-700 focus:border-brand-primary outline-none w-full md:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute right-3 top-2.5 text-gray-500">
                                <Filter className="w-4 h-4" />
                            </div>
                        </div>
                        <select
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-brand-primary outline-none cursor-pointer"
                        >
                            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                            {['day', 'week', 'month'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p as any)}
                                    className={`px-3 py-1 rounded text-xs font-bold transition-all capitalize ${period === p ? 'bg-brand-primary text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {p === 'day' ? 'Hoje' : p === 'week' ? '7d' : '30d'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <TransactionTable
                    transactions={transactions}
                    loading={loading}
                    onViewDetails={(tx) => { setSelectedTx(tx); setIsDetailOpen(true); }}
                />
            </Card>

            {/* Modals */}
            <AdminWithdrawalModal isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)} />

            <TransactionDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                transaction={selectedTx}
                onRefundRequest={handleRefundRequest}
            />

            <RefundModal
                isOpen={isRefundOpen}
                onClose={() => setIsRefundOpen(false)}
                transaction={selectedTx}
                onConfirm={handleConfirmRefund}
            />
        </div>
    );
};

export default FinancialView;
