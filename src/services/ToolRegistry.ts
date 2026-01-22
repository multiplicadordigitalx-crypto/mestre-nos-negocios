
import { Message } from '@/types'; // Assuming Message type exists or defining simplified interaction type

export type NexusToolId = 'mentor_juridico' | 'nexus_poliglota' | 'vendas_hoje' | 'sude_mente' | 'nexus_studio';

export interface ToolActivity {
    id: string;
    label: string; // Human readable name e.g., "Draft Notification"
    description: string; // AI Context
    inputRequired?: string[]; // e.g., ['target_name', 'dates']
}

export interface NexusToolDefinition {
    id: NexusToolId;
    name: string;
    description: string;
    tags: string[];
    route: string; // Internal route
    activities: Record<string, ToolActivity>;
}

export const NEXUS_TOOLS: Record<NexusToolId, NexusToolDefinition> = {
    'mentor_juridico': {
        id: 'mentor_juridico',
        name: 'Mentor Jurídico',
        description: 'Legal assistant for drafting contracts, reviewing documents, and GDPR compliance.',
        tags: ['law', 'legal', 'contracts', 'gdpr', 'nda', 'compliance'],
        route: '/painel/mentor-juridico',
        activities: {
            'draft_contract': {
                id: 'draft_contract',
                label: 'Redigir Contrato',
                description: 'Create a new legal document or contract.'
            },
            'review_document': {
                id: 'review_document',
                label: 'Revisar Documento',
                description: 'Analyze an existing document for risks.'
            }
        }
    },
    'nexus_poliglota': {
        id: 'nexus_poliglota',
        name: 'Nexus Poliglota',
        description: 'Language learning module for business English and international communication.',
        tags: ['english', 'language', 'business_english', 'translation', 'vocabulary'],
        route: '/painel/nexus-poliglota',
        activities: {
            'learn_vocab': {
                id: 'learn_vocab',
                label: 'Treinar Vocabulário',
                description: 'Practice specific industry terms.'
            },
            'boardroom_sim': {
                id: 'boardroom_sim',
                label: 'Simulação de Reunião',
                description: 'Roleplay a business meeting scenario.'
            }
        }
    },
    'vendas_hoje': {
        id: 'vendas_hoje',
        name: 'Vendas Hoje',
        description: 'Sales dashboard and automation tools.',
        tags: ['sales', 'marketing', 'pixel', 'ads', 'campaign'],
        route: '/painel/vendas-hoje',
        activities: {
            'config_pixel': {
                id: 'config_pixel',
                label: 'Configurar Pixel',
                description: 'Setup tracking pixel for ad campaigns.'
            },
            'create_campaign': {
                id: 'create_campaign',
                label: 'Criar Campanha',
                description: 'Launch a new sales campaign.'
            }
        }
    },
    'sude_mente': {
        id: 'sude_mente',
        name: 'Saúde & Mente',
        description: 'Wellness and mental health module.',
        tags: ['health', 'wellness', 'meditation', 'focus', 'anxiety'],
        route: '/painel/saude-mente',
        activities: {
            'meditate': {
                id: 'meditate',
                label: 'Meditação Guiada',
                description: 'Start a meditation session.'
            },
            'focus_timer': {
                id: 'focus_timer',
                label: 'Timer de Foco',
                description: 'Start a Pomodoro style focus timer.'
            }
        }
    },
    'nexus_studio': {
        id: 'nexus_studio',
        name: 'Nexus Studio',
        description: 'AI Video Production Engine for long-form UGC content.',
        tags: ['video', 'ugc', 'studio', 'influencer', 'reels', 'marketing_video'],
        route: '/painel/studio',
        activities: {
            'create_ugc': {
                id: 'create_ugc',
                label: 'Criar Vídeo Viral',
                description: 'Generate a high-retention UGC video.'
            }
        }
    }
};

export const getToolByTag = (tag: string): NexusToolDefinition | undefined => {
    return Object.values(NEXUS_TOOLS).find(t => t.tags.includes(tag.toLowerCase()));
};
