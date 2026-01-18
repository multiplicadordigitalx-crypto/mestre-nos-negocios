
import React, { useState, useEffect } from 'react';
import {
    Plus, DollarSign, Calendar, Tag, AlertTriangle, CheckCircle,
    FileText, Search, Filter, TrendingDown, Sparkles
} from '@/components/Icons';
import Button from '@/components/Button';
import { AccountPayable } from '@/types';
import { getPayables, suggestEconomy, updatePayableStatus } from '@/services/mockFirebase';
import { toast } from 'react-hot-toast';
import { PayableModal } from '../modals/FinanceModals';

const AccountsPayableView: React.FC = () => {
    const [payables, setPayables] = useState<AccountPayable[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [economySuggestions, setEconomySuggestions] = useState<any[]>([]);
    const [filterCategory, setFilterCategory] = useState('Todas');

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getPayables();
            setPayables([...data].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
            const suggestions = await suggestEconomy();
            setEconomySuggestions(suggestions);
        } catch (error) {
            toast.error("Erro ao carregar contas a pagar");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'pending' ? 'paid' : 'pending';
        try {
            await updatePayableStatus(id, nextStatus as any);
            toast.success(`Status atualizado para ${nextStatus === 'paid' ? 'Pago' : 'Pendente'}`);
            loadData();
        } catch (error) {
            toast.error("Erro ao atualizar status");
        }
    };

    const categories = ['Todas', ...Array.from(new Set(payables.map(p => p.category)))];
    const filteredPayables = filterCategory === 'Todas'
        ? payables
        : payables.filter(p => p.category === filterCategory);

    const totalPending = filteredPayables
        .filter(p => p.status === 'pending')
        .reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="space-y-6">
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <DollarSign className="w-6 h-6 text-red-400" />
                        </div>
                        <h3 className="text-gray-400 font-medium">Total Pendente</h3>
                    </div>
                    <p className="text-3xl font-black text-white">
                        {totalPending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl md:col-span-2">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Sparkles className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-gray-400 font-medium font-black uppercase text-xs tracking-widest">Nexus IA: Sugestões de Economia</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {economySuggestions.slice(0, 2).map((s, i) => (
                            <div key={i} className="flex items-start gap-3 bg-gray-900/50 p-3 rounded-xl border border-purple-500/20">
                                <TrendingDown className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-300 font-medium leading-tight">{typeof s === 'string' ? s : s.suggestion}</p>
                                    <p className="text-[10px] text-green-400 mt-1 font-bold">Potencial: {typeof s === 'string' ? 'Alto Impacto' : `R$ ${s.potentialSaving} /mês`}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* List Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Contas a Pagar
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{filteredPayables.length}</span>
                    </h2>
                    <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 focus-within:border-brand-primary transition-all">
                        <Filter className="w-4 h-4 text-gray-500 mr-2" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-transparent text-sm text-gray-300 outline-none cursor-pointer"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Novo Lançamento
                </Button>
            </div>

            {/* Table */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-900/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                <th className="px-6 py-4">Vencimento</th>
                                <th className="px-6 py-4">Descrição</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4">Valor</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {filteredPayables.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                                        Nenhuma conta encontrada para os filtros selecionados.
                                    </td>
                                </tr>
                            ) : (
                                filteredPayables.map((p) => {
                                    const isOverdue = new Date(p.dueDate) < new Date() && p.status === 'pending';
                                    return (
                                        <tr key={p.id} className="hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className={`w-4 h-4 ${isOverdue ? 'text-red-400' : 'text-gray-500'}`} />
                                                    <span className={isOverdue ? 'text-red-400 font-bold' : 'text-gray-300'}>
                                                        {new Date(p.dueDate).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-white font-medium text-sm">{p.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${p.type === 'fixed' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                                        {p.type === 'fixed' ? 'Fixo' : 'Variável'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="w-3 h-3 text-gray-500" />
                                                    <span className="text-xs text-gray-400">{p.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-white text-sm">
                                                {p.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${p.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                                                        isOverdue ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-500'
                                                    }`}>
                                                    {p.status === 'paid' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                                    {p.status === 'paid' ? 'Pago' : isOverdue ? 'Atrasado' : 'Pendente'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleStatus(p.id, p.status)}
                                                        className={`p-2 rounded-lg transition-all ${p.status === 'paid'
                                                                ? 'bg-gray-700 text-gray-400 hover:text-white'
                                                                : 'bg-green-600/10 text-green-400 hover:bg-green-600 hover:text-white'
                                                            }`}
                                                        title={p.status === 'paid' ? "Marcar como Pendente" : "Marcar como Pago"}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    {p.attachmentUrl && (
                                                        <a
                                                            href={p.attachmentUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                                            title="Ver Anexo/OCR"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <PayableModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={() => { loadData(); setIsModalOpen(false); }}
                />
            )}
        </div>
    );
};

export default AccountsPayableView;
