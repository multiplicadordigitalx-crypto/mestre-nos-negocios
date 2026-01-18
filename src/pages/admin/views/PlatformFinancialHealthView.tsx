
import React, { useState, useEffect } from 'react';
import {
    DollarSign, TrendingUp, PieChart, CreditCard,
    ShieldCheck, ArrowUpRight, BarChart3, Filter
} from '../../../components/Icons';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { ProductFinanceStats } from '../../../types/legacy';
import { loadJSON, getProducerWallet } from '../../../services/mockFirebase';
import { SharedWithdrawalModal } from '../../../components/modals/SharedWithdrawalModal';
import { toast } from 'react-hot-toast';

export const PlatformFinancialHealthView: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalNetRevenue: 0, // Taxas + Vendas Próprias
        ownSalesVolume: 0,   // Apenas Vendas Próprias
        platformFees: 0,     // Apenas Taxas
        totalLiability: 0,   // O que devemos aos parceiros
        corporateBalance: 0  // Saldo Disponível para Saque da Empresa
    });
    const [ownProducts, setOwnProducts] = useState<ProductFinanceStats[]>([]);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 800)); // Mock network delay

            // 1. Load All Product Stats to calculate Revenue
            const allProducts = loadJSON<ProductFinanceStats[]>('mockProductFinanceStats', []);

            // 2. Identify "Own Products" (Mock logic: producerId starts with 'admin' or 'platform' or is empty)
            // In a real scenario, we'd check against the current User ID or a Config
            const platformId = 'admin-01';

            // Filter Own Products
            // For demo purposes, let's assume 'prod-001' is also the platform sometimes, or use a specific flag
            // Let's filter where we have high margin or specific IDs
            const myProducts = allProducts.filter(p => p.productId === 'credit_recharges_global' || p.productId.includes('official'));

            // 3. Calculate Metrics
            let fees = 0;
            let ownSales = 0;

            allProducts.forEach(p => {
                fees += p.costs.platformFees;

                if (p.productId === 'credit_recharges_global' || p.productId.includes('official')) {
                    ownSales += p.netProfit; // For own products, net profit is essentially our revenue (minus taxes)
                }
            });

            // 4. Load Corporate Wallet
            // We use 'getProducerWallet' assuming the admin is logged in
            const wallet = await getProducerWallet();

            setStats({
                totalNetRevenue: fees + ownSales,
                ownSalesVolume: ownSales,
                platformFees: fees,
                totalLiability: 45000, // Mock Liability (Sum of all other user wallets)
                corporateBalance: wallet.balance
            });

            setOwnProducts(myProducts);

        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados financeiros.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Corporate Wallet */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-brand-primary" />
                        Saúde Financeira
                    </h2>
                    <p className="text-gray-400 mt-1">Visão consolidada de receitas, liquidez e performance de produtos próprios.</p>
                </div>

                <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-green-500/30 p-1 flex items-center gap-4 pr-6 min-w-[300px]">
                    <div className="bg-green-500/20 p-4 rounded-xl">
                        <DollarSign className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                        <p className="text-xs text-green-400 font-bold uppercase tracking-wider">Caixa Corporativo (Disponível)</p>
                        <h3 className="text-3xl font-black text-white">
                            R$ {stats.corporateBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <Button
                        onClick={() => setIsWithdrawModalOpen(true)}
                        className="ml-auto !bg-green-600 hover:!bg-green-500 shadow-lg shadow-green-900/40 text-sm py-2 px-4"
                    >
                        SACAR LUCROS
                    </Button>
                </Card>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BarChart3 className="w-24 h-24 text-blue-500" />
                    </div>
                    <p className="text-gray-400 font-bold text-xs uppercase mb-2">Receita Líquida Total (Mês)</p>
                    <h3 className="text-3xl font-black text-white mb-1">
                        R$ {stats.totalNetRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-green-400 flex items-center font-bold bg-green-500/10 px-1.5 py-0.5 rounded">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> +12%
                        </span>
                        <span className="text-gray-500">vs. mês anterior</span>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <PieChart className="w-24 h-24 text-purple-500" />
                    </div>
                    <p className="text-gray-400 font-bold text-xs uppercase mb-2">Vendas Próprias (Produtos)</p>
                    <h3 className="text-3xl font-black text-white mb-1">
                        R$ {stats.ownSalesVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Representa 45% da receita total</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-24 h-24 text-yellow-500" />
                    </div>
                    <p className="text-gray-400 font-bold text-xs uppercase mb-2">Receita de Taxas (Intermediação)</p>
                    <h3 className="text-3xl font-black text-white mb-1">
                        R$ {stats.platformFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Gerado por 1.250 vendas de terceiros</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CreditCard className="w-24 h-24 text-red-500" />
                    </div>
                    <p className="text-gray-400 font-bold text-xs uppercase mb-2">Passivo Circulante (A Pagar)</p>
                    <h3 className="text-3xl font-black text-gray-300 mb-1">
                        R$ {stats.totalLiability.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-xs text-red-400 mt-1 font-bold">Saldo de parceiros a sacar</p>
                </div>
            </div>

            {/* Own Products Performance Section */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-purple-400" />
                        <h3 className="font-bold text-white text-lg">Performance de Produtos Próprios</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" className="!py-1.5 !text-xs">
                            <Filter className="w-3 h-3 mr-2" /> Filtrar
                        </Button>
                        <Button variant="secondary" className="!py-1.5 !text-xs">
                            Exportar Relatório
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-gray-900 text-gray-200 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4">Produto</th>
                                <th className="p-4 text-center">Vendas</th>
                                <th className="p-4 text-right">Faturamento</th>
                                <th className="p-4 text-right">Custos (Taxas/Comissões)</th>
                                <th className="p-4 text-right text-green-400">Lucro Líquido</th>
                                <th className="p-4 text-center">Margem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {ownProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                                        Nenhum produto próprio identificado. Cadastre produtos oficiais para visualizar métricas aqui.
                                    </td>
                                </tr>
                            ) : (
                                ownProducts.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-gray-750 transition-colors">
                                        <td className="p-4 font-medium text-white">
                                            {p.productName}
                                            {p.productId === 'credit_recharges_global' && <span className="ml-2 text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">RECORRENTE</span>}
                                        </td>
                                        <td className="p-4 text-center font-mono">{p.salesCount}</td>
                                        <td className="p-4 text-right text-white font-bold">R$ {p.revenue.toLocaleString()}</td>
                                        <td className="p-4 text-right text-red-300">
                                            R$ {(p.costs.platformFees + p.costs.taxes + p.costs.affiliateCommissions).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right font-black text-green-400 bg-green-500/5">
                                            R$ {p.netProfit.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.margin > 50 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {p.margin.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isWithdrawModalOpen && (
                <SharedWithdrawalModal
                    isOpen={isWithdrawModalOpen}
                    onClose={() => setIsWithdrawModalOpen(false)}
                    balance={stats.corporateBalance}
                    producerId="admin-01" // Corporate ID
                    producerName="Mestre nos Negócios (Sede)"
                    pixKey="33.444.555/0001-99"
                    bankInfo="Banco Inter (077) - Ag: 0001 - Cc: 123456-7"
                    sourceType="manual_sales"
                    onSuccess={() => {
                        toast.success("Saque Corporativo Solicitado!");
                        loadData(); // Refresh balance
                    }}
                />
            )}
        </div>
    );
};
