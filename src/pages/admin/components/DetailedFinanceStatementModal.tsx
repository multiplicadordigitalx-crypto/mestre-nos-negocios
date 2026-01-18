
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import { X as XIcon, DollarSign, ArrowUpRight, ArrowDownLeft, Calendar, FileText, Search } from '../../../components/Icons';
import { Student, Influencer } from '../../../types';
import { getStudentWalletHistory } from '../../../services/mockFirebase';

interface DetailedFinanceStatementModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: Student | Influencer;
}

export const DetailedFinanceStatementModal: React.FC<DetailedFinanceStatementModalProps> = ({ isOpen, onClose, user }) => {
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Mock aggregate data logic
    // In a real app, we'd fetch specific endpoints. Here we mix wallet and income history.
    const incomeHistory = (user as any).incomeHistory || [];
    const walletHistory = (user as any).walletTransactions || [];

    // Normalize entries
    const allTransactions = [
        ...incomeHistory.map((inc: any) => ({
            id: inc.id,
            date: inc.date,
            type: 'income',
            category: 'Venda',
            description: inc.description || `Venda: ${inc.source}`,
            amount: inc.amount,
            fee: inc.amount * 0.05, // Mock fee 5%
            net: inc.amount * 0.95,
            status: 'settled',
            method: inc.validationType || 'Credit Card'
        })),
        ...walletHistory.map((tx: any) => ({
            id: tx.id,
            date: new Date(tx.timestamp).toISOString(),
            type: tx.amount > 0 ? 'credit_add' : 'expense',
            category: tx.category || 'Créditos',
            description: tx.description,
            amount: Math.abs(tx.amount),
            fee: 0,
            net: Math.abs(tx.amount),
            status: 'settled',
            method: 'Wallet'
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const filtered = allTransactions.filter(tx => {
        if (filter === 'income' && tx.type !== 'income' && tx.type !== 'credit_add') return false;
        if (filter === 'expense' && tx.type !== 'expense') return false;
        if (searchTerm && !tx.id.toLowerCase().includes(searchTerm.toLowerCase()) && !tx.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[120] p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-900 w-full max-w-5xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col h-[85vh]"
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-primary/20 rounded-xl text-brand-primary">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Extrato Financeiro Detalhado</h2>
                            <p className="text-xs text-gray-400 font-mono">USER-ID: <span className="text-white">{user.uid}</span> | {user.displayName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-colors">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 bg-gray-800/30 border-b border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700">
                        <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${filter === 'all' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}>Tudo</button>
                        <button onClick={() => setFilter('income')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${filter === 'income' ? 'bg-green-900/30 text-green-400 shadow' : 'text-gray-400 hover:text-white'}`}>Entradas</button>
                        <button onClick={() => setFilter('expense')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${filter === 'expense' ? 'bg-red-900/30 text-red-400 shadow' : 'text-gray-400 hover:text-white'}`}>Saídas</button>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Buscar TXID ou Descrição..."
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-brand-primary outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto custom-scrollbar bg-gray-900">
                    <table className="w-full text-left text-xs text-gray-400">
                        <thead className="bg-gray-800 text-gray-300 font-bold sticky top-0 uppercase tracking-wider z-10 shadow-sm">
                            <tr>
                                <th className="p-4 w-32">Data</th>
                                <th className="p-4 w-32">TXID</th>
                                <th className="p-4">Descrição</th>
                                <th className="p-4 w-32">Método</th>
                                <th className="p-4 text-right">Bruto</th>
                                <th className="p-4 text-right">Taxas</th>
                                <th className="p-4 text-right">Líquido</th>
                                <th className="p-4 text-center w-24">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-10 text-center text-gray-500">Nenhum registro encontrado.</td>
                                </tr>
                            ) : filtered.map((tx, idx) => (
                                <tr key={tx.id || idx} className="hover:bg-gray-800/40 transition-colors group">
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium">{new Date(tx.date).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-gray-600">{new Date(tx.date).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-[10px] text-gray-500 group-hover:text-blue-400 cursor-pointer select-all">{tx.id}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {tx.type === 'expense' ? <ArrowUpRight className="w-3 h-3 text-red-500" /> : <ArrowDownLeft className="w-3 h-3 text-green-500" />}
                                            <span className="text-gray-300">{tx.description}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-[10px] uppercase font-bold">{tx.method}</td>
                                    <td className={`p-4 text-right font-medium ${tx.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                                        {tx.type === 'expense' ? '-' : '+'} R$ {tx.amount.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-right text-red-300/70">- R$ {tx.fee.toFixed(2)}</td>
                                    <td className="p-4 text-right font-bold text-white">R$ {tx.net.toFixed(2)}</td>
                                    <td className="p-4 text-center">
                                        <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] uppercase font-bold border border-green-500/20">
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Summary */}
                <div className="bg-gray-800 p-4 border-t border-gray-700 flex justify-between items-center text-gray-300 text-xs">
                    <div>
                        Mostrando <strong className="text-white">{filtered.length}</strong> transações
                    </div>
                    <div className="flex gap-6 text-right">
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-gray-500">Total Entradas</span>
                            <span className="text-green-400 font-bold text-sm">R$ {filtered.filter(x => x.type !== 'expense').reduce((a, b) => a + b.net, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-gray-500">Total Saídas</span>
                            <span className="text-red-400 font-bold text-sm">R$ {filtered.filter(x => x.type === 'expense').reduce((a, b) => a + b.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
