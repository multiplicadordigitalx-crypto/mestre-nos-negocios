
import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrainingModule, Course, CourseCategory, SchoolSettings, FinancialViability, PhysicalKitItem } from '../types';
import {
    getTrainingModules,
    updateTrainingData,
    uploadFileToStorage,
    getCourses,
    saveCourse,
    deleteCourse,
    consumeCredits
} from '../services/mockFirebase';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import {
    PlusCircle, Trash, BookOpen, ArrowLeft, HeartPulse, ArrowRight,
    Activity, Brain, X as XIcon, CloudUpload, Sparkles,
    RefreshCw, Smartphone, List, Layers, Zap, CheckCircle,
    Info, Target, DollarSign, Pencil, ShieldCheck, Camera,
    Star, Crown, Film, Mic, FileText, Globe, Search, Palette,
    Monitor, Megaphone, Link as LinkIcon, ChevronRight, Eye,
    ShieldAlert, Server, Calculator, Clock, Settings,
    ChevronUp, ChevronDown, Video, Upload, HardDrive, Download, FileBox, ExternalLink
} from '../components/Icons';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
    MASTER_SYSTEM_PROMPT,
    PERSONAL_MASTER_PROTOCOL,
    THERAPY_BEHAVIOR_PROMPT,
    SLIMMING_MASTER_PROTOCOL
} from '../services/prompts';
import { callMestreIA, generateCourseCoverImage } from '../services/mestreIaService';
import { useAuth } from '../hooks/useAuth';
import { SchoolSetupModal } from '../components/SchoolSetupModal';

import { CreditControlCard, ToolSelectionGrid, CostSummaryCard } from '../components/SchoolToolsSelector';
import { SchoolConfig } from '../types';

const MotionDiv = motion.div as any;

// --- CONTEXTOS DE CATEGORIA ---
const CATEGORY_CONTEXT: Record<string, {
    titlePlaceholder: string;
    promisePlaceholder: string;
    aiNamingContext: string;
    contentHint: string;
    icon: any;
}> = {
    standard: {
        titlePlaceholder: "Ex: Método Mestre 50X",
        promisePlaceholder: "Ex: Vou tirar você do zero e te transformar em um mestre na sua área através de um método estruturado...",
        aiNamingContext: "ensino tradicional, videoaulas e transferência de conhecimento especializado",
        contentHint: "Suba videoaulas, PDFs, ebooks ou links de materiais sobre seu tema para que a IA estruture seu treinamento pedagógico.",
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
        desc: 'Escala 100% passiva. O modelo clássico de videoaulas: grave uma vez e venda para sempre.',
        longDesc: 'O Modelo Tradicional foca na entrega de conteúdo gravado. Ideal para cursos com trilha de aprendizado definida e materiais de apoio.\n\nEstratégia Nexus:\n• Ganho Financeiro: Baixíssimo custo de manutenção após gravado.\n• Status: Autoridade construída através da didática e certificação.'
    },
    {
        id: 'personal_master',
        label: 'Mestre Pessoal (Mentor IA)',
        icon: Brain,
        color: 'purple',
        desc: 'Venda Mentorias High-Ticket. Clone seu cérebro em uma IA que atende seus alunos individualmente 24h por dia.',
        longDesc: 'O Mestre Pessoal é a ferramenta definitiva de escala humana. Você treina a IA com seus próprios materiais (PDFs, áudios, textos) e ela atende milhares de alunos individualmente como se fosse você.\n\nEstratégia Nexus:\n• Valor Percebido: Mentorias de ticket alto (R$ 997+).\n• Diferencial: Suporte 24h que nenhum concorrente humano consegue oferecer.'
    },
    {
        id: 'therapy_master',
        label: 'Mestre da Terapia',
        icon: HeartPulse,
        color: 'pink',
        desc: 'Foco em Recorrência (LTV). Protocolos de saúde mental com acompanhamento diário para máxima retenção.',
        longDesc: 'Focado exclusivamente no nicho de saúde mental. Este modelo ativa o Protocolo Clínico Nexus, com triagem automática de risco e exercícios de TCC/ACT.\n\nEstratégia Nexus:\n• Vitalidade: Foco total na erradicação da dor emocional do aluno.\n• Retenção: Modelo de assinatura com acompanhamento diário do humor.'
    },
    {
        id: 'slimming_master',
        label: 'Mestre do Emagrecimento',
        icon: Activity,
        color: 'green',
        desc: 'Alta Viralização. Dietas e treinos adaptativos que geram resultados visíveis e prova social orgânica.',
        longDesc: 'A máquina de transformação física. A IA analisa dados biométricos do aluno e ajusta planos alimentares e de treino de forma dinâmica.\n\nEstratégia Nexus:\n• Prova Social: Resultados físicos visíveis geram viralização.\n• Recorrência: Acompanhamento de metas de curto e médio prazo.'
    }
];

const NICHOS_BY_CATEGORY: Record<string, string[]> = {
    all: [
        "Marketing Digital & Vendas", "Finanças & Investimentos", "Saúde & Bem-estar",
        "Desenvolvimento Pessoal", "Tecnologia & Programação", "Idiomas & Línguas Estrangeiras",
        "Negócios & Empreendedorismo", "Carreira & Profissões", "Artes & Design",
        "Educação & Concursos", "Gastronomia & Culinária", "Esportes & Fitness",
        "Moda & Beleza", "Maternidade & Família", "Relacionamentos",
        "Espiritualidade & Esoterismo", "Fotografia & Vídeo", "Música & Instrumentos",
        "Imobiliário & Corretagem", "Direito & Consultoria", "Agronegócio",
        "Arquitetura & Design de Interiores", "Artesanato & Hobbies",
        "E-commerce & Dropshipping", "Sustentabilidade & Ecologia", "Outros"
    ],
    standard: [
        "Marketing Digital & Vendas", "Finanças & Investimentos", "Desenvolvimento Pessoal",
        "Educação & Concursos", "Idiomas & Línguas Estrangeiras", "Tecnologia & Programação",
        "Negócios & Gestão", "Infoprodutos & Lançamentos", "Artesanato & Hobbies",
        "Saúde & Bem-estar", "Gastronomia & Culinária", "Moda & Beleza",
        "Fotografia & Vídeo", "Música & Instrumentos", "Artes & Design",
        "Imobiliário & Corretagem", "Direito & Consultoria", "Maternidade & Educação Infantil",
        "Espiritualidade & Desenvolvimento Espiritual", "Esportes & Alta Performance",
        "Produtividade & Soft Skills", "Recursos Humanos & Liderança", "Engenharia & Arquitetura",
        "E-commerce & Logística", "Agronegócio & Veterinária", "Outros"
    ],
    personal_master: [
        "Negócios & Gestão de Equipes", "Empreendedorismo Digital", "Liderança & Soft Skills",
        "Vendas de Alto Ticket", "Estratégia de Marketing & Branding", "Finanças Corporativas",
        "Investimentos (Ações/Cripto)", "Direito & Consultoria Jurídica", "Contabilidade Estratégica",
        "Engenharia & Arquitetura", "Tecnologia & Dev Mentor", "Ciência de Dados & BI",
        "Idiomas (Fluência Acelerada)", "Oratória & Comunicação", "Carreira & Recolocação",
        "Produtividade & Gestão de Tempo", "Maternidade & Educação de Filhos", "Esportes & Alta Performance",
        "Moda & Imagem Pessoal", "Estratégia Imobiliária", "Marketing de Influência",
        "Mentoria de Vida & Performance", "Espiritualidade & Propósito", "Gestão de Tráfego Avançada"
    ],
    therapy_master: [
        "Saúde Mental (Geral)", "Psicologia TCC", "Terapia Holística", "Acolhimento Luto/Crises",
        "Ansiedade & Stress", "Autoconhecimento Profundo", "Meditação & Mindfulness",
        "Constelação Familiar", "Terapia de Casal", "Psicanálise & Inconsciente",
        "Desenvolvimento Emocional", "Superação de Traumas"
    ],
    slimming_master: [
        "Emagrecimento Feminino", "Hipertrofia & Ganho de Massa", "Bio-hacking & Longevidade",
        "Nutrição Esportiva", "Yoga & Flexibilidade", "Crossfit & Performance",
        "Reeducação Alimentar", "Jejum Intermitente Profissional", "Saúde Intestinal & Detox",
        "Suplementação Estratégica", "Mente Magra & Comportamento"
    ]
};

const Hint: React.FC<{ title: string, text: string, type?: 'info' | 'warning' }> = ({ title, text, type = 'info' }) => (
    <div className={`${type === 'info' ? 'bg-blue-900/10 border-blue-500/20' : 'bg-red-900/10 border-red-500/20'} border p-4 rounded-2xl flex gap-3 items-start mb-4`}>
        {type === 'info' ? <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" /> : <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
        <div>
            <p className={`text-xs font-black uppercase tracking-widest mb-1 ${type === 'info' ? 'text-blue-400' : 'text-red-400'}`}>{title}</p>
            <p className="text-xs text-gray-400 leading-relaxed">{text}</p>
        </div>
    </div>
);

interface PhysicalKitItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    requiresOCR: boolean;
}

interface FileQueueItem {
    id: string;
    file: any;
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: number;
    type: 'audio' | 'video' | 'pdf' | 'doc' | 'image';
}

// --- STEP 4: TRADITIONAL (MANUAL) ---
const Step4TraditionalContent: React.FC<{
    data: any;
    setData: (d: any) => void;
    onBack: () => void;
    onNext: () => void;
    handleRunAITask: (id: string, action: () => void, cost?: number) => void;
    isProcessing: boolean;
}> = ({ data, setData, onBack, onNext, handleRunAITask, isProcessing }) => {
    const [expandedModule, setExpandedModule] = useState<string | null>(null);
    const [uploadingItems, setUploadingItems] = useState<Record<string, number>>({});
    const [aiSettings, setAiSettings] = useState<Record<string, { qty: number, opts: number }>>({}); // modId -> settings

    const handleFileUpload = async (modId: string, itemId: string, file: File, type: 'lesson' | 'material') => {
        try {
            setUploadingItems(prev => ({ ...prev, [itemId]: 1 }));
            const url = await uploadFileToStorage(file, (progress) => {
                setUploadingItems(prev => ({ ...prev, [itemId]: progress }));
            });

            if (type === 'lesson') {
                updateLesson(modId, itemId, { videoUrl: url, videoFile: file.name });
            } else {
                updateMaterial(modId, itemId, { url, fileName: file.name });
            }
            toast.success("Upload concluído!");
        } catch (e) {
            toast.error("Erro no upload.");
        } finally {
            setUploadingItems(prev => {
                const newState = { ...prev };
                delete newState[itemId];
                return newState;
            });
        }
    };

    const addModule = () => {
        const newModule = {
            id: `mod-${Date.now()}`,
            title: 'Novo Módulo',
            lessons: [],
            materials: [],
            quizzes: []
        };
        const newModules = [...(data.modules || []), newModule];
        setData({ ...data, modules: newModules, totalModules: newModules.length });
        setExpandedModule(newModule.id);
        toast.success("Módulo adicionado.");
    };

    const updateModule = (modId: string, updates: any) => {
        setData({
            ...data,
            modules: (data.modules || []).map((m: any) => {
                if (m.id === modId) {
                    const updated = { ...m, ...updates };
                    if (updates.quiz === null) delete updated.quiz;
                    if (updated.quiz && !updated.quizzes) {
                        updated.quizzes = [updated.quiz];
                        delete updated.quiz;
                    }
                    return updated;
                }
                return m;
            })
        });
    };

    const removeModule = (modId: string) => {
        const newModules = data.modules.filter((m: any) => m.id !== modId);
        setData({ ...data, modules: newModules, totalModules: newModules.length });
        toast.success("Módulo removido.");
    };

    const addLesson = (modId: string) => {
        const newLesson = {
            id: `less-${Date.now()}`,
            title: 'Nova Aula',
            type: 'video',
            videoUrl: '',
            description: ''
        };
        updateModule(modId, {
            lessons: [...(data.modules?.find((m: any) => m.id === modId)?.lessons || []), newLesson]
        });
    };

    const updateLesson = (modId: string, lessId: string, updates: any) => {
        const mod = data.modules?.find((m: any) => m.id === modId);
        const newLessons = (mod?.lessons || []).map((l: any) => l.id === lessId ? { ...l, ...updates } : l);
        updateModule(modId, { lessons: newLessons });
    };

    const removeLesson = (modId: string, lessId: string) => {
        const mod = data.modules?.find((m: any) => m.id === modId);
        updateModule(modId, { lessons: (mod?.lessons || []).filter((l: any) => l.id !== lessId) });
    };

    const addMaterial = (modId: string) => {
        const newMat = { id: `mat-${Date.now()}`, name: 'Novo Material', type: 'link', url: '' };
        const mod = data.modules?.find((m: any) => m.id === modId);
        updateModule(modId, { materials: [...(mod?.materials || []), newMat] });
    };

    const updateMaterial = (modId: string, matId: string, updates: any) => {
        const mod = data.modules?.find((m: any) => m.id === modId);
        const newMats = (mod?.materials || []).map((m: any) => m.id === matId ? { ...m, ...updates } : m);
        updateModule(modId, { materials: newMats });
    };

    const removeMaterial = (modId: string, matId: string) => {
        const mod = data.modules?.find((m: any) => m.id === modId);
        updateModule(modId, { materials: (mod?.materials || []).filter((m: any) => m.id !== matId) });
    };

    const generateQuizIA = async (modId: string, qtyQuestions: number = 3, qtyOptions: number = 4) => {
        const mod = data.modules?.find((m: any) => m.id === modId);
        handleRunAITask('quiz_generator', async () => {
            try {
                const ideas = `Gere um quiz de ${qtyQuestions} perguntas para o módulo "${mod.title}" com base nos temas: ${(mod.lessons || []).map((l: any) => l.title).join(', ')}. Cada questão deve ter ${qtyOptions} alternativas.`;
                await callMestreIA('method_architect', { ideas });

                const mockQuestions = Array.from({ length: qtyQuestions }).map((_, i) => ({
                    id: `q${Date.now()}-${i}`,
                    text: `Questão ${i + 1} gerada por IA sobre ${mod.title}?`,
                    options: Array.from({ length: qtyOptions }).map((_, j) => `Opção ${String.fromCharCode(65 + j)}`),
                    correctOptionIndex: 0
                }));

                const newQuiz = { id: `quiz-${Date.now()}`, title: `Quiz IA: ${mod.title}`, questions: mockQuestions };
                const currentQuizzes = mod.quizzes || (mod.quiz ? [mod.quiz] : []);
                updateModule(modId, { quizzes: [...currentQuizzes, newQuiz], quiz: null });
                toast.success("Quiz gerado com sucesso!");
            } catch (e) {
                toast.error("Erro ao gerar quiz.");
            }
        }, 15 + (qtyQuestions * 2));
    };

    const addManualQuiz = (modId: string) => {
        const mod = data.modules?.find((m: any) => m.id === modId);
        const newQuiz = {
            id: `quiz-${Date.now()}`,
            title: 'Novo Quiz Manual',
            questions: [{ id: `q${Date.now()}`, text: 'Digite sua pergunta...', options: ['', '', '', ''], correctOptionIndex: 0 }]
        };
        const currentQuizzes = mod?.quizzes || (mod?.quiz ? [mod.quiz] : []);
        updateModule(modId, { quizzes: [...currentQuizzes, newQuiz], quiz: null });
    };

    const removeQuiz = (modId: string, quizId: string) => {
        const mod = data.modules?.find((m: any) => m.id === modId);
        if (!mod) return;

        let currentQuizzes = [...(mod.quizzes || [])];
        // Merge legacy quiz if it exists and isn't already in the list
        if (mod.quiz && !currentQuizzes.find((q: any) => q.id === mod.quiz.id)) {
            currentQuizzes.push(mod.quiz);
        }

        const newQuizzes = currentQuizzes.filter((q: any) => q.id !== quizId);

        console.log("Removing Quiz", { modId, quizId, currentQuizzes, newQuizzes });
        updateModule(modId, { quizzes: newQuizzes, quiz: null });
        toast.success("Quiz excluído com sucesso.");
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex justify-between items-center bg-gray-900 p-6 rounded-[2rem] border border-gray-700">
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Estrutura do Treinamento</h3>
                    <p className="text-gray-500 text-xs text-balance max-w-sm">Crie módulos, adicione aulas e configure materiais complementares. Você também pode gerar quizes com IA baseados no conteúdo.</p>
                </div>
                <Button onClick={addModule} className="!bg-brand-primary text-black font-black uppercase text-xs">
                    <PlusCircle className="w-4 h-4 mr-2" /> Novo Módulo
                </Button>
            </div>

            <div className="space-y-4">
                {!data.modules || data.modules.length === 0 ? (
                    <div className="py-24 text-center border-2 border-dashed border-gray-800 rounded-[3rem] bg-gray-900/30">
                        <Layers className="w-16 h-16 text-gray-800 mx-auto mb-4 opacity-30" />
                        <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Nenhum módulo criado ainda.</p>
                        <Button onClick={addModule} className="mt-6 !bg-gray-800 border-gray-700 text-gray-400">Começar Estrutura</Button>
                    </div>
                ) : data.modules?.map((mod: any, mIdx: number) => (
                    <div key={mod.id} className="bg-gray-900 rounded-[2.5rem] border border-gray-700 overflow-hidden shadow-2xl transition-all">
                        <div
                            className={`p-6 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 ${expandedModule === mod.id ? 'bg-gray-800/30 border-b border-gray-800' : ''}`}
                            onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                        >
                            <div className="flex items-center gap-4">
                                <span className="w-10 h-10 flex items-center justify-center bg-brand-primary text-black font-black rounded-2xl text-sm shadow-[0_0_15px_rgba(250,204,21,0.2)]">{mIdx + 1}</span>
                                <input
                                    className="bg-transparent text-white font-black uppercase tracking-tight outline-none focus:text-brand-primary text-lg w-full max-w-md"
                                    value={mod.title}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => updateModule(mod.id, { title: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex flex-col items-end mr-4">
                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{mod.lessons?.length || 0} Aulas</span>
                                    <span className="text-[11px] text-brand-primary font-black uppercase">{mod.materials?.length || 0} Materiais</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); removeModule(mod.id); }} className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"><Trash className="w-4 h-4" /></button>
                                {expandedModule === mod.id ? <ChevronUp className="w-6 h-6 text-gray-500" /> : <ChevronDown className="w-6 h-6 text-gray-500" />}
                            </div>
                        </div>

                        <AnimatePresence>
                            {expandedModule === mod.id && (
                                <MotionDiv initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-8 space-y-10 bg-black/20 border-t border-gray-800/50">
                                    {/* Lessons Section */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center bg-gray-800/40 p-3 rounded-2xl border border-gray-700/50">
                                            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2"><Film className="w-5 h-5 text-brand-primary" /> Grade de Aulas</h4>
                                            <Button onClick={() => addLesson(mod.id)} variant="secondary" className="!py-2 !px-4 !text-[10px] bg-gray-900 border-gray-700 hover:border-brand-primary text-white font-black uppercase"> + Nova Aula</Button>
                                        </div>
                                        <div className="grid gap-6">
                                            {mod.lessons?.map((less: any, lIdx: number) => (
                                                <div key={less.id} className="bg-gray-800/40 border border-gray-700/50 p-6 rounded-[2rem] flex flex-col gap-6 group hover:border-brand-primary/30 transition-all relative overflow-hidden">
                                                    {uploadingItems[less.id] && (
                                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                                                            <LoadingSpinner className="w-8 h-8 text-brand-primary mb-3" />
                                                            <span className="text-[11px] font-black uppercase text-white tracking-widest">Enviando Vídeo: {uploadingItems[less.id]}%</span>
                                                            <div className="w-48 h-1 bg-gray-800 rounded-full mt-3 overflow-hidden">
                                                                <div className="h-full bg-brand-primary transition-all duration-300" style={{ width: `${uploadingItems[less.id]}%` }}></div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-gray-950 rounded-2xl flex items-center justify-center text-gray-600 group-hover:text-brand-primary transition-colors border border-gray-700 shadow-inner"><Video className="w-6 h-6" /></div>
                                                            <div>
                                                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block ml-1">Configuração da Aula</label>
                                                                <input
                                                                    placeholder="Ex: Introdução ao Método"
                                                                    className="bg-transparent text-white text-lg font-black outline-none focus:text-brand-primary transition-colors w-full"
                                                                    value={less.title}
                                                                    onChange={(e) => updateLesson(mod.id, less.id, { title: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                        <button onClick={() => removeLesson(mod.id, less.id)} className="p-2 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"><Trash className="w-5 h-5" /></button>
                                                    </div>

                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                        <div className="space-y-3 p-5 bg-black/20 rounded-2xl border border-gray-800/50">
                                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                                <Upload className="w-3.5 h-3.5 text-brand-primary" /> Hospedagem Interna (Recomendado)
                                                            </label>
                                                            <div className="flex gap-3">
                                                                <input
                                                                    type="file"
                                                                    id={`admin-lesson-upload-${less.id}`}
                                                                    className="hidden"
                                                                    accept="video/*"
                                                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(mod.id, less.id, e.target.files[0], 'lesson')}
                                                                />
                                                                <Button
                                                                    onClick={() => document.getElementById(`admin-lesson-upload-${less.id}`)?.click()}
                                                                    className="flex-1 !bg-brand-primary !text-black border-brand-primary hover:!bg-brand-primary/80 !py-3 !text-[10px] uppercase font-black shadow-[0_4px_15px_rgba(250,204,21,0.2)]"
                                                                >
                                                                    <Upload className="w-3.5 h-3.5 mr-2" /> {less.videoFile ? `Alterar Vídeo (${less.videoFile})` : 'Fazer Upload do Vídeo'}
                                                                </Button>
                                                            </div>
                                                            <p className="text-[11px] text-gray-500 font-medium italic">Hospede o arquivo MP4 diretamente em nossos servidores nexus.</p>
                                                        </div>

                                                        <div className="space-y-3 p-5 bg-black/20 rounded-2xl border border-gray-800/50">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                                <ExternalLink className="w-3.5 h-3.5 text-blue-400" /> Link Externo (Opcional)
                                                            </label>
                                                            <input
                                                                placeholder="YouTube, Vimeo ou Link Direto..."
                                                                className="w-full bg-gray-900 border border-gray-700/50 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-brand-primary"
                                                                value={less.videoUrl}
                                                                onChange={(e) => updateLesson(mod.id, less.id, { videoUrl: e.target.value, videoFile: '' })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Materials Section */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center bg-gray-800/40 p-4 rounded-3xl border border-gray-700/50">
                                            <div>
                                                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2"><FileText className="w-5 h-5 text-purple-400" /> Materiais de Apoio</h4>
                                                <p className="text-[11px] text-gray-500 uppercase font-black mt-1">Ebooks, PDFs e Planilhas Complementares</p>
                                            </div>
                                            <Button onClick={() => addMaterial(mod.id)} variant="secondary" className="!py-2.5 !px-6 !text-[10px] bg-gray-950 border-gray-700 hover:border-purple-500 text-white font-black uppercase"> + Adicionar Material</Button>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {mod.materials?.map((mat: any) => (
                                                <div key={mat.id} className="bg-gray-800/40 border border-gray-700/50 p-6 rounded-[2rem] flex flex-col gap-4 group hover:border-purple-500/30 transition-all relative overflow-hidden">
                                                    {uploadingItems[mat.id] && (
                                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                                                            <LoadingSpinner className="w-6 h-6 text-purple-400 mb-2" />
                                                            <span className="text-[9px] font-black uppercase text-white tracking-widest">Enviando: {uploadingItems[mat.id]}%</span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2.5 bg-gray-950 rounded-xl text-purple-400 border border-gray-800 shadow-inner"><FileText className="w-5 h-5" /></div>
                                                            <input
                                                                className="bg-transparent text-white font-black uppercase tracking-tight outline-none focus:text-purple-400 text-xs"
                                                                placeholder="Nome do Material"
                                                                value={mat.name}
                                                                onChange={(e) => updateMaterial(mod.id, mat.id, { name: e.target.value })}
                                                            />
                                                        </div>
                                                        <button onClick={() => removeMaterial(mod.id, mat.id)} className="text-gray-700 hover:text-red-500 transition-colors"><Trash className="w-4 h-4" /></button>
                                                    </div>

                                                    <div className="grid gap-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between px-1">
                                                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Hospedagem de Arquivo (Admin):</label>
                                                                {mat.fileName && <span className="text-[8px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-black uppercase">Enviado</span>}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="file"
                                                                    id={`admin-mat-upload-${mat.id}`}
                                                                    className="hidden"
                                                                    accept=".pdf,.epub,.doc,.docx"
                                                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(mod.id, mat.id, e.target.files[0], 'material')}
                                                                />
                                                                <Button
                                                                    onClick={() => document.getElementById(`admin-mat-upload-${mat.id}`)?.click()}
                                                                    className="flex-1 !bg-brand-primary !text-black border-brand-primary hover:!bg-brand-primary/80 !py-3 !text-[10px] uppercase font-black shadow-[0_4px_15_rgba(250,204,21,0.2)]"
                                                                >
                                                                    <Upload className="w-4 h-4 mr-2" /> {mat.fileName ? `Alterar Arquivo (${mat.fileName})` : 'Fazer Upload do PDF/Ebook'}
                                                                </Button>
                                                            </div>
                                                            <p className="text-[11px] text-gray-600 leading-tight">Envie arquivos de até 50MB. Serão entregues diretamente na biblioteca do aluno.</p>
                                                        </div>

                                                        <div className="space-y-2 pt-3 border-t border-gray-800/50">
                                                            <div className="flex items-center justify-between px-1">
                                                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Ou link Externo (Nuvem):</label>
                                                                {mat.url && !mat.fileName && <span className="text-[8px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-black uppercase">Link Ativo</span>}
                                                            </div>
                                                            <div className="relative">
                                                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                                                <input
                                                                    className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none focus:border-brand-primary transition-all"
                                                                    placeholder="Google Drive, Dropbox, Notion..."
                                                                    value={mat.url}
                                                                    onChange={(e) => updateMaterial(mod.id, mat.id, { url: e.target.value, fileName: '' })}
                                                                />
                                                            </div>
                                                            <p className="text-[11px] text-gray-600 font-medium">Certifique-se de que o link externo está com a permissão de "Leitura" pública habilitada.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quiz Tool Integration */}
                                    <div className="pt-10 border-t border-gray-800/50">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent to-gray-800"></div>
                                            <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Avaliação e Reciclagem</span>
                                            <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent to-gray-800"></div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                            <div className="p-8 bg-purple-900/10 border border-purple-500/20 rounded-[2.5rem] relative overflow-hidden text-left flex flex-col gap-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/20"><Sparkles className="w-6 h-6 text-purple-400" /></div>
                                                    <div>
                                                        <span className="text-[14px] font-black text-white uppercase tracking-tight block">Gerador Nexus IA</span>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Configuração do Motor</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Nº Perguntas</label>
                                                        <select
                                                            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-purple-500"
                                                            value={aiSettings[mod.id]?.qty || 3}
                                                            onChange={(e) => setAiSettings(prev => ({ ...prev, [mod.id]: { ...(prev[mod.id] || { qty: 3, opts: 4 }), qty: parseInt(e.target.value) } }))}
                                                        >
                                                            {[1, 2, 3, 5, 7, 10].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Questão' : 'Questões'}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Alternativas</label>
                                                        <select
                                                            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-purple-500"
                                                            value={aiSettings[mod.id]?.opts || 4}
                                                            onChange={(e) => setAiSettings(prev => ({ ...prev, [mod.id]: { ...(prev[mod.id] || { qty: 3, opts: 4 }), opts: parseInt(e.target.value) } }))}
                                                        >
                                                            {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Opções</option>)}
                                                        </select>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => generateQuizIA(mod.id, aiSettings[mod.id]?.qty || 3, aiSettings[mod.id]?.opts || 4)}
                                                    disabled={isProcessing}
                                                    className="w-full !py-4 !bg-purple-600 hover:!bg-purple-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl transition-all disabled:opacity-50"
                                                >
                                                    <Sparkles className="w-4 h-4 inline mr-2" /> Gerar Quiz c/ IA
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    const quizId = `quiz-${Date.now()}`;
                                                    addManualQuiz(mod.id);
                                                    setTimeout(() => {
                                                        const el = document.getElementById(quizId);
                                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    }, 100);
                                                }}
                                                className="group relative flex flex-col items-start p-8 rounded-[2.5rem] transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                                            >
                                                {/* Premium Background Layer */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black border border-gray-800 group-hover:border-brand-primary/30 transition-colors duration-500"></div>
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(250,204,21,0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                                {/* Content Layer */}
                                                <div className="relative z-10 w-full">
                                                    <div className="flex items-center justify-between mb-8">
                                                        <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 shadow-inner group-hover:scale-110 group-hover:border-brand-primary/50 transition-all duration-500">
                                                            <Pencil className="w-8 h-8 text-gray-600 group-hover:text-brand-primary" />
                                                        </div>
                                                        <div className="bg-gray-950/50 backdrop-blur-sm border border-gray-800 px-3 py-1.5 rounded-full">
                                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest group-hover:text-brand-primary transition-colors">Sem Custo</span>
                                                        </div>
                                                    </div>

                                                    <span className="text-xl font-black text-white uppercase tracking-tight block mb-2 group-hover:text-brand-primary transition-colors duration-300">Editor Manual</span>
                                                    <p className="text-[11px] text-gray-500 leading-relaxed font-medium group-hover:text-gray-400 transition-colors">
                                                        Construa sua avaliação do zero com controle total sobre questões, alternativas e pesos. Perfeito para certificações personalizadas.
                                                    </p>

                                                    <div className="mt-8 flex items-center gap-3 text-xs font-black text-brand-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                                        Começar a criar <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>

                                                {/* Decorative Corner Element */}
                                                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl group-hover:bg-brand-primary/10 transition-colors"></div>
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            {(mod.quizzes || (mod.quiz ? [mod.quiz] : [])).map((q: any, qIdx: number) => (
                                                <div id={q.id} key={q.id} className="bg-gradient-to-br from-brand-primary/10 to-transparent border border-brand-primary/30 p-8 rounded-[3rem] relative overflow-hidden transition-all duration-500 hover:border-brand-primary/50 scroll-mt-20">
                                                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Target className="w-24 h-24 text-brand-primary" /></div>
                                                    <div className="flex justify-between items-center mb-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 flex items-center justify-center bg-brand-primary text-black font-black rounded-xl text-xs">{qIdx + 1}</div>
                                                            <div>
                                                                <input
                                                                    className="text-sm font-black text-white uppercase tracking-tight bg-transparent outline-none focus:text-brand-primary transition-colors border-b border-gray-800"
                                                                    value={q.title}
                                                                    onChange={(e) => {
                                                                        const newQuizzes = [...(mod.quizzes || [])];
                                                                        newQuizzes[qIdx] = { ...q, title: e.target.value };
                                                                        updateModule(mod.id, { quizzes: newQuizzes });
                                                                    }}
                                                                />
                                                                <p className="text-[11px] text-gray-500 uppercase font-black tracking-widest mt-1">Status: Ativo no Player • {q.questions?.length} Questões</p>
                                                            </div>
                                                        </div>
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); removeQuiz(mod.id, q.id); }} className="relative z-20 bg-red-900/20 text-red-400 text-[10px] font-black uppercase px-4 py-2 rounded-xl border border-red-500/20 hover:bg-red-900/40 transition-all">Remover Quiz</button>
                                                    </div>
                                                    <div className="grid gap-6">
                                                        {q.questions.map((question: any, questIdx: number) => (
                                                            <div key={question.id} className="bg-gray-950/50 p-6 rounded-2xl border border-gray-800 group hover:border-brand-primary/30 transition-all">
                                                                <div className="flex gap-4 items-start mb-4">
                                                                    <span className="text-brand-primary font-black text-xs mt-1">{questIdx + 1}.</span>
                                                                    <input
                                                                        className="bg-transparent w-full text-sm text-white font-bold outline-none border-b border-transparent focus:border-brand-primary pb-1"
                                                                        value={question.text}
                                                                        placeholder="Pergunta aqui..."
                                                                        onChange={(e) => {
                                                                            const newQuizzes = [...(mod.quizzes || [])];
                                                                            const newQuestions = [...q.questions];
                                                                            newQuestions[questIdx] = { ...question, text: e.target.value };
                                                                            newQuizzes[qIdx] = { ...q, questions: newQuestions };
                                                                            updateModule(mod.id, { quizzes: newQuizzes });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                                                                    {question.options.map((opt: string, oIdx: number) => (
                                                                        <div key={oIdx} className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-gray-800 cursor-pointer hover:border-gray-600 transition-all" onClick={() => {
                                                                            const newQuizzes = [...(mod.quizzes || [])];
                                                                            const newQuestions = [...q.questions];
                                                                            newQuestions[questIdx] = { ...question, correctOptionIndex: oIdx };
                                                                            newQuizzes[qIdx] = { ...q, questions: newQuestions };
                                                                            updateModule(mod.id, { quizzes: newQuizzes });
                                                                        }}>
                                                                            <div className={`w-4 h-4 rounded-full border-2 border-gray-700 flex items-center justify-center transition-all ${question.correctOptionIndex === oIdx ? 'bg-brand-primary border-brand-primary' : ''}`}>
                                                                                {question.correctOptionIndex === oIdx && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                                                                            </div>
                                                                            <input
                                                                                className="bg-transparent flex-1 text-xs text-gray-400 outline-none"
                                                                                value={opt}
                                                                                placeholder={`Opção ${oIdx + 1}`}
                                                                                onChange={(e) => {
                                                                                    const newQuizzes = [...(mod.quizzes || [])];
                                                                                    const newQuestions = [...q.questions];
                                                                                    const newOptions = [...question.options];
                                                                                    newOptions[oIdx] = e.target.value;
                                                                                    newQuestions[questIdx] = { ...question, options: newOptions };
                                                                                    newQuizzes[qIdx] = { ...q, questions: newQuestions };
                                                                                    updateModule(mod.id, { quizzes: newQuizzes });
                                                                                }}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="mt-4 flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            const newQuizzes = [...(mod.quizzes || [])];
                                                                            const newQuestions = q.questions.filter((_: any, i: number) => i !== questIdx);
                                                                            newQuizzes[qIdx] = { ...q, questions: newQuestions };
                                                                            updateModule(mod.id, { quizzes: newQuizzes });
                                                                        }}
                                                                        className="text-[10px] font-black uppercase text-red-500/50 hover:text-red-500 transition-colors"
                                                                    >
                                                                        Remover Questão
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            onClick={() => {
                                                                const newQuizzes = [...(mod.quizzes || [])];
                                                                const newQuestions = [...q.questions, { id: `q${Date.now()}`, text: '', options: ['', '', '', ''], correctOptionIndex: 0 }];
                                                                newQuizzes[qIdx] = { ...q, questions: newQuestions };
                                                                updateModule(mod.id, { quizzes: newQuizzes });
                                                            }}
                                                            variant="secondary"
                                                            className="!py-3 !text-[11px] bg-gray-900 border-gray-800 hover:border-brand-primary/50"
                                                        >
                                                            + Adicionar Questão Manualmente
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </MotionDiv>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center py-6 border-t border-gray-800 mt-8">
                <Button variant="secondary" onClick={onBack} className="!bg-gray-800 border-gray-700 text-gray-500 uppercase font-black text-[10px] tracking-widest !py-4 px-8"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
                <Button onClick={onNext} disabled={!data.modules?.length} className="!px-12 !py-4 shadow-xl uppercase font-black text-[10px] tracking-widest !bg-green-600">Salvar e Avançar</Button>
            </div>
        </div>
    );
};
const CourseCreationWizard: React.FC<{ course: Course | null, onClose: () => void, onSave: () => void }> = ({ course, onClose, onSave }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [nameSuggestions, setNameSuggestions] = useState<{ name: string, reason: string }[]>([]);
    const [isSchoolSetupOpen, setIsSchoolSetupOpen] = useState(false);
    const [hideMenuCustomization, setHideMenuCustomization] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [selectedCategoryPreview, setSelectedCategoryPreview] = useState<any>(null);

    const handleOpenSchoolSetup = (hideMenu: boolean = false) => {
        setHideMenuCustomization(hideMenu);
        setIsSchoolSetupOpen(true);
    };
    const [fileQueue, setFileQueue] = useState<FileQueueItem[]>([]);
    const [addedLinks, setAddedLinks] = useState<string[]>([]);
    const [resourceLink, setResourceLink] = useState('');

    const [data, setData] = useState<any>(course || {
        id: 'new-' + Date.now(),
        title: '',
        description: '',
        coverUrl: '',
        niche: '',
        transformation: '',
        instructor: 'Mestre dos Negócios',
        totalModules: 0,
        category: 'standard',
        knowledgeIdeas: '',
        physicalKit: { enabled: false, items: [] as PhysicalKitItem[] },
        aiConfig: { systemPrompt: MASTER_SYSTEM_PROMPT, specialty: '', voiceId: 'adam', welcomeMessage: 'Olá! Sou seu Mestre Pessoal.', monthlyCreditAllowance: 30 },
        safetyConfig: { showEmergencyButton: true, triggerWarnings: true, therapyType: 'integrative' },
        financialViability: null,
        premiumTools: [] as string[],
        financialModel: { type: 'upfront', dailyCreditLimit: 30 }
    });

    // Local state for Step 6 interactive config
    const [dailyLimit, setDailyLimit] = useState(30);
    const [courseDurationDays, setCourseDurationDays] = useState(30);
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [paymentType, setPaymentType] = useState<'upfront' | 'diluted'>('upfront');

    const currentContext = CATEGORY_CONTEXT[data.category] || CATEGORY_CONTEXT.standard;

    // --- IA ACTIONS ---
    const handleGenerateName = async () => {
        if (!data.niche || !data.transformation) return toast.error("Preencha o nicho e a transformação.");
        setIsProcessing(true);
        try {
            const res = await callMestreIA('course_naming_refiner', {
                objective: data.niche,
                transformation: data.transformation,
                name: data.title || ''
            });
            let content = res.output;
            if (content.includes('```json')) content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(content);
            setNameSuggestions(parsed.suggestions || []);
            toast.success("Sugestões geradas!");
        } catch (e) {
            toast.error("Erro ao gerar nomes.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGenerateCover = async () => {
        if (!data.title || !data.transformation) return toast.error("Título e Transformação obrigatórios.");
        setIsProcessing(true);
        const tid = toast.loading("Nexus IA: Projetando design...");
        try {
            const imageUrl = await generateCourseCoverImage({
                title: data.title,
                niche: data.niche,
                category: data.category,
                transformation: data.transformation
            });
            setData({ ...data, coverUrl: imageUrl });
            toast.success("Capa Gerada!", { id: tid });
        } catch (e) {
            toast.error("Erro ao gerar imagem.", { id: tid });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGeneratePromise = async () => {
        if (!data.transformation) return toast.error("Defina a transformação primeiro.");
        setIsProcessing(true);
        try {
            const res = await callMestreIA('promise_architect', {
                promise: data.description,
                niche: data.niche,
                transformation: data.transformation
            });
            setData({ ...data, description: res.output });
            toast.success("Promessa Refinada!");
        } catch (e) {
            toast.error("Erro ao processar.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGenerateSummary = async () => {
        setIsProcessing(true);
        try {
            const fileNames = fileQueue.map(f => f.file.name).join(', ');
            const links = addedLinks.join(', ');
            const res = await callMestreIA('method_architect', {
                ideas: `${data.description}\n\nArquivos: ${fileNames}\nLinks: ${links}`
            });
            setData({ ...data, knowledgeIdeas: res.output });
            toast.success("Estrutura gerada!");
        } catch (e) {
            toast.error("Erro ao gerar estrutura.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRunFinancialAnalysis = async () => {
        setIsProcessing(true);
        const kitCost = data.physicalKit?.enabled
            ? data.physicalKit.items.reduce((acc: number, item: any) => acc + item.cost, 0)
            : 0;

        const baseLow = 47.90 + kitCost;
        const baseStd = 197.00 + kitCost;
        const baseHigh = 997.00 + kitCost;

        const viability: FinancialViability = {
            suggestedTickets: [
                { label: 'Low Ticket', value: baseLow, reasoning: 'Captura rápida + Custo Kit.' },
                { label: 'Padrão', value: baseStd, reasoning: 'Margem Ideal.' },
                { label: 'High Ticket', value: baseHigh, reasoning: 'Mentoria Completa.' }
            ],
            offerMarketingPackage: true,
            nexusVerdict: `PROJETO COM ALTA VIABILIDADE.\nAnalisamos ${data.niche} e sua estrutura suporta escala imediata.`
        };
        setData({ ...data, financialViability: viability });
        setIsProcessing(false);
        toast.success("Análise CFO Concluída!");
    };

    const handleRunAITask = async (toolId: string, action: () => Promise<void>, costOverride?: number) => {
        setIsProcessing(true);
        try {
            await action();
        } catch (e) {
            console.error(e);
            toast.error("Erro ao processar solicitação de IA.");
        } finally {
            setIsProcessing(false);
        }
    };


    const handleFinalSave = async () => {
        setIsProcessing(true);
        try {
            await saveCourse({ ...data, isPublished: false }); // Goes to 'Setup' tab in ProducerSchoolsPage
            toast.success("Estrutura criada! Finalize o setup na aba 'Minhas Escolas'.");
            onSave();
            onClose();
        } catch (e) {
            toast.error("Erro ao salvar.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-800 w-full max-w-5xl rounded-3xl border border-gray-700 shadow-2xl flex flex-col max-h-[95vh] relative overflow-hidden">

                <div className="p-8 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">
                            <span>Painel Admin</span>
                            <span className="text-gray-700">/</span>
                            <span className="text-brand-primary">Passo {step} de 7</span>
                        </div>
                        <h3 className="text-xl font-black text-white uppercase">Orquestrador de Lançamentos</h3>
                        <div className="flex gap-2 mt-2">
                            {[1, 2, 3, 4, 5, 6, 7].map(s => (
                                <div key={s} className={`h-1 w-8 rounded-full transition-all duration-500 ${s <= step ? 'bg-brand-primary shadow-[0_0_10px_#FACC15]' : 'bg-gray-700'}`}></div>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"><XIcon className="w-6 h-6" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    {step === 1 && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="text-center mb-8">
                                <h4 className="text-white font-black text-3xl uppercase tracking-wide mb-2">Qual Será Seu Próximo Lançamento de Sucesso?</h4>
                                <p className="text-gray-400 text-sm">Escolha o formato ideal para transformar seu conhecimento em um ativo digital.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {CATEGORIES_LIST.map(cat => (
                                    <div
                                        key={cat.id}
                                        onClick={() => setSelectedCategoryPreview(cat)}
                                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-4 items-start bg-gray-900 border-gray-700 hover:border-brand-primary group hover:shadow-2xl`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl bg-gray-800 border border-gray-700 text-${cat.color}-400 shadow-inner group-hover:scale-110 transition-transform`}><cat.icon className="w-8 h-8" /></div>
                                            <p className="text-base font-black text-white uppercase tracking-wide">{cat.label}</p>
                                        </div>
                                        <p className="text-sm text-gray-400 font-medium leading-relaxed group-hover:text-gray-300">{cat.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
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
                                            {NICHOS_BY_CATEGORY[data.category].map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                        <p className="text-xs text-gray-500 ml-1">Isso define o "tom de voz" da IA na geração de conteúdo.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-white uppercase tracking-widest block ml-1">Transformação Central (O Novo Eu)*</label>
                                        <textarea
                                            className="w-full bg-gray-900 border border-gray-600 rounded-2xl p-4 text-white text-base h-32 outline-none focus:border-brand-primary resize-none transition-colors"
                                            value={data.transformation}
                                            onChange={e => setData({ ...data, transformation: e.target.value })}
                                            placeholder='Ex: "A pessoa sairá do zero até faturar seus primeiros R$ 10k em 30 dias..."'
                                        />
                                        <p className="text-xs text-gray-500 ml-1 italic">Dica: Fale do RESULTADO final na vida do aluno, não do conteúdo das aulas.</p>
                                    </div>
                                    <div className="space-y-4 pt-6 border-t border-gray-700">
                                        <Input label="Nome Principal do Curso*" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} placeholder={currentContext.titlePlaceholder} />
                                        <Button onClick={handleGenerateName} isLoading={isProcessing} className="w-full !py-3 !text-[10px] font-black uppercase tracking-widest !bg-purple-600 shadow-xl hover:scale-[1.02] transition-transform">
                                            <Sparkles className="w-4 h-4 mr-2" /> Sugerir Nomes Magnéticos c/ IA
                                        </Button>
                                        {nameSuggestions.length > 0 && (
                                            <div className="grid gap-2 mt-4 bg-gray-900/50 p-4 rounded-2xl border border-purple-500/20">
                                                {nameSuggestions.map((n, i) => (
                                                    <button key={i} onClick={() => setData({ ...data, title: n.name })} className="text-left p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs border border-gray-700 transition-colors group">
                                                        <div className="flex justify-between items-center"><span className="font-bold text-white group-hover:text-brand-primary">{n.name}</span><ChevronRight className="w-3 h-3 text-gray-600" /></div>
                                                        <p className="text-[9px] text-gray-500 mt-1">{n.reason}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <label className="text-sm font-black text-white uppercase tracking-widest block ml-1">Identidade Visual (Capa)</label>
                                    <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 flex flex-col items-center justify-center text-center relative h-64 group overflow-hidden hover:border-brand-primary transition-colors shadow-2xl">
                                        {data.coverUrl ? (
                                            <div className="w-full h-full relative">
                                                <img src={data.coverUrl} className="w-full h-full object-cover rounded-xl shadow-lg" alt="Preview" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                                    <span className="text-white font-bold uppercase text-xs flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Trocar Imagem</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700 group-hover:border-brand-primary group-hover:text-brand-primary transition-colors text-gray-500">
                                                    <Camera className="w-8 h-8" />
                                                </div>
                                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Capa do Treinamento</p>
                                                <p className="text-[10px] text-gray-600">Arraste ou clique para subir</p>
                                            </div>
                                        )}
                                        <input type="file" className="hidden" id="admin-cover-up" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onloadend = () => setData({ ...data, coverUrl: r.result as string }); r.readAsDataURL(f); } }} />
                                        <label htmlFor="admin-cover-up" className="absolute inset-0 cursor-pointer"></label>
                                    </div>
                                    <Button onClick={handleGenerateCover} isLoading={isProcessing} className="w-full !py-4 !text-xs font-black uppercase !bg-purple-600 shadow-xl hover:scale-[1.02] transition-transform">
                                        <Camera className="w-4 h-4 mr-2" /> Gerar Capa de Alta Conversão (IA)
                                    </Button>
                                    <p className="text-center text-[10px] text-gray-500">A IA analisará seu nicho para criar uma imagem que conecta.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest ml-1">Promessa Central</h4>
                            <textarea
                                className="w-full bg-gray-900 border border-gray-700 rounded-[2rem] p-8 text-white text-lg h-52 outline-none focus:border-brand-primary"
                                value={data.description}
                                onChange={e => setData({ ...data, description: e.target.value })}
                                placeholder={currentContext.promisePlaceholder}
                            />
                            <Button onClick={handleGeneratePromise} isLoading={isProcessing} className="!bg-purple-600 hover:!bg-purple-500 font-black uppercase text-[10px] tracking-widest !py-3 px-6 shadow-xl">
                                <Zap className="w-4 h-4 mr-2" /> Otimizar Promessa com Nexus IA
                            </Button>
                        </div>
                    )}

                    {step === 4 && (
                        data.category === 'standard' ? (
                            <Step4TraditionalContent
                                data={data}
                                setData={setData}
                                onBack={() => setStep(3)}
                                onNext={() => setStep(5)}
                                handleRunAITask={handleRunAITask}
                                isProcessing={isProcessing}
                            />
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                                <div className="bg-gray-900 border border-gray-700 rounded-[2rem] p-6 space-y-6 flex flex-col">
                                    <h4 className="text-white font-bold mb-1 flex items-center gap-2 uppercase text-xs tracking-widest">
                                        <CloudUpload className="w-4 h-4 text-blue-400" /> Base de Conhecimento
                                    </h4>

                                    {/* Upload Guide InfoCard */}
                                    <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl flex gap-3">
                                        <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                        <div className="text-xs text-blue-200 space-y-2">
                                            <p className="font-bold">Como funciona a clonagem:</p>
                                            <ul className="list-disc pl-4 space-y-1 text-blue-300">
                                                <li><strong className="text-white">1º Passo:</strong> Suba seus PDFs, Áudios ou Links.</li>
                                                <li><strong className="text-white">2º Passo:</strong> A IA vai ler tudo e estruturar os módulos.</li>
                                                <li><strong className="text-white">Formatos:</strong> PDF, MP3 (Aulas gravadas), MP4, YouTube.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar max-h-[400px]">
                                        {/* Links List */}
                                        {addedLinks.map((link, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-purple-900/20 p-3 rounded-xl border border-purple-500/30">
                                                <div className="flex items-center gap-3">
                                                    <LinkIcon className="w-4 h-4 text-purple-400" />
                                                    <span className="text-xs text-purple-200 font-bold truncate w-40">{link}</span>
                                                </div>
                                                <button onClick={() => setAddedLinks(addedLinks.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300"><Trash className="w-4 h-4" /></button>
                                            </div>
                                        ))}

                                        {/* Files List */}
                                        {fileQueue.map(item => (
                                            <div key={item.id} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-4 h-4 text-white" />
                                                    <span className="text-xs text-white font-bold truncate w-40">{item.file.name}</span>
                                                </div>
                                                <button onClick={() => setFileQueue(fileQueue.filter(f => f.id !== item.id))} className="text-red-500"><Trash className="w-4 h-4" /></button>
                                            </div>
                                        ))}

                                        {/* Upload Area */}
                                        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-2xl cursor-pointer hover:bg-blue-500/5 hover:border-blue-500/30 transition-all group relative overflow-hidden bg-gray-950/30">
                                            <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.txt,.mp3,.mp4,.mov,.wav" onChange={e => {
                                                const files = Array.from(e.target.files || []) as any[];
                                                setFileQueue([...fileQueue, ...files.map(f => ({ id: `f-${Date.now()}-${Math.random()}`, file: f, status: 'completed', progress: 100, type: f.type.includes('video') ? 'video' : f.type.includes('audio') ? 'audio' : 'pdf' }))]);
                                            }} />

                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-blue-600/20 w-40 h-40 rounded-full blur-3xl"></div>
                                            </div>

                                            <div className="relative z-10 flex flex-col items-center">
                                                <div className="bg-gray-800 p-4 rounded-full border border-gray-700 mb-4 group-hover:scale-110 transition-transform shadow-lg">
                                                    <PlusCircle className="w-8 h-8 text-brand-primary" />
                                                </div>
                                                <span className="text-xs font-black text-white uppercase tracking-widest mb-1 group-hover:text-brand-primary transition-colors">ADICIONAR MATERIAIS</span>
                                                <p className="text-[10px] text-gray-500">Arraste ou clique para subir</p>
                                            </div>
                                        </label>

                                        {/* Link Input */}
                                        <div className="flex gap-2 p-1 bg-gray-950/50 border border-gray-700 rounded-xl">
                                            <div className="flex-1 px-3 flex items-center">
                                                <LinkIcon className="w-4 h-4 text-purple-400 mr-2" />
                                                <input
                                                    type="text"
                                                    className="bg-transparent w-full text-xs text-white h-10 outline-none placeholder-gray-600"
                                                    placeholder="Cole um link externo (YouTube, Drive, Site...)"
                                                    value={resourceLink}
                                                    onChange={e => setResourceLink(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && resourceLink) {
                                                            setAddedLinks([...addedLinks, resourceLink]);
                                                            setResourceLink('');
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <Button
                                                onClick={() => { if (resourceLink) { setAddedLinks([...addedLinks, resourceLink]); setResourceLink(''); } }}
                                                className="!py-2 !px-4 !bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:!bg-purple-600 hover:text-white"
                                            >
                                                <PlusCircle className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 flex flex-col">
                                    {/* Physical Kit Section (Moved Up) */}
                                    <div className="mb-4">
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
                                                        {data.physicalKit.items.map((item: PhysicalKitItem, idx: number) => (
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

                                                                const newItem: PhysicalKitItem = {
                                                                    id: `kit-${Date.now()}`,
                                                                    name,
                                                                    description: desc,
                                                                    cost,
                                                                    requiresOCR: ocr
                                                                };

                                                                setData({ ...data, physicalKit: { ...data.physicalKit, items: [...data.physicalKit.items, newItem] } });

                                                                // Clear inputs
                                                                (document.getElementById('newItemName') as HTMLInputElement).value = '';
                                                                (document.getElementById('newItemDesc') as HTMLInputElement).value = '';
                                                                (document.getElementById('newItemCost') as HTMLInputElement).value = '';
                                                                (document.getElementById('newItemOCR') as HTMLInputElement).checked = false;
                                                            }}
                                                        >
                                                            <PlusCircle className="w-4 h-4 mr-2" /> Adicionar Item ao Kit
                                                        </Button>
                                                    </div>
                                                </MotionDiv>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Grade Curricular Section (Moved Down) */}
                                    <div className="mt-8 pt-6 border-t border-gray-700 space-y-4">
                                        <label className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <Brain className="w-4 h-4 text-brand-primary" /> Grade Curricular Gerada
                                        </label>
                                        <div className="bg-gray-950 border border-gray-700 rounded-[2rem] p-6 text-white text-sm h-[380px] overflow-y-auto custom-scrollbar relative flex-1">
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
                                        <Button onClick={handleGenerateSummary} isLoading={isProcessing} disabled={fileQueue.length === 0 && addedLinks.length === 0} className="w-full !bg-purple-600 font-black uppercase text-[10px] tracking-widest shadow-xl !py-4 hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:hover:scale-100">
                                            <Sparkles className="w-4 h-4 mr-2" /> Gerar Estrutura Pedagógica (IA)
                                        </Button>
                                        <p className="text-center text-[10px] text-gray-500">Requer pelo menos 1 arquivo ou link.</p>
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    {step === 5 && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="text-center mb-8">
                                <h4 className="text-white font-black text-3xl uppercase tracking-wide mb-2">Personalize sua Escola</h4>
                                <p className="text-gray-400 text-sm">Defina a identidade visual e o domínio da sua plataforma.</p>
                            </div>

                            <div className="bg-gray-900 border border-gray-700 rounded-[2.5rem] p-8">
                                {/* Identity Config */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                                <Monitor className="w-5 h-5 text-purple-400" /> Identidade Visual
                                            </h4>
                                            <p className="text-xs text-gray-400 mb-4">Seu domínio e branding.</p>
                                            {data.schoolSubdomain ? (
                                                <div className="bg-green-900/20 p-3 rounded-lg border border-green-500/20 mb-4">
                                                    <p className="text-xs text-green-400 font-bold flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Configurado
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 break-all">{data.schoolSubdomain}.mestre.com</p>
                                                </div>
                                            ) : (
                                                <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/20 mb-4">
                                                    <p className="text-xs text-yellow-500 font-bold flex items-center gap-1">
                                                        <ShieldAlert className="w-3 h-3" /> Pendente
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        {/* STEP 5 UPDATE: GREEN BUTTON */}
                                        <Button
                                            onClick={() => handleOpenSchoolSetup(true)}
                                            className="w-full text-xs font-bold uppercase !bg-green-600 hover:!bg-green-500 text-white shadow-lg shadow-green-900/20"
                                        >
                                            Editar Configuração
                                        </Button>
                                    </div>

                                    {/* Preview Button */}
                                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col justify-center items-center text-center">
                                        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-gray-700">
                                            <Eye className="w-8 h-8 text-brand-primary" />
                                        </div>
                                        <h4 className="font-bold text-white mb-1">Visualizar Escola</h4>
                                        <p className="text-[10px] text-gray-500 mb-4 px-4">Veja como sua escola está ficando para os alunos antes de publicar.</p>
                                        <Button onClick={() => window.open('/painel', '_blank')} className="w-full !py-3 !text-xs !bg-brand-primary text-black border-none hover:opacity-90">
                                            Acessar Preview
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-gray-900 border border-gray-700 rounded-[2.5rem] p-8">
                                <div className="mb-10">
                                    <div className="flex justify-between items-end mb-6">
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-2"><Zap className="w-6 h-6 text-brand-primary" /> Turbine sua Escola</h3>
                                            <p className="text-gray-400 text-sm">Ferramentas de alta conversão para maximizar o LTV.</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleOpenSchoolSetup(false)}
                                                className="!bg-blue-900/20 border-blue-500/30 text-blue-300 hover:bg-blue-900/40 text-[9px] font-black uppercase px-3 py-1"
                                            >
                                                <Settings className="w-3 h-3 mr-1" /> Personalizar Portal
                                            </Button>
                                            <div className="hidden md:block">
                                                <span className="text-[10px] bg-brand-primary text-black font-black px-3 py-1 rounded-full uppercase">Opcional</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 1. CREDIT CONTROL (First Item) */}
                                    <CreditControlCard
                                        limit={dailyLimit}
                                        onChange={(val) => {
                                            setDailyLimit(val);
                                            setData({ ...data, aiConfig: { ...data.aiConfig, monthlyCreditAllowance: val } });
                                        }}
                                        courseDuration={courseDurationDays}
                                        onDurationChange={(val) => setCourseDurationDays(val)}
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
                                            selectedTools={selectedTools as any[]}
                                            onToggle={(id) => {
                                                const newTools = selectedTools.includes(id)
                                                    ? selectedTools.filter(t => t !== id)
                                                    : [...selectedTools, id];
                                                setSelectedTools(newTools);
                                                setData({ ...data, premiumTools: newTools });
                                            }}
                                        />
                                    </div>

                                    {/* 4. COST SUMMARY (Last Item) */}
                                    <CostSummaryCard
                                        selectedTools={selectedTools as any[]}
                                        paymentType={paymentType}
                                        setPaymentType={(t) => {
                                            setPaymentType(t);
                                            setData({ ...data, financialModel: { ...data.financialModel, type: t } });
                                        }}
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
                                            <h4 className="text-xl font-black text-white uppercase italic">Minhas Escolas</h4>
                                            <p className="text-sm text-gray-300 max-w-md">
                                                Entenda o poder do ecossistema. Veja todas as páginas e ferramentas que compõem a sua escola e como cada uma trabalha para reter seu aluno.
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => window.open('/bonus-schools-preview', '_blank')}
                                            className="!bg-white !text-purple-900 font-black uppercase shadow-xl hover:scale-105 transition-transform"
                                        >
                                            <Eye className="w-4 h-4 mr-2" /> Ver Todas as Páginas
                                        </Button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {step === 7 && (
                        <div className="space-y-8 animate-fade-in pb-20">

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

                            <div className="bg-gray-900 border-2 border-brand-primary/20 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
                                <div className="absolute -top-10 -right-10 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                                <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                                    <div className="flex-1">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-[10px] font-black uppercase mb-3">
                                            <Brain className="w-3 h-3" /> FCO Engine 2.0
                                        </div>
                                        <h3 className="text-white text-3xl font-black leading-tight mb-4 animate-fade-in">
                                            Consultoria de Viabilidade Financeira
                                        </h3>
                                        <p className="text-gray-300 text-sm max-w-lg leading-relaxed">
                                            O Mestre IA analisará todos os parâmetros do seu projeto (custos de servidor, tokens de IA, taxas e infraestrutura) para determinar a <strong>saúde financeira</strong> do seu curso.
                                        </p>
                                    </div>

                                    {!data.financialViability && (
                                        <Button
                                            onClick={handleRunFinancialAnalysis}
                                            isLoading={isProcessing}
                                            className="!bg-brand-primary text-black font-black uppercase shadow-[0_0_30px_rgba(250,204,21,0.3)] hover:scale-105 transition-transform"
                                        >
                                            <Calculator className="w-5 h-5 mr-2" /> Gerar Relatório Completo
                                        </Button>
                                    )}
                                </div>

                                {data.financialViability && (
                                    <div className="mt-10 animate-fade-in-up">
                                        <div className="border border-gray-700 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8">

                                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-700">
                                                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border-2 border-green-500">
                                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black text-white uppercase">Viabilidade Confirmada</h4>
                                                    <p className="text-sm text-green-400 font-medium">Seu projeto tem alto potencial de lucro com a estrutura atual.</p>
                                                </div>
                                            </div>

                                            <h5 className="text-xs font-black text-gray-500 uppercase mb-4">Sugestão de Precificação (Margem Otimizada)</h5>

                                            {/* Suggested Tickets */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                                {data.financialViability.suggestedTickets.map((t: any, i: number) => (
                                                    <div key={i} className="bg-gray-900/80 p-5 rounded-xl border border-gray-700 relative group hover:border-brand-primary/50 transition-colors">
                                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">{t.label}</p>
                                                        <p className="text-3xl font-black text-white">R$ {t.value.toFixed(2)}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Cost Breakdown (Unit Economics) */}
                                            <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
                                                <div className="bg-gray-800 px-6 py-3 border-b border-gray-700 flex justify-between items-center">
                                                    <h5 className="text-xs font-black text-white uppercase flex items-center gap-2">
                                                        <Target className="w-4 h-4 text-red-400" /> Unit Economics (Custo por Aluno)
                                                    </h5>
                                                    <span className="text-[10px] text-gray-400 font-mono">BASE DE CÁLCULO</span>
                                                </div>

                                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-800">
                                                            <span className="text-gray-400">Taxa de Plataforma (LucPay)</span>
                                                            <span className="text-white font-bold">10%</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-800">
                                                            <span className="text-gray-400">Setup Tecnológico (IA + Créditos)</span>
                                                            <span className="text-white font-bold">R$ 27,90 <span className="text-[9px] text-gray-600 font-normal">/aluno</span></span>
                                                        </div>
                                                        {data.premiumTools && data.premiumTools.length > 0 && (
                                                            <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-800">
                                                                <span className="text-gray-400">Ferramentas Extras</span>
                                                                <span className="text-yellow-500 font-bold">+ Variável</span>
                                                            </div>
                                                        )}
                                                        {data.physicalKit?.enabled && (
                                                            <div className="flex justify-between items-center text-xs bg-red-900/10 p-2 rounded border border-red-500/10">
                                                                <span className="text-red-300 font-bold">Custo do Kit Físico</span>
                                                                <span className="text-white font-bold">R$ {data.physicalKit.items.reduce((acc: number, item: any) => acc + item.cost, 0).toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-center">
                                                        <div className="text-center">
                                                            <p className="text-[10px] text-gray-500 uppercase mb-2">Ponto de Equilíbrio (Break-Even)</p>
                                                            <div className="text-4xl font-black text-white mb-1">~5 <span className="text-sm text-gray-600">vendas</span></div>
                                                            <p className="text-[10px] text-gray-600">Para cobrir custos de setup inicial de ferramentas (se houver).</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {data.financialViability && (
                                <div className="space-y-6 animate-fade-in group">
                                    <label className="flex items-center gap-5 p-6 bg-green-900/10 rounded-2xl border border-green-500/30 cursor-pointer transition-all hover:bg-green-900/20 hover:border-green-500 hover:shadow-lg hover:shadow-green-900/20">
                                        <div className="relative">
                                            <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="peer sr-only" />
                                            <div className="w-6 h-6 border-2 border-gray-400 rounded transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary flex items-center justify-center">
                                                <CheckCircle className="w-4 h-4 text-black opacity-0 peer-checked:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-lg font-black text-white uppercase tracking-tight block mb-1">Aprovar e Publicar Escola</span>
                                            <p className="text-xs text-gray-400 group-hover:text-gray-300">Confirmo que revisei a análise financeira e autorizo a criação da infraestrutura.</p>
                                        </div>
                                    </label>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-gray-700 bg-gray-900 flex justify-between items-center rounded-b-3xl">
                    <Button variant="secondary" onClick={() => { if (step > 1) setStep((step - 1) as any); else onClose(); }} className="!bg-gray-900 border-gray-700 text-gray-500">Voltar</Button>

                    {step === 6 && (
                        <Button
                            variant="secondary"
                            onClick={() => handleOpenSchoolSetup(false)}
                            className="!bg-blue-900/20 border-blue-500/30 text-blue-300 hover:bg-blue-900/40 text-xs font-bold uppercase"
                        >
                            <Monitor className="w-4 h-4 mr-2" /> Personalizar Portal
                        </Button>
                    )}

                    {step < 7 ? (
                        <Button onClick={() => setStep((step + 1) as any)} disabled={step === 2 && !data.title} className="!px-12 !py-4 shadow-xl">Avançar</Button>
                    ) : (
                        <Button onClick={handleFinalSave} isLoading={isProcessing} disabled={!accepted} className="!px-12 !py-4 !bg-green-600 font-black shadow-2xl">CONFIRMAR CRIAÇÃO</Button>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {selectedCategoryPreview && (
                    <div className="fixed inset-0 bg-black/98 flex items-center justify-center z-[200] p-4 overflow-y-auto">
                        <MotionDiv
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className={`bg-gray-800 w-full max-w-2xl rounded-[3rem] border-2 border-${selectedCategoryPreview.color}-500/50 shadow-[0_0_60px_rgba(0,0,0,1)] p-8 md:p-12 relative overflow-hidden`}
                        >
                            <div className="relative z-10 text-center">
                                <div className={`w-24 h-24 bg-${selectedCategoryPreview.color}-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-${selectedCategoryPreview.color}-500/30`}>
                                    <selectedCategoryPreview.icon className={`w-12 h-12 text-${selectedCategoryPreview.color}-400`} />
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-wide mb-4">{selectedCategoryPreview.label}</h3>
                                <p className="text-gray-300 text-base leading-relaxed mb-10">{selectedCategoryPreview.longDesc}</p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button variant="secondary" onClick={() => setSelectedCategoryPreview(null)} className="flex-1">Voltar</Button>
                                    <Button onClick={() => { setData({ ...data, category: selectedCategoryPreview.id as any }); setSelectedCategoryPreview(null); setStep(2); }} className={`flex-1 !bg-${selectedCategoryPreview.color}-600`}>Selecionar</Button>
                                </div>
                            </div>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>

            <SchoolSetupModal
                isOpen={isSchoolSetupOpen}
                onClose={() => setIsSchoolSetupOpen(false)}
                onSuccess={(s) => { setData({ ...data, schoolSubdomain: s.subdomain }); setIsSchoolSetupOpen(false); }}
                niche={data.niche}
                hideMenuCustomization={hideMenuCustomization}
                selectedTools={data.premiumTools || []}
            />
        </div>
    );
};

const AdminTrainingPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [viewMode, setViewMode] = useState<'courses' | 'modules'>('courses');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<TrainingModule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        const [c, m] = await Promise.all([getCourses(), getTrainingModules()]);
        setCourses(c);
        setModules(m);
        setLoading(false);
    };

    const handleManageCourse = (course: Course) => {
        setSelectedCourse(course);
        setViewMode('modules');
    };

    const handleDeleteCourse = async (id: string) => {
        if (confirm("Tem certeza?")) {
            await deleteCourse(id);
            loadData();
            toast.success("Curso removido.");
        }
    };

    const handleAddModule = () => {
        if (!selectedCourse) return;
        const newMod: TrainingModule = { id: `mod-${Date.now()}`, courseId: selectedCourse.id, title: "Novo Módulo", order: modules.length + 1, lessons: [] };
        const updated = [...modules, newMod];
        setModules(updated);
        updateTrainingData(updated);
    };

    if (loading) return <div className="flex justify-center p-20"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-8 pb-20">
            {viewMode === 'courses' ? (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Gestão de Treinamentos</h1>
                            <p className="text-gray-400 text-sm">Crie e gerencie a grade curricular dos seus ativos.</p>
                        </div>
                        <Button onClick={() => { setEditingCourse(null); setIsWizardOpen(true); }} className="!bg-green-600 hover:!bg-green-500 font-bold shadow-lg">
                            <PlusCircle className="w-5 h-5 mr-2" /> Orquestrar Novo Curso
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <Card key={course.id} className="flex flex-col overflow-hidden group hover:border-brand-primary transition-colors p-0 rounded-[2rem] bg-gray-800 border-gray-700 shadow-xl">
                                <div className="h-44 bg-gray-900 flex items-center justify-center relative overflow-hidden">
                                    {course.coverUrl ? <img src={course.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Capa" /> : <BookOpen className="w-12 h-12 text-gray-700" />}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <span className={`bg-black/60 backdrop-blur-md text-[10px] text-white px-2 py-1 rounded font-bold uppercase border border-white/20 flex items-center gap-1`}>
                                            {course.isPublished ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Clock className="w-3 h-3 text-yellow-400" />}
                                            {course.isPublished ? 'PUBLICADO' : (course.financialViability ? 'EM SETUP' : 'RASCUNHO')}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="font-bold text-white text-lg line-clamp-1">{course.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[32px]">{course.transformation || 'Aguardando publicação...'}</p>
                                    <div className="mt-6 grid grid-cols-2 gap-2 pt-4 border-t border-gray-700">
                                        <Button variant="secondary" className="!text-[10px] font-black uppercase !py-2 !bg-gray-700 border-gray-600" onClick={() => handleManageCourse(course)}>Módulos</Button>
                                        <Button variant="secondary" className="!text-[10px] font-black uppercase !py-2 !bg-red-900/20 text-red-400 border-red-900/50" onClick={() => handleDeleteCourse(course.id)}>Excluir</Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <div className="flex items-center gap-4 mb-6">
                        <button onClick={() => setViewMode('courses')} className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 text-gray-400 border border-gray-700">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{selectedCourse?.title}</h2>
                            <p className="text-xs text-gray-400">Gerenciamento de Grade e Aulas</p>
                        </div>
                    </div>
                    <Card className="p-6 bg-gray-800 border-gray-700 rounded-[2rem] shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-bold flex items-center gap-2 text-lg uppercase tracking-tight"><List className="w-5 h-5 text-brand-primary" /> Módulos do Treinamento</h3>
                            <Button onClick={handleAddModule} className="!bg-brand-primary text-black font-bold uppercase text-xs">+ Novo Módulo</Button>
                        </div>
                        <div className="space-y-4">
                            {modules.filter(m => m.courseId === selectedCourse?.id).map(mod => (
                                <div key={mod.id} className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex justify-between items-center group hover:border-brand-primary/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-800 p-2 rounded-lg border border-gray-700"><Layers className="w-4 h-4 text-brand-primary" /></div>
                                        <span className="text-white font-bold text-sm uppercase tracking-tight">{mod.title}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="secondary" className="!py-1.5 !text-[10px] font-black uppercase border-gray-700">Aulas</Button>
                                        <button className="p-2 text-gray-600 hover:text-red-400 transition-colors"><Trash className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
            {isWizardOpen && <CourseCreationWizard course={editingCourse} onClose={() => setIsWizardOpen(false)} onSave={loadData} />}
        </div>
    );
};

export default AdminTrainingPage;
