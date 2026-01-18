
import React from 'react';
import { motion } from 'framer-motion';
import { Influencer } from '../../../types';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { Wallet, CheckCircle, Clock, Ban, DollarSign, Users, Link as LinkIcon } from '../../../components/Icons';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

export const FinancialSection: React.FC<{ influencer: Influencer, onWithdraw: () => void }> = ({ influencer, onWithdraw }) => {
    if (!influencer) return <div className="p-10 text-center"><LoadingSpinner /></div>;

    const myProducts = Array.isArray(influencer?.products) ? influencer.products : [];
    const pendingCommissions = myProducts.reduce((acc, p) => acc + (p.pendingEarnings || 0), 0);
    const availableCommissions = influencer?.availableBalance || 0;

    const transactions = [
        { date: 'Hoje', id: '#TX-821', product: 'Mestre do Tráfego', status: 'LIBERADO', amount: 150.00, type: 'Co-produção' },
        { date: 'Ontem', id: '#TX-820', product: 'Ebook Viral', status: 'PENDENTE', amount: 47.00, type: 'Afiliação' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-l-green-500 bg-gray-800 flex flex-col justify-between shadow-lg">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase mb-1">Disponível para Saque</p>
                        <h3 className="text-3xl font-black text-green-400">R$ {availableCommissions.toLocaleString('pt-BR')}</h3>
                        <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500"/> Saldo Liquidado</p>
                    </div>
                    <Button onClick={onWithdraw} className="w-full mt-6 !bg-green-600 hover:!bg-green-500 font-bold" disabled={availableCommissions <= 0}>Realizar Saque</Button>
                </Card>
                <Card className="p-6 border-l-4 border-l-yellow-500 bg-gray-800"><p className="text-gray-400 text-xs font-bold uppercase mb-1">Pendente (Garantia)</p><h3 className="text-3xl font-black text-yellow-400">R$ {pendingCommissions.toLocaleString('pt-BR')}</h3><p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1"><Clock className="w-3 h-3"/> Liberação em D+7</p></Card>
                <Card className="p-6 border-l-4 border-l-red-500 bg-gray-800"><p className="text-gray-400 text-xs font-bold uppercase mb-1">Cancelado/Chargeback</p><h3 className="text-3xl font-black text-red-400">R$ 0,00</h3><p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1"><Ban className="w-3 h-3"/> Sem ocorrências</p></Card>
            </div>

            <Card className="bg-gray-800 border-gray-700 overflow-hidden mt-8">
                <div className="p-4 bg-gray-900 border-b border-gray-700 flex justify-between items-center"><h4 className="font-bold text-white text-sm">Extrato LucPay</h4><Button variant="secondary" className="!py-1 !px-2 !text-[9px]">Baixar CSV</Button></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-900 text-gray-400 text-[10px] uppercase font-bold">
                            <tr><th className="p-4">Data</th><th className="p-4">Tipo</th><th className="p-4">Produto</th><th className="p-4">Status</th><th className="p-4 text-right">Valor</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {transactions.map((tx, idx) => (
                                <tr key={idx} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4 text-gray-400 text-xs">{tx.date}</td>
                                    <td className="p-4"><span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${tx.type === 'Co-produção' ? 'text-purple-400 border-purple-500/30' : 'text-blue-400 border-blue-500/30'}`}>{tx.type}</span></td>
                                    <td className="p-4 text-white font-medium">{tx.product}</td>
                                    <td className="p-4"><span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${tx.status === 'LIBERADO' ? 'bg-green-900/20 text-green-400 border-green-500/30' : 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30'}`}>{tx.status}</span></td>
                                    <td className="p-4 text-right font-black text-white">R$ {tx.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
