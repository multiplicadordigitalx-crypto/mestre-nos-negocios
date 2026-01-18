
import React, { useState, useEffect } from 'react';
import {
    CreditCard, User, Clock, CheckCircle, XCircle,
    AlertCircle, Search, Filter, MessageSquare
} from '@/components/Icons';
import Button from '@/components/Button';
import { FinanceRequest } from '@/types';
import { getFinanceRequests, respondToFinanceRequest } from '@/services/mockFirebase';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

const FinanceRequestQueue: React.FC = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<FinanceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [search, setSearch] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getFinanceRequests();
            setRequests(data.sort((a, b) => b.createdAt - a.createdAt));
        } catch (error) {
            toast.error("Erro ao carregar solicitações");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAction = async (id: string, action: 'approved' | 'rejected') => {
        const feedback = prompt(action === 'approved' ? 'Observação (opcional):' : 'Motivo da rejeição:');
        if (action === 'rejected' && !feedback) return;

        try {
            await respondToFinanceRequest(id, action, feedback || '', user?.uid || 'system');
            toast.success(`Solicitação ${action === 'approved' ? 'aprovada' : 'rejeitada'}!`);
            loadData();
        } catch (error) {
            toast.error("Erro ao processar solicitação");
        }
    };

    const filteredRequests = requests.filter(r => {
        const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
        const matchesSearch = r.studentName.toLowerCase().includes(search.toLowerCase()) ||
            r.requesterName.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por aluno ou solicitante..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none focus:border-brand-primary"
                    />
                </div>
                <div className="flex items-center bg-gray-900 border border-gray-700 rounded-xl px-3 py-2">
                    <Filter className="w-4 h-4 text-gray-500 mr-2" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="bg-transparent text-sm text-gray-300 outline-none cursor-pointer"
                    >
                        <option value="all">Todos Status</option>
                        <option value="pending">Pendentes</option>
                        <option value="approved">Aprovados</option>
                        <option value="rejected">Rejeitados</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Caregando solicitações...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900/30 rounded-2xl border border-dashed border-gray-700">
                        <CreditCard className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhuma solicitação encontrada.</p>
                    </div>
                ) : (
                    filteredRequests.map((r) => (
                        <div key={r.id} className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-600 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${r.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                        r.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                            'bg-red-500/10 text-red-500'
                                    }`}>
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-white font-bold">{r.studentName}</p>
                                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded uppercase font-black">SOLICITAÇÃO DE CRÉDITO</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <User className="w-3 h-3" /> Solicitado por: <strong>{r.requesterName}</strong>
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xl font-black text-white">
                                            {r.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                        <div className="px-2 py-1 bg-gray-800 rounded flex items-center gap-1.5 border border-gray-700">
                                            <AlertCircle className="w-3 h-3 text-gray-400" />
                                            <p className="text-[10px] text-gray-300 italic">"{r.reason}"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {r.status === 'pending' ? (
                                    <>
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleAction(r.id, 'rejected')}
                                            className="!bg-red-500/10 !text-red-400 border border-red-500/30 hover:!bg-red-500 hover:!text-white"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" /> Rejeitar
                                        </Button>
                                        <Button
                                            onClick={() => handleAction(r.id, 'approved')}
                                            className="!bg-green-600 hover:!bg-green-500"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" /> Aprovar
                                        </Button>
                                    </>
                                ) : (
                                    <div className="text-right">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${r.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                                                'bg-red-500/10 text-red-400 border border-red-500/30'
                                            }`}>
                                            {r.status === 'approved' ? 'Concluído' : 'Recusado'}
                                        </span>
                                        {r.feedback && (
                                            <p className="text-[10px] text-gray-500 mt-1 flex items-center justify-end gap-1">
                                                <MessageSquare className="w-2.5 h-2.5" /> Obs: {r.feedback}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FinanceRequestQueue;
