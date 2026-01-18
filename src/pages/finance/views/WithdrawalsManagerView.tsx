
import React, { useState, useEffect } from 'react';
import {
    DollarSign, Clock, CheckCircle, XCircle, AlertTriangle,
    RefreshCw, Filter, Search, FileText, ArrowRight
} from '../../../components/Icons';
import Button from '../../../components/Button';
import { WithdrawalRequest, BatchProcessingSummary } from '../../../types/legacy';
import { getWithdrawalQueue, processPayoutBatch } from '../../../services/mockFirebase';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';

export const WithdrawalsManagerView: React.FC = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [processingBatch, setProcessingBatch] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');
    const [lastBatchSummary, setLastBatchSummary] = useState<BatchProcessingSummary | null>(null);

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // Auto-refresh
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getWithdrawalQueue();
            // Sort by Date descending
            setRequests(data.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()));
        } catch (error) {
            toast.error("Erro ao carregar fila de saques.");
        } finally {
            setLoading(false);
        }
    };

    const handleProcessBatch = async () => {
        if (!confirm("CONFIRMAÇÃO ADMIN: Deseja processar todos os saques pendentes agora? Isso simulará o envio ao Stripe/Banco.")) return;

        setProcessingBatch(true);
        try {
            const result = await processPayoutBatch();
            toast.success(`Lote processado! ${result.processed} itens enviados. Total: R$ ${result.totalAmount.toFixed(2)}`);
            await loadData();
        } catch (error) {
            toast.error("Erro ao processar lote.");
        } finally {
            setProcessingBatch(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-yellow-500/30 flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>;
            case 'processing': return <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-blue-500/30 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Processando</span>;
            case 'completed': return <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-green-500/30 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Pago</span>;
            case 'failed': return <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-red-500/30 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Falha</span>;
            default: return <span className="bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{status}</span>;
        }
    };

    const filteredRequests = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus);
    const totalPending = requests.filter(r => r.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-green-500" /> Gestão de Saques
                    </h2>
                    <p className="text-gray-400 text-sm">Monitore e audite a fila de pagamentos automáticos.</p>
                </div>

                {isAdmin && (
                    <Button
                        onClick={handleProcessBatch}
                        isLoading={processingBatch}
                        className="!bg-indigo-600 hover:!bg-indigo-500 shadow-lg shadow-indigo-900/20"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Forçar Processamento de Lote
                    </Button>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <p className="text-gray-400 text-xs font-bold uppercase">Aguardando Pagamento</p>
                    <p className="text-2xl font-bold text-yellow-400 mt-1">R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-gray-500 mt-1">{requests.filter(r => r.status === 'pending').length} solicitações</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <p className="text-gray-400 text-xs font-bold uppercase">Pagos (Total)</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">
                        R$ {requests.filter(r => r.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <p className="text-gray-400 text-xs font-bold uppercase">Previsão Próximo Lote</p>
                    <p className="text-lg font-bold text-white mt-1">Hoje, 16:00</p>
                    <p className="text-xs text-blue-400">Automático</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <p className="text-gray-400 text-xs font-bold uppercase">Status do Gateway</p>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-green-400 font-bold text-sm">Operacional</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 bg-gray-900/50 p-2 rounded-lg border border-gray-800 overflow-x-auto">
                <Filter className="w-4 h-4 text-gray-500 ml-2" />
                {(['all', 'pending', 'processing', 'completed', 'failed'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors whitespace-nowrap ${filterStatus === status
                                ? 'bg-gray-700 text-white'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                            }`}
                    >
                        {status === 'all' ? 'Todos' : status}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-gray-900 text-gray-200 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4">ID / Data</th>
                                <th className="p-4">Beneficiário</th>
                                <th className="p-4">Valor</th>
                                <th className="p-4">Origem</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        Nenhuma solicitação encontrada.
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="p-4">
                                            <p className="font-mono text-xs text-white opacity-70 mb-1">{req.id}</p>
                                            <p className="text-xs">{new Date(req.requestedAt).toLocaleString()}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-900 text-indigo-300 flex items-center justify-center text-[10px] font-bold border border-indigo-500/30">
                                                    {(req.producerName || 'U').charAt(0)}
                                                </div>
                                                <span className="text-white font-medium">{req.producerName}</span>
                                            </div>
                                            {req.destinationBank?.pixKey && <p className="text-[10px] mt-1 text-gray-500">Pix: {req.destinationBank.pixKey}</p>}
                                        </td>
                                        <td className="p-4 font-bold text-white">
                                            R$ {req.amount.toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            {req.sourceType === 'auto_commission'
                                                ? <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">Comissão Auto</span>
                                                : <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded border border-gray-600">Manual</span>
                                            }
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(req.status)}
                                            {req.stripePayoutId && <p className="text-[9px] font-mono text-gray-600 mt-1">Ref: {req.stripePayoutId}</p>}
                                        </td>
                                        <td className="p-4">
                                            <button className="text-gray-400 hover:text-white transition-colors">
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
