import React from 'react';
import { PlansState } from './types';
import {
    Brain, Megaphone, Filter, ShieldCheck,
    Zap, Image, Film, Target, MessageCircle, Server, Phone, Mail, Activity, Camera, BookOpen, Globe, Award, HeartPulse, Mic, Box, PenTool, Rocket, Search, Cpu, List, PlusCircle
} from '../../../../components/Icons';

export interface SystemToolExtended {
    id: string;
    label: string;
    costUSD: number;
    baseUnit: string;
    billingType: 'execution' | 'monthly' | 'volume_pack';
    description?: string;
}

export interface SystemModuleExtended {
    id: string;
    label: string;
    icon: React.ReactNode;
    description: string;
    tools: SystemToolExtended[];
}

export const SYSTEM_MODULES: SystemModuleExtended[] = [
    {
        id: 'mestre_ia',
        label: 'Módulo Mestre IA (25 Cards)',
        icon: <Brain className="w-5 h-5 text-purple-400" />,
        description: 'Conjunto principal de consultoria estratégica e geração de ativos estratégica.',
        tools: [
            { id: 'mestre_dos_negocios', label: 'Mestre dos Negócios (Consultoria Estratégica)', costUSD: 0.015, baseUnit: "1 Análise", billingType: 'execution' },
            { id: 'vendas_hoje', label: 'Quero mais venda Hoje (Planos de Ação)', costUSD: 0.025, baseUnit: "1 Plano", billingType: 'execution' },
            { id: 'kwai_turbinado', label: 'Kwai Turbinado (Automação Viral)', costUSD: 0.030, baseUnit: "1 Roteiro", billingType: 'execution' },
            { id: 'infoproduto_apresentacao', label: 'Seu InfoProduto e Apresentação PDF (Geração de Ativos)', costUSD: 0.090, baseUnit: "1 PDF", billingType: 'execution' },
            { id: 'ugc_piloto_automatico', label: 'UGC Vende no Piloto Automático (Roteiros Emocionais)', costUSD: 0.025, baseUnit: "1 Roteiro", billingType: 'execution' },
            { id: 'gerador_logomarcas', label: 'Gerador de logomarcas (Identidade Visual)', costUSD: 0.800, baseUnit: "1 Logo", billingType: 'execution' },
            { id: 'landing_page', label: 'Criar Página de Vendas (Estruturas de Conversão)', costUSD: 0.060, baseUnit: "1 Copy", billingType: 'execution' },
            { id: 'conteudo_viral', label: 'Conteúdo que viraliza (Calendários Inteligentes)', costUSD: 0.020, baseUnit: "1 Calendário", billingType: 'execution' },
            { id: 'criativos_arts', label: 'Criativos e Arts (Design de Posts)', costUSD: 0.150, baseUnit: "1 Arte", billingType: 'execution' },
            { id: 'seo_melhorar', label: 'Melhorar SEO do meu Site (Otimização técnica)', costUSD: 0.035, baseUnit: "1 Análise", billingType: 'execution' },
            { id: 'ugc_viral_scripts', label: 'Criador de Roteiros UGC Viral (Cérebro Emocional)', costUSD: 0.020, baseUnit: "1 Roteiro", billingType: 'execution' },
            { id: 'google_ads_zero', label: 'Fazer meu Google ADS do zero (Setup de Tráfego)', costUSD: 0.040, baseUnit: "1 Campanha", billingType: 'execution' },
            { id: 'meta_ads_zero', label: 'Meta Ads do Zero (Setup de Tráfego)', costUSD: 0.040, baseUnit: "1 Campanha", billingType: 'execution' },
            { id: 'lancamento_perfeito', label: 'Lançamento perfeito (Estratégia Passo a Passo)', costUSD: 0.090, baseUnit: "1 Plano", billingType: 'execution' },
            { id: 'influencer_crescimento', label: 'Sou Influencer – crescer/reter (Estratégia de Perfil)', costUSD: 0.020, baseUnit: "1 Estratégia", billingType: 'execution' },
            { id: 'emails_venda', label: 'Email Marketing Turbinado (Copies de E-mail)', costUSD: 0.020, baseUnit: "1 Campanha", billingType: 'execution' },
            { id: 'thumbnails_titulos', label: 'Thumbnails e títulos (Aumento de CTR)', costUSD: 0.120, baseUnit: "1 Conjunto", billingType: 'execution' },
            { id: 'oferta_irresistivel', label: 'Criar ofertas irresistíveis (Psicologia de Venda)', costUSD: 0.018, baseUnit: "1 Oferta", billingType: 'execution' },
            { id: 'analise_concorrente_1', label: 'Análise de concorrentes (Inteligência Competitiva)', costUSD: 0.045, baseUnit: "1 Varredura", billingType: 'execution' },
            { id: 'analise_concorrente_2', label: 'Análise de concorrentes (Inteligência Competitiva)', costUSD: 0.045, baseUnit: "1 Varredura", billingType: 'execution' },
            { id: 'calendario_conteudo', label: 'Calendário de conteúdo (Planejamento)', costUSD: 0.020, baseUnit: "1 Plano", billingType: 'execution' },
            { id: 'tiktok_ads', label: 'Criar anúncio TikTok Ads (Tráfego Vertical)', costUSD: 0.040, baseUnit: "1 Campanha", billingType: 'execution' },
            { id: 'youtube_zero', label: 'YouTube do zero (Criação de Canal)', costUSD: 0.050, baseUnit: "1 Canal", billingType: 'execution' },
            { id: 'equipe_trafego', label: 'Gerenciar equipe de tráfego (Gestão de Squad)', costUSD: 0.018, baseUnit: "1 Gestão", billingType: 'execution' },
            { id: 'recuperar_carrinho', label: 'Recuperar carrinho (Script de Recuperação)', costUSD: 0.010, baseUnit: "1 Script", billingType: 'execution' },
            { id: 'whatsapp_1x1', label: 'WhatsApp que fecha na hora (Scripts de Fechamento)', costUSD: 0.012, baseUnit: "1 Script", billingType: 'execution' }
        ]
    },
    {
        id: 'marketing_360',
        label: 'Módulo Marketing 360',
        icon: <Megaphone className="w-5 h-5 text-pink-500" />,
        description: 'Automação de escala, detecção de tendências e distribuição.',
        tools: [
            { id: 'viral_radar', label: 'Radar de Tendência Viral', costUSD: 0.010, baseUnit: "1 Varredura", billingType: 'execution' },
            { id: 'viral_cloner', label: 'Detector e Clonador Viral', costUSD: 0.040, baseUnit: "1 Clonagem", billingType: 'execution' },
            { id: 'ugc_script_11', label: 'Roteirista (card 11)', costUSD: 0.020, baseUnit: "1 Roteiro", billingType: 'execution' },
            { id: 'ugc_studio_12', label: 'Studio (Card 12)', costUSD: 2.500, baseUnit: "1 Vídeo Renderizado", billingType: 'execution' },
            { id: 'ugc_dist_13', label: 'Distribuição (Card 13)', costUSD: 0.100, baseUnit: "1 Postagem Lote", billingType: 'execution' },
            { id: 'sales_bot_14', label: 'Bot de Venda (14)', costUSD: 0.020, baseUnit: "Mensal/ conta conectada", billingType: 'monthly' },
            { id: 'wa_evolution_api', label: 'WhatsApp Evolution (Instância)', costUSD: 2.750, baseUnit: "Mensal/Número", billingType: 'monthly' }
        ]
    },
    {
        id: 'funnels_pgs',
        label: 'Módulo Funil & PGS',
        icon: <Filter className="w-5 h-5 text-orange-500" />,
        description: 'Construção de páginas, otimização e análise de público.',
        tools: [
            { id: 'funnel_builder', label: 'Construtor IA', costUSD: 0.150, baseUnit: "1 Deploy", billingType: 'execution' },
            { id: 'funnel_optimizer', label: 'Otimizador 24hs', costUSD: 0.050, baseUnit: "Diário", billingType: 'monthly' },
            { id: 'funnel_strategy', label: 'Estratégia de Funis', costUSD: 0.040, baseUnit: "1 Estrutura", billingType: 'execution' },
            { id: 'funnel_analytics', label: 'Deep Analytics 24h', costUSD: 0.030, baseUnit: "Diário", billingType: 'monthly' },
            { id: 'funnel_persona', label: 'Persona', costUSD: 0.020, baseUnit: "1 Análise", billingType: 'execution' }
        ]
    },
    {
        id: 'email_marketing',
        label: 'Módulo Email Marketing',
        icon: <Mail className="w-5 h-5 text-yellow-500" />,
        description: 'Sistema completo de entrega e higienização de e-mails.',
        tools: [
            { id: 'email_strat_gen', label: 'Gerador Estratégicos', costUSD: 0.025, baseUnit: "1 Campanha", billingType: 'execution' },
            { id: 'email_cleaner', label: 'Limpador de Lista de emails', costUSD: 0.005, baseUnit: "1000 Contatos", billingType: 'execution' },
            { id: 'email_pack_unit', label: 'Pacote de envio Unitário', costUSD: 0.001, baseUnit: "1 Envio", billingType: 'execution' },
            { id: 'email_pack_50', label: 'Pacote de Envio 50 Unidades', costUSD: 0.040, baseUnit: "Pacote 50", billingType: 'volume_pack' },
            { id: 'email_pack_100', label: 'Pacote de Envio 100 Unidades', costUSD: 0.070, baseUnit: "Pacote 100", billingType: 'volume_pack' },
            { id: 'email_pack_500', label: 'Pacote de Envio 500 Unidades', costUSD: 0.300, baseUnit: "Pacote 500", billingType: 'volume_pack' },
            { id: 'email_pack_1000', label: 'Pacote de Envio 1000 Unidades', costUSD: 0.500, baseUnit: "Pacote 1000", billingType: 'volume_pack' }
        ]
    },
    {
        id: 'train_config',
        label: 'Módulo Configurar Treinamento',
        icon: <BookOpen className="w-5 h-5 text-blue-400" />,
        description: 'Ferramentas para orquestração de cursos e materiais.',
        tools: [
            { id: 'hosting_traditional', label: 'Hospedagem e Banda (Curso Tradicional)', costUSD: 1.500, baseUnit: "Por Aluno/Mês", billingType: 'monthly', description: 'Custos de CDN para Streaming e Armazenamento.' },
            { id: 'hosting_ai_course', label: 'Hospedagem Nexus Player & IA', costUSD: 3.500, baseUnit: "Por Aluno/Mês", billingType: 'monthly', description: 'Custo fixo de infraestrutura (Vector DB), Tokens do Mentor IA e Voz Neural.' },
            { id: 'train_suggest_mentorship', label: 'Gerar Sugestão para Mentoria Personalizada', costUSD: 0.020, baseUnit: "1 Geração", billingType: 'execution' },
            { id: 'train_cover_ai', label: 'Gerar Capa com IA', costUSD: 0.060, baseUnit: "1 Capa", billingType: 'execution' },
            { id: 'train_logo_ai', label: 'Gerar Logo com IA', costUSD: 0.060, baseUnit: "1 Logo", billingType: 'execution' },
            { id: 'train_promise_nexus', label: 'Otimizar Promessa Com Nexus IA', costUSD: 0.015, baseUnit: "1 Otimização", billingType: 'execution' },
            { id: 'train_summary_ai', label: 'Gerar Resumo Estruturado IA', costUSD: 0.040, baseUnit: "Processamento Dinâmico", billingType: 'execution' },
            { id: 'train_summary_ai_finance', label: 'Gerar Análise Financeira', costUSD: 0.040, baseUnit: "Processamento Dinâmico", billingType: 'execution' },
            { id: 'train_course_complete', label: 'Criar Curso Completo', costUSD: 0.200, baseUnit: "Orquestração Total", billingType: 'execution' }
        ]
    },
    {
        id: 'misc_tools',
        label: 'Ferramentas Diversas',
        icon: <Zap className="w-5 h-5 text-yellow-400" />,
        description: 'Outras ferramentas com consumo de API não categorizadas.',
        tools: [
            { id: 'dna_produto', label: 'DNA do Produto', costUSD: 0.050, baseUnit: "1 Mapeamento", billingType: 'execution' },
            { id: 'support_ai', label: 'Suporte IA Automatizado', costUSD: 0.010, baseUnit: "1 Resposta", billingType: 'execution' },
            { id: 'coach_session', label: 'Sessão Coach IA', costUSD: 0.020, baseUnit: "1 Chat", billingType: 'execution' }
        ]
    },
    {
        id: 'nexus_intelligence',
        label: 'Módulo Nexus & Consultoria',
        icon: <Target className="w-5 h-5 text-purple-500" />,
        description: 'Custos da Super Consultoria, Análise Forense e Ações Autônomas.',
        tools: [
            { id: 'nexus_deep_scan', label: 'Varredura Forense Completa', costUSD: 0.150, baseUnit: "1 Varredura", billingType: 'execution', description: 'Custo de processamento para análise profunda de funil e métricas.' },
            { id: 'nexus_battle_mode', label: 'Relatório Versus (Vencedor)', costUSD: 0.080, baseUnit: "1 Comparação", billingType: 'execution', description: 'Matching de banco de dados e geração de gráficos comparativos.' },
            { id: 'nexus_blue_ocean', label: 'Radar Oceano Azul (Insights)', costUSD: 0.120, baseUnit: "1 Análise", billingType: 'execution', description: 'Mineração de reclamações de concorrentes para gerar oportunidades.' },
            { id: 'nexus_psych_map', label: 'Mapeamento Psicológico', costUSD: 0.050, baseUnit: "1 Mapa", billingType: 'execution', description: 'Análise de sentimento e gatilhos mentais (Fear vs Greed).' },
            { id: 'nexus_auto_clone', label: 'Clonar Estratégia (1-Click)', costUSD: 0.500, baseUnit: "1 Execução", billingType: 'execution', description: 'Custo técnico para replicar configurações (Checkout, Email, etc.) automaticamente.' },

            // --- FASE DE EXECUÇÃO (IMPLEMENTAÇÃO) ---
            { id: 'nexus_exec_offer', label: 'Execução: Alinhamento de Oferta', costUSD: 0.100, baseUnit: "1 Otimização", billingType: 'execution', description: 'Reescrita de Headline, Promessa e Ajuste de Preço.' },
            { id: 'nexus_exec_copy', label: 'Execução: Neuro-Copywriting', costUSD: 0.250, baseUnit: "1 Página Completa", billingType: 'execution', description: 'Geração de texto persuasivo completo para Landing Page.' },
            { id: 'nexus_exec_design', label: 'Execução: Pacote Visual Vencedor', costUSD: 0.400, baseUnit: "1 Kit de Imagens", billingType: 'execution', description: 'Geração de Mockups e Criativos baseados no vencedor.' },
            { id: 'nexus_exec_funnel', label: 'Execução: Instalação de Funil', costUSD: 0.200, baseUnit: "1 Setup", billingType: 'execution', description: 'Configuração técnica de Order Bumps, Upsells e Downsells.' },
            { id: 'nexus_exec_recovery', label: 'Execução: Sistema de Recuperação', costUSD: 0.150, baseUnit: "1 Fluxo", billingType: 'execution', description: 'Instalação de automações de Email/WhatsApp para carrinhos abandonados.' },
            { id: 'nexus_exec_ads', label: 'Execução: Setup de Tráfego', costUSD: 0.300, baseUnit: "1 Estrutura de Campanha", billingType: 'execution', description: 'Criação de públicos, pixels e estrutura de campanha no Ads Manager.' }
        ]
    },
    {
        id: 'consumption_maintenance',
        label: 'Consumo & Manutenção (Aluno)',
        icon: <Activity className="w-5 h-5 text-red-400" />,
        description: 'Custos recorrentes de infraestrutura, armazenamento e consumo de IA pelos alunos.',
        tools: [
            { id: 'maintenance_active_student', label: 'Manutenção Diária por Aluno (Infra)', costUSD: 0.005, baseUnit: "Por Aluno/Dia", billingType: 'monthly' },
            { id: 'maintenance_storage_gb', label: 'Armazenamento de Vídeo/Arquivo (GB)', costUSD: 0.080, baseUnit: "Por GB/Mês", billingType: 'monthly' },
            { id: 'student_ai_chat', label: 'Chat com Mentor IA (Token Aluno)', costUSD: 0.010, baseUnit: "1 Mensagem", billingType: 'execution' },
            { id: 'student_voice_chat', label: 'Conversa por Voz (Audio Streaming)', costUSD: 0.030, baseUnit: "1 Minuto", billingType: 'execution' }
        ]
    },
    {
        id: 'health_mind_module',
        label: 'Módulo Saúde & Mente',
        icon: <HeartPulse className="w-5 h-5 text-pink-400" />,
        description: 'Bem-estar, Psicologia e Astrologia com IA.',
        tools: [
            { id: 'health_sleep_analysis', label: 'Análise de Sono IA', costUSD: 0.050, baseUnit: "1 Análise", billingType: 'execution' },
            { id: 'health_gratitude_insight', label: 'Insight Gratidão IA', costUSD: 0.030, baseUnit: "1 Insight", billingType: 'execution' },
            { id: 'health_astrology_chart', label: 'Mapa Astral/Previsão', costUSD: 0.100, baseUnit: "1 Leitura", billingType: 'execution' },
            { id: 'health_meal_scan', label: 'Scan Refeição OCR', costUSD: 0.080, baseUnit: "1 Scan", billingType: 'execution' },
            { id: 'health_evolution_report', label: 'Relatório de Evolução IA', costUSD: 0.150, baseUnit: "1 Relatório", billingType: 'execution' },
            { id: 'health_metric_scan', label: 'Scan Métricas Corporais', costUSD: 0.100, baseUnit: "1 Scan", billingType: 'execution' }
        ]
    },
    {
        id: 'nexus_ads_module',
        label: 'Módulo Nexus Ads',
        icon: <Rocket className="w-5 h-5 text-red-500" />,
        description: 'Gerador de Campanhas, Dark Posts e Otimização de Tráfego IA.',
        tools: [
            { id: 'ads_strategy_gen', label: 'Geração de Estrutura de Campanha', costUSD: 0.150, baseUnit: "1 Estratégia", billingType: 'execution' },
            { id: 'ads_copy_gen', label: 'Geração de Copy para Anúncios', costUSD: 0.050, baseUnit: "1 Copy", billingType: 'execution' },
            { id: 'ads_persona_analysis', label: 'Análise de Persona & Nicho', costUSD: 0.100, baseUnit: "1 Análise", billingType: 'execution' },
            { id: 'ads_bid_optimization', label: 'Otimização de Bids (Mestre Full)', costUSD: 0.200, baseUnit: "1 Otimização", billingType: 'execution' },
            { id: 'ads_dark_post_gen', label: 'Criar Dark Post Viral (IA)', costUSD: 0.120, baseUnit: "1 Dark Post", billingType: 'execution' },
            { id: 'ads_opp_intelligence', label: 'Inteligência de Oportunidades', costUSD: 0.080, baseUnit: "1 Insight", billingType: 'execution' }
        ]
    }
];

export const INITIAL_PLAN_STATE: PlansState = {
    basic: { price: 49.90, credits: 50, activeFeatures: ['mestre_dos_negocios', 'copy_generator', 'community_access'] },
    pro: { price: 97.00, credits: 200, activeFeatures: ['mestre_dos_negocios', 'vendas_hoje', 'ugc_viral_scripts', 'copy_generator', 'page_builder', 'community_access', 'certificate'] },
    elite: { price: 197.00, credits: 1000, activeFeatures: SYSTEM_MODULES.flatMap(m => m.tools.map(t => t.id)) }
};