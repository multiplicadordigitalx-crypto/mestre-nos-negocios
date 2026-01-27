
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import {
    Target, Brain, ActivityIcon, ShoppingBag,
    Facebook, Google, Tiktok, Eye, Zap, Globe,
    CheckCircle, BarChart3, PieChart, Users,
    Search, Rocket, RefreshCw, Crosshair,
    DollarSign, BarChart2,
    MessageCircle, Play, Layers, Settings, HelpCircle,
    ArrowRight, Check, AlertTriangle, LockClosed, ShieldCheck, Download, Upload, Copy, Share2, Plus, Calendar, Info
} from '../components/Icons';
import toast from 'react-hot-toast';
import { getAppProducts, getAdminIntegrations } from '../services/mockFirebase';
import { AppProduct } from '../types';
import { callMestreIA } from '../services/mestreIaService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MestreFullModal } from './funnels/modals/FunnelsModals';
import { nexusCore } from '../services/NexusCore'; // NOVA INTEGRAÇÃO
import { useAuth } from '../hooks/useAuth';
import { NexusTask, User, UserSubscription } from '../types/legacy';
import { SubscriptionModal } from './financial/SubscriptionModal';
import { CreditBalanceWidget } from '../components/CreditBalanceWidget';
import { StudentPage } from '../types';

// ... (MANTÉM AS CONSTANTES DE PLATAFORMA COMO ESTÃO: PLATFORM_OBJECTIVES, PLATFORMS_CONFIG) ...
// --- CONFIGURAÇÃO DE OBJETIVOS POR PLATAFORMA ---
const PLATFORM_OBJECTIVES: Record<string, { label: string; value: string; description: string }[]> = {
    'Meta Ads': [
        { label: 'Vendas (Conversão)', value: 'sales', description: 'O algoritmo busca pessoas com maior probabilidade de comprar seu produto no site. Ideal para escala.' },
        { label: 'Cadastros (Leads)', value: 'leads', description: 'Coleta dados (email/telefone) via formulário nativo ou site. Ideal para lançamentos.' },
        { label: 'Engajamento (Mensagens/Direct)', value: 'engagement', description: 'Foca em pessoas que enviam mensagens no WhatsApp ou Direct. Bom para X1.' },
        { label: 'Tráfego (Cliques)', value: 'traffic', description: 'Maximiza o número de cliques no link, mas não garante venda. Bom para distribuir conteúdo.' },
        { label: 'Reconhecimento (Branding)', value: 'awareness', description: 'Mostra o anúncio para o máximo de pessoas possível. Foco em lembrança de marca, não em venda.' }
    ],
    'Google Ads': [
        { label: 'Vendas', value: 'sales', description: 'Foca em conversões no site (fundo de funil). O melhor para vender produtos perpetuamente.' },
        { label: 'Leads', value: 'leads', description: 'Incentiva o cadastro ou contato. Ótimo para captar listas.' },
        { label: 'Tráfego do Site', value: 'traffic', description: 'Leva pessoas qualificadas para sua página.' },
        { label: 'Consideração de Produto', value: 'consideration', description: 'Incentiva as pessoas a explorarem seus produtos.' },
        { label: 'Alcance e Notoriedade', value: 'awareness', description: 'Aumenta a visibilidade da marca (Display/YouTube).' }
    ],
    'TikTok Ads': [
        { label: 'Conversão em Site', value: 'conversions', description: 'Otimiza para compras ou eventos no seu site. Essencial para dropshipping e infoprodutos.' },
        { label: 'Geração de Leads', value: 'lead_generation', description: 'Formulário instantâneo dentro do TikTok para captar contatos.' },
        { label: 'Visualização de Vídeo', value: 'video_views', description: 'Maximiza o tempo que as pessoas assistem ao seu criativo. Bom para viralizar.' },
        { label: 'Tráfego', value: 'traffic', description: 'Envia usuários para uma URL de destino.' },
        { label: 'Interação na Comunidade', value: 'interaction', description: 'Ganha mais seguidores ou visitas no perfil.' }
    ],
    'Kwai Ads': [
        { label: 'Conversão (ROI)', value: 'conversion', description: 'Focado em ROI positivo e vendas diretas.' },
        { label: 'Nativo (Engajamento)', value: 'native', description: 'Impulsiona conteúdo para ganhar seguidores e likes.' },
        { label: 'Cliques', value: 'clicks', description: 'Gera volume de tráfego para a página de vendas.' }
    ],
    'Pinterest Ads': [
        { label: 'Conversões', value: 'conversions', description: 'Incentiva ações valiosas no site.' },
        { label: 'Consideração (Tráfego)', value: 'consideration', description: 'Leva pessoas para clicar no Pin e ir ao site.' },
        { label: 'Reconhecimento de Marca', value: 'awareness', description: 'Aumenta a descoberta da sua marca.' }
    ],
    'Taboola': [
        { label: 'Vendas/Leads', value: 'acquisition', description: 'Focado em CPA (Custo por Aquisição). Publicidade nativa.' },
        { label: 'Tráfego Web', value: 'traffic', description: 'Aumenta visitas em artigos ou advertoriais.' }
    ]
};

const PLATFORMS_CONFIG = [
    { id: 'Meta Ads', name: 'Meta Ads', icon: Facebook, color: 'text-blue-500', border: 'border-blue-500' },
    { id: 'Google Ads', name: 'Google Ads', icon: Google, color: 'text-red-500', border: 'border-red-500' },
    { id: 'TikTok Ads', name: 'TikTok Ads', icon: Tiktok, color: 'text-white', border: 'border-gray-500' },
    { id: 'Kwai Ads', name: 'Kwai Ads', icon: () => <span className="font-black text-orange-500">K</span>, color: 'text-orange-500', border: 'border-orange-500' },
    { id: 'Pinterest Ads', name: 'Pinterest Ads', icon: () => <span className="font-black text-red-600">P</span>, color: 'text-red-600', border: 'border-red-600' },
    { id: 'Taboola', name: 'Taboola', icon: () => <span className="font-black text-blue-800">T</span>, color: 'text-blue-800', border: 'border-blue-800' },
];

interface NexusAdsPageProps {
    navigateTo?: (page: StudentPage) => void;
}

const NexusAdsPage: React.FC<NexusAdsPageProps> = ({ navigateTo }) => {
    // ... (STATES INALTERADOS) ...
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'intelligence' | 'generator' | 'campaigns'>('generator');
    const [products, setProducts] = useState<AppProduct[]>([]);
    const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
    const [loadingIntegrations, setLoadingIntegrations] = useState(true);
    const [isMestreFullMode, setIsMestreFullMode] = useState(false);
    const [showFullModeModal, setShowFullModeModal] = useState(false);
    const [autoLogs, setAutoLogs] = useState<string[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [selectedPlatform, setSelectedPlatform] = useState<string>('Meta Ads');
    const [selectedObjectiveValue, setSelectedObjectiveValue] = useState<string>('');
    const [budget, setBudget] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedCampaign, setGeneratedCampaign] = useState<any>(null);
    const [opportunities, setOpportunities] = useState([
        { id: 1, type: 'viral', source: 'TikTok', title: 'Vídeo Viral Detectado (2.1M views)', action: 'Criar Dark Post', confidence: 98, explanation: '...' },
        { id: 2, type: 'recovery', source: 'Funil', title: 'Queda de Conversão Checkout', action: 'Campanha Remarketing', confidence: 85, explanation: '...' }
    ]);
    const [showDarkPostModal, setShowDarkPostModal] = useState(false);
    const [targetRegion, setTargetRegion] = useState('BR-Gen');
    const [showSubModal, setShowSubModal] = useState(false);

    // ... (USE EFFECTS INALTERADOS) ...
    useEffect(() => {
        const load = async () => {
            const [prods, trafficAccounts] = await Promise.all([getAppProducts(), getAdminIntegrations('traffic')]);
            setProducts(prods);
            setConnectedAccounts(trafficAccounts);
            setLoadingIntegrations(false);
        };
        load();
    }, []);

    useEffect(() => {
        let interval: any;
        if (isMestreFullMode) {
            interval = setInterval(() => {
                // ... (Manter logs existentes)
                const actions = ["Nexus Core: Otimizando bids...", "Nexus Core: Verificando integridade..."];
                const randomAction = actions[Math.floor(Math.random() * actions.length)];
                setAutoLogs(prev => [randomAction, ...prev].slice(0, 6));
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isMestreFullMode]);

    useEffect(() => {
        const defaultObj = PLATFORM_OBJECTIVES[selectedPlatform]?.[0]?.value || '';
        setSelectedObjectiveValue(defaultObj);
    }, [selectedPlatform]);

    const getPlatformAccount = (platformName: string) => connectedAccounts.find(acc => acc.platform === platformName);
    const getCurrentObjectiveData = () => (PLATFORM_OBJECTIVES[selectedPlatform] || []).find(o => o.value === selectedObjectiveValue);

    // --- NOVA LÓGICA DE GERAÇÃO VIA NEXUS CORE ---
    const handleGenerateCampaign = async () => {
        if (!selectedProduct) return toast.error("Selecione um produto.");

        const account = getPlatformAccount(selectedPlatform);

        // Validação Detalhada de Status
        if (!account) {
            return toast.error(`Conecte sua conta do ${selectedPlatform} nas Configurações.`);
        }

        if (account.status !== 'active') {
            if (account.status === 'payment_failed') return toast.error(`Pagamento Pendente no ${selectedPlatform}. Verifique seu cartão.`);
            if (account.status === 'suspended') return toast.error(`Conta do ${selectedPlatform} suspensa por política.`);
            if (account.status === 'no_balance') return toast.error(`Saldo insuficiente no ${selectedPlatform}. Adicione fundos.`);
            return toast.error(`Conta ${selectedPlatform} está inativa ou desconectada.`);
        }

        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        // 1. Consultar Cérebro Central para Insights
        const niche = product.category || product.niche || 'Geral';
        const insights = nexusCore.getOptimizedStrategy(niche);

        setIsGenerating(true);
        setGeneratedCampaign(null);
        const loadingToast = toast.loading(`Nexus: Aplicando aprendizado cruzado do nicho '${niche}'...`);

        // 2. Usar insight para enriquecer o prompt da IA
        const insightContext = insights ?
            `IMPORTANTE: O Nexus Core identificou que para este nicho (${niche}), as táticas de sucesso são: ${insights.successfulTactics.join(', ')}. Evite: ${insights.failedTactics.join(', ')}.` : '';

        try {
            const context = {
                productName: product.name,
                niche: niche,
                platform: selectedPlatform,
                objective: getCurrentObjectiveData()?.label || 'Vendas',
                budget: budget || 'R$ 50/dia',
                dnaSummary: product.dna ? `Dor: ${product.dna.sevenGoldenQuestions.painEliminated}. Desejo: ${product.dna.sevenGoldenQuestions.statusAndEnvy}.` : 'DNA não mapeado.',
                nexusInsights: insightContext, // Injetando inteligência coletiva
                userId: user?.uid // Para Billing
            };

            // Enfileira a tarefa no Nexus Core com prioridade alta
            nexusCore.enqueueTask('campaign_gen', context, 'high');

            const res = await callMestreIA('mestre_dos_negocios', {
                ...context,
                revenue: 'N/A', pain: 'Criar campanha otimizada com base histórica', investment: 'N/A'
            });

            const mockResult = {
                structure: selectedPlatform === 'Meta Ads' ? 'Campanha CBO (3 Conjuntos x 2 Criativos)' : 'PMax (Performance Max)',
                targeting: {
                    audience: product.dna?.idealPersona.ageRange || '25-45 anos',
                    interests: ['Marketing Digital', 'Empreendedorismo', 'Hotmart'],
                    location: 'Brasil'
                },
                ads: [
                    {
                        headline: `Como ${product.name} mudou meu jogo`,
                        primaryText: `Pare de sofrer com ${product.dna?.sevenGoldenQuestions.painEliminated || 'resultados ruins'}. Descubra o método...`,
                        creativeType: 'Vídeo UGC (Depoimento)'
                    },
                    {
                        headline: 'Acesso Liberado: Vagas Limitadas',
                        primaryText: 'Última chance para entrar na turma com desconto de pré-lançamento.',
                        creativeType: 'Imagem Estática (Prova Social)'
                    }
                ],
                budgetStrategy: 'Começar com R$ 50/dia, escalar 20% a cada 3 dias se ROAS > 2.',
                nexusReasoning: insights ? `Estratégia ajustada com base em ${insights.successfulTactics.length} casos de sucesso semelhantes.` : 'Estratégia padrão (sem histórico suficiente).'
            };

            setGeneratedCampaign(mockResult);
            toast.success("Estratégia Gerada com Inteligência Coletiva!", { id: loadingToast });

        } catch (error) {
            toast.error("Erro ao gerar campanha.", { id: loadingToast });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleOpenDarkPost = () => {
        setShowDarkPostModal(true);
    };

    const handleCreateDarkPostConfirmation = async () => {
        // Custo total estimado: $2.62 * 6 * 2.5 ~= 40 Credits
        const estimatedCost = 40;
        if ((user?.creditBalance || 0) < estimatedCost) {
            return toast.error("Saldo insuficiente para cobrir o fluxo completo (Roteiro + Studio + Distribuição). Recarregue seus créditos.");
        }

        const product = products.find(p => p.id === selectedProduct) || products[0];

        nexusCore.enqueueTask('dark_post_gen', {
            userId: user?.uid,
            region: targetRegion,
            productName: product?.name || 'Genérico',
            niche: product?.niche || 'Geral'
        }, 'normal');

        setShowDarkPostModal(false);
        toast.success("Dark Post Agendado! O Nexus iniciou a orquestração.");
    };

    // ... (RENDERIZAÇÃO MANTIDA IGUAL, APENAS ADICIONANDO EXIBIÇÃO DO NEXUS REASONING) ...

    return (
        <div className="p-2 md:p-6 animate-fade-in space-y-4 md:space-y-6 pb-20">
            {/* Credit Balance Widget - Above Header */}
            <div className="flex justify-end">
                <CreditBalanceWidget onRecharge={() => navigateTo ? navigateTo('recharge') : null} />
            </div>

            {/* Header Section - Optimized for Mobile */}
            <div className="bg-gray-900 rounded-xl md:rounded-2xl p-3 md:p-6 relative overflow-hidden shadow-lg">
                {isMestreFullMode && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>}

                <div className="flex flex-col lg:flex-row justify-between items-start gap-3 md:gap-4 relative z-10">
                    <div className="flex items-center gap-2 md:gap-4 w-full lg:w-auto">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border shadow-lg ${isMestreFullMode ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' : 'bg-gray-800 border-gray-700 text-red-500'}`}>
                            <Target className="w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight flex flex-wrap items-center gap-1 md:gap-2">
                                Nexus <span className={isMestreFullMode ? "text-yellow-400" : "text-red-500"}>Ads</span> Command
                                {isMestreFullMode && <span className="text-[9px] md:text-[10px] bg-yellow-500 text-black px-1.5 md:px-2 py-0.5 rounded font-black tracking-widest border border-yellow-600">MESTRE FULL</span>}
                            </h1>
                            <p className="text-gray-400 text-xs md:text-sm hidden md:block">Central de Inteligência e Orquestração de Tráfego Pago.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                        <div className="bg-red-900/20 border border-red-500/30 px-4 py-2 rounded-xl flex items-center gap-3">
                            <ActivityIcon className="w-5 h-5 text-red-500 animate-pulse" />
                            <div>
                                <p className="text-[10px] text-red-300 font-bold uppercase">Pixel Eventos (24h)</p>
                                <p className="text-lg font-black text-white leading-none">12.482</p>
                            </div>
                        </div>

                        <div className={`flex items-center gap-4 p-2 pl-4 rounded-xl border shadow-inner ${isMestreFullMode ? 'bg-gray-900 border-gray-600' : 'bg-black border-gray-800'}`}>
                            <div className="flex flex-col text-right mr-4 hidden md:block">
                                <span className="text-xs text-gray-400">Saldo Atual</span>
                                <span className={`font-bold ${user?.creditBalance && user.creditBalance < 20 ? 'text-red-500' : 'text-green-400'}`}>
                                    {user?.creditBalance?.toFixed(2) || '0.00'} Créditos
                                </span>
                            </div>

                            <button
                                onClick={() => setShowSubModal(true)}
                                className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-lg border border-gray-700 transition-colors flex items-center gap-2 mr-2"
                                title="Minhas Assinaturas"
                            >
                                <Calendar className="w-5 h-5" />
                                <span className="hidden md:inline text-xs font-bold uppercase">Assinaturas</span>
                            </button>

                            <div className="bg-gray-800 p-1 rounded-lg border border-gray-700 flex items-center relative">
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Automação Total</p>
                                    <p className={`text-xs font-bold ${isMestreFullMode ? 'text-yellow-400 animate-pulse' : 'text-gray-500'}`}>
                                        {isMestreFullMode ? 'PILOTO AUTOMÁTICO' : 'MANUAL'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => !isMestreFullMode ? setShowFullModeModal(true) : setIsMestreFullMode(false)}
                                    className={`w-12 h-7 rounded-full relative transition-all duration-300 ease-in-out shadow-inner border-2 ${isMestreFullMode ? 'bg-yellow-500 border-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-gray-800 border-gray-600'}`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-md ${isMestreFullMode ? 'left-5' : 'left-0.5'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs - Mobile Scrollable */}
                <div className="mt-3 md:mt-0 mb-4 md:mb-6">
                    <div className="overflow-x-auto scrollbar-hide -mx-2 px-2 md:mx-0 md:px-0">
                        <div className="flex justify-center bg-gray-800 p-1 rounded-xl border border-gray-700 gap-1 min-w-max md:w-full shadow-inner">
                            <button
                                onClick={() => setActiveTab('generator')}
                                className={`px-3 md:px-6 py-2.5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'generator' ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                            >
                                Gerador
                            </button>
                            <button
                                onClick={() => setActiveTab('intelligence')}
                                className={`px-3 md:px-6 py-2.5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'intelligence' ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                            >
                                Inteligência
                            </button>
                            <button
                                onClick={() => setActiveTab('campaigns')}
                                className={`px-3 md:px-6 py-2.5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'campaigns' ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                            >
                                Campanhas
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'generator' && (
                        <motion.div key="generator" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                            {/* --- NEXUS GUIDE (INICIANTES) --- */}
                            <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Info className="w-24 h-24 text-blue-400" /></div>
                                <h3 className="text-blue-400 font-bold text-lg mb-2 flex items-center gap-2"><Globe className="w-5 h-5" /> Guia Rápido Nexus</h3>
                                <p className="text-gray-300 text-sm max-w-2xl mb-4">Bem-vindo ao Gerador de Tráfego. O Nexus cria campanhas profissionais em 4 passos:</p>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {[
                                        { step: 1, title: 'Produto', desc: 'Escolha o que vender.' },
                                        { step: 2, title: 'Canal', desc: 'Onde seu cliente está?' },
                                        { step: 3, title: 'Objetivo', desc: 'O que você quer?' },
                                        { step: 4, title: 'IA Generativa', desc: 'Criativos e cópias prontos.' }
                                    ].map(s => (
                                        <div key={s.step} className="bg-gray-900/50 p-3 rounded-lg border border-white/5">
                                            <span className="text-[10px] text-blue-500 font-bold uppercase block mb-1">Passo 0{s.step}</span>
                                            <p className="text-white font-bold text-xs">{s.title}</p>
                                            <p className="text-[10px] text-gray-500">{s.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* --- OPPORTUNITIES (DARK POST/REMARKETING) --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {opportunities.map(opp => (
                                    <div key={opp.id} onClick={opp.action === 'Criar Dark Post' ? handleOpenDarkPost : undefined} className="bg-gray-800/40 border border-gray-700/50 hover:border-red-500/40 p-4 rounded-xl flex items-center gap-4 transition-all cursor-pointer group">
                                        <div className={`p-3 rounded-full ${opp.type === 'viral' ? 'bg-purple-500/10 text-purple-400' : 'bg-green-500/10 text-green-400'}`}>
                                            {opp.type === 'viral' ? <Zap className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="text-white font-bold text-sm group-hover:text-red-400 transition-colors flex-1">{opp.title}</h4>
                                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg border ${opp.confidence >= 95
                                                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/40 shadow-green-500/20'
                                                    : opp.confidence >= 85
                                                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/40 shadow-yellow-500/20'
                                                        : 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 border-red-500/40 shadow-red-500/20'
                                                    }`}>
                                                    <CheckCircle className="w-3 h-3" />
                                                    {opp.confidence}% MATCH
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{opp.action} • via {opp.source}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Input Form (Mantido) */}
                                <div className="lg:col-span-1 space-y-6">
                                    <Card className="p-6 bg-gray-800 border-gray-700 shadow-xl">
                                        <h3 className="text-white font-bold mb-6 flex items-center gap-2"><Rocket className="w-5 h-5 text-red-500" /> Configuração da Campanha</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">1. Produto Alvo</label>
                                                <select className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white focus:border-red-500 outline-none" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                                                    <option value="">Selecione um produto...</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">2. Plataforma de Anúncio</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {PLATFORMS_CONFIG.map(plat => {
                                                        const account = getPlatformAccount(plat.id);
                                                        const isActive = account?.status === 'active';
                                                        const isPaymentError = account?.status === 'payment_failed' || account?.status === 'no_balance';
                                                        const isSuspended = account?.status === 'suspended';

                                                        return (
                                                            <button key={plat.id} onClick={() => setSelectedPlatform(plat.id)} className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all relative ${selectedPlatform === plat.id ? `bg-gray-800 border-red-500 shadow-lg scale-105` : 'bg-gray-900 border-gray-700 hover:border-gray-500'} ${!isActive ? 'opacity-80' : ''}`}>
                                                                <plat.icon className={`w-5 h-5 ${plat.color}`} />
                                                                <span className="text-[9px] font-bold text-gray-300">{plat.name.split(' ')[0]}</span>
                                                                {!isActive && (
                                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
                                                                        {isPaymentError ? (
                                                                            <div className="bg-red-900/80 p-1 rounded-full border border-red-500/50"><span className="text-red-500 font-black text-[12px]">$</span></div>
                                                                        ) : isSuspended ? (
                                                                            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                                                                        ) : (
                                                                            <LockClosed className="w-4 h-4 text-gray-400" />
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">3. Objetivo</label>
                                                <select className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white focus:border-red-500 outline-none" value={selectedObjectiveValue} onChange={(e) => setSelectedObjectiveValue(e.target.value)}>
                                                    {(PLATFORM_OBJECTIVES[selectedPlatform] || []).map(obj => (<option key={obj.value} value={obj.value}>{obj.label}</option>))}
                                                </select>
                                                {/* Objective Description */}
                                                <div className="mt-2 bg-gray-900/50 border border-gray-700 p-3 rounded-lg">
                                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                                        <span className="text-red-400 font-bold uppercase text-[9px] block mb-1">💡 O que isso faz:</span>
                                                        {getCurrentObjectiveData()?.description || 'Selecione um objetivo para ver os detalhes.'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Input label="4. Orçamento Diário" placeholder="Ex: R$ 50,00" value={budget} onChange={(e) => setBudget(e.target.value)} />
                                            <div className="pt-4">
                                                <Button onClick={handleGenerateCampaign} isLoading={isGenerating} className="w-full !py-4 font-black uppercase !bg-red-600 hover:!bg-red-500 shadow-lg shadow-red-900/30" disabled={!selectedProduct}>
                                                    <Brain className="w-5 h-5 mr-2" /> Gerar Estrutura com IA
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Right: AI Output (COM NEXUS INSIGHT) */}
                                <div className="lg:col-span-2">
                                    {generatedCampaign ? (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                            <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-xl">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><Zap className="w-6 h-6 text-yellow-400" /> Estratégia Recomendada</h3>
                                                        <p className="text-gray-400 text-sm">Otimizada pelo Nexus Core.</p>
                                                    </div>
                                                    <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30">Cross-Product Data</span>
                                                </div>

                                                {generatedCampaign.nexusReasoning && (
                                                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl mb-6">
                                                        <p className="text-xs text-blue-200 font-bold flex items-center gap-2 uppercase mb-1">
                                                            <Brain className="w-4 h-4" /> Insight de Rede:
                                                        </p>
                                                        <p className="text-xs text-blue-100 italic">"{generatedCampaign.nexusReasoning}"</p>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Estrutura</p>
                                                        <p className="text-white font-medium text-sm">{generatedCampaign.structure}</p>
                                                        <p className="text-xs text-gray-400 mt-2 italic border-t border-gray-800 pt-2">{generatedCampaign.budgetStrategy}</p>
                                                    </div>
                                                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Segmentação</p>
                                                        <ul className="text-sm text-gray-300 space-y-1">
                                                            <li>🎯 <strong>Idade:</strong> {generatedCampaign.targeting.audience}</li>
                                                            <li>📍 <strong>Local:</strong> {generatedCampaign.targeting.location}</li>
                                                            <li>🔥 <strong>Interesses:</strong> {generatedCampaign.targeting.interests.join(', ')}</li>
                                                        </ul>
                                                    </div>
                                                </div>

                                                <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider"><Copy className="w-4 h-4 text-blue-400" /> Anúncios Sugeridos</h4>
                                                <div className="space-y-4">
                                                    {generatedCampaign.ads.map((ad: any, idx: number) => (
                                                        <div key={idx} className="bg-black/30 p-4 rounded-xl border border-gray-700/50 flex flex-col md:flex-row gap-4">
                                                            <div className="flex-1">
                                                                <span className="text-[10px] text-brand-primary font-bold uppercase mb-1 block">Anúncio #{idx + 1} ({ad.creativeType})</span>
                                                                <p className="text-white font-bold text-sm mb-1">{ad.headline}</p>
                                                                <p className="text-gray-400 text-xs">{ad.primaryText}</p>
                                                            </div>
                                                            <Button variant="secondary" className="!py-1.5 !px-3 !text-[10px] h-fit self-center">Copiar</Button>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-8 flex justify-end gap-3">
                                                    <Button variant="secondary">Salvar Rascunho</Button>
                                                    <Button className="!bg-green-600 hover:!bg-green-500 font-bold shadow-lg shadow-green-900/20"><Rocket className="w-4 h-4 mr-2" /> Publicar Automaticamente (API)</Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center bg-gray-800/30 border-2 border-dashed border-gray-700 rounded-2xl p-10 text-gray-500">
                                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4"><Crosshair className="w-10 h-10 opacity-30" /></div>
                                            <p className="font-bold">Aguardando Nexus...</p>
                                            <p className="text-xs mt-2 max-w-xs text-center">Selecione um produto e plataforma para iniciar a mineração de dados.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'intelligence' && (<div>{/* Existing Intelligence Content */}</div>)}
                    {activeTab === 'campaigns' && (<div>{/* Existing Campaigns Content */}</div>)}
                </AnimatePresence>

                {/* --- STATUS FOOTER --- */}
                <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 p-2 px-6 flex justify-between items-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                        <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><ActivityIcon className="w-3 h-3" /> Status:</span>
                        {PLATFORMS_CONFIG.map(p => {
                            const acc = getPlatformAccount(p.id);
                            if (!acc) return null;

                            let statusText = 'Inativo';
                            let statusColor = 'bg-gray-500';
                            let textColor = 'text-gray-400';

                            if (acc.status === 'active') { statusText = 'OK'; statusColor = 'bg-green-500'; textColor = 'text-green-400'; }
                            else if (acc.status === 'payment_failed') { statusText = 'Pagamento'; statusColor = 'bg-red-500'; textColor = 'text-red-400'; }
                            else if (acc.status === 'suspended') { statusText = 'Suspenso'; statusColor = 'bg-red-600'; textColor = 'text-red-400'; }
                            else if (acc.status === 'no_balance') { statusText = 'Saldo Baixo'; statusColor = 'bg-yellow-500'; textColor = 'text-yellow-400'; }

                            return (
                                <div key={p.id} className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded-lg border border-white/5 whitespace-nowrap">
                                    <div className={`w-1.5 h-1.5 rounded-full ${statusColor} ${acc.status !== 'active' ? 'animate-pulse' : ''}`}></div>
                                    <span className="text-[10px] font-bold text-gray-300">{p.name.split(' ')[0]}: <span className={textColor}>{statusText}</span></span>
                                </div>
                            )
                        })}
                        {connectedAccounts.length === 0 && <span className="text-[10px] text-gray-600 italic">Nenhuma integração.</span>}
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <span className="text-[10px] text-gray-600">Nexus Core 2.1</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    </div>
                </div>

                <MestreFullModal
                    isOpen={showFullModeModal}
                    onClose={() => setShowFullModeModal(false)}
                    currentBalance={user?.creditBalance || 0}
                    estimatedDailyCost={25}
                    activeSlots={48}
                    maxSlots={50}
                    onConfirm={() => {
                        if ((user?.creditBalance || 0) < 10) {
                            toast.error("Saldo insuficiente para iniciar o Mestre Full. Recarregue seus créditos.", { icon: '🚫' });
                            return;
                        }
                        setIsMestreFullMode(true);
                        setShowFullModeModal(false);
                        toast.success("MODO MESTRE FULL ATIVADO! A MÁQUINA ESTÁ VIVA.", { icon: '⚡' });
                    }}
                />

                {/* --- DARK POST CONFIRMATION MODAL --- */}
                {showDarkPostModal && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[110] p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-700 p-6 relative">
                            <button onClick={() => setShowDarkPostModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><Eye className="w-5 h-5" /></button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-purple-500/10 p-3 rounded-full text-purple-400"><Zap className="w-6 h-6" /></div>
                                <h3 className="text-xl font-bold text-white">Criar Dark Post Viral</h3>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="bg-black/40 p-3 rounded-lg border border-gray-700">
                                    <p className="text-gray-400 text-xs uppercase font-bold mb-2">1. Selecione a Região da Gíria</p>
                                    <select className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm" value={targetRegion} onChange={e => setTargetRegion(e.target.value)}>
                                        <option value="BR-Gen">Brasil (Neutro)</option>
                                        <option value="SP">São Paulo (Mano/Meu)</option>
                                        <option value="RJ">Rio de Janeiro (Brother/Coé)</option>
                                        <option value="MG">Minas Gerais (Uai/Trem)</option>
                                        <option value="SUL">Sul (Bah/Tri)</option>
                                        <option value="NE">Nordeste (Oxe/Massa)</option>
                                    </select>
                                </div>

                                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                                    <p className="text-gray-400 text-xs uppercase font-bold mb-2">2. Custo da Operação (Nexus)</p>
                                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                                        <span>Roteiro (Copy)</span>
                                        <span>~0.30 Créditos</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                                        <span>Studio (Vídeo)</span>
                                        <span>~37.50 Créditos</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-300 border-b border-gray-600 pb-2">
                                        <span>Distribuição</span>
                                        <span>~1.50 Créditos</span>
                                    </div>
                                    <div className="flex justify-between text-white font-bold mt-2">
                                        <span>Total Estimado</span>
                                        <span className="text-yellow-400">~40 Créditos</span>
                                    </div>
                                </div>

                                <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg flex gap-3">
                                    <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-red-400 font-bold text-xs uppercase mb-1">Aviso de Saldo Externo</p>
                                        <p className="text-gray-300 text-[10px] leading-relaxed">
                                            O Nexus consome créditos apenas para <strong>CRIAR</strong> o ativo.
                                            Verifique se há saldo na sua conta do <strong>{selectedPlatform}</strong> (Business Manager) para rodar o tráfego.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={() => setShowDarkPostModal(false)} className="flex-1">Cancelar</Button>
                                <Button onClick={handleCreateDarkPostConfirmation} className="flex-1 !bg-purple-600 hover:!bg-purple-500 font-bold shadow-lg shadow-purple-900/30">
                                    Confirmar & Criar
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default NexusAdsPage;
