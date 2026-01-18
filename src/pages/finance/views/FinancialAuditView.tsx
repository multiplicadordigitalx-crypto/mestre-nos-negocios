
import React, { useState, useEffect } from 'react';
import {
    ShieldCheck, AlertCircle, CheckCircle, Search, Filter,
    Calendar, User, DollarSign, MessageSquare, History, Eye, Plus
} from '@/components/Icons';
import Button from '@/components/Button';
import { FinancialAuditTicket } from '@/types';
import { getAuditTickets, addAdminNoteToAudit, resolveAuditTicket } from '@/services/mockFirebase';
import { toast } from 'react-hot-toast';

const FinancialAuditView: React.FC<{ user: any }> = ({ user }) => {
    const [tickets, setTickets] = useState<FinancialAuditTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved' | 'closed'>('all');
    const [selectedTicket, setSelectedTicket] = useState<FinancialAuditTicket | null>(null);
    const [newNote, setNewNote] = useState('');

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAuditTickets();
            setTickets(data);
        } catch (error) {
            toast.error("Erro ao carregar tickets de auditoria");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddNote = async (id: string) => {
        if (!newNote.trim()) return;
        try {
            await addAdminNoteToAudit(id, `${user.displayName}: ${newNote}`);
            toast.success("Nota adicionada!");
            setNewNote('');
            loadData();
            // Update selected ticket view
            const updated = tickets.find(t => t.id === id);
            if (updated) setSelectedTicket({ ...updated, adminNotes: [...updated.adminNotes, `${user.displayName}: ${newNote}`] });
        } catch (error) {
            toast.error("Erro ao salvar nota");
        }
    };

    const handleResolve = async (id: string) => {
        const clarification = prompt("Insira a justificativa para resolução:");
        if (!clarification) return;
        try {
            await resolveAuditTicket(id, clarification);
            toast.success("Ticket resolvido!");
            loadData();
            setSelectedTicket(null);
        } catch (error) {
            toast.error("Erro ao resolver ticket");
        }
    };

    const filteredTickets = filterStatus === 'all'
        ? tickets
        : tickets.filter(t => t.status === filterStatus);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List Section */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Auditoria de Pagamentos
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{filteredTickets.length}</span>
                    </h2>
                    <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5">
                        <Filter className="w-4 h-4 text-gray-500 mr-2" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="bg-transparent text-sm text-gray-300 outline-none"
                        >
                            <option value="all">Todos Status</option>
                            <option value="open">Abertos</option>
                            <option value="resolved">Resolvidos</option>
                            <option value="closed">Fechados</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredTickets.map(t => (
                        <div
                            key={t.id}
                            onClick={() => setSelectedTicket(t)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedTicket?.id === t.id
                                ? 'bg-gray-700 border-brand-primary shadow-lg'
                                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${t.status === 'open' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                                        }`}>
                                        {t.status === 'open' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">Ticket ID: {t.id}</p>
                                        <p className="text-xs text-gray-400 capitalize">{t.paymentType === 'commission' ? 'Comissão' : 'Contas a Pagar'}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] py-0.5 px-2 rounded-full font-black uppercase tracking-widest ${t.status === 'open' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                    t.status === 'resolved' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                        'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                    }`}>
                                    {t.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-300 line-clamp-2 mb-3">{t.issueDescription}</p>
                            <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {t.agentName}</span>
                                <span>{new Date(t.createdAt).toLocaleString('pt-BR')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Details Section */}
            <div className="lg:col-span-1">
                {selectedTicket ? (
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden sticky top-6">
                        <div className="p-4 bg-gray-900/50 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-white font-bold">Detalhes da Auditoria</h3>
                            <button onClick={() => setSelectedTicket(null)} className="text-gray-500 hover:text-white"><Eye className="w-4 h-4" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-700/50">
                                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-bold">Responsável</p>
                                    <p className="text-xs text-white font-medium">{selectedTicket.agentName}</p>
                                </div>
                                <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-700/50">
                                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-bold">Vencimento/Data</p>
                                    <p className="text-xs text-white font-medium">{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest font-bold">Descrição da Irregularidade</p>
                                <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg">
                                    <p className="text-sm text-red-200 leading-relaxed italic">"{selectedTicket.issueDescription}"</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold flex items-center gap-2">
                                    <History className="w-3 h-3" /> Linha do Tempo / Notas
                                </p>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                    {selectedTicket.adminNotes.length === 0 ? (
                                        <p className="text-xs text-gray-500 italic">Sem notas internas.</p>
                                    ) : (
                                        selectedTicket.adminNotes.map((note, i) => (
                                            <div key={i} className="bg-gray-900 p-2 rounded text-xs text-gray-300 border-l-2 border-brand-primary">
                                                {note}
                                            </div>
                                        ))
                                    )}
                                    {selectedTicket.agentClarification && (
                                        <div className="bg-blue-900/20 p-2 rounded text-xs text-blue-300 border-l-2 border-blue-400">
                                            <strong>Justificativa do Agente:</strong> {selectedTicket.agentClarification}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isAdmin && (
                                <div className="pt-4 border-t border-gray-700 space-y-4">
                                    <div className="flex gap-2">
                                        <input
                                            placeholder="Adicionar nota interna..."
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-primary transition-all"
                                        />
                                        <Button onClick={() => handleAddNote(selectedTicket.id)} className="!py-2 !px-3"><Plus className="w-4 h-4" /></Button>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        disabled={selectedTicket.status === 'resolved'}
                                        onClick={() => handleResolve(selectedTicket.id)}
                                        className="w-full !bg-blue-600/10 !text-blue-400 border border-blue-600/30 hover:!bg-blue-600 hover:!text-white"
                                    >
                                        Marcar como Resolvido
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-gray-800/50 rounded-2xl border border-dashed border-gray-700 p-12 text-center">
                        <ShieldCheck className="w-12 h-12 text-gray-600 mb-4" />
                        <h4 className="text-gray-400 font-bold mb-2">Central de Auditoria</h4>
                        <p className="text-gray-500 text-sm">Selecione um ticket à esquerda para ver os detalhes e intervir se necessário.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialAuditView;
