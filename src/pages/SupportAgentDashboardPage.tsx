import React, { useState, useEffect, useRef } from 'react';
import { SupportAgent, SupportTicket, Student, LinkRequest, RefundRequest, Influencer, FinanceRequest, WalletTransaction } from '../types';
import {
    getSupportTickets, resolveTicket, mockStudents,
    getRefundRequests,
    updateRefundRequest, createEscalationRequest,
    markTicketAsRead, updateSupportAgent,
    getPendingPartnerRequests, updatePartnerRequestStatus,
    searchStudents, getStudentsPaginated, consumeCredits,
    maskUserData, createFinanceRequest, getStudentWalletHistory,
    mockInfluencers, sendTicketMessage
} from '../services/mockFirebase';
import { updateStudent } from '../services/userService';
} from '../services/mockFirebase';
import Button from '../components/Button';
import Card from '../components/Card';
import {
    MessageSquare, CheckCircle, Star, User, LogOut, Search,
    DollarSign, Link as LinkIcon, Users, ShieldCheck, TrendingUp, X as XIcon, Activity, Brain, Clock, Zap, RefreshCw, Key, PlusCircle, LockClosed, FileText, Calendar, Menu, Wallet, PieChart,
    ChevronLeft, ChevronRight
} from '../components/Icons';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import StudentProfileView from '../components/StudentProfileView';
import { MeusResultados } from './painel/sections/MeusResultados';
import { useAuth } from '../hooks/useAuth';
import CampaignBanner from '../components/CampaignBanner';
import { getNexusSupportAdvice } from '../services/mestreIaService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import Input from '../components/Input';

// Modular Views & Components
import { TicketsView } from './support/views/TicketsView';
import { TeamChatView } from './support/views/TeamChatView';
import { PartnerApprovalView } from './support/views/PartnerApprovalView';
import { RefundsTriageView } from './support/views/RefundsTriageView';
import { SupportProfileView } from './support/views/SupportProfileView';
import { ProductivityView } from './support/views/ProductivityView';
import { SupportCommunityView } from './support/views/SupportCommunityView';
import { EscalationModal, RefundTriageModal, CreditManagementModal, FinanceStatementModal } from './support/components/SupportModals';
import { StudentIntelligenceSidebar } from './support/components/StudentIntelligenceSidebar';

interface SupportAgentDashboardProps {
    agent: SupportAgent;
    onLogout: () => void;
}


// --- VIEW GESTÃO DE ALUNOS ---
const StudentsListView: React.FC<{ onOpenStudent: (s: Student) => void, agent: SupportAgent }> = ({ onOpenStudent, agent }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [creditModalStudent, setCreditModalStudent] = useState<Student | null>(null);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setLoading(true);
        const results = await searchStudents(searchTerm);
        const maskedResults = results.map(s => maskUserData(s) as Student);
        setStudents(maskedResults);
        setLoading(false);
    };

    const handleQuickAction = async (student: Student, action: string) => {
        if (action === 'manage_credits') {
            setCreditModalStudent(student);
        } else if (action === 'reset_password') {
            if (confirm("Deseja enviar email de redefinição de senha para o aluno?")) {
                toast.success("Email de redefinição enviado!");
            }
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 overflow-y-auto h-full custom-scrollbar">
            <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-400" /> Central do Aluno
                </h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por Nome, E-mail ou CPF..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <Button onClick={handleSearch} isLoading={loading} className="!bg-blue-600 hover:!bg-blue-500 w-full sm:w-auto">BUSCAR</Button>
            </div>

            <div className="space-y-4">
                {students.map(s => (
                    <Card key={s.uid} className="p-5 bg-gray-800 border-gray-700 hover:border-blue-500/50 transition-all group">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                                <div className="relative shrink-0">
                                    <img src={s.photoURL || `https://i.pravatar.cc/150?u=${s.email}`} className="w-14 h-14 rounded-full border-2 border-gray-600 object-cover" alt={s.displayName || 'Aluno'} />
                                    <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1 border border-gray-600" title="Dados Mascarados">
                                        <LockClosed className="w-3 h-3 text-gray-400" />
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-white text-lg truncate">{s.displayName}</p>
                                    <p className="text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 font-mono truncate">
                                        <span>{s.email}</span>
                                        <span className="hidden sm:inline text-gray-600">|</span>
                                        <span>CPF: {s.cpf}</span>
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded font-bold border border-blue-500/20">{s.gamification?.level || 'Iniciante'}</span>
                                        <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded font-bold border border-green-500/20">Saldo: {s.creditBalance || 0} cr</span>
                                        {s.financial?.status === 'refunded' && <span className="text-[10px] bg-red-900/30 text-red-400 px-2 py-0.5 rounded font-bold border border-red-500/20">REEMBOLSADO</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 overflow-x-auto">
                                <Button variant="secondary" onClick={() => onOpenStudent(s)} className="!py-2 !px-3 !text-xs text-gray-300 bg-gray-700 hover:bg-gray-600 border-gray-600 whitespace-nowrap">
                                    <User className="w-4 h-4 mr-2" /> Ver Perfil
                                </Button>
                                <Button onClick={() => handleQuickAction(s, 'manage_credits')} className="!py-2 !px-3 !text-xs !bg-green-600/10 text-green-400 border border-green-500/30 hover:!bg-green-600/20 whitespace-nowrap">
                                    <DollarSign className="w-4 h-4 mr-2" /> Créditos
                                </Button>
                                <button onClick={() => handleQuickAction(s, 'reset_password')} className="p-2 bg-gray-700 hover:bg-yellow-900/40 rounded-lg text-yellow-400 border border-gray-600 shrink-0" title="Resetar Senha" aria-label="Resetar Senha">
                                    <Key className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
                {students.length === 0 && !loading && searchTerm && (
                    <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-2xl">
                        <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500">Nenhum aluno encontrado para "{searchTerm}"</p>
                    </div>
                )}
            </div>

            {/* Modal de Créditos */}
            {creditModalStudent && (
                <CreditManagementModal
                    isOpen={!!creditModalStudent}
                    onClose={() => setCreditModalStudent(null)}
                    student={creditModalStudent}
                    agent={agent}
                />
            )}
        </div>
    );
};

const SupportAgentDashboardPage: React.FC<SupportAgentDashboardProps> = ({ agent, onLogout }) => {
    const { refreshUser } = useAuth();
    const [view, setView] = useState<'tickets' | 'chat' | 'partners' | 'refunds' | 'productivity' | 'profile' | 'students' | 'community'>('tickets');
    // UI State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [partnerRequests, setPartnerRequests] = useState<Influencer[]>([]);
    const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [newMessage, setNewMessage] = useState('');

    const [refundModalRequest, setRefundModalRequest] = useState<RefundRequest | null>(null);
    const [isEscalationOpen, setIsEscalationOpen] = useState(false);
    const [escalationTicketId, setEscalationTicketId] = useState<string | null>(null);
    const [studentProfileModal, setStudentProfileModal] = useState<Student | null>(null);
    const [showStudentResults, setShowStudentResults] = useState(false);
    const [financeModalUser, setFinanceModalUser] = useState<Influencer | Student | null>(null);
    const [dashboardCreditStudent, setDashboardCreditStudent] = useState<Student | null>(null);

    const [nexusAdvice, setNexusAdvice] = useState<any>(null);
    const [isAnalyzingWithNexus, setIsAnalyzingWithNexus] = useState(false);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 15000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        const [t, p, r] = await Promise.all([
            getSupportTickets(), getPendingPartnerRequests(), getRefundRequests()
        ]);
        setTickets(t);
        setPartnerRequests(p);
        setRefundRequests(r);
        if (selectedTicket) {
            const updated = t.find(x => x.id === selectedTicket.id);
            if (updated) setSelectedTicket(updated);
        }
    };

    const handleSendMessage = async (e: React.FormEvent, isInternal?: boolean) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        await sendTicketMessage(selectedTicket.id, newMessage, agent, undefined, 'text', isInternal);
        setNewMessage('');
        loadData();
    };

    const handleCallNexusSupport = async () => {
        if (!selectedTicket) return;
        setIsAnalyzingWithNexus(true);
        setNexusAdvice(null);

        try {
            const requester = mockStudents.find(s => s.uid === selectedTicket.studentId) ||
                (await getPendingPartnerRequests()).find(i => i.uid === selectedTicket.studentId);

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

    const handleResolve = async (ticketId: string) => {
        await resolveTicket(ticketId);
        toast.success("Ticket resolvido.");
        loadData();
    };

    const handleEscalate = (ticketId: string) => {
        setEscalationTicketId(ticketId);
        setIsEscalationOpen(true);
    };

    const confirmEscalation = async (reason: string, targetLevel: 'finance' | 'admin') => {
        if (!escalationTicketId) return;
        await createEscalationRequest({
            ticketId: escalationTicketId,
            reason,
            agentId: agent.uid,
            agentName: agent.displayName,
            targetLevel
        });
        toast.success(`Chamado escalado para ${targetLevel === 'admin' ? 'Admin' : 'Financeiro'}.`);
        setIsEscalationOpen(false);
        setEscalationTicketId(null);
        setSelectedTicket(null); // Clear selected ticket since it's no longer in our list
        loadData();
    };

    const handleViewStudent = (studentId: string) => {
        const student = mockStudents.find(s => s.uid === studentId);
        if (student) setStudentProfileModal(student);
        else toast.error("Aluno não localizado.");
    };

    const getGuaranteeStatus = (student: Student) => {
        if (!student.purchaseDate) return { label: 'N/A', color: 'text-gray-500' };
        const buyDate = new Date(student.purchaseDate);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) return { label: 'Garantia Incondicional', color: 'text-green-400', day: diffDays };
        return { label: 'Prazo Expirado', color: 'text-gray-500', day: diffDays };
    };

    const MenuButton = ({ id, label, icon: Icon, badge }: { id: typeof view, label: string, icon: any, badge?: number }) => (
        <button
            onClick={() => { setView(id); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg transition-all mb-1 group relative ${view === id ? 'bg-green-600 text-white font-bold' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
        >
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">{label}</span>}
            </div>
            {!isSidebarCollapsed && badge !== undefined && badge > 0 && <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full">{badge}</span>}

            {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                    {label} {badge !== undefined && badge > 0 ? `(${badge})` : ''}
                </div>
            )}
        </button>
    );

    const renderView = () => {
        switch (view) {
            case 'tickets':
                // Filter tickets for general support agent:
                // Exclude those already escalated to Finance or Admin
                const filteredSupportTickets = tickets.filter(t =>
                    t.status !== 'pending_finance' && t.status !== 'pending_admin'
                );

                return (
                    <div className="flex flex-col md:flex-row h-full overflow-hidden">
                        <div className="flex-1 min-w-0 h-full">
                            <TicketsView
                                tickets={filteredSupportTickets}
                                selectedTicket={selectedTicket}
                                setSelectedTicket={setSelectedTicket}
                                onSendMessage={handleSendMessage}
                                newMessage={newMessage}
                                setNewMessage={setNewMessage}
                                handleResolve={handleResolve}
                                handleEscalate={handleEscalate}
                                handleViewStudent={handleViewStudent}
                                agent={agent}
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
                );
            case 'chat': return <TeamChatView agent={agent} />;
            case 'partners': return <PartnerApprovalView requests={partnerRequests} onAction={async (uid, action) => { await updatePartnerRequestStatus(uid, action); toast.success("Processado!"); loadData(); }} />;
            case 'refunds': return <RefundsTriageView requests={refundRequests} onAnalyze={setRefundModalRequest} />;
            case 'students': return <StudentsListView onOpenStudent={handleViewStudent} agent={agent} />;
            case 'productivity': return <ProductivityView agent={agent} />;
            case 'community': return <SupportCommunityView agent={agent} />;
            case 'profile': return <SupportProfileView agent={agent} />;
            default: return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200 font-sans overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-gray-800 border-r border-gray-700 flex-col z-20 transition-all duration-300 relative`}>
                <div className={`p-6 border-b border-gray-700 h-24 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50"><MessageSquare className="w-6 h-6 text-green-500" /></div>
                        {!isSidebarCollapsed && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h1 className="text-lg font-bold text-white leading-tight">Suporte 15X</h1>
                                <p className="text-xs text-gray-400 truncate max-w-[120px]">{agent.displayName}</p>
                            </motion.div>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute -right-3 top-24 bg-gray-800 border border-gray-700 rounded-full p-1 text-gray-400 hover:text-white z-30 transition-colors shadow-lg"
                >
                    {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
                <nav className="flex-1 p-4 overflow-y-auto">
                    <MenuButton id="tickets" label="Atendimentos" icon={MessageSquare} badge={tickets.filter(t => t.status === 'open').length} />
                    <MenuButton id="students" label="Central Alunos" icon={Users} />
                    <MenuButton id="partners" label="Aprovar Parceiros" icon={ShieldCheck} />
                    <MenuButton id="productivity" label="Produtividade" icon={Activity} />
                    <MenuButton id="chat" label="Chat Interno" icon={Users} />
                    <MenuButton id="community" label="Comunidades" icon={MessageSquare} />
                    <MenuButton id="hr" label="Meu RH" icon={FileText} />

                    {agent.permissions.viewFinance && (
                        <MenuButton id="refunds" label="Reembolsos" icon={DollarSign} />
                    )}

                    <div className="h-px bg-gray-700 my-2"></div>
                    <MenuButton id="profile" label="Meu Perfil" icon={User} />
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <button onClick={onLogout} className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} gap-2 text-red-400 hover:text-white transition-colors p-2 font-bold group relative`}>
                        <LogOut className="w-5 h-5 shrink-0" />
                        {!isSidebarCollapsed && <span>Sair</span>}
                        {isSidebarCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                                Sair
                            </div>
                        )}
                    </button>
                </div>
            </aside>

            {/* Mobile Header & Overlay */}
            <div className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`} onClick={() => setIsMobileMenuOpen(false)}></div>
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 flex flex-col transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-green-500" />
                        <span className="font-bold text-white">Menu Suporte</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400"><XIcon className="w-5 h-5" /></button>
                </div>
                <nav className="flex-1 p-4 overflow-y-auto">
                    <MenuButton id="tickets" label="Atendimentos" icon={MessageSquare} badge={tickets.filter(t => t.status === 'open').length} />
                    <MenuButton id="students" label="Central Alunos" icon={Users} />
                    <MenuButton id="partners" label="Aprovar Parceiros" icon={ShieldCheck} />
                    <MenuButton id="productivity" label="Produtividade" icon={Activity} />
                    <MenuButton id="chat" label="Chat Interno" icon={Users} />
                    <MenuButton id="community" label="Comunidades" icon={MessageSquare} />
                    {agent.permissions.viewFinance && <MenuButton id="refunds" label="Reembolsos" icon={DollarSign} />}
                    <div className="h-px bg-gray-700 my-2"></div>
                    <MenuButton id="profile" label="Meu Perfil" icon={User} />
                </nav>
                <div className="p-4 border-t border-gray-700"><button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-white font-bold"><LogOut className="w-5 h-5" /> Sair</button></div>
            </aside>

            <main className="flex-1 bg-gray-900 relative flex flex-col overflow-hidden w-full">
                {/* Mobile Header Bar */}
                <div className="md:hidden bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center shrink-0 z-10">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-green-500" />
                        <span className="font-bold text-white">Suporte</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-white"><Menu className="w-6 h-6" /></button>
                </div>

                <div className={`${(view === 'tickets' || view === 'community') ? 'p-0' : 'p-4 md:p-6 pb-0'} flex-shrink-0 transition-all`}><CampaignBanner user={agent} /></div>

                <div className="flex-1 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        <motion.div key={view} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="h-full w-full">
                            <div className="h-full flex flex-col">
                                {renderView()}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <AnimatePresence>
                {refundModalRequest && <RefundTriageModal request={refundModalRequest} onClose={() => setRefundModalRequest(null)} onAction={async (id, action) => { if (action === 'forward') await updateRefundRequest(id, { status: 'pending_admin', processedBy: agent.displayName }); else await updateRefundRequest(id, { status: 'rejected' }); setRefundModalRequest(null); loadData(); }} />}
                {isEscalationOpen && <EscalationModal onClose={() => setIsEscalationOpen(false)} onConfirm={confirmEscalation} />}

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

                {studentProfileModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80] p-4">
                        <div className="w-full max-w-4xl relative max-h-[90vh] overflow-y-auto rounded-xl bg-gray-900 border border-gray-700">
                            <StudentProfileView student={studentProfileModal} viewer="support" onClose={() => setStudentProfileModal(null)} onAction={(action) => {
                                if (action === 'chat') {
                                    setStudentProfileModal(null);
                                    setView('tickets');
                                    const ticket = tickets.find(t => t.studentId === studentProfileModal.uid && t.status !== 'resolved');
                                    if (ticket) setSelectedTicket(ticket);
                                }
                            }} />
                            <button onClick={() => setStudentProfileModal(null)} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white"><XIcon className="w-6 h-6" /></button>
                        </div>
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
                        agent={agent}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupportAgentDashboardPage;