
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../components/Card';
import {
    TrendingUp, BarChart3, DollarSign, Target, CheckCircle,
    Zap, Brain, Trophy, ActivityIcon,
    BookOpen, ShieldCheck,
    ArrowRight, ArrowLeft, Download, HeartPulse, Scale, Clock, History, Calendar
} from '../../../components/Icons';
import { useAlunoData } from '../../../hooks/useAlunoData';
import Button from '../../../components/Button';
import toast from 'react-hot-toast';
import { Student } from '../../../types';
import { getStudentCourses } from '../../../services/mockFirebase';

interface MeusResultadosProps {
    onBack?: () => void;
    studentOverride?: Student;
}

// Configuration for Adaptive Metrics based on Niche is handled here
const METRIC_CONFIG: Record<string, any> = {
    standard: {
        primaryMetric: { label: 'Sucesso Financeiro', icon: DollarSign, color: 'text-green-500', sublabel: 'Vendas Realizadas' },
        progressMetric: { label: 'Estudo Teórico', icon: BookOpen, color: 'text-blue-500', sublabel: 'Aulas Concluídas' },
        consistencyMetric: { label: 'Consistência', icon: ActivityIcon, color: 'text-orange-500', sublabel: 'Volume de Postagens' },
        aiMetric: { label: 'Execução IA', icon: Brain, color: 'text-purple-500', sublabel: 'Sugestões Aplicadas' },
        title: 'Performance 50X',
        subtitle: 'Auditoria de resultados e engajamento do usuário.',
        benchmarkLabel: 'ROI Real'
    },
    therapy_master: {
        primaryMetric: { label: 'Bem-Estar', icon: HeartPulse, color: 'text-pink-500', sublabel: 'Humor Médio' },
        progressMetric: { label: 'Sessões', icon: BookOpen, color: 'text-blue-400', sublabel: 'Módulos Terapêuticos' },
        consistencyMetric: { label: 'Jornada', icon: Calendar, color: 'text-purple-400', sublabel: 'Dias Consecutivos' },
        aiMetric: { label: 'Insights', icon: Brain, color: 'text-teal-400', sublabel: 'Reflexões Geradas' },
        title: 'Jornada Interior',
        subtitle: 'Monitoramento de evolução emocional e consistência.',
        benchmarkLabel: 'Estabilidade Emocional'
    },
    slimming_master: {
        primaryMetric: { label: 'Bio-Evolução', icon: Scale, color: 'text-emerald-500', sublabel: 'Metas Físicas' },
        progressMetric: { label: 'Protocolo', icon: ActivityIcon, color: 'text-blue-500', sublabel: 'Fases Concluídas' },
        consistencyMetric: { label: 'Disciplina', icon: CheckCircle, color: 'text-orange-500', sublabel: 'Treinos Realizados' },
        aiMetric: { label: 'Nutri AI', icon: Brain, color: 'text-green-400', sublabel: 'Ajustes na Dieta' },
        title: 'Corpo & Mente',
        subtitle: 'Métricas de transformação física e adesão ao plano.',
        benchmarkLabel: 'Redução de Medidas'
    },
    personal_master: {
        primaryMetric: { label: 'Metas Alcançadas', icon: Trophy, color: 'text-yellow-500', sublabel: 'Objetivos Concluídos' },
        progressMetric: { label: 'Mentoria', icon: BookOpen, color: 'text-indigo-500', sublabel: 'Sessões Assistidas' },
        consistencyMetric: { label: 'Foco', icon: Target, color: 'text-red-500', sublabel: 'Ações Diárias' },
        aiMetric: { label: 'Coach IA', icon: Brain, color: 'text-purple-500', sublabel: 'Consultas Realizadas' },
        title: 'Plano de Maestria',
        subtitle: 'Acompanhamento de evolução pessoal e profissional.',
        benchmarkLabel: 'Evolução de Carreira'
    }
};

export const MeusResultados: React.FC<MeusResultadosProps> = ({ onBack, studentOverride }) => {
    const { student: authStudent } = useAlunoData();
    const student = studentOverride || authStudent;
    const [viewMode, setViewMode] = useState<'stats' | 'timeline'>('stats');

    // Detect Course Context (Mock Logic - assumes last accessed course or first published)
    // In real app, this would come from a Context Provider
    const activeCourseId = student?.purchasedCourses?.[0]; // Fallback
    const savedCourses = getStudentCourses(student?.uid || '');
    // Try to find if student is ALSO a producer of a course (self-consumption) or consuming a specific one
    // For now, let's default to 'standard' unless we find specific metadata
    const activeCategory = 'standard'; // Placeholder: Needs 'activeCourse' context to be truly dynamic
    const config = METRIC_CONFIG[activeCategory] || METRIC_CONFIG.standard;

    const stats = useMemo(() => {
        if (!student) return null;

        // Universal Calcs
        const totalLessons = 64;
        const completedLessonsCount = student.completedLessons?.length || 0;
        const trainingProgress = Math.round((completedLessonsCount / totalLessons) * 100);

        // Mock Adaptive Logic based on category
        const aiExecutionRate = 85; // Mock
        const postingConsistency = 72; // Mock
        const primaryScore = 90; // Mock (ROI, Weight Loss %, etc)

        return {
            trainingProgress,
            aiExecutionRate,
            postingConsistency,
            primaryScore,
            benchmarks: {
                avgAiExecution: 80,
                avgPosting: 85,
                avgPrimary: 75
            }
        };
    }, [student]);

    if (!stats) return null;

    const CircularProgress = ({ percent, label, icon: Icon, color, sublabel }: any) => (
        <div className="flex flex-col items-center gap-3 group cursor-pointer">
            <div className="relative w-28 h-28 md:w-36 md:h-36 transition-transform group-hover:scale-105">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800 opacity-50" />
                    <motion.circle
                        cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="8" fill="transparent"
                        strokeDasharray="264"
                        strokeDashoffset={264 - (264 * percent) / 100}
                        animate={{ strokeDashoffset: 264 - (264 * percent) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={color} strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Icon className={`w-6 h-6 md:w-8 md:h-8 ${color} mb-1`} />
                    <span className="text-xl md:text-2xl font-black text-white leading-none">{percent}%</span>
                </div>
            </div>
            <div className="text-center">
                <p className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest group-hover:text-brand-primary transition-colors">{label}</p>
                <p className="text-[9px] text-gray-500 mt-1 font-bold">{sublabel}</p>
            </div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-xl text-gray-400 transition-colors border border-gray-700">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            {config.title}
                        </h1>
                        <p className="text-gray-400 text-sm">{config.subtitle}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => setViewMode('stats')}
                        className={`!px-4 !py-2 text-xs font-bold uppercase ${viewMode === 'stats' ? 'bg-gray-700 text-white' : 'bg-transparent text-gray-500'}`}
                    >
                        <BarChart3 className="w-4 h-4 mr-2" /> Métricas
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setViewMode('timeline')}
                        className={`!px-4 !py-2 text-xs font-bold uppercase ${viewMode === 'timeline' ? 'bg-gray-700 text-white' : 'bg-transparent text-gray-500'}`}
                    >
                        <History className="w-4 h-4 mr-2" /> Histórico
                    </Button>
                    <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span className="text-xs font-bold text-green-400 uppercase tracking-widest hidden md:block">Auditoria Ativa</span>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'stats' ? (
                    <motion.div key="stats" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                        {/* KPI CARD */}
                        <Card className="p-8 bg-gray-800/40 border-gray-700 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
                            <div className="flex items-center gap-2 mb-8 border-b border-gray-700 pb-4">
                                <Target className="w-5 h-5 text-brand-primary" />
                                <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Painel de Evolução do Aluno</h2>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                                <CircularProgress percent={stats.trainingProgress} {...config.progressMetric} />
                                <CircularProgress percent={stats.aiExecutionRate} {...config.aiMetric} />
                                <CircularProgress percent={stats.postingConsistency} {...config.consistencyMetric} />
                                <CircularProgress percent={stats.primaryScore} {...config.primaryMetric} />
                            </div>
                        </Card>

                        {/* COMPARATIVE CHART */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 p-8 border-2 border-brand-primary/20 bg-gray-900 shadow-xl relative overflow-hidden">
                                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                                <div className="flex flex-col h-full">
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-black text-white uppercase mb-2 flex items-center gap-2">
                                            <Trophy className="w-8 h-8 text-brand-primary" /> Trilha de Elite
                                        </h3>
                                        <p className="text-gray-400 text-sm">Comparativo com os top 5% dos alunos.</p>
                                    </div>
                                    <div className="space-y-8 flex-1">
                                        {[
                                            { label: config.aiMetric.label, user: stats.aiExecutionRate, top: stats.benchmarks.avgAiExecution },
                                            { label: config.consistencyMetric.label, user: stats.postingConsistency, top: stats.benchmarks.avgPosting }
                                        ].map((item, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-xs font-bold text-gray-300 uppercase">{item.label}</span>
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase">VOCÊ: <span className="text-brand-primary">{item.user}%</span> vs ELITE: <span className="text-green-500">{item.top}%</span></span>
                                                </div>
                                                <div className="h-7 w-full bg-gray-800 rounded-full overflow-hidden flex relative border border-gray-700">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.user}%` }} className="h-full bg-brand-primary z-10 shadow-[0_0_15px_rgba(250,204,21,0.3)]" />
                                                    <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-green-500 z-20 flex items-center" style={{ left: `${item.top}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl">
                                        <p className="text-xs text-brand-primary leading-relaxed font-bold">
                                            <Zap className="w-4 h-4 inline mr-2" /> Insight Nexus: Você está performando acima da média em {config.aiMetric.label}!
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* DOWNLOAD REPORT */}
                            <Card className="p-6 bg-gray-800 border-gray-700 flex flex-col justify-between shadow-lg">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2 border-b border-gray-700 pb-3">
                                        <Download className="w-4 h-4 text-green-400" /> Relatório Oficial
                                    </h3>
                                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">Baixe o PDF completo com o detalhamento de todo o progresso, certificado parcial e pontos de melhoria identificados pela IA.</p>
                                </div>
                                <div className="mt-6">
                                    <Button className="w-full !py-3 !bg-brand-primary text-black font-black uppercase text-xs shadow-xl" onClick={() => toast.success("Relatório gerado!")}>
                                        <Download className="w-4 h-4 mr-2" /> BAIXAR AGORA
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="timeline" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <Card className="p-0 bg-gray-800 border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-700 bg-gray-900/50">
                                <h3 className="font-bold text-white flex items-center gap-2"><Clock className="w-5 h-5 text-gray-400" /> Linha do Tempo de Atividades</h3>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto p-6 custom-scrollbar space-y-6">
                                {[
                                    { date: 'Hoje', time: '14:30', action: 'Concluiu Aula: "Mindset 10x"', type: 'lesson', icon: CheckCircle, color: 'text-green-500' },
                                    { date: 'Hoje', time: '10:15', action: 'Login na Plataforma', type: 'system', icon: ArrowRight, color: 'text-gray-500' },
                                    { date: 'Ontem', time: '18:45', action: 'Solicitou Ajuda ao Mestre IA', type: 'ai', icon: Brain, color: 'text-purple-500' },
                                    { date: 'Ontem', time: '09:00', action: 'Desbloqueou Conquista: "Primeiros Passos"', type: 'gamification', icon: Trophy, color: 'text-yellow-500' },
                                ].map((log, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center shrink-0`}>
                                                <log.icon className={`w-4 h-4 ${log.color}`} />
                                            </div>
                                            {i < 3 && <div className="w-0.5 h-full bg-gray-800 my-2"></div>}
                                        </div>
                                        <div className="pb-6">
                                            <p className="text-xs text-gray-500 font-bold mb-1">{log.date} às {log.time}</p>
                                            <p className="text-sm text-white font-medium">{log.action}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
