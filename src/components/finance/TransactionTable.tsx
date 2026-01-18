import React from 'react';
import { FileText, Shield, AlertTriangle } from '@/components/Icons';
import { Transaction } from '@/types/finance';

interface TransactionTableProps {
    transactions: Transaction[];
    onViewDetails: (tx: Transaction) => void;
    loading?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onViewDetails, loading }) => {
    if (loading) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Carregando transações...</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                    <tr>
                        <th className="px-6 py-3">Data</th>
                        <th className="px-6 py-3">Cliente</th>
                        <th className="px-6 py-3">Produto</th>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Plataforma</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Valor</th>
                        <th className="px-6 py-3 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-800/50 transition-colors group">
                            <td className="px-6 py-3 text-gray-300">
                                {new Date(tx.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-6 py-3">
                                <div className="text-white font-medium">{tx.customer.name}</div>
                                <div className="text-[10px] text-gray-500">{tx.customer.cpf}</div>
                            </td>
                            <td className="px-6 py-3">
                                <div className="text-white text-xs truncate max-w-[150px]" title={tx.productName}>{tx.productName}</div>
                            </td>
                            <td className="px-6 py-3">
                                <div className="text-sm text-white font-mono bg-white/5 border border-white/10 px-2 py-1 rounded-md w-fit select-all font-bold tracking-wider shadow-sm">{tx.id}</div>
                            </td>
                            <td className="px-6 py-3">
                                <span className="text-xs text-gray-400 bg-gray-800 border border-gray-600 px-2 py-0.5 rounded">
                                    {tx.payment.provider}
                                </span>
                            </td>
                            <td className="px-6 py-3">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1
                                    ${tx.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                        tx.status === 'refunded' ? 'bg-red-500/20 text-red-400' :
                                            'bg-yellow-500/20 text-yellow-400'}`}>
                                    {tx.status === 'approved' ? 'Aprovado' : tx.status === 'refunded' ? 'Reembolsado' : tx.status}
                                    {tx.status === 'refunded' && <AlertTriangle className="w-3 h-3" />}
                                </span>
                            </td>
                            <td className={`px-6 py-3 text-right font-bold ${tx.type === 'sale' ? 'text-green-400' : 'text-red-400'}`}>
                                {tx.type === 'sale' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-3 text-center">
                                <button
                                    onClick={() => onViewDetails(tx)}
                                    className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                    title="Ver Detalhes"
                                >
                                    <FileText className="w-4 h-4" />
                                </button>
                                {tx.auditLogs.length > 0 && (
                                    <span className="ml-1 inline-block" title="Possui registros de auditoria">
                                        <Shield className="w-3 h-3 text-brand-primary" />
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {transactions.length === 0 && (
                        <tr>
                            <td colSpan={7} className="p-8 text-center text-gray-500">
                                Nenhuma transação encontrada com os filtros atuais.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
