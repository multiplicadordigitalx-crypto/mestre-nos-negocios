
import React from 'react';
import { motion } from 'framer-motion';
import { Influencer } from '../../../types';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { Wallet, CheckCircle, Clock, Ban, DollarSign, Users, Link as LinkIcon, ActivityIcon, Download } from '../../../components/Icons';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

export const FinancialSection: React.FC<{ influencer: Influencer, onWithdraw: () => void }> = ({ influencer, onWithdraw }) => {
    if (!influencer) return <div className="p-10 text-center"><LoadingSpinner /></div>;

    const myProducts = Array.isArray(influencer?.products) ? influencer.products : [];
    const pendingCommissions = myProducts.reduce((acc, p) => acc + (p.pendingEarnings || 0), 0);
    const availableCommissions = influencer?.availableBalance || 0;

    const transactions = [
        { id: 'LP-98214', date: 'Hoje, 14:30', product: 'Mestre do Tráfego', status: 'LIBERADO', amount: 150.00, type: 'Co-produção', availableDate: '27/01/2026' },
        { id: 'LP-98213', date: 'Ontem, 11:20', product: 'Ebook Viral', status: 'PENDENTE', amount: 47.00, type: 'Afiliação', availableDate: '26/01/2026' },
        { id: 'LP-98212', date: 'Há 2 dias', product: 'Mentoria Elite', status: 'LIBERADO', amount: 250.00, type: 'Co-produção', availableDate: '25/01/2026' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-l-green-500 bg-gray-800 flex flex-col justify-between shadow-lg">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase mb-1">Disponível para Saque</p>
                        <h3 className="text-3xl font-black text-green-400">R$ {availableCommissions.toLocaleString('pt-BR')}</h3>
                        <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Saldo Liquidado</p>
                    </div>
                    <Button onClick={onWithdraw} className="w-full mt-6 !bg-green-600 hover:!bg-green-500 font-bold" disabled={availableCommissions <= 0}>Realizar Saque</Button>
                </Card>
                <Card className="p-6 border-l-4 border-l-yellow-500 bg-gray-800"><p className="text-gray-400 text-xs font-bold uppercase mb-1">Pendente (Garantia)</p><h3 className="text-3xl font-black text-yellow-400">R$ {pendingCommissions.toLocaleString('pt-BR')}</h3><p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Liberação em D+7</p></Card>
                <Card className="p-6 border-l-4 border-l-red-500 bg-gray-800"><p className="text-gray-400 text-xs font-bold uppercase mb-1">Cancelado/Chargeback</p><h3 className="text-3xl font-black text-red-400">R$ 0,00</h3><p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1"><Ban className="w-3 h-3" /> Sem ocorrências</p></Card>
            </div>

            <Card className="bg-gray-800 border-gray-700 overflow-hidden mt-8">
                <div className="p-4 bg-gray-900/50 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <ActivityIcon className="w-5 h-5 text-brand-primary" /> Extrato LucPay
                    </h3>
                    <Button variant="secondary" className="!py-2 !px-3 !text-xs flex items-center gap-2 w-full sm:w-auto">
                        <Download className="w-3 h-3" /> Baixar CSV
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[640px]">
                        <thead className="bg-gray-900 text-gray-500 uppercase font-bold text-[10px]">
                            <tr>
                                <th className="p-3 sm:p-4">ID Transação</th>
                                <th className="p-3 sm:p-4">Produto</th>
                                <th className="p-3 sm:p-4">Data</th>
                                <th className="p-3 sm:p-4">Liberação (D+7)</th>
                                <th className="p-3 sm:p-4 text-center">Status</th>
                                <th className="p-3 sm:p-4 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {transactions.map((tx, idx) => (
                                <tr key={idx} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="p-3 sm:p-4 font-mono text-xs text-gray-400">{tx.id}</td>
                                    <td className="p-3 sm:p-4">
                                        <p className="font-bold text-white text-sm">{tx.product}</p>
                                        <p className="text-[10px] text-gray-500 uppercase">{tx.type}</p>
                                    </td>
                                    <td className="p-3 sm:p-4 text-gray-400 text-xs">{tx.date}</td>
                                    <td className="p-3 sm:p-4 text-gray-300 text-xs font-mono">{tx.availableDate}</td>
                                    <td className="p-3 sm:p-4 text-center">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${tx.status === 'LIBERADO' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="p-3 sm:p-4 text-right font-black text-green-400">+ R$ {tx.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
