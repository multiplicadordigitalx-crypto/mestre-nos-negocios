
import { UserRole } from './legacy';

export type SchoolNiche = 'GENERIC' | 'LAW' | 'HEALTH' | 'FINANCE' | 'TECH' | 'MARKETING' | 'OTHER';

export interface SchoolTheme {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string; // e.g., dark or light mode default
    sidebarColor: string;
    accentColor: string;
    logoUrl?: string;
    faviconUrl?: string;
    fontFamily?: string;
}

export interface StudentMenuItem {
    id: string;
    label: string;
    icon: string; // Lucide icon name
    path: string;
    isEnabled: boolean;
    roles?: UserRole[]; // If restricted to specific roles
}

export interface SchoolFeatures {
    enableMestreIA: boolean;
    enableNexusPlayer: boolean;
    enableGamification: boolean;
    enableStore: boolean; // "Produtos"
    enableCommunity: boolean;
    enableLiveEvents: boolean;
    hasPhysicalKit?: boolean; // If producer sends physical kits (scales, tapes, etc.)
    customFeatures?: string[]; // e.g., "LegalDocs", "DietTracker"
}

export interface SchoolConfig {
    id: string;
    producerId: string;
    name: string;
    subdomain: string; // e.g., "advocacia.mestrenosnegocios.com"
    niche: SchoolNiche;
    theme: SchoolTheme;
    features: SchoolFeatures;
    menuConfig: StudentMenuItem[];
    premiumTools?: any[]; // Allow any structure for now to satisfy mismatch, or define stricter type if known.
    // Making premiumTools optional to fix assignability errors.
    welcomeMessage?: string;
    createdAt: number;
    updatedAt: number;
}

// Default presets will be defined in a constant file
