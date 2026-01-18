
import React, { useState, useEffect } from 'react';
import { EscalationTicket } from '../../../types/legacy';
import { getEscalationQueue, resolveEscalation } from '../../../services/mockFirebase';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { AlertCircle, CheckCircle, Clock, ArrowRight, User, AlertTriangle } from '../../../components/Icons';
import { motion, AnimatePresence } from 'framer-motion';

const EscalationsQueue: React.FC = () => {
    const [tickets, setTickets] = useState<EscalationTicket[]>([]);
    const [loading, setLoading] = useState(true);

    // New State for Modal & Analysis
    const [selectedTicket, setSelectedTicket] = useState<EscalationTicket | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<{ risk: string, score: number, reasoning: string } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await getEscalationQueue();
        setTickets(data);
        setLoading(false);
    };

    const handleOpenTicket = (ticket: EscalationTicket) => {
        setSelectedTicket(ticket);
        setAiAnalysis(null); // Reset analysis
    };

    const runNexusAnalysis = async () => {
        setAnalyzing(true);
        // Simulate AI Analysis
        await new Promise(r => setTimeout(r, 2000));

        // Mock logic based on type
        const isFinance = selectedTicket?.type === 'finance';
        setAiAnalysis({
            risk: isFinance && selectedTicket?.priority === 'critical' ? 'HIGH' : 'LOW',
            score: isFinance ? 85 : 12,
            reasoning: isFinance
                ? 'Valor atípico detectado. O aluno acessou o curso por apenas 2h antes de solicitar. Padrão suspeito de "consumo rápido".'
                : 'Padrão de comportamento normal. Histórico do usuário não apresenta outras disputas.'
        });
        setAnalyzing(false);
    };

    const handleAction = async (ticketId: string, action: string, label: string) => {
        const toast = require('react-hot-toast').default;

        // If critical finance action and no analysis, warn
        if (selectedTicket?.type === 'finance' && selectedTicket?.priority === 'critical' && !aiAnalysis && action === 'approve') {
            toast((t: any) => (
                <div className="flex flex-col gap-2">
                    <span className="font-bold">⚠️ Atenção! Risco de Fraude</span>
                    <span className="text-sm">Recomendamos rodar a análise Nexus IA antes de aprovar.</span>
                    <div className="flex gap-2 mt-1">
                        <button className="bg-gray-200 text-black px-2 py-1 rounded text-xs" onClick={() => toast.dismiss(t.id)}>Cancelar</button>
                        <button className="bg-red-500 text-white px-2 py-1 rounded text-xs" onClick={() => {
                            toast.dismiss(t.id);
                            performAction(ticketId, label);
                        }}>Aprovar Mesmo Assim</button>
                    </div>
                </div>
            ), { duration: 5000 });
            return;
        }

        performAction(ticketId, label);
    };

    const performAction = async (ticketId: string, label: string) => {
        await resolveEscalation(ticketId, label);
        setTickets(prev => prev.filter(t => t.id !== ticketId));
        setSelectedTicket(null);
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'finance': return <span className="text-xs font-bold text-green-400 bg-green-900/30 px-2 py-0.5 rounded border border-green-500/30">FINANCEIRO</span>;
            case 'support': return <span className="text-xs font-bold text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-500/30">SUPORTE</span>;
            case 'sales': return <span className="text-xs font-bold text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded border border-purple-500/30">VENDAS</span>;
            default: return <span className="text-xs font-bold text-gray-400 bg-gray-700/30 px-2 py-0.5 rounded border border-gray-500/30">SISTEMA</span>;
        }
    };

    return (
        <>
            <Card className="p-0 border border-gray-700 bg-gray-800 overflow-hidden flex flex-col h-full rounded-2xl shadow-xl">
                <div className="p-5 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" /> Central de Escalonamento
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">Tarefas que requerem sua atenção imediata.</p>
                    </div>
                    <div className="bg-red-500 rounded-full px-2 py-0.5 text-xs font-bold text-white shadow-lg shadow-red-500/20">
                        {tickets.length} Pendentes
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500 animate-pulse">Carregando fila...</div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center">
                            <CheckCircle className="w-12 h-12 text-green-500 mb-3 opacity-50" />
                            <p className="text-gray-400">Tudo limpo! Nenhuma pendência.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {tickets.map(ticket => (
                                <motion.div
                                    key={ticket.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => handleOpenTicket(ticket)}
                                    className={`rounded-xl border p-4 relative overflow-hidden group hover:bg-gray-750 transition-colors cursor-pointer ${getPriorityColor(ticket.priority).split(' ')[2].replace('border-', 'border-')}`}
                                >
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(ticket.priority).split(' ')[1].replace('bg-', 'bg-').replace('/10', '')}`}></div>

                                    <div className="flex justify-between items-start mb-2 pl-3">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(ticket.type)}
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                        </div>
                                        <span className="text-gray-500 text-[10px] flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> há {Math.floor((Date.now() - new Date(ticket.requestedAt).getTime()) / 60000)} min
                                        </span>
                                    </div>

                                    <h4 className="text-white font-bold text-sm mb-1 pl-3">{ticket.title}</h4>
                                    <p className="text-gray-400 text-xs mb-3 pl-3 leading-relaxed line-clamp-2">{ticket.description}</p>

                                    <div className="flex justify-between items-center pl-3 pt-2 border-t border-gray-700/50 mt-2">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <User className="w-3 h-3" />
                                            <span>{ticket.requestedBy}</span>
                                        </div>
                                        <div className="text-[10px] text-brand-primary font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                            Ver Detalhes <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </Card>

            <AnimatePresence>
                {selectedTicket && (
                    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-gray-800 flex justify-between items-start bg-[#0a0a0a]">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        {getTypeIcon(selectedTicket.type)}
                                        <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded border ${getPriorityColor(selectedTicket.priority)}`}>
                                            {selectedTicket.priority} Prioridade
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-white max-w-lg">{selectedTicket.title}</h2>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                        Solicitado por <span className="text-white font-bold">{selectedTicket.requestedBy}</span> • {new Date(selectedTicket.requestedAt).toLocaleString()}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                                    <AlertCircle className="w-6 h-6 rotate-45 transform origin-center" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                                {/* Description Block */}
                                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                    <h4 className="text-gray-400 text-xs font-bold uppercase mb-2">Descrição da Solicitação</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
                                </div>

                                {/* Nexus AI Analysis Block */}
                                <div className={`p-5 rounded-xl border transition-all ${aiAnalysis ? (aiAnalysis.risk === 'HIGH' ? 'bg-red-900/10 border-red-500/30' : 'bg-green-900/10 border-green-500/30') : 'bg-indigo-900/10 border-indigo-500/30'}`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-indigo-400 font-bold flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5" /> Auditoria Nexus AI
                                        </h4>
                                        {!aiAnalysis && (
                                            <Button
                                                onClick={runNexusAnalysis}
                                                disabled={analyzing}
                                                className={`!py-1.5 !px-3 !text-xs ${analyzing ? 'opacity-50 cursor-wait' : ''}`}
                                            >
                                                {analyzing ? 'Analisando...' : 'Rodar Análise de Risco'}
                                            </Button>
                                        )}
                                    </div>

                                    {analyzing && (
                                        <div className="flex flex-col items-center justify-center py-6 space-y-3">
                                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-indigo-300 text-xs animate-pulse">Consultando logs, padrões de comportamento e histórico...</p>
                                        </div>
                                    )}

                                    {aiAnalysis && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className={`px-3 py-1 rounded-lg border text-sm font-bold ${aiAnalysis.risk === 'HIGH' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-green-500/20 border-green-500 text-green-400'}`}>
                                                    RISCO: {aiAnalysis.risk}
                                                </div>
                                                <div className="text-gray-400 text-xs">
                                                    Score de Fraude: <span className="text-white font-bold">{aiAnalysis.score}/100</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-300 text-sm bg-black/20 p-3 rounded-lg border border-white/5">
                                                <span className="text-indigo-400 font-bold block mb-1 text-[10px] uppercase">Parecer da IA:</span>
                                                {aiAnalysis.reasoning}
                                            </p>
                                        </motion.div>
                                    )}

                                    {!aiAnalysis && !analyzing && (
                                        <p className="text-gray-500 text-xs italic">
                                            Execute a análise antes de tomar uma decisão crítica para verificar fraudes ou inconsistências.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-800 bg-[#0a0a0a] flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => setSelectedTicket(null)}>
                                    Cancelar
                                </Button>
                                {selectedTicket.actions?.map((action, idx) => (
                                    <Button
                                        key={idx}
                                        onClick={() => handleAction(selectedTicket.id, action.action, action.label)}
                                        className={idx === 0 ? (aiAnalysis?.risk === 'HIGH' && action.action === 'approve' ? '!bg-red-600 hover:!bg-red-500' : '!bg-brand-primary text-black hover:!bg-brand-secondary') : ''}
                                    >
                                        {action.label}
                                    </Button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default EscalationsQueue;
