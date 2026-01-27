
import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign, Wallet, TrendingUp, CheckCircle, Clock,
    BarChart3, ActivityIcon, X as XIcon, Download, Filter,
    PieChart, Target, ArrowRight, ShoppingBag, Zap,
    Users, Brain, Trophy, Star, ShieldCheck, LockClosed, CreditCard, FileText
} from '../components/Icons';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Student } from '../types';
import { StudentPage } from '../types';
import { SharedWithdrawalModal } from '../components/modals/SharedWithdrawalModal';
import { CreditBalanceWidget } from '../components/CreditBalanceWidget';

interface FinancialPageProps {
    navigateTo: (page: StudentPage) => void;
}

// Interfaces Locais
interface PlatformBalance {
    id: string;
    name: string;
    balance: number;
    icon: string;
}

interface SaleTransaction {
    id: string;
    product: string;
    date: string;
    value: number; // Gross
    platformFee: number;
    operationalCost: number;
    netAmount: number;
    platform: string;
    status: 'Aprovado' | 'Pendente' | 'Reembolsado';
    role: 'Produtor' | 'Afiliado';
    availableDate: string;
}

// Componente de Logo LucPay Padronizado
const LucPayLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = {
        sm: "w-10 h-10 text-[10px]",
        md: "w-14 h-14 text-sm",
        lg: "w-16 h-16 text-base"
    };

    return (
        <div className={`${sizeClasses[size]} bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-200 shrink-0 select-none`}>
            <span className="text-black font-sans tracking-tighter leading-none">
                <strong className="font-black">Luc</strong><span className="font-normal">Pay</span>
            </span>
        </div>
    );
};

// --- MODAL DE INTELIGÊNCIA DE PRODUTO ---
const ProductIntelligenceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    product: any;
}> = ({ isOpen, onClose, product }) => {
    if (!isOpen || !product) return null;

    const trafficSources = [
        { label: 'Tráfego Pago (Ads)', percent: 65, value: product.revenue * 0.65, color: 'bg-blue-500', textColor: 'text-blue-400', icon: <Target className="w-4 h-4" /> },
        { label: 'Orgânico (Conteúdo)', percent: 25, value: product.revenue * 0.25, color: 'bg-green-500', textColor: 'text-green-400', icon: <Brain className="w-4 h-4" /> },
        { label: 'Afiliados / Parceiros', percent: 10, value: product.revenue * 0.10, color: 'bg-purple-500', textColor: 'text-purple-400', icon: <Users className="w-4 h-4" /> },
    ];

    const topAffiliates = [
        { name: 'João Silva', sales: 142, commission: 4200.50, rank: 1 },
        { name: 'Maria Souza', sales: 98, commission: 2890.00, rank: 2 },
        { name: 'Carlos Tech', sales: 65, commission: 1950.00, rank: 3 },
        { name: 'Ana Beauty', sales: 42, commission: 1200.00, rank: 4 },
        { name: 'Pedro Vendas', sales: 31, commission: 980.00, rank: 5 },
    ];

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-800 w-full max-w-4xl h-[90vh] rounded-2xl border border-gray-700 shadow-2xl flex flex-col overflow-hidden"
            >
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 shadow-inner">
                            <ShoppingBag className="w-6 h-6 text-brand-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white leading-tight">{product.name}</h2>
                            <p className="text-sm text-gray-400">Análise de Performance LucPay (via Stripe)</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Faturamento Total</p>
                            <p className="text-2xl font-black text-white">R$ {product.revenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Lucro Líquido</p>
                            <p className="text-2xl font-black text-green-400">R$ {product.profit.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-3 opacity-10"><TrendingUp className="w-16 h-16 text-yellow-500" /></div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">ROI Atual</p>
                            <p className="text-2xl font-black text-yellow-400">{product.roi.toFixed(0)}%</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-blue-400" /> Origem das Vendas
                            </h3>
                            <div className="space-y-4">
                                {trafficSources.map((source, idx) => (
                                    <div key={idx} className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-300">
                                                <div className={`p-1.5 rounded-lg ${source.textColor.replace('text-', 'bg-')}/10`}>
                                                    {source.icon}
                                                </div>
                                                {source.label}
                                            </div>
                                            <div className="text-right">
                                                <span className={`font-black ${source.textColor}`}>{source.percent}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${source.percent}%` }}
                                                className={`h-full ${source.color}`}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 text-right">R$ {source.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-yellow-400" /> Top Afiliados
                                </h3>
                            </div>
                            <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-800 text-gray-400 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="p-3 text-center">Pos</th>
                                            <th className="p-3">Afiliado</th>
                                            <th className="p-3 text-right">Vendas</th>
                                            <th className="p-3 text-right">Comissão</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700/50">
                                        {topAffiliates.map((aff) => (
                                            <tr key={aff.rank} className="hover:bg-gray-700/30 transition-colors">
                                                <td className="p-3 text-center">{aff.rank <= 3 ? '🏆' : `#${aff.rank}`}</td>
                                                <td className="p-3 font-medium text-white">{aff.name}</td>
                                                <td className="p-3 text-right text-gray-300">{aff.sales}</td>
                                                <td className="p-3 text-right font-bold text-green-400">R$ {aff.commission.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-700 bg-gray-900 flex justify-end">
                    <Button onClick={onClose} variant="secondary">Fechar Detalhes</Button>
                </div>
            </motion.div>
        </div>
    );
};

// --- MODAL DE SAQUE (LUC PAY NATIVO) ---
// Substituído por SharedWithdrawalModal


const FinancialPage: React.FC<FinancialPageProps> = ({ navigateTo }) => {
    const { user } = useAuth();
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [selectedProductIntelligence, setSelectedProductIntelligence] = useState<any | null>(null);
    const [filterRole, setFilterRole] = useState<'Todos' | 'Produtor' | 'Afiliado'>('Todos');

    const financialData = useMemo(() => {
        const transactions: SaleTransaction[] = [
            { id: 'LP-98214', product: 'Mestre do Tráfego', date: 'Hoje, 14:30', value: 197.00, platformFee: 12.62, operationalCost: 35.00, netAmount: 149.38, platform: 'LucPay Nativo', status: 'Aprovado', role: 'Produtor', availableDate: '25/01/2026' },
            { id: 'LP-98213', product: 'Ebook Viral 3.0', date: 'Hoje, 11:15', value: 47.00, platformFee: 3.77, operationalCost: 5.00, netAmount: 38.23, platform: 'LucPay Nativo', status: 'Aprovado', role: 'Produtor', availableDate: '25/01/2026' },
            { id: 'LP-98212', product: 'Mentoria Elite', date: 'Ontem, 22:10', value: 250.00, platformFee: 15.75, operationalCost: 0.00, netAmount: 234.25, platform: 'LucPay Nativo', status: 'Aprovado', role: 'Afiliado', availableDate: '24/01/2026' },
            { id: 'LP-98211', product: 'Mestre do Tráfego', date: 'Há 3 dias', value: 197.00, platformFee: 12.62, operationalCost: 35.00, netAmount: 149.38, platform: 'LucPay Nativo', status: 'Aprovado', role: 'Produtor', availableDate: '21/01/2026' },
            { id: 'LP-98210', product: 'Curso Copywriting', date: 'Há 15 dias', value: 97.00, platformFee: 6.72, operationalCost: 0.00, netAmount: 90.28, platform: 'LucPay Nativo', status: 'Aprovado', role: 'Afiliado', availableDate: '10/01/2026' },
        ];

        const productPerformance: Record<string, { revenue: number, cost: number, count: number }> = {};
        transactions.forEach(t => {
            if (t.status === 'Aprovado') {
                if (!productPerformance[t.product]) productPerformance[t.product] = { revenue: 0, cost: 0, count: 0 };
                productPerformance[t.product].revenue += t.value;
                productPerformance[t.product].cost += (t.operationalCost || 0);
                productPerformance[t.product].count += 1;
            }
        });

        const topProducts = Object.entries(productPerformance)
            .map(([name, data]) => ({
                name,
                ...data,
                profit: data.revenue - data.cost,
                roi: data.cost > 0 ? ((data.revenue - data.cost) / data.cost) * 100 : 0
            }))
            .sort((a, b) => b.revenue - a.revenue);

        return {
            transactions,
            topProducts,
            totalAvailable: 2150.00, // Saldo já liberado D+7
            totalPending: 3840.00, // Saldo em processamento Stripe
            totalRevenue: transactions.reduce((a, t) => a + (t.status === 'Aprovado' ? t.value : 0), 0)
        };
    }, []);

    const filteredTransactions = financialData.transactions.filter(t => filterRole === 'Todos' || t.role === filterRole);

    return (
        <div className="pb-20 space-y-8 animate-fade-in max-w-7xl mx-auto">
            {/* Credit Balance Widget - Mobile Priority */}
            <div className="flex justify-end mb-4">
                <CreditBalanceWidget onRecharge={() => navigateTo('recharge')} />
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <LucPayLogo />
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Painel <span className="text-brand-primary">Financeiro</span></h1>
                        <p className="text-gray-400 text-sm">Controle nativo de vendas e saques via Stripe Connect.</p>
                    </div>
                </div>
                <Button onClick={() => setIsWithdrawModalOpen(true)} className="!bg-green-600 hover:!bg-green-500 text-white font-black shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 !py-4 w-full md:w-auto">
                    <DollarSign className="w-5 h-5" /> SACAR SALDO DISPONÍVEL
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-l-green-500 bg-gray-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Disponível LucPay (D+7)</p>
                        <h3 className="text-3xl font-black text-green-400 mb-1">R$ {financialData.totalAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Saldo liberado para sua conta</p>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-yellow-500 bg-gray-800">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Aguardando Garantia (Processando)</p>
                    <h3 className="text-3xl font-black text-yellow-400 mb-1">R$ {financialData.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Valores em trânsito Stripe</p>
                </Card>

                <Card className="p-6 border-l-4 border-l-blue-500 bg-gray-800">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Receita Bruta Acumulada</p>
                    <h3 className="text-3xl font-black text-blue-400 mb-1">R$ {financialData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    <p className="text-[10px] text-gray-500">Volume total processado</p>
                </Card>
            </div>

            <div className="flex justify-between items-center mt-12">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Target className="w-6 h-6 text-purple-500" /> Performance de Produtos (ROI Real)
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {financialData.topProducts.map((prod, idx) => (
                    <Card
                        key={idx}
                        className="p-5 bg-gray-800 border-gray-700 hover:border-brand-primary transition-all cursor-pointer group"
                        onClick={() => setSelectedProductIntelligence(prod)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-600 font-bold text-white">#{idx + 1}</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm group-hover:text-brand-primary">{prod.name}</h4>
                                    <p className="text-[10px] text-gray-400">{prod.count} Vendas</p>
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-[10px] font-bold border ${prod.roi > 100 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                                ROI: {prod.roi.toFixed(0)}%
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs"><span className="text-gray-400">Receita</span><span className="text-white font-bold">R$ {prod.revenue.toLocaleString()}</span></div>
                            <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-500 h-full w-full"></div></div>
                            <div className="flex justify-between text-xs pt-2"><span className="text-gray-400">Líquido (Lucro)</span><span className="text-green-400 font-black">R$ {prod.profit.toLocaleString()}</span></div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="bg-gray-800 border-gray-700 overflow-hidden mt-8">
                <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><ActivityIcon className="w-5 h-5 text-brand-primary" /> Extrato Stripe/LucPay</h3>
                    <select
                        className="bg-gray-900 text-white text-xs rounded border border-gray-700 p-1.5 outline-none"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value as any)}
                    >
                        <option value="Todos">Todos os Papéis</option>
                        <option value="Produtor">Produtor</option>
                        <option value="Afiliado">Afiliado</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-900 text-gray-500 uppercase font-bold text-[10px]">
                            <tr>
                                <th className="p-4">ID Transação</th>
                                <th className="p-4">Produto</th>
                                <th className="p-4">Data</th>
                                <th className="p-4 text-right">Bruto</th>
                                <th className="p-4 text-right bg-red-950/20">Taxas</th>
                                <th className="p-4 text-right bg-orange-950/20">Custo IA</th>
                                <th className="p-4 text-right border-l border-gray-700 font-black text-white">Líquido</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredTransactions.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4 font-mono text-xs text-gray-400">{sale.id}</td>
                                    <td className="p-4">
                                        <p className="font-bold text-white">{sale.product}</p>
                                        <p className="text-[10px] text-gray-500 uppercase">{sale.role}</p>
                                    </td>
                                    <td className="p-4 text-gray-400 text-xs">{sale.date}</td>
                                    <td className="p-4 text-right font-bold text-gray-300">R$ {sale.value.toFixed(2)}</td>
                                    <td className="p-4 text-right text-red-400/80 text-xs">- R$ {sale.platformFee.toFixed(2)}</td>
                                    <td className="p-4 text-right text-orange-400/80 text-xs">- R$ {sale.operationalCost.toFixed(2)}</td>
                                    <td className="p-4 text-right font-black text-green-400 border-l border-gray-700 bg-gray-900/50">R$ {sale.netAmount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <SharedWithdrawalModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                balance={financialData.totalAvailable}
                producerId={user?.uid || 'unknown'}
                producerName={user?.displayName || 'Usuário'}
                pixKey={user?.producerData?.pixKey}
                bankInfo={user?.producerData ? `${user.producerData.bank} / ${user.producerData.agency}` : 'Dados não cadastrados'}
                sourceType="manual_sales"
                onSuccess={() => { toast.success("Dados atualizados!"); setIsWithdrawModalOpen(false); }}
            />

            <ProductIntelligenceModal
                isOpen={!!selectedProductIntelligence}
                onClose={() => setSelectedProductIntelligence(null)}
                product={selectedProductIntelligence}
            />
        </div>
    );
};

export default FinancialPage;
