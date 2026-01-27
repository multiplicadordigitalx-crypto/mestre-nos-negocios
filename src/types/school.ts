
// --- SCHOOL & WHITE LABEL LAYER ---
export interface SchoolConfig {
    id: string; // Usually the subdomain or a UUID
    ownerId: string; // The Producer

    // Identity
    name: string;
    subdomain: string; // e.g., "joao-fitness" -> joao-fitness.mestrenosnegocios.com
    customDomain?: string; // e.g., "cursojoao.com.br"
    domainStatus?: 'pending' | 'active' | 'error';

    // Branding
    theme: {
        primaryColor: string;
        secondaryColor: string;
        logoUrl?: string;
        faviconUrl?: string;
    };

    // Organization
    supportTeam: SupportTeamMember[];
    linkedProductIds: string[]; // List of products belonging to this school

    createdAt: string;
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
    moduleType: 'jurista' | 'poliglota';
    topic: string; // "Civil Law" or "English - Business"

    messages: {
        role: 'user' | 'ai';
        content: string;
        timestamp: number;
    }[];

    score?: number; // AI evaluation
    learnedItems?: string[]; // Vocabulary or Case Laws
    createdAt: string;
}
