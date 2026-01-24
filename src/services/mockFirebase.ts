
import {
    User, Student, SalesPerson, SupportAgent, Influencer, TeamUser,
    AppProduct, TrainingModule, Course, CreditCombo, ToolCost,
    LinkRequest, RefundRequest, SupportTicket, ChatMessage,
    TreasureItem, NexusAction, NexusAnalysisResult, NexusDailyReport,
    ToolOptimizationReport, SystemSettings, UsageLimit,
    VerificationRequest, LevelUpRequest, LoginAttemptLog,
    CommissionPayment, SalesScript, ActivityLog, Lead, WhatsAppMessage,
    SystemButtonConfig, SystemVideoConfig, ServiceEmailConfig,
    ProductDNA, CoProducerInfo, SchoolConfig,
    SocialApiIntegration,
    NexusTrendAlert,
    NexusSystemOptimization,
    NexusPlanAnalysis,
    PlanTierConfig,
    CoursePlan,
    WalletBucket,
    WalletTransaction,
    ProductStats,
    ProductPlan,
    CheckoutLink,
    InternalCampaign,
    ChatChannel,
    FinanceRequest,
    ProducerBankData, PaymentRoutingConfig, ProductFinanceStats, ConsultancyReport,
    SystemStatus,
    ProductStatus,
    AccountPayable,
    FinancialAuditTicket,
    InstanceSlot,
    OCRResult,
    CreditRequest,
    ProducerWallet,
    RichTransaction,
    TransactionHistoryLog,
    GratitudeEntry,
    WithdrawalRequest,
    WinningProduct,
    CreditSystemConfig,
    OperationsMetric,
    EscalationTicket
} from '../types/legacy';
import { WinningProductProfile } from '../types/nexus';
import { toast } from 'react-hot-toast';

// --- HELPERS ---
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const loadJSON = <T>(key: string, def: T): T => {
    try {
        const item = localStorage.getItem(key);
        if (!item || item === "undefined") return def;
        const parsed = JSON.parse(item);
        return parsed === null ? def : parsed;
    } catch {
        return def;
    }
};

export const saveJSON = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error("Storage Error", e);
    }
};

export const saveSchoolSettings = async (settings: SchoolConfig) => {
    // In a real app, this would verify uniqueness of subdomain
    const schools = loadJSON<SchoolConfig[]>('mockSchools', []);
    const idx = schools.findIndex(s => s.ownerId === settings.ownerId);
    if (idx !== -1) {
        schools[idx] = { ...schools[idx], ...settings };
    } else {
        schools.push(settings);
    }
    saveJSON('mockSchools', schools);
    return settings;
};

export const getSchoolSettings = async (ownerId: string): Promise<SchoolConfig | null> => {
    const schools = loadJSON<SchoolConfig[]>('mockSchools', []);
    return schools.find(s => s.ownerId === ownerId) || null;
};

// --- INITIAL DATA ---
const initialStudents: Student[] = [
    {
        uid: 'student-test-01',
        email: 'aluno@teste.com',
        displayName: 'Aluno Teste',
        photoURL: '',
        purchaseDate: new Date().toISOString(),
        purchaseValue: 997,
        cpf: '000.000.000-01',
        dailyPosts: 0,
        onboarding: { filled: false },
        completedLessons: [],
        purchasedCourses: ['course-main'],
        quizScores: {},
        productStats: [],
        gamification: { level: 'Iniciante', currentSlots: 3, totalVerifiedPosts: 0 },
        financial: { status: 'approved', paymentMethod: 'credit_card', transactionId: 'tx-test-01', refundRequested: false },
        role: 'student',
        hasMestreIA: true,
        dailyMestreIALimit: 50,
        password: '123456',
        nexusActionPlan: [],
        incomeHistory: [],
        creditBalance: 50,
        walletBuckets: [],
        walletTransactions: [],
        firstLogin: new Date().toISOString(),
        lastLoginIp: '127.0.0.1',
        deviceInfo: 'Desktop (Chrome)'
    } as any
];

const initialUsers: any[] = []; // Define as empty or combined list for compatibility

const initialTeamUsers: TeamUser[] = [
    {
        id: 'admin-paulo',
        name: 'Paulo',
        email: 'paulo@mestrenosnegocios.com',
        role: 'super_admin',
        status: 'active',
        lastLogin: Date.now(),
        permissions: { all: true },
        photoURL: '',
        password: 'inFInit2018&$@'
    },
    {
        id: 'admin-thales',
        name: 'Thales',
        email: 'thales@mestrenosnegocios.com',
        role: 'super_admin',
        status: 'active',
        lastLogin: Date.now(),
        permissions: { all: true },
        photoURL: '',
        password: 'inFInit2018&$@'
    },
    {
        id: 'admin-ana',
        name: 'Ana Clara',
        email: 'ana@mestredosnegocios.com',
        role: 'super_admin',
        status: 'active',
        lastLogin: Date.now(),
        permissions: { all: true },
        photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        password: 'inFInit2018&$@'
    },
    {
        id: 'finance-demo',
        name: 'Financeiro Demo',
        email: 'financeiro@mestredosnegocios.com',
        role: 'finance',
        status: 'active',
        lastLogin: Date.now(),
        permissions: {
            approveLinks: true, chatSupport: true, viewFinance: true,
            sendNotifications: true, blockStudents: false, manageTeam: false,
            viewSensitiveData: true, recoverAccess: false
        },
        photoURL: ''
    }
];

const initialSystemStatus: SystemStatus = {
    apiReady: true,
    lastSync: Date.now(),
    maintenance: false,
    activeNodes: 4,
    queueCount: 0,
    healthScore: 100,
    creditValueBRL: 0.15
};

const initialSupportAgents: SupportAgent[] = [
    {
        uid: 'support-15x',
        email: 'suporte@15x.br',
        displayName: 'Suporte 15x',
        role: 'support_agent',
        status: 'online',
        ticketsResolved: 0,
        npsScore: 5,
        activeTickets: 0,
        permissions: {
            approveLinks: true, chatSupport: true, viewFinance: false,
            sendNotifications: true, blockStudents: false, manageTeam: false,
            viewSensitiveData: false, recoverAccess: true
        },
        photoURL: ''
    }
];

const initialInfluencers: Influencer[] = [
    {
        uid: 'infl-test',
        displayName: 'Influencer Teste',
        email: 'influencer@teste.com',
        cpf: '123.456.789-00',
        phone: '11999999999',
        photoURL: '',
        slug: 'influencer-teste',
        status: 'active',
        totalEarnings: 0,
        availableBalance: 0,
        role: 'influencer',
        products: []
    }
];

const initialSalesTeam: SalesPerson[] = [
    {
        uid: 'sales-pedro',
        email: 'pedro@comercial.15x.br',
        displayName: 'Pedro Comercial',
        photoURL: '',
        role: 'sales_agent',
        status: 'online',
        registrationCompleted: true,
        dailyGoal: 1000,
        salesToday: 0,
        revenueToday: 0,
        leadsAttended: 0,
        averageResponseTime: 0,
        commissions: [],
        phone: '11988888888'
    }
];

// Added missing initialPaymentRouting constant
const initialPaymentRouting = {
    active: true,
    pixGateway: 'InfinitePay',
    cardGateway: 'Stripe',
    customGateway: 'Stripe',
    boletoGateway: 'Asaas',
    internationalGateway: 'Stripe'
};

// --- SHARED STATE ---
export const mockSystemStatus: SystemStatus = loadJSON('system_status', initialSystemStatus);
export const mockStudents: Student[] = loadJSON('mockStudents', initialStudents);
export const mockSalesTeam: SalesPerson[] = loadJSON('mockSalesTeam', initialSalesTeam);
export const mockSupportAgents: SupportAgent[] = loadJSON('mockSupportAgents', initialSupportAgents);
export const mockInfluencers: Influencer[] = loadJSON('mockInfluencers', initialInfluencers);
export const mockTeamUsers: TeamUser[] = loadJSON('mockTeamUsers', initialTeamUsers);
export const mockLeads: Lead[] = loadJSON('mockLeads', []);

const initialWhiteLabelConfig = {
    platformBaseFee: 15.00,
    creditCommissionRate: 5.0, // 5% default
    tools: [
        { id: 'mestre_dos_negocios', name: 'Consultor de Negócios', setupFee: 0, monthlyCost: 0, dilutedMarkup: 0 },
        { id: 'marketing_pack', name: 'Pack Marketing 360º', setupFee: 1500, monthlyCost: 297, dilutedMarkup: 20 },
        { id: 'page_builder', name: 'Construtor de Páginas', setupFee: 0, monthlyCost: 49, dilutedMarkup: 0 },
        { id: 'whatsapp_evolution', name: 'WhatsApp Evolution', setupFee: 0, monthlyCost: 97, dilutedMarkup: 0 }
    ]
};

const initialAccountsPayable: AccountPayable[] = [
    {
        id: 'ap-1',
        description: 'Aluguel Escritório',
        amount: 5000.00,
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        category: 'Infraestrutura',
        type: 'fixed',
        status: 'pending',
        createdAt: new Date().toISOString()
    },
    {
        id: 'ap-2',
        description: 'Servidores Google Cloud',
        amount: 1200.50,
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        category: 'Tecnologia',
        type: 'variable',
        status: 'pending',
        createdAt: new Date().toISOString()
    }
];

const initialFinancialAudits: FinancialAuditTicket[] = [
    {
        id: 'audit-1',
        paymentId: 'pay-001',
        paymentType: 'commission',
        agentId: 'sales-pedro',
        agentName: 'Pedro Comercial',
        status: 'open',
        issueDescription: 'Divergência de valores no recibo OCR.',
        adminNotes: ['Valor no recibo parece ser de um período anterior.'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export const mockAccountsPayable: AccountPayable[] = loadJSON('mockAccountsPayable', initialAccountsPayable);
export const mockFinancialAudits: FinancialAuditTicket[] = loadJSON('mockFinancialAudits', initialFinancialAudits);
const initialTickets: SupportTicket[] = [
    {
        id: 't-demo-01',
        studentId: 'student-test-01',
        studentName: 'Aluno Exemplo',
        subject: 'Dúvida sobre Módulo Financeiro',
        status: 'open',
        priority: 'medium',
        createdAt: Date.now() - 3600000,
        lastMessageAt: Date.now() - 3600000,
        messages: [
            {
                id: 'm-01',
                channelId: 't-demo-01',
                text: 'Olá, estou com dúvida na aula de Precificação. Como calculo a margem de lucro real?',
                createdAt: Date.now() - 3600000,
                user: { uid: 'student-test-01', name: 'Aluno Exemplo', avatar: '', role: 'student' }
            }
        ],
        unreadCount: 1
    },
    {
        id: 't-escalated-01',
        studentId: 'student-escalated-01',
        studentName: 'Roberto (Exemplo Escalado)',
        subject: 'Problema Crítico de Acesso',
        status: 'open',
        priority: 'high',
        createdAt: Date.now() - 7200000,
        lastMessageAt: Date.now(),
        isEscalated: true,
        messages: [
            {
                id: 'm-esc-01',
                channelId: 't-escalated-01',
                text: 'Este aluno está reportando erro 500 recorrente. Já tentei o básico. Repassando para o produtor.',
                createdAt: Date.now(),
                user: { uid: 'agent-01', name: 'Agente Suporte', avatar: '', role: 'support_agent' }
            }
        ],
        unreadCount: 1
    },
    {
        id: 't-refund-demo',
        studentId: 'student-test-01',
        studentName: 'ALUNO REEMBOLSO (PEDIDO)',
        subject: 'SOLICITAÇÃO DE REEMBOLSO',
        status: 'open',
        priority: 'high',
        createdAt: Date.now() - 3600000,
        lastMessageAt: Date.now() - 3600000,
        messages: [
            {
                id: 'm-refund-01',
                channelId: 't-refund-demo',
                text: 'Quero meu dinheiro de volta. Não tive tempo de ver as aulas e desisti do curso.',
                createdAt: Date.now() - 3600000,
                user: { uid: 'student-test-01', name: 'Aluno Teste', avatar: '', role: 'student' }
            }
        ],
        unreadCount: 1
    }
];

// This variable is no longer needed as we'll handle it in the getter
// export const mockSupportTickets = ...

// Refund Reversal Logic
export const sendRefundReversalLink = async (studentId: string) => {
    await delay(1000);
    const students = loadJSON<Student[]>('mockStudents', []);
    const idx = students.findIndex(s => s.uid === studentId);
    if (idx !== -1) {
        // Mock sending to WhatsApp/Email
        console.log(`[Nexus] Link de desistência enviado para ${students[idx].email}`);
        await createAuditLog('system', 'REFUND_REVERSAL_LINK', 'medium', `Link de desistência enviado para ${students[idx].email}`, { studentId, email: students[idx].email });
        toast.success("Link de desistência enviado via WhatsApp e E-mail!", { icon: '🔗' });
        return true;
    }
    return false;
};
export const mockAppProducts: AppProduct[] = loadJSON('mockAppProducts', []);
export const mockUsageLimit: UsageLimit = loadJSON('usage_limits', { monthly_limit: 1000, current_usage: 0, emergency_stop: false, last_reset: new Date().toISOString() });

// --- EXPORTED FUNCTIONS ---

// Added missing getAdminIntegrations function
export const getAdminIntegrations = async (type: string) => {
    await delay(200);
    return loadJSON<any[]>(`mockIntegrations_${type}`, []);
};

// Added missing saveAdminIntegration function
export const saveAdminIntegration = async (type: string, data: any) => {
    const list = await getAdminIntegrations(type);
    const idx = list.findIndex(x => x.id === data.id);
    if (idx !== -1) list[idx] = data;
    else list.push(data);
    saveJSON(`mockIntegrations_${type}`, list);
};

// Added missing deleteAdminIntegration function
export const deleteAdminIntegration = async (type: string, id: any) => {
    const list = await getAdminIntegrations(type);
    saveJSON(`mockIntegrations_${type}`, list.filter(x => x.id !== id));
};

export const getSystemStatus = async (): Promise<SystemStatus> => {
    return loadJSON('system_status', initialSystemStatus);
};

export const updateSystemStatus = async (updates: Partial<SystemStatus>) => {
    const current = await getSystemStatus();
    const updated = { ...current, ...updates };
    saveJSON('system_status', updated);
    return updated;
};

// Added missing maskUserData function
export const maskUserData = (user: Student): Partial<Student> => {
    const masked = { ...user };
    if (masked.email) {
        const parts = masked.email.split('@');
        if (parts.length === 2) {
            masked.email = `${parts[0].substring(0, 1)}***@${parts[1]}`;
        }
    }
    if (masked.cpf) {
        masked.cpf = `***.***.${masked.cpf.slice(-5)}`;
    }
    if (masked.phone) {
        masked.phone = `(XX) XXXXX-${masked.phone.slice(-4)}`;
    }
    return masked;
};

export const getStudents = async () => mockStudents;
export const getSalesTeam = async () => mockSalesTeam;
export const getInfluencers = async () => mockInfluencers;
export const getTeamUsers = async () => mockTeamUsers;
export const getLeads = async () => mockLeads;

export const getAllStaff = async () => {
    const staff = [
        ...mockTeamUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: 'Admin', photoURL: u.photoURL, status: 'online', unreadCount: u.unreadCount || 0 })),
        ...mockSupportAgents.map(u => ({ id: u.uid, name: u.displayName, email: u.email, role: 'Suporte', photoURL: u.photoURL, status: 'online', unreadCount: u.unreadCount || 0 })),
        ...mockSalesTeam.map(u => ({ id: u.uid, name: u.displayName, email: u.email, role: 'Comercial', photoURL: u.photoURL, status: 'online', unreadCount: u.unreadCount || 0 }))
    ];
    return staff;
};

export const getPendingPartnerRequests = async () => {
    await delay(300);
    return mockInfluencers.filter(i => i.status === 'pending');
};

export const updatePartnerRequestStatus = async (uid: string, status: 'active' | 'blocked') => {
    await delay(500);
    const idx = mockInfluencers.findIndex(i => i.uid === uid);
    if (idx !== -1) {
        mockInfluencers[idx].status = status;
        saveJSON('mockInfluencers', mockInfluencers);
        return true;
    }
    return false;
};

export const getAllUsersFlat = async () => {
    await delay(300);
    const students = mockStudents.map(s => ({ ...s, type: 'Aluno', role: 'student' }));
    const sales = mockSalesTeam.map(s => ({ ...s, type: 'Vendedor', role: 'sales_agent' }));
    // CRITICAL FIX: Preserve original role instead of overriding to 'influencer'
    const influencers = mockInfluencers.map(i => ({
        ...i,
        type: i.role === 'affiliate' ? 'Afiliado' : i.role === 'coproducer' ? 'Co-Produtor' : 'Influencer',
        role: i.role || 'influencer' // Preserves original role (affiliate/coproducer/influencer)
    }));
    const support = mockSupportAgents.map(a => ({ ...a, type: 'Suporte', role: 'support_agent' }));

    return [...students, ...sales, ...influencers, ...support];
};

export const signOut = async () => { await delay(300); };
export const signInWithGoogle = async () => {
    const user = mockStudents[0];
    logLogin(user.uid, user.email || 'unknown', 'success', '127.0.0.1');
    return user;
};

export const createAccountAfterPurchase = async (details: any) => {
    const newStudent = { ...initialStudents[0], uid: `student-${Date.now()}`, ...details };
    mockStudents.push(newStudent);
    saveJSON('mockStudents', mockStudents);
    logLogin(newStudent.uid, newStudent.email, 'success', '127.0.0.1', 'Novo Cadastro');
    return newStudent;
};

export const supportSignIn = async (email: string, pass: string) => {
    const agent = mockSupportAgents.find(a => a.email === email);
    if (agent) {
        logLogin(agent.uid, email, 'success', '127.0.0.1');
        return agent;
    }
    logLogin('unknown', email, 'failed', '127.0.0.1', 'Credenciais Inválidas');
    return undefined;
};

export const salesSignIn = async (email: string, pass: string) => {
    const agent = mockSalesTeam.find(s => s.email === email);
    if (agent) {
        logLogin(agent.uid, email, 'success', '127.0.0.1');
        return agent;
    }
    logLogin('unknown', email, 'failed', '127.0.0.1', 'Credenciais Inválidas');
    return undefined;
};

export const influencerSignIn = async (email: string, pass: string) => {
    await delay(500);
    const inf = mockInfluencers.find(i => i.email === email);
    if (!inf) {
        logLogin('unknown', email, 'failed', '127.0.0.1', 'Usuário não encontrado');
        return undefined;
    }
    if (inf.status === 'pending') {
        logLogin(inf.uid, email, 'blocked', '127.0.0.1', 'Conta Pendente');
        throw new Error('STATUS_PENDING');
    }
    logLogin(inf.uid, email, 'success', '127.0.0.1');
    return inf;
};

export const updateStudent = async (uid: string, data: Partial<Student>) => {
    const idx = mockStudents.findIndex(s => s.uid === uid);
    if (idx !== -1) {
        mockStudents[idx] = { ...mockStudents[idx], ...data };
        saveJSON('mockStudents', mockStudents);
    }
};

export const updateSalesPerson = async (id: string, data: any) => {
    const idx = mockSalesTeam.findIndex(s => s.uid === id);
    if (idx !== -1) {
        mockSalesTeam[idx] = { ...mockSalesTeam[idx], ...data };
        saveJSON('mockSalesTeam', mockSalesTeam);
    }
};



export const updateInfluencer = async (id: string, data: any) => {
    const idx = mockInfluencers.findIndex(i => i.uid === id);
    if (idx !== -1) {
        mockInfluencers[idx] = { ...mockInfluencers[idx], ...data };
        saveJSON('mockInfluencers', mockInfluencers);
    }
};

export const updateTeamUser = async (id: string, data: Partial<TeamUser>) => {
    const idx = mockTeamUsers.findIndex(u => u.id === id);
    if (idx !== -1) {
        mockTeamUsers[idx] = { ...mockTeamUsers[idx], ...data };
        saveJSON('mockTeamUsers', mockTeamUsers);
    }
};

export const createTeamUser = async (user: any) => {
    const newUser = { ...user, id: `team-${Date.now()}` };
    mockTeamUsers.push(newUser);
    saveJSON('mockTeamUsers', mockTeamUsers);
    return newUser;
};

export const updateSupportAgent = async (id: string, data: any) => {
    const idx = mockSupportAgents.findIndex(a => a.uid === id);
    if (idx !== -1) {
        mockSupportAgents[idx] = { ...mockSupportAgents[idx], ...data };
        saveJSON('mockSupportAgents', mockSupportAgents);
    }
};

export const createInfluencerRequest = async (data: any) => {
    const influencers = await getInfluencers();
    if (influencers.some(i => i.email === data.email)) throw new Error("Email já cadastrado");

    const newInfluencer = {
        uid: `inf-${Date.now()}`,
        ...data,
        status: 'pending',
        totalEarnings: 0,
        availableBalance: 0,
        products: [],
        role: 'influencer'
    };
    influencers.push(newInfluencer);
    saveJSON('mockInfluencers', influencers);
    return newInfluencer;
};

export const trackPageVisit = (page: string) => { console.log(`Visited: ${page}`); };



export const submitDailyProductStats = async (uid: string, product: string, count: number) => {
    const student = mockStudents.find(s => s.uid === uid);
    if (student) {
        let stats = student.productStats.find(p => p.productName === product);
        if (!stats) {
            stats = { productId: `p-${Date.now()}`, productName: product, totalPosts: 0, lastCheckIn: '', status: 'active', history: [] };
            student.productStats.push(stats);
        }
        stats.totalPosts += count;
        stats.lastCheckIn = new Date().toISOString();
        saveJSON('mockStudents', mockStudents);
    }
};

export const submitFinancialResult = async (uid: string, amount: number, source: string, validationType: string, description: string) => {
    const student = mockStudents.find(s => s.uid === uid);
    if (student) {
        if (!student.incomeHistory) student.incomeHistory = [];
        student.incomeHistory.push({
            id: `inc-${Date.now()}`,
            amount,
            date: new Date().toISOString(),
            source,
            validationType,
            description
        } as any);
        saveJSON('mockStudents', mockStudents);
        await createAuditLog('system', 'MANUAL_INCOME_ADDED', 'high', `Receita manual de R$ ${amount} adicionada para ${uid}`, { uid, amount, source, description });
    }
};

export interface AuditLogEntry {
    id: string;
    agentId: string;
    action: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: string;
    timestamp: number;
    metadata?: any;
}

export const createAuditLog = async (agentId: string, action: string, severity: 'low' | 'medium' | 'high' | 'critical', details: string, metadata?: any) => {
    const logs = loadJSON<AuditLogEntry[]>('mockAuditLogs', []);
    const newLog = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        agentId,
        action,
        severity,
        details,
        timestamp: Date.now(),
        metadata
    };
    logs.push(newLog);
    saveJSON('mockAuditLogs', logs);
    console.warn(`[SECURITY AUDIT] ${severity.toUpperCase()} - ${action}: ${details}`);
    return newLog;
};

// Maps internal AuditLogEntry to the UI's ActivityLog interface
export const getAuditLogs = async (): Promise<ActivityLog[]> => {
    await delay(300);
    const logs = loadJSON<AuditLogEntry[]>('mockAuditLogs', []);
    const staff = await getAllStaff(); // Helper to map names

    return logs.map(log => {
        const agent = staff.find(u => u.id === log.agentId) || { name: 'Sistema / Desconhecido', role: 'system' };
        return {
            id: log.id,
            userId: log.agentId,
            userName: agent.name || 'Usuário Removido',
            userRole: agent.role || 'Desconhecido',
            action: log.action,
            target: log.details, // Short description
            timestamp: log.timestamp,
            ipAddress: '127.0.0.1', // Mock IP
            severity: log.severity as any,
            details: JSON.stringify(log.metadata || {}, null, 2), // Detailed JSON
            metadata: log.metadata
        };
    }).sort((a, b) => b.timestamp - a.timestamp);
};

// --- LOGIN LOGGING ---

export const logLogin = async (userId: string, email: string, status: 'success' | 'failed' | 'blocked', ip: string, details?: string) => {
    const logs = loadJSON<LoginAttemptLog[]>('mockLoginLogs', []);
    logs.push({
        id: `login-${Date.now()}`,
        userId,
        email,
        status,
        success: status === 'success',
        ip,
        ipAddress: ip,
        device: 'Desktop (Chrome Windows)',
        userAgent: 'Desktop (Chrome Windows)',
        date: Date.now(),
        timestamp: Date.now()
    });
    saveJSON('mockLoginLogs', logs);

    // If critical failure, also log to Audit
    if (status === 'blocked') {
        createAuditLog(userId || 'unknown', 'LOGIN_BLOCKED', 'high', `Tentativa de login bloqueada para ${email}. Motivo: ${details || 'N/A'}`);
    }
};

export const getLoginLogs = async () => {
    await delay(300);
    return loadJSON<LoginAttemptLog[]>('mockLoginLogs', []).sort((a, b) => (b.timestamp || b.date || 0) - (a.timestamp || a.date || 0));
};

export const flagAgentProfile = async (agentId: string, reason: string) => {
    // In a real app this would lock the user account or notify admins
    console.error(`[SECURITY FLAGGED] Agent ${agentId} flagged for: ${reason}`);
    toast.error(`ALERTA DE SEGURANÇA: Sua conta foi sinalizada por comportamento suspeito.`, { duration: 5000 });
};

export const getCourses = async () => loadJSON<Course[]>('mockCourses', []);
export const getCoursesByIds = async (ids: string[]) => {
    const all = await getCourses();
    return all.filter(c => ids.includes(c.id));
};
export const saveCourse = async (c: Course) => {
    const list = await getCourses();
    const idx = list.findIndex(x => x.id === c.id);
    if (idx !== -1) list[idx] = c;
    else list.push(c);
    saveJSON('mockCourses', list);
};
export const deleteCourse = async (id: string) => {
    const list = await getCourses();
    saveJSON('mockCourses', list.filter(c => c.id !== id));
};

export const getTrainingModules = async () => loadJSON<TrainingModule[]>('mockModules', []);
export const updateTrainingData = async (m: TrainingModule[]) => saveJSON('mockModules', m);
export const saveLessonProgress = async (studentId: string, lessonId: string, score?: number) => {
    const s = mockStudents.find(x => x.uid === studentId);
    if (s) {
        if (!s.completedLessons.includes(lessonId)) s.completedLessons.push(lessonId);
        if (score !== undefined) s.quizScores[lessonId] = score;
        saveJSON('mockStudents', mockStudents);
    }
};

export const getAppProducts = async () => loadJSON<AppProduct[]>('mockAppProducts', []);

/**
 * Função de Publicação de Produto com Validação de Regras de Negócio
 */
export const publishProduct = async (product: AppProduct) => {
    // 1. Validação de Dados Básicos
    if (!product.name || !product.plans || product.plans.length === 0) {
        throw new Error("Produto inválido: Nome e pelo menos um plano são obrigatórios.");
    }

    // 2. Determinação de Status Inicial
    // Se o DNA não foi gerado ou validado, o produto nasce como 'development' ou 'pending'
    let initialStatus: ProductStatus = product.status;

    if (initialStatus === 'active') {
        if (!product.dna || product.dna.alignmentScore < 50) {
            initialStatus = 'pending'; // Força pendente se DNA fraco ou inexistente
            console.warn("[Nexus] Produto rebaixado para Pending devido a falta de DNA.");
        }
    }

    const finalProduct: AppProduct = {
        ...product,
        status: initialStatus
    };

    // 3. Persistência
    await saveAppProduct(finalProduct);
    return finalProduct;
};

/**
 * Função de Ativação via Nexus (Validação de Infraestrutura)
 */
export const activateProductViaNexus = async (productId: string) => {
    const list = await getAppProducts();
    const product = list.find(p => p.id === productId);

    if (!product) throw new Error("Produto não encontrado.");

    // Simulação de verificação de infraestrutura (Pixel, Domínio)
    // Em produção, isso bateria em APIs reais.

    // Atualiza status para Active
    const updatedProduct = {
        ...product,
        status: 'active' as ProductStatus
    };

    await saveAppProduct(updatedProduct);
    return updatedProduct;
};

export const saveAppProduct = async (p: AppProduct) => {
    const list = await getAppProducts();
    const idx = list.findIndex(x => x.id === p.id);
    if (idx !== -1) list[idx] = p;
    else list.push(p);
    saveJSON('mockAppProducts', list);
};

export const createProduct = async (p: any) => {
    const list = await getAppProducts();
    list.push({ ...p, id: `p-${Date.now()}` });
    saveJSON('mockAppProducts', list);
};

export const updateProductDNA = async (id: string, dna: ProductDNA) => {
    const list = await getAppProducts();
    const p = list.find(x => x.id === id);
    if (p) {
        p.dna = dna;
        saveJSON('mockAppProducts', list);
    }
};

export const getProductDNA = async (productName: string) => {
    await delay(500);
    // Mock DNA extraction/retrieval based on product name
    return {
        product: productName,
        goldenQuestions: [
            { q: "O Que É?", a: "Método completo de aceleração de negócios digitais." },
            { q: "Para Quem?", a: "Empreendedores travados nos 10k/mês." },
            { q: "Mecanismo Único", a: "Engenharia Reversa de Funis Americanos." },
            { q: "Promessa", a: "Escalar para 100k em 6 meses ou dinheiro de volta." }
        ],
        objections: [
            { obj: "Não tenho dinheiro", handler: "Parcelamento inteligente em 24x no boleto." },
            { obj: "Não tenho tempo", handler: "Apenas 30min por dia aplicados." },
            { obj: "Funciona pra mim?", handler: "Temos cases em +40 nichos diferentes." }
        ]
    };
};

export const getChannels = async () => loadJSON<ChatChannel[]>('mockChatChannels', []);

export const listenToMessages = (channelId: string, cb: (msgs: ChatMessage[]) => void) => {
    const allMessages = loadJSON<Record<string, ChatMessage[]>>('mockChatMessages', {});
    const roomMessages = allMessages[channelId] || [];
    cb(roomMessages);

    const interval = setInterval(() => {
        const updatedMessages = loadJSON<Record<string, ChatMessage[]>>('mockChatMessages', {});
        cb(updatedMessages[channelId] || []);
    }, 2000);

    return () => clearInterval(interval);
};

export const markChannelAsRead = (channelId: string) => {
    const channels = loadJSON<ChatChannel[]>('mockChatChannels', []);
    const idx = channels.findIndex(c => c.id === channelId);
    if (idx !== -1) {
        channels[idx].unreadCount = 0;
        saveJSON('mockChatChannels', channels);
    }
};

export const sendMessage = async (text: string, user: User, channelId: string, attachmentUrl?: string, messageType: 'text' | 'image' | 'file' = 'text') => {
    const allMessages = loadJSON<Record<string, ChatMessage[]>>('mockChatMessages', {});
    if (!allMessages[channelId]) allMessages[channelId] = [];

    const msg: ChatMessage = {
        id: `cmsg-${Date.now()}`,
        channelId,
        text,
        createdAt: Date.now(),
        user: {
            uid: user.uid,
            name: user.displayName || 'Usuário',
            avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.email}`,
            role: user.role
        },
        attachmentUrl,
        messageType
    };

    allMessages[channelId].push(msg);
    saveJSON('mockChatMessages', allMessages);
};

export const deleteMessage = async (channelId: string, messageId: string) => {
    const allMessages = loadJSON<Record<string, ChatMessage[]>>('mockChatMessages', {});
    if (allMessages[channelId]) {
        allMessages[channelId] = allMessages[channelId].filter(m => m.id !== messageId);
        saveJSON('mockChatMessages', allMessages);
    }
};

export const saveChannel = async (channel: ChatChannel) => {
    const channels = await getChannels();
    const idx = channels.findIndex(c => c.id === channel.id);
    if (idx !== -1) {
        channels[idx] = channel;
    } else {
        channels.push(channel);
    }
    saveJSON('mockChatChannels', channels);
    return channel;
};

export const deleteChannel = async (channelId: string) => {
    const channels = await getChannels();
    const filtered = channels.filter(c => String(c.id) !== String(channelId));

    if (channels.length === filtered.length) {
        console.warn(`Channel with ID ${channelId} not found for deletion.`);
    }

    saveJSON('mockChatChannels', filtered);

    // Also cleanup messages
    const allMessages = loadJSON<Record<string, ChatMessage[]>>('mockChatMessages', {});
    delete allMessages[channelId];
    saveJSON('mockChatMessages', allMessages);
};

export const addModeratorToChannel = async (channelId: string, userId: string) => {
    const channels = await getChannels();
    const idx = channels.findIndex(c => c.id === channelId);
    if (idx !== -1) {
        const moderators = channels[idx].moderators || [];
        if (!moderators.includes(userId)) {
            channels[idx].moderators = [...moderators, userId];
            saveJSON('mockChatChannels', channels);
        }
    }
};

export const removeModeratorFromChannel = async (channelId: string, userId: string) => {
    const channels = await getChannels();
    const idx = channels.findIndex(c => c.id === channelId);
    if (idx !== -1) {
        const moderators = channels[idx].moderators || [];
        channels[idx].moderators = moderators.filter(id => id !== userId);
        saveJSON('mockChatChannels', channels);
    }
};

export const getSupportTickets = async () => {
    const list = loadJSON<SupportTicket[]>('mockSupportTickets', initialTickets);
    // Force inject the refund demo if missing
    if (!list.some(t => t.id === 't-refund-demo')) {
        const demo = initialTickets.find(t => t.id === 't-refund-demo');
        if (demo) list.unshift(demo); // Put it at the top
        saveJSON('mockSupportTickets', list);
    }
    return list;
};

export const listenToSupportMessages = (uid: string, cb: any) => {
    getSupportTickets().then(tickets => {
        const ticket = tickets.find(t => t.studentId === uid && t.status !== 'resolved');
        cb({ messages: ticket?.messages || [], status: ticket?.status || 'open', nps: ticket?.nps });
    });
    return () => { };
};

export const startNewSupportSession = async (uid: string) => {
    const tickets = loadJSON<SupportTicket[]>('mockSupportTickets', []);
    tickets.filter(t => t.studentId === uid).forEach(t => t.status = 'resolved');
    saveJSON('mockSupportTickets', tickets);
};

export const rateSupportThread = async (uid: string, s: number, c: string) => {
    const tickets = loadJSON<SupportTicket[]>('mockSupportTickets', []);
    const ticket = tickets.find(t => t.studentId === uid && t.status === 'resolved' && !t.nps);
    if (ticket) {
        ticket.nps = { score: s, comment: c, date: Date.now() };
        saveJSON('mockSupportTickets', tickets);
    }
};

export const getSupportHistory = async (uid: string) => {
    const tickets = loadJSON<SupportTicket[]>('mockSupportTickets', []);
    return tickets.filter(t => t.studentId === uid).map(t => ({
        id: t.id, date: t.createdAt, summary: t.subject, status: t.status === 'resolved' ? 'Resolvido' : 'Em Aberto', pendingRating: t.status === 'resolved' && !t.nps
    }));
};

export const getSessionMessages = async (id: string) => {
    const tickets = loadJSON<SupportTicket[]>('mockSupportTickets', []);
    return tickets.find(t => t.id === id)?.messages || [];
};

export const confirmTicketClosure = async (uid: string, c: boolean) => {
    const tickets = loadJSON<SupportTicket[]>('mockSupportTickets', []);
    const ticket = tickets.find(t => t.studentId === uid && t.status === 'pending_closure');
    if (ticket) {
        ticket.status = c ? 'resolved' : 'in_progress';
        saveJSON('mockSupportTickets', tickets);
    }
};

export const listenToAllSupportThreads = (cb: (tickets: SupportTicket[]) => void) => {
    getSupportTickets().then(cb);
    return () => { };
};

export const sendSupportMessage = async (text: string, user: User, role: string, url?: string, type?: any) => {
    const tickets = await getSupportTickets();
    let ticket = tickets.find(t => t.studentId === user.uid && t.status !== 'resolved');
    if (!ticket) {
        ticket = { id: `t-${Date.now()}`, studentId: user.uid, studentName: user.displayName || 'Aluno', subject: 'Suporte', status: 'open', priority: 'low', createdAt: Date.now(), lastMessageAt: Date.now(), messages: [] };
        tickets.push(ticket);
    }
    ticket.messages.push({ id: `m-${Date.now()}`, text, user: { uid: user.uid, name: user.displayName || 'User', avatar: user.photoURL || '', role: role as any }, createdAt: Date.now(), channelId: ticket.id, attachmentUrl: url, messageType: type });
    ticket.unreadCount = (ticket.unreadCount || 0) + 1;
    saveJSON('mockSupportTickets', tickets);
};

export const resolveTicket = async (id: string) => {
    const tickets = await getSupportTickets();
    const t = tickets.find(x => x.id === id);
    if (t) { t.status = 'resolved'; saveJSON('mockSupportTickets', tickets); }
};

export const markTicketAsRead = async (id: string) => {
    const tickets = await getSupportTickets();
    const t = tickets.find(x => x.id === id);
    if (t) { t.unreadCount = 0; saveJSON('mockSupportTickets', tickets); }
};

export const sendTicketMessage = async (ticketId: string, text: string, user: any, url?: string, type?: 'text' | 'image' | 'file', isInternal?: boolean) => {
    const tickets = await getSupportTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
        ticket.messages.push({
            id: `m-${Date.now()}`,
            text,
            user: { uid: user.uid, name: user.displayName, avatar: user.photoURL, role: user.role },
            createdAt: Date.now(),
            channelId: ticket.id,
            attachmentUrl: url,
            messageType: type,
            isInternal
        });
        ticket.lastMessageAt = Date.now();

        // If it's a student message, and status is open, move to in_progress
        if (user.role === 'student' && ticket.status === 'open') {
            ticket.status = 'in_progress';
        }

        saveJSON('mockSupportTickets', tickets);
    }
};



export const getLinkRequests = async () => loadJSON<LinkRequest[]>('mockLinkRequests', []);
export const updateLinkRequest = async (id: string, data: any) => {
    const reqs = await getLinkRequests();
    const idx = reqs.findIndex(r => r.id === id);
    if (idx !== -1) { reqs[idx] = { ...reqs[idx], ...data }; saveJSON('mockLinkRequests', reqs); }
};
export const approveLinkRequestAndEnableProduct = async (id: string, link: string) => updateLinkRequest(id, { status: 'approved', affiliateLink: link });

export const getRefundRequests = async () => loadJSON<RefundRequest[]>('mockRefundRequests', []);
export const createRefundRequest = async (user: User) => {
    const reqs = await getRefundRequests();
    reqs.push({
        id: `ref-${Date.now()}`,
        studentId: user.uid,
        studentName: user.displayName || '',
        studentEmail: user.email || '',
        userId: user.uid,
        userName: user.displayName || '',
        userEmail: user.email || '',
        productName: 'Produto Mock',
        purchaseDate: Date.now(),
        requestDate: Date.now(),
        amount: 0,
        reason: 'Solicitado',
        status: 'pending_support',
        warrantyDeadline: Date.now() + (7 * 24 * 60 * 60 * 1000),
        retentionDeadline: Date.now() + (2 * 24 * 60 * 60 * 1000)
    });
    saveJSON('mockRefundRequests', reqs);
};
export const updateRefundRequest = async (id: string, data: any) => {
    const reqs = await getRefundRequests();
    const idx = reqs.findIndex(r => r.id === id);
    if (idx !== -1) { reqs[idx] = { ...reqs[idx], ...data }; saveJSON('mockRefundRequests', reqs); }
};

export const getVerificationQueue = async () => loadJSON<VerificationRequest[]>('mockVerificationRequests', []);
export const getLevelUpQueue = async () => loadJSON<LevelUpRequest[]>('mockLevelUpRequests', []);

export const getCommissionPayments = async () => loadJSON<CommissionPayment[]>('mockCommissionPayments', []);

export const listenToTeamChat = (u1: string, u2: string, cb: any) => {
    const roomKey = [u1, u2].sort().join('_');
    const update = () => {
        const chats = loadJSON<Record<string, ChatMessage[]>>('mockTeamChats', {});
        cb(chats[roomKey] || []);
    };
    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
};

export const markTeamChatAsRead = (meUid: string, contactUid: string) => {
    const staffAll = [...mockTeamUsers, ...mockSupportAgents, ...mockSalesTeam];
    const userIdx = staffAll.findIndex(u => (u as any).id === meUid || (u as any).uid === meUid);
    if (userIdx !== -1) {
        (staffAll[userIdx] as any).unreadCount = 0;
    }
};

export const sendTeamMessage = async (text: string, user: User, targetId: string, url?: string, type?: string) => {
    const chats = loadJSON<Record<string, ChatMessage[]>>('mockTeamChats', {});
    const roomKey = [user.uid, targetId].sort().join('_');
    if (!chats[roomKey]) chats[roomKey] = [];
    const msg: ChatMessage = {
        id: `tmsg-${Date.now()}`,
        channelId: roomKey,
        text,
        createdAt: Date.now(),
        user: { uid: user.uid, name: user.displayName || 'Staff', avatar: user.photoURL || '', role: user.role },
        attachmentUrl: url,
        messageType: (type as any) || 'text'
    };
    chats[roomKey].push(msg);
    saveJSON('mockTeamChats', chats);
};



// --- DEFAULT SYSTEM COSTS (Fallback) ---
// Note: If costPerTask is 0, it is free. calculated dynamically if missing.
const ADMIN_MARGIN = 0.30; // 30% Safety Margin

const DEFAULT_TOOL_COSTS: ToolCost[] = [
    // Mestre IA
    { toolId: 'mestre_dos_negocios', toolName: 'Consultor de Negócios', costPerTask: 0.10, realCostEstimate: 0.02, complexity: 'low' },
    { toolId: 'vendas_hoje', toolName: 'Campanhas Vendas Hoje', costPerTask: 0.15, realCostEstimate: 0.03, complexity: 'medium' },
    { toolId: 'gerador_logomarcas', toolName: 'Gerador de Logos', costPerTask: 0.80, realCostEstimate: 0.40, complexity: 'high' },
    { toolId: 'criativos_arts', toolName: 'Criador de Artes', costPerTask: 0.50, realCostEstimate: 0.15, complexity: 'medium' },
    { toolId: 'ugc_viral_scripts', toolName: 'Roteiros UGC Viral', costPerTask: 0.10, realCostEstimate: 0.01, complexity: 'low' },
    { toolId: 'copy_generator', toolName: 'Gerador de Copy', costPerTask: 0.05, realCostEstimate: 0.005, complexity: 'low' },
    { toolId: 'video_maker', toolName: 'Gerador de Vídeos (Veo)', costPerTask: 2.50, realCostEstimate: 1.20, complexity: 'high' },
    // Marketing
    { toolId: 'viral_radar', toolName: 'Radar de Tendências', costPerTask: 0.00, realCostEstimate: 0.00, complexity: 'low' },
    { toolId: 'ugc_automation', toolName: 'Máquina de UGC Autônoma', costPerTask: 1.00, realCostEstimate: 0.20, complexity: 'high' },
    { toolId: 'bot_automation', toolName: 'Bot de Comentários', costPerTask: 0.20, realCostEstimate: 0.05, complexity: 'medium' },
    { toolId: 'whatsapp_evolution', toolName: 'WhatsApp Evo API', costPerTask: 15.00, realCostEstimate: 5.00, complexity: 'high' },
    // Funnels
    { toolId: 'page_builder', toolName: 'Construtor de Páginas AI', costPerTask: 0.50, realCostEstimate: 0.10, complexity: 'medium' },
    { toolId: 'optimizer_ab', toolName: 'Testes A/B Autônomos', costPerTask: 0.00, realCostEstimate: 0.00, complexity: 'low' },
    { toolId: 'analytics_pro', toolName: 'Analytics Avançado', costPerTask: 0.00, realCostEstimate: 0.00, complexity: 'low' },
    { toolId: 'hosting_subdomain', toolName: 'Hospedagem Subdomínio', costPerTask: 2.00, realCostEstimate: 0.50, complexity: 'low' },
    // Support
    { toolId: 'support_chat', toolName: 'Chat com Suporte Humano', costPerTask: 10.00, realCostEstimate: 5.00, complexity: 'high' },
    { toolId: 'certificate', toolName: 'Emissão de Certificado', costPerTask: 1.00, realCostEstimate: 0.10, complexity: 'low' },
    // Email Marketing
    { toolId: 'email_marketing_generator', toolName: 'Gerador de E-mail IA', costPerTask: 0.10, realCostEstimate: 0.02, complexity: 'low' },
    { toolId: 'email_broadcast', toolName: 'Disparo de E-mail (SMTP)', costPerTask: 0.01, realCostEstimate: 0.001, complexity: 'low' },
    // Course Creator
    { toolId: 'course_naming_refiner', toolName: 'Refinador de Nomes (Curso)', costPerTask: 0.05, realCostEstimate: 0.01, complexity: 'low' },
    { toolId: 'ai_cover_gen', toolName: 'Gerador de Capas (Dall-E 3)', costPerTask: 1.00, realCostEstimate: 0.40, complexity: 'high' },
    { toolId: 'promise_architect', toolName: 'Arquiteto de Promessas', costPerTask: 0.10, realCostEstimate: 0.02, complexity: 'medium' },
    { toolId: 'method_architect', toolName: 'Arquiteto de Metodologia', costPerTask: 0.50, realCostEstimate: 0.10, complexity: 'medium' },
    { toolId: 'financial_analyzer', toolName: 'Analista Financeiro (CFO)', costPerTask: 0.20, realCostEstimate: 0.05, complexity: 'medium' },
    // Student Consumption (Ongoing)
    { toolId: 'student_ai_chat', toolName: 'Mentor IA (Chat Aluno)', costPerTask: 0.05, realCostEstimate: 0.01, complexity: 'low' },
    { toolId: 'student_voice_chat', toolName: 'Mentor Voz (Audio)', costPerTask: 0.15, realCostEstimate: 0.04, complexity: 'medium' },
    { toolId: 'maintenance_active_student', toolName: 'Manutenção Diária', costPerTask: 0.01, realCostEstimate: 0.005, complexity: 'low' },
    { toolId: 'maintenance_storage_gb', toolName: 'Armazenamento Video (GB)', costPerTask: 0.20, realCostEstimate: 0.08, complexity: 'low' },
    // Producer B2B Tools
    { toolId: 'nexus_consultancy', toolName: 'Consultoria Nexus IA', costPerTask: 50.00, realCostEstimate: 5.00, complexity: 'high' },
    { toolId: 'producer_action_auto', toolName: 'Execução Autônoma (Action)', costPerTask: 25.00, realCostEstimate: 2.00, complexity: 'medium' },
    { toolId: 'team_member_seat', toolName: 'Vaga de Equipe (Mensal)', costPerTask: 100.00, realCostEstimate: 0.00, complexity: 'low' },
    // VIP Lounge
    { toolId: 'nexus_culture', toolName: 'VIP Lounge (Guia Cultural)', costPerTask: 25.00, realCostEstimate: 0.10, complexity: 'medium' },
    // Health & Mind
    { toolId: 'health_sleep_analysis', toolName: 'Análise de Sono IA', costPerTask: 0.05, realCostEstimate: 0.01, complexity: 'low' },
    { toolId: 'health_gratitude_insight', toolName: 'Insight Gratidão IA', costPerTask: 0.03, realCostEstimate: 0.005, complexity: 'low' },
    { toolId: 'health_astrology_chart', toolName: 'Mapa Astral/Previsão', costPerTask: 0.10, realCostEstimate: 0.02, complexity: 'medium' },
    { toolId: 'health_meal_scan', toolName: 'Scan Refeição OCR', costPerTask: 0.08, realCostEstimate: 0.03, complexity: 'medium' },
    { toolId: 'health_evolution_report', toolName: 'Relatório Evolução', costPerTask: 0.15, realCostEstimate: 0.05, complexity: 'high' },
    { toolId: 'health_metric_scan', toolName: 'Scan Métricas', costPerTask: 0.10, realCostEstimate: 0.03, complexity: 'medium' },
    // Nexus Ads Tools
    { toolId: 'ads_strategy_gen', toolName: 'Geração Estratégia', costPerTask: 0.15, realCostEstimate: 0.03, complexity: 'high' },
    { toolId: 'ads_copy_gen', toolName: 'Geração Copy Ads', costPerTask: 0.05, realCostEstimate: 0.01, complexity: 'low' },
    { toolId: 'ads_persona_analysis', toolName: 'Análise Persona', costPerTask: 0.10, realCostEstimate: 0.02, complexity: 'medium' },
    { toolId: 'ads_bid_optimization', toolName: 'Otimização Bids', costPerTask: 0.20, realCostEstimate: 0.05, complexity: 'high' },
    { toolId: 'ads_dark_post_gen', toolName: 'Criar Dark Post', costPerTask: 0.12, realCostEstimate: 0.03, complexity: 'medium' },
    { toolId: 'ads_opp_intelligence', toolName: 'Intel. Oportunidades', costPerTask: 0.08, realCostEstimate: 0.01, complexity: 'medium' },
    // Mestre IA New Tools
    { toolId: 'blindagem_legal', toolName: 'Blindagem Legal (Anti-Bloqueio)', costPerTask: 0.15, realCostEstimate: 0.02, complexity: 'medium' },
    { toolId: 'raio_x_metricas', toolName: 'Raio-X de Métricas (ROI)', costPerTask: 0.25, realCostEstimate: 0.05, complexity: 'high' },
    // Executive Passport
    { toolId: 'executive_mission', toolName: 'Missão Executiva (Base)', costPerTask: 20.00, realCostEstimate: 2.00, complexity: 'high' }
];

export const getToolCosts = async (): Promise<ToolCost[]> => {
    const stored = loadJSON<ToolCost[]>('mockToolCosts', []);
    if (stored.length === 0) return DEFAULT_TOOL_COSTS;

    // Merge defaults (add missing new tools) and Apply Safety Margin
    const merged = [...stored];
    DEFAULT_TOOL_COSTS.forEach(def => {
        const existing = merged.find(m => m.toolId === def.toolId);
        if (!existing) {
            // Apply Dynamic Margin Rule if not explicitly set
            // If costPerTask is defined in default, use it. 
            // If we wanted to enforce margin on defaults:
            // const safePrice = def.realCostEstimate * (1 + ADMIN_MARGIN);
            // const finalPrice = def.costPerTask > 0 ? def.costPerTask : safePrice;
            merged.push(def);
        } else {
            // Safety Check: If admin set price too low, we could flag it here.
            // But user asked to apply margin "if NOT in list".
        }
    });

    // Dynamic Safety Net: Ensure all tools have at least RealCost + 30%
    return merged.map(t => {
        const minPrice = t.realCostEstimate * (1 + ADMIN_MARGIN);
        // If current price is below safety margin (and not explicitly free/zero), suggest/force update?
        // For this task, we simply ensure the RETURNED list has the tools.
        // We will respect the stored/default price, assuming defaults are set correctly above.
        return t;
    });
};
export const saveToolCost = async (t: ToolCost) => {
    const list = await getToolCosts();
    const idx = list.findIndex(x => x.toolId === t.toolId);
    if (idx !== -1) list[idx] = t;
    else list.push(t);
    saveJSON('mockToolCosts', list);
};

const INITIAL_CREDIT_COMBOS: CreditCombo[] = [
    { id: 'starter_50', name: 'Mestre IA - Starter Pack', credits: 50, price: 24.90, active: true, salesCount: 0, stripePriceId: '', stripePaymentLink: '' },
    { id: 'basic_100', name: 'Mestre IA - Basic Pack', credits: 100, price: 44.90, active: true, salesCount: 0, stripePriceId: '', stripePaymentLink: '' },
    { id: 'popular_200', name: 'Mestre IA - Popular Pack 🔥', credits: 200, price: 79.90, active: true, salesCount: 0, stripePriceId: '', stripePaymentLink: '' },
    { id: 'pro_300', name: 'Mestre IA - Pro Pack', credits: 300, price: 109.90, active: true, salesCount: 0, stripePriceId: '', stripePaymentLink: '' },
    { id: 'business_400', name: 'Mestre IA - Business Pack', credits: 400, price: 139.90, active: true, salesCount: 0, stripePriceId: '', stripePaymentLink: '' },
    { id: 'elite_500', name: 'Mestre IA - Elite Pack ⭐', credits: 500, price: 164.90, active: true, salesCount: 0, stripePriceId: '', stripePaymentLink: '' },
    { id: 'enterprise_1000', name: 'Mestre IA - Enterprise Pack 👑', credits: 1000, price: 297.90, active: true, salesCount: 0, stripePriceId: '', stripePaymentLink: '' }
];

export const getCreditCombos = async () => loadJSON<CreditCombo[]>('mockCreditCombos_v2', INITIAL_CREDIT_COMBOS);
export const saveCreditCombo = async (c: CreditCombo) => {
    const list = await getCreditCombos();
    // Try to find by ID, then by stripePriceId, then by name
    let idx = list.findIndex(x => x.id === c.id);

    if (idx === -1 && (c as any).stripePriceId) {
        idx = list.findIndex(x => (x as any).stripePriceId === (c as any).stripePriceId);
    }

    if (idx === -1) {
        idx = list.findIndex(x => x.name.toLowerCase() === c.name.toLowerCase());
    }

    if (idx !== -1) {
        // preserve sales count if updating
        const existing = list[idx];
        list[idx] = { ...existing, ...c, id: existing.id };
    } else {
        list.push(c);
    }
    saveJSON('mockCreditCombos_v2', list);
};
export const deleteCreditCombo = async (id: string) => {
    const list = await getCreditCombos();
    saveJSON('mockCreditCombos_v2', list.filter(x => x.id !== id));
};

export const purchaseCombo = async (uid: string, combo: CreditCombo) => {
    await consumeCredits(uid, 'store', combo.credits, `Compra: ${combo.name}`);
};

export const getSchoolBySubdomain = async (sub: string) => loadJSON<SchoolConfig[]>('mockSchools', []).find(s => s.subdomain === sub);

export const updateUserProducerData = async (uid: string, data: any) => {
    const student = mockStudents.find(s => s.uid === uid);
    if (student) {
        student.producerData = data;
        saveJSON('mockStudents', mockStudents);
        return;
    }
    const influencer = mockInfluencers.find(i => i.uid === uid);
    if (influencer) {
        influencer.producerData = data;
        saveJSON('mockInfluencers', mockInfluencers);
        return;
    }
};

export const runNexusDataCollection = async (cb: (msg: string) => void): Promise<NexusAnalysisResult> => {
    cb("Conectando ao Data Warehouse...");
    await delay(500);
    cb("Analisando padrões de comportamento...");
    await delay(500);
    cb("Calculando LTV e Churn...");
    await delay(500);
    cb("Gerando insights...");

    return {
        totalAnalyzed: 15420,
        highRiskCount: 142,
        highPerformanceCount: 890,
        avgROI: 14.5,
        timestamp: new Date().toISOString(),
        dataSources: ['Hotmart', 'ActiveCampaign', 'Tracking Pixel'],
        details: []
    };
};

export const searchStudents = async (term: string) => {
    await delay(300);
    const termLower = term.toLowerCase();
    return mockStudents.filter(s =>
        s.displayName?.toLowerCase().includes(termLower) ||
        s.email?.toLowerCase().includes(termLower) ||
        s.cpf?.includes(term)
    );
};

export const getStudentsPaginated = async (limitCount: number, startAfterId?: string) => {
    await delay(300);
    let startIdx = 0;
    if (startAfterId) {
        const foundIdx = mockStudents.findIndex(s => s.uid === startAfterId);
        if (foundIdx !== -1) startIdx = foundIdx + 1;
    }
    const students = mockStudents.slice(startIdx, startIdx + limitCount);
    return {
        students,
        lastId: students.length > 0 ? students[students.length - 1].uid : undefined
    };
};

export const generateStudentActionPlan = async (uid: string) => {
    await delay(800);
    return [
        { id: `act-${Date.now()}-1`, category: 'Social Media', title: 'Postar 3 Stories', description: 'Fale sobre sua rotina hoje.', priority: 'Alta', status: 'pending', createdAt: Date.now() },
        { id: `act-${Date.now()}-2`, category: 'Funil', title: 'Configurar Bio', description: 'Adicione o link do produto na bio.', priority: 'Média', status: 'pending', createdAt: Date.now() }
    ] as NexusAction[];
};

export const runToolAnalysis = async (): Promise<ToolOptimizationReport> => {
    await delay(1500);
    return {
        timestamp: new Date().toISOString(),
        scannedToolsCount: 15,
        systemImprovements: [
            { id: 'imp1', toolName: 'Gerador de Copy', priority: 'medium', description: 'Latência alta detectada.', affectedStudents: 45, recommendedAction: 'Otimizar Cache' }
        ],
        studentRecommendations: [
            { id: 'rec1', studentId: 'st1', currentToolId: 'basic_copy', suggestedToolId: 'viral_copy', reason: 'Melhor performance para nicho de emagrecimento' }
        ]
    } as any;
};

export const generateNexusDailyReport = async (): Promise<NexusDailyReport> => {
    await delay(1000);
    return {
        id: `rep-${Date.now()}`,
        date: new Date().toISOString(),
        totalUsage: 4520,
        avgSatisfaction: 4.8,
        criticalAlerts: 2,
        topTools: ['Copy Generator', 'Video Maker', 'Viral Radar'],
        learningProgress: 12,
        generatedSuggestions: 450
    };
};

export const runNexusFeedbackLoop = async () => {
    await delay(1000);
    return {
        alerts: [
            { id: 'al1', severity: 'high', category: 'performance_drop', message: 'Queda de 15% na taxa de conversão da Landing Page A.', timestamp: Date.now(), recommendedAutoAction: 'Reverter para version anterior' }
        ] as NexusTrendAlert[],
        optimizations: [
            { id: 'opt1', targetModule: 'Funil', changeType: 'ab_test_winner', description: 'Variação B venceu com 95% de confiança.', confidenceScore: 95, status: 'proposed' }
        ] as NexusSystemOptimization[]
    };
};

export const getUsageLimit = async () => mockUsageLimit;
export const updateUsageLimit = async (l: number) => {
    mockUsageLimit.monthly_limit = l;
    saveJSON('usage_limits', mockUsageLimit);
};
export const toggleEmergencyStop = async (s: boolean) => {
    mockUsageLimit.emergency_stop = s;
    saveJSON('usage_limits', mockUsageLimit);
};
export const resetCurrentUsage = async () => {
    mockUsageLimit.current_usage = 0;
    saveJSON('usage_limits', mockUsageLimit);
};
export const incrementUsageCost = async (c: number) => {
    mockUsageLimit.current_usage += c;
    saveJSON('usage_limits', mockUsageLimit);
};
export const checkAiAvailability = async () => {
    const u = await getUsageLimit();
    if (u.emergency_stop || u.current_usage >= u.monthly_limit) throw new Error("AI Unavailable");
};

// [FIXED] Removed duplicated wrapper
// distributeUsageCommission helper extracted to module scope

const distributeUsageCommission = async (toolId: string, creditAmount: number) => {
    try {
        const settings = await getSystemSettings();
        const tools = await getToolCosts();
        const tool = tools.find(t => t.toolId === toolId);

        // 1. Revenue (Assume 1 Credit = R$ 1.00 for simulation)
        // In real app, this depends on the pack price, but for avg we use 1.00
        const revenue = creditAmount * 1.00;

        // 2. Cost
        const cost = tool ? tool.realCostEstimate : 0;

        // 3. Net Profit (Realized)
        // If revenue < cost, profit is 0 (Platform takes loss, Producer gets 0)
        const netProfit = Math.max(0, revenue - cost);

        // 4. Commission
        const pct = settings.producerCommissionPercentage || 0;
        const commission = netProfit * (pct / 100);

        if (commission > 0) {
            const stats = loadJSON<ProductFinanceStats[]>('mockProductFinanceStats', []);
            let creditProduct = stats.find(p => p.productId === 'credit_recharges_global');

            if (!creditProduct) {
                // Initialize if missing (should exist from buyCredits)
                creditProduct = {
                    productId: 'credit_recharges_global',
                    productName: 'Recargas de Crédito (Global)',
                    revenue: 0,
                    costs: { platformFees: 0, taxes: 0, affiliateCommissions: 0, teamCommissions: 0 },
                    netProfit: 0,
                    margin: 0,
                    salesCount: 0,
                    refundCount: 0,
                    chargebackCount: 0
                };
                stats.push(creditProduct);
            }

            // WE ADD TO 'affiliateCommissions' -> This is "Realized/Available"
            creditProduct.costs.affiliateCommissions += commission;

            // We also update NetProfit to reflect the Realized Platform Profit *decrease* (payout)
            // Note: In buyCredits we added the "Pot". Now we consume from it.
            creditProduct.netProfit -= commission;

            saveJSON('mockProductFinanceStats', stats);
            // console.log(`[USAGE COMMISSION] Tool: ${toolId} | Val: ${revenue} | Cost: ${cost} | Comm: ${commission}`);
        }
    } catch (e) {
        console.error("Comm Dist Error", e);
    }
};

export const consumeCredits = async (
    userId: string,
    toolId: string,
    amount: number,
    description: string,
    forceWallet: boolean = false
): Promise<{ success: boolean; message?: string; newBalance?: number; code?: string; error?: string }> => {
    await delay(300);

    const students = loadJSON<Student[]>('mockStudents', []);
    const idx = students.findIndex(s => s.uid === userId);

    let featureId = toolId;
    // Map internal IDs if needed
    if (toolId === 'metric_scan') featureId = 'health_metric_scan';
    if (toolId === 'evolution_report') featureId = 'health_evolution_report';
    if (toolId === 'food_scan') featureId = 'health_food_scan';

    // Narrative Logic (Auto-Description if empty)
    const narratives: any = {
        'health_metric_scan': 'Análise de Biometria',
        'health_evolution_report': 'Relatório de Evolução',
        'health_food_scan': 'Scan de Alimentos',
        'social_audit': 'Auditoria de Perfil',
        'content_generator': 'Geração de Conteúdo'
    };
    const narrative = description || narratives[featureId] || `Consumo de Recurso: ${featureId}`;


    // Helper for cost tracking
    const incrementUsageCost = async (cost: number) => {
        // Find 'credit_recharges_global' and increment generic costs if needed?
        // Actually, we are using distributeUsageCommission for detailed tracking now.
        // We can keep this if it updates a different stat, but let's assume it's legacy or safe to keep.
        // For this task, we assume distributeUsageCommission is the PRIMARY ledger updater.
    };

    if (idx === -1) {
        // Check influencers or admins
        if (userId.startsWith('inf-')) {
            const influencers = loadJSON<Influencer[]>('mockInfluencers', []);
            const infIdx = influencers.findIndex(i => i.uid === userId);
            if (infIdx !== -1) {
                const influencer = influencers[infIdx];
                if ((influencer.creditBalance || 0) >= amount) {
                    influencer.creditBalance = (influencer.creditBalance || 0) - amount;

                    const tx: WalletTransaction = {
                        id: `tx-${Date.now()}`,
                        producerId: userId,
                        type: 'usage',
                        category: 'service_usage',
                        amount: -amount,
                        toolId,
                        description: narrative,
                        timestamp: Date.now(),
                        pocketUsed: 'global',
                        balanceSnapshot: influencer.creditBalance || 0
                    };
                    influencer.walletTransactions.unshift(tx);
                    saveJSON('mockInfluencers', influencers);

                    // Log Custo Real & Commission
                    const tools = await getToolCosts();
                    const tool = tools.find(t => t.toolId === toolId);
                    if (tool) incrementUsageCost(tool.realCostEstimate);

                    // Trigger Commission Logic
                    await distributeUsageCommission(toolId, amount);

                    return { success: true, message: "OK" };
                } else {
                    return { success: false, message: "Saldo insuficiente. Recarregue seus créditos." };
                }
            }
        }

        // Check for Producer (Admin/Partner) Debit
        if (userId === mockProducerWallet.producerId || userId === 'user-123' || forceWallet) { // Simple mock check
            const success = await debitWallet(amount, narrative, 'service_usage');
            if (success) {
                // Log usage statistics if needed
                const tools = await getToolCosts();
                const tool = tools.find(t => t.toolId === toolId);
                if (tool) incrementUsageCost(tool.realCostEstimate); // Track Platform Cost
                return { success: true, message: "Debitado da Carteira do Produtor" };
            } else {
                return { success: false, message: "Saldo em Carteira Insuficiente (Produtor)" };
            }
        }

        const admins = loadJSON<TeamUser[]>('mockTeamUsers', []);
        if (admins.find(a => a.id === userId)) return { success: true, message: "Admin Bypass" };

        return { success: false, message: "Usuário não encontrado." };
    }

    const student = students[idx];
    if (!student.walletBuckets) student.walletBuckets = [];
    const influencers = loadJSON<Influencer[]>('mockInfluencers', []);
    const admins = loadJSON<TeamUser[]>('mockTeamUsers', []);

    let user: (Student | Influencer | TeamUser | undefined) = students.find(s => s.uid === userId);
    let userType: 'student' | 'influencer' | 'admin' | undefined;

    if (user) {
        userType = 'student';
    } else {
        user = influencers.find(i => i.uid === userId);
        if (user) {
            userType = 'influencer';
        } else {
            user = admins.find(a => a.id === userId);
            if (user) {
                userType = 'admin';
            }
        }
    }

    if (!user) {
        return { success: false, newBalance: 0, error: 'User not found' };
    }

    // Admin bypass
    if (userType === 'admin') {
        return { success: true, newBalance: (user as any).creditBalance || 0 }; // Admins don't consume credits in mock
    }

    // --- TIER 1 SAFETY: SCHOOL LIMITS (for students/influencers) ---
    const settings = await getSchoolSettings('producer-01'); // Mock fetch
    if (settings && (settings as any).dailyLimit) {
        const todayKey = `usage_${userId}_${new Date().toISOString().split('T')[0]}`;
        const todayUsage = parseInt(localStorage.getItem(todayKey) || '0');

        if (todayUsage + amount > (settings as any).dailyLimit) {
            // Block consumption
            return { success: false, newBalance: (user as Student | Influencer).creditBalance || 0, error: `Limite diário da escola atingido (${(settings as any).dailyLimit} créditos). Tente amanhã.` };
        }

        // Update mock usage
        localStorage.setItem(todayKey, (todayUsage + amount).toString());
    }

    // --- TIER 2: PERSONAL FREE DAILY LIMIT (HEALTH & MIND / MESTRE IA) ---
    // Paid tools (OAB, JurisMemoria, VIP Lounge, Quiz) bypass this and go straight to wallet
    if (userType === 'student' && !forceWallet && toolId !== 'simulado_oab' && toolId !== 'util_jurismemoria' && toolId !== 'nexus_culture' && toolId !== 'nexus_quiz' && toolId !== 'executive_mission') {
        const student = user as Student;
        const dailyLimit = student.dailyMestreIALimit || 0;

        // Reset Logic
        const todayStr = new Date().toDateString();
        if (student.lastDailyReset !== todayStr) {
            student.dailyUsage = 0;
            student.lastDailyReset = todayStr;
        }

        const usage = student.dailyUsage || 0;

        if (dailyLimit > 0) {
            if (usage + amount <= dailyLimit) {
                // Free Usage
                student.dailyUsage = usage + amount;
                saveJSON('mockStudents', students);
                return { success: true, message: `Interação Diária (${student.dailyUsage}/${dailyLimit})` };
            } else {
                // Limit Exceeded - REQUIRE WALLET CONFIRMATION via Error Code
                return { success: false, code: 'DAILY_LIMIT_EXCEEDED', message: 'Limite diário gratuito excedido.' };
            }
        }
    }

    // --- TIER 3: WALLET CONSUMPTION ---
    // Check specialized buckets first for students
    if (userType === 'student') {
        const student = user as Student;
        if (!student.walletBuckets) student.walletBuckets = [];
        if (!student.walletTransactions) student.walletTransactions = [];

        const bucketIdx = student.walletBuckets.findIndex(b => b.toolId === featureId);
        let pocketUsed: 'specialized' | 'global' = 'global';

        if (bucketIdx !== -1 && student.walletBuckets[bucketIdx].balance >= amount) {
            student.walletBuckets[bucketIdx].balance -= amount;
            pocketUsed = 'specialized';
            // Log transaction
            const tx: WalletTransaction = {
                id: `tx-${Date.now()}`,
                producerId: userId,
                type: 'usage',
                category: 'service_usage',
                amount: -amount,
                toolId: featureId,
                description: description,
                timestamp: Date.now(),
                pocketUsed,
                balanceSnapshot: student.creditBalance || 0 // Snapshot of global balance
            };
            student.walletTransactions.unshift(tx);
            saveJSON('mockStudents', students);

            // Increment global usage cost & Commission
            const tools = await getToolCosts();
            const tool = tools.find(t => t.toolId === featureId);
            if (tool) incrementUsageCost(tool.realCostEstimate);
            await distributeUsageCommission(featureId, amount);

            return { success: true, newBalance: student.creditBalance || 0 };
        }
    }

    // Fallback to global creditBalance for students and primary for influencers
    const currentBalance = (user as Student | Influencer).creditBalance || 0;
    if (currentBalance < amount) {
        return { success: false, newBalance: currentBalance, error: 'Saldo insuficiente. Recarregue seus créditos.' };
    }

    // Deduct from global balance
    (user as Student | Influencer).creditBalance = currentBalance - amount;

    // Log transaction
    const tx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        producerId: userId,
        type: 'usage',
        category: 'service_usage',
        amount: -amount,
        toolId: featureId,
        description: description,
        timestamp: Date.now(),
        pocketUsed: 'global',
        balanceSnapshot: (user as Student | Influencer).creditBalance || 0
    };

    if (userType === 'student') {
        const student = user as Student;
        if (!student.walletTransactions) student.walletTransactions = [];
        student.walletTransactions.unshift(tx);
        saveJSON('mockStudents', students);
    } else if (userType === 'influencer') {
        const influencer = user as Influencer;
        if (!influencer.walletTransactions) influencer.walletTransactions = [];
        influencer.walletTransactions.unshift(tx);
        saveJSON('mockInfluencers', influencers);
    }

    // Increment global usage cost & Commission
    const tools = await getToolCosts();
    const tool = tools.find(t => t.toolId === toolId);
    if (tool) incrementUsageCost(tool.realCostEstimate);
    await distributeUsageCommission(featureId, amount);

    return { success: true, message: "Consumo processado." };
};

export const calibrateAutonomousDNA = async (id: string) => { await delay(1000); };

export const sendInviteViaWhatsAppInstance = async (phone: string, name: string, product: string, link: string) => {
    console.log(`WA Invite: ${phone}, ${name}, ${product}, ${link}`);
};

// --- REFUNNDS & FINANCE MOCKS ---

export const mockRefundRequests: RefundRequest[] = [
    {
        id: 'refund-001',
        studentId: 'student-01',
        studentName: 'João Silva',
        studentEmail: 'joao@email.com',
        userId: 'student-01',
        userName: 'João Silva',
        userEmail: 'joao@email.com',
        productName: 'Mentoria Premium',
        amount: 997.00,
        purchaseDate: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
        requestDate: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
        warrantyDeadline: Date.now() + (2 * 24 * 60 * 60 * 1000), // +2 days remaining
        retentionDeadline: Date.now() + (22 * 60 * 60 * 1000), // 22h remaining (24h window)
        status: 'pending_retention',
        reason: 'Não me adaptei à didática.'
    },
    {
        id: 'refund-002',
        studentId: 'student-02',
        studentName: 'Maria Oliveira',
        studentEmail: 'maria@email.com',
        userId: 'student-02',
        userName: 'Maria Oliveira',
        userEmail: 'maria@email.com',
        productName: 'Curso Básico',
        amount: 297.00,
        purchaseDate: Date.now() - (10 * 24 * 60 * 60 * 1000),
        requestDate: Date.now() - (25 * 60 * 60 * 1000),
        warrantyDeadline: 0,
        retentionDeadline: 0,
        status: 'refunded', // Auto-refunded after 24h
        reason: 'Financeiro apertou.'
    }
];

export const sendSystemNotification = async (channel: 'whatsapp' | 'email', to: string, template: string, data: any) => {
    await delay(800);
    const sender = channel === 'whatsapp' ? '📱 WhatsApp: "Contato" (Plataforma)' : '📧 Email: contato@mestrenosnegocios.com';
    console.log(`[SYSTEM SEND - ${sender}] To: ${to} | Template: ${template} | Data:`, data);
    return true;
};

// Replaces the old generic invite function to ensure platform identity
// Replaces the old generic invite function to ensure platform identity
export const sendPlatformInvite = async (channel: 'whatsapp' | 'email', to: string, name: string, context: string, link: string) => {
    await delay(1000);
    const sender = channel === 'whatsapp' ? '📱 WhatsApp: "Contato" (Plataforma)' : '📧 Email: contato@mestrenosnegocios.com';
    console.log(`[PLATFORM INVITE - ${sender}] To: ${to} | Name: ${name} | Context: ${context} | Link: ${link}`);
};

export const addPublishedCourseToUser = async (userId: string, courseId: string) => {
    await delay(300);
    // Update Students
    const student = mockStudents.find(s => s.uid === userId);
    if (student) {
        if (!student.purchasedCourses) student.purchasedCourses = [];
        // Ideally we need a 'publishedCourses' field on Student interface if they are producers
        // extending Student to be a Producer temporarily
        const producer = student as any;
        if (!producer.publishedCourses) producer.publishedCourses = [];
        if (!producer.publishedCourses.includes(courseId)) {
            producer.publishedCourses.push(courseId);
            saveJSON('mockStudents', mockStudents);
        }
        return;
    }
    // Update Influencers (if they can create courses)
    const influencer = mockInfluencers.find(i => i.uid === userId);
    if (influencer) {
        const prod = influencer as any;
        if (!prod.publishedCourses) prod.publishedCourses = [];
        if (!prod.publishedCourses.includes(courseId)) {
            prod.publishedCourses.push(courseId);
            saveJSON('mockInfluencers', mockInfluencers);
        }
    }
};

export const getStudentCourses = (userId: string) => {
    // Check localStorage first
    const local = localStorage.getItem(`student_courses_${userId}`);
    if (local) return JSON.parse(local);

    // Check mock DB as fallback (if we sync it)
    // For now, return empty array if nothing
    return [];
};

export const checkAutoRefunds = async () => {
    // In a real backend, this runs via cron
    console.log("Checking for expired retention windows...");
    return mockRefundRequests.filter(r => r.status === 'pending_retention' && Date.now() > r.retentionDeadline);
};

// ... existing exports

export const createEscalationRequest = async (data: { ticketId: string, reason: string, agentId: string, agentName: string, targetLevel?: 'finance' | 'admin' }) => {
    console.log("Escalation", data);
    const tickets = await getSupportTickets();
    const ticket = tickets.find(t => t.id === data.ticketId);
    if (ticket) {
        ticket.isEscalated = true;
        ticket.status = data.targetLevel === 'admin' ? 'pending_admin' : 'pending_finance';

        // Add internal note with original reason
        ticket.messages.push({
            id: `m-esc-${Date.now()}`,
            text: `⚠️ TICKET ESCALADO PARA ${data.targetLevel?.toUpperCase() || 'FINANCEIRO'}: ${data.reason}`,
            user: { uid: data.agentId, name: data.agentName, avatar: '', role: 'support' },
            createdAt: Date.now(),
            channelId: ticket.id,
            isInternal: true
        });

        saveJSON('mockSupportTickets', tickets);
    }
};

export const createFinanceRequest = async (studentId: string, studentName: string, requester: SupportAgent, amount: number, reason: string) => {
    await delay(500);
    const requests = loadJSON<FinanceRequest[]>('mockFinanceRequests', []);
    const newRequest: FinanceRequest = { id: `fin-${Date.now()}`, studentId, studentName, requesterId: requester.uid, requesterName: requester.displayName || 'Support', amount, reason, status: 'pending', createdAt: Date.now(), type: 'credit_addition' };
    requests.push(newRequest);
    saveJSON('mockFinanceRequests', requests);
    return newRequest;
};

export const getFinanceRequests = async () => {
    await delay(500);
    return loadJSON<FinanceRequest[]>('mockFinanceRequests', []);
};

export const respondToFinanceRequest = async (id: string, status: 'approved' | 'rejected', feedback: string, adminId: string) => {
    await delay(800);
    const requests = loadJSON<FinanceRequest[]>('mockFinanceRequests', []);
    const idx = requests.findIndex(r => r.id === id);
    if (idx !== -1) {
        requests[idx].status = status;
        requests[idx].feedback = feedback;
        requests[idx].respondedAt = Date.now();
        requests[idx].respondedBy = adminId;

        // If approved, update student balance
        if (status === 'approved') {
            const students = loadJSON<Student[]>('mockStudents', []);
            const sIdx = students.findIndex(s => s.uid === requests[idx].studentId);
            if (sIdx !== -1) {
                students[sIdx].creditBalance = (students[sIdx].creditBalance || 0) + requests[idx].amount;
                // Add transaction
                const tx: WalletTransaction = {
                    id: `tx-credit-${Date.now()}`,
                    producerId: requests[idx].studentId,
                    type: 'credit',
                    category: 'credit',
                    amount: requests[idx].amount,
                    description: `Crédito aprovado via solicitação: ${requests[idx].id}`,
                    timestamp: Date.now(),
                    pocketUsed: 'global',
                    balanceSnapshot: students[sIdx].creditBalance || 0
                };
                if (!students[sIdx].walletTransactions) students[sIdx].walletTransactions = [];
                students[sIdx].walletTransactions.unshift(tx);
                saveJSON('mockStudents', students);
            }
            await createAuditLog(adminId, 'FINANCE_REQUEST_APPROVED', 'critical', `Solicitação financeira ${id} APROVADA: R$ ${requests[idx].amount}`, { requestId: id, amount: requests[idx].amount, feedback });
        } else {
            await createAuditLog(adminId, 'FINANCE_REQUEST_REJECTED', 'medium', `Solicitação financeira ${id} REJEITADA`, { requestId: id, feedback });
        }

        saveJSON('mockFinanceRequests', requests);
    }
};

export const getStudentWalletHistory = async (studentId: string) => {
    const student = mockStudents.find(s => s.uid === studentId);
    return (student?.walletTransactions || []).sort((a, b) => b.timestamp - a.timestamp);
};

export const sendPasswordResetEmail = async (email: string) => { await delay(500); return true; };

export const getTeamRankings = async () => {
    return {
        generalRanking: mockSalesTeam.sort((a, b) => b.revenueToday - a.revenueToday),
        teamRanking: [{ name: 'Equipe Alpha', revenue: 15000, members: 5 }],
        internalRankings: {
            'Equipe Alpha': [
                mockSalesTeam[0],
                mockSalesTeam[1] || mockSalesTeam[0],
                mockSalesTeam[2] || mockSalesTeam[0]
            ]
        }
    };
};

export const addToTreasureChest = async (item: any) => {
    const chest = loadJSON<TreasureItem[]>('mockTreasureChest', []);
    chest.push({ ...item, id: `tr-${Date.now()}`, createdAt: Date.now() });
    saveJSON('mockTreasureChest', chest);
};

export const getTreasureChest = async () => loadJSON<TreasureItem[]>('mockTreasureChest', []);

export const getCustomPrompts = async () => loadJSON<Record<string, string>>('mockCustomPrompts', {});

export const saveCustomPrompt = async (id: string, prompt: string) => {
    const prompts = await getCustomPrompts();
    prompts[id] = prompt;
    saveJSON('mockCustomPrompts', prompts);
};

export const registerAffiliateViaInvite = async (data: any) => {
    const influencers = await getInfluencers();
    influencers.push({ ...data, uid: `inf-${Date.now()}`, status: 'active', totalEarnings: 0, availableBalance: 0, products: [] });
    saveJSON('mockInfluencers', influencers);
};

export const getActiveCampaignsForUser = async (user: User) => {
    const camps = await getAllCampaigns();
    return camps.filter(c => c.status === 'active');
};

export const generateNexusAutoCampaign = async (user: User) => {
    return { id: 'nexus-1', title: 'Oferta Nexus', description: 'Recomendação IA baseada no seu perfil.', ctaText: 'Ver Detalhes', ctaLink: '#', status: 'active', createdAt: Date.now() } as any;
};

export const getAllCampaigns = async () => loadJSON<InternalCampaign[]>('mockCampaigns', []);

export const saveCampaign = async (c: InternalCampaign) => {
    const all = await getAllCampaigns();
    const idx = all.findIndex(x => x.id === c.id);
    if (idx !== -1) all[idx] = c; else all.push(c);
    saveJSON('mockCampaigns', all);
};

export const deleteCampaign = async (id: string) => {
    const all = await getAllCampaigns();
    saveJSON('mockCampaigns', all.filter(c => c.id !== id));
};

export const getSalesScripts = async () => loadJSON<SalesScript[]>('mockSalesScripts', []);
export const updateSalesScript = async (id: string, data: any) => { };
export const createSalesScript = async (data: any) => { };
export const deleteSalesScript = async (id: string) => { };

export const getEvolutionSettings = async () => loadJSON('mockEvolution', { status: 'disconnected', apiUrl: '', apiKey: '', instanceName: '' });
export const saveEvolutionSettings = async (s: any) => { saveJSON('mockEvolution', s); return s; };
export const connectEvolutionInstance = async (n: string) => 'qr-mock-url';
export const logoutEvolutionInstance = async (n: string) => ({ status: 'disconnected' });

export const verifyProductStats = async (id: string, ok: boolean) => { };
export const approveLevelUp = async (id: string, ok: boolean) => { };
export const getUserLoginHistory = async (uid: string) => [];
export const performRecoveryAction = async (uid: string, a: string[], admin: string) => { };

export const getSystemButtons = async () => loadJSON<SystemButtonConfig[]>('mockSystemButtons', []);
export const saveSystemButton = async (b: any) => {
    const all = await getSystemButtons();
    const idx = all.findIndex(x => x.id === b.id);
    if (idx !== -1) all[idx] = b; else all.push(b);
    saveJSON('mockSystemButtons', all);
};
export const deleteSystemButton = async (id: string) => {
    const all = await getSystemButtons();
    saveJSON('mockSystemButtons', all.filter(x => x.id !== id));
};

export const getSystemVideos = async () => loadJSON<SystemVideoConfig[]>('mockSystemVideos', []);
export const saveSystemVideo = async (v: any) => {
    const all = await getSystemVideos();
    const idx = all.findIndex(x => x.id === v.id);
    if (idx !== -1) all[idx] = v; else all.push(v);
    saveJSON('mockSystemVideos', all);
};
export const deleteSystemVideo = async (id: string) => {
    const all = await getSystemVideos();
    saveJSON('mockSystemVideos', all.filter(x => x.id !== id));
};

export const getAvailableAffiliationProducts = async (user: any) => mockAppProducts;
export const requestAffiliation = async (user: any, product: any) => { };

export const inviteCoProducer = async (info: CoProducerInfo, product: string) => {
    await delay(500);
    console.log(`[Nexus] Convite de co-produção enviado para ${info.name} (${info.phone}) para o produto ${product}`);
    toast.success(`Convite de co-produção enviado para ${info.name}`);
};

export const getFormattedScript = (content: string, product: string, name: string) =>
    content.replace('[Nome]', name).replace('[Produto]', product);

export const createCommissionPayment = async (data: any) => {
    const list = await getCommissionPayments();

    // Simple OCR Simulation integration
    let ocrResult = data.ocrResult;
    if (!ocrResult && data.proofUrl && data.proofUrl !== '#') {
        ocrResult = {
            extractedAmount: data.amount,
            extractedDate: new Date().toISOString(),
            extractedBeneficiary: data.managerName,
            confidence: 0.98,
            auditStatus: 'consistent'
        };
    }

    list.push({ ...data, id: `pay-${Date.now()}`, ocrResult });
    saveJSON('mockCommissionPayments', list);
};

export const getCoursePlan = async (id: string) => loadJSON<CoursePlan | null>(`coursePlan_${id}`, null);
export const saveCoursePlan = async (p: CoursePlan) => saveJSON(`coursePlan_${p.courseId}`, p);
export const calculateNexusPlanCost = async (t: any): Promise<NexusPlanAnalysis> => ({ tier: '', estimatedInfrastructureCost: 0, recommendedPriceMin: 0, recommendedPriceOptimal: 0, margin: 0, advice: '' });

export const getProductSmtpConfig = async (product: string) => {
    const smtps = await getAdminIntegrations('smtp');
    return smtps.find((s: any) => s.product === product);
};

export const getServiceEmailConfigs = async () => loadJSON<ServiceEmailConfig[]>('mockServiceEmailConfigs', []);

export const saveServiceEmailConfigs = async (c: any) => saveJSON('mockServiceEmailConfigs', c);

export const generateProductDNA = async (name: string, desc: string): Promise<ProductDNA> => {
    await delay(1000);
    return {
        sevenGoldenQuestions: {
            moneyGainOrSave: 'Aumentar faturamento em 15x.',
            timeSaved: 'Economiza 20h por semana.',
            tasksEliminated: 'Elimina postagem manual.',
            painEliminated: 'Fim do bloqueio criativo.',
            statusAndEnvy: 'Reconhecimento no mercado.',
            socialPopularity: 'Autoridade nas redes.',
            healthAndVibrancy: 'Mais tempo livre.'
        },
        idealPersona: {
            ageRange: '25-45',
            gender: 'Todos',
            mainPain: 'Falta de escala',
            mainDesire: 'Liberdade financeira',
            incomeLevel: 'Variável'
        },
        alignmentScore: 92,
        lastRefinement: new Date().toISOString(),
        learningInsights: ['Público responde melhor a vídeos curtos.'],
        universalObjections: {
            notForMe: 'Mostre casos de pessoas comuns que tiveram resultado.',
            noMoney: 'Ancore o preço no custo de não resolver o problema (R$ X/dia).',
            noTime: 'O método exige apenas 15 min/dia.',
            dontBelieveMethod: 'Apresente a "Descoberta Única" e prova científica/lógica.',
            dontBelieveAuthor: 'Mostre seus bastidores e vulnerabilidade estratégica.',
            procrastination: 'Bônus de ação rápida expira em 24h.',
            needApproval: 'Argumento lógico de ROI para apresentar ao parceiro(a).',
            triedEverything: 'Você tentou métodos antigos; este é o Novo Mecanismo.',
            fearOfFailure: 'Garantia condicional de 90 dias.',
            costBenefit: 'Compare com o custo de soluções inferiores ou "fazer sozinho".'
        }
    };
};

export const getAutomaticCheckoutLinkForLead = (lead: Lead, user: SalesPerson) => {
    return `https://pay.mestre15x.com/checkout?lead=${lead.id}&vendedor=${user.uid}`;
};



export const getPaymentRouting = async () => {
    return loadJSON('mockPaymentRouting', initialPaymentRouting);
};

export const savePaymentRouting = async (config: any) => {
    const current = loadJSON('mockWhiteLabelConfig', initialWhiteLabelConfig);
    return current;
};

// Sync version for calculations inside other functions
export const getWhiteLabelConfigSync = () => {
    return loadJSON('mockWhiteLabelConfig', initialWhiteLabelConfig);
};

// FINANCIAL INTELLIGENCE MOCKS
const mockProductFinanceStats: ProductFinanceStats[] = [
    {
        productId: 'course-001',
        productName: 'Mestre nos Negócios (Curso)',
        revenue: 12450.00,
        costs: {
            platformFees: 622.50, // 5%
            taxes: 1245.00, // 10%
            affiliateCommissions: 2000.00,
            teamCommissions: 500.00,
            adsSpend: 3000.00
        },
        netProfit: 5082.50,
        margin: 40.8,
        salesCount: 150,
        refundCount: 3,
        chargebackCount: 0,
        conversionRate: 2.5, // 2.5%
        averageTicket: 83.00
    },
    {
        productId: 'mentorship-002',
        productName: 'Mentoria Premium (High Ticket)',
        revenue: 25000.00,
        costs: {
            platformFees: 1250.00,
            taxes: 2500.00,
            affiliateCommissions: 0, // Direct sales
            teamCommissions: 2500.00, // High commision for closers
            adsSpend: 5000.00
        },
        netProfit: 13750.00,
        margin: 55.0,
        salesCount: 10,
        refundCount: 1,
        chargebackCount: 0,
        conversionRate: 0.8,
        averageTicket: 2500.00
    }
];

export const getProductFinanceStats = async (): Promise<ProductFinanceStats[]> => {
    // Dynamically calculate based on courses and students
    const courses = await getCourses();
    const mockStats: ProductFinanceStats[] = courses.map(course => {
        // --- INSTANCE SLOTS (NEW) ---
        // Mock revenue logic
        const revenue = course.id === 'course-001' ? 12450.00 : 8500.00;

        // Calculate costs
        const platformFees = revenue * 0.05; // 5%
        const taxes = revenue * 0.10; // 10%
        const affiliateCommissions = revenue * 0.15; // 15% avg
        const adsSpend = 2000;

        // --- NEW: API Costs Logic (Profit Share Base) ---
        // Mock student API usage
        const apiCosts = course.id === 'course-001' ? 450.50 : 120.00;

        return {
            productId: course.id,
            productName: course.title,
            revenue,
            costs: {
                platformFees,
                taxes,
                affiliateCommissions,
                teamCommissions: 0,
                adsSpend,
                apiCosts // Added this field
            },
            // NetProfit = CourseNet + AI Profit Share (Configurable % of Credit Net)
            // Logic: AI Net = (CreditSpend - APICost). Producer gets Commission of that.
            // Commission Rate comes from White Label Config
            // Default 5% if not set
            netProfit: (revenue - (platformFees + taxes + affiliateCommissions + adsSpend)) + ((revenue * 0.2 - apiCosts) * ((getWhiteLabelConfigSync().creditCommissionRate || 5) / 100)),
            margin: 0, // Recalculated below
            salesCount: Math.floor(revenue / 97),
            refundCount: 2,
            chargebackCount: 0,
            conversionRate: 1.2,
            averageTicket: 97.00
        };
    });

    // Recalculate margins
    mockStats.forEach(s => {
        s.margin = (s.netProfit / s.revenue) * 100;
    });

    return mockStats;
};

// NEXUS CONSULTANCY MOCKS
const mockConsultancyReports: Record<string, ConsultancyReport> = {
    'course-001': {
        productId: 'course-001',
        healthScore: 68,
        marketStats: {
            averageTicket: 97.00, // Market is higher (Yours is 83)
            averageConversion: 1.5, // Market is lower (Yours is 2.5 - Good!)
            topPerformerConversion: 4.0
        },
        insights: [
            "Seu ticket médio (R$ 83) está 15% abaixo da média do mercado (R$ 97).",
            "Sua conversão (2.5%) é EXCELENTE, acima da média (1.5%).",
            "O tráfego está baixo. Você converte bem quem chega, mas chega pouca gente."
        ],
        actionPlan: [
            {
                id: 'act-01',
                title: 'Aumentar Preço para R$ 97,00',
                description: 'Seu produto entrega muito valor e converte bem. O mercado paga mais.',
                impact: 'high',
                effort: 'low',
                status: 'pending'
            },
            {
                id: 'act-02',
                title: 'Escalar Tráfego (Nexus Ads)',
                description: 'Aumente o budget de Ads. Sua máquina de vendas está validada.',
                impact: 'high',
                effort: 'medium',
                toolId: 'nexus_ads',
                status: 'pending'
            }
        ]
    }
};

export const getConsultancyReport = async (productId: string): Promise<ConsultancyReport | null> => {
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1500));
    return loadJSON(`mockConsultancy_${productId}`, mockConsultancyReports[productId] || null);
};


// --- WALLET & CREDITS MOCKS ---

let mockProducerWallet: ProducerWallet = {
    producerId: 'user-123',
    balance: 450.00,
    transactions: [
        { id: 'tx-now', producerId: 'user-123', type: 'credit', amount: 200, description: 'Recarregar via PIX', category: 'purchase', timestamp: Date.now(), gatewayId: 'pi_3M9uCK...' },
        { id: 'tx-2d', producerId: 'user-123', type: 'debit', amount: 50, description: 'Análise de Funil - Nexus IA', category: 'service_usage', timestamp: Date.now() - 86400000 * 2 },
        { id: 'tx-8d', producerId: 'user-123', type: 'credit', amount: 1000, description: 'Campanha de Premiação Afiliados', category: 'bonus', timestamp: Date.now() - 86400000 * 8, gatewayId: 'pi_3L8vAB...' },
        { id: 'tx-20d', producerId: 'user-123', type: 'debit', amount: 150, description: 'Automação WhatsApp (300 disparos)', category: 'service_usage', timestamp: Date.now() - 86400000 * 20 },
        { id: 'tx-45d', producerId: 'user-123', type: 'credit', amount: 500, description: 'Bônus de Boas-vindas Nexus', category: 'bonus', timestamp: Date.now() - 86400000 * 45 }
    ]
};

let mockCreditRequests: CreditRequest[] = [
    { id: 'req-1', producerId: 'user-123', producerName: 'Carlos Produtor', amount: 1000, reason: 'Escalar time de suporte na Black Friday.', status: 'pending', requestedAt: new Date(Date.now() - 3600000).toISOString() }
];

export const getProducerWallet = async (): Promise<ProducerWallet> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProducerWallet;
};

export const requestCredits = async (amount: number, reason: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newRequest: CreditRequest = {
        id: `req-${Date.now()}`,
        producerId: 'user-123', // Mocked user
        producerName: 'Carlos Produtor',
        amount,
        reason,
        status: 'pending',
        requestedAt: new Date().toISOString()
    };
    mockCreditRequests = [newRequest, ...mockCreditRequests];
};

export const getPendingCreditRequests = async (): Promise<CreditRequest[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockCreditRequests.filter(r => r.status === 'pending');
};

export const respondToCreditRequest = async (requestId: string, status: 'approved' | 'rejected', feedback: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const requestIndex = mockCreditRequests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) return;

    const request = mockCreditRequests[requestIndex];
    const updatedRequest = { ...request, status, feedback, respondedAt: new Date().toISOString(), respondedBy: 'Admin' };
    mockCreditRequests[requestIndex] = updatedRequest;

    if (status === 'approved') {
        // Credit the wallet
        const newTx: WalletTransaction = {
            id: `tx-${Date.now()}`,
            producerId: request.producerId,
            type: 'credit',
            amount: request.amount,
            description: `Aprovação de Créditos: ${feedback}`,
            category: 'purchase',
            timestamp: Date.now()
        };
        mockProducerWallet.balance += request.amount;
        mockProducerWallet.transactions = [newTx, ...mockProducerWallet.transactions];
    }

    // Simulate Chat Notification (Console Log for now)
    const feedbackTag = '[FEEDBACK]';
    const message = status === 'approved'
        ? `Sua solicitação de ${request.amount} créditos foi APROVADA! Obs: ${feedback}`
        : `Sua solicitação de ${request.amount} créditos foi REJEITADA. Motivo: ${feedback}`;

    console.log(`${feedbackTag} Notification sent to ${request.producerName}: ${message}`);
    // In a real app, you would call sendSystemNotification here
};

export const debitWallet = async (amount: number, description: string, category: WalletTransaction['category']): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (mockProducerWallet.balance < amount) return false;

    const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        producerId: mockProducerWallet.producerId,
        type: 'debit',
        amount,
        description,
        category,
        timestamp: Date.now()
    };


    mockProducerWallet.balance -= amount;
    mockProducerWallet.transactions = [newTx, ...mockProducerWallet.transactions];
    return true;
};

// --- UNIFIED WALLET & SHOP ---

export const buyCredits = async (target: 'student' | 'producer', amount: number, paymentMethod: string, pricePaid?: number): Promise<boolean> => {
    // Simulate Payment Processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const timestamp = new Date().toISOString();
    const description = `Compra de Créditos (${amount}) via ${paymentMethod}`;

    if (target === 'producer') {
        mockProducerWallet.balance += amount;
        mockProducerWallet.transactions.unshift({
            id: `tx-buy-${Date.now()}`,
            producerId: mockProducerWallet.producerId,
            type: 'credit',
            amount,
            description,
            category: 'purchase',
            timestamp: Date.now(),
            gatewayId: `pi_live_${Math.random().toString(36).substr(2, 9)}`
        });
        return true;
    } else {
        // Mock Student Wallet Update
        // In real app, we would find the student by ID
        const student = mockStudents.find(s => s.uid === 'student-01'); // Mock specific student
        if (student) {
            student.creditBalance = (student.creditBalance || 0) + amount;
            student.walletTransactions = student.walletTransactions || [];
            student.walletTransactions.unshift({
                id: `tx-buy-stud-${Date.now()}`,
                producerId: student.uid,
                type: 'purchase',
                category: 'purchase',
                amount,
                toolId: 'shop',
                description,
                timestamp: Date.now(),
                gatewayId: `pi_live_${Math.random().toString(36).substr(2, 9)}`,
                pocketUsed: 'global',
                balanceSnapshot: student.creditBalance
            });
            saveJSON('mockStudents', mockStudents); // Persist

            // --- NEXUS COMMISSION LOGIC (USAGE-BASED MODEL) ---
            // In the Usage-Based model, we DO NOT pay commission on purchase.
            // We only record the Revenue (Cash Flow) and potential liability.
            // Commission is triggered in 'consumeCredits' when the service is actually rendered.

            if (pricePaid && pricePaid > 0) {
                const stats = loadJSON<ProductFinanceStats[]>('mockProductFinanceStats', []);
                let creditProduct = stats.find(p => p.productId === 'credit_recharges_global');
                if (!creditProduct) {
                    creditProduct = {
                        productId: 'credit_recharges_global',
                        productName: 'Recargas de Crédito (Global)',
                        revenue: 0,
                        costs: { platformFees: 0, taxes: 0, affiliateCommissions: 0, teamCommissions: 0, projectedCommissions: 0 },
                        netProfit: 0,
                        margin: 0,
                        salesCount: 0,
                        refundCount: 0,
                        chargebackCount: 0
                    };
                    stats.push(creditProduct);
                }

                // Apply Taxes & Fees (Cash Flow View)
                const platformFeeRate = 0.0499;
                const taxRate = 0.06;

                creditProduct.revenue += pricePaid;
                creditProduct.costs.platformFees += pricePaid * platformFeeRate;
                creditProduct.costs.taxes += pricePaid * taxRate;

                // Calculate Projected Liability (The "Pending" Pot)
                // We assume the producer *might* earn commission on the full net cash if costs are 0.
                // This gives them a "Max Potential" view.
                const settings = await getSystemSettings(); // Fetch dynamic %
                const commPct = settings.producerCommissionPercentage || 0;
                const netCash = pricePaid - (pricePaid * platformFeeRate) - (pricePaid * taxRate);
                const estimatedCommission = netCash * (commPct / 100);

                // Add to Projected (Pending)
                if (!creditProduct.costs.projectedCommissions) creditProduct.costs.projectedCommissions = 0;
                creditProduct.costs.projectedCommissions += estimatedCommission;

                // Net Profit here is just "Cash in Hand", not Realized Profit
                // We can track it as temporary net profit
                creditProduct.netProfit += netCash;
                creditProduct.salesCount += 1;

                saveJSON('mockProductFinanceStats', stats);
            }

            return true;
        }
    }
    return false;
};

export const transferCredits = async (from: 'student' | 'producer', to: 'student' | 'producer', amount: number): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mocks
    const student = mockStudents.find(s => s.uid === 'student-01');
    const producer = mockProducerWallet;

    if (!student) return { success: false, message: "Conta de aluno não encontrada." };

    const timestamp = new Date().toISOString();

    if (from === 'producer' && to === 'student') {
        if (producer.balance < amount) return { success: false, message: "Saldo corporativo insuficiente." };

        // Debit Producer
        producer.balance -= amount;
        producer.transactions.unshift({
            id: `tx-transfer-out-${Date.now()}`,
            producerId: producer.producerId,
            type: 'debit',
            amount,
            description: "Transferência para Conta Pessoal (Aluno)",
            category: 'transfer',
            timestamp: Date.now()
        });

        // Credit Student
        student.creditBalance = (student.creditBalance || 0) + amount;
        student.walletTransactions?.unshift({
            id: `tx-transfer-in-${Date.now()}`,
            producerId: student.uid,
            type: 'bonus', // Treated as bonus/transfer
            category: 'bonus',
            amount,
            toolId: 'transfer',
            description: "Recebido da Conta Corporativa",
            timestamp: Date.now(),
            pocketUsed: 'global',
            balanceSnapshot: student.creditBalance || 0
        });

    } else if (from === 'student' && to === 'producer') {
        if ((student.creditBalance || 0) < amount) return { success: false, message: "Saldo pessoal insuficiente." };

        // Debit Student
        student.creditBalance = (student.creditBalance || 0) - amount;
        student.walletTransactions?.unshift({
            id: `tx-transfer-out-${Date.now()}`,
            producerId: student.uid,
            type: 'usage', // Treated as usage/transfer
            category: 'team_cost',
            amount: -amount, // Negative for usage
            toolId: 'transfer',
            description: "Transferência para Conta Corporativa",
            timestamp: Date.now(),
            pocketUsed: 'global',
            balanceSnapshot: student.creditBalance || 0
        });

        // Credit Producer
        producer.balance += amount;
        producer.transactions.unshift({
            id: `tx-transfer-in-${Date.now()}`,
            producerId: producer.producerId,
            type: 'credit',
            amount,
            description: "Recebido da Conta Pessoal",
            category: 'transfer',
            timestamp: Date.now()
        });
    }

    saveJSON('mockStudents', mockStudents);
    return { success: true, message: "Transferência realizada com sucesso!" };
};

export const getStudentWalletBalance = async (studentId: string): Promise<number> => {
    const student = mockStudents.find(s => s.uid === studentId);
    return student?.creditBalance || 0;
};

// --- NEXUS CONSULTANCY: WINNING DB ---

const WINNING_PRODUCTS_DB: WinningProductProfile[] = [
    {
        id: 'win-health-01',
        name: 'Método Seca Barriga 30D',
        marketplaceUrl: '/marketplace/seca-barriga-30d',
        niche: 'Health',
        monthlyRevenue: 154000,
        conversionRate: 4.8,
        trafficSources: ['Facebook', 'Instagram', 'Taboola'],
        funnelTactics: ['VSL (12m)', 'Order Bump (Recipe Book)', 'Downsell (Community)'],
        psychologicalTriggers: { scarcity: 8, urgency: 9, socialProof: 10, authority: 7 },
        adSentiment: 'Fear',
        secretWeapons: ['WhatsApp Recovery Bot', 'Quiz Funnel Pre-Sell']
    },
    {
        id: 'win-wealth-01',
        name: 'Mestres do Bitcoin',
        marketplaceUrl: '/marketplace/mestres-do-bitcoin',
        niche: 'Wealth',
        monthlyRevenue: 320000,
        conversionRate: 2.9,
        trafficSources: ['YouTube', 'Google Search', 'Telegram'],
        funnelTactics: ['Webinar (Live)', 'Application Form', 'High-Ticket Upsell'],
        psychologicalTriggers: { scarcity: 6, urgency: 7, socialProof: 9, authority: 10 },
        adSentiment: 'Greed',
        secretWeapons: ['Vsl Autoplay', 'Social Proof Popups']
    }
];

export const getWinningProductMatch = async (dna: ProductDNA | null): Promise<WinningProductProfile | null> => {
    await delay(1000); // Simulate AI crunching
    if (!dna) return WINNING_PRODUCTS_DB[0];
    return WINNING_PRODUCTS_DB.find(p => p.niche === dna.niche) || WINNING_PRODUCTS_DB[0];
};

export const runNexusForensics = async (productId: string) => {
    await delay(3000); // Simulate deep scanning
    // In real app, this would analyze user's funnel URLs
    return {
        scanned: true,
        detectedIssues: ['Slow Loading Speed', 'Weak Headline', 'No Order Bump'],
        techStack: ['WordPress', 'Manual Recovery'],
        healthScore: Math.floor(Math.random() * 30) + 40 // Mock low score
    };
};

// --- OCR SIMULATION ---
export const simulateOCRProcessing = async (file: File): Promise<OCRResult> => {
    await delay(2500); // Simulate processing time
    const fileName = file.name.toLowerCase();

    // Simple heuristic for simulation
    const amountMatch = fileName.match(/(\d+)/);
    const amount = amountMatch ? parseInt(amountMatch[0]) : 1500;

    // Simulate some inconsistencies if the filename contains "err" or "mismatch"
    const hasError = fileName.includes('err') || fileName.includes('mismatch');

    return {
        extractedAmount: hasError ? amount * 0.9 : amount,
        extractedDate: new Date().toISOString(),
        extractedBeneficiary: "Empresa de Serviços SA",
        confidence: hasError ? 0.65 : 0.98,
        auditStatus: hasError ? 'inconsistent' : 'consistent',
        inconsistencies: hasError ? ['Valor extraído diverge do informado pelo agente', 'Beneficiário não coincide com o registro histórico'] : []
    };
};

// --- ACCOUNTS PAYABLE ---
export const createPayable = async (payable: Omit<AccountPayable, 'id' | 'createdAt' | 'status'>) => {
    await delay(1000);
    const newPayable: AccountPayable = {
        ...payable,
        id: `ap-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    mockAccountsPayable.unshift(newPayable);
    saveJSON('mockAccountsPayable', mockAccountsPayable);
    return newPayable;
};

export const getPayables = async () => {
    await delay(800);
    return mockAccountsPayable;
};

export const updatePayableStatus = async (id: string, status: AccountPayable['status']) => {
    await delay(500);
    const index = mockAccountsPayable.findIndex(p => p.id === id);
    if (index !== -1) {
        mockAccountsPayable[index].status = status;
        saveJSON('mockAccountsPayable', mockAccountsPayable);
    }
};

// --- FINANCIAL AUDITING ---
export const auditPayment = (manualData: any, ocrData: OCRResult): 'consistent' | 'inconsistent' => {
    // Logic to check for mismatches
    const amountMismatch = Math.abs(manualData.amount - ocrData.extractedAmount) > 0.01;

    // In a real scenario, we would check dates and beneficiary names too
    // For now, we use the simulation's decision if available, otherwise check amount
    if (ocrData.auditStatus === 'inconsistent') return 'inconsistent';
    return amountMismatch ? 'inconsistent' : 'consistent';
};

export const suggestEconomy = async () => getNexusEconomyAdvice();

export const createAuditTicket = async (ticket: Omit<FinancialAuditTicket, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'adminNotes'>) => {
    await delay(800);
    const newTicket: FinancialAuditTicket = {
        ...ticket,
        id: `audit-${Date.now()}`,
        status: 'open',
        adminNotes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    mockFinancialAudits.unshift(newTicket);
    saveJSON('mockFinancialAudits', mockFinancialAudits);
    return newTicket;
};

// Link Tracker Mock
export const getLinkClicks = async (linkId: string) => {
    await delay(300);
    return Math.floor(Math.random() * 1000);
};

// --- Medical Certificates (RH) ---

let medicalCertificates: any[] = [
    {
        id: 'cert-001',
        userId: 'user-support-01',
        userName: 'Maria (Suporte)',
        date: Date.now() - 86400000,
        fileUrl: 'https://example.com/atestado.jpg',
        status: 'pending',
        ocrData: {
            doctorName: 'Dr. House',
            crm: '12345-SP',
            daysOff: 2,
            cid: 'J00',
            issueDate: '2025-10-10'
        }
    }
];

export const uploadMedicalCertificate = async (file: File, userId: string, userName: string) => {
    await delay(2000); // Simulate upload + OCR processing

    // Simulate OCR Extraction
    const mockOCR = {
        doctorName: 'Dr. Simulado da Silva',
        crm: '99999-SP',
        daysOff: Math.floor(Math.random() * 5) + 1,
        cid: 'Z00.0',
        issueDate: new Date().toISOString().split('T')[0]
    };

    const newCert = {
        id: `cert-${Date.now()}`,
        userId,
        userName,
        date: Date.now(),
        fileUrl: URL.createObjectURL(file), // Mock URL
        status: 'pending',
        ocrData: mockOCR
    };

    medicalCertificates.unshift(newCert);
    return newCert;
};

export const getMedicalCertificates = async () => {
    await delay(500);
    return [...medicalCertificates];
};

export const updateMedicalCertificateStatus = async (id: string, status: 'approved' | 'rejected', data?: { reason?: string, accountingEmail?: string }) => {
    await delay(800);
    const index = medicalCertificates.findIndex(c => c.id === id);
    if (index === -1) return false;

    medicalCertificates[index] = {
        ...medicalCertificates[index],
        status,
        rejectionReason: data?.reason,
        forwardedToAccounting: status === 'approved',
        accountingEmail: data?.accountingEmail
    };
    return true;
};

// --- Productivity Mock ---

export const getTeamProductivity = async () => {
    await delay(600);
    // Mock Data
    return [
        {
            userId: 'user-support-01',
            userName: 'Maria (Suporte)',
            role: 'support',
            date: new Date().toISOString().split('T')[0],
            timeLoggedInMinutes: 480, // 8h
            timeActiveMinutes: 320,   // ~5.3h
            efficiencyScore: 66,
            tasksCompleted: 15,
            aiAnalysis: "Usuário com longo tempo de inatividade no período da tarde. Sugere-se verificar demanda.",
            npsScore: 85
        },
        {
            userId: 'user-sales-01',
            userName: 'Carlos (Vendas)',
            role: 'sales',
            date: new Date().toISOString().split('T')[0],
            timeLoggedInMinutes: 450,
            timeActiveMinutes: 420,
            efficiencyScore: 93,
            tasksCompleted: 42,
            aiAnalysis: "Alta produtividade constante. Candidato a bônus de performance.",
            npsScore: 92
        },
        {
            userId: 'user-finance-01',
            userName: 'Ana (Financeiro)',
            role: 'finance',
            date: new Date().toISOString().split('T')[0],
            timeLoggedInMinutes: 500,
            timeActiveMinutes: 200,
            efficiencyScore: 40,
            tasksCompleted: 5,
            aiAnalysis: "ATENÇÃO: Tempo logado alto incompatível com atividade registrada. Possível 'idle' excessivo.",
            npsScore: 45
        }
    ];
};


export const getAuditTickets = async () => {
    await delay(800);
    return mockFinancialAudits;
};

export const addAdminNoteToAudit = async (ticketId: string, note: string) => {
    await delay(500);
    const index = mockFinancialAudits.findIndex(t => t.id === ticketId);
    if (index !== -1) {
        mockFinancialAudits[index].adminNotes.push(note);
        mockFinancialAudits[index].updatedAt = new Date().toISOString();
        saveJSON('mockFinancialAudits', mockFinancialAudits);
    }
};

export const resolveAuditTicket = async (ticketId: string, clarification: string) => {
    await delay(500);
    const index = mockFinancialAudits.findIndex(t => t.id === ticketId);
    if (index !== -1) {
        mockFinancialAudits[index].agentClarification = clarification;
        mockFinancialAudits[index].status = 'resolved';
        mockFinancialAudits[index].updatedAt = new Date().toISOString();
        saveJSON('mockFinancialAudits', mockFinancialAudits);
    }
};

// --- NEXUS IA ECONOMY SUGGESTIONS ---
export const getNexusEconomyAdvice = async () => {
    await delay(1500);
    return [
        {
            category: 'Tecnologia',
            currentCost: 15400,
            suggestion: 'Migrar do plano Enterprise para Pro na ferramenta X',
            potentialSaving: 3200,
            impact: 'low'
        },
        {
            category: 'Marketing',
            currentCost: 45000,
            suggestion: 'Reduzir investimento em canais com CPA acima de R$ 45',
            potentialSaving: 12000,
            impact: 'medium'
        }
    ];
};

// --- MANAGER COMMISSIONS & FINANCE ---
export const getManagerCommissionQueue = async () => {
    await delay(800);
    // Find managers (mock logic: finding users with isSalesManager=true or role='sales_manager')
    // Since initialTeamUsers might not have them all, we'll mock a few result items.

    return [
        {
            managerId: 'manager-1',
            managerName: 'Carlos Gerente',
            teamSize: 5,
            teamRevenue: 150000,
            commissionRate: 5, // 5% override
            pendingAmount: 7500,
            period: 'Janeiro 2026'
        },
        {
            managerId: 'manager-2',
            managerName: 'Fernanda Líder',
            teamSize: 8,
            teamRevenue: 220000,
            commissionRate: 3,
            pendingAmount: 6600,
            period: 'Janeiro 2026'
        }
    ];
};

export const sendManagerNotification = async (managerId: string, amount: number, proofUrl: string) => {
    await delay(1000);
    console.log(`[NOTIFICATION] Payment of R$ ${amount} confirmed for Manager ${managerId}. Proof: ${proofUrl}`);
    return true;
};

// --- LEADS & WHATSAPP MOCKS ---

export const getWhatsAppChat = async () => {
    await delay(500);
    // Return sample chat messages
    return [
        {
            id: 'mw-1',
            text: 'Olá, gostaria de saber mais sobre o curso.',
            sender: 'lead',
            timestamp: Date.now() - 86400000,
            status: 'read',
            type: 'text'
        },
        {
            id: 'mw-2',
            text: 'Claro! Como posso ajudar?',
            sender: 'agent',
            timestamp: Date.now() - 86350000,
            status: 'read',
            type: 'text'
        }
    ];
};

export const sendEvolutionMessage = async (phone: string, text: string) => {
    await delay(600);
    console.log(`[EVOLUTION API] Sending to ${phone}: ${text}`);
};

export const claimLead = async (leadId: string, userId: string) => {
    await delay(400);
    const lead = mockLeads.find(l => l.id === leadId);
    if (lead) {
        lead.assignedTo = userId;
        lead.status = 'in_progress';
        saveJSON('mockLeads', mockLeads);
    }
};

export const markLeadAsRead = async (leadId: string) => {
    await delay(200);
    const lead = mockLeads.find(l => l.id === leadId);
    if (lead) {
        lead.unreadCount = 0;
        saveJSON('mockLeads', mockLeads);
    }
};

export const createSalesPerson = async (data: { displayName: string, email: string, phone: string, role: string, dailyGoal: number }) => {
    await delay(1000);

    // 0. Check for duplicate email
    const currentTeam = await getSalesTeam();
    if (currentTeam.some(u => u.email === data.email)) {
        throw new Error("Este email já está sendo usado por outro membro da equipe.");
    }

    const newId = `sales-${Date.now()}`;
    const newSalesPerson: SalesPerson = {
        uid: newId,
        displayName: data.displayName,
        email: data.email,
        photoURL: null,
        role: (data.role as any) || 'sales_agent',
        status: 'online',
        salesToday: 0,
        dailyGoal: data.dailyGoal,
        revenueToday: 0,
        averageResponseTime: 0,
        registrationCompleted: false,
        leadsAttended: 0,
        commissions: []
    };

    // 1. Save User
    currentTeam.push(newSalesPerson);
    // In a real app we would save to a persistent store
    // mockSalesTeam = currentTeam; 

    // 2. Auto-Affiliate to ADMIN Products Only (Safeguard)
    const allProducts = await getAppProducts();
    // Filter for products that are either generic platform products (no owner) or belong to the admin
    const products = allProducts.filter(p => !p.ownerId || p.ownerId === 'admin_id' || p.ownerId === 'mestre_15x');
    const links: any[] = [];

    for (const product of products) {
        const linkRequest = {
            id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            userId: newId,
            userName: data.displayName,
            productId: product.id,
            productName: product.name,
            status: 'approved', // Auto-approve
            commissionRate: 50, // Default 50% for Sales Team
            requestedAt: new Date().toISOString(),
            linkUrl: `https://mestre15x.com/ref/${newId}/${product.id}`,
            clicks: 0,
            sales: 0
        };
        links.push(linkRequest);
    }
    console.log(`[AUTO-AFFILIATION] Generated ${links.length} affiliate links for ${data.displayName}`);

    // 3. Send Invite (DUAL CHANNEL)
    const inviteLink = `https://admin.mestre15x.com/setup/${newId}`;

    // Channel A: WhatsApp
    if (data.phone) {
        await sendEvolutionMessage(data.phone, `Bem-vindo ao time Mestre 15X! Seu acesso foi criado. Login: ${data.email}. Complete seu cadastro em: ${inviteLink}`);
    }

    // Channel B: Email (Mock)
    console.log(`[EMAIL MOCK] Sending invite to ${data.email} with link ${inviteLink}`);
    // await sendEmailInvite(data.email, inviteLink); // Hypothetical service call

    return newSalesPerson;
};

export const uploadFileToStorage = async (file: File, onProgress?: (p: number) => void): Promise<string> => {
    await delay(1500);
    if (onProgress) onProgress(100);
    return URL.createObjectURL(file);
};

// --- WHITE LABEL ADMIN CONFIG ---
export const getWhiteLabelConfig = async () => {
    return loadJSON('mockWhiteLabelConfig', initialWhiteLabelConfig);
};

export const saveWhiteLabelConfig = async (config: any) => {
    saveJSON('mockWhiteLabelConfig', config);
    return config;
};

// --- CREDIT POPUP CONFIG ---
// --- CREDIT POPUP CONFIG ---
export const getCreditPopupConfig = async (): Promise<CreditSystemConfig> => {
    return loadJSON<CreditSystemConfig>('mockCreditPopupConfig', {
        lowBalanceTrigger: 50,
        insufficientBalance: {
            overlayColor: '#000000',
            cardBackgroundColor: '#111827',
            titleText: 'Saldo Insuficiente',
            titleColor: '#FFFFFF',
            messageText: 'Você precisa de mais créditos para realizar esta ação.',
            messageColor: '#9CA3AF',
            confirmButton: { label: 'Recarregar Agora', bgColor: '#9333EA', textColor: '#FFFFFF', actionUrl: '/painel/credits' },
            cancelButton: { label: 'Cancelar', bgColor: '#374151', textColor: '#9CA3AF' },
            additionalLinks: [],
            iconType: 'alert'
        },
        confirmUsage: {
            overlayColor: '#000000',
            cardBackgroundColor: '#111827',
            titleText: 'Confirmar Utilização',
            titleColor: '#FFFFFF',
            messageText: 'Esta análise consumirá créditos do seu saldo. Deseja continuar?',
            messageColor: '#9CA3AF',
            confirmButton: { label: 'Confirmar e Continuar', bgColor: '#10B981', textColor: '#FFFFFF' }, // Green for confirmation
            cancelButton: { label: 'Cancelar', bgColor: '#374151', textColor: '#9CA3AF' },
            additionalLinks: [],
            iconType: 'check'
        }
    });
};

export const saveCreditPopupConfig = async (config: CreditSystemConfig): Promise<void> => {
    saveJSON('mockCreditPopupConfig', config);
    await delay(300);
};

// --- COST OPTIMIZATION ---
export const archiveInactiveStudents = async () => {
    // Mock logic: find students inactive for > 30 days and mark as 'archived' in a real DB
    // Here we just return a simulated report
    await delay(1000);
    const students = await getStudents();
    const inactiveCount = Math.floor(Math.random() * 5); // Simulate finding 0-5 inactive students

    return {
        archivedCount: inactiveCount,
        savedCost: inactiveCount * 29.90 // Mock saving based on typical base fee
    };
};

// --- GRATITUDE JOURNAL ---
export const saveGratitudeEntry = async (entry: Omit<GratitudeEntry, 'id' | 'date'>) => {
    const entries = loadJSON<GratitudeEntry[]>('mockGratitudeEntries', []);
    const newEntry: GratitudeEntry = {
        ...entry,
        id: `gratitude-${Date.now()}`,
        date: new Date().toISOString()
    };
    entries.push(newEntry);
    saveJSON('mockGratitudeEntries', entries);
    return newEntry;
};

export const getGratitudeEntries = async (studentId: string) => {
    const entries = loadJSON<GratitudeEntry[]>('mockGratitudeEntries', []);
    return entries.filter(e => e.studentId === studentId);
};

export const checkDailyAccess = async (userId: string): Promise<{ authorized: boolean; remainingDays: number; message: string }> => {
    await delay(300);
    const users = loadJSON<any[]>('mockUsers', initialUsers);
    const userIndex = users.findIndex(u => u.uid === userId);

    if (userIndex === -1) return { authorized: false, remainingDays: 0, message: 'User not found' };

    const user = users[userIndex];
    if (user.role !== 'student') return { authorized: true, remainingDays: 999, message: 'Staff Access' };

    // Default Bank if not set (Migration strategy)
    if (user.accessDaysBank === undefined) {
        user.accessDaysBank = 30; // Grant 30 days trial/start
        user.lastAccessDate = '';
    }

    const today = new Date().toDateString();

    // 1. Same Day Logic
    if (user.accessDaysBank > 0 && user.lastAccessDate === today) {
        // Access already granted for today, no decrement.
        return { authorized: true, remainingDays: user.accessDaysBank, message: 'Access Valid' };
    }

    // 2. New Day Logic - Attempt to consume 1 key
    if (user.accessDaysBank > 0) {
        user.accessDaysBank -= 1;
        user.lastAccessDate = today;
        user.dailyUsage = 0; // Reset Daily Limits

        users[userIndex] = user;
        saveJSON('mockUsers', users);

        return { authorized: true, remainingDays: user.accessDaysBank, message: 'Day Consumed' };
    }
    // 3. Bank Empty
    return { authorized: false, remainingDays: 0, message: 'Plano de Acesso Expirado' };
};

export const getSystemSettings = async (): Promise<SystemSettings> => {
    return loadJSON<SystemSettings>('mockSystemSettings', {
        allowSignup: true,
        maintenanceMode: false,
        producerCommissionPercentage: 0,
        purchaseLink: '#',
        forgotPasswordLink: '#',
        supportLink: '#',
        mestreIAMaintenance: false,
        globalProtectionThreshold: 10
    });
};

export const saveSystemSettings = async (settings: SystemSettings) => {
    saveJSON('mockSystemSettings', settings);
    return settings;
};

// --- WITHDRAWAL & PAYOUT LOGIC (BATCH PROCESSING) ---

export const getWithdrawalQueue = async () => loadJSON<WithdrawalRequest[]>('mockWithdrawalQueue', []);

export const requestWithdrawal = async (producerId: string, amount: number, sourceType: 'manual_sales' | 'auto_commission'): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    const wallet = await getProducerWallet(); // In real app, this would get based on producerId

    // 1. Validation
    if (wallet.producerId !== producerId) {
        // In logic for real multi-user, find the wallet. For mock, we reuse the single wallet if matches
    }

    // Check Balance (Simulated: Sales are 'Available' in wallet balance for now)
    // In real app, we separate 'Available' from 'Pending'. Assuming wallet.balance is AVAILABLE.
    if (wallet.balance < amount) return { success: false, message: "Saldo insuficiente." };
    if (amount < 50) return { success: false, message: "Valor mínimo para saque é R$ 50,00." };

    // 2. Lock Funds (Debit Wallet immediately to avoid double spend)
    // We create a 'Processing' transaction or similar
    const debitSuccess = await debitWallet(amount, "Bloqueio para Saque", "debit");
    if (!debitSuccess) return { success: false, message: "Erro ao debitar saldo." };

    // 3. Create Request
    const queue = await getWithdrawalQueue();
    const newRequest: WithdrawalRequest = {
        id: `wd-${Date.now()}`,
        producerId,
        producerName: "Carlos Produtor", // Should fetch name
        amount,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        scheduledFor: getNextBatchWindow(),
        sourceType
    };

    queue.push(newRequest);
    saveJSON('mockWithdrawalQueue', queue);

    return { success: true, message: "Solicitação realizada! O valor será processado na próxima janela de pagamento." };
};

export const getNextBatchWindow = (): string => {
    const now = new Date();
    // Logic: Windows at 10:00 and 16:00
    // If < 10, Next is Today 10:00
    // If > 10 and < 16, Next is Today 16:00
    // If > 16, Next is Tomorrow 10:00

    // Simple Mock Return:
    return new Date(now.getTime() + 3600000).toISOString(); // 1 hour from now for demo
};

export const processPayoutBatch = async (): Promise<{ processed: number, totalAmount: number }> => {
    // This function would be called by the CRON (or a button in Admin Debug)
    await delay(2000);
    const queue = await getWithdrawalQueue();
    const pending = queue.filter(r => r.status === 'pending');

    let processedCount = 0;
    let totalProcessed = 0;

    for (const req of pending) {
        // Simulate Stripe API Call
        req.status = 'processing';
        // await stripe.payouts.create(...)

        // Mock Success
        req.status = 'completed';
        req.processedAt = new Date().toISOString();
        req.stripePayoutId = `po_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        processedCount++;
        totalProcessed += req.amount;
    }

    saveJSON('mockWithdrawalQueue', queue);
    return { processed: processedCount, totalAmount: totalProcessed };
};

// --- OPERATIONS CENTER MOCK ---
export const getOperationsMetrics = async (): Promise<OperationsMetric[]> => {
    await delay(600);
    return [
        { label: 'Receita Hoje', value: 'R$ 14.520', trend: 'up', trendValue: '+12%', status: 'good', icon: 'DollarSign' },
        { label: 'Chamados Abertos', value: 42, trend: 'down', trendValue: '-5%', status: 'good', icon: 'MessageSquare' },
        { label: 'Saques Pendentes', value: 8, trend: 'neutral', trendValue: 'R$ 8.2k', status: 'warning', icon: 'CreditCard' },
        { label: 'Saúde do Sistema', value: '99.8%', trend: 'neutral', status: 'good', icon: 'Activity' },
    ];
};

export const getEscalationQueue = async (): Promise<EscalationTicket[]> => {
    await delay(600);
    return [
        {
            id: 'esc-001',
            type: 'finance',
            priority: 'critical',
            status: 'pending',
            title: 'Aprovação de Reembolso Alto Valor',
            description: 'Solicitação de reembolso de R$ 3.500,00 para o aluno João Silva. Valor acima do limite automático.',
            requestedBy: 'Fernanda Financeiro',
            requestedAt: new Date().toISOString(),
            actions: [{ label: 'Aprovar', action: 'approve' }, { label: 'Rejeitar', action: 'reject' }]
        },
        {
            id: 'esc-002',
            type: 'support',
            priority: 'high',
            status: 'in_progress',
            title: 'Cliente Ameaçando Procon',
            description: 'Aluno insatisfeito com o módulo 3, exige devolução fora do prazo. Tentativa de conciliação falhou.',
            requestedBy: 'Pedro Suporte',
            requestedAt: new Date(Date.now() - 3600000).toISOString(),
            actions: [{ label: 'Intervir no Chat', action: 'chat' }, { label: 'Autorizar Exceção', action: 'refund_exception' }]
        },
        {
            id: 'esc-003',
            type: 'system',
            priority: 'medium',
            status: 'pending',
            title: 'Integração Stripe Instável',
            description: 'Algumas transações estão retornando timeout intermitente.',
            requestedBy: 'System Monitor',
            requestedAt: new Date(Date.now() - 7200000).toISOString(),
            actions: [{ label: 'Ver Logs', action: 'logs' }]
        }
    ];
};

export const resolveEscalation = async (id: string, resolution: string) => {
    await delay(1000);
    toast.success(`Escalonamento ${id} resolvido: ${resolution}`);
    return true;
};

// --- ADVANCED FINANCIAL INTELLIGENCE MOCK ---
export const getGlobalPlatformStats = async () => {
    await delay(400);
    return {
        totalProducts: 124,
        totalStudents: 15420,
        totalPartners: 86,
        totalCommercialTeam: 12,
        activeSupportAgents: 8
    };
};

export const getWinningProducts = async (type: 'platform' | 'partner'): Promise<WinningProduct[]> => {
    await delay(500);
    const platformWinners: WinningProduct[] = [
        { id: 'win-01', name: 'Recarga Global de Créditos', owner: 'platform', unitsSold: 4500, netMargin: 92.5, trend: '+15%', status: 'high_performance' },
        { id: 'win-02', name: 'Mentoria Mestre nos Negócios', owner: 'platform', unitsSold: 850, netMargin: 88.0, trend: '+5%', status: 'stable' },
    ];

    const partnerWinners: WinningProduct[] = [
        { id: 'win-03', name: 'Curso de Tráfego Nexus', owner: 'partner', unitsSold: 2100, netMargin: 12.0, trend: '+22%', status: 'high_performance' },
        { id: 'win-04', name: 'Copywriting 2.0', owner: 'partner', unitsSold: 1200, netMargin: 10.5, trend: '-2%', status: 'warning' },
    ];

    return type === 'platform' ? platformWinners : partnerWinners;
};

export const getStudentDeepAudit = async (studentId: string) => {
    await delay(800);
    return {
        ltv: 2450.00,
        totalCreditsPurchased: 1500,
        apiCosts: 124.50,
        netProfit: 2325.50,
        purchasedCoursesCount: 4,
        productsPublishedCount: 1, // Example: Aluno also has his own product
        creditHistory: [
            { date: '2025-10-10', amount: 500, value: 450, gatewayId: 'pi_3M9uCK...' },
            { date: '2025-11-20', amount: 1000, value: 900, gatewayId: 'pi_3L8vAB...' }
        ],
        apiUsageMetrics: {
            gpt4: 120,
            claude: 45,
            imageGen: 12
        }
    };
};

export const getProductDeepAudit = async (productId: string) => {
    await delay(800);
    return {
        producerName: 'João Ferreira',
        producerId: 'prod-001',
        lifetimeVolume: 125000.00,
        refundRate: 1.2,
        netMarginDistribution: {
            producer: 85,
            platform: 10,
            taxes: 5
        },
        monthlySalesHistory: [
            { month: 'Jan', volume: 12000 },
            { month: 'Fev', volume: 15000 },
            { month: 'Mar', volume: 14500 }
        ]
    };
};

// --- INSTANCE SLOTS (NEW) ---

export const getProducerSlots = async (producerId: string): Promise<InstanceSlot[]> => {
    // In production, fetch from DB to see if slots are filled
    // Mock: Always empty or pre-filled for demo

    return [
        {
            id: 'slot_sales_main',
            label: 'Bot de Vendas Alex (Principal)',
            description: 'Canal oficial de atendimento. Focado em conversão 1 a 1 e Inbound.',
            role: 'sales',
            icon: 'Brain',
            safetyRules: ['block_mass_sending'],
            visualColor: 'green',
            status: 'connected',
            connectedInstanceId: 'inst-sales-01'
        },
        {
            id: 'slot_sales_backup',
            label: 'Bot de Vendas (Backup de Segurança)',
            description: 'Entra em ação automaticamente apenas se o Principal cair.',
            role: 'backup',
            icon: 'Shield',
            safetyRules: ['active_only_if_primary_down', 'block_mass_sending'],
            visualColor: 'gray',
            status: 'empty'
        },
        {
            id: 'slot_marketing',
            label: 'Disparo de Campanhas (Marketing)',
            description: 'Canal exclusivo para Broadcasting e lançamentos. Fila inteligente de 50/hora.',
            role: 'router',
            icon: 'Zap',
            safetyRules: ['throttle_sending'],
            visualColor: 'purple',
            status: 'empty'
        }
    ];
};




