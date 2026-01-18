
import { SchoolNiche, StudentMenuItem, SchoolConfig } from '../types/school';

// Default Menu Items
const DEFAULT_MENU_ITEMS: StudentMenuItem[] = [
    { id: 'dashboard', label: 'Início', icon: 'Home', path: 'dashboard', isEnabled: true },
    { id: 'training', label: 'Treinamento', icon: 'BookOpen', path: 'training', isEnabled: true },
    { id: 'financial', label: 'Financeiro', icon: 'DollarSign', path: 'financial', isEnabled: true },
    { id: 'create_course', label: 'Criar Curso', icon: 'PlusCircle', path: 'create_course', isEnabled: true },
    { id: 'mestre_ia', label: 'Mentor IA', icon: 'Sparkles', path: 'mestre_ia', isEnabled: true },
    { id: 'coach', label: 'Coach IA', icon: 'Bot', path: 'coach', isEnabled: true },
    { id: 'products', label: 'Produtos', icon: 'ShoppingBag', path: 'products', isEnabled: true },
    { id: 'community', label: 'Comunidade', icon: 'Users', path: 'community', isEnabled: true },
    { id: 'profile', label: 'Perfil', icon: 'User', path: 'profile', isEnabled: true },
    { id: 'support', label: 'Suporte', icon: 'MessageSquare', path: 'support', isEnabled: true },
];

export const SCHOOL_PRESETS: Record<SchoolNiche, Partial<SchoolConfig>> = {
    GENERIC: {
        theme: {
            primaryColor: '#FACC15', // Yellow
            secondaryColor: '#9333EA',
            backgroundColor: '#111827',
            sidebarColor: '#1F2937',
            accentColor: '#FACC15'
        },
        menuConfig: DEFAULT_MENU_ITEMS
    },
    LAW: {
        theme: {
            primaryColor: '#B45309', // Amber/Goldish for Law
            secondaryColor: '#1E3A8A', // Dark Blue
            backgroundColor: '#0F172A',
            sidebarColor: '#1E293B',
            accentColor: '#D97706'
        },
        menuConfig: [
            ...DEFAULT_MENU_ITEMS.filter(i => !['mestre_ia', 'coach'].includes(i.id)), // Example: Hide standard AI
            { id: 'mestre_ia', label: 'Jurista IA', icon: 'Gavel', path: 'mestre_ia', isEnabled: true }, // Custom name/icon
            { id: 'jurisprudence', label: 'Jurisprudência', icon: 'Scale', path: 'library', isEnabled: true },
        ]
    },
    HEALTH: {
        theme: {
            primaryColor: '#10B981', // Emerald
            secondaryColor: '#064E3B',
            backgroundColor: '#ECFDF5', // Light theme default?
            sidebarColor: '#FFFFFF',
            accentColor: '#34D399'
        },
        features: {
            enableMestreIA: true,
            enableNexusPlayer: true,
            enableGamification: true,
            enableStore: false,
            enableCommunity: true,
            enableLiveEvents: true,
            hasPhysicalKit: true
        },
        menuConfig: [
            ...DEFAULT_MENU_ITEMS.filter(i => !['products'].includes(i.id)),
            { id: 'diario', label: 'Diário de Saúde', icon: 'HeartPulse', path: 'journal', isEnabled: true },
        ]
    },
    FINANCE: {
        theme: {
            primaryColor: '#3B82F6', // Blue
            secondaryColor: '#1E40AF',
            backgroundColor: '#0B1120',
            sidebarColor: '#111827',
            accentColor: '#60A5FA'
        },
        menuConfig: [
            ...DEFAULT_MENU_ITEMS,
            { id: 'portfolio', label: 'Carteira', icon: 'LineChart', path: 'portfolio', isEnabled: true },
        ]
    },
    TECH: {
        theme: {
            primaryColor: '#A855F7', // Purple
            secondaryColor: '#4C1D95',
            backgroundColor: '#000000',
            sidebarColor: '#171717',
            accentColor: '#C084FC'
        },
        menuConfig: DEFAULT_MENU_ITEMS
    },
    MARKETING: {
        theme: {
            primaryColor: '#EF4444', // Red-500
            secondaryColor: '#B91C1C',
            backgroundColor: '#111827',
            sidebarColor: '#1F2937',
            accentColor: '#F87171'
        },
        menuConfig: [
            ...DEFAULT_MENU_ITEMS,
            // Explicitly enabled for Marketing Niche
            { id: 'marketing', label: 'Marketing', icon: 'Megaphone', path: 'marketing', isEnabled: true },
            { id: 'nexus_ads', label: 'Nexus Ads', icon: 'Target', path: 'nexus_ads', isEnabled: true },
            { id: 'integrations', label: 'Integrações', icon: 'Link', path: 'integrations', isEnabled: true },
            { id: 'funnels', label: 'Funil & PGS', icon: 'Filter', path: 'funnels', isEnabled: true },
            { id: 'email_marketing', label: 'E-mail Mkt', icon: 'Mail', path: 'email_marketing', isEnabled: true },
            { id: 'products', label: 'Produtos', icon: 'ShoppingBag', path: 'products', isEnabled: true },
            { id: 'create_course', label: 'Criar Curso', icon: 'PlusCircle', path: 'create_course', isEnabled: true },
        ]
    },
    OTHER: {
        theme: {
            primaryColor: '#EC4899', // Pink
            secondaryColor: '#831843',
            backgroundColor: '#111827',
            sidebarColor: '#1F2937',
            accentColor: '#F472B6'
        },
        menuConfig: DEFAULT_MENU_ITEMS
    },
};

export const getSchoolConfigByNiche = (nicheString: string): Partial<SchoolConfig> => {
    // Simple heuristic to map string to Enum
    const lower = nicheString?.toLowerCase() || '';
    if (lower.includes('direito') || lower.includes('advocacia') || lower.includes('lei')) return SCHOOL_PRESETS.LAW;
    if (lower.includes('saúde') || lower.includes('terapia') || lower.includes('emagrecimento') || lower.includes('nutri')) return SCHOOL_PRESETS.HEALTH;
    if (lower.includes('finance') || lower.includes('investimento') || lower.includes('dinheiro') || lower.includes('trader')) return SCHOOL_PRESETS.FINANCE;
    if (lower.includes('tech') || lower.includes('dev') || lower.includes('programação') || lower.includes('código')) return SCHOOL_PRESETS.TECH;
    if (lower.includes('marketing') || lower.includes('vendas') || lower.includes('tráfego') || lower.includes('digital') || lower.includes('lançamento')) return SCHOOL_PRESETS.MARKETING;

    return SCHOOL_PRESETS.GENERIC;
};
