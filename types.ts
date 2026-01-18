
export type StudentPage = 'dashboard' | 'training' | 'financial' | 'products' | 'marketing' | 'integrations' | 'funnels' | 'email_marketing' | 'support' | 'profile' | 'coach' | 'community' | 'mestre_ia' | 'my_results' | 'create_course' | 'wallet' | 'recharge' | 'nexus_ads';

export type UserRole = 'student' | 'admin' | 'super_admin' | 'support' | 'support_agent' | 'sales_agent' | 'sales_manager' | 'influencer' | 'finance' | 'viewer' | 'coproducer';

export type ProductStatus = 'active' | 'inactive' | 'paused' | 'pending' | 'development' | 'archived';

export interface SystemStatus {
    apiReady: boolean;
    lastSync: number;
    maintenance: boolean;
    activeNodes: number;
    queueCount: number;
    healthScore: number; // 0 a 100
}

export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';
export type TaskType = 'sales_recovery' | 'campaign_gen' | 'content_creation' | 'analysis' | 'data_sync';

export interface NexusTask {
    id: string;
    type: TaskType;
    priority: TaskPriority;
    payload: any;
    timestamp: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'throttled';
    retryCount: number;
}

export interface StrategyInsight {
    niche: string;
    successfulTactics: string[]; // Ex: "Vídeo curto + Headline polêmica"
    failedTactics: string[]; // Ex: "Texto longo sem imagem"
    avgConversionRate: number;
    recommendedChannels: string[];
}

export interface WalletBucket {
    toolId: string;
    label: string;
    balance: number;
    icon: string;
}

export interface WalletTransaction {
    id: string;
    type: 'purchase' | 'usage' | 'bonus' | 'refund';
    amount: number;
    toolId: string;
    description: string;
    timestamp: number;
    pocketUsed: 'specialized' | 'global';
    balanceSnapshot: number;
}

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
}

export interface OnboardingData {
    filled: boolean;
    niche: string;
    answers: Record<string, string>;
    updatedAt?: string;
}

export interface AnamneseData extends OnboardingData {}

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
  password?: string;
  creditBalance?: number;
  walletBuckets?: WalletBucket[];
  walletTransactions?: WalletTransaction[];
  producerData?: ProducerBankData;
  onboarding?: OnboardingData;
  anamnese?: AnamneseData;
  cpf?: string;
}

export type CourseCategory = 'standard' | 'personal_master' | 'therapy_master' | 'slimming_master';

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
    knowledgeIdeas?: string;
    schoolSubdomain?: string;
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
    alignmentScore: number;
    lastRefinement: string;
    learningInsights: string[];
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
      conversionRate: number;
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
}

export interface SystemSettings {
    purchaseLink: string;
    forgotPasswordLink: string;
    supportLink: string;
    mestreIAMaintenance?: boolean;
}

export interface ToolCost {
    toolId: string;
    toolName: string;
    costPerTask: number;
    realCostEstimate: number;
    profitMargin?: number;
    complexity: 'low' | 'medium' | 'high';
}

export interface PaymentMethod {
    id: string;
    label: string; 
    url: string;
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
    status: 'open' | 'in_progress' | 'resolved' | 'pending_closure';
    priority: 'low' | 'medium' | 'high';
    createdAt: number;
    lastMessageAt: number;
    messages: ChatMessage[];
    nps?: any;
    unreadCount?: number;
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

export interface RefundRequest {
    id: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    purchaseDate: string;
    requestDate: number;
    amount: number;
    reason: string;
    status: 'pending_support' | 'pending_admin' | 'approved' | 'rejected';
    processedBy?: string;
    processedAt?: number;
}

export interface TeamUser {
    id: string;
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
    status: 'new' | 'in_progress' | 'closed' | 'lost';
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
}

export interface LoginAttemptLog {
    id: string;
    userId?: string;
  email: string;
  status: string;
  ip: string;
  device: string;
  date: number;
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
    date: number;
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

export interface SystemButtonConfig {
    id: string;
    section: string;
    label: string;
    url: string;
    color: string;
    targetRole: 'student' | 'influencer' | 'affiliate';
    active: boolean;
    isExternal: boolean;
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

export type AdPlatform = 'Facebook' | 'Google' | 'TikTok' | 'Kwai' | 'Pinterest' | 'Taboola';
export type AdGoal = 'Sales' | 'Leads' | 'Traffic' | 'Engagement';
