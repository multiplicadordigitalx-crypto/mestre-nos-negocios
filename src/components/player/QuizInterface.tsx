import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Trophy, ArrowRight, Brain, Star } from '../Icons';
import Button from '../Button';

interface QuizInterfaceProps {
    theme: {
        primary: string;
        secondary: string;
        bg: string;
        name: string;
    };
    onComplete: (score: number) => void;
    onScoreUpdate?: (currentScore: number) => void;
    questions?: Question[];
    courseId?: string;
    moduleId?: string;
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

// Temporary Mock Data (Fallback if no props provided)
const DEFAULT_QUESTIONS: Question[] = [
    {
        id: '1',
        text: "O que é o 'Efeito Rede' em negócios digitais?",
        options: [
            "Quando a internet cai na empresa toda.",
            "Quando o valor de um produto aumenta conforme mais pessoas o utilizam.",
            "Uma estratégia de marketing multinível.",
            "O uso de redes sociais para vender."
        ],
        correctIndex: 1,
        explanation: "O Efeito Rede (Network Effect) ocorre quando cada novo usuário adiciona valor para todos os outros usuários, criando um fosso defensivo poderoso (ex: WhatsApp, Facebook)."
    },
    {
        id: '2',
        text: "Qual a métrica mais importante para validar um MVP?",
        options: [
            "Número de seguidores no Instagram.",
            "Receita Bruta (Faturamento).",
            "Retenção e engajamento real.",
            "Custo por Lead (CPL)."
        ],
        correctIndex: 2,
        explanation: "Embora receita seja importante, a Retenção prova que o produto resolve uma dor real. Faturamento pode ser comprado com anúncios, retenção não."
    },
    {
        id: '3',
        text: "Em copy de vendas, o que significa a sigla AIDA?",
        options: [
            "Atenção, Interesse, Desejo, Ação.",
            "Amor, Intensidade, Dedicação, Alma.",
            "Análise, Inteligência, Dados, Algoritmo.",
            "Autoridade, Influência, Dinheiro, Ambição."
        ],
        correctIndex: 0,
        explanation: "AIDA é o framework clássico de persuasão: Captar a Atenção, segurar o Interesse, criar Desejo e chamar para a Ação."
    }
];

export const QuizInterface: React.FC<QuizInterfaceProps> = ({ theme, onComplete, onScoreUpdate, questions }) => {
    const activeQuestions = questions && questions.length > 0 ? questions : DEFAULT_QUESTIONS;

    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    // XP Animation State
    const [xpGained, setXpGained] = useState(0);

    const question = activeQuestions[currentQuestionIdx];
    const progress = ((currentQuestionIdx) / activeQuestions.length) * 100;

    const handleSelectOption = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        const isCorrect = index === question.correctIndex;
        if (isCorrect) {
            const newScore = score + 100;
            setScore(newScore);
            setXpGained(100);
            if (onScoreUpdate) onScoreUpdate(newScore);
            // triggerConfetti(); // Removed to avoid dependency
        }
    };

    const handleNext = () => {
        setXpGained(0); // Reset XP popup
        if (currentQuestionIdx < activeQuestions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
            onComplete(score);
        }
    };

    if (showResult) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in relative z-10">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-gradient-to-br from-gray-800 to-black border-4"
                    style={{ borderColor: theme.primary }}
                >
                    <Trophy className="w-16 h-16" style={{ color: theme.primary }} />
                </motion.div>
                <h3 className="text-3xl font-black text-white uppercase mb-2">Quiz Finalizado!</h3>
                <p className="text-gray-400 mb-8">Você dominou este módulo.</p>

                <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                        <p className="text-xs text-gray-500 uppercase font-bold">XP Total</p>
                        <p className="text-2xl font-black text-white">+{score} XP</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                        <p className="text-xs text-gray-500 uppercase font-bold">Acertos</p>
                        <p className="text-2xl font-black text-white">{Math.round((score / (activeQuestions.length * 100)) * 100)}%</p>
                    </div>
                </div>

                <Button onClick={() => { }} className="!py-4 !px-12 uppercase font-black" style={{ backgroundColor: theme.primary, color: 'black' }}>
                    Próximo Módulo
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative overflow-hidden">
            {/* Top Bar Removed as per user request to maximize screen space */}

            {/* Progress Bar */}
            <div className="h-1 w-full bg-gray-800">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full transition-all duration-500"
                    style={{ backgroundColor: theme.primary }}
                />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar z-10">
                <div className="max-w-3xl mx-auto overflow-hidden">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentQuestionIdx}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            {/* Question Card */}
                            <div className="mb-8">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">
                                    Questão {currentQuestionIdx + 1} de {activeQuestions.length}
                                </span>
                                <h2 className="text-xl md:text-3xl font-bold text-white leading-tight">
                                    {question.text}
                                </h2>
                            </div>

                            {/* Options Grid */}
                            <div className="grid gap-3">
                                {question.options.map((opt, idx) => {
                                    const isSelected = selectedOption === idx;
                                    const isCorrect = idx === question.correctIndex;
                                    const showStatus = isAnswered && (isSelected || isCorrect);
                                    let borderColor = 'border-gray-700';
                                    let bgColor = 'bg-gray-800/30';

                                    if (showStatus) {
                                        if (isCorrect) {
                                            borderColor = 'border-green-500';
                                            bgColor = 'bg-green-500/10';
                                        } else if (isSelected) {
                                            borderColor = 'border-red-500';
                                            bgColor = 'bg-red-500/10';
                                        }
                                    } else if (isSelected) {
                                        borderColor = `border-[${theme.primary}]`;
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectOption(idx)}
                                            disabled={isAnswered}
                                            className={`group relative p-5 rounded-2xl text-left border-2 transition-all duration-300 ${borderColor} ${bgColor} ${!isAnswered && 'hover:bg-gray-800 hover:border-gray-600'}`}
                                            style={!isAnswered && isSelected ? { borderColor: theme.primary } : {}}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${showStatus && isCorrect ? 'border-green-500 bg-green-500 text-black' :
                                                    showStatus && isSelected ? 'border-red-500 text-red-500' :
                                                        isSelected ? 'text-black' : 'border-gray-600 text-transparent'
                                                    }`} style={!showStatus && isSelected ? { borderColor: theme.primary, backgroundColor: theme.primary } : {}}>
                                                    {showStatus && isCorrect && <CheckCircle className="w-4 h-4" />}
                                                    {showStatus && isSelected && !isCorrect && <AlertCircle className="w-4 h-4" />}
                                                </div>
                                                <p className={`text-base font-medium ${isSelected || isCorrect ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                    {opt}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feedback & Next Section */}
                            {isAnswered && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 p-6 rounded-2xl border bg-gray-900"
                                    style={{ borderColor: selectedOption === question.correctIndex ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)' }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-lg ${selectedOption === question.correctIndex ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {selectedOption === question.correctIndex ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`text-lg font-bold mb-1 ${selectedOption === question.correctIndex ? 'text-green-500' : 'text-red-500'}`}>
                                                {selectedOption === question.correctIndex ? 'Correto!' : 'Incorreto'}
                                            </h4>
                                            <p className="text-gray-300 leading-relaxed mb-6">
                                                {question.explanation}
                                            </p>
                                            <Button
                                                onClick={handleNext}
                                                className="w-full md:w-auto !py-3 !px-8 font-black uppercase shadow-lg hover:scale-105 transition-transform"
                                                style={{ backgroundColor: theme.primary, color: 'black' }}
                                            >
                                                {currentQuestionIdx < activeQuestions.length - 1 ? 'Próxima Questão' : 'Ver Resultado'} <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* XP Popup Animation */}
            <AnimatePresence>
                {xpGained > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 0 }}
                        animate={{ opacity: 1, scale: 1, y: -50 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-1/4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                    >
                        <div className="text-4xl font-black text-yellow-400 drop-shadow-lg flex items-center gap-2">
                            +{xpGained} XP <Star className="w-8 h-8 fill-yellow-400" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
