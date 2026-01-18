import React, { useState, useEffect } from 'react';
import { TicketsView } from '../../support/views/TicketsView';
import { FinancialIntelligenceSidebar } from '../components/FinancialIntelligenceSidebar';
import { SupportTicket, Student, Influencer } from '../../../types';
import {
    getSupportTickets, mockStudents, mockInfluencers, getPendingPartnerRequests,
    sendTicketMessage, markTicketAsRead, resolveTicket, createEscalationRequest
} from '../../../services/mockFirebase';
import { analyzeAgentMessage, SecurityAnalysis } from '../../../services/FinancialSecurityService';
import { createAuditLog, flagAgentProfile } from '../../../services/mockFirebase';
import { toast } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { getNexusSupportAdvice } from '../../../services/mestreIaService';
import { CreditManagementModal } from '../../support/components/SupportModals';
import { DetailedFinanceStatementModal } from '../components/DetailedFinanceStatementModal';
import { MeusResultados } from '../../painel/sections/MeusResultados';
import { Activity, X as XIcon } from '../../../components/Icons';

interface FinancialSupportViewProps {
    user: any;
}

export const FinancialSupportView: React.FC<FinancialSupportViewProps> = ({ user }) => {
    // Determine agent info (The logged in user is the agent)
    const agent = {
        uid: user.uid,
        displayName: user.displayName || 'Agente Financeiro',
        email: user.email,
        role: user.role,
        permissions: { ...user.permissions, viewFinance: true } // Ensure finance view
    };

    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [partnerRequests, setPartnerRequests] = useState<Influencer[]>([]);

    // New State for Results Modal
    const [showStudentResults, setShowStudentResults] = useState(false);

    // Sidebar State
    const [isAnalyzingWithNexus, setIsAnalyzingWithNexus] = useState(false);
    const [nexusAdvice, setNexusAdvice] = useState<any>(null);

    // Modal State
    const [dashboardCreditStudent, setDashboardCreditStudent] = useState<Student | null>(null);
    const [financeModalUser, setFinanceModalUser] = useState<Influencer | Student | null>(null);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        const [t, p] = await Promise.all([
            getSupportTickets(),
            getPendingPartnerRequests()
        ]);
        // Show only tickets escalated to admin
        const adminTickets = t.filter(ticket => ticket.status === 'pending_admin');
        setTickets(adminTickets);
        setPartnerRequests(p);

        if (selectedTicket) {
            const updated = t.find(x => x.id === selectedTicket.id);
            if (updated) setSelectedTicket(updated);
        }
    };

    const handleSendMessage = async (e: React.FormEvent, isInternal?: boolean) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        // 1. Security Analysis (Only for non-internal messages?)
        // Let's keep it for all to be safe.
        const analysis: SecurityAnalysis = analyzeAgentMessage(newMessage);

        if (analysis.riskLevel === 'high') {
            toast.error(analysis.warning || 'Mensagem bloqueada por segurança.');
            await createAuditLog(agent.uid, 'MESSAGE_BLOCKED', 'high', `Blocked message content: ${newMessage} - Reason: ${analysis.details}`);
            await flagAgentProfile(agent.uid, analysis.details || 'High Risk Content');
            return;
        }

        if (analysis.riskLevel === 'medium') {
            toast(analysis.warning || 'Atenção com dados sensíveis.', { icon: '⚠️' });
            await createAuditLog(agent.uid, 'MESSAGE_WARNING', 'medium', `Warning triggered: ${analysis.details}`);
        }

        // 2. Send Message
        const targetTicketId = selectedTicket.id;
        const msg = newMessage;
        setNewMessage('');

        await sendTicketMessage(targetTicketId, msg, agent as any, undefined, 'text', isInternal);
        await createAuditLog(agent.uid, 'MESSAGE_SENT', 'low', `Ticket: ${targetTicketId} (Internal: ${!!isInternal})`);
        loadData();
    };

    const handleCallNexusSupport = async () => {
        if (!selectedTicket) return;
        setIsAnalyzingWithNexus(true);
        setNexusAdvice(null);

        try {
            const requester = mockStudents.find(s => s.uid === selectedTicket.studentId) ||
                partnerRequests.find(i => i.uid === selectedTicket.studentId) ||
                mockInfluencers.find(i => i.uid === selectedTicket.studentId);

            // Custom prompt context could be added in getMestreIAAdvice
            const advice = await getNexusSupportAdvice({
                ticketContent: selectedTicket.messages.map(m => m.text).join('\n'),
                userData: requester,
                userResults: (requester as any)?.gamification,
                userRole: requester?.role || 'user'
            });

            setNexusAdvice(advice);
            toast.success("Análise Nexus Compliance gerada!");
        } catch (e) {
            console.error(e);
            toast.error("Erro ao consultar Nexus.");
        } finally {
            setIsAnalyzingWithNexus(false);
        }
    };

    const getGuaranteeStatus = (student: Student) => {
        if (!student.purchaseDate) return { label: 'N/A', color: 'text-gray-500' };
        const buyDate = new Date(student.purchaseDate);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) return { label: 'Garantia Incondicional', color: 'text-green-400', day: diffDays };
        return { label: 'Prazo Expirado', color: 'text-gray-500', day: diffDays };
    };

    return (
        <div className="flex-1 w-full h-full flex flex-col md:flex-row min-h-0 overflow-hidden">
            <div className="flex-1 min-w-0 h-full">
                <TicketsView
                    tickets={tickets}
                    selectedTicket={selectedTicket}
                    setSelectedTicket={setSelectedTicket}
                    onSendMessage={handleSendMessage}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    handleResolve={async (id) => { await resolveTicket(id); loadData(); }}
                    handleEscalate={async (id) => { await createEscalationRequest({ ticketId: id, reason: 'Escalado pelo Financeiro', agentId: agent.uid, agentName: agent.displayName }); toast.success("Escalado!"); }}
                    handleViewStudent={() => { }} // Not implemented in this view for now
                    agent={agent as any}
                    markAsRead={markTicketAsRead}
                />
            </div>

            <AnimatePresence>
                {selectedTicket && (
                    <div className="w-full md:w-auto shrink-0 transition-all duration-300">
                        <FinancialIntelligenceSidebar
                            selectedTicket={selectedTicket}
                            onClose={() => setSelectedTicket(null)}
                            onCallNexus={handleCallNexusSupport}
                            onShowResults={() => setShowStudentResults(true)}
                            onShowFinance={setFinanceModalUser}
                            onAddCredit={setDashboardCreditStudent}
                            isAnalyzing={isAnalyzingWithNexus}
                            nexusAdvice={nexusAdvice}
                            students={mockStudents}
                            partnerRequests={partnerRequests}
                            mockInfluencers={mockInfluencers}
                            getGuaranteeStatus={getGuaranteeStatus}
                        />
                    </div>
                )}
            </AnimatePresence>

            {/* Results Modal */}
            {showStudentResults && selectedTicket && (
                <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[210] p-4 overflow-y-auto">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-gray-900 w-full max-w-6xl rounded-[2rem] border border-brand-primary/30 shadow-2xl relative flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/80">
                            <h3 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-6 h-6 text-brand-primary" /> Auditoria de Resultados: {selectedTicket.studentName}
                            </h3>
                            <button onClick={() => setShowStudentResults(false)} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-1">
                            <MeusResultados onBack={() => setShowStudentResults(false)} studentOverride={mockStudents.find(s => s.uid === selectedTicket.studentId)} />
                        </div>
                    </motion.div>
                </div>
            )}

            {financeModalUser && (
                <DetailedFinanceStatementModal
                    isOpen={!!financeModalUser}
                    onClose={() => setFinanceModalUser(null)}
                    user={financeModalUser}
                />
            )}

            {dashboardCreditStudent && (
                <CreditManagementModal
                    isOpen={!!dashboardCreditStudent}
                    onClose={() => setDashboardCreditStudent(null)}
                    student={dashboardCreditStudent}
                    agent={agent as any}
                />
            )}
        </div>
    );
};
