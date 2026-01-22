
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Star, Clock, CheckCircle, XCircle, Zap, Trophy, ChevronLeft, RotateCcw, ChevronDown, Layers } from '../Icons';
import Button from '../Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { consumeCredits } from '../../services/mockFirebase';
import { NICHE_CONFIGS, MOCK_HEALTH_QUIZ, HealthNiche } from '../../data/healthGamificationData';
import { InsufficientFundsAlert } from '../knowledge/language/InsufficientFundsAlert';

import { StudentPage } from '../../types';

interface DynamicHealthQuizProps {
    onBack: () => void;
    niche: HealthNiche;
    navigateTo?: (page: StudentPage) => void;
}

type QuizState = 'CONFIG' | 'PLAYING' | 'RESULT';

const COST_PER_QUESTION = 2;

export const DynamicHealthQuiz: React.FC<DynamicHealthQuizProps> = ({ onBack, niche, navigateTo }) => {
    const { user, refreshUser } = useAuth();
    const [gameState, setGameState] = useState<QuizState>('CONFIG');
    const [questionCount, setQuestionCount] = useState(5);
    const [showCostModal, setShowCostModal] = useState(false);
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [questions, setQuestions] = useState<any[]>([]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [loading, setLoading] = useState(false);

    const config = NICHE_CONFIGS[niche] || NICHE_CONFIGS.default;

    const handleStartGame = async () => {
        if (!user) return;
        const totalCost = questionCount * COST_PER_QUESTION;

        if ((user.creditBalance || 0) < totalCost) {
            setShowCostModal(false);
            setShowInsufficientModal(true);
            return;
        }

        setLoading(true);
        try {
            const result = await consumeCredits(user.uid, 'health_quiz', totalCost, `${config.quizTitle} (${questionCount}q)`);
            if (result.success) {
                if (refreshUser) refreshUser();
                const mockSet = MOCK_HEALTH_QUIZ[niche] || MOCK_HEALTH_QUIZ.diet;
                const finalQuestions = [];
                for (let i = 0; i < questionCount; i++) {
                    finalQuestions.push({ ...mockSet[i % mockSet.length], id: i });
                }
                setQuestions(finalQuestions);
                setGameState('PLAYING');
                setShowCostModal(false);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {gameState === 'CONFIG' && (
                <div className="flex flex-col h-full bg-gray-900 p-6 rounded-[2.5rem] border border-gray-800 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-purple-600" />

                    {/* Header */}
                    <div className="bg-gray-950/80 p-4 md:p-6 border-b border-gray-800 flex items-center justify-center relative backdrop-blur-md sticky top-0 z-20">
                        <div className="absolute left-4 md:left-6">
                            <Button onClick={onBack} className="!p-1.5 md:!p-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-full transition-colors">
                                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                            </Button>
                        </div>
                        <div className="text-center flex flex-col items-center justify-center px-10">
                            <h2 className="text-lg md:text-2xl font-black text-white flex items-center justify-center gap-2 tracking-tight uppercase italic leading-tight">
                                ⚡ {config.quizTitle}
                            </h2>
                            <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest">Desafio de Performance IA</p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-10 max-w-md mx-auto w-full flex flex-col justify-center">
                        {/* Gamification Dashboard */}
                        <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-3xl relative overflow-hidden mb-8">
                            <div className="absolute top-0 right-0 p-24 bg-brand-primary/5 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none" />

                            <div className="flex items-center gap-2 mb-6 relative z-10">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <h3 className="text-white font-bold text-lg">Seu Histórico</h3>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10">
                                <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                                    <span className="text-gray-400 text-xs uppercase tracking-wider">Rodadas</span>
                                    <span className="text-2xl font-bold text-white">24</span>
                                </div>
                                <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                                    <span className="text-gray-400 text-xs uppercase tracking-wider">Média Global</span>
                                    <span className="text-2xl font-bold text-green-400">76%</span>
                                </div>
                                <div className="col-span-2 bg-gray-900 border border-gray-800 p-3 rounded-2xl flex flex-col justify-center">
                                    <span className="text-gray-400 text-xs uppercase tracking-wider mb-2 text-center">Desempenho por Nível</span>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Básico', pct: 92, color: 'bg-blue-500' },
                                            { label: 'Intermediário', pct: 64, color: 'bg-purple-500' },
                                            { label: 'Avançado', pct: 28, color: 'bg-yellow-500' }
                                        ].map((lvl, i) => (
                                            <div key={i} className="flex items-center justify-between gap-2">
                                                <span className="text-[10px] text-gray-400 capitalize w-16 truncate">{lvl.label}</span>
                                                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${lvl.color}`}
                                                        style={{ width: `${lvl.pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold w-6 text-right text-gray-300">{lvl.pct}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
                            {[5, 10, 15, 20].map(count => (
                                <button key={count} onClick={() => setQuestionCount(count)} className={`p-4 md:p-6 rounded-2xl border flex flex-col items-center gap-1 transition-all ${questionCount === count ? 'bg-brand-primary border-brand-primary text-black shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)] scale-[1.02] md:scale-105' : 'bg-gray-900/40 border-gray-800 text-gray-400'}`}>
                                    <span className="font-black text-lg md:text-xl">{count}</span>
                                    <span className="text-[8px] md:text-[9px] uppercase font-black tracking-widest opacity-70">Questões</span>
                                </button>
                            ))}
                        </div>

                        <Button onClick={() => setShowCostModal(true)} className="w-full !py-5 !bg-brand-primary hover:!bg-brand-primary/90 !text-black font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20">
                            Iniciar Desafio
                        </Button>
                    </div>

                    <AnimatePresence>
                        {showCostModal && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 max-w-sm w-full relative overflow-hidden shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 p-20 bg-brand-primary/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />

                                    <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 italic uppercase tracking-tighter">
                                        <Clock className="w-6 h-6 text-brand-primary" /> Confirmar Início
                                    </h3>

                                    <div className="space-y-4 mb-8">
                                        <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50 space-y-3">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-gray-400 uppercase tracking-widest">Atividade:</span>
                                                <span className="text-white italic">{config.quizTitle}</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-gray-400 uppercase tracking-widest">Questões:</span>
                                                <span className="text-white">{questionCount}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-brand-primary/10 border border-brand-primary/30 rounded-2xl">
                                            <span className="font-black text-brand-primary uppercase text-xs tracking-widest">Custo Total:</span>
                                            <div className="flex items-center gap-2 font-black text-xl text-brand-primary">
                                                <Zap className="w-5 h-5 fill-brand-primary" />
                                                {questionCount * COST_PER_QUESTION} CR
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-widest px-4 leading-relaxed">
                                            O investimento será debitado do seu saldo e o desafio começará imediatamente.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            onClick={() => setShowCostModal(false)}
                                            className="!bg-gray-800 hover:!bg-gray-700 text-gray-300 !py-4 rounded-xl font-black uppercase tracking-widest transition-all"
                                        >
                                            Voltar
                                        </Button>
                                        <Button
                                            onClick={handleStartGame}
                                            isLoading={loading}
                                            className="!bg-brand-primary hover:!bg-brand-primary/90 !text-black !py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20"
                                        >
                                            Confirmar
                                        </Button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {gameState === 'PLAYING' && questions[currentQuestionIndex] && (
                <div className="flex flex-col h-full bg-gray-950 p-6 rounded-[2.5rem] border border-gray-800">
                    <div className="flex justify-between items-center mb-6 md:mb-8">
                        <span className="text-gray-500 font-mono text-[10px] md:text-xs">Questão {currentQuestionIndex + 1}/{questions.length}</span>
                        <div className="bg-gray-900 px-3 py-1 rounded-full border border-gray-800 flex items-center gap-2">
                            <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-white font-bold text-xs md:text-sm">{score}</span>
                        </div>
                    </div>

                    <div className="w-full h-1 bg-gray-800 rounded-full mb-12">
                        <motion.div className="h-full bg-brand-primary" initial={{ width: 0 }} animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
                    </div>

                    <div className="flex-1 flex flex-col justify-center py-4">
                        <h2 className="text-lg md:text-2xl font-black text-white mb-6 md:mb-10 text-center italic leading-tight px-2">"{questions[currentQuestionIndex].text}"</h2>
                        <div className="space-y-2.5 md:space-y-4 max-w-md mx-auto w-full">
                            {questions[currentQuestionIndex].options.map((opt: string, idx: number) => (
                                <button
                                    key={idx}
                                    disabled={isAnswered}
                                    onClick={() => { setSelectedOption(idx); setIsAnswered(true); if (idx === questions[currentQuestionIndex].correctIndex) setScore(s => s + 1); }}
                                    className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all font-bold text-sm sm:text-base ${isAnswered
                                        ? idx === questions[currentQuestionIndex].correctIndex ? 'bg-green-500/20 border-green-500 text-green-400' : idx === selectedOption ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-gray-900 border-gray-800 text-gray-600 opacity-50'
                                        : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-brand-primary hover:bg-gray-800'
                                        }`}
                                >
                                    <span className="flex-1 text-xs md:text-base">{opt}</span>
                                </button>
                            ))}
                        </div>

                        <AnimatePresence>
                            {isAnswered && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10 p-5 bg-gray-900 border border-gray-800 rounded-2xl max-w-md mx-auto w-full text-center">
                                    <p className="text-xs text-gray-400 italic mb-4">"{questions[currentQuestionIndex].explanation}"</p>
                                    <Button onClick={() => { if (currentQuestionIndex < questions.length - 1) { setCurrentQuestionIndex(i => i + 1); setIsAnswered(false); setSelectedOption(null); } else setGameState('RESULT'); }} className="w-full !bg-white !text-black font-black uppercase">Próxima</Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {gameState === 'RESULT' && (
                <div className="flex flex-col h-full items-center justify-center bg-gray-950 p-6 text-center rounded-[2.5rem] border border-gray-800 shadow-2xl relative overflow-hidden min-h-[500px]">
                    <div className="absolute top-0 right-0 p-40 bg-brand-primary/10 blur-3xl rounded-full -mr-20 -mt-20" />
                    <Trophy className="w-16 h-16 md:w-24 md:h-24 text-yellow-500 mb-4 md:mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" />
                    <h2 className="text-2xl md:text-4xl font-black text-white italic mb-2">Desafio Concluído!</h2>
                    <p className="text-sm text-gray-400 mb-6 md:mb-8 font-medium">Sua sabedoria expandiu. 🧠✨</p>

                    <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
                        <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 flex flex-col items-center">
                            <span className="text-[10px] text-gray-500 uppercase font-black mb-1">Acertos</span>
                            <span className="text-2xl font-black text-white">{score}/{questions.length}</span>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 flex flex-col items-center">
                            <span className="text-[10px] text-gray-500 uppercase font-black mb-1">XP Ganho</span>
                            <span className="text-2xl font-black text-indigo-400">+{score * 50}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full max-w-xs">
                        <Button onClick={() => setGameState('CONFIG')} className="w-full !py-4 font-black !bg-brand-primary !text-black shadow-lg">Nova Rodada</Button>
                        <button onClick={onBack} className="text-gray-500 font-bold hover:text-white transition-colors text-sm">Voltar ao Painel</button>
                    </div>
                </div>
            )}

            {/* Global Modals */}
            <InsufficientFundsAlert
                isOpen={showInsufficientModal}
                onClose={() => setShowInsufficientModal(false)}
                onRecharge={() => {
                    setShowInsufficientModal(false);
                    if (navigateTo) navigateTo('recharge');
                    else toast.error("Navegação indisponível");
                }}
                requiredCredits={questionCount * COST_PER_QUESTION}
                currentCredits={user?.creditBalance || 0}
            />
        </>
    );
};
