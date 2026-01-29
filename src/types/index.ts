
export * from './legacy';
export {
    type SchoolNiche,
    type SchoolTheme,
    type SchoolFeatures,
    type StudentMenuItem as NewStudentMenuItem
} from './school';
export * from './finance';

// Marketing Types
export type MarketingTab = 'dashboard' | 'ugc_automation' | 'bot_automation' | 'viral_creatives' | 'whatsapp' | 'nexus_studio';

export interface MarketingAccount {
    id: string;
    platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook';
    username: string;
    password?: string;
    status: 'connected' | 'disconnected' | 'error' | 'ONLINE' | 'OFFLINE'; // Added legacy statuses for compatibility
    product: string;
    updatedAt?: any;
    profileImage?: string;
    followers?: string; // Legacy field for UI mock compatibility
    followersCount?: number;
    responseTime?: string; // Legacy
    postingStatus?: string; // Legacy
}
