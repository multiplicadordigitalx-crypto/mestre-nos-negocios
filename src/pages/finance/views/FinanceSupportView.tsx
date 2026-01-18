
import React, { useState, useEffect } from 'react';
import { SupportTicket, SupportAgent } from '../../../types';
import { TicketsView } from '../../support/views/TicketsView';
import { getSupportTickets, resolveTicket, sendTicketMessage, markTicketAsRead, createEscalationRequest } from '../../../services/mockFirebase';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';

export const FinanceSupportView: React.FC = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [newMessage, setNewMessage] = useState('');

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
        // Implementation for viewing student profile if needed, 
        // or just log for now if we don't have the modal here.
        // The TicketsView expects this prop.
        console.log("View student:", studentId);
        toast("Perfil do aluno em desenvolvimento para esta view.");
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
        </div>
    );
};
