
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, Circle, ArrowRight, X, Monitor,
    DollarSign, FileText, Settings, Rocket, ExternalLink,
    Lock
} from './Icons';
import Button from './Button';
import { Course } from '../types';

interface ChecklistStep {
    id: string;
    label: string;
    description: string;
    icon: any;
    actionLabel: string;
    actionUrl?: string; // Internal route or external link
    isCompleted: boolean;
    isLocked: boolean;
    requiredForClassic: boolean; // Is this required for "Traditional" courses?
}

interface LaunchChecklistProps {
    course: Course;
    onClose: () => void;
    onUpdateProgress: (progress: number) => void;
}

export const LaunchChecklist: React.FC<LaunchChecklistProps> = ({ course, onClose, onUpdateProgress }) => {
    const isClassic = course.category === 'standard';

    // Mock initial state based on course data
    // In a real app, this would come from the backend `course.checklist`
    const [steps, setSteps] = useState<ChecklistStep[]>([
        {
            id: 'product_def',
            label: 'Definição do Produto',
            description: 'Nicho, Nome, Promessa e Avatar definidos.',
            icon: FileText,
            actionLabel: 'Revisar',
            isCompleted: !!course.title && !!course.niche,
            isLocked: false,
            requiredForClassic: true
        },
        {
            id: 'pricing',
            label: 'Oferta & Precificação',
            description: 'Defina o preço, garantias e crie o checkout.',
            icon: DollarSign,
            actionLabel: 'Configurar Oferta',
            actionUrl: '/producer/finance', // Mock route
            isCompleted: !!course.financialViability,
            isLocked: false,
            requiredForClassic: true
        },
        {
            id: 'landing_page',
            label: 'Página de Vendas',
            description: 'Sua vitrine. Use o Construtor IA ou suba seu link.',
            icon: Monitor,
            actionLabel: 'Abrir Construtor',
            actionUrl: '/producer/tools/landing-builder',
            isCompleted: false,
            isLocked: false,
            requiredForClassic: true
        },
        {
            id: 'content',
            label: 'Conteúdo do Curso',
            description: 'Módulos e Aulas enviados e organizados.',
            icon: FileText,
            actionLabel: 'Editor de Aulas',
            actionUrl: `/producer/course/${course.id}/modules`,
            isCompleted: (course.totalModules || 0) > 0,
            isLocked: false,
            requiredForClassic: true
        },
        {
            id: 'nexus_setup',
            label: 'Configuração Nexus AI',
            description: 'Personalize o Mentor IA, Player e Gamificação.',
            icon: Settings,
            actionLabel: 'Personalizar IA',
            actionUrl: `/producer/course/${course.id}/nexus-config`,
            isCompleted: false,
            isLocked: isClassic, // Locked/Optional for classic? Or hidden?
            requiredForClassic: false
        },
        {
            id: 'launch',
            label: 'Lançamento Oficial',
            description: 'Tudo pronto? Publique sua escola para o mundo.',
            icon: Rocket,
            actionLabel: 'PUBLICAR AGORA',
            isCompleted: !!course.isPublished,
            isLocked: true, // Unlocks when others are done
            requiredForClassic: true
        }
    ]);

    // Calculate Progress
    useEffect(() => {
        const requiredSteps = steps.filter(s => !isClassic || s.requiredForClassic);
        const completed = requiredSteps.filter(s => s.isCompleted).length;
        const total = requiredSteps.length;
        const progress = Math.round((completed / total) * 100);

        onUpdateProgress(progress);

        // Unlock Launch if all required are done
        const allPreReqsDone = requiredSteps.filter(s => s.id !== 'launch').every(s => s.isCompleted);
        setSteps(prev => prev.map(s => s.id === 'launch' ? { ...s, isLocked: !allPreReqsDone } : s));

    }, [steps.map(s => s.isCompleted).join(','), isClassic]);


    const handleAction = (stepId: string) => {
        // Toggle completion for demo purposes if it's not the launch step
        if (stepId !== 'launch') {
            setSteps(prev => prev.map(s => s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-md bg-gray-900 h-full border-l border-gray-800 shadow-2xl flex flex-col"
            >
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-2">
                            <Rocket className="w-5 h-5 text-brand-primary" /> Setup Nexus
                        </h2>
                        <p className="text-xs text-gray-500 font-bold mt-1">Checklist de Lançamento</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Progress Bar */}
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase">Progresso do Setup</span>
                            <span className="text-2xl font-black text-brand-primary">
                                {Math.round((steps.filter(s => !isClassic || s.requiredForClassic && s.isCompleted).length / steps.filter(s => !isClassic || s.requiredForClassic).length) * 100)}%
                            </span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-brand-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${(steps.filter(s => !isClassic || s.requiredForClassic && s.isCompleted).length / steps.filter(s => !isClassic || s.requiredForClassic).length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Dynamic Message based on type */}
                    {isClassic && (
                        <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                            <p className="text-xs text-blue-300">
                                <strong>Modo Clássico Ativo:</strong> Etapas de configuração avançada de IA e Player foram ocultadas para simplificar seu lançamento.
                            </p>
                        </div>
                    )}

                    {/* Steps List */}
                    <div className="space-y-4">
                        {steps.filter(s => !isClassic || s.requiredForClassic).map((step, index) => (
                            <div
                                key={step.id}
                                className={`
                                    relative p-4 rounded-2xl border transition-all duration-300
                                    ${step.isLocked ? 'bg-gray-900/50 border-gray-800 opacity-60' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}
                                    ${step.isCompleted ? 'border-green-500/30' : ''}
                                `}
                            >
                                <div className="flex gap-4">
                                    <div className="mt-1">
                                        {step.isCompleted ? (
                                            <CheckCircle className="w-6 h-6 text-green-500" />
                                        ) : step.isLocked ? (
                                            <Lock className="w-6 h-6 text-gray-600" />
                                        ) : (
                                            <Circle className="w-6 h-6 text-gray-500" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`text-sm font-bold uppercase ${step.isCompleted ? 'text-green-400' : 'text-white'}`}>
                                            {step.label}
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                            {step.description}
                                        </p>

                                        {!step.isLocked && (
                                            <div className="mt-4 flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className={`
                                                        !text-[10px] uppercase font-bold !py-2
                                                        ${step.isCompleted
                                                            ? 'bg-green-900/20 text-green-400 border border-green-500/30 hover:bg-green-900/40'
                                                            : 'bg-brand-primary text-black hover:opacity-90'
                                                        }
                                                    `}
                                                    onClick={() => handleAction(step.id)}
                                                >
                                                    {step.isCompleted ? 'Revisar' : step.actionLabel}
                                                    {!step.isCompleted && <ArrowRight className="w-3 h-3 ml-1" />}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {index < steps.length - 1 && !isClassic && (
                                    <div className="absolute left-[1.65rem] top-14 bottom-[-1rem] w-px bg-gray-800 -z-10"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
