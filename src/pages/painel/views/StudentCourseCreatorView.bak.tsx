
import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import {
    PlusCircle, BookOpen, Brain, Settings, X as XIcon, Sparkles,
    Zap, DollarSign, TrendingUp, Target, Pencil,
    Activity, ShieldCheck, HeartPulse, Camera, RefreshCw, LockClosed,
    CheckCircle, Info, ChevronRight, ArrowLeft, CloudUpload, Trash, Layers,
    Smartphone, FileText, BarChart3, AlertTriangle, Coins, ShoppingBag, Phone, Mic, ShieldAlert,
    Layout, List, Gauge, Film, Clock, Rocket, Link as LinkIcon, Image, Youtube, Palette, Monitor, Megaphone,
    Server, Calculator, Star, Crown, Globe, Search, Eye
} from '../../../components/Icons';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { Course, CourseCategory, FinancialViability, SchoolSettings, StudentPage } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';
import { consumeCredits, getToolCosts, uploadFileToStorage, getCourses, saveCourse, deleteCourse, addPublishedCourseToUser } from '../../../services/mockFirebase';
import { callMestreIA, generateCourseCoverImage } from '../../../services/mestreIaService';
import { AnimatePresence, motion } from 'framer-motion';
import { useCreditGuard } from '../../../hooks/useCreditGuard';
import { SchoolSetupModal } from '../../../components/SchoolSetupModal';
import { CreditControlCard, ToolSelectionGrid, CostSummaryCard } from '../../../components/SchoolToolsSelector';
import { PremiumToolId, FinancialModel } from '../../../types/legacy';

const MotionDiv = motion.div as any;



const Hint: React.FC<{ title: string, text: string }> = ({ title, text }) => (
    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex gap-3 items-start animate-fade-in">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
            <p className="text-sm font-bold text-blue-100 mb-1">{title}</p>
            <p className="text-xs text-blue-300 leading-relaxed">{text}</p>
        </div>
    </div>
);

const CATEGORY_CONTEXT: Record<string, {
    titlePlaceholder: string;
    promisePlaceholder: string;
    aiNamingContext: string;
    contentHint: string;
    icon: any;
}> = {
    standard: {
        titlePlaceholder: "Ex: Método Mestre 50X",
        promisePlaceholder: "Ex: Vou tirar você do zero e te transformar em um empresário que fatura R$ 10k/mês através de tráfego pago...",
        aiNamingContext: "marketing digital e negócios",
        contentHint: "Suba vídeos, PDFs ou links de aulas sobre negócios e vendas para que a IA estruture seu treinamento.",
        icon: BookOpen
    },
    personal_master: {
        titlePlaceholder: "Ex: Mentor IA: Estratégia de Carreira",
        promisePlaceholder: "Ex: Tenha acesso à minha metodologia de gestão 24h por dia para resolver qualquer crise na sua empresa em minutos...",
        aiNamingContext: "mentoria personalizada e clonagem de conhecimento",
        contentHint: "Suba áudios de consultorias, palestras ou PDFs com seu método de ensino exclusivo para clonar seu cérebro.",
        icon: Brain
    },
    therapy_master: {
        titlePlaceholder: "Ex: Jornada da Reconstrução Emocional",
        promisePlaceholder: "Ex: Um protocolo científico seguro para superar crises de ansiedade e recuperar o controle da sua vida em 21 dias...",
        aiNamingContext: "terapia, psicologia e bem-estar emocional",
        contentHint: "Suba materiais teóricos sobre a base clínica e exercícios de regulação emocional para configurar o protocolo clínico.",
        icon: HeartPulse
    },
    slimming_master: {
        titlePlaceholder: "Ex: Protocolo Bio-Burn 30D",
        promisePlaceholder: "Ex: Reprograme seu metabolismo para queimar gordura visceral de forma natural sem dietas restritivas...",
        aiNamingContext: "emagrecimento, bio-hacking e nutrição",
        contentHint: "Suba planos alimentares, tabelas nutricionais ou vídeos de treinos para que a IA gere planos adaptativos.",
        icon: Activity
    }
};

const CATEGORIES_LIST = [
    {
        id: 'standard',
        label: 'Curso Tradicional',
        icon: BookOpen,
        color: 'blue',
        desc: 'Transforme conhecimento em escala passiva. O modelo linear clássico de videoaulas e módulos com entrega estruturada.',
        longDesc: 'O Modelo Tradicional foca na entrega de conteúdo gravado. Ideal para cursos com trilha de aprendizado definida e materiais de apoio.\n\nEstratégia Nexus:\n• Ganho Financeiro: Baixíssimo custo de manutenção após gravado.\n• Status: Autoridade construída através da didática e certificação.'
    },
    {
        id: 'personal_master',
        label: 'Mestre Pessoal (Mentor IA)',
        icon: Brain,
        color: 'purple',
        desc: 'Clone seu cérebro. Ofereça um mentor IA 24h treinado com seu método, tom de voz e expertise técnica inigualável.',
        longDesc: 'O Mestre Pessoal é a ferramenta definitiva de escala humana. Você treina a IA com seus próprios materiais (PDFs, áudios, textos) e ela atende milhares de alunos individualmente como se fosse você.\n\nEstratégia Nexus:\n• Valor Percebido: Mentorias de ticket alto (R$ 997+).\n• Diferencial: Suporte 24h que nenhum concorrente humano consegue oferecer.'
    },
    {
        id: 'therapy_master',
        label: 'Mestre da Terapia',
        icon: HeartPulse,
        color: 'pink',
        desc: 'Protocolos de saúde mental e bem-estar. IA focada em acolhimento clínico e regulação emocional baseada em evidências.',
        longDesc: 'Focado exclusivamente no nicho de saúde mental. Este modelo ativa o Protocolo Clínico Nexus, com triagem automática de risco e exercícios de TCC/ACT.\n\nEstratégia Nexus:\n• Vitalidade: Foco total na erradicação da dor emocional do aluno.\n• Retenção: Modelo de assinatura com acompanhamento diário do humor.'
    },
    {
        id: 'slimming_master',
        label: 'Mestre do Emagrecimento',
        icon: Activity,
        color: 'green',
        desc: 'Especialista em saúde e performance. Bio-scaneamento e dietas adaptativas automatizadas pela inteligência do mestre.',
        longDesc: 'A máquina de transformação física. A IA analisa dados biométricos do aluno e ajusta planos alimentares e de treino de forma dinâmica.\n\nEstratégia Nexus:\n• Prova Social: Resultados físicos visíveis geram viralização.\n• Recorrência: Acompanhamento de metas de curto e médio prazo.'
    }
];

const NICHOS_BY_CATEGORY: Record<string, string[]> = {
    all: [
        "Marketing Digital & Vendas", "Finanças & Investimentos", "Saúde & Emagrecimento",
        "Relacionamentos", "Desenvolvimento Pessoal", "Tecnologia & Programação",
        "Negócios & Carreira", "Outros"
    ],
    standard: [
        "Marketing Digital & Vendas", "Finanças & Investimentos", "Infoprodutos",
        "Artesanato & Hobbies", "Educação Infantil", "Concursos & Provas"
    ],
    personal_master: [
        "Negócios & Gestão de Equipes", "Empreendedorismo Digital", "Liderança & Soft Skills",
        "Vendas de Alto Ticket", "Estratégia de Marketing & Branding", "Finanças Corporativas",
        "Investimentos (Ações/Cripto)", "Direito & Consultoria Jurídica", "Contabilidade Estratégica",
        "Engenharia & Arquitetura", "Tecnologia & Dev Mentor", "Ciência de Dados & BI",
        "Idiomas (Fluência Acelerada)", "Oratória & Comunicação", "Carreira & Recolocação",
        "Produtividade & Gestão de Tempo", "Maternidade & Educação de Filhos", "Esportes & Alta Performance",
        "Moda & Imagem Pessoal", "Estratégia Imobiliária", "Marketing de Influência"
    ],
    therapy_master: [
        "Saúde Mental (Geral)", "Psicologia TCC", "Terapia Holística", "Acolhimento Luto/Crises",
        "Ansiedade & Stress", "Autoconhecimento Profundo", "Meditação & Mindfulness",
        "Constelação Familiar", "Terapia de Casal"
    ],
    slimming_master: [
        "Emagrecimento Feminino", "Hipertrofia & Ganho de Massa", "Bio-hacking & Longevidade",
        "Nutrição Esportiva", "Yoga & Flexibilidade", "Crossfit & Performance",
        "Reeducação Alimentar", "Jejum Intermitente Profissional"
    ]
};

const getStudentCourses = (studentId: string): Course[] => {
    const saved = localStorage.getItem(`student_courses_${studentId}`);
    return saved ? JSON.parse(saved) : [];
};

const saveStudentCourses = (studentId: string, courses: Course[]) => {
    localStorage.setItem(`student_courses_${studentId}`, JSON.stringify(courses));
};

interface FileQueueItem {
    id: string;
    file: any;
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: number;
    type: 'audio' | 'video' | 'pdf' | 'doc' | 'image';
    error?: string;
}

const Hint: React.FC<{ title: string, text: string, type?: 'info' | 'warning' }> = ({ title, text, type = 'info' }) => (
    <div className={`${type === 'info' ? 'bg-blue-900/10 border-blue-500/20' : 'bg-red-900/10 border-red-500/20'} border p-4 rounded-2xl flex gap-3 items-start mb-4`}>
        {type === 'info' ? <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" /> : <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
        <div>
            <p className={`text-xs font-black uppercase tracking-widest mb-1 ${type === 'info' ? 'text-blue-400' : 'text-red-400'}`}>{title}</p>
            <p className="text-xs text-gray-400 leading-relaxed">{text}</p>
        </div>
    </div>
);

// --- MODULAR STEPS ---

/**
 * Step 1: Selection of course category/model
 */
const Step1Category: React.FC<{
    setSelectedCategoryPreview: (cat: any) => void
}> = ({ setSelectedCategoryPreview }) => (
    <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORIES_LIST.map(cat => (
                <div
                    key={cat.id}
                    onClick={() => setSelectedCategoryPreview(cat)}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-4 items-start bg-gray-900 border-gray-700 hover:border-brand-primary`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl bg-gray-800 border border-gray-700 text-${cat.color}-400 shadow-inner`}><cat.icon className="w-7 h-7" /></div>
                        <p className="text-sm font-black text-white uppercase tracking-tighter">{cat.label}</p>
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{cat.desc}</p>
                </div>
            ))}
        </div>
    </div>
);

/**
 * Step 2: Basic info and identity
 */
const Step2BasicDetails: React.FC<{
    data: any;
    setData: (d: any) => void;
    availableNichos: string[];
    context: any;
    triggerAITask: (id: string, cb: any) => void;
    handleGenerateName: () => void;
    handleGenerateCover: () => void;
    nameSuggestions: any[];
    selectName: (n: string) => void;
    onBack: () => void;
    onNext: () => void;
    toggleTherapyComponent: (id: string) => void;
    onOpenSchoolSetup: () => void;
}> = ({ data, setData, availableNichos, context, triggerAITask, handleGenerateName, handleGenerateCover, nameSuggestions, selectName, onBack, onNext, toggleTherapyComponent, onOpenSchoolSetup }) => (
    <div className="space-y-8 animate-fade-in">
        <Hint title="Mapeamento de Nicho" text="A seleção correta do nicho permite que o Nexus IA aplique os gatilhos mentais específicos para essa audiência. Escolha com atenção." />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-black text-white uppercase tracking-widest block ml-1">Nicho do Treinamento*</label>
                    <select
                        className="w-full bg-gray-900 border border-gray-600 rounded-2xl p-4 text-white text-lg font-bold focus:border-brand-primary outline-none transition-colors"
                        value={data.niche}
                        onChange={e => setData({ ...data, niche: e.target.value })}
                    >
                        <option value="">Selecione o nicho...</option>
                        {availableNichos.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <p className="text-xs text-gray-500 ml-1">Isso define o "tom de voz" da IA na geração de conteúdo.</p>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-black text-white uppercase tracking-widest block ml-1">Transformação Central (O Novo Eu)*</label>
                    <textarea
                        className="w-full bg-gray-900 border border-gray-600 rounded-2xl p-4 text-white text-sm h-24 outline-none focus:border-brand-primary resize-none"
                        value={data.transformation}
                        onChange={e => setData({ ...data, transformation: e.target.value })}
                        placeholder='Ex: "A pessoa sairá do zero até faturar seus primeiros R$ 10k em 30 dias..."'
                    />
                </div>

                <div className="space-y-4">
                    <Input
                        label="Nome Principal do Curso*"
                        value={data.title}
                        onChange={e => setData({ ...data, title: e.target.value })}
                        placeholder={context.titlePlaceholder}
                    />
                    <Button
                        onClick={() => triggerAITask('course_naming_refiner', handleGenerateName)}
                        className="w-full !py-3 !text-[10px] font-black uppercase tracking-widest !bg-purple-600 shadow-xl"
                    >
                        <Sparkles className="w-4 h-4 mr-2" /> Sugerir Nomes Magnéticos c/ IA
                    </Button>
                    <AnimatePresence>
                        {nameSuggestions.length > 0 && (
                            <div className="grid gap-2 mt-4 bg-gray-900/50 p-4 rounded-2xl border border-purple-500/20">
                                {nameSuggestions.map((n, i) => (
                                    <button key={i} onClick={() => selectName(n.name)} className="text-left p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs border border-gray-700 transition-colors group">
                                        <div className="flex justify-between items-center"><span className="font-bold text-white group-hover:text-brand-primary">{n.name}</span><ChevronRight className="w-3 h-3 text-gray-600" /></div>
                                        <p className="text-[9px] text-gray-500 mt-1">{n.reason}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="space-y-6">
                <label className="text-xs font-black text-white uppercase tracking-widest block ml-1">Identidade Visual (Capa)</label>
                <div className="bg-gray-900/50 p-6 rounded-2xl border-2 border-dashed border-gray-700 flex flex-col items-center justify-center text-center relative h-52 group overflow-hidden">
                    {data.coverUrl ? (
                        <div className="w-full h-full relative">
                            <img src={data.coverUrl} className="w-full h-full object-cover rounded-2xl" alt="Preview" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><RefreshCw className="w-8 h-8 text-white animate-spin-slow" /></div>
                        </div>
                    ) : (
                        <>
                            <Camera className="w-10 h-10 text-gray-600 mb-2 group-hover:text-brand-primary transition-colors" />
                            <p className="text-[10px] text-gray-500 uppercase font-black">Upload ou Gerar c/ IA</p>
                        </>
                    )}
                    <input type="file" className="hidden" id="admin-cover-up" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onloadend = () => setData({ ...data, coverUrl: r.result as string }); r.readAsDataURL(f); } }} />
                    <label htmlFor="admin-cover-up" className="absolute inset-0 cursor-pointer"></label>
                </div>
            </div>
        </div>

        {data.category === 'therapy_master' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-pink-900/10 border border-pink-500/30 p-6 rounded-2xl space-y-6 mt-4">
                <div className="flex items-center gap-3 border-b border-pink-500/20 pb-4">
                    <HeartPulse className="w-6 h-6 text-pink-400" />
                    <h4 className="text-lg font-black text-white uppercase tracking-tight">Protocolo Clínico Nexus</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-pink-300 uppercase tracking-widest">Base Teórica Principal</label>
                        <select
                            className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white text-sm outline-none focus:border-pink-500"
                            value={data.therapyConfig?.baseTeorica || 'TCC'}
                            onChange={e => setData({ ...data, therapyConfig: { ...data.therapyConfig, baseTeorica: e.target.value } })}
                        >
                            <option value="TCC">Terapia Cognitivo-Comportamental (TCC)</option>
                            <option value="ACT">Terapia de Aceitação e Compromisso (ACT)</option>
                            <option value="Mindfulness">Mindfulness & Compaixão</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-pink-300 uppercase tracking-widest">Elementos do Protocolo</label>
                        <div className="flex flex-wrap gap-2">
                            {['Psicoeducação', 'Diário de Emoções', 'Meditação Guiada'].map(elem => (
                                <button
                                    key={elem}
                                    type="button"
                                    onClick={() => toggleTherapyComponent(elem)}
                                    className={`text-[10px] px-3 py-1.5 rounded-lg border transition-all ${data.therapyConfig?.elementos?.includes(elem) ? 'bg-pink-600 text-white border-pink-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                                >
                                    {elem}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        )}

        <div className="flex justify-between pt-8 border-t border-gray-700">
            <Button variant="secondary" onClick={onBack} className="!bg-gray-900 border-gray-700 text-gray-500"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
            <Button onClick={onNext} disabled={!data.title || !data.niche || !data.transformation} className="!px-12 !py-4 shadow-xl">PRÓXIMA ETAPA</Button>
        </div>
    </div>
);

/**
 * Step 3: Refine core promise
 */
const Step3Promise: React.FC<{
    data: any;
    setData: (d: any) => void;
    context: any;
    triggerAITask: (id: string, cb: any) => void;
    handleGeneratePromise: () => void;
    onBack: () => void;
    onNext: () => void;
}> = ({ data, setData, context, triggerAITask, handleGeneratePromise, onBack, onNext }) => (
    <div className="space-y-8 animate-fade-in">
        <div className="space-y-4">
            <label className="text-sm font-black text-white uppercase tracking-widest ml-1">Promessa Central</label>
            <textarea
                className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-8 text-white text-lg h-52 outline-none focus:border-brand-primary"
                value={data.description}
                onChange={e => setData({ ...data, description: e.target.value })}
                placeholder={context.promisePlaceholder}
            />
            <Button onClick={() => triggerAITask('promise_architect', handleGeneratePromise)} className="!bg-purple-600 hover:!bg-purple-500 font-black uppercase text-[10px] tracking-widest !py-3 px-6 shadow-xl">
                <Zap className="w-4 h-4 mr-2" /> Otimizar Promessa com Nexus IA
            </Button>
        </div>
        <div className="flex justify-between pt-8 border-t border-gray-700">
            <Button variant="secondary" onClick={onBack} className="!bg-gray-900 border-gray-700 text-gray-500"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
            <Button onClick={onNext} disabled={!data.description} className="!px-12 !py-4 shadow-xl">PRÓXIMA ETAPA: CONTEÚDO</Button>
        </div>
    </div>
);

/**
 * Step 4: Curriculum and materials (Enhanced with Dynamic Costing & Value Perception)
 */
const Step4Content: React.FC<{
    data: any;
    setData: (d: any) => void;
    context: any;
    fileQueue: FileQueueItem[];
    setFileQueue: (q: any) => void;
    addedLinks: string[];
    setAddedLinks: (l: string[]) => void;
    resourceLink: string;
    setResourceLink: (s: string) => void;
    handleAddLink: () => void;
    handleFileSelection: (e: any) => void;
    triggerAITask: (id: string, cb: any, cost?: number) => void;
    handleGenerateSummary: () => void;
    isProcessingFiles: boolean;
    onBack: () => void;
    onNext: () => void;
    userCredits: number;
    onRecharge: () => void;
}> = ({ data, setData, context, fileQueue, setFileQueue, addedLinks, setAddedLinks, resourceLink, setResourceLink, handleAddLink, handleFileSelection, triggerAITask, handleGenerateSummary, isProcessingFiles, onBack, onNext, userCredits, onRecharge }) => {

    // Dynamic Cost Calculation (API Cost + 30% Margin)
    const calculateStructureCost = () => {
        // Base costs (simulated tokens/processing power)
        let totalCost = 0;

        // Video/Audio: Expensive (Transcribing)
        const mediaFiles = fileQueue.filter(f => f.type === 'video' || f.type === 'audio').length;
        totalCost += mediaFiles * 15;

        // PDF/Docs: Moderate (Reading large text)
        const docFiles = fileQueue.filter(f => f.type === 'pdf' || f.type === 'doc').length;
        totalCost += docFiles * 5;

        // Links: Cheap (Scraping)
        totalCost += addedLinks.length * 2;

        // Base Fee for Intelligence Architecture
        totalCost += 10;

        // Apply Admin Margin (30% configurable example)
        return Math.ceil(totalCost * 1.3);
    };

    const estimatedCost = calculateStructureCost();
    const hasInsufficientCredits = userCredits < estimatedCost;
    const isStep4Valid = !!data.knowledgeIdeas && data.knowledgeIdeas.length > 50;

    // --- GAP ANALYSIS (CONSULTANT) LOGIC ---
    const [gapReport, setGapReport] = useState<{ missingModules: string[], weakPoints: string[], score: number } | null>(null);
    const [isAnalyzingGaps, setIsAnalyzingGaps] = useState(false);

    useEffect(() => {
        // Auto-run gap analysis when structure is generated
        if (data.knowledgeIdeas && !gapReport && !isAnalyzingGaps) {
            runGapAnalysis();
        }
    }, [data.knowledgeIdeas]);

    const runGapAnalysis = () => {
        setIsAnalyzingGaps(true);
        // Simulate AI "Thinking"
        setTimeout(() => {
            const isBusiness = data.niche.toLowerCase().includes('negócios') || data.niche.toLowerCase().includes('marketing') || data.niche.toLowerCase().includes('vendas');

            const report = {
                score: isBusiness ? 75 : 85,
                missingModules: isBusiness
                    ? ['Módulo de Garantia Incondicional', 'Aulas de Gestão de Crise', 'Scripts de Venda']
                    : ['Módulo de Boas-vindas', 'Comunidade de Alunos'],
                weakPoints: ['Poucos exercícios práticos identificados', 'Falta de material complementar (PDFs)']
            };
            setGapReport(report);
            setIsAnalyzingGaps(false);
            toast.success("O Nexus identificou pontos de melhoria no seu curso.", { icon: '💡' });
        }, 3000);
    };

    const handleFixGap = async (gapItem: string) => {
        const cost = 15;
        const proceed = await triggerAITask('content_generator', async () => {
            // Mock generation of missing content
            const newContent = `\n\n[NOVO MÓDULO GERADO PELO NEXUS: ${gapItem}]\n\n- Aula 1: Introdução ao ${gapItem}\n- Aula 2: Aplicação Prática\n- Material de Apoio: Checklist Completo.`;
            setData({ ...data, knowledgeIdeas: data.knowledgeIdeas + newContent });
            setGapReport(prev => prev ? { ...prev, missingModules: prev.missingModules.filter(m => m !== gapItem) } : null);
            toast.success(`Módulo "${gapItem}" criado e adicionado!`);
        }, cost);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-6">
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="text-white font-bold flex items-center gap-2 uppercase text-xs tracking-widest"><CloudUpload className="w-4 h-4 text-brand-primary" /> Fila de Extração de Inteligência</h4>
                            <span className="text-[10px] text-gray-500">{fileQueue.length} itens na fila</span>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {fileQueue.length === 0 && addedLinks.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-xl">
                                    <p className="text-gray-600 text-xs">Nenhum material adicionado.</p>
                                </div>
                            )}

                            {fileQueue.map(item => (
                                <div key={item.id} className="bg-black/40 p-3 rounded-xl border border-gray-700 relative overflow-hidden group">
                                    {/* Progress Bar Background */}
                                    {item.status === 'processing' && (
                                        <div
                                            className="absolute top-0 left-0 h-full bg-blue-600/10 transition-all duration-300"
                                            style={{ width: `${item.progress}%` }}
                                        ></div>
                                    )}

                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="flex items-center gap-3">
                                            {item.type === 'video' ? <Film className="w-4 h-4 text-blue-400" /> :
                                                item.type === 'audio' ? <Mic className="w-4 h-4 text-purple-400" /> :
                                                    <FileText className="w-4 h-4 text-white" />}

                                            <div className="flex flex-col">
                                                <span className="text-xs text-white font-bold truncate w-40">{item.file.name}</span>
                                                <span className="text-[9px] text-gray-400 uppercase font-black">
                                                    {item.status === 'pending' && 'Aguardando...'}
                                                    {item.status === 'processing' && `Lendo Inteligência... ${item.progress}%`}
                                                    {item.status === 'completed' && <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Processado</span>}
                                                    {item.status === 'error' && <span className="text-red-400">Erro na Leitura</span>}
                                                </span>
                                            </div>
                                        </div>
                                        {item.status !== 'processing' && (
                                            <button onClick={() => setFileQueue((prev: any[]) => prev.filter(f => f.id !== item.id))} className="text-gray-600 hover:text-red-500 transition-colors"><Trash className="w-4 h-4" /></button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {addedLinks.map((link, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <LinkIcon className="w-4 h-4 text-green-400" />
                                        <span className="text-xs text-white font-bold truncate w-40">{link}</span>
                                    </div>
                                    <button onClick={() => setAddedLinks(prev => prev.filter(l => l !== link))} className="text-gray-600 hover:text-red-500"><Trash className="w-4 h-4" /></button>
                                </div>
                            ))}

                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-700 rounded-2xl cursor-pointer hover:bg-blue-500/5 hover:border-blue-500/30 transition-all group relative overflow-hidden mt-4">
                                <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.txt,.mp3,.mp4,.mov,.wav" onChange={handleFileSelection} />
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <PlusCircle className="w-8 h-8 text-gray-600 mb-2 group-hover:text-brand-primary transition-colors relative z-10" />
                                <span className="text-[10px] text-gray-500 font-black uppercase group-hover:text-white transition-colors relative z-10">Adicionar Materiais (Vídeo, Áudio, PDF)</span>
                            </label>

                            {/* Link Input */}
                            <div className="flex gap-2 p-1 bg-gray-950/50 border border-gray-700 rounded-xl">
                                <div className="flex-1 px-3 flex items-center">
                                    <LinkIcon className="w-4 h-4 text-purple-400 mr-2" />
                                    <input
                                        type="text"
                                        className="bg-transparent w-full text-xs text-white h-10 outline-none placeholder-gray-600"
                                        placeholder="Cole um link externo (YouTube, Drive...)"
                                        value={resourceLink}
                                        onChange={e => setResourceLink(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleAddLink(); }}
                                    />
                                </div>
                                <Button onClick={handleAddLink} className="!py-2 !px-4 !bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:!bg-purple-600 hover:text-white"><PlusCircle className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </div>

                    {/* GAP ANALYSIS REPORT CARD */}
                    <AnimatePresence>
                        {gapReport && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-purple-900/10 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5"><Brain className="w-32 h-32 text-purple-400" /></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-purple-500/20 p-2 rounded-lg"><Sparkles className="w-5 h-5 text-purple-400" /></div>
                                        <div>
                                            <h4 className="text-white font-bold uppercase text-xs tracking-widest">Consultoria Nexus</h4>
                                            <p className="text-[10px] text-purple-300">Análise de Pontos Cegos & Oportunidades</p>
                                        </div>
                                        <div className="ml-auto bg-gray-900 rounded-lg px-3 py-1 border border-gray-700">
                                            <span className="text-xs font-black text-white">Score: {gapReport.score}/100</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                                        Analisei seu conteúdo comparado aos <strong className="text-white">Top 1% do nicho de {data.niche}</strong>. Encontrei oportunidades de upsell e melhoria:
                                    </p>

                                    <div className="space-y-2 mb-4">
                                        {gapReport.missingModules.map((missing, i) => (
                                            <div key={i} className="flex items-center justify-between bg-gray-900/50 p-2 rounded-lg border border-purple-500/10">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="w-3 h-3 text-yellow-500" />
                                                    <span className="text-[10px] text-gray-300 font-medium">Falta: <span className="text-white">{missing}</span></span>
                                                </div>
                                                <button
                                                    onClick={() => handleFixGap(missing)}
                                                    className="text-[9px] bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded uppercase font-bold transition-colors flex items-center gap-1"
                                                >
                                                    <Brain className="w-2 h-2" /> Gerar (+15)
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {gapReport.weakPoints.length > 0 && (
                                        <div className="bg-red-900/20 p-3 rounded-xl border border-red-500/20">
                                            <h5 className="text-[10px] text-red-400 font-black uppercase mb-2 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Pontos de Atenção</h5>
                                            <ul className="list-disc list-inside text-[10px] text-gray-400 space-y-1">
                                                {gapReport.weakPoints.map((wp, i) => <li key={i}>{wp}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 ml-1"><Pencil className="w-4 h-4 text-brand-primary" /> Estrutura do Curso (IA)</label>
                    <div className="bg-gray-950 border border-gray-700 rounded-2xl p-6 text-white text-sm h-[380px] overflow-y-auto custom-scrollbar">
                        {data.knowledgeIdeas ? (
                            <div className="whitespace-pre-wrap">{data.knowledgeIdeas}</div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-gray-600">
                                <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-gray-800">
                                    <Layers className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="text-sm font-bold mb-2">Aguardando Materiais...</p>
                                <p className="text-xs max-w-xs leading-relaxed">Após subir seus arquivos, clique no botão abaixo e a IA criará toda a estrutura de módulos para você aprovar.</p>
                            </div>
                        )}
                    </div>
                    <Button onClick={handleGenerateSummary} isLoading={isProcessingFiles} disabled={fileQueue.length === 0 && addedLinks.length === 0} className="w-full !bg-purple-600 font-black uppercase text-[10px] tracking-widest shadow-xl !py-4 hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:hover:scale-100">
                        <Sparkles className="w-4 h-4 mr-2" /> Gerar Estrutura Pedagógica (IA)
                    </Button>
                    <p className="text-center text-[10px] text-gray-500">Requer pelo menos 1 arquivo ou link.</p>

                    {/* Physical Kit Section */}
                    <div className="mt-8 pt-6 border-t border-gray-700">
                        <label className="flex items-center gap-3 cursor-pointer group mb-4">
                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${data.physicalKit?.enabled ? 'bg-brand-primary' : 'bg-gray-700'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${data.physicalKit?.enabled ? 'translate-x-4' : ''}`} />
                            </div>
                            <span className="text-xs font-black uppercase text-white tracking-widest group-hover:text-brand-primary transition-colors">Este curso inclui envio de Materiais Físicos (Kits)?</span>
                            <input type="checkbox" className="hidden" checked={data.physicalKit?.enabled || false} onChange={e => setData({ ...data, physicalKit: { ...data.physicalKit, enabled: e.target.checked } })} />
                        </label>

                        <AnimatePresence>
                            {data.physicalKit?.enabled && (
                                <MotionDiv initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-gray-800 rounded-2xl p-4 border border-gray-700 overflow-hidden">
                                    <p className="text-[10px] text-gray-400 mb-4">
                                        Descreva os itens que o aluno recebe. A IA usará isso para criar aulas de "unboxing" e uso dos equipamentos (ex: leitor de cetose com OCR).
                                    </p>

                                    <div className="space-y-2 mb-4">
                                        {(data.physicalKit.items || []).map((item: any, idx: number) => (
                                            <div key={item.id} className="bg-gray-900/50 p-2 rounded-lg flex items-center justify-between border border-gray-700">
                                                <div>
                                                    <p className="text-xs font-bold text-white">{item.name}</p>
                                                    <p className="text-[10px] text-gray-500">{item.description}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-brand-primary font-mono">R$ {item.cost.toFixed(2)}</span>
                                                    {item.requiresOCR && <span className="text-[9px] bg-purple-900 text-purple-200 px-1 rounded border border-purple-500/30">OCR Ativo</span>}
                                                    <button onClick={() => setData({ ...data, physicalKit: { ...data.physicalKit, items: data.physicalKit.items.filter((_: any, i: number) => i !== idx) } })} className="text-red-500 hover:text-red-400"><Trash className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-gray-900 p-3 rounded-xl border border-gray-700/50 space-y-2">
                                        <Input
                                            label="Nome do Item (Ex: Fita Cetose)"
                                            placeholder="Nome do item..."
                                            id="newItemName"
                                        />
                                        <Input
                                            label="Descrição / Uso (Para a IA)"
                                            placeholder="Ex: Usar ao acordar para medir nível de cetose..."
                                            id="newItemDesc"
                                        />
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <Input
                                                    label="Custo Unitário (R$)"
                                                    type="number"
                                                    placeholder="0.00"
                                                    id="newItemCost"
                                                />
                                            </div>
                                            <div className="flex items-end pb-1">
                                                <label className="flex items-center gap-2 cursor-pointer bg-gray-800 px-3 py-2 rounded-lg border border-gray-600 hover:border-purple-500">
                                                    <input type="checkbox" id="newItemOCR" className="rounded bg-gray-700 border-gray-500 text-purple-500 focus:ring-0" />
                                                    <span className="text-[10px] text-white font-bold uppercase">Requer Leitura OCR?</span>
                                                </label>
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full !py-2 !text-[10px] uppercase font-bold mt-2"
                                            onClick={() => {
                                                const name = (document.getElementById('newItemName') as HTMLInputElement).value;
                                                const desc = (document.getElementById('newItemDesc') as HTMLInputElement).value;
                                                const cost = parseFloat((document.getElementById('newItemCost') as HTMLInputElement).value);
                                                const ocr = (document.getElementById('newItemOCR') as HTMLInputElement).checked;

                                                if (!name || isNaN(cost)) return toast.error("Preencha nome e custo.");

                                                const newItem: any = {
                                                    id: `kit-${Date.now()}`,
                                                    name, description: desc, cost, requiresOCR: ocr
                                                };
                                                setData({ ...data, physicalKit: { ...data.physicalKit, items: [...(data.physicalKit.items || []), newItem] } });
                                                (document.getElementById('newItemName') as HTMLInputElement).value = '';
                                                (document.getElementById('newItemDesc') as HTMLInputElement).value = '';
                                                (document.getElementById('newItemCost') as HTMLInputElement).value = '';
                                            }}
                                        >
                                            <PlusCircle className="w-4 h-4 mr-2" /> Adicionar Item ao Kit
                                        </Button>
                                    </div>
                                </MotionDiv>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {!data.knowledgeIdeas && (
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Custo de Processamento</p>
                        <p className="text-sm font-black text-white flex items-center gap-1">
                            {estimatedCost} Créditos
                            <span className="text-[9px] font-normal text-gray-500 bg-gray-900 px-1.5 rounded border border-gray-700 ml-2">Margem Admin Incluída</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Seu Saldo</p>
                        <p className={`text-sm font-black ${hasInsufficientCredits ? 'text-red-400' : 'text-green-400'}`}>
                            {userCredits} Créditos
                        </p>
                    </div>
                </div>
            )}

            {hasInsufficientCredits && !data.knowledgeIdeas ? (
                <Button onClick={onRecharge} className="w-full !bg-red-600 hover:!bg-red-500 font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2">
                    Saldo Insuficiente - Recarregar Agora
                </Button>
            ) : (
                <Button
                    onClick={() => triggerAITask('method_architect', handleGenerateSummary, estimatedCost)}
                    disabled={data.knowledgeIdeas || (fileQueue.length === 0 && addedLinks.length === 0)}
                    className={`w-full font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 ${data.knowledgeIdeas ? 'bg-green-600 hover:bg-green-500 cursor-default' : '!bg-purple-600 hover:!bg-purple-500'}`}
                >
                    {data.knowledgeIdeas ? <><CheckCircle className="w-4 h-4" /> Estrutura Gerada</> : <><Brain className="w-4 h-4" /> Processar e Gerar Estrutura</>}
                </Button>
            )}

            <Hint title="Gatekeeper de Qualidade" text="Você só poderá avançar após a IA processar seus materiais e aprovar a estrutura pedagógica. Isso garante que seu curso tenha base sólida antes da venda." />

            <div className="flex justify-between pt-8 border-t border-gray-700">
                <Button variant="secondary" onClick={onBack} className="!bg-gray-900 border-gray-700 text-gray-500"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
                <div className="relative group">
                    <Button onClick={onNext} disabled={!isStep4Valid || isProcessingFiles} className="!px-12 !py-4 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                        Avançar: Financeiro
                    </Button>

                    {(!isStep4Valid) && (
                        <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-red-900/90 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-red-500/50 shadow-xl">
                            <p className="font-bold flex items-center gap-2 mb-1"><LockClosed className="w-3 h-3" /> Etapa Bloqueada</p>
                            Você precisa Gerar a Estrutura (Botão Roxo) acima antes de prosseguir. A IA precisa validar sua metodologia.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- NEW STEP 5: School Branding (Dedicated) ---
const Step5SchoolBranding: React.FC<{
    data: any;
    onOpenSchoolSetup: () => void;
    onBack: () => void;
    onNext: () => void;
}> = ({ data, onOpenSchoolSetup, onBack, onNext }) => (
    <div className="space-y-8 animate-fade-in">
        <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Personalize sua Escola</h3>
                    <p className="text-gray-400 text-sm">Defina a identidade visual e o domínio da sua plataforma.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* School Branding Card (Full Width) */}
                <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 flex flex-col items-center text-center justify-center space-y-6">
                    <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center border-2 border-dashed border-gray-600">
                        <Monitor className="w-10 h-10 text-purple-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-lg mb-2">Identidade Visual & Domínio</h4>
                        <p className="text-sm text-gray-400 max-w-md mx-auto">Defina o logo, as cores da sua área de membros e o subdomínio de acesso (ex: suaescola.mestre.com).</p>
                    </div>

                    {data.schoolSubdomain ? (
                        <div className="bg-green-900/20 p-4 rounded-xl border border-green-500/20 w-full max-w-sm">
                            <p className="text-sm text-green-400 font-bold flex items-center justify-center gap-2 mb-1">
                                <CheckCircle className="w-5 h-5" /> Configuração Realizada
                            </p>
                            <p className="text-xs text-gray-400 break-all">{data.schoolSubdomain}.mestre.com</p>
                        </div>
                    ) : (
                        <div className="bg-yellow-900/20 p-4 rounded-xl border border-yellow-500/20 w-full max-w-sm">
                            <p className="text-sm text-yellow-500 font-bold flex items-center justify-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Configuração Pendente
                            </p>
                        </div>
                    )}

                    <Button onClick={onOpenSchoolSetup} className="!py-4 !px-8 !bg-purple-600 font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                        {data.schoolSubdomain ? 'Editar Identidade' : 'Configurar Identidade Agora'}
                    </Button>
                </div>
            </div>
        </div>

        <div className="flex justify-between pt-8 border-t border-gray-700">
            <Button variant="secondary" onClick={onBack} className="!bg-gray-900 border-gray-700 text-gray-500"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
            <Button onClick={onNext} disabled={!data.schoolSubdomain} className="!px-12 !py-4 shadow-xl">Avançar: Ferramentas</Button>
        </div>
    </div>
);

const Step6Tools: React.FC<{
    data: any;
    setData: (d: any) => void;
    onBack: () => void;
    onNext: () => void;
}> = ({ data, setData, onBack, onNext }) => {

    const [dailyLimit, setDailyLimit] = useState(data.aiConfig?.monthlyCreditAllowance || 50);
    const [courseDurationDays, setCourseDurationDays] = useState(data.durationDays || 30);
    const [selectedTools, setSelectedTools] = useState<any[]>(data.premiumTools || []);
    const [paymentType, setPaymentType] = useState<any>(data.financialModel?.type || 'diluted');

    // Sync local state to data on change (simplified for demo, usually use useEffect or direct handler)
    useEffect(() => {
        setData({
            ...data,
            durationDays: courseDurationDays,
            dailyCreditLimit: dailyLimit,
            aiConfig: { ...data.aiConfig, monthlyCreditAllowance: dailyLimit },
            premiumTools: selectedTools,
            financialModel: { ...data.financialModel, type: paymentType }
        });
    }, [dailyLimit, courseDurationDays, selectedTools, paymentType]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8">
                <div className="mb-10">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-2"><Zap className="w-6 h-6 text-brand-primary" /> Turbine sua Escola</h3>
                            <p className="text-gray-400 text-sm">Ferramentas de alta conversão para maximizar o LTV.</p>
                        </div>
                        <div className="hidden md:block">
                            <span className="text-[10px] bg-brand-primary text-black font-black px-3 py-1 rounded-full uppercase">Opcional</span>
                        </div>
                    </div>

                    {/* 1. CREDIT CONTROL (First Item) */}
                    <CreditControlCard
                        limit={dailyLimit}
                        onChange={setDailyLimit}
                        courseDuration={courseDurationDays}
                        onDurationChange={setCourseDurationDays}
                    />

                    {/* 2. INCLUDED FEATURES (Second Item) */}
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 mb-8">
                        <h4 className="font-bold text-white mb-4 flex items-center gap-2 uppercase text-sm">
                            <CheckCircle className="w-5 h-5 text-green-500" /> Incluso no Plano Básico
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <li className="flex items-center gap-3 bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
                                <div className="bg-green-500/10 p-2 rounded-lg"><Monitor className="w-5 h-5 text-green-400" /></div>
                                <div>
                                    <p className="text-white text-xs font-bold uppercase">Nexus Player</p>
                                    <p className="text-[10px] text-gray-500 leading-tight">Player estilo Netflix com Mentor IA.</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-3 bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
                                <div className="bg-purple-500/10 p-2 rounded-lg"><Brain className="w-5 h-5 text-purple-400" /></div>
                                <div>
                                    <p className="text-white text-xs font-bold uppercase">Suporte Inteligente</p>
                                    <p className="text-[10px] text-gray-500 leading-tight">Atendimento 24/7 automático.</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-3 bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
                                <div className="bg-blue-500/10 p-2 rounded-lg"><Smartphone className="w-5 h-5 text-blue-400" /></div>
                                <div>
                                    <p className="text-white text-xs font-bold uppercase">Perfil Gamificado</p>
                                    <p className="text-[10px] text-gray-500 leading-tight">Níveis, XP e Conquistas.</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-3 bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
                                <div className="bg-yellow-500/10 p-2 rounded-lg"><Star className="w-5 h-5 text-yellow-400" /></div>
                                <div>
                                    <p className="text-white text-xs font-bold uppercase">App Mobile</p>
                                    <p className="text-[10px] text-gray-500 leading-tight">Acesso offline e notificações.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* 3. TOOL SELECTION (Third Item) */}
                    <div className="bg-gray-950/30 p-2 rounded-3xl mb-8">
                        <ToolSelectionGrid
                            niche={data.niche}
                            selectedTools={selectedTools}
                            onToggle={(id) => {
                                const newTools = selectedTools.includes(id)
                                    ? selectedTools.filter(t => t !== id)
                                    : [...selectedTools, id];
                                setSelectedTools(newTools);
                            }}
                        />
                    </div>

                    {/* 4. COST SUMMARY (Last Item) */}
                    <CostSummaryCard
                        selectedTools={selectedTools}
                        paymentType={paymentType}
                        setPaymentType={setPaymentType}
                    />

                </div>

                {/* BONUS: MINHAS ESCOLAS */}
                <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/60 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Layers className="w-24 h-24 text-white" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <span className="inline-block py-1 px-3 rounded-full bg-purple-500 text-white text-[10px] font-black uppercase mb-2">Bônus Exclusivo</span>
                            <h4 className="text-lg font-black text-white uppercase">Comunidade de Produtores</h4>
                            <p className="text-xs text-gray-300 max-w-md">Ao ativar sua escola, você ganha acesso ao Mastermind Nexus com os maiores players do mercado.</p>
                        </div>
                        <Button variant="secondary" className="!bg-purple-500 !text-white border-none font-bold uppercase text-[10px]">Saiba Mais</Button>
                    </div>
                </div>

            </div>

            <div className="flex justify-between pt-8 border-t border-gray-700">
                <Button variant="secondary" onClick={onBack} className="!bg-gray-900 border-gray-700 text-gray-500"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
                <Button onClick={onNext} className="!px-12 !py-4 shadow-xl">Avançar: Financeiro</Button>
            </div>
        </div>
    );
};

/**
 * Step 7: Final analysis and publishing (Renamed from Step 6)
 */
const Step7Financial: React.FC<{
    data: any; setData: (d: any) => void; triggerAITask: (id: string, cb: any) => void; handleRunFinancialAnalysis: () => void; handleFinalSave: () => void; accepted: boolean; setAccepted: (b: boolean) => void; onBack: () => void; isProcessing: boolean;
}> = ({ data, setData, triggerAITask, handleRunFinancialAnalysis, handleFinalSave, accepted, setAccepted, onBack, isProcessing }) => {

    const courseDurationDays = data.durationDays || 30; // Default/Mock
    const dailyLimit = data.dailyCreditLimit || 50;   // Default/Mock
    const selectedTools = data.premiumTools || [];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* NEW: Project Data Summary (Before Analysis) */}
            <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <Server className="w-32 h-32 text-gray-400" />
                </div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Server className="w-4 h-4" /> Dados do Projeto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Nome do Curso</p>
                        <p className="text-white font-bold text-sm truncate" title={data.title}>{data.title || 'Sem título'}</p>
                    </div>
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Promessa Central</p>
                        <p className="text-white font-bold text-sm truncate" title={data.transformation}>{data.transformation || 'Não definida'}</p>
                    </div>
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Nicho de Mercado</p>
                        <p className="text-brand-primary font-bold text-sm truncate">{data.niche || 'Geral'}</p>
                    </div>
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Duração</p>
                            <p className="text-white font-bold text-sm">{courseDurationDays} Dias</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Carga Diária</p>
                            <p className="text-white font-bold text-sm">{dailyLimit} Créditos</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-900 border border-brand-primary/30 p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><DollarSign className="w-48 h-48 text-white" /></div>
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-[10px] font-black uppercase mb-3">
                            <Brain className="w-3 h-3" /> FCO Engine 2.0
                        </div>
                        <h3 className="text-white text-3xl font-black leading-tight mb-4 animate-fade-in">
                            Consultoria de Viabilidade Financeira
                        </h3>
                        <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
                            O Mestre IA analisará todos os parâmetros do seu projeto (custos de servidor, tokens de IA, taxas e infraestrutura) para determinar a <strong>saúde financeira</strong> do seu curso.
                        </p>
                    </div>
                    {!data.financialViability && (
                        <Button
                            onClick={() => triggerAITask('financial_analyzer', handleRunFinancialAnalysis)}
                            isLoading={isProcessing}
                            className="!bg-brand-primary text-black font-black uppercase shadow-[0_0_30px_rgba(250,204,21,0.3)] hover:scale-105 transition-transform"
                        >
                            <Calculator className="w-5 h-5 mr-2" /> Gerar Relatório Completo
                        </Button>
                    )}
                </div>
                {data.financialViability && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {data.financialViability.suggestedTickets.map((t: any, i: number) => (
                            <div key={i} className="bg-gray-800 p-5 rounded-2xl border border-gray-700">
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">{t.label}</p>
                                <p className="text-2xl font-black text-white">R$ {t.value.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {data.financialViability && (
                <div className="space-y-6 animate-fade-in">
                    <label className="flex items-center gap-4 p-6 bg-gray-900 rounded-3xl border border-gray-700 cursor-pointer group transition-all hover:border-brand-primary">
                        <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="w-7 h-7 rounded-lg bg-gray-800 border-gray-600 text-brand-primary focus:ring-0 shadow-inner" />
                        <div className="flex-1">
                            <span className="text-sm font-black text-white group-hover:text-brand-primary uppercase tracking-tighter block mb-1">Finalizar Publicação</span>
                            <p className="text-[10px] text-gray-500">Autorizo a criação do curso conforme as definições acima.</p>
                        </div>
                    </label>
                    <div className="flex gap-4 pt-6">
                        <Button variant="secondary" onClick={onBack} className="!bg-gray-900 border-gray-700 text-gray-500"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
                        <Button onClick={handleFinalSave} disabled={!accepted} className="flex-1 !py-6 !bg-green-600 font-black text-2xl shadow-2xl uppercase tracking-tighter">Criar Curso</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MAIN ORCHESTRATOR ---

// Fixed: Defined the props interface before its usage in the component
interface StudentCourseCreatorViewProps {
    navigateTo: (page: StudentPage) => void;
}

// Fixed: Consolidated and exported the component once with all dependencies defined
export const StudentCourseCreatorView: React.FC<StudentCourseCreatorViewProps> = ({ navigateTo }) => {
    const { user, refreshUser } = useAuth();
    const { checkAndConsume } = useCreditGuard();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

    const [isProcessing, setIsProcessing] = useState(false);

    const [accepted, setAccepted] = useState(false);
    const [selectedCategoryPreview, setSelectedCategoryPreview] = useState<any>(null);

    const [fileQueue, setFileQueue] = useState<FileQueueItem[]>([]);
    const [addedLinks, setAddedLinks] = useState<string[]>([]);
    const [resourceLink, setResourceLink] = useState('');
    const [isSchoolSetupOpen, setIsSchoolSetupOpen] = useState(false);

    const [nameSuggestions, setNameSuggestions] = useState<{ name: string, reason: string }[]>([]);

    const [data, setData] = useState<any>({
        id: 'new-' + Date.now(), title: '', niche: '', transformation: '', description: '', category: 'standard',
        totalModules: 0, modules: [], coverUrl: '', isPublished: false, knowledgeIdeas: '',
        therapyConfig: { baseTeorica: 'TCC', elementos: [], isScientific: true, safetyConfirmed: false },
        financialViability: null,
        schoolSubdomain: '',
        slug: '',
        physicalKit: { enabled: false, items: [] }
    });

    useEffect(() => { if (user) setCourses(getStudentCourses(user.uid)); }, [user]);

    useEffect(() => {
        const processNextInQueue = async () => {
            const nextIdx = fileQueue.findIndex(i => i.status === 'pending');
            if (nextIdx === -1) return;
            const item = fileQueue[nextIdx];
            setFileQueue(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing', progress: 10 } : f));
            try {
                for (let p = 10; p <= 100; p += 10) {
                    await new Promise(r => setTimeout(r, 300));
                    setFileQueue(prev => prev.map(f => f.id === item.id ? { ...f, progress: p } : f));
                }
                setFileQueue(prev => prev.map(f => f.id === item.id ? { ...f, status: 'completed' } : f));
            } catch (err) {
                setFileQueue(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error' } : f));
            }
        };
        if (fileQueue.filter(i => i.status === 'processing').length === 0) processNextInQueue();
    }, [fileQueue]);

    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []) as any[];
        if (files.length === 0) return;
        const newItems: FileQueueItem[] = files.map(f => ({
            id: `file-${Date.now()}-${Math.random()}`,
            file: f, status: 'pending', progress: 0,
            type: f.type.startsWith('audio') ? 'audio' : f.type.startsWith('video') ? 'video' : f.type.startsWith('image') ? 'image' : 'pdf'
        }));
        setFileQueue(prev => [...prev, ...newItems]);
    };

    const handleAddLink = () => {
        if (!resourceLink.trim()) return toast.error("Insira uma URL válida.");
        if (!resourceLink.startsWith('http')) return toast.error("URL deve começar com http:// ou https://");
        setAddedLinks([...addedLinks, resourceLink]);
        setResourceLink('');
        toast.success("Link adicionado.");
    };

    const triggerAITask = async (toolId: string, action: () => void, costOverride?: number) => {
        let costToUse = costOverride;

        // Special logic for structure generation if not overridden
        if (toolId === 'method_architect' && !costToUse) {
            const dynamicCost = 5 + (fileQueue.length * 2) + (addedLinks.length * 1);
            costToUse = Math.ceil(dynamicCost * 1.3);
        }

        const proceed = await checkAndConsume(toolId, `Curso IA: ${toolId}`, costToUse);
        if (!proceed) return;

        setIsProcessing(true);
        try {
            await action();
        } catch (e) {
            toast.error("Erro ao processar tarefa da IA.");
        } finally {
            setIsProcessing(false);
            await refreshUser();
        }
    };

    const handleGenerateName = async () => {
        if (!data.niche || !data.transformation) {
            toast.error("Preencha o Nicho e a Transformação para gerar sugestões precisas.");
            return;
        }

        const res = await callMestreIA('course_naming_refiner', {
            objective: data.niche,
            transformation: data.transformation,
            name: data.title || ''
        });

        try {
            let content = res.output;
            if (content.includes('```json')) content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(content);
            setNameSuggestions(parsed.suggestions || []);
            toast.success("Encontrei 5 nomes poderosos!");
        } catch (e) {
            toast.error("Erro ao processar nomes sugeridos.");
        }
    };

    const selectName = (name: string) => {
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        setData({ ...data, title: name, slug: slug });
        setNameSuggestions([]);
        toast.success(`Nome selecionado: ${name}`);
    };

    const handleGenerateCover = async () => {
        if (!data.title || !data.transformation) {
            toast.error("O Nome do Curso e a Transformação são obrigatórios para criar o design.");
            return;
        }

        const tid = toast.loading("Nexus IA: Mapeando fundamentos visuais...");
        try {
            const imageUrl = await generateCourseCoverImage({
                title: data.title,
                niche: data.niche,
                category: data.category,
                transformation: data.transformation
            });
            setData({ ...data, coverUrl: imageUrl });
            toast.success("Capa Gerada com Design de Alta Performance!", { id: tid });
        } catch (e) {
            toast.error("Erro ao gerar imagem. Tente novamente.", { id: tid });
        }
    };

    const handleGeneratePromise = async () => {
        if (!data.transformation) {
            toast.error("Defina a transformação principal na Etapa 2 para otimizar a promessa.");
            return;
        }

        const res = await callMestreIA('promise_architect', {
            promise: data.description,
            niche: data.niche,
            transformation: data.transformation
        });
        setData({ ...data, description: res.output });
        toast.success("Promessa Refinada pelo Nexus!");
    };

    const handleGenerateSummary = async () => {
        const fileNames = fileQueue.map(f => f.file.name).join(', ');
        const links = addedLinks.join(', ');
        const res = await callMestreIA('method_architect', { ideas: `${data.description}\n\nArquivos: ${fileNames}\nLinks: ${links}` });
        setData({ ...data, knowledgeIdeas: res.output });
        toast.success("Estrutura gerada!");
    };

    const handleRunFinancialAnalysis = async () => {
        setIsProcessing(true);
        setTimeout(() => {
            const isMarketingNiche = data.niche.toLowerCase().includes('marketing') || data.niche.toLowerCase().includes('vendas') || data.niche.toLowerCase().includes('dinheiro');

            const viability: FinancialViability = {
                suggestedTickets: [
                    { label: 'Low Ticket (Entrada)', value: 47.90, reasoning: 'Captura rápida de leads para este nicho.' },
                    { label: 'Ticket Padrão', value: 197.00, reasoning: 'Ponto ideal de conversão/lucro identificado pelo Nexus.' },
                    { label: 'High Ticket (Mentoria)', value: 997.00, reasoning: 'Ancoragem de valor para alunos premium.' }
                ],
                offerMarketingPackage: isMarketingNiche,
                nexusVerdict: `PROJETO COM ALTA VIABILIDADE.\n\nAnalisamos ${data.niche} e detectamos que promessas baseadas em "${data.transformation.substring(0, 30)}..." têm ticket médio de R$ 197,00. Sua estrutura suporta escala imediata.`
            };
            setData({ ...data, financialViability: viability });
            setIsProcessing(false);
            toast.success("Análise Econômica Concluída!");
        }, 2000);
    };

    const [maintenanceCost, setMaintenanceCost] = useState({ perStudent: 0, storage: 0, totalMonthly: 0 });

    useEffect(() => {
        const calculateMaint = async () => {
            const costs = await getToolCosts();
            const maintStudent = costs.find(c => c.toolId === 'maintenance_active_student')?.costPerTask || 0.01;
            const maintStorage = costs.find(c => c.toolId === 'maintenance_storage_gb')?.costPerTask || 0.20;

            // Estimates
            const avgStorageGB = (data.modules.length * 5 * 0.5); // 5 lessons per module, 500MB per lesson
            const studentsEstimate = 100; // Base estimate for calculation

            const costPerStudentMonthly = maintStudent * 30; // Daily * 30
            const storageMonthly = avgStorageGB * maintStorage;

            setMaintenanceCost({
                perStudent: costPerStudentMonthly,
                storage: storageMonthly,
                totalMonthly: (costPerStudentMonthly * studentsEstimate) + storageMonthly
            });
        };
        calculateMaint();
    }, [data.modules]);

    const handleFinalSave = async () => {
        const current = getStudentCourses(user!.uid);
        const finalData = { ...data, isPublished: true };
        saveStudentCourses(user!.uid, [...current, finalData]);
        setCourses([...current, finalData]);

        // Sync with User Profile for Sidebar visibility
        await addPublishedCourseToUser(user!.uid, finalData.id);
        await refreshUser();

        setIsWizardOpen(false);
        toast.success("CURSO CRIADO E DISPONÍVEL NO PORTAL!");
    };

    const toggleTherapyComponent = (compId: string) => {
        const current = data.therapyConfig.elementos || [];
        const newElems = current.includes(compId)
            ? current.filter((id: string) => id !== compId)
            : [...current, compId];
        setData({ ...data, therapyConfig: { ...data.therapyConfig, elementos: newElems } });
    };

    const availableNichos = NICHOS_BY_CATEGORY[data.category] || NICHOS_BY_CATEGORY.all;
    const currentContext = CATEGORY_CONTEXT[data.category] || CATEGORY_CONTEXT.standard;

    const handleSchoolSuccess = (settings: SchoolSettings) => {
        setData({ ...data, schoolSubdomain: settings.subdomain });
        setIsSchoolSetupOpen(false);
        toast.success(`Portal ${settings.schoolName} vinculado ao curso!`);
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="flex justify-between items-center bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                        <PlusCircle className="w-8 h-8 text-brand-primary" /> Criador de Cursos 50X
                    </h2>
                    <p className="text-gray-400 text-sm font-medium">Arquitetura de treinamento otimizada com Nexus IA.</p>
                </div>
                <Button onClick={() => { setData({ id: 'new-' + Date.now(), title: '', niche: '', transformation: '', description: '', category: 'standard', coverUrl: '', therapyConfig: { baseTeorica: 'TCC', elementos: [], isScientific: true, safetyConfirmed: false }, schoolSubdomain: '', slug: '' } as any); setStep(1); setIsWizardOpen(true); }} className="!bg-brand-primary text-black font-black uppercase text-xs tracking-widest shadow-lg shadow-yellow-500/10">CRIAR NOVO CURSO</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length === 0 ? (
                    <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-700 rounded-3xl bg-gray-800/30">
                        <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4 opacity-30" />
                        <p className="text-gray-500 uppercase font-black tracking-[0.2em]">Você ainda não criou cursos</p>
                        <Button onClick={() => setIsWizardOpen(true)} className="mt-6">Começar Agora</Button>
                    </div>
                ) : courses.map(course => (
                    <Card key={course.id} className="p-0 overflow-hidden border border-gray-700 hover:border-brand-primary/50 transition-all group">
                        <div className="h-44 bg-gray-900 relative">
                            {course.coverUrl && <img src={course.coverUrl} className="w-full h-full object-cover opacity-60" alt="Capa" />}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                            <div className="absolute bottom-4 left-5 pr-5">
                                <h3 className="font-black text-white text-lg uppercase leading-tight tracking-tighter">{course.title}</h3>
                                <p className="text-brand-primary text-[10px] font-bold uppercase mt-1">{course.niche || 'Geral'}</p>
                            </div>
                        </div>
                        <div className="p-5 flex justify-between items-center bg-gray-800">
                            <span className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Nexus Ativo</span>
                            <div className="flex gap-2">
                                <Button variant="secondary" className="!py-1.5 !px-3 uppercase font-black text-[9px] border-gray-700">Editar</Button>
                                <Button className="!py-1.5 !px-3 uppercase font-black text-[9px]">Portal</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <AnimatePresence>
                {isWizardOpen && (
                    <div className="fixed inset-0 bg-black/98 flex items-center justify-center z-[140] p-4 overflow-y-auto">
                        <MotionDiv initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-800 w-full max-w-5xl rounded-3xl border border-gray-700 shadow-2xl flex flex-col max-h-[95vh] relative overflow-hidden">
                            <div className="p-8 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                                <div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">
                                        <span>Painel Admin</span>
                                        <span className="text-gray-700">/</span>
                                        <span className="text-brand-primary">Passo {step} de 7</span>
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase">Orquestrador de Lançamentos</h3>
                                    <div className="flex gap-2 mt-2">
                                        {[1, 2, 3, 4, 5, 6, 7].map(s => <div key={s} className={`h-1 w-8 rounded-full transition-all duration-500 ${s <= step ? 'bg-brand-primary shadow-[0_0_10px_#FACC15]' : 'bg-gray-700'}`}></div>)}
                                    </div>
                                </div>
                                <button onClick={() => setIsWizardOpen(false)} className="bg-gray-700 p-2 rounded-full text-gray-400 hover:text-white transition-colors"><XIcon className="w-6 h-6" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                                {step === 1 && <Step1Category setSelectedCategoryPreview={setSelectedCategoryPreview} />}

                                {step === 2 && (
                                    <Step2BasicDetails
                                        data={data} setData={setData}
                                        availableNichos={availableNichos}
                                        context={currentContext}
                                        triggerAITask={triggerAITask}
                                        handleGenerateName={handleGenerateName}
                                        handleGenerateCover={handleGenerateCover}
                                        nameSuggestions={nameSuggestions}
                                        selectName={selectName}
                                        onBack={() => setStep(1)}
                                        onNext={() => setStep(3)}
                                        toggleTherapyComponent={toggleTherapyComponent}
                                        onOpenSchoolSetup={() => setIsSchoolSetupOpen(true)}
                                    />
                                )}

                                {step === 3 && (
                                    <Step3Promise
                                        data={data} setData={setData}
                                        context={currentContext}
                                        triggerAITask={triggerAITask}
                                        handleGeneratePromise={handleGeneratePromise}
                                        onBack={() => setStep(2)}
                                        onNext={() => setStep(4)}
                                    />
                                )}

                                {/* STEP 4 */}
                                {step === 4 && (
                                    <Step4Content
                                        data={data}
                                        setData={setData}
                                        context={currentContext}
                                        fileQueue={fileQueue}
                                        setFileQueue={setFileQueue}
                                        addedLinks={addedLinks}
                                        setAddedLinks={setAddedLinks}
                                        resourceLink={resourceLink}
                                        setResourceLink={setResourceLink}
                                        handleAddLink={handleAddLink}
                                        handleFileSelection={handleFileSelection}
                                        triggerAITask={triggerAITask}
                                        handleGenerateSummary={handleGenerateSummary}
                                        isProcessingFiles={isProcessing}
                                        onBack={() => setStep(3)}
                                        onNext={() => setStep(5)}
                                        userCredits={user?.credits || 0}
                                        onRecharge={() => toast.error('Funcionalidade de recarga indisponível na demo.')}
                                    />
                                )}

                                {/* STEP 5 - BRANDING */}
                                {step === 5 && (
                                    <Step5SchoolBranding
                                        data={data}
                                        onOpenSchoolSetup={() => setIsSchoolSetupOpen(true)}
                                        onBack={() => setStep(4)}
                                        onNext={() => setStep(6)}
                                    />
                                )}

                                {/* STEP 6 - TOOLS */}
                                {step === 6 && (
                                    <Step6Tools
                                        data={data}
                                        setData={setData}
                                        onBack={() => setStep(5)}
                                        onNext={() => setStep(7)}
                                    />
                                )}

                                {/* STEP 7 - FINANCIAL */}
                                {step === 7 && (
                                    <Step7Financial
                                        data={data}
                                        setData={setData}
                                        triggerAITask={triggerAITask}
                                        handleRunFinancialAnalysis={handleRunFinancialAnalysis}
                                        handleFinalSave={handleFinalSave}
                                        accepted={accepted}
                                        setAccepted={setAccepted}
                                        onBack={() => setStep(6)}
                                        isProcessing={isProcessing}
                                    />
                                )}


                            </div>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedCategoryPreview && (
                    <div className="fixed inset-0 bg-black/98 flex items-center justify-center z-[200] p-4 overflow-y-auto">
                        <MotionDiv
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className={`bg-gray-800 w-full max-w-2xl rounded-3xl border-2 border-${selectedCategoryPreview.color}-500/50 shadow-[0_0_60px_rgba(0,0,0,1)] p-8 md:p-12 relative overflow-hidden`}
                        >
                            <div className={`absolute top-0 right-0 w-64 h-64 bg-${selectedCategoryPreview.color}-500/5 rounded-full blur-[100px] pointer-events-none`}></div>
                            <div className="relative z-10 text-center">
                                <div className={`w-24 h-24 bg-${selectedCategoryPreview.color}-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-${selectedCategoryPreview.color}-500/30`}>
                                    <selectedCategoryPreview.icon className={`w-12 h-12 text-${selectedCategoryPreview.color}-400`} />
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">{selectedCategoryPreview.label}</h3>
                                <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-700 text-left mb-10">
                                    <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap font-medium">{selectedCategoryPreview.longDesc}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button variant="secondary" onClick={() => setSelectedCategoryPreview(null)} className="flex-1 !py-5 !bg-gray-700 border-gray-600 text-gray-300 uppercase font-black tracking-widest text-xs">Voltar</Button>
                                    <Button
                                        onClick={() => { setData({ ...data, category: selectedCategoryPreview.id as any }); setSelectedCategoryPreview(null); setStep(2); }}
                                        className={`flex-1 !py-5 !bg-${selectedCategoryPreview.color}-600 hover:!bg-${selectedCategoryPreview.color}-500 text-white uppercase font-black tracking-widest text-xs shadow-2xl`}
                                    >
                                        Prosseguir com este Modelo
                                    </Button>
                                </div>
                            </div>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>

            <SchoolSetupModal
                isOpen={isSchoolSetupOpen}
                onClose={() => setIsSchoolSetupOpen(false)}
                onSuccess={handleSchoolSuccess}
                niche={data.niche}
            />
        </div>
    );
};

export default StudentCourseCreatorView;
