
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet, DollarSign, CheckCircle, Clock, ShieldCheck,
    AlertTriangle, FileText, Filter, Download
} from '@/components/Icons';
import Card from '@/components/Card';
import Button from '@/components/Button';
import toast from 'react-hot-toast';
import { WithdrawalModal } from '@/components/WithdrawalModal';
import { useAuth } from '@/hooks/useAuth';
import { SalesPerson } from '@/types';

export const FinancialView: React.FC = () => {
    const { user } = useAuth();
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    const transactions = [
        { id: 'TRX-982145', gatewayId: 'pi_3M9u...', date: '22/01/2026', product: 'Mestre do Tráfego 15X', value: 197.00, commission: 19.70, status: 'Aprovado', color: 'text-green-400' },
        { id: 'TRX-982142', gatewayId: 'pi_3M8x...', date: '21/01/2026', product: 'Mentoria Elite 50X', value: 997.00, commission: 99.70, status: 'Pendente', color: 'text-yellow-400' },
        { id: 'TRX-982139', gatewayId: 'pi_3M7v...', date: '20/01/2026', product: 'Ebook Viral 3.0', value: 47.00, commission: 4.70, status: 'Aprovado', color: 'text-green-400' },
        { id: 'TRX-982131', gatewayId: 're_1N2...', date: '19/01/2026', product: 'Mestre do Tráfego 15X', value: 197.00, commission: 19.70, status: 'Reembolsado', color: 'text-red-400' },
        { id: 'TRX-982125', gatewayId: 'pi_3M6k...', date: '18/01/2026', product: 'Mentoria Elite 50X', value: 997.00, commission: 99.70, status: 'Aprovado', color: 'text-green-400' },
    ];

    const handleWithdrawRequest = () => {
        setIsWithdrawModalOpen(true);
    };

    // Preparação dos dados para o Modal de Saque (Baseado no tipo SalesPerson)
    const salesUser = user as SalesPerson;

    // Dados de Compliance (Se disponíveis via flat fields ou producerData)
    // O sistema usa campos planos para SalesPerson (conforme ProfileView)
    const pixKey = salesUser?.pixKey || 'Não cadastrada';
    const bankInfo = (salesUser?.bankName && salesUser?.bankAccount)
        ? `${salesUser.bankName} - Ag: ${salesUser.bankAgency} / Cc: ${salesUser.bankAccount}`
        : undefined;

    const availableBalance = 1842.50; // Mock, em produção viria do backend

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 h-full overflow-y-auto pb-20 custom-scrollbar pr-2">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <Wallet className="w-7 h-7 text-green-500" />
                    <div>
                        Painel de Comissões
                        <span className="block text-[9px] text-gray-500 font-normal tracking-wide mt-1 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Split Automático via Stripe Connect
                        </span>
                    </div>
                </h2>
                <Button onClick={handleWithdrawRequest} className="!py-4 !px-8 !bg-green-600 hover:!bg-green-500 text-white font-black uppercase text-xs shadow-lg shadow-green-900/20 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" /> Solicitar Saque PIX
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-l-green-500 bg-gray-900 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><CheckCircle className="w-20 h-20 text-green-500" /></div>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Saldo Disponível</p>
                    <h3 className="text-4xl font-black text-green-400 mt-2">R$ {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    <p className="text-[9px] text-gray-600 mt-4 uppercase font-bold flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-500" /> Liquidação via LucPay Nativo</p>
                </Card>

                <Card className="p-6 border-l-4 border-l-yellow-500 bg-gray-900 shadow-xl">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Comissões Pendentes</p>
                    <h3 className="text-4xl font-black text-yellow-400 mt-2">R$ 4.120,00</h3>
                    <p className="text-[9px] text-gray-600 mt-4 uppercase font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Aguardando prazo de garantia (D+7)</p>
                </Card>

                <Card className="p-6 border-l-4 border-l-red-500 bg-gray-900 shadow-xl">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Pedidos de Reembolso</p>
                    <h3 className="text-4xl font-black text-red-400 mt-2">R$ 197,00</h3>
                    <p className="text-[9px] text-gray-600 mt-4 uppercase font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-500" /> 1 Solicitação em análise de retenção</p>
                </Card>
            </div>

            <Card className="overflow-hidden border border-gray-800 bg-gray-900 shadow-2xl">
                <div className="p-5 bg-gray-800/50 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-black text-white uppercase text-xs tracking-widest flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" /> Extrato de Vendas e Liquidações
                    </h3>
                    <div className="flex gap-2">
                        <div className="bg-gray-900 p-1 rounded-lg border border-gray-700 flex items-center px-3">
                            <Filter className="w-3 h-3 text-gray-500 mr-2" />
                            <select className="bg-transparent text-xs text-gray-300 outline-none font-bold uppercase cursor-pointer">
                                <option>Últimos 30 dias</option>
                                <option>Últimos 7 dias</option>
                                <option>Hoje</option>
                            </select>
                        </div>
                        <button className="p-2 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-700 text-gray-400 transition-colors">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/20 text-gray-500 text-[10px] font-black uppercase border-b border-gray-800">
                            <tr>
                                <th className="p-4">ID Transação</th>
                                <th className="p-4">Gateway ID</th>
                                <th className="p-4">Data</th>
                                <th className="p-4">Produto</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Comissão</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {transactions.map((tx, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 text-gray-400 font-mono text-[10px] uppercase">{tx.id}</td>
                                    <td className="p-4 text-gray-500 font-mono text-[9px]">{tx.gatewayId}</td>
                                    <td className="p-4 text-gray-500 text-xs">{tx.date}</td>
                                    <td className="p-4 text-white font-bold text-xs uppercase tracking-tight">{tx.product}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${tx.color.replace('text-', 'bg-')}/10 ${tx.color} ${tx.color.replace('text-', 'border-')}/20`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-black text-white text-sm">
                                        R$ {tx.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <WithdrawalModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                balance={availableBalance}
                beneficiaryName={user?.displayName || 'Usuário'}
                pixKey={pixKey}
                bankInfo={bankInfo}
            />
        </motion.div>
    );
};
