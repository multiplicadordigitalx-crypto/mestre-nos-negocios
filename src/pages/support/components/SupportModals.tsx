
import React, { useState } from 'react';
import Button from '../../../components/Button';
import { X as XIcon, TrendingUp, Eye, CheckCircle, AlertTriangle, FileText, LockClosed, DollarSign, PieChart } from '../../../components/Icons';
import { LinkRequest, RefundRequest, Student, SupportAgent, WalletTransaction, Influencer, WithdrawalRequest } from '../../../types';
import { getStudentWalletHistory, createFinanceRequest, createAuditLog, respondToFinanceRequest, getWithdrawalQueue } from '../../../services/mockFirebase';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import Input from '../../../components/Input';
import toast from 'react-hot-toast';

export const EscalationModal: React.FC<{ onClose: () => void, onConfirm: (reason: string, targetLevel: 'finance' | 'admin') => void }> = ({ onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [targetLevel, setTargetLevel] = useState<'finance' | 'admin'>('finance');

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-800 w-full max-w-md rounded-2xl p-6 border border-gray-700 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-brand-primary" /> Escalar Atendimento
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><XIcon className="w-5 h-5" /></button>
                </div>

                <div className="mb-6">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Nível de Escalonamento</label>
                    <div className="grid grid-cols-2 gap-3 p-1 bg-gray-900 rounded-xl">
                        <button
                            onClick={() => setTargetLevel('finance')}
                            className={`py-2 text-xs font-bold rounded-lg transition-all ${targetLevel === 'finance' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            FINANCEIRO
                        </button>
                        <button
                            onClick={() => setTargetLevel('admin')}
                            className={`py-2 text-xs font-bold rounded-lg transition-all ${targetLevel === 'admin' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            ADMINISTRADOR
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Motivos Internos (Privado)</label>
                    <textarea
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white text-sm focus:border-brand-primary outline-none h-32 resize-none transition-all placeholder:text-gray-600"
                        placeholder="Explique por que está escalando... (Isso não será visto pelo aluno)"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-6">
                    <p className="text-[11px] text-blue-200 leading-relaxed font-medium">
                        O ticket {targetLevel === 'finance' ? 'sairá da sua fila e aparecerá para o Financeiro.' : 'será enviado diretamente para a fila crítica do Administrador.'}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onClose} className="flex-1 !rounded-xl">Cancelar</Button>
                    <Button onClick={() => onConfirm(reason, targetLevel)} className={`flex-1 !rounded-xl font-bold ${targetLevel === 'admin' ? '!bg-orange-600 hover:!bg-orange-500' : '!bg-blue-600 hover:!bg-blue-500'}`} disabled={!reason.trim()}>
                        ESCALAR AGORA
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export const ApproveLinkModal: React.FC<{ request: LinkRequest, onClose: () => void, onApprove: (id: string, link: string) => void }> = ({ request, onClose, onApprove }) => {
    const [link, setLink] = useState('');
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-md rounded-xl p-6 border border-gray-700 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-4">Aprovar Afiliação</h2>
                <div className="mb-4 bg-gray-900 p-3 rounded border border-gray-700">
                    <h4 className="text-blue-400 text-xs font-bold uppercase mb-2 flex items-center gap-1"><Eye className="w-3 h-3" /> Redes Sociais</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                        {Object.entries(request.socialLinks).filter(([_, val]) => val).map(([network, url]) => (
                            <a key={network} href={url as string} target="_blank" rel="noreferrer" className="block text-sm text-blue-400 hover:underline">
                                <span className="capitalize font-bold text-white">{network}:</span> {url as string}
                            </a>
                        ))}
                    </div>
                </div>
                <input className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white mb-4 focus:border-blue-500 outline-none" placeholder="Link final gerado (Hotmart/Kiwify)..." value={link} onChange={e => setLink(e.target.value)} />
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button onClick={() => onApprove(request.id, link)} className="flex-1" disabled={!link}>Aprovar</Button>
                </div>
            </div>
        </div>
    );
};

export const RefundTriageModal: React.FC<{ request: RefundRequest, onClose: () => void, onAction: (id: string, action: 'forward' | 'reject') => void }> = ({ request, onClose, onAction }) => {
    const purchaseDate = new Date(request.purchaseDate);
    const deadline = new Date(purchaseDate);
    deadline.setDate(deadline.getDate() + 7);
    const isWithinGuarantee = new Date() <= deadline;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-md rounded-xl p-6 border border-gray-700 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-4">Triagem de Reembolso</h2>
                <div className="bg-gray-900 p-4 rounded mb-4 text-sm space-y-2">
                    <p className="flex justify-between"><span className="text-gray-400">Solicitado em:</span><span className="text-white">{new Date(request.requestDate).toLocaleDateString()}</span></p>
                    <p className="flex justify-between"><span className="text-gray-400">Compra em:</span> <span className="text-white">{purchaseDate.toLocaleDateString()}</span></p>
                    <div className={`p-2 rounded text-center font-bold ${isWithinGuarantee ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {isWithinGuarantee ? 'DENTRO DA GARANTIA (7 DIAS)' : 'FORA DA GARANTIA'}
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => onAction(request.id, 'reject')} className="flex-1 !text-red-400">Rejeitar</Button>
                    <Button onClick={() => onAction(request.id, 'forward')} className="flex-1" disabled={!isWithinGuarantee}>Encaminhar Admin</Button>
                </div>
                <button onClick={onClose} className="w-full mt-3 text-xs text-gray-500 uppercase hover:text-white">Fechar</button>
            </div>
        </div>
    );
};

export const CreditManagementModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    agent: SupportAgent & { creditLimit?: number };
}> = ({ isOpen, onClose, student, agent }) => {
    const [history, setHistory] = useState<WalletTransaction[]>([]);
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionType, setActionType] = useState<'add' | 'refund'>('add');

    React.useEffect(() => {
        if (isOpen) {
            getStudentWalletHistory(student.uid).then(data => {
                setHistory(data);
                setIsLoading(false);
            });
        }
    }, [isOpen, student.uid]);

    const handleProcess = async () => {
        const val = Number(amount);
        if (!val || val <= 0) return toast.error("Informe um valor válido.");
        if (!reason || reason.length < 10) return toast.error("Informe um motivo detalhado para auditoria.");

        // LIMIT CHECK
        const limit = agent.creditLimit || 0;
        const needsEscalation = val > limit;

        setIsSubmitting(true);
        try {
            if (needsEscalation) {
                // Must create a request
                await createFinanceRequest(student.uid, student.displayName || 'Aluno', agent, val, `[ESCALATION REQUIRED] (Limit: ${limit}) - ${reason}`);
                toast.success("Solicitação enviada para aprovação do Admin (Acima do limite)!", { icon: '⏳' });
            } else {
                // Auto-approve within limit
                // We reuse the respondToFinanceRequest logic essentially, or create a direct transaction function
                // For now, let's create a "DIRECT_APPROVED" request
                const req = await createFinanceRequest(student.uid, student.displayName || 'Aluno', agent, val, reason);
                await respondToFinanceRequest(req.id, 'approved', 'Auto-approved within agent limit', agent.uid);

                // AUDIT LOG
                const auditAction = actionType === 'add' ? 'CREDIT_ADD_DIRECT' : 'CREDIT_REFUND_DIRECT';
                await createAuditLog(agent.uid, auditAction, 'medium', `Agent ${agent.displayName} processed ${val} credits for ${student.displayName}. Reason: ${reason}`);

                toast.success(`Créditos ${actionType === 'add' ? 'adicionados' : 'estornados'} com sucesso!`);
            }
            onClose();
        } catch (e) {
            toast.error("Erro ao processar.");
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const limit = agent.creditLimit || 0;
    const val = Number(amount || 0);
    const overLimit = val > limit;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4" role="dialog" aria-modal="true" aria-labelledby="modal-credits-title">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-800 w-full max-w-4xl rounded-2xl border border-gray-700 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
            >
                <div className="md:w-3/5 p-6 border-b md:border-b-0 md:border-r border-gray-700 flex flex-col bg-gray-900/50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-400" /> Extrato de Créditos
                        </h3>
                        <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300 border border-gray-700">Saldo Atual: <strong className="text-white">{student.creditBalance}</strong></span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 rounded-xl border border-gray-800 h-48 md:h-auto">
                        {isLoading ? (
                            <div className="p-10 flex justify-center"><LoadingSpinner size="sm" /></div>
                        ) : history.length === 0 ? (
                            <div className="p-10 text-center text-gray-500 text-sm">Sem histórico de movimentação.</div>
                        ) : (
                            <div className="w-full">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-800 text-gray-400 font-bold sticky top-0">
                                        <tr>
                                            <th className="p-3">Data</th>
                                            <th className="p-3">Tipo</th>
                                            <th className="p-3">Descrição</th>
                                            <th className="p-3 text-right">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {history.map(tx => (
                                            <tr key={tx.id} className="hover:bg-gray-800/30">
                                                <td className="p-3 text-gray-500">{new Date(tx.timestamp).toLocaleDateString()}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded uppercase text-[9px] font-bold ${tx.type === 'usage' ? 'bg-red-900/20 text-red-400' :
                                                        tx.type === 'purchase' ? 'bg-green-900/20 text-green-400' :
                                                            'bg-blue-900/20 text-blue-400'
                                                        }`}>
                                                        {tx.type === 'usage' ? 'Uso' : tx.type === 'purchase' ? 'Compra' : 'Bônus'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-gray-300 truncate max-w-[100px] md:max-w-[150px]" title={tx.description}>{tx.description}</td>
                                                <td className={`p-3 text-right font-mono font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:w-2/5 p-6 bg-gray-800 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-bold text-white text-lg" id="modal-credits-title">Gestão de Créditos</h3>
                            <p className="text-xs text-gray-400 mt-1">Limite Operacional: <strong className="text-white">{limit}</strong> créditos</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white" aria-label="Fechar Modal"><XIcon className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="flex p-1 bg-gray-900 rounded-lg">
                            <button
                                onClick={() => setActionType('add')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${actionType === 'add' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >ADICIONAR</button>
                            <button
                                onClick={() => setActionType('refund')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${actionType === 'refund' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >ESTORNAR</button>
                        </div>

                        {overLimit && (
                            <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg flex gap-3 animate-pulse">
                                <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-orange-200 leading-relaxed">
                                    <strong>Acima do Limite:</strong> Esta operação exigirá aprovação de um Administrador.
                                </p>
                            </div>
                        )}

                        <Input
                            label="Quantidade de Créditos"
                            type="number"
                            placeholder="Ex: 50"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Justificativa (Obrigatório)</label>
                            <textarea
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-brand-primary outline-none h-32 resize-none"
                                placeholder={`Descreva o motivo do ${actionType === 'add' ? 'bônus' : 'estorno'}...`}
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                        <Button
                            onClick={handleProcess}
                            isLoading={isSubmitting}
                            className={`flex-[2] text-black font-bold shadow-lg ${overLimit ? '!bg-orange-500 hover:!bg-orange-400' : 'bg-brand-primary hover:bg-brand-secondary'}`}
                        >
                            {overLimit ? 'ESCALAR P/ ADMIN' : 'PROCESSAR'}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export const FinanceStatementModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: Influencer | Student;
}> = ({ isOpen, onClose, user }) => {
    const [filter, setFilter] = useState<'1d' | '7d' | '30d'>('30d');
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);

    React.useEffect(() => {
        if (isOpen) {
            getWithdrawalQueue().then(queue => {
                setWithdrawals(queue.filter(q => q.producerId === user.uid));
            });
        }
    }, [isOpen, user.uid]);

    if (!isOpen) return null;

    // Normalize data based on user type
    const baseTotal = (user as any).totalEarnings || (user as any).purchaseValue * 10 || 0;
    const factor = filter === '1d' ? 0.05 : filter === '7d' ? 0.25 : 1;
    const revenue = baseTotal * factor;
    const pending = revenue * 0.3;
    const chargebacks = revenue * (filter === '1d' ? 0 : 0.05);

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[110] p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-800 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-green-400" /> Extrato Financeiro: {user.displayName}
                    </h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                <div className="bg-gray-900/50 p-2 flex justify-center gap-2 border-b border-gray-700">
                    {(['1d', '7d', '30d'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-brand-primary text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                            {f === '1d' ? 'Último Dia' : f === '7d' ? '7 Dias' : '30 Dias'}
                        </button>
                    ))}
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Receita ({filter})</p>
                            <h3 className="text-2xl font-black text-green-400">R$ {revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Pendente</p>
                            <h3 className="text-2xl font-black text-yellow-500">R$ {pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Estornos</p>
                            <h3 className="text-2xl font-black text-red-500">R$ {chargebacks.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        </div>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex gap-3">
                        <LockClosed className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-blue-100 text-sm">Acesso Somente Leitura</h4>
                            <p className="text-xs text-blue-200 mt-1">Como agente de suporte, você pode visualizar estes dados para auxiliar o parceiro, mas não pode realizar saques ou alterações.</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                        <h4 className="text-sm font-bold text-gray-300 mb-3">Histórico Recente (Mock)</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                            {/* Mock Sales */}
                            {[1, 2].map(i => (
                                <div key={`sale-${i}`} className="flex justify-between items-center text-xs p-2 hover:bg-gray-700/50 rounded transition-colors border-b border-gray-800">
                                    <span className="text-gray-400">1{i}/05/2026 - Venda de Produto</span>
                                    <span className="text-green-400 font-mono">+ R$ 150,00</span>
                                </div>
                            ))}
                            {/* Real Withdrawals */}
                            {withdrawals.map(w => (
                                <div key={w.id} className="flex justify-between items-center text-xs p-2 hover:bg-gray-700/50 rounded transition-colors border-b border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-300">{new Date(w.requestedAt).toLocaleDateString()} - Saque</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${w.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                            w.status === 'failed' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                                            }`}>{w.status}</span>
                                    </div>
                                    <span className="text-red-400 font-mono">- R$ {w.amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button onClick={onClose} className="w-full bg-gray-700 hover:bg-gray-600">Fechar</Button>
                </div>
            </motion.div>
        </div>
    );
};
