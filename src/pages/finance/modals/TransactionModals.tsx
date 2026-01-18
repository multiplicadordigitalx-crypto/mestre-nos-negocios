import React, { useState } from 'react';
import { X as XIcon, CheckCircle, Clock, AlertTriangle, FileText, Printer, Shield, User, CreditCard } from '@/components/Icons';
import Button from '@/components/Button';
import { Transaction, AuditLog } from '@/types/finance';
import { transactionService } from '@/services/transactionMockService';
import { toast } from 'react-hot-toast';

interface TransactionDetailModalProps {
    transaction: Transaction | null;
    isOpen: boolean;
    onClose: () => void;
    onRefundRequest: (tx: Transaction) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaction, isOpen, onClose, onRefundRequest }) => {
    if (!isOpen || !transaction) return null;

    const formatDate = (ts: number) => new Date(ts).toLocaleString('pt-BR');

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150] p-4">
            <div className="bg-gray-800 w-full max-w-4xl rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-brand-primary" /> Detalhes da Transação
                        </h3>
                        <p className="text-xs text-gray-400 font-mono mt-1">ID: {transaction.id}</p>
                    </div>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Status</p>
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase inline-flex items-center gap-1
                                    ${transaction.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                        transaction.status === 'refunded' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    {transaction.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                                    {transaction.status === 'refunded' && <AlertTriangle className="w-3 h-3" />}
                                    {transaction.status === 'chargeback' && <Shield className="w-3 h-3" />}
                                    {transaction.status}
                                </span>
                            </div>
                            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Valor Líquido</p>
                                <h2 className="text-2xl font-bold text-white">R$ {transaction.netAmount.toFixed(2)}</h2>
                                <p className="text-[10px] text-gray-500">Bruto: R$ {transaction.amount.toFixed(2)} (Taxa: R$ {transaction.platformFee.toFixed(2)})</p>
                            </div>
                        </div>

                        {/* Customer & Product */}
                        <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Cliente & Produto</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400 text-xs">Nome</p>
                                    <p className="text-white font-medium">{transaction.customer.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs">Email</p>
                                    <p className="text-white font-medium">{transaction.customer.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs">CPF</p>
                                    <p className="text-white font-medium">{transaction.customer.cpf}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs">Produto</p>
                                    <p className="text-brand-primary font-medium">{transaction.productName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Dados de Pagamento</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400 text-xs">Método</p>
                                    <p className="text-white font-medium uppercase">{transaction.payment.method.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs">Provedor</p>
                                    <p className="text-white font-medium">{transaction.payment.provider}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-400 text-xs">ID da Transação (Gateway)</p>
                                    <p className="text-white font-mono text-xs bg-gray-900 p-1 rounded border border-gray-700">{transaction.payment.providerId}</p>
                                </div>
                                {transaction.payment.pixKey && (
                                    <div className="col-span-2">
                                        <p className="text-gray-400 text-xs">Chave Pix</p>
                                        <p className="text-white font-mono text-xs">{transaction.payment.pixKey}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Actions & Audit */}
                    <div className="space-y-6">
                        {/* Actions */}
                        <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600 space-y-3">
                            <p className="text-xs text-gray-400 uppercase font-bold">Ações</p>
                            <Button variant="secondary" className="w-full text-xs" onClick={() => window.alert('Nota Fiscal gerada em nova aba (Mock)')}>
                                <Printer className="w-3 h-3 mr-2" /> Ver Nota Fiscal
                            </Button>
                            {transaction.status === 'approved' && (
                                <Button
                                    className="w-full text-xs !bg-red-500/10 hover:!bg-red-500/20 !text-red-400 border border-red-500/30"
                                    onClick={() => onRefundRequest(transaction)}
                                >
                                    <AlertTriangle className="w-3 h-3 mr-2" /> Forçar Reembolso
                                </Button>
                            )}
                        </div>

                        {/* Audit Timeline */}
                        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 h-full max-h-[300px] overflow-y-auto">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-4 flex items-center gap-2"><Shield className="w-3 h-3" /> Auditoria</p>
                            <div className="space-y-4">
                                {transaction.auditLogs && transaction.auditLogs.length > 0 ? transaction.auditLogs.map(log => (
                                    <div key={log.id} className="relative pl-4 border-l-2 border-gray-700 pb-2">
                                        <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-gray-500"></div>
                                        <p className="text-[10px] text-gray-500">{formatDate(log.timestamp)}</p>
                                        <p className="text-xs text-white font-bold">{log.action}</p>
                                        <p className="text-[10px] text-gray-400">Por: {log.userName}</p>
                                        <p className="text-[10px] text-gray-500 italic mt-1">{log.details}</p>
                                    </div>
                                )) : (
                                    <p className="text-xs text-gray-600 text-center py-4">Nenhum registro de auditoria.</p>
                                )}
                                <div className="relative pl-4 border-l-2 border-green-500/30">
                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-green-500"></div>
                                    <p className="text-[10px] text-gray-500">{formatDate(transaction.createdAt)}</p>
                                    <p className="text-xs text-white font-bold">Criação</p>
                                    <p className="text-[10px] text-gray-400">Sistema</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface RefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
    onConfirm: (reason: string) => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({ isOpen, onClose, transaction, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !transaction) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate delay
        setTimeout(() => {
            onConfirm(reason);
            setLoading(false);
            setReason('');
        }, 1000);
    }

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[160] p-4">
            <div className="bg-gray-800 w-full max-w-md rounded-xl border border-red-500/30 shadow-2xl p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4"><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Confirmar Reembolso</h3>
                    <p className="text-sm text-gray-400 mt-2">
                        Você está prestes a reembolsar a transação <span className="font-mono text-white">{transaction.id}</span> no valor de <span className="text-white font-bold">R$ {transaction.amount.toFixed(2)}</span>.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-2">Motivo do Reembolso</label>
                    <textarea
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-red-500 outline-none transition-colors h-24 mb-6 resize-none"
                        placeholder="Descreva o motivo (ex: Cliente solicitou dentro dos 7 dias...)"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        required
                    />

                    <div className="space-y-3">
                        <Button type="submit" isLoading={loading} className="w-full !bg-red-600 hover:!bg-red-500 font-bold">
                            CONFIRMAR ESTORNO
                        </Button>
                        <Button type="button" variant="secondary" onClick={onClose} className="w-full">
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
