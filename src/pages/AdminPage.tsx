
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TeamUser, LinkRequest, RefundRequest, ChatMessage, Student } from '@/types';
import {
    getLinkRequests, getRefundRequests, getTeamUsers,
    listenToAllSupportThreads, updateLinkRequest, approveLinkRequestAndEnableProduct,
    updateRefundRequest, searchStudents, getStudentsPaginated, updateStudent, getAllUsersFlat
} from '@/services/mockFirebase';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

// Import Views
import OperationsCenterView from './admin/views/OperationsCenterView';
import AppProductsView from './admin/views/AppProductsView';
import RequestsView from './admin/views/RequestsView';
import InfluencersView from './admin/views/InfluencersView';
import SalesTeamView from './admin/views/SalesTeamView';
import VerificationView from './admin/views/VerificationView';
import LevelsView from './admin/views/LevelsView';
import AdvancedChatView from './admin/views/AdvancedChatView';
import RefundsView from './admin/views/RefundsView';
import AccessRecoveryView from './admin/views/AccessRecoveryView';
import FinancialView from './admin/views/FinancialView';
import CommissionsView from './admin/views/CommissionsView';
import ProductivityView from './admin/views/ProductivityView';
import TeamManagementView from './admin/views/TeamManagementView';
import AuditView from './admin/views/AuditView';
import EvolutionManagementView from './admin/views/EvolutionManagementView';
import SystemSettingsView from './admin/views/SystemSettingsView';
import { WithdrawalsManagerView } from './finance/views/WithdrawalsManagerView';
import { FinancialCommandCenter } from './admin/views/FinancialCommandCenter';

// Import Layout Components
import AdminNavigation, { AdminView } from './admin/components/AdminNavigation';
import { Eye, Search, X as XIcon, User as UserIcon } from '@/components/Icons';
import Button from '@/components/Button';
import SalesDashboardPage from './SalesDashboardPage';
import SupportAgentDashboardPage from './SupportAgentDashboardPage';
import { mockSalesTeam, mockSupportAgents } from '@/services/mockFirebase';
import { ApproveRequestModal, RejectRequestModal, RequestAnalysisModal, RefundTriageModal, RefundApprovalModal, StudentDetailsModal } from './admin/modals/AdminModals';

// --- GOD MODE SEARCH MODAL ---
const GodModeSearchModal: React.FC<{ isOpen: boolean, onClose: () => void, onSelectUser: (uid: string) => void }> = ({ isOpen, onClose, onSelectUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            getAllUsersFlat().then(users => {
                setAllUsers(users);
                setResults(users.slice(0, 10)); // Show first 10 initially
                setLoading(false);
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (!searchTerm) {
            setResults(allUsers.slice(0, 10));
            return;
        }
        const termLower = searchTerm.toLowerCase();
        const filtered = allUsers.filter(u =>
            (u.displayName || u.name || '').toLowerCase().includes(termLower) ||
            (u.email || '').toLowerCase().includes(termLower) ||
            (u.role || '').toLowerCase().includes(termLower)
        );
        setResults(filtered.slice(0, 20));
    }, [searchTerm, allUsers]);

    if (!isOpen) return null;

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'student': return { text: 'Aluno', color: 'bg-blue-500/20 text-blue-400' };
            case 'sales_agent': return { text: 'Vendedor', color: 'bg-green-500/20 text-green-400' };
            case 'influencer': return { text: 'Influencer', color: 'bg-purple-500/20 text-purple-400' };
            case 'support_agent': return { text: 'Suporte', color: 'bg-yellow-500/20 text-yellow-400' };
            case 'super_admin': return { text: 'Admin', color: 'bg-red-500/20 text-red-400' };
            default: return { text: role, color: 'bg-gray-500/20 text-gray-400' };
        }
    }

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-800 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
            >
                <div className="p-6 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                            <Eye className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Modo Deus (Espelho)</h3>
                            <p className="text-xs text-gray-400">Pesquise qualquer usuário para acessar o painel dele.</p>
                        </div>
                    </div>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                <div className="p-4 border-b border-gray-700 bg-gray-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <input
                            className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                            placeholder="Buscar por nome, email ou função..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-gray-900/30">
                    {loading ? (
                        <div className="flex justify-center p-10"><LoadingSpinner /></div>
                    ) : results.length === 0 ? (
                        <div className="text-center p-10 text-gray-500">Nenhum usuário encontrado.</div>
                    ) : (
                        <div className="space-y-1">
                            {results.map((user) => {
                                const roleInfo = getRoleLabel(user.role);
                                return (
                                    <div key={user.uid || user.id} className="flex items-center justify-between p-3 hover:bg-gray-700/50 rounded-lg transition-colors group border border-transparent hover:border-gray-600">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold text-lg border border-gray-600">
                                                {(user.displayName || user.name || '?').charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm">{user.displayName || user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-white/5 ${roleInfo.color}`}>
                                                {roleInfo.text}
                                            </span>
                                            <Button
                                                onClick={() => onSelectUser(user.uid || user.id)}
                                                className="!py-1.5 !px-3 !text-xs !bg-indigo-600 hover:!bg-indigo-500 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Acessar Painel
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const AdminPage: React.FC = () => {
    const { user, impersonateUser: authImpersonate } = useAuth();
    const [viewMode, setViewMode] = useState<'super_admin' | 'sales_mirror' | 'support_mirror'>('super_admin');
    const [currentView, setCurrentView] = useState<AdminView>('dashboard');

    // Global State managed here to share counters/notifications across tabs
    const [requests, setRequests] = useState<LinkRequest[]>([]);
    const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentAdminProfile, setCurrentAdminProfile] = useState<TeamUser | null>(null);

    // Global Modals State
    const [analysisRequest, setAnalysisRequest] = useState<LinkRequest | null>(null);
    const [approveModalRequest, setApproveModalRequest] = useState<LinkRequest | null>(null);
    const [rejectModalRequest, setRejectModalRequest] = useState<LinkRequest | null>(null);
    const [refundTriageModal, setRefundTriageModal] = useState<RefundRequest | null>(null);
    const [refundApprovalModal, setRefundApprovalModal] = useState<RefundRequest | null>(null);
    const [studentDetailsModal, setStudentDetailsModal] = useState<Student | null>(null);

    // God Mode Modal
    const [isGodModeSearchOpen, setIsGodModeSearchOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const [reqs, refunds, team] = await Promise.all([getLinkRequests(), getRefundRequests(), getTeamUsers()]);
            setRequests(reqs);
            setRefundRequests(refunds);

            if (user?.email) {
                const adminProfile = team.find(t => t.email === user.email);
                setCurrentAdminProfile(adminProfile || null);
            }
            setLoading(false);
        }
        loadData();
    }, [user]);

    // --- SHARED ACTIONS ---
    const handleApproveLink = async (reqId: string, link: string) => {
        await approveLinkRequestAndEnableProduct(reqId, link);
        setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'approved', affiliateLink: link } : r));
        setApproveModalRequest(null);
        setAnalysisRequest(null);
        toast.success('Link aprovado e produto liberado!');
    }

    const handleRejectLink = async (reqId: string, reason: string) => {
        await updateLinkRequest(reqId, { status: 'rejected', rejectionReason: reason });
        setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'rejected', rejectionReason: reason } : r));
        setRejectModalRequest(null);
        setAnalysisRequest(null);
        toast.success('Pedido rejeitado.');
    }

    const handleRefundForward = async (reqId: string) => {
        await updateRefundRequest(reqId, { status: 'pending_admin', processedBy: user?.displayName || 'Support' });
        setRefundRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'pending_admin', processedBy: user?.displayName || 'Support' } : r));
        setRefundTriageModal(null);
        toast.success("Reembolso enviado para Admin.");
    }

    const handleRefundFinalApprove = async (reqId: string) => {
        await updateRefundRequest(reqId, { status: 'approved', processedBy: user?.displayName || 'Admin', processedAt: Date.now() });
        setRefundRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'approved', processedBy: user?.displayName || 'Admin', processedAt: Date.now() } : r));
        setRefundApprovalModal(null);
        toast.success("Reembolso aprovado e usuário bloqueado.");
    }

    const handleProfileActions = async (action: string, payload?: any) => {
        if (!studentDetailsModal) return;
        switch (action) {
            case 'chat':
                setStudentDetailsModal(null);
                setCurrentView('chat');
                break;
            case 'impersonate':
                await authImpersonate(studentDetailsModal.uid);
                break;
            case 'edit':
                await updateStudent(studentDetailsModal.uid, { displayName: studentDetailsModal.displayName + " (Editado)" });
                toast.success("Dados atualizados.");
                break;
            case 'block':
                if (confirm("Bloquear este aluno?")) {
                    await updateStudent(studentDetailsModal.uid, { internalId: 'BLOCKED' });
                    toast.error("Aluno bloqueado.");
                }
                break;
        }
    };

    const handleGodModeSelect = async (uid: string) => {
        setIsGodModeSearchOpen(false);
        await authImpersonate(uid);
    }

    if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
    if (!user) return null;

    // Legacy View Modes (Can be removed later if God Mode covers everything, but kept for quick access)
    if (viewMode === 'sales_mirror') {
        return (<div className="border-[10px] border-blue-600 rounded-xl overflow-hidden relative"><div className="bg-blue-600 text-white text-center py-2 font-bold uppercase tracking-wider text-sm sticky top-0 z-50 flex justify-between px-4 items-center"><span>Modo Espelho: Visão do Comercial</span><Button onClick={() => setViewMode('super_admin')} className="!py-1 !text-xs !bg-white !text-blue-600 hover:!bg-gray-100">Sair do Modo Espelho</Button></div><SalesDashboardPage salesPerson={mockSalesTeam[0]} onLogout={() => setViewMode('super_admin')} /></div>)
    }
    if (viewMode === 'support_mirror') {
        return (<div className="border-[10px] border-purple-600 rounded-xl overflow-hidden relative"><div className="bg-purple-600 text-white text-center py-2 font-bold uppercase tracking-wider text-sm sticky top-0 z-50 flex justify-between px-4 items-center"><span>Modo Espelho: Visão do Suporte</span><Button onClick={() => setViewMode('super_admin')} className="!py-1 !text-xs !bg-white !text-purple-600 hover:!bg-gray-100">Sair do Modo Espelho</Button></div><SupportAgentDashboardPage agent={mockSupportAgents[0]} onLogout={() => setViewMode('super_admin')} /></div>)
    }

    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const isSuperAdmin = currentAdminProfile?.role === 'super_admin';

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Painel Admin</h1>
                    <div className="flex items-center gap-2 text-gray-400">
                        <span>Bem-vindo, {user.displayName?.split(' ')[0] || 'Admin'}</span>
                        <span className="text-xs bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                            {currentAdminProfile?.permissions?.viewSensitiveData ? 'Acesso Completo' : 'Acesso Restrito'}
                        </span>
                    </div>
                </div>
                {isSuperAdmin && (
                    <div className="flex gap-2">
                        {/* NOVO BOTÃO MODO DEUS GLOBAL */}
                        <button
                            onClick={() => setIsGodModeSearchOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/20"
                        >
                            <Eye className="w-4 h-4" /> Modo Deus (Espelho Global)
                        </button>

                        {/* Botões de Acesso Rápido Legado (Opcional manter) */}
                        <div className="bg-gray-900 border border-gray-700 p-1 rounded-lg flex gap-2">
                            <button onClick={() => setViewMode('sales_mirror')} className="px-3 py-1.5 rounded text-xs font-bold transition-colors bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white" title="Quick Sales View">Vendas</button>
                            <button onClick={() => setViewMode('support_mirror')} className="px-3 py-1.5 rounded text-xs font-bold transition-colors bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white" title="Quick Support View">Suporte</button>
                        </div>
                    </div>
                )}
            </div>

            <AdminNavigation
                currentView={currentView}
                setCurrentView={setCurrentView}
                pendingCount={pendingCount}
                isSuperAdmin={isSuperAdmin}
                canViewAudit={isSuperAdmin || currentAdminProfile?.role === 'finance' || !!currentAdminProfile?.permissions?.viewSensitiveData}
            />

            <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 min-h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.div key={currentView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {currentView === 'dashboard' && <OperationsCenterView user={user} />}
                        {currentView === 'app_products' && <AppProductsView navigateTo={setCurrentView as any} />}
                        {currentView === 'requests' && <RequestsView requests={requests} onAnalyze={r => setAnalysisRequest(r)} />}
                        {currentView === 'influencers' && <InfluencersView />}
                        {currentView === 'sales_team' && <SalesTeamView onViewMonitoring={() => toast("Monitoramento disponível em breve.")} />}
                        {currentView === 'verification' && <VerificationView />}
                        {currentView === 'levels' && <LevelsView />}
                        {currentView === 'chat' && <AdvancedChatView adminUser={user} />}
                        {currentView === 'refunds' && <RefundsView requests={refundRequests} onOpenTriage={r => setRefundTriageModal(r)} onOpenApproval={r => setRefundApprovalModal(r)} currentUserRole={currentAdminProfile?.role || 'viewer'} />}
                        {currentView === 'access_recovery' && <AccessRecoveryView adminName={user.displayName || 'Admin'} />}
                        {currentView === 'financial' && <FinancialCommandCenter />}
                        {currentView === 'withdrawals' && <WithdrawalsManagerView />}
                        {currentView === 'commissions' && <CommissionsView user={user} permissions={currentAdminProfile?.permissions} />}
                        {currentView === 'productivity' && <ProductivityView />}
                        {currentView === 'team' && <TeamManagementView />}
                        {currentView === 'audit' && <AuditView />}
                        {currentView === 'settings' && <SystemSettingsView />}
                    </motion.div>
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {analysisRequest && <RequestAnalysisModal request={analysisRequest} onClose={() => setAnalysisRequest(null)} onApproveStart={req => { setAnalysisRequest(null); setApproveModalRequest(req); }} onRejectStart={req => { setAnalysisRequest(null); setRejectModalRequest(req); }} />}
                {approveModalRequest && <ApproveRequestModal request={approveModalRequest} onClose={() => setApproveModalRequest(null)} onApprove={handleApproveLink} canViewSensitive={!!currentAdminProfile?.permissions?.viewSensitiveData} />}
                {rejectModalRequest && <RejectRequestModal request={rejectModalRequest} onClose={() => setRejectModalRequest(null)} onReject={handleRejectLink} />}
                {refundTriageModal && <RefundTriageModal request={refundTriageModal} onClose={() => setRefundTriageModal(null)} onForward={handleRefundForward} />}
                {refundApprovalModal && <RefundApprovalModal request={refundApprovalModal} onClose={() => setRefundApprovalModal(null)} onApprove={handleRefundFinalApprove} />}
                {studentDetailsModal && <StudentDetailsModal student={studentDetailsModal} onClose={() => setStudentDetailsModal(null)} onOpenChat={() => { }} canViewSensitive={!!currentAdminProfile?.permissions?.viewSensitiveData} onAction={handleProfileActions} permissions={currentAdminProfile?.permissions} />}

                {/* God Mode Modal */}
                {isGodModeSearchOpen && <GodModeSearchModal isOpen={isGodModeSearchOpen} onClose={() => setIsGodModeSearchOpen(false)} onSelectUser={handleGodModeSelect} />}
            </AnimatePresence>
        </div>
    );
};

export default AdminPage;
