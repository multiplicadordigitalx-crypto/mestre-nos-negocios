
export type StudentPage = 'dashboard' | 'training' | 'financial' | 'products' | 'marketing' | 'integrations' | 'funnels' | 'email_marketing' | 'nexus_ads' | 'support' | 'profile' | 'coach' | 'community' | 'mestre_ia' | 'my_results' | 'create_course' | 'wallet' | 'recharge' | 'producer_dashboard' | 'health_diary' | 'diario_alimentar' | 'jurista_ia' | 'knowledge_practice' | 'nexus_poliglota';

export type UserRole = 'student' | 'admin' | 'super_admin' | 'support' | 'support_agent' | 'sales_agent' | 'sales_manager' | 'influencer' | 'finance' | 'viewer' | 'coproducer' | 'affiliate';

export type ProductStatus = 'active' | 'inactive' | 'paused' | 'pending' | 'development' | 'archived';

export type PremiumToolId = 'nexus_ads' | 'diario_alimentar' | 'jurista_ia' | 'coach_ia' | 'funnels' | 'email_marketing' | 'marketing_pack' | 'health_pack' | 'finance_pack' | 'community_pro';

export interface PremiumTool {
    id: PremiumToolId;
    name: string;
    description: string;
    icon: string;
    baseSetupFee: number; // Cost to activate
    monthlyPerStudent: number; // Cost per student per month
    dilutedMarkupPercent: number; // Markup if paying diluted (e.g., 20%)
    recommendedNiche?: string[]; // E.g., ['health', 'slimming']
}

export interface FinancialModel {
    type: 'upfront' | 'diluted';
    setupFeePaid: boolean;
    dilutedFeePercent?: number; // Extra fee on sales
    dailyCreditLimit: number; // Controlled by producer
}

export interface SchoolConfig {
    ownerId: string;
    schoolName: string;
    subdomain: string;
    logoUrl?: string;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        backgroundColor?: string;
        sidebarColor?: string;
        accentColor?: string;
        logoUrl?: string;
    };
    welcomeMessage?: string;
    createdAt: number;
    premiumTools: PremiumToolId[]; // Activated tools
    financialModel?: FinancialModel;
    menuConfig?: StudentMenuItem[]; // Custom menu overrides
}

export interface StudentMenuItem {
    id: string;
    label: string;
    icon: string;
    path: string;
    isEnabled: boolean;
    isPremium?: boolean;
}


// Duplicate SystemSettings removed.

export interface SystemStatus {
    apiReady: boolean;
    lastSync: number;
    maintenance: boolean;
    activeNodes: number;
    queueCount: number;
    healthScore?: number;
    creditValueBRL?: number;
}

export interface WalletBucket {
    toolId: string;
    label: string;
    balance: number;
    icon: string;
}

// WalletTransaction is defined later under NEXUS WALLET & CREDITS section


export interface FinanceRequest {
    id: string;
    studentId: string;
    studentName: string;
    requesterId: string;
    requesterName: string;
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: number;
    type: 'credit_addition';
    feedback?: string;
    respondedAt?: number;
    respondedBy?: string;
}

// RefundRequest is defined later near line 478


export interface OnboardingData {
    filled: boolean;
    niche: string;
    answers: Record<string, string>;
    updatedAt?: string;
}

export interface AnamneseData extends OnboardingData { }


export interface UserSubscription {
    id: string;
    toolId: string;           // ex: 'wa_evolution_api'
    planName: string;         // ex: 'Mensal'
    status: 'active' | 'expired' | 'cancelled' | 'grace_period';
    startedAt: string;        // ISO Date
    expiresAt: string;        // ISO Date
    autoRenew: boolean;
    lastPaymentDate: string;
    cost: number;
}

export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string;
    purchaseDate?: string;
    role?: string;
    permissions?: any;
    hasMestreIA?: boolean;
    dailyMestreIALimit?: number;
    dailyUsage?: number;
    lastDailyReset?: string;
    password?: string;
    creditBalance?: number;
    walletBuckets?: WalletBucket[];
    walletTransactions?: WalletTransaction[];
    producerData?: ProducerBankData;
    onboarding?: OnboardingData;
    anamnese?: AnamneseData;
    cpf?: string;
    activeSubscriptions?: UserSubscription[];
}

export type CourseCategory = 'standard' | 'personal_master' | 'therapy_master' | 'slimming_master';

export interface PhysicalKitItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    requiresOCR: boolean;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    coverUrl: string;
    niche: string;
    transformation: string;
    instructor?: string;
    totalModules: number;
    salesChannels?: any[];
    category?: CourseCategory;
    aiConfig?: any;
    safetyConfig?: any;
    financialViability?: any;
    isPublished?: boolean;
    isAiPowered?: boolean;
    knowledgeIdeas?: string;
    schoolSubdomain?: string;
    setupProgress?: number;
}

export interface ProductStats {
    productId: string;
    productName: string;
    totalPosts: number;
    lastCheckIn: string;
    status: 'active' | 'pending_verification' | 'verified' | 'completed';
    history: { date: string, count: number }[];
    connectedAccounts?: ConnectedAccount[];
}

export interface ConnectedAccount {
    platform: 'tiktok' | 'instagram' | 'kwai' | 'youtube' | 'facebook';
    username: string;
    status: 'connected' | 'error' | 'expired';
    lastSync: string;
    totalPostsDetected: number;
}

export interface Student extends User {
    cpf: string;
    purchaseDate: string;
    purchaseValue: number;
    dailyUsage?: number;
    dailyMestreIALimit?: number;
    accessDaysBank?: number;
    lastAccessDate?: string;
    creditCommissionOwner?: string; // Producer ID entitled to commission
    creditCommissionExpiry?: string; // ISO Date when commission right expires
    dailyPosts: number;
    lastCheckIn?: string;
    completedLessons: string[];
    purchasedCourses?: string[];
    courseCompletionDate?: string;
    quizScores: Record<string, number>;
    productStats: ProductStats[];
    gamification: any;
    phone?: string;
    city?: string;
    state?: string;
    internalId?: string;
    producerData?: ProducerBankData;
    nexusActionPlan?: any[];
    incomeHistory?: any[];
    financial?: {
        status: 'approved' | 'refunded' | 'chargeback';
        paymentMethod: 'credit_card' | 'pix' | 'boleto';
        transactionId: string;
        refundRequested: boolean;
    };
    firstLogin?: string;
    lastLoginIp?: string;
    deviceInfo?: string;
}

export interface CoProducerInfo {
    name: string;
    email: string;
    phone: string;
    commissionPercent: number;
    status: 'pending' | 'active';
}

export interface ProductDNA {
    sevenGoldenQuestions: {
        moneyGainOrSave: string;
        timeSaved: string;
        tasksEliminated: string;
        painEliminated: string;
        statusAndEnvy: string;
        socialPopularity: string;
        healthAndVibrancy: string;
    };
    idealPersona: {
        ageRange: string;
        gender: string;
        mainPain: string;
        mainDesire: string;
        incomeLevel: string;
    };
    realPersona?: {
        ageRange: string;
        gender: string;
        mainPain: string;
        mainDesire: string;
        incomeLevel: string;
    };
    alignmentScore: number;
    lastRefinement: string;
    learningInsights: string[];
    universalObjections: {
        notForMe: string;
        noMoney: string;
        noTime: string;
        dontBelieveMethod: string;
        dontBelieveAuthor: string;
        procrastination: string;
        needApproval: string;
        triedEverything: string;
        fearOfFailure: string;
        costBenefit: string;
    };
    niche?: string;
}

export interface AppProduct {
    id: string;
    name: string;
    description: string;
    category?: string;
    price?: number;
    type?: 'Único' | 'Recorrência' | 'Assinatura';
    deliverableType?: 'course' | 'ebook' | 'link' | 'app' | 'event';
    contentSourceType?: 'internal' | 'external';
    internalResourceId?: string;
    externalAccessUrl?: string;
    schoolSubdomain?: string;
    eventDetails?: {
        date: string;
        location: string;
        address: string;
        maxTickets: number;
    };
    coverUrl?: string;
    publicInterest?: string;
    commission: number;
    integrations?: any[];
    checkoutLinks?: CheckoutLink[];
    dynamicCommissions?: any[];
    platform: string;
    externalId: string;
    landingPage: string;
    baseAffiliateLink: string;
    status: ProductStatus;
    unlockCriteria?: {
        module3: boolean;
        courseCompletion: boolean;
        loyalty: boolean;
    };
    stats: {
        totalSales: number;
        activeStudents: number;
        conversionRate?: number; // For consultancy analysis
        averageTicket?: number;
        revenue: number;
        mestreCommission: number;
    };
    affiliates?: any[];
    socials?: {
        instagram?: string;
        tiktok?: string;
        salesPage?: string;
        telegramGroup?: string;
    };
    createdAt?: string;
    autoApproveAffiliates?: boolean;
    acceptsAffiliation?: boolean;
    ownerId?: string;
    dna?: ProductDNA | null;
    plans?: ProductPlan[];
    hasCoProducer?: boolean;
    coProducer?: CoProducerInfo;
    transformationDescription?: string;
    schoolFeatures?: string[];
}

export interface ProductPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    anchorPrice?: number;
    billingType?: string;
    guaranteeDays?: number;
}

export interface CheckoutLink {
    id: string;
    platform: string;
    url: string;
    active: boolean;
}

export interface LessonMaterial {
    id: string;
    name: string;
    url: string;
    type: 'pdf' | 'image' | 'zip' | 'link';
    size?: string;
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctOptionIndex: number;
}

export interface Quiz {
    id: string;
    title: string;
    questions: Question[];
    minPassPercent: number;
    successMessage: string;
    failMessage: string;
}

export interface LessonCheckpoint {
    time: number; // Seconds
    type: 'quiz' | 'tool_redirect' | 'reflection';
    question?: string; // For Quizzes/Reflection
    toolId?: NexusToolId; // For Tool Redirect
    toolTaskLabel?: string; // "Draft Contract"
    completed?: boolean;
}

export interface Lesson {
    id: string;
    moduleId: string;
    title: string;
    description: string;
    duration: number;
    type: 'video' | 'text' | 'quiz';
    videoUrl?: string;
    videoSource?: 'youtube' | 'vimeo' | 'upload' | 'url';
    order: number;
    materials?: LessonMaterial[];
    // New AI Fields
    transcript?: string;
    checkpoints?: LessonCheckpoint[];
    quiz?: Quiz;
}

export interface TrainingModule {
    id: string;
    courseId: string;
    title: string;
    description?: string;
    order: number;
    lessons: Lesson[];
}

export interface ChatMessage {
    id: string;
    channelId: string;
    text: string;
    createdAt: number;
    user: {
        uid: string;
        name: string;
        avatar: string;
        role?: string;
        level?: string;
    };
    attachmentUrl?: string;
    messageType?: 'text' | 'image' | 'file';
    isInternal?: boolean;
}

export interface WhatsAppMessage {
    id: string;
    text: string;
    sender: 'lead' | 'agent' | 'bot' | 'human';
    agentName?: string;
    timestamp: number;
    status: 'sent' | 'delivered' | 'read';
    type: 'text' | 'image' | 'audio' | 'video' | 'link';
    mediaUrl?: string;
}

export interface ChatChannel {
    id: string;
    name: string;
    description: string;
    icon?: string;
    isLocked?: boolean;
    unreadCount?: number;
    moderators?: string[]; // Array of user UIDs
}

export interface SystemSettings {
    // Identity
    platformName?: string;
    logoUrl?: string;
    primaryColor?: string;

    // Contact & Support
    purchaseLink: string;
    forgotPasswordLink: string;
    supportLink: string;
    systemEmail?: string;
    whatsapp?: string;

    // Business Profile (Stripe & Emails)
    businessDomain?: string;
    businessEmail?: string;
    businessDescriptor?: string;

    // Control
    maintenanceMode?: boolean;
    allowSignup?: boolean;

    // Legacy / Other
    mestreIAMaintenance?: boolean;
    producerCommissionPercentage?: number;
    globalProtectionThreshold?: number;
    creditValueBRL?: number;
}

export interface ToolCost {
    toolId: string;
    toolName: string;
    costPerTask: number;
    realCostEstimate: number;
    profitMargin?: number;
    complexity: 'low' | 'medium' | 'high';
    // New Fields for White Label Strategy
    setupFeeCash?: number;
    monthlyProvision?: number;
    dilutedCommissionPercent?: number;
    platformSharePercent?: number; // Net Profit Share for Platform
    billingType?: 'usage' | 'monthly';

    // Financial Safety
    targetMargin?: number; // Desired margin to maintain (e.g. 50%)
    triggerThreshold?: number; // % deviation to trigger auto-adjust (default 10%)
    autoAdjust?: boolean; // Enable auto-balancing
    lastAutoAdjustment?: {
        date: number;
        oldPrice: number;
        newPrice: number;
        reason: 'margin_drop' | 'margin_recovery';
    };
}

export interface WhiteLabelConfig {
    platformBaseFee: number;
    creditCommissionRate: number; // 5% default (0.05)
    tools: {
        id: string;
        name: string;
        setupFee: number;
        monthlyCost: number;
        dilutedMarkup: number;
    }[];
}

export type InstanceRole = 'sales' | 'notifications' | 'support' | 'router' | 'backup' | 'sales_bot' | 'system_notifications' | 'support_human' | 'general';
export type InstanceStatus = 'connected' | 'disconnected' | 'banned' | 'maintenance';

export interface WhatsAppInstance {
    id: string;
    name: string;
    role: InstanceRole;
    status: InstanceStatus;
    ownerId: string; // 'platform' or Producer ID
    isBackup: boolean;
    backupForId?: string; // ID of the primary instance this backs up
    phoneNumber: string;
    qrCode?: string;
    healthScore: number;
    creditValueBRL?: number;
    activeChats: number;
    capabilities: ('sales' | 'notifications' | 'mass_sending')[];
    engine?: 'whatsmeow' | 'evolution'; // Optional for backward compatibility
    lastActivity?: Date;
    profilePic?: string;
    battery?: number;
    port?: number;
    ram?: string;
    goroutines?: number;
}

export type SafetyRule = 'block_mass_sending' | 'throttle_sending' | 'active_only_if_primary_down';

export interface InstanceSlot {
    id: string; // 'slot_sales_main', 'slot_sales_backup', 'slot_marketing'
    label: string;
    description: string;
    role: InstanceRole;
    icon: string; // Icon name
    safetyRules: SafetyRule[];
    connectedInstanceId?: string; // If connected, links to WhatsAppInstance
    status: 'empty' | 'connected' | 'error' | 'protecting';
    visualColor: 'green' | 'blue' | 'purple' | 'gray';
}

export interface PaymentMethod {
    id: string;
    label: string;
    url?: string;
    type: 'pix' | 'credit_card' | 'boleto' | 'generic';
    active: boolean;
}

export interface CreditCombo {
    id: string;
    name: string;
    credits: number;
    price: number;
    active: boolean;
    salesCount: number;
    validForTools?: string[];
    targetRole?: 'all' | 'student' | 'influencer';
    paymentLink?: string;
    paymentMethods?: PaymentMethod[];
    stripePriceId?: string; // Stripe Price ID for integration
    stripePaymentLink?: string; // Stripe Payment Link for direct checkout
}

export interface TreasureItem {
    id: string;
    flowId: string;
    flowName: string;
    createdAt: number;
    content: string;
    previewUrl?: string;
}

export interface NexusAction {
    id: string;
    category: 'Social Media' | 'Funil' | 'Campanha' | 'Produto';
    title: string;
    description: string;
    priority: 'Alta' | 'Média' | 'Baixa';
    status: 'pending' | 'completed';
    createdAt: number;
}

export interface GeminiMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export interface NexusAnalysisResult {
    totalAnalyzed: number;
    highRiskCount: number;
    highPerformanceCount: number;
    avgROI: number;
    timestamp: string;
    dataSources: string[];
    details: any[];
}

export interface SupportTicket {
    id: string;
    studentId: string;
    studentName: string;
    subject: string;
    status: 'open' | 'in_progress' | 'resolved' | 'pending_closure' | 'pending_finance' | 'pending_admin';
    priority: 'low' | 'medium' | 'high';
    createdAt: number;
    lastMessageAt: number;
    messages: ChatMessage[];
    nps?: any;
    unreadCount?: number;
    isEscalated?: boolean;
}

export interface LinkRequest {
    id: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentCpf: string;
    productName: string;
    socialLinks: {
        instagram?: string;
        tiktok?: string;
        kwai?: string;
        youtube?: string;
        facebook?: string;
    };
    requestDate: number;
    status: 'pending' | 'approved' | 'rejected';
    affiliateLink?: string;
    rejectionReason?: string;
}

export interface PaymentRoutingConfig {
    id: string;
    name: string;
    active: boolean;
    priority: number;
    platform: string;
    credentials: any;
}

export interface RefundRequest {
    id: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    userId: string;
    userName: string;
    userEmail: string;
    productName: string;
    amount: number;
    purchaseDate: number;
    requestDate: number;
    warrantyDeadline: number;
    retentionDeadline: number;
    status: 'pending_support' | 'pending_admin' | 'approved' | 'rejected' | 'refunded' | 'cancelled' | 'pending_retention' | 'dispute';
    reason: string;
    processedBy?: string;
    processedAt?: number;
    reversalJustification?: string;
}

export interface TeamUser {
    id: string;
    producerId?: string; // Links member to a specific producer
    name: string;
    email: string;
    phone?: string;
    role: 'super_admin' | 'support' | 'sales' | 'finance' | 'viewer';
    lastLogin: number;
    status: 'active' | 'blocked' | 'inactive';
    permissions: any;
    photoURL?: string;
    cpf?: string;
    unreadCount?: number;
    creditLimit?: number; // Limit for financial operations
    // Sales Specific
    isSalesManager?: boolean;
    managerId?: string; // If this user is a salesperson, who is their manager?
    commissionRate?: number; // % commission for own sales
    commissionOverrideRate?: number; // % commission for team sales (if manager)
    affiliateLink?: string;
    // HR Specific
    admissionDate?: string;
    salary?: number;
    dailyHours?: number;
    workDays?: number;
    npsScore?: number;
}

export interface MedicalCertificate {
    id: string;
    userId: string;
    userName: string;
    date: number; // Upload date
    fileUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    ocrData?: {
        doctorName: string;
        crm: string;
        daysOff: number;
        cid?: string;
        issueDate: string;
    };
    rejectionReason?: string;
    forwardedToAccounting?: boolean;
    accountingEmail?: string;
}

export interface WorkerProductivity {
    userId: string;
    userName: string;
    role: string;
    date: string;
    timeLoggedInMinutes: number;
    timeActiveMinutes: number;
    efficiencyScore: number; // 0-100
    tasksCompleted: number;
    aiAnalysis?: string;
}

export interface SalesPerson extends User {
    role: 'sales_agent' | 'sales_manager';
    status: 'online' | 'offline' | 'busy';
    registrationCompleted: boolean;
    dailyGoal: number;
    salesToday: number;
    revenueToday: number;
    leadsAttended: number;
    averageResponseTime: number;
    commissions: any[];
    termsAcceptedAt?: string; // ISO String of legal terms acceptance
    biometricProofUrl?: string; // Mock URL of facial/doc check
    cpf?: string;
    phone?: string;
    bankName?: string;
    pixKey?: string;
    managerId?: string;
    teamName?: string;
    productAffiliateLinks?: any;
    cnpj?: string;
    zipCode?: string;
    address?: string;
    addressNumber?: string;
    district?: string;
    city?: string;
    state?: string;
    bankAgency?: string;
    bankAccount?: string;
    pixKeyType?: 'cpf' | 'email' | 'phone' | 'random';
    unreadCount?: number;
    complement?: string;
    birthDate?: string;
}

export interface SupportAgent extends User {
    role: 'support_agent';
    status: 'online' | 'offline' | 'busy';
    ticketsResolved: number;
    npsScore: number;
    activeTickets: number;
    permissions: {
        approveLinks: boolean;
        chatSupport: boolean;
        viewFinance: boolean;
        sendNotifications: boolean;
        blockStudents: boolean;
        manageTeam: boolean;
        viewSensitiveData: boolean;
        recoverAccess: boolean;
    };
    unreadCount?: number;
}

export interface Lead {
    id: string;
    name: string;
    phone: string;
    productInterest: string;
    status: 'new' | 'in_progress' | 'closed' | 'lost' | 'bot_nurturing'; // added bot_nurturing
    assignedTo: string | null;
    lastInteraction: number;
    createdAt: number;
    messages: any[];
    tags?: string[];
    unreadCount?: number;
}

export interface SalesScript {
    id: string;
    title: string;
    category: string;
    content: string;
}

export interface UsageLimit {
    monthly_limit: number;
    current_usage: number;
    emergency_stop: boolean;
    last_reset: string;
}

export interface ActivityLog {
    id: string;
    userId: string;
    userName: string;
    userRole: string;
    action: string;
    target: string;
    timestamp: number;
    ipAddress: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    details?: string; // JSON stringified or detailed text
    metadata?: any;
}

export interface LoginAttemptLog {
    id: string;
    userId?: string;
    email?: string;
    timestamp: number;
    success: boolean;
    ipAddress: string;
    userAgent: string;
    reason?: string; // for failed attempts
    status?: string;
    ip?: string;
    device?: string;
    date?: number;
}

export interface EscalationTicket {
    id: string;
    type: 'finance' | 'support' | 'sales' | 'system';
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'in_progress' | 'resolved';
    title: string;
    description: string;
    requestedBy: string; // Agent Name
    requestedAt: string;
    relatedEntityId?: string; // e.g., Transaction ID, Student ID
    actions?: {
        label: string;
        action: string;
    }[];
}

export interface OperationsMetric {
    label: string;
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
    trendValue?: string;
    status: 'good' | 'warning' | 'critical';
    icon: string;
}

export interface WinningProduct {
    id: string;
    name: string;
    owner: 'platform' | 'partner';
    unitsSold: number;
    netMargin: number;
    trend: string;
    status: 'high_performance' | 'stable' | 'warning' | 'low';
}

export interface CoursePlan {
    courseId: string;
    courseName: string;
    updatedAt: number;
    tiers: {
        basic: any;
        pro: any;
        elite: any;
    };
}

export interface NexusPlanAnalysis {
    tier: string;
    estimatedInfrastructureCost: number;
    recommendedPriceMin: number;
    recommendedPriceOptimal: number;
    margin: number;
    warning?: string;
    advice: string;
}

export interface Variation {
    id: string;
    name: string;
    status: string;
    visits: number;
    conv: string;
    roas: number;
    cost: string;
    subdomain: string;
}

export interface SharedAccount {
    id: number;
    username: string;
    platform: 'TikTok' | 'Instagram' | 'YouTube' | 'Kwai';
    status: 'ONLINE' | 'OFFLINE';
    followers: string;
    responseTime: string;
    postingStatus?: 'idle' | 'posting' | 'success';
    product: string;
}

export interface PageItem {
    name: string;
    url: string;
    type: string;
    status: string;
}

export interface BuyerPersona {
    id: string;
    campaignName: string;
    adAccountName: string;
    platform: 'Meta Ads' | 'Google Ads';
    demographics: string;
    topInterests: string[];
    behavior: string;
    ltv: number;
    syncStatus: 'synced' | 'pending' | 'learning';
    lastSync: string;
}

export interface VerificationRequest {
    id: string;
    studentId: string;
    studentName: string;
    productName: string;
    totalPosts: number;
    requestDate: number;
    socialProfiles: { network: string, url: string }[];
    status: 'pending' | 'approved' | 'rejected';
}

export interface LevelUpRequest {
    id: string;
    studentId: string;
    studentName: string;
    currentLevel: string;
    nextLevel: string;
    requestDate: number;
}

export interface StorageLog {
    id: string;
    filename: string;
    size: string;
    type: string;
    uploadedAt: number;
    status: 'processing' | 'completed' | 'error';
    url: string;
}

export interface InfluencerProductStats {
    productId: string;
    productName: string;
    link: string;
    salesPageLink?: string;
    clicks: number;
    sales: number;
    conversionRate: number;
    earnings: number;
    pendingEarnings: number;
    customCommission: number;
    partnershipType?: 'Afiliado' | 'Influencer' | 'Co-produtor';
}

export interface Influencer extends User {
    uid: string;
    displayName: string;
    email: string;
    cpf: string;
    phone: string;
    photoURL: string;
    slug: string;
    status: 'active' | 'blocked' | 'pending';
    totalEarnings: number;
    availableBalance: number;
    password?: string;
    role?: 'influencer' | 'affiliate' | 'coproducer';
    partnershipType?: 'Influenciador' | 'Afiliado 50X';
    accountDescription?: string;
    socialLinks?: {
        instagram?: string;
        tiktok?: string;
        youtube?: string;
    };
    followers?: {
        instagram?: string;
        tiktok?: string;
        youtube?: string;
    };
    bankData?: {
        bankName: string;
        accountType: 'corrente' | 'poupanca';
        agency: string;
        accountNumber: string;
        holderName: string;
        holderNameCpf?: string;
        holderCpf: string;
        pixKey: string;
        pixKeyType: 'cpf' | 'email' | 'phone' | 'random';
    };
    products: InfluencerProductStats[];
}


export interface InfluencerRequest {
    id: string;
    name: string;
    email: string;
    socialMedia: string;
    followers: string;
    status: 'pending' | 'approved' | 'rejected';
}

export type PaymentGateway = 'Stripe' | 'Hotmart' | 'Kiwify' | 'Eduzz' | 'Braip' | 'Kirvano' | 'Keoto';

export interface TransactionHistoryLog {
    id: string;
    status: 'created' | 'authorized' | 'paid' | 'refused' | 'refunded' | 'chargeback' | 'withdraw_requested';
    timestamp: number;
    description: string;
    agentId?: string; // If action taken by agent
}

export interface RichTransaction {
    id: string;
    stripeId?: string; // External Gateway ID
    platform: PaymentGateway;
    amount: number;
    netAmount: number; // after fees
    currency: string;
    status: 'approved' | 'pending' | 'refused' | 'refunded' | 'chargeback' | 'processing';
    type: 'sale' | 'refund' | 'chargeback' | 'subscription_renewal';
    typeLabel?: string; // For display

    product: {
        id: string;
        name: string;
    };

    customer: {
        name: string;
        email: string;
        cpf: string;
        ip?: string;
        phone?: string;
    };

    paymentMethod: {
        type: 'credit_card' | 'pix' | 'boleto';
        details: string; // "Mastercard **** 1234" or Pix Key
        brand?: string;
        installments?: number;
    };

    dates: {
        created: string;
        authorized?: string;
        paid: string;
        refunded?: string;
        availableForWithdraw: string; // Previsão de saque
    };

    history: TransactionHistoryLog[];

    refundReason?: string;
    refundedBy?: string;
}


export interface OCRResult {
    extractedAmount?: number;
    extractedDate?: string;
    extractedBeneficiary?: string;
    confidence: number; // 0-1
    auditStatus: 'consistent' | 'inconsistent' | 'pending';
    inconsistencies?: string[];
}

export interface CommissionPayment {
    id: string;
    managerId: string;
    managerName: string;
    amount: number;
    period: string;
    paymentDate: number;
    proofUrl: string;
    status: 'paid';
    notes?: string;
    responsibleId: string;
    responsibleName: string;
    ocrResult?: OCRResult;
    manuallyApprovedAfterMismatch?: boolean;
    auditTicketId?: string;
}

export interface ManagerNote {
    id: string;
    managerName: string;
    content: string;
    date: number;
    read: boolean;
}

export interface AgentPerformance {
    agentId: string;
    agentName: string;
    ticketsResolved: number;
    avgResponseTime: number;
    npsScore: number;
}

export interface EvolutionSettings {
    apiUrl: string;
    apiKey: string;
    instanceName: string;
    status: 'connected' | 'disconnected' | 'connecting';
    connectedNumber?: string;
    profileName?: string;
    batteryLevel?: number;
}

export interface PlanTierConfig {
    name: string;
    active: boolean;
    price: number;
    durationMonths: number;
    features: any;
    aiCredits: any;
    activeFeatures?: string[];
}

export interface ToolOptimizationReport {
    timestamp: string;
    scannedToolsCount: number;
    systemImprovements: any[];
    studentRecommendations: any[];
}

export interface NexusDailyReport {
    id: string;
    date: string;
    totalUsage: number;
    avgSatisfaction: number;
    criticalAlerts: number;
    topTools: string[];
    learningProgress: number;
    generatedSuggestions: number;
}

export interface NexusTrendAlert {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    message: string;
    timestamp: number;
    recommendedAutoAction?: string;
}

export interface NexusSystemOptimization {
    id: string;
    targetModule: string;
    changeType: string;
    description: string;
    confidenceScore: number;
    status: 'proposed' | 'applied';
}

// --- SYSTEM CONFIG ---
export interface CreditPopupScenario {
    overlayColor: string;
    cardBackgroundColor: string;
    titleText: string;
    titleColor: string;
    messageText: string;
    messageColor: string;
    confirmButton: { label: string; bgColor: string; textColor: string; actionUrl?: string };
    cancelButton: { label: string; bgColor: string; textColor: string };
    additionalLinks?: { label: string; url: string }[];
    iconType?: 'alert' | 'check' | 'credit_card' | 'lock';
}

export interface CreditSystemConfig {
    insufficientBalance: CreditPopupScenario;
    confirmUsage: CreditPopupScenario;
    lowBalanceTrigger: number;
}

export interface SystemButtonConfig {
    id: string;
    section: string; // 'dashboard_header', 'sidebar_bottom', 'training_list'
    label: string;
    url: string;
    color: string;
    targetRole?: 'student' | 'influencer' | 'affiliate';
    active: boolean;
    isExternal?: boolean;
}

export interface SystemVideoConfig {
    id: string;
    title: string;
    url: string;
    thumbnailUrl?: string;
    description: string;
    targetRole: 'influencer' | 'affiliate';
    duration: string;
    isRequired: boolean;
    views: number;
    createdAt: number;
}

export interface ServiceEmailConfig {
    id: string;
    service: string;
    tag: string;
}

export interface InternalCampaign {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    ctaText: string;
    ctaLink?: string;
    startDate: string;
    endDate: string;
    targetAudience: {
        roles: string[];
        courses?: string[];
        levels?: string[];
    };
    status: 'draft' | 'active' | 'archived';
    createdAt: number;
    backgroundColor?: string;
    notificationSent?: boolean;
}

export interface FinancialViability {
    suggestedTickets: any[];
    offerMarketingPackage: boolean;
    nexusVerdict: string;
}

export interface SchoolSettings {
    ownerId: string;
    schoolName: string;
    subdomain: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    welcomeMessage: string;
    createdAt: number;
}

export interface ProducerBankData {
    fullName: string;
    cpfCnpj: string;
    email: string;
    phone: string;
    birthDate: string;
    bankCode?: string;
    bank: string;
    agency: string;
    account: string;
    pixKey: string;
    address: {
        zipCode: string;
        street: string;
        number: string;
        complement?: string;
        district: string;
        city: string;
        state: string;
    };
    isVerified: boolean;
}

export interface SocialApiIntegration {
    id: string;
    platform: 'YouTube' | 'TikTok' | 'Instagram' | 'Facebook' | 'Kwai' | 'LinkedIn' | 'Pinterest' | 'Twitter';
    name: string;
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    redirectUri?: string;
    status: 'active' | 'inactive';
    lastConnection?: string;
    scopes?: string[];
}
export interface MestreFullConfig {
    minConversionScale: number;
    conversionDropThreshold: number;
    maxBudgetConcentration: number;
    scaleRoasThreshold: number;
    scaleConversionThreshold: number;
    scaleNewStudentsThreshold: number;
    wearRetentionDrop: number;
    pauseRoasThreshold: number;
    revenueNotification: number;
    diversificationCap: number;
}
export interface Funnel {
    id: string;
    name: string;
    type: string;
    steps: string[];
    status: string;
}

export interface ProductFinanceStats {
    productId: string;
    productName: string;
    revenue: number; // Gross Revenue
    costs: {
        platformFees: number;
        taxes: number; // e.g. ISS/Nfe
        affiliateCommissions: number;
        teamCommissions: number; // Sales team
        adsSpend?: number; // Optional integration with ads
        projectedCommissions?: number; // Estimated commission from pending credit usage
    };
    netProfit: number;
    margin: number; // %
    salesCount: number;
    refundCount: number;
    chargebackCount: number;
    conversionRate?: number; // For consultancy analysis
    averageTicket?: number;
}

export interface MarketBenchmark {
    averageTicket: number;
    averageConversion: number;
    topPerformerConversion: number;
}

export interface ActionItem {
    id: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    toolId?: string; // e.g. 'nexus_ads'
    status: 'pending' | 'completed';
}

export interface ConsultancyReport {
    productId: string;
    healthScore: number; // 0-100
    marketStats: MarketBenchmark;
    insights: string[];
    actionPlan: ActionItem[];
}

// --- NEXUS WALLET & CREDITS ---

export interface WalletTransaction {
    id: string;
    producerId: string;
    type: 'purchase' | 'usage' | 'bonus' | 'refund' | 'credit' | 'debit';
    amount: number;
    description: string;
    category: 'purchase' | 'service_usage' | 'team_cost' | 'refund' | 'bonus' | 'credit' | 'debit' | 'transfer';
    timestamp: number;
    metadata?: any;
    toolId?: string;
    pocketUsed?: 'specialized' | 'global';
    balanceSnapshot?: number;
    gatewayId?: string;
}

export interface ProducerWallet {
    producerId: string;
    balance: number;
    transactions: WalletTransaction[];
}

export interface CreditRequest {
    id: string;
    producerId: string;
    producerName: string; // Denormalized for display
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    feedback?: string; // Admin justification or observation
    requestedAt: string;
    respondedAt?: string;
    respondedBy?: string; // Admin ID
}
export interface AccountPayable {
    id: string;
    description: string;
    amount: number;
    dueDate: string;
    category: string;
    type: 'fixed' | 'variable';
    status: 'pending' | 'paid' | 'overdue';
    createdAt: string;
    notes?: string;
    attachmentUrl?: string;
}

export interface FinancialAuditTicket {
    id: string;
    paymentId: string;
    paymentType: 'commission' | 'payable';
    agentId: string;
    agentName: string;
    status: 'open' | 'resolved' | 'closed';
    issueDescription: string;
    adminNotes: string[];
    agentClarification?: string;
    createdAt: string;
    updatedAt: string;
}

// --- NEXUS CORE TYPES ---
export type TaskPriority = 'low' | 'normal' | 'high' | 'critical';
import { NexusToolId } from '../services/ToolRegistry';

export type TaskType = 'campaign_gen' | 'content_creation' | 'sales_recovery' | 'data_sync' | 'analysis' | 'repair' | 'dark_post_gen';

export interface NexusTask {
    id: string;
    type: TaskType;
    priority: TaskPriority;
    payload: any;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    timestamp: number;
    retryCount: number;
}

export interface StrategyInsight {
    niche: string;
    successfulTactics: string[];
    failedTactics: string[];
    avgConversionRate: number;
    recommendedChannels: string[];
}



export interface WithdrawalRequest {
    id: string;
    producerId: string;
    producerName?: string; // Optional for admin view
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected' | 'cancelled';
    requestedAt: string; // ISO Date
    scheduledFor?: string; // ISO Date (Batch Window)
    processedAt?: string; // ISO Date
    stripePayoutId?: string;
    destinationBank?: {
        bankName: string;
        accountType: string;
        agency: string;
        accountNumber: string;
        pixKey?: string;
    };
    sourceType: 'manual_sales' | 'auto_commission';
    auditLog?: {
        timestamp: string;
        action: string;
        details?: string;
    }[];
    rejectionReason?: string;
}

export interface BatchProcessingSummary {
    batchId: string;
    windowTime: string; // e.g., "16:00"
    totalItems: number;
    totalAmount: number;
    status: 'scheduled' | 'running' | 'completed' | 'partial_failure';
    successCount: number;
    failureCount: number;
}

export interface GratitudeEntry {
    id: string;
    studentId: string;
    date: string;
    content: string;
    mood?: 'happy' | 'neutral' | 'sad' | 'grateful';
    tags?: string[];
    practice?: string;
}
