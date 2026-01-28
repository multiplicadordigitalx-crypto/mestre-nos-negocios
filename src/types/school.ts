
// --- SCHOOL & WHITE LABEL LAYER ---
// --- SCHOOL & WHITE LABEL LAYER ---

export type SchoolNiche = 'fitness' | 'finance' | 'law' | 'marketing' | 'tech' | 'other';

export interface SchoolTheme {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    faviconUrl?: string;
}

export interface SchoolFeatures {
    enableMestreIA: boolean;
    enableNexusPlayer: boolean;
    enableGamification: boolean;
    enableStore: boolean;
    enableCommunity: boolean;
    enableLiveEvents: boolean;
}

export interface StudentMenuItem {
    id: string;
    label: string;
    path: string;
    icon?: string;
    allowedRoles?: string[];
}

export interface SchoolConfig {
    id: string; // Usually the subdomain or a UUID
    ownerId: string; // The Producer

    // Identity
    name: string;
    subdomain: string; // e.g., "joao-fitness" -> joao-fitness.mestrenosnegocios.com
    customDomain?: string; // e.g., "cursojoao.com.br"
    domainStatus?: 'pending' | 'active' | 'error';
    niche?: SchoolNiche;

    // Branding
    theme: SchoolTheme;

    // Organization
    supportTeam: SupportTeamMember[];
    linkedProductIds: string[]; // List of products belonging to this school

    // Features & Modules
    features?: SchoolFeatures;

    // Navigation
    menuConfig?: StudentMenuItem[];

    createdAt: string;
    updatedAt?: string;
}

export interface SupportTeamMember {
    userId: string; // Link to Auth User
    email: string; // Invitation email
    name: string;
    role: 'admin' | 'support' | 'editor';
    permissions: {
        canEditContent: boolean;
        canViewFinance: boolean;
        canReplyStudents: boolean;
    };
    status: 'pending' | 'active' | 'blocked';
}

// --- SPECIALIZED AI MODULES LAYER ---

// 1. Health & Mind (Diário)
export interface HealthLogEntry {
    id: string;
    studentId: string;
    date: string; // ISO Date YYYY-MM-DD

    // Body
    nutrition?: {
        protein: number;
        calories: number;
        waterLitres: number;
        meals: any[];
    };
    activity?: {
        steps: number;
        workoutType?: string;
        durationMinutes: number;
    };

    // Mind
    mood?: 'happy' | 'neutral' | 'sad' | 'anxious' | 'angry';
    sleepHours?: number;
    gratitude?: string;

    // AI
    aiFeedback?: string; // Generated insight
}

// 2. Knowledge Practice (Jurista/Poliglota)
export interface PracticeSession {
    id: string;
    studentId: string;
    moduleType: 'jurista' | 'poliglota' | 'nexus_player';
    topic?: string;
    title?: string;
    activityType?: string; // 'sage_agent', 'quiz', 'audience', etc.

    messages?: {
        role: 'user' | 'ai';
        content: string;
        timestamp: number;
    }[];

    score?: number;
    durationSeconds?: number;
    details?: any; // Flexible payload for specific tools (OCR, inputs, etc)
    learnedItems?: string[];
    createdAt: any; // Allow ServerTimestamp or string
}
