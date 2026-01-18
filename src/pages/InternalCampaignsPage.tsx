
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import {
    Megaphone, PlusCircle, Trash, Eye, CheckCircle, X as XIcon,
    Calendar, Users, Brain, Save, Search, Filter, Palette,
    Cpu, TrendingUp, Zap, RefreshCw, DollarSign, Database, Info,
    Monitor, Smartphone, ShieldCheck, LockClosed, Crown, Sparkles,
    ArrowRight, BookOpen, Bot, ShoppingBag, BarChart3, MessageSquare, Trophy, Star
} from '../components/Icons';
import toast from 'react-hot-toast';
import { getAllCampaigns, saveCampaign, deleteCampaign, getCourses, getAppProducts, runNexusDataCollection } from '../services/mockFirebase';
import { InternalCampaign, Course, AppProduct, NexusAnalysisResult, User } from '../types';
import { callMestreIA } from '../services/mestreIaService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import CampaignBanner from '../components/CampaignBanner';
import { logger } from '../services/monitoring'; // NEW IMPORT

// --- GOD MODE SIMULATION TYPES & DATA ---
type SimulationRole = 'student' | 'influencer' | 'sales_agent' | 'support_agent';

const MOCK_PROFILES: Record<SimulationRole, User> = {
    student: {
        uid: 'sim-student-001',
        email: 'aluno.simulado@teste.com',
        displayName: 'Aluno Simulado (Modo Deus)',
        role: 'student',
        hasMestreIA: true
    },
    influencer: {
        uid: 'sim-influencer-001',
        email: 'influencer.simulado@teste.com',
        displayName: 'Influencer Parceiro (Modo Deus)',
        role: 'influencer'
    },
    sales_agent: {
        uid: 'sim-sales-001',
        email: 'vendedor.simulado@teste.com',
        displayName: 'Vendedor Elite (Modo Deus)',
        role: 'sales_agent'
    },
    support_agent: {
        uid: 'sim-support-001',
        email: 'suporte.simulado@teste.com',
        displayName: 'Agente Suporte (Modo Deus)',
        role: 'support_agent'
    }
};

const GodModePreviewModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const [selectedRole, setSelectedRole] = useState<SimulationRole>('student');
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationLog, setSimulationLog] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSimulationLog([]);
            setIsSimulating(true);
            // Simulate loading logs from Nexus
            setTimeout(() => {
                setSimulationLog([
                    `[NEXUS CORE] Iniciando simulação para perfil: ${selectedRole.toUpperCase()}...`,
                    `[FILTER] Carregando campanhas ativas para role='${selectedRole}'...`,
                    `[BANNER] Renderizando componente CampaignBanner...`,
                    `[DEBUG] User ID simulado: ${MOCK_PROFILES[selectedRole].uid}`,
                    `[STATUS] Aguardando renderização do frontend...`
                ]);
                setIsSimulating(false);
            }, 800);
        }
    }, [isOpen, selectedRole]);

    if (!isOpen) return null;

    const activeUser = MOCK_PROFILES[selectedRole];

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[150] p-2">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900 w-full max-w-[98vw] h-[95vh] rounded-2xl border-2 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)] flex flex-col overflow-hidden"
            >
                {/* ... existing modal code ... */}
                {/* Header */}
                <div className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between items-center relative z-20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/40">
                            <Eye className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                                Modo Deus <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded border border-purple-400">DEBUG ADMIN</span>
                            </h2>
                            <p className="text-xs text-purple-300 font-mono">Visualização em tempo real de campanhas por perfil</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-gray-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar: Role Selector */}
                    <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col gap-2 overflow-y-auto flex-shrink-0">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-2 px-2">Selecionar Perfil Alvo</p>
                        {[
                            { id: 'student', label: 'Aluno (Dashboard)', icon: Users },
                            { id: 'influencer', label: 'Influencer / Afiliado', icon: TrendingUp },
                            { id: 'sales_agent', label: 'Agente de Vendas', icon: DollarSign },
                            { id: 'support_agent', label: 'Agente de Suporte', icon: ShieldCheck },
                        ].map((role) => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role.id as SimulationRole)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${selectedRole === role.id
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                                    : 'bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                                    }`}
                            >
                                <role.icon className="w-4 h-4" />
                                {role.label}
                            </button>
                        ))}

                        <div className="mt-auto bg-black/40 p-3 rounded-lg border border-gray-700">
                            <p className="text-[10px] text-gray-500 font-mono mb-1">USER CONTEXT:</p>
                            <div className="text-xs text-green-400 font-mono break-all">
                                @{activeUser.role}
                                <br />
                                uid: {activeUser.uid.substring(0, 8)}...
                            </div>
                        </div>
                    </div>

                    {/* Main Preview Area */}
                    <div className="flex-1 bg-black/50 p-6 overflow-y-auto relative flex flex-col items-center">
                        {/* Device Frame Simulation */}
                        <div className="w-full max-w-full h-full bg-gray-900 rounded-xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col mb-6">
                            {/* Browser Bar */}
                            <div className="bg-gray-800 p-2 border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="text-xs text-gray-500 font-mono flex items-center gap-2 bg-gray-900 px-4 py-1 rounded-full border border-gray-700/50">
                                    <LockClosed className="w-3 h-3" /> mestredosnegocios.com/dashboard
                                </div>
                                <div></div>
                            </div>

                            {/* Content Area - Simulated Dashboard */}
                            <div className="flex-1 bg-brand-secondary overflow-y-auto relative custom-scrollbar">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none fixed"></div>

                                {isSimulating ? (
                                    <div className="flex flex-col items-center justify-center h-full text-purple-400 min-h-[500px]">
                                        <RefreshCw className="w-10 h-10 animate-spin mb-4" />
                                        <p className="text-sm font-bold">Carregando contexto do usuário...</p>
                                    </div>
                                ) : (
                                    <div className="p-6 space-y-6 relative z-10 max-w-7xl mx-auto">

                                        {/* 1. MOCK HEADER */}
                                        <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-700 rounded-full border-2 border-brand-primary flex items-center justify-center text-white font-bold">
                                                    {activeUser.displayName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h1 className="text-lg font-bold text-white">Olá, {activeUser.displayName?.split(' ')[0]}! 👋</h1>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <Trophy className="w-3 h-3 text-yellow-500" /> Nível: Iniciante
                                                    </div>
                                                </div>
                                            </div>
                                            <Button className="!py-2 !px-4 !text-xs whitespace-nowrap bg-gray-700">
                                                <BarChart3 className="w-4 h-4 md:mr-2" /> Check-in
                                            </Button>
                                        </div>

                                        {/* 2. THE ACTUAL BANNER COMPONENT */}
                                        <div className="relative z-20">
                                            <div className="absolute -top-3 left-4 bg-purple-600 text-white text-[9px] px-2 py-0.5 rounded font-bold uppercase z-30 shadow-sm border border-purple-400">
                                                Visualização do Aluno
                                            </div>
                                            <div className="border-2 border-dashed border-purple-500/50 p-1 rounded-2xl">
                                                <CampaignBanner user={activeUser} />
                                            </div>
                                        </div>

                                        {/* 3. MOCK DASHBOARD CONTENT (To show positioning context) */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-70 pointer-events-none select-none filter grayscale-[0.3]">
                                            {/* Mestre IA Card Mock */}
                                            <div className="col-span-2 row-span-2 bg-gradient-to-br from-brand-primary to-yellow-600 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="bg-black/20 p-2 rounded-lg"><Sparkles className="w-5 h-5 text-white" /></div>
                                                        <span className="text-black/60 font-bold text-xs uppercase">Novo</span>
                                                    </div>
                                                    <h3 className="text-2xl font-black text-black">Mestre IA</h3>
                                                    <p className="text-black/80 text-xs mt-1">Seu consultor 24h.</p>
                                                </div>
                                                <div className="mt-4 bg-black/10 rounded-lg p-2 flex items-center justify-between">
                                                    <span className="text-black font-bold text-xs">5 créditos</span>
                                                    <div className="bg-black text-brand-primary px-3 py-1 rounded text-[10px] font-bold">ACESSAR</div>
                                                </div>
                                            </div>

                                            {/* Standard Grid Buttons Mock */}
                                            {[
                                                { icon: <BookOpen className="w-5 h-5" />, label: "Treinamento", color: "text-blue-400" },
                                                { icon: <Bot className="w-5 h-5" />, label: "Coach IA", color: "text-indigo-400" },
                                                { icon: <ShoppingBag className="w-5 h-5" />, label: "Produtos", color: "text-green-400" },
                                                { icon: <Users className="w-5 h-5" />, label: "Comunidade", color: "text-purple-400" },
                                                { icon: <MessageSquare className="w-5 h-5" />, label: "Suporte", color: "text-pink-400" },
                                                { icon: <Star className="w-5 h-5" />, label: "Bônus", color: "text-teal-400" },
                                            ].map((btn, idx) => (
                                                <div key={idx} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 h-32">
                                                    <div className={`p-2 rounded-full bg-gray-900 ${btn.color}`}>{btn.icon}</div>
                                                    <span className="text-xs font-bold text-white">{btn.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Mock Active Products List */}
                                        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 opacity-70 pointer-events-none">
                                            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Meus Produtos Ativos</h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">Mestre do Tráfego</p>
                                                            <p className="text-xs text-gray-500">12 posts registrados</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>
                            {/* End Simulated Dashboard */}
                        </div>

                        {/* Debug Logs Console */}
                        <div className="w-full max-w-[90%] mt-auto bg-black rounded-lg border border-gray-800 font-mono text-xs p-4 h-32 overflow-y-auto custom-scrollbar shadow-inner flex-shrink-0">
                            <p className="text-gray-500 mb-2 border-b border-gray-800 pb-1">NEXUS_DEBUG_CONSOLE_V1.log</p>
                            {simulationLog.map((log, i) => (
                                <div key={i} className="text-gray-300 mb-1">
                                    <span className="text-purple-500">{new Date().toLocaleTimeString()}</span> {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// --- NEXUS DATA COLLECTOR COMPONENT (ETAPA 2) ---
const NexusDataCollector: React.FC = () => {
    const [isCollecting, setIsCollecting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [analysisResult, setAnalysisResult] = useState<NexusAnalysisResult | null>(null);

    const startCollection = async () => {
        setIsCollecting(true);
        setLogs([]);
        setAnalysisResult(null);
        setProgress(0);

        try {
            const result = await runNexusDataCollection((msg) => {
                setLogs(prev => [msg, ...prev].slice(0, 5));
                setProgress(prev => Math.min(prev + 10, 95));
            });
            setProgress(100);
            setAnalysisResult(result);
            toast.success("Análise de Dados Concluída com Sucesso!", { icon: '📊' });
        } catch (e) {
            // UPDATED: Using logger instead of console
            logger.error("Erro na coleta de dados Nexus", { error: e });
            toast.error("Erro na coleta de dados.");
        } finally {
            setIsCollecting(false);
        }
    };

    return (
        <Card className="bg-gray-800 border-l-4 border-l-blue-500 p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                        <Database className="w-5 h-5 text-blue-400" /> Coletor de Dados & Performance
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 max-w-lg">
                        A Nexus IA varre o banco de dados em busca de padrões de comportamento, alunos em risco e oportunidades de upsell. Dados anonimizados para segurança.
                    </p>
                </div>
                <Button
                    onClick={startCollection}
                    isLoading={isCollecting}
                    className="!bg-blue-600 hover:!bg-blue-500 !text-xs font-bold"
                >
                    <Search className="w-4 h-4 mr-2" /> Iniciar Varredura Global
                </Button>
            </div>

            {/* Progress & Logs */}
            {isCollecting && (
                <div className="mb-6 space-y-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Processando...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                        <motion.div
                            className="bg-blue-500 h-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="bg-black/40 p-3 rounded border border-gray-700 font-mono text-[10px] text-gray-400 h-24 overflow-hidden flex flex-col-reverse">
                        {logs.map((log, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                {'>'} {log}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Results Display */}
            <AnimatePresence>
                {analysisResult && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4"
                    >
                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-center">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Total Analisado</p>
                            <p className="text-xl font-black text-white">{analysisResult.totalAnalyzed}</p>
                        </div>
                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-center">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Alunos em Risco</p>
                            <p className="text-xl font-black text-red-400">{analysisResult.highRiskCount}</p>
                        </div>
                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-center">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Alta Performance</p>
                            <p className="text-xl font-black text-green-400">{analysisResult.highPerformanceCount}</p>
                        </div>
                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-center">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">ROI Médio (Base)</p>
                            <p className="text-xl font-black text-blue-400">+{analysisResult.avgROI.toFixed(1)}%</p>
                        </div>

                        <div className="col-span-full mt-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded text-xs text-blue-200 flex gap-2 items-center">
                            <Brain className="w-4 h-4 flex-shrink-0" />
                            <span>
                                <strong>Insight Nexus:</strong> {analysisResult.highRiskCount > 5 ? 'Detectado alto volume de alunos em risco. Sugiro ativar campanha de "Recuperação" na aba Campanhas Internas.' : 'Base saudável. Sugiro focar em Upsell para os alunos de Alta Performance.'}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

const InternalCampaignsPage: React.FC = () => {
    const [campaigns, setCampaigns] = useState<InternalCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);

    // Nexus AI State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [nexusSuggestions, setNexusSuggestions] = useState<any[]>([]);
    const [viewingSuggestion, setViewingSuggestion] = useState<any | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<InternalCampaign>>({
        title: '',
        description: '',
        ctaText: 'Saiba Mais',
        ctaLink: '',
        status: 'draft',
        targetAudience: { roles: ['student'] },
        backgroundColor: 'bg-gradient-to-r from-purple-600 to-blue-600'
    });

    // AI Generator State
    const [aiObjective, setAiObjective] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // GOD MODE STATE
    const [isGodModeOpen, setIsGodModeOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [camps, crs] = await Promise.all([getAllCampaigns(), getCourses()]);
            setCampaigns(camps);
            setCourses(crs);
        } catch (e) {
            logger.error("Falha ao carregar campanhas", { error: e });
        } finally {
            setLoading(false);
        }
    };

    // ... (rest of the file remains similar, I will truncate the middle to focus on the change) ...
    // NEXUS AI ANALYSIS FUNCTION - Updated with no change needed to logic, just context
    const handleNexusAnalyze = async () => {
        setIsAnalyzing(true);
        setNexusSuggestions([]);

        // Simulate scanning system data with deep financial analysis
        setTimeout(async () => {
            const products = await getAppProducts();
            const suggestions = [];
            // ... (Logic remains the same as previous output) ...

            // Logic 1: Low Sales Product Recovery with Cost Analysis
            const lowPerfProduct = products.find(p => p.stats.totalSales < 10);

            if (lowPerfProduct) {
                const originalPrice = lowPerfProduct.price || 97;
                const discountPrice = originalPrice * 0.7; // 30% off

                suggestions.push({
                    type: 'recovery',
                    icon: <TrendingUp className="w-5 h-5 text-red-400" />,
                    title: `Oferta de Resgate: ${lowPerfProduct.name}`,
                    description: `Ative leads frios com 30% OFF em ${lowPerfProduct.name}.`,
                    ctaText: 'Resgatar Oferta',
                    audience: 'student',
                    color: 'bg-gradient-to-r from-red-600 to-orange-500',
                    reason: `ANÁLISE DE RENTABILIDADE:
                    1. Custo Operacional: R$ 0,00 (Produto Digital/Infoproduto já hospedado).
                    2. Custo de Leads: Já pago (Sunk Cost). Leads atuais não converteram no preço cheio.
                    3. Cálculo: Vender a R$ ${discountPrice.toFixed(2)} gera 100% de margem sobre custo marginal zero.
                    4. Conclusão: O desconto recupera receita que seria perdida (R$ 0). A operação permanece lucrativa pois não há custo logístico.`
                });
            } else {
                suggestions.push({
                    type: 'recovery',
                    icon: <Zap className="w-5 h-5 text-yellow-400" />,
                    title: `Flash Sale: Ecossistema Completo`,
                    description: `Descontos agressivos de 50% por 24h para renovação de base.`,
                    ctaText: 'Ver Produtos',
                    audience: 'student',
                    color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
                    reason: `ANÁLISE DE CUSTO X VOLUME:
                    1. Margem Atual: 80% líquida.
                    2. Cenário Flash (50% OFF): Margem cai para 30%, PORÉM o volume de vendas projetado é 5x maior.
                    3. Custo Infra: Servidores aguentam pico sem custo adicional.
                    4. Veredito: O lucro absoluto (R$) será 2.5x maior que um dia normal, mesmo com margem percentual menor.`
                });
            }

            // Logic 2: Engagement (No cost analysis needed, purely retention)
            suggestions.push({
                type: 'engagement',
                icon: <Users className="w-5 h-5 text-blue-400" />,
                title: 'Desafio 7 Dias: Foco Total 🚀',
                description: 'Participe do desafio da comunidade e ganhe destaque. Clique para saber mais.',
                ctaText: 'Aceitar Desafio',
                audience: 'student',
                color: 'bg-gradient-to-r from-blue-600 to-purple-600',
                reason: 'DADOS DE RETENÇÃO:\nO engajamento caiu 5% esta semana. Usuários ativos têm LTV (Lifetime Value) 3x maior. Este desafio não tem custo financeiro direto e aumenta a retenção em média 15%.'
            });

            // Logic 3: High Ticket Upsell
            suggestions.push({
                type: 'upsell',
                icon: <Brain className="w-5 h-5 text-purple-400" />,
                title: 'Convite: Grupo Elite 💎',
                description: 'Parabéns pelo seu progresso. Liberamos uma vaga com condição especial.',
                ctaText: 'Ver Convite',
                audience: 'student',
                color: 'bg-gradient-to-r from-gray-900 to-gray-800 border border-yellow-500/50',
                reason: 'ANÁLISE DE PERFIL:\nIdentificamos 150 alunos (Nível Ouro+) com alta probabilidade de compra.\nCusto de Aquisição (CAC) para este upsell é R$ 0,00 (base interna).\nMargem de Lucro prevista: 95%.'
            });

            setNexusSuggestions(suggestions);
            setIsAnalyzing(false);
            toast.success("Nexus AI: Análise de rentabilidade concluída!", { icon: '🧠' });
        }, 2500);
    };

    const applySuggestion = (suggestion: any) => {
        setFormData({
            title: suggestion.title,
            description: suggestion.description,
            ctaText: suggestion.ctaText,
            ctaLink: '', // Admin sets manually
            status: 'draft',
            targetAudience: { roles: [suggestion.audience] },
            backgroundColor: suggestion.color
        });
        setIsModalOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleGenerateWithAI = async () => {
        if (!aiObjective.trim()) return toast.error("Descreva o objetivo da campanha para a IA.");

        setIsGenerating(true);
        try {
            const input = {
                objective: aiObjective,
                target: formData.targetAudience?.roles?.join(', ') || 'Geral',
                extras: `Cursos: ${courses.map(c => c.title).join(', ')}`
            };

            const res = await callMestreIA('internal_campaign_generator', input);
            let content = res.output;
            if (content.includes('```json')) {
                content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            }

            const parsed = JSON.parse(content);
            setFormData(prev => ({
                ...prev,
                title: parsed.title,
                description: parsed.description,
                ctaText: parsed.ctaText,
                backgroundColor: parsed.suggestedColor || prev.backgroundColor
            }));

            toast.success("Campanha gerada com IA! Revise e publique.", { icon: '✨' });
        } catch (e) {
            logger.error("Erro na geração de campanha IA", { error: e }); // USING LOGGER
            toast.error("Erro ao gerar campanha.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.description) return toast.error("Preencha os campos obrigatórios.");

        const newCampaign: InternalCampaign = {
            id: formData.id || `camp-${Date.now()}`,
            title: formData.title!,
            description: formData.description!,
            ctaText: formData.ctaText || 'Ver Detalhes',
            ctaLink: formData.ctaLink,
            status: formData.status as 'active' | 'draft' | 'archived',
            startDate: formData.startDate || new Date().toISOString(),
            endDate: formData.endDate || new Date(Date.now() + 86400000 * 7).toISOString(),
            targetAudience: {
                roles: formData.targetAudience?.roles || ['student'],
                courses: formData.targetAudience?.courses,
                levels: formData.targetAudience?.levels
            },
            createdAt: Date.now(),
            backgroundColor: formData.backgroundColor,
            notificationSent: formData.status === 'active'
        };

        await saveCampaign(newCampaign);
        toast.success("Campanha salva com sucesso!");
        setIsModalOpen(false);
        loadData();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir esta campanha?")) {
            await deleteCampaign(id);
            loadData();
            toast.success("Campanha removida.");
        }
    };

    const toggleRole = (role: string) => {
        const currentRoles = formData.targetAudience?.roles || [];
        if (currentRoles.includes(role as any)) {
            setFormData(prev => ({ ...prev, targetAudience: { ...prev.targetAudience!, roles: currentRoles.filter(r => r !== role) as any } }));
        } else {
            setFormData(prev => ({ ...prev, targetAudience: { ...prev.targetAudience!, roles: [...currentRoles, role] as any } }));
        }
    };

    return (
        <div className="p-6 animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2 uppercase">
                        <Megaphone className="w-8 h-8 text-brand-primary" /> Campanhas Internas
                    </h1>
                    <p className="text-gray-400 text-sm">Gerencie banners promocionais e avisos nos dashboards dos usuários.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setIsGodModeOpen(true)}
                        className="!bg-gray-800 border border-purple-500 hover:!bg-gray-700 text-purple-400 hover:text-purple-300 font-bold flex items-center gap-2"
                        title="Simular visualização de campanhas como usuário"
                    >
                        <Eye className="w-4 h-4" /> Visualizar em modo Deus
                    </Button>
                    <Button
                        onClick={handleNexusAnalyze}
                        className="!bg-purple-600 hover:!bg-purple-500 text-white font-bold flex items-center gap-2"
                        isLoading={isAnalyzing}
                    >
                        <Cpu className="w-4 h-4" /> Nexus AI: Analisar Oportunidades
                    </Button>
                    <Button onClick={() => { setFormData({ targetAudience: { roles: ['student'] }, status: 'draft', backgroundColor: 'bg-gradient-to-r from-purple-600 to-blue-600' }); setIsModalOpen(true); }} className="!bg-brand-primary text-black hover:!bg-yellow-400 font-bold">
                        <PlusCircle className="w-5 h-5 mr-2" /> Nova Campanha
                    </Button>
                </div>
            </div>

            {/* NEXUS AI SUGGESTIONS PANEL */}
            <AnimatePresence>
                {nexusSuggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-800 border border-purple-500/30 rounded-xl p-6 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-purple-400" /> Recomendações Estratégicas (Nexus)
                            </h3>
                            <button onClick={() => setNexusSuggestions([])} className="text-gray-400 hover:text-white"><XIcon className="w-5 h-5" /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                            {nexusSuggestions.map((sug, idx) => (
                                <div key={idx} className="bg-gray-900/50 border border-gray-700 p-4 rounded-xl hover:border-purple-500/50 transition-colors group cursor-pointer flex flex-col h-full" onClick={() => applySuggestion(sug)}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-2 bg-gray-800 rounded-lg">{sug.icon}</div>
                                        <span className="text-[10px] text-gray-500 uppercase font-bold bg-black/30 px-2 py-1 rounded">Oportunidade #{idx + 1}</span>
                                    </div>
                                    <h4 className="font-bold text-white text-sm mb-1">{sug.title}</h4>
                                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">{sug.description}</p>

                                    {/* Reason Box Updated for Detailed Analysis */}
                                    <div className="bg-blue-900/10 border border-blue-500/20 p-3 rounded text-[10px] text-blue-200 mb-3 flex-1 whitespace-pre-wrap font-mono leading-relaxed">
                                        <strong className="block mb-1 text-blue-400 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Análise Financeira:</strong>
                                        {sug.reason}
                                    </div>

                                    <Button className="w-full !py-1.5 !text-xs group-hover:bg-purple-600 group-hover:text-white transition-colors mt-auto">Aprovar e Criar</Button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* NEXUS DATA COLLECTOR MODULE */}
            <NexusDataCollector />

            {loading ? <LoadingSpinner /> : (
                <div className="grid gap-4">
                    {campaigns.map(camp => (
                        <Card key={camp.id} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-brand-primary/50 transition-colors">
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${camp.backgroundColor}`}>
                                    <Megaphone className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{camp.title}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-1">{camp.description}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${camp.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                            ● {camp.status}
                                        </span>
                                        <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700 flex items-center gap-1">
                                            <Users className="w-3 h-3" /> {camp.targetAudience.roles.length} perfis
                                        </span>
                                        <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Até {new Date(camp.endDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" className="!p-2" onClick={() => { setFormData(camp); setIsModalOpen(true); }}><Eye className="w-4 h-4" /></Button>
                                <Button variant="secondary" className="!p-2 text-red-400 hover:text-red-300" onClick={() => handleDelete(camp.id)}><Trash className="w-4 h-4" /></Button>
                            </div>
                        </Card>
                    ))}
                    {campaigns.length === 0 && <p className="text-center text-gray-500 py-10">Nenhuma campanha criada.</p>}
                </div>
            )}

            {/* Modal de Detalhes da Sugestão (Analysis View) */}
            <AnimatePresence>
                {viewingSuggestion && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[120] p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-gray-800 w-full max-w-lg rounded-2xl border border-gray-700 shadow-2xl p-6 relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Cpu className="w-5 h-5 text-purple-400" /> Detalhes da Análise Nexus
                                </h3>
                                <button onClick={() => setViewingSuggestion(null)}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Título Sugerido</p>
                                    <p className="text-white font-bold text-lg">{viewingSuggestion.title}</p>
                                </div>
                                <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30">
                                    <p className="text-xs text-blue-300 uppercase font-bold mb-2 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" /> Racional Financeiro Completo:
                                    </p>
                                    <div className="text-sm text-blue-100 font-mono whitespace-pre-wrap leading-relaxed">
                                        {viewingSuggestion.reason}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button variant="secondary" onClick={() => setViewingSuggestion(null)}>Fechar</Button>
                                <Button
                                    onClick={() => {
                                        applySuggestion(viewingSuggestion);
                                        setViewingSuggestion(null);
                                    }}
                                    className="!bg-purple-600 hover:!bg-purple-500 text-white font-bold"
                                >
                                    Usar Modelo
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Criação/Edição */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-gray-800 w-full max-w-4xl rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900 rounded-t-2xl">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Megaphone className="w-5 h-5 text-brand-primary" /> Editor de Campanha
                                </h3>
                                <button onClick={() => setIsModalOpen(false)}><XIcon className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col lg:flex-row gap-8">
                                {/* Form */}
                                <div className="flex-1 space-y-6">
                                    <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/30">
                                        <label className="text-xs font-bold text-purple-400 uppercase mb-2 flex items-center gap-2">
                                            <Brain className="w-4 h-4" /> Mestre IA: Gerador Automático
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 bg-gray-900 border border-purple-500/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                placeholder="Descreva o objetivo (ex: Promoção de Natal 30% OFF para alunos)"
                                                value={aiObjective}
                                                onChange={e => setAiObjective(e.target.value)}
                                            />
                                            <Button onClick={handleGenerateWithAI} isLoading={isGenerating} className="!bg-purple-600 hover:!bg-purple-500 text-white !text-xs whitespace-nowrap">
                                                Gerar Agora
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Input label="Título da Campanha" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Black Friday Mestre 15X" />
                                        <div>
                                            <label className="text-sm font-bold text-gray-300 block mb-2">Descrição</label>
                                            <textarea className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white h-24 resize-none focus:border-brand-primary outline-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Texto do Botão (CTA)" value={formData.ctaText} onChange={e => setFormData({ ...formData, ctaText: e.target.value })} />
                                            <Input label="Link de Destino" value={formData.ctaLink} onChange={e => setFormData({ ...formData, ctaLink: e.target.value })} placeholder="https://..." />
                                        </div>

                                        <div>
                                            <label className="text-sm font-bold text-gray-300 block mb-2 flex items-center gap-2"><Palette className="w-4 h-4" /> Estilo do Card</label>
                                            <select
                                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white outline-none"
                                                value={formData.backgroundColor}
                                                onChange={e => setFormData({ ...formData, backgroundColor: e.target.value })}
                                            >
                                                <option value="bg-gradient-to-r from-purple-600 to-blue-600">Roxo & Azul (Padrão)</option>
                                                <option value="bg-gradient-to-r from-red-600 to-orange-500">Vermelho & Laranja (Urgência)</option>
                                                <option value="bg-gradient-to-r from-green-600 to-emerald-500">Verde (Sucesso/Dinheiro)</option>
                                                <option value="bg-gradient-to-r from-gray-800 to-gray-900">Dark (Discreto)</option>
                                                <option value="bg-gradient-to-r from-yellow-500 to-orange-400">Dourado (Premium)</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Início" type="datetime-local" value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ''} onChange={e => setFormData({ ...formData, startDate: new Date(e.target.value).toISOString() })} />
                                            <Input label="Fim" type="datetime-local" value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''} onChange={e => setFormData({ ...formData, endDate: new Date(e.target.value).toISOString() })} />
                                        </div>
                                    </div>
                                </div>

                                {/* Segmentation & Preview */}
                                <div className="flex-1 space-y-6 border-l border-gray-700 pl-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Filter className="w-4 h-4 text-blue-400" /> Segmentação</h4>
                                        <div className="space-y-2">
                                            {['student', 'influencer', 'sales_agent', 'support_agent'].map(role => (
                                                <label key={role} className="flex items-center gap-2 bg-gray-900 p-2 rounded cursor-pointer border border-gray-700 hover:border-gray-500">
                                                    <input type="checkbox" checked={formData.targetAudience?.roles?.includes(role as any)} onChange={() => toggleRole(role)} className="rounded bg-gray-800 border-gray-600 text-brand-primary" />
                                                    <span className="text-sm text-gray-300 capitalize">{role.replace('_', ' ')}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-3">Preview ao Vivo</h4>
                                        <div className={`rounded-2xl p-6 shadow-xl relative overflow-hidden ${formData.backgroundColor}`}>
                                            <div className="relative z-10">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                                                        <Megaphone className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-black text-white leading-tight mb-1">{formData.title || 'Título da Campanha'}</h2>
                                                        <p className="text-white/90 text-xs font-medium leading-relaxed mb-3">
                                                            {formData.description || 'Descrição da campanha aparecerá aqui...'}
                                                        </p>
                                                        <button className="px-4 py-2 bg-white text-black font-black uppercase text-xs rounded-lg shadow hover:scale-105 transition-transform flex items-center gap-2">
                                                            {formData.ctaText}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-700">
                                        <label className="flex items-center gap-2 cursor-pointer mb-4">
                                            <input type="checkbox" checked={formData.status === 'active'} onChange={e => setFormData({ ...formData, status: e.target.checked ? 'active' : 'draft' })} className="rounded bg-gray-800 border-gray-600 text-green-500" />
                                            <span className={`text-sm font-bold ${formData.status === 'active' ? 'text-green-400' : 'text-gray-500'}`}>
                                                {formData.status === 'active' ? 'Publicar Imediatamente' : 'Salvar como Rascunho'}
                                            </span>
                                        </label>
                                        <Button onClick={handleSave} className="w-full !bg-brand-primary text-black hover:!bg-yellow-400 font-bold !py-3">
                                            <Save className="w-5 h-5 mr-2" /> SALVAR CAMPANHA
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* GOD MODE PREVIEW MODAL */}
            <AnimatePresence>
                {isGodModeOpen && <GodModePreviewModal isOpen={isGodModeOpen} onClose={() => setIsGodModeOpen(false)} />}
            </AnimatePresence>

        </div>
    );
};

export default InternalCampaignsPage;
