import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { TicketsView } from '../support/views/TicketsView';
import { getSupportTickets, resolveTicket, sendTicketMessage, markTicketAsRead, mockStudents, mockInfluencers, getPendingPartnerRequests, saveJSON } from '../../services/mockFirebase';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { StudentIntelligenceSidebar } from '../support/components/StudentIntelligenceSidebar';
import { CreditManagementModal, FinanceStatementModal } from '../support/components/SupportModals';
import { Influencer, Student, SupportTicket, SupportAgent } from '../../types';
import { getNexusSupportAdvice } from '../../services/mestreIaService';
import { MeusResultados } from '../painel/sections/MeusResultados';
import { Activity, X as XIcon } from '../../components/Icons';

export const ProducerSupportPage: React.FC = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [newMessage, setNewMessage] = useState('');

    // Student Intelligence State
    const [showStudentResults, setShowStudentResults] = useState(false);
    const [financeModalUser, setFinanceModalUser] = useState<Influencer | Student | null>(null);
    const [dashboardCreditStudent, setDashboardCreditStudent] = useState<Student | null>(null);
    const [nexusAdvice, setNexusAdvice] = useState<any>(null);
    const [isAnalyzingWithNexus, setIsAnalyzingWithNexus] = useState(false);
    const [partnerRequests, setPartnerRequests] = useState<Influencer[]>([]);

    useEffect(() => {
        loadData();

        const interval = setInterval(loadData, 5000);

        // Initial load of partner requests for the sidebar
        getPendingPartnerRequests().then(setPartnerRequests);

        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        const t = await getSupportTickets();
        // In a real app, we would filter by producerId or schoolId here
        setTickets(t);

        if (selectedTicket) {
            const updated = t.find(x => x.id === selectedTicket.id);
            if (updated) setSelectedTicket(updated);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket || !user) return;

        try {
            await sendTicketMessage(selectedTicket.id, newMessage, user as any);
            setNewMessage('');
            loadData();
        } catch (error) {
            toast.error("Erro ao enviar mensagem");
        }
    };

    const handleResolve = async (ticketId: string) => {
        await resolveTicket(ticketId);
        toast.success("Ticket resolvido.");
        loadData();
    };

    const handleEscalate = async (id: string, reason?: string) => {
        const t = tickets.find(x => x.id === id);
        if (!t) return;

        const updated = tickets.map(x => {
            if (x.id === id) {
                // Determine previous messages
                const newMessages = [...x.messages];

                // If a reason is provided, add it as a system/internal note
                // or as a message from the escalating agent.
                if (reason && producerAgent) {
                    newMessages.push({
                        id: `msg-${Date.now()}`,
                        channelId: x.id,
                        text: `⚠️ ESCALONADO PARA O PRODUTOR\nMotivo: ${reason}`,
                        createdAt: Date.now(),
                        user: {
                            uid: producerAgent.uid,
                            name: producerAgent.displayName || 'Suporte',
                            avatar: producerAgent.photoURL || '',
                            role: 'support_agent'
                        }
                    });
                } else if (producerAgent) {
                    newMessages.push({
                        id: `msg-${Date.now()}`,
                        channelId: x.id,
                        text: `⚠️ Ticket escalado para o produtor.`,
                        createdAt: Date.now(),
                        user: {
                            uid: producerAgent.uid,
                            name: producerAgent.displayName || 'Suporte',
                            avatar: producerAgent.photoURL || '',
                            role: 'support_agent'
                        }
                    });
                }

                return {
                    ...x,
                    isEscalated: true, // Mark as escalated
                    status: 'open', // Re-open if needed
                    priority: 'high', // Bump priority
                    messages: newMessages,
                    lastMessageAt: Date.now()
                };
            }
            return x;
        });

        saveJSON('mockSupportTickets', updated);
        loadData();
        toast.success("Ticket escalado com sucesso!", { icon: '🚀' });
    };

    const handleViewStudent = (studentId: string) => {
        // Find student and show results or profile
        const student = mockStudents.find(s => s.uid === studentId);
        if (student) setShowStudentResults(true);
        else toast.error("Aluno não localizado para auditoria.");
    };

    const handleCallNexusSupport = async () => {
        if (!selectedTicket) return;
        setIsAnalyzingWithNexus(true);
        setNexusAdvice(null);

        try {
            const requester = mockStudents.find(s => s.uid === selectedTicket.studentId) ||
                partnerRequests.find(i => i.uid === selectedTicket.studentId) ||
                mockInfluencers.find(i => i.uid === selectedTicket.studentId);

            const advice = await getNexusSupportAdvice({
                ticketContent: selectedTicket.messages.map(m => m.text).join('\n'),
                userData: requester,
                userResults: (requester as Student)?.gamification,
                userRole: requester?.role || 'aluno'
            });

            setNexusAdvice(advice);
            toast.success("Nexus IA gerou orientações!");
        } catch (e) {
            console.error("Nexus Advice Error", e);
            toast.error("Nexus IA indisponível.");
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

    if (!user) return null;

    // Adapt Producer User to SupportAgent interface for compatibility with TicketsView
    const producerAgent: SupportAgent = {
        ...user,
        role: 'support_agent',
        status: 'online',
        ticketsResolved: 0,
        npsScore: 50,
        activeTickets: tickets.length,
        permissions: {
            approveLinks: false,
            chatSupport: true,
            viewFinance: true,
            sendNotifications: true,
            blockStudents: true,
            manageTeam: true,
            viewSensitiveData: true,
            recoverAccess: true
        }
    } as unknown as SupportAgent;

    return (
        <div className="h-full flex flex-col bg-gray-900 animate-fade-in">
            <div className="p-6 pb-2">
                <h1 className="text-2xl font-bold text-white">Suporte Unificado</h1>
                <p className="text-gray-400 text-sm">Gerencie os chamados dos seus alunos em um só lugar.</p>
            </div>

            <div className="flex-1 overflow-hidden relative flex flex-col md:flex-row">
                <div className="flex-1 min-w-0 h-full">
                    <TicketsView
                        tickets={tickets}
                        selectedTicket={selectedTicket}
                        setSelectedTicket={setSelectedTicket}
                        onSendMessage={handleSendMessage}
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        handleResolve={handleResolve}
                        handleEscalate={handleEscalate}
                        handleViewStudent={handleViewStudent}
                        agent={producerAgent}
                        markAsRead={markTicketAsRead}
                    />
                </div>

                <AnimatePresence>
                    {selectedTicket && (
                        <div className="w-full md:w-auto shrink-0 transition-all duration-300">
                            <StudentIntelligenceSidebar
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
            </div>

            <AnimatePresence>
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
                    <FinanceStatementModal
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
                        agent={producerAgent}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
