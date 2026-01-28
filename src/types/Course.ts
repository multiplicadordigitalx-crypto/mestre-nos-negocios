
export type ProductType = 'Único' | 'Recorrência' | 'Assinatura';
export type DeliverableType = 'course' | 'ebook' | 'link' | 'app' | 'event' | 'consultancy';
export type ContentSourceType = 'internal' | 'external';
export type ProductStatus = 'active' | 'inactive' | 'paused' | 'pending' | 'development' | 'archived';

// --- SALES & CONFIGURATION LAYER (The "Vitrine") ---
export interface AppProduct {
    id: string; // productId
    ownerId: string; // Creator (Admin or Producer)
    schoolId: string; // Links to SchoolConfig

    // Identity
    name: string;
    description: string;
    coverUrl?: string;

    // Strategy
    type: ProductType;
    deliverableType: DeliverableType;
    contentSourceType: ContentSourceType;

    // Pricing & Sales
    price?: number;
    plans: ProductPlan[];
    checkoutLinks?: CheckoutLink[];

    // Advanced Ecosystem
    dna?: ProductDNA | null; // AI Generator metadata
    affiliates?: AffiliateConfig;
    coProducer?: CoProducerInfo;

    // State
    status: ProductStatus;
    setupProgress?: number; // UI Helper
    schoolSubdomain?: string; // UI Helper (Denormalized)
    createdAt: string;
    updatedAt: string;
}

export interface ProductPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    anchorPrice?: number;
    billingType?: string; // Monthly, Yearly, Lifetime
    guaranteeDays?: number;
}

export interface AffiliateConfig {
    enabled: boolean;
    commissionPercent: number;
    autoApprove: boolean;
    rules?: string;
}

export interface ProductDNA {
    avatar: string; // Ideal Persona
    promisse: string;
    objections: string[];
    alignmentScore: number;
    generatedAt: string;
}

export interface CheckoutLink {
    id: string;
    label: string;
    url: string;
    price?: number;
    billingType?: string;
}

export interface CoProducerInfo {
    userId?: string;
    email: string;
    percentage: number;
    status: 'pending' | 'active' | 'rejected';
    invitedAt: string;
}

// --- CONTENT DELIVERY LAYER (The "Classroom") ---
// Only exists if deliverableType === 'course' AND contentSourceType === 'internal'

export interface Course {
    id: string; // SAME as productId for 1:1 mapping
    productId: string;

    // Player Config
    modulesOrder: string[]; // Array of Module IDs
    playerSettings: {
        allowComments: boolean;
        showProgress: boolean;
        themeColor?: string;
        certificateTemplateId?: string;
    };

    // AI Metadata
    aiMetadata?: {
        niche: string;
        generatedBy: 'human' | 'ai';
        promptUsed?: string;
    };

    // Stats
    totalModules: number;
    totalLessons: number;
    totalDuration: number; // minutes
}

export interface CourseModule {
    id: string;
    courseId: string;
    title: string;
    description?: string;
    order: number;

    // Drip Content
    availableAfterDays?: number; // 0 = Immediate
    releaseDate?: string; // Specific date
}

export interface CourseLesson {
    id: string;
    moduleId: string;
    courseId: string;

    title: string;
    description?: string;
    order: number;

    // Content
    type: 'video' | 'text' | 'quiz' | 'live';
    videoConfig?: {
        provider: 'youtube' | 'vimeo' | 'panda' | 'mp4';
        url: string;
        duration: number; // seconds
    };
    textContent?: string; // HTML/Markdown

    // Attachments
    materials?: LessonMaterial[];

    // AI
    transcription?: string;
    aiSummary?: string;
}

export interface LessonMaterial {
    id: string;
    name: string;
    url: string;
    type: 'pdf' | 'image' | 'zip' | 'link';
}
