
import React, { useState, useEffect } from 'react';
import { SupportTicket, SupportAgent } from '../../../types';
import { TicketsView } from '../../support/views/TicketsView';
import { getSupportTickets, resolveTicket, sendTicketMessage, markTicketAsRead, createEscalationRequest, mockStudents } from '../../../services/mockFirebase';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import StudentProfileView from '../../../components/StudentProfileView';
import { Student } from '../../../types';
import { X as XIcon } from '../../../components/Icons';

export const FinanceSupportView: React.FC = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [studentProfileModal, setStudentProfileModal] = useState<Student | null>(null);

    // Cast user to SupportAgent as they share similar structure for this view
    const agent = user as unknown as SupportAgent;

    const loadData = async () => {
        // In a real app, we might filter by department='finance' or isEscalated=true
        // For now, we load all and the Finance Agent can triage or we filter client-side if needed.
        // User said: "ATENDER OS TICKETS ESCALADO PELO AGENTE DE SUPORTE"
        const allTickets = await getSupportTickets();

        // Filter for Finance Context:
        // Show tickets specifically escalated to finance
        const financeTickets = allTickets.filter(t => t.status === 'pending_finance');

        setTickets(financeTickets);

        if (selectedTicket) {
            const updated = financeTickets.find(x => x.id === selectedTicket.id);
            if (updated) setSelectedTicket(updated);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 15000); // Polling
        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = async (e: React.FormEvent, isInternal?: boolean) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        try {
            await sendTicketMessage(selectedTicket.id, newMessage, agent as any, undefined, 'text', isInternal);
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

    const handleEscalate = async (ticketId: string, reason?: string) => {
        // Finance Agents might escalate to Admin?
        // For reuse of TicketsView, we implement it.
        if (reason) {
            await createEscalationRequest({ ticketId, reason, agentId: agent.uid, agentName: agent.displayName });
            toast.success("Chamado escalado para Admin.");
            loadData();
        }
    };

    const handleViewStudent = (studentId: string) => {
        const student = mockStudents.find(s => s.uid === studentId);
        if (student) {
            setStudentProfileModal(student);
        } else {
            toast.error("Perfil do aluno não encontrado.");
        }
    };

    const handleMarkAsRead = async (id: string) => {
        await markTicketAsRead(id);
        loadData();
    };


    return (
        <div className="h-[calc(100vh-100px)]"> {/* Adjust height to fit layout */}
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
                agent={agent}
                markAsRead={handleMarkAsRead}
            />

            {studentProfileModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80] p-4">
                    <div className="w-full max-w-4xl relative max-h-[90vh] overflow-y-auto rounded-xl bg-gray-900 border border-gray-700">
                        <StudentProfileView
                            student={studentProfileModal}
                            viewer="support" // Finance agents act as support level 2
                            permissions={{ viewSensitiveData: true }} // Finance needs to see sensitive data
                            onClose={() => setStudentProfileModal(null)}
                        />
                        <button onClick={() => setStudentProfileModal(null)} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
