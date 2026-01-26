
import React, { useState, useEffect } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import {
    X as XIcon, RefreshCw, ClipboardCopy, Link as LinkIcon, Monitor,
    User as UserIcon, ShieldCheck, LockClosed, Eye, TrendingUp, DollarSign, Users,
    BarChart3, Trophy, Whatsapp, Camera, FileText, Download
} from '@/components/Icons';
import { LinkRequest, RefundRequest, SalesScript, TeamUser, SalesPerson, Influencer, AppProduct, User, Student, OCRResult } from '@/types';
import { toast } from 'react-hot-toast';
import {
    createAccountAfterPurchase, updateTeamUser, getSalesScripts, updateSalesScript,
    createSalesScript, deleteSalesScript, getSalesTeam, updateSalesPerson,
    createSalesPerson, updateInfluencer, createCommissionPayment,
    sendInviteViaWhatsAppInstance, createTeamUser,
    simulateOCRProcessing, auditPayment, createAuditTicket, sendManagerNotification
} from '@/services/mockFirebase';
import CampaignBanner from '@/components/CampaignBanner';
import { motion } from 'framer-motion';
import StudentProfileView from '@/components/StudentProfileView';
import { securityService } from '@/services/securityService';

// --- STUDENT REGISTRATION MODAL ---
export const RegisterStudentModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [formData, setFormData] = useState({ name: '', email: '', cpf: '', phone: '' });
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const generatePassword = () => {
        // Generates a password that satisfies all new security rules
        const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const lowers = "abcdefghijkmnpqrstuvwxyz";
        const nums = "23456789";
        const specials = "!@#$%^&*";

        let pass = "";
        pass += uppers.charAt(Math.floor(Math.random() * uppers.length));
        pass += lowers.charAt(Math.floor(Math.random() * lowers.length));
        pass += nums.charAt(Math.floor(Math.random() * nums.length));
        pass += specials.charAt(Math.floor(Math.random() * specials.length));

        const allChars = uppers + lowers + nums + specials;
        for (let i = 0; i < 8; i++) pass += allChars.charAt(Math.floor(Math.random() * allChars.length));

        // Shuffle
        pass = pass.split('').sort(() => 0.5 - Math.random()).join('');

        setPassword(pass);
        toast.success("Senha segura gerada!");
    };

    const copyPassword = () => { if (!password) return; navigator.clipboard.writeText(password); toast.success("Senha copiada!"); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = securityService.validatePassword(password, {
            email: formData.email,
            name: formData.name
        });

        if (!validation.isValid) {
            validation.errors.forEach(err => toast.error(err));
            return;
        }

        setLoading(true);
        try {
            await createAccountAfterPurchase({ ...formData, password });
            toast.success("Aluno cadastrado com sucesso!");
            onClose();
        } catch (e) {
            toast.error("Erro ao cadastrar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-md rounded-xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-white text-lg">Cadastrar Aluno Manualmente</h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Nome Completo" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    <Input label="E-mail" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                    <Input label="CPF" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} placeholder="000.000.000-00" />
                    <Input label="Telefone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" />
                    <div className="col-span-full mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-gray-300">Senha de Acesso (Gerar Automático)</label>
                        <div className="flex gap-2">
                            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-3 text-white outline-none font-mono text-center tracking-widest" placeholder="Clique para gerar..." />
                            <Button type="button" onClick={generatePassword} variant="secondary" className="!px-3"><RefreshCw className="w-5 h-5" /></Button>
                            <Button type="button" onClick={copyPassword} variant="secondary" className="!px-3" disabled={!password}><ClipboardCopy className="w-5 h-5" /></Button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">Requisitos: 8+ caracteres, 1 maiúscula, 1 número, 1 símbolo.</p>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <Button variant="secondary" type="button" onClick={onClose} className="flex-1">Cancelar</Button>
                        <Button type="submit" isLoading={loading} className="flex-1">Cadastrar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ... (Resto do arquivo permanece inalterado: GodModePreviewModal, ApproveRequestModal, RejectRequestModal, etc.)

// --- GOD MODE PREVIEW MODAL ---
type SimulationRole = 'student' | 'influencer' | 'sales_agent' | 'support_agent';

const MOCK_PROFILES: Record<SimulationRole, any> = {
    student: {
        uid: 'sim-student-001',
        email: 'aluno.simulado@teste.com',
        displayName: 'Aluno Simulado (Modo Deus)',
        role: 'student',
        hasMestreIA: true,
        gamification: { level: 'Iniciante', totalVerifiedPosts: 12 },
        dailyMestreIALimit: 50
    },
    influencer: {
        uid: 'sim-influencer-001',
        email: 'influencer.simulado@teste.com',
        displayName: 'Influencer Parceiro (Modo Deus)',
        role: 'influencer',
        totalEarnings: 15420.00
    } as any,
    sales_agent: {
        uid: 'sim-sales-001',
        email: 'vendedor.simulado@teste.com',
        displayName: 'Vendedor Elite (Modo Deus)',
        role: 'sales_agent'
    } as any,
    support_agent: {
        uid: 'sim-support-001',
        email: 'suporte.simulado@teste.com',
        displayName: 'Agente Suporte (Modo Deus)',
        role: 'support_agent'
    } as any
};

export const GodModePreviewModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const [selectedRole, setSelectedRole] = useState<SimulationRole>('student');
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationLog, setSimulationLog] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSimulationLog([]);
            setIsSimulating(true);
            setTimeout(() => {
                setSimulationLog([
                    `[NEXUS CORE] Iniciando simulação para perfil: ${selectedRole.toUpperCase()}...`,
                    `[AUTH] Bypass de autenticação ativado (Admin Override)...`,
                    `[DATA] Carregando contexto mockado...`,
                    `[RENDER] Renderizando interface...`,
                    `[STATUS] Sistema Operacional.`
                ]);
                setIsSimulating(false);
            }, 800);
        }
    }, [isOpen, selectedRole]);

    if (!isOpen) return null;

    const activeUser = MOCK_PROFILES[selectedRole];

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[150] p-2">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900 w-full max-w-[98vw] h-[95vh] rounded-2xl border-2 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)] flex flex-col overflow-hidden"
            >
                <div className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between items-center relative z-20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/40">
                            <Eye className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                                Modo Deus <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded border border-purple-400">DEBUG ADMIN</span>
                            </h2>
                            <p className="text-xs text-purple-300 font-mono">Simulação de experiência de usuário em tempo real</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-gray-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar: Role Selector */}
                    <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col gap-2 overflow-y-auto flex-shrink-0">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-2 px-2">Selecionar Perfil Alvo</p>
                        {[
                            { id: 'student', label: 'Aluno (Dashboard)', icon: Users },
                            { id: 'influencer', label: 'Influencer / Afiliado', icon: TrendingUp },
                            { id: 'sales_agent', label: 'Agente de Vendas', icon: DollarSign },
                            { id: 'support_agent', label: 'Agente de Suporte', icon: ShieldCheck },
                        ].map((role) => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role.id as SimulationRole)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${selectedRole === role.id
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                                    : 'bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                                    }`}
                            >
                                <role.icon className="w-4 h-4" />
                                {role.label}
                            </button>
                        ))}

                        <div className="mt-auto bg-black/40 p-3 rounded-lg border border-gray-700">
                            <p className="text-[10px] text-gray-500 font-mono mb-1">USER CONTEXT:</p>
                            <div className="text-xs text-green-400 font-mono break-all">
                                @{activeUser.role}
                                <br />
                                uid: {activeUser.uid.substring(0, 8)}...
                            </div>
                        </div>
                    </div>

                    {/* Main Preview Area */}
                    <div className="flex-1 bg-black/50 p-6 overflow-y-auto relative flex flex-col items-center">
                        <div className="w-full max-w-6xl h-full bg-gray-900 rounded-xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col mb-6">
                            {/* Browser Bar */}
                            <div className="bg-gray-800 p-2 border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="text-xs text-gray-500 font-mono flex items-center gap-2 bg-gray-900 px-4 py-1 rounded-full border border-gray-700/50">
                                    <LockClosed className="w-3 h-3" /> mestredosnegocios.com/dashboard
                                </div>
                                <div></div>
                            </div>

                            {/* Content Area - Simulated Dashboard */}
                            <div className="flex-1 bg-brand-secondary overflow-y-auto relative custom-scrollbar">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none fixed"></div>

                                {isSimulating ? (
                                    <div className="flex flex-col items-center justify-center h-full text-purple-400 min-h-[500px]">
                                        <RefreshCw className="w-10 h-10 animate-spin mb-4" />
                                        <p className="text-sm font-bold">Carregando contexto do usuário...</p>
                                    </div>
                                ) : (
                                    <div className="p-6 space-y-6 relative z-10 max-w-7xl mx-auto">
                                        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl text-center mb-6">
                                            <p className="text-blue-300 text-sm font-bold flex items-center justify-center gap-2">
                                                <Eye className="w-5 h-5" /> Você está visualizando como: {activeUser.displayName}
                                            </p>
                                        </div>
                                        <CampaignBanner user={activeUser} />

                                        {/* Mock Content Placeholder */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-32 bg-gray-800/50 rounded-xl border border-gray-700 animate-pulse"></div>
                                            ))}
                                            <div className="col-span-full h-64 bg-gray-800/50 rounded-xl border border-gray-700 animate-pulse"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Debug Logs Console */}
                        <div className="w-full max-w-[90%] mt-auto bg-black rounded-lg border border-gray-800 font-mono text-xs p-4 h-32 overflow-y-auto custom-scrollbar shadow-inner flex-shrink-0">
                            <p className="text-gray-500 mb-2 border-b border-gray-800 pb-1">NEXUS_DEBUG_CONSOLE_V1.log</p>
                            {simulationLog.map((log, i) => (
                                <div key={i} className="text-gray-300 mb-1">
                                    <span className="text-purple-500">{new Date().toLocaleTimeString()}</span> {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// --- APPROVE LINK MODAL ---
export const ApproveRequestModal: React.FC<{ request: LinkRequest, onClose: () => void, onApprove: (id: string, link: string) => void, canViewSensitive: boolean }> = ({ request, onClose, onApprove }) => {
    const [link, setLink] = useState('');
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-md rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Aprovar {request.productName}</h3>
                <Input label="Link de Afiliado" value={link} onChange={e => setLink(e.target.value)} placeholder="Link gerado..." />
                <div className="flex gap-2 mt-4">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button onClick={() => onApprove(request.id, link)} className="flex-1" disabled={!link}>Confirmar</Button>
                </div>
            </div>
        </div>
    );
};

// --- REJECT REQUEST MODAL ---
export const RejectRequestModal: React.FC<{ request: LinkRequest, onClose: () => void, onReject: (id: string, reason: string) => void }> = ({ request, onClose, onReject }) => {
    const [reason, setReason] = useState('');
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-md rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Rejeitar Solicitação</h3>
                <Input label="Motivo" value={reason} onChange={e => setReason(e.target.value)} />
                <div className="flex gap-2 mt-4">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button onClick={() => onReject(request.id, reason)} className="flex-1 bg-red-600 hover:bg-red-500" disabled={!reason}>Rejeitar</Button>
                </div>
            </div>
        </div>
    );
};

// --- REQUEST ANALYSIS MODAL ---
export const RequestAnalysisModal: React.FC<{ request: LinkRequest, onClose: () => void, onApproveStart: (req: LinkRequest) => void, onRejectStart: (req: LinkRequest) => void }> = ({ request, onClose, onApproveStart, onRejectStart }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 w-full max-w-2xl rounded-xl p-6 border border-gray-700 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-lg">Análise de Solicitação</h3>
                <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Aluno</p>
                    <p className="text-white font-bold">{request.studentName}</p>
                    <p className="text-sm text-gray-400">{request.studentEmail}</p>
                    <p className="text-sm text-gray-400">{request.studentCpf}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Produto Solicitado</p>
                    <p className="text-brand-primary font-bold text-lg">{request.productName}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(request.requestDate).toLocaleString()}</p>
                </div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 mb-6">
                <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-blue-400" /> Redes Sociais Informadas
                </h4>
                <div className="space-y-2">
                    {Object.entries(request.socialLinks).map(([network, url]) => (url ? (
                        <div key={network} className="flex justify-between items-center bg-gray-800 p-2 rounded border border-gray-600">
                            <div className="flex items-center gap-2"> <span className="capitalize text-gray-300 text-sm font-medium">{network}</span> </div>
                            <a href={url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 text-xs truncate max-w-[200px] flex items-center gap-1"> {url} <LinkIcon className="w-3 h-3" /> </a>
                        </div>
                    ) : null))}
                    {Object.values(request.socialLinks).every(v => !v) && <p className="text-gray-500 text-xs italic">Nenhuma rede informada.</p>}
                </div>
            </div>
            <div className="flex gap-3 border-t border-gray-700 pt-4">
                <Button variant="secondary" onClick={() => onRejectStart(request)} className="flex-1 !bg-red-900/20 text-red-400 border border-red-900/50 hover:border-red-500"> Rejeitar </Button>
                <Button onClick={() => onApproveStart(request)} className="flex-1 !bg-green-600 hover:!bg-green-500"> Aprovar </Button>
            </div>
        </div>
    </div>
);

// --- REFUND TRIAGE MODAL ---
export const RefundTriageModal: React.FC<{ request: RefundRequest, onClose: () => void, onForward: (id: string) => void }> = ({ request, onClose, onForward }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 w-full max-w-md rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Triagem de Reembolso</h3>
            <p className="text-gray-300 mb-4">Encaminhar {request.studentName} para admin?</p>
            <div className="flex gap-2">
                <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                <Button onClick={() => onForward(request.id)} className="flex-1">Encaminhar</Button>
            </div>
        </div>
    </div>
);

// --- REFUND APPROVAL MODAL ---
export const RefundApprovalModal: React.FC<{ request: RefundRequest, onClose: () => void, onApprove: (id: string) => void }> = ({ request, onClose, onApprove }) => {
    const purchaseDate = new Date(request.purchaseDate);
    const now = new Date();
    const deadline = new Date(purchaseDate);
    deadline.setDate(deadline.getDate() + 7);
    deadline.setHours(23, 59, 59, 999);
    const isWithinGuarantee = now <= deadline;
    const daysElapsed = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-md rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Aprovação Final</h3>
                <div className="bg-gray-900 p-4 rounded mb-4 text-sm space-y-3">
                    <p className="flex justify-between"><span className="text-gray-400">Reembolso solicitado em:</span><span className="text-white font-mono">{new Date(request.requestDate).toLocaleDateString()}</span></p>
                    <p className="flex justify-between"><span className="text-gray-400">Compra realizada em:</span><span className="text-white font-mono">{purchaseDate.toLocaleDateString()}</span></p>
                    <div className="border-t border-gray-700 my-2"></div>
                    <div className={`p-4 rounded border flex flex-col gap-1 ${isWithinGuarantee ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                        <p className="text-gray-200 text-sm font-medium">Dias decorridos: <strong>{daysElapsed} de 7 dias</strong> → <span className={isWithinGuarantee ? 'text-green-400' : 'text-red-400'}>{isWithinGuarantee ? 'Dentro do prazo' : 'Fora do prazo'}</span></p>
                    </div>
                    <p className="pt-2"><strong className="text-gray-400">Motivo:</strong> <span className="italic text-gray-200">"{request.reason}"</span></p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button onClick={() => onApprove(request.id)} className={`flex-1 ${isWithinGuarantee ? '!bg-green-600 hover:!bg-green-500' : '!bg-red-600 hover:!bg-red-500'}`}>{isWithinGuarantee ? 'Confirmar' : 'Forçar Aprovação'}</Button>
                </div>
            </div>
        </div>
    );
};

// --- TEAM MEMBER MODAL ---
export const TeamMemberModal: React.FC<{ initialData?: TeamUser | null, onClose: () => void, onSaved: () => void }> = ({ initialData, onClose, onSaved }) => {
    const [formData, setFormData] = useState({ name: initialData?.name || '', email: initialData?.email || '', cpf: initialData?.cpf || '', phone: initialData?.phone || '', role: initialData?.role || 'support', status: initialData?.status || 'active', permissions: initialData?.permissions || { approveLinks: false, chatSupport: true, viewFinance: false, sendNotifications: false, blockStudents: false, manageTeam: false, viewSensitiveData: false, recoverAccess: false } });
    const [loading, setLoading] = useState(false);
    const permissionLabels: Record<string, string> = { approveLinks: 'Aprovar Links/Afiliações', chatSupport: 'Atender no Chat', viewFinance: 'Visualizar Financeiro/Reembolsos', sendNotifications: 'Enviar Notificações', blockStudents: 'Bloquear/Banir Alunos', manageTeam: 'Gerenciar Equipe (Admin)', viewSensitiveData: 'Ver Dados Sensíveis (CPF/IP)', recoverAccess: 'Recuperação de Acesso (Reset/Unlock)' };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) return toast.error("Preencha campos obrigatórios.");
        setLoading(true);
        try {
            if (initialData) {
                await updateTeamUser(initialData.id, formData);
                toast.success("Membro atualizado!");
            } else {
                // New member creation
                await createTeamUser(formData);

                // Unified Nexus Invite (WhatsApp + Email)
                if (formData.phone || formData.email) {
                    const { nexusCore } = await import('../../../services/NexusCore');
                    const inviteResult = await nexusCore.sendSystemInvite({
                        phone: formData.phone,
                        email: formData.email,
                        name: formData.name,
                        projectName: "Acesso Equipe 15X",
                        link: "https://admin.mestre15x.com/login"
                    });

                    // Rich Feedback
                    const channels = [];
                    if (inviteResult.wa) channels.push(`WhatsApp (${inviteResult.waInstance})`);
                    if (inviteResult.email) channels.push(`Email (${inviteResult.emailServer})`);

                    if (channels.length > 0) {
                        toast.success(`Convite enviado via: ${channels.join(' & ')}`, { icon: '🚀', duration: 5000 });
                    } else {
                        toast("Membro salvo, mas sem canais de envio disponíveis.", { icon: '⚠️' });
                    }
                }
            }

            onSaved();
            onClose();
        } catch (e) {
            toast.error("Erro ao salvar.");
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = (key: string) => {
        setFormData(prev => ({ ...prev, permissions: { ...prev.permissions, [key]: !prev.permissions[key] } }));
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-lg rounded-xl p-6 border border-gray-700 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-white text-lg">{initialData ? 'Editar Membro' : 'Novo Membro'}</h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Nome Completo" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <Input label="E-mail Corporativo" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    <Input label="CPF (Obrigatório)" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} placeholder="000.000.000-00" />
                    <Input label="Telefone (WhatsApp)" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="5511999999999" />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Cargo</label>
                            <select className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as any })}>
                                <option value="super_admin">Super Admin</option>
                                <option value="support">Suporte</option>
                                <option value="finance">Financeiro</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Status</label>
                            <select className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                                <option value="active">Ativo</option>
                                <option value="blocked">Bloqueado</option>
                                <option value="inactive">Inativo</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="text-xs text-gray-400 font-bold uppercase mb-3 block">Permissões de Acesso</label>
                        <div className="grid grid-cols-1 gap-2 bg-gray-900 p-3 rounded border border-gray-600">
                            {Object.entries(permissionLabels).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors">
                                    <input type="checkbox" checked={formData.permissions[key]} onChange={() => togglePermission(key)} className="rounded bg-gray-700 border-gray-500 text-brand-primary focus:ring-brand-primary" />
                                    <span className="text-sm text-gray-300">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {!initialData && (
                        <div className="bg-green-500/10 border border-green-500/20 p-3 rounded flex items-center gap-2 mt-4">
                            <Whatsapp className="w-4 h-4 text-green-500" />
                            <p className="text-xs text-green-200">Um convite automático com link de acesso será enviado para o WhatsApp cadastrado.</p>
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <Button variant="secondary" type="button" onClick={onClose} className="flex-1">Cancelar</Button>
                        <Button type="submit" isLoading={loading} className="flex-1 !bg-green-600 hover:!bg-green-500">
                            {initialData ? 'Atualizar' : 'Salvar e Convidar'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ... (Outros modais: StudentDetailsModal, InfluencerModal, SalesPersonModal, CommissionPaymentModal permanecem inalterados)

export const StudentDetailsModal: React.FC<{
    student: Student;
    onClose: () => void;
    onOpenChat: () => void;
    canViewSensitive: boolean;
    onAction: (action: string, payload?: any) => void;
    permissions?: any;
}> = ({ student, onClose, onOpenChat, canViewSensitive, onAction, permissions }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80] p-4">
            <div className="w-full max-w-4xl relative max-h-[90vh] overflow-y-auto rounded-xl bg-gray-900 border border-gray-700">
                <div className="absolute top-4 right-4 z-50">
                    <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white"><XIcon className="w-6 h-6" /></button>
                </div>
                <StudentProfileView
                    student={student}
                    viewer="admin"
                    onClose={onClose}
                    permissions={permissions}
                    onAction={onAction}
                />
            </div>
        </div>
    );
};

export const InfluencerModal: React.FC<{ initialData?: Influencer, onClose: () => void, onSaved: () => void }> = ({ initialData, onClose, onSaved }) => {
    const [data, setData] = useState({
        displayName: initialData?.displayName || '',
        email: initialData?.email || '',
        pixKey: initialData?.bankData?.pixKey || '',
        commissionRate: 0 // Mock field
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (initialData) {
                await updateInfluencer(initialData.uid, data);
            }
            // Create not implemented in this mock view as it usually comes from invites
            toast.success("Influencer salvo!");
            onSaved();
            onClose();
        } catch (e) {
            toast.error("Erro ao salvar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-md rounded-xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-white text-lg">Editar Influencer</h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>
                <div className="space-y-4">
                    <Input label="Nome" value={data.displayName} onChange={e => setData({ ...data, displayName: e.target.value })} />
                    <Input label="Email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} disabled={!!initialData} />
                    <Input label="Chave PIX" value={data.pixKey} onChange={e => setData({ ...data, pixKey: e.target.value })} />
                </div>
                <div className="flex gap-3 mt-6">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button onClick={handleSave} isLoading={loading} className="flex-1">Salvar</Button>
                </div>
            </div>
        </div>
    );
};

export const SalesPersonModal: React.FC<{ initialData?: SalesPerson | null, onClose: () => void, onSaved: () => void }> = ({ initialData, onClose, onSaved }) => {
    const [role, setRole] = useState<'sales_agent' | 'sales_manager'>(initialData?.role as any || 'sales_agent');

    // Form States
    const [data, setData] = useState({
        displayName: initialData?.displayName || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        dailyGoal: initialData?.dailyGoal || 100,
        // Manager Specific
        commissionOverrideRate: initialData?.commissionOverrideRate || 10,
        teamCapacity: (initialData as any)?.teamCapacity || 10,
        // Salesperson Specific
        managerId: initialData?.managerId || ''
    });

    const [loading, setLoading] = useState(false);
    const [managers, setManagers] = useState<SalesPerson[]>([]);

    useEffect(() => {
        // Fetch potential managers
        const loadManagers = async () => {
            const team = await getSalesTeam();
            setManagers(team.filter(m => m.role === 'sales_manager'));
        };
        loadManagers();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                role
            };

            if (initialData) {
                await updateSalesPerson(initialData.uid, payload);
                toast.success("Membro atualizado!");
            } else {
                await createSalesPerson(payload as any);
                toast.success(role === 'sales_manager' ? "Gerente criado!" : "Vendedor convidado!");
            }
            onSaved();
            onClose();
        } catch (e) {
            toast.error("Erro ao salvar");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadContract = () => {
        if (!initialData || !initialData.termsAcceptedAt) return;

        const contractText = `
CONTRATO DE PARCERIA COMERCIAL - MESTRE NOS NEGÓCIOS
----------------------------------------------------
Este documento certifica o aceite dos termos de parceria e autonomia.

DADOS DO PARCEIRO:
Nome: ${initialData.displayName}
Email: ${initialData.email}
ID: ${initialData.uid}

TERMOS ACEITOS:
1. NATUREZA DA RELAÇÃO: Atuação como Parceiro Comercial Autônomo, sem vínculo empregatício.
2. REMUNERAÇÃO: Ganhos 100% variáveis baseados em comissões por vendas.
3. AUTONOMIA: Liberdade total de horários e estratégias.
4. TRIBUTAÇÃO: Responsabilidade própria sobre recolhimento de impostos.

DADOS DA ASSINATURA:
Data/Hora do Aceite: ${new Date(initialData.termsAcceptedAt).toLocaleString()}
IP de Origem: [Registrado no Log de Segurança]
Dispositivo: [Registrado no Log de Segurança]

VALIDAÇÃO BIOMÉTRICA:
Status: ✅ REALIZADA COM SUCESSO
Token de Validação: BIO-${new Date(initialData.termsAcceptedAt).getTime().toString().slice(-6)}
URL da Prova: ${initialData.biometricProofUrl || 'N/A'}

----------------------------------------------------
Este é um documento digital gerado pela plataforma Mestre nos Negócios.
        `;

        const blob = new Blob([contractText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Contrato_Parceiro_${initialData.displayName.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Download do contrato iniciado!");
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-lg rounded-xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-white text-lg">{initialData ? 'Editar Membro Comercial' : 'Novo Membro da Equipe'}</h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                {/* Role Selector */}
                <div className="flex bg-gray-900 p-1 rounded-lg mb-6">
                    <button
                        onClick={() => setRole('sales_agent')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${role === 'sales_agent' ? 'bg-brand-primary text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        👤 Vendedor
                    </button>
                    <button
                        onClick={() => setRole('sales_manager')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${role === 'sales_manager' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        💼 Gerente de Equipe
                    </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    {/* Common Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Nome Completo" value={data.displayName} onChange={e => setData({ ...data, displayName: e.target.value })} />
                        <Input label="Email de Acesso" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} />
                    </div>
                    <Input label="WhatsApp (Para Convite)" value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} placeholder="5511999999999" />

                    {/* LEGAL STATUS (READ ONLY) */}
                    {initialData && (
                        <div className={`p-4 rounded-lg border flex items-center gap-4 ${initialData.termsAcceptedAt ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${initialData.termsAcceptedAt ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-bold text-sm uppercase ${initialData.termsAcceptedAt ? 'text-green-400' : 'text-red-400'}`}>
                                    {initialData.termsAcceptedAt ? 'Contrato Assinado & Validado' : 'Contrato Pendente'}
                                </h4>
                                {initialData.termsAcceptedAt && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[10px] text-gray-400">
                                            Assinado em: {new Date(initialData.termsAcceptedAt).toLocaleString()}
                                        </p>
                                        <button onClick={handleDownloadContract} className="text-[10px] bg-green-500 text-black px-2 py-0.5 rounded font-bold hover:bg-green-400 flex items-center gap-1 transition-colors">
                                            <Download className="w-3 h-3" /> Baixar Dossiê
                                        </button>
                                    </div>
                                )}
                            </div>
                            {initialData.biometricProofUrl && (
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Biometria</p>
                                    <a href={initialData.biometricProofUrl} target="_blank" rel="noopener noreferrer" className="block w-12 h-12 rounded bg-black border border-gray-600 overflow-hidden hover:scale-110 transition-transform cursor-zoom-in">
                                        <img src={initialData.biometricProofUrl} alt="Prova" className="w-full h-full object-cover" />
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {role === 'sales_manager' ? (
                        /* Manager Fields */
                        <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg space-y-4">
                            <h4 className="text-purple-300 font-bold text-sm flex items-center gap-2">
                                <Trophy className="w-4 h-4" /> Configuração de Liderança
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Comissão de Liderança (%)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                                        value={data.commissionOverrideRate}
                                        onChange={e => setData({ ...data, commissionOverrideRate: Number(e.target.value) })}
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Ganha sobre a comissão do vendedor.</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Capacidade da Equipe</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                                        value={data.teamCapacity}
                                        onChange={e => setData({ ...data, teamCapacity: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Sales Person Fields */
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Meta Mensal (R$)" type="number" value={data.dailyGoal} onChange={e => setData({ ...data, dailyGoal: Number(e.target.value) })} />
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Líder / Gerente</label>
                                    <select
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm"
                                        value={data.managerId}
                                        onChange={e => setData({ ...data, managerId: e.target.value })}
                                    >
                                        <option value="">-- Sem Gerente (Direto) --</option>
                                        {managers.map(m => (
                                            <option key={m.uid} value={m.uid}>{m.displayName} ({m.email})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {!initialData && (
                                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded text-xs text-blue-200">
                                    <p className="font-bold mb-1">ℹ️ Processo Automático:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Criação de links de afiliado para TODOS os produtos.</li>
                                        <li>Envio de convite via <strong>WhatsApp</strong> e <strong>E-mail</strong>.</li>
                                        {data.managerId && <li>Vendas serão comissionadas também para o gerente selecionado.</li>}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button onClick={handleSave} isLoading={loading} className="flex-1">
                        {initialData ? 'Atualizar Membro' : 'Salvar e Convidar'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const SalesScriptModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    // Simplified version for Admin Management
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-lg rounded-xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-white text-lg">Scripts de Vendas</h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>
                <p className="text-gray-400 text-sm text-center py-8">Gestão de Scripts em desenvolvimento.</p>
            </div>
        </div>
    )
}

export const CommissionPaymentModal: React.FC<{ onClose: () => void, user: any, onSave: () => void, initialData?: { amount?: number, managerName?: string, managerId?: string, period?: string } }> = ({ onClose, user, onSave, initialData }) => {
    const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
    const [manager, setManager] = useState(initialData?.managerName || '');
    const [period, setPeriod] = useState(initialData?.period || '');
    const [paymentType, setPaymentType] = useState('commission');
    const [loading, setLoading] = useState(false);
    const [ocrFile, setOcrFile] = useState<File | null>(null);
    const [ocrProcessing, setOcrProcessing] = useState(false);
    const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setOcrFile(file);
        setOcrProcessing(true);
        try {
            const result = await simulateOCRProcessing(file);
            setOcrResult(result);
            setAmount(result.extractedAmount.toString());
            setManager(prev => prev || result.extractedBeneficiary || '');
            toast.success("Comprovante processado via OCR!");
        } catch (error) {
            toast.error("Erro no processamento OCR");
        } finally {
            setOcrProcessing(false);
        }
    };

    const handleSave = async () => {
        if (!amount || !manager) return toast.error("Preencha o valor e o beneficiário.");
        setLoading(true);
        try {
            const amountNum = parseFloat(amount);
            const paymentData = {
                amount: amountNum,
                managerName: manager,
                period,
                paymentType: paymentType as any,
                paymentDate: Date.now(),
                responsibleName: user.displayName,
                status: 'paid' as const,
                proofUrl: ocrFile ? '#' : '#' // In a real app, this would be the uploaded URL
            };

            const newPayment = await createCommissionPayment(paymentData);

            // Audit Logic integration
            if (ocrResult) {
                const auditStatus = auditPayment({ amount: amountNum }, ocrResult);
                if (auditStatus === 'inconsistent') {
                    await createAuditTicket({
                        paymentId: (newPayment as any)?.id || `pay-${Date.now()}`,
                        paymentType: 'commission',
                        agentId: user.uid || 'system',
                        agentName: user.displayName || 'Admin',
                        issueDescription: `Inconsistência em Comissão: Valor Informado (R$ ${amountNum}) vs OCR (R$ ${ocrResult.extractedAmount}). [Confiança: ${ocrResult.confidence * 100}%]`
                    });
                    toast.error("Divergência detectada! Ticket de auditoria aberto.", { duration: 5000 });
                }
            }

            // Send Notification to Manager if ID is known
            if (initialData?.managerId) {
                await sendManagerNotification(initialData.managerId, amountNum, paymentData.proofUrl);
                toast.success(`Notificação enviada para ${manager}!`);
            }

            toast.success("Pagamento registrado!");
            onSave();
            onClose();
        } catch (e) {
            toast.error("Erro ao registrar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-md rounded-xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-white text-lg">Lançar Pagamento / Vale</h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                <div className="mb-6">
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-2 text-center">Escanear Comprovante (WhatsApp/Banco)</label>
                    <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all text-center ${ocrFile ? 'border-green-500/50 bg-green-500/5' : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'}`}>
                        {ocrProcessing ? (
                            <div className="py-4 space-y-2">
                                <RefreshCw className="w-8 h-8 text-brand-primary animate-spin mx-auto" />
                                <p className="text-xs text-gray-400 font-mono animate-pulse">LENDO COMPROVANTE...</p>
                            </div>
                        ) : (
                            <>
                                <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="space-y-1">
                                    <Camera className="w-6 h-6 text-gray-500 mx-auto" />
                                    <p className="text-xs text-gray-300 font-medium">{ocrFile ? ocrFile.name : 'Clique para subir o print'}</p>
                                    <p className="text-[10px] text-gray-500">Auto-preenche valor e beneficiário</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Tipo de Pagamento</label>
                        <select
                            value={paymentType}
                            onChange={(e) => setPaymentType(e.target.value)}
                            className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 outline-none"
                        >
                            <option value="commission">Comissão (Vendas)</option>
                            <option value="salary">Salário Mensal</option>
                            <option value="advance">Vale / Adiantamento</option>
                            <option value="bonus">Bônus / Premiação</option>
                            <option value="thirteenth">13º Salário</option>
                            <option value="vacation">Férias</option>
                            <option value="termination">Rescisão Trabalhista</option>
                            <option value="reimbursement">Reembolso de Despesas</option>
                            <option value="other">Outros</option>
                        </select>
                    </div>
                    <Input label="Valor (R$)" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
                    <Input label="Beneficiário (Gerente ou Agente)" value={manager} onChange={e => setManager(e.target.value)} placeholder="Nome do colaborador" />
                    <Input label="Período / Descrição" value={period} onChange={e => setPeriod(e.target.value)} placeholder="Ex: Janeiro/2026 ou Adiantamento" />
                </div>
                <div className="flex gap-3 mt-6">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button onClick={handleSave} isLoading={loading} className="flex-1 !bg-green-600 hover:!bg-green-500">Realizar Pagamento</Button>
                </div>
            </div>
        </div>
    );
};
