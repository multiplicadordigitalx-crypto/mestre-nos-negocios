import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Target, Award, ChevronLeft, Zap, CheckCircle, Brain, Layers, Star, XCircle, RotateCcw, AlertCircle, Clock } from '../Icons';
import Button from '../Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { consumeCredits } from '../../services/mockFirebase';
import { NICHE_CONFIGS, MOCK_HEALTH_FLASHCARDS, HealthNiche } from '../../data/healthGamificationData';
import { InsufficientFundsAlert } from '../knowledge/language/InsufficientFundsAlert';

import { StudentPage } from '../../types';

interface DynamicHealthFlashcardsProps {
    onBack: () => void;
    niche: HealthNiche;
    context: 'body' | 'mind';
    navigateTo?: (page: StudentPage) => void;
}

type SetupState = 'SETUP' | 'ESTIMATING' | 'ACTIVE' | 'ANALYSIS_POPUP' | 'SUMMARY';

export const DynamicHealthFlashcards: React.FC<DynamicHealthFlashcardsProps> = ({ onBack, niche, context, navigateTo }) => {
    const { user, refreshUser } = useAuth();
    const [step, setStep] = useState<SetupState>('SETUP');
    const [cardCount, setCardCount] = useState(10);
    const [difficulty, setDifficulty] = useState('INTER');
    const [showProcessConfirm, setShowProcessConfirm] = useState(false);
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);

    const config = NICHE_CONFIGS[niche] || NICHE_CONFIGS.default;

    const DIFFICULTY_LEVELS = {
        'BASIC': { label: config.levels.basic, cost: 1, color: 'text-blue-400', border: 'border-blue-500/50' },
        'INTER': { label: config.levels.inter, cost: 2, color: 'text-purple-400', border: 'border-purple-500/50' },
        'PRO': { label: config.levels.pro, cost: 4, color: 'text-yellow-400', border: 'border-yellow-500/50' }
    };

    const [reservedCredits, setReservedCredits] = useState(0);
    const [consumedCredits, setConsumedCredits] = useState(0);
    const [cardsReviewed, setCardsReviewed] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [currentCardIdx, setCurrentCardIdx] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [deck, setDeck] = useState<any[]>([]);

    const getCostPerCard = () => DIFFICULTY_LEVELS[difficulty as keyof typeof DIFFICULTY_LEVELS].cost;

    const generateDeck = (count: number) => {
        const specificMocks = MOCK_HEALTH_FLASHCARDS[niche] || [];
        const deck = [];
        for (let i = 0; i < count; i++) {
            if (i < specificMocks.length) {
                deck.push({ id: i, ...specificMocks[i] });
            } else {
                deck.push({
                    id: i,
                    front: `Conceito Avançado #${i + 1} (${config.flashcardTitle})`,
                    back: `Este conceito envolve a integração de práticas de ${niche === 'diet' ? 'nutrição funcional' : niche === 'therapy' ? 'neurociência afetiva' : 'fisiologia do exercício'}.`
                });
            }
        }
        return deck;
    };

    const handleInitialRequest = () => {
        setReservedCredits(cardCount * getCostPerCard());
        setShowProcessConfirm(true);
    };

    const confirmProcessing = async () => {
        if (!user) return;
        if ((user.creditBalance || 0) < reservedCredits) {
            setShowInsufficientModal(true);
            return;
        }

        setShowProcessConfirm(false);
        setStep('ESTIMATING');

        const result = await consumeCredits(user.uid, 'health_flashcards', reservedCredits, `${config.flashcardTitle} (${cardCount} cards)`);

        if (!result.success) {
            setStep('SETUP');
            toast.error(result.message || "Erro no pagamento.");
            return;
        }

        if (refreshUser) refreshUser();

        setTimeout(() => {
            setDeck(generateDeck(cardCount));
            setConsumedCredits(reservedCredits);
            toast.success("Deck personalizado gerado!", { icon: '🧠' });
            setStep('ACTIVE');
        }, 1500);
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden flex flex-col relative h-auto animate-fade-in shadow-2xl">
            {/* Header */}
            <div className="bg-gray-950/80 p-4 md:p-6 border-b border-gray-800 flex items-center justify-center relative backdrop-blur-md sticky top-0 z-20">
                <div className="absolute left-4 md:left-6">
                    <Button onClick={onBack} className="!p-1.5 md:!p-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-full transition-colors">
                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                </div>
                <div className="text-center flex flex-col items-center justify-center px-10">
                    <h2 className="text-lg md:text-2xl font-black text-white flex items-center justify-center gap-2 tracking-tight uppercase italic leading-tight">
                        🧠 {config.flashcardTitle}
                    </h2>
                    <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest">Estudo Prático & Memorização</p>
                </div>
                {step === 'ACTIVE' && (
                    <div className="absolute right-4 md:right-6 hidden sm:flex items-center gap-2 bg-gray-800 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-gray-700">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        <span className="text-[9px] md:text-xs font-bold text-gray-300">{reservedCredits} CR</span>
                    </div>
                )}
            </div>

            <div className="flex-1 p-4 md:p-10 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
                {step === 'SETUP' && (
                    <div className="max-w-md w-full space-y-5 md:space-y-6 animate-fade-in">
                        <div className="text-center mb-4 md:mb-8">
                            <p className="text-gray-400 text-xs md:text-sm font-medium uppercase tracking-[0.2em] opacity-60 italic">{config.setupMessage}</p>
                        </div>

                        {/* Gamification Dashboard */}
                        <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-3xl relative overflow-hidden mb-8">
                            <div className="absolute top-0 right-0 p-24 bg-indigo-500/5 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none" />

                            <div className="flex items-center gap-2 mb-6 relative z-10">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <h3 className="text-white font-bold text-lg">Seu Progresso</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-3 md:gap-4 relative z-10">
                                <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                                    <span className="text-gray-400 text-[10px] uppercase tracking-wider">Cards Vistos</span>
                                    <span className="text-2xl font-bold text-white">128</span>
                                </div>
                                <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                                    <span className="text-gray-400 text-[10px] uppercase tracking-wider">Retenção</span>
                                    <span className="text-2xl font-bold text-green-400">74%</span>
                                </div>
                                <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                                    <span className="text-gray-400 text-[8px] md:text-[10px] uppercase tracking-wider text-center">Ofensiva</span>
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                                        <span className="text-sm md:text-lg font-bold text-white whitespace-nowrap">5 Dias</span>
                                    </div>
                                </div>

                                <div className="col-span-3 bg-gray-900 border border-gray-800 p-4 rounded-2xl">
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Básico', progress: 85, color: 'bg-blue-500' },
                                            { label: 'Intermediário', progress: 45, color: 'bg-purple-500' },
                                            { label: 'Avançado', progress: 12, color: 'bg-yellow-500' }
                                        ].map((item, idx) => (
                                            <div key={idx}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] text-gray-300 font-bold uppercase">{item.label}</span>
                                                    <span className={`text-[10px] font-bold ${item.progress === 100 ? 'text-green-400' : 'text-gray-400'}`}>{item.progress}%</span>
                                                </div>
                                                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                    <div className={`h-full ${item.color} shadow-[0_0_10px_rgba(100,100,100,0.3)]`} style={{ width: `${item.progress}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase mb-3 text-center tracking-[0.2em] text-indigo-400/80">01. Escolha seu Nível</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:grid-cols-3 md:gap-3">
                                    {Object.entries(DIFFICULTY_LEVELS).map(([key, data]) => (
                                        <button key={key} onClick={() => setDifficulty(key)} className={`p-3 md:p-4 rounded-2xl border text-[10px] sm:text-xs md:text-sm font-black transition-all uppercase tracking-tighter ${difficulty === key ? `bg-gray-800 ${data.border} ${data.color} shadow-[0_0_15px_rgba(0,0,0,0.5)] scale-[1.02] md:scale-105` : 'bg-gray-800/40 border-gray-700 text-gray-500 hover:bg-gray-700'} ${key === 'PRO' ? 'col-span-2 sm:col-span-1' : ''}`}>
                                            {data.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase mb-3 text-center tracking-[0.2em] text-indigo-400/80">02. Volume de Estudo</label>
                                <div className="grid grid-cols-3 gap-2 md:gap-3">
                                    {[5, 10, 20].map(num => (
                                        <button key={num} onClick={() => setCardCount(num)} className={`p-4 md:p-6 rounded-2xl border text-sm md:text-base font-black transition-all ${cardCount === num ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] scale-[1.02] md:scale-105' : 'bg-gray-800/40 border-gray-700 text-gray-400'}`}>
                                            {num} <span className="text-[9px] md:text-[10px] block opacity-60">Cards</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleInitialRequest} className="w-full !py-4 !bg-indigo-600 hover:!bg-indigo-500 font-bold uppercase tracking-widest shadow-xl shadow-indigo-900/40">
                            <Zap className="w-5 h-5 mr-2" /> Iniciar Memorização
                        </Button>
                    </div>
                )}

                {step === 'ESTIMATING' && (
                    <div className="text-center space-y-4 animate-pulse py-20">
                        <Brain className="w-16 h-16 text-indigo-500 mx-auto animate-bounce" />
                        <h3 className="text-xl font-bold text-white italic">IA está mapeando o conteúdo...</h3>
                    </div>
                )}

                <AnimatePresence>
                    {showProcessConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 max-w-sm w-full relative overflow-hidden shadow-2xl"
                            >
                                <div className="absolute top-0 right-0 p-20 bg-indigo-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />

                                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 italic uppercase tracking-tighter">
                                    <Clock className="w-6 h-6 text-indigo-400" /> Confirmar Estudo
                                </h3>

                                <div className="space-y-4 mb-8">
                                    <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50 space-y-3">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-gray-400 uppercase tracking-widest">Atividade:</span>
                                            <span className="text-white italic">{config.flashcardTitle}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-gray-400 uppercase tracking-widest">Cards:</span>
                                            <span className="text-white">{cardCount}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
                                        <span className="font-black text-indigo-400 uppercase text-xs tracking-widest">Custo da Sessão:</span>
                                        <div className="flex items-center gap-2 font-black text-xl text-indigo-400">
                                            <Zap className="w-5 h-5 fill-indigo-400" />
                                            {reservedCredits} CR
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-widest px-4 leading-relaxed">
                                        Os créditos serão reservados e o deck personalizado será gerado imediatamente.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        onClick={() => setShowProcessConfirm(false)}
                                        className="!bg-gray-800 hover:!bg-gray-700 text-gray-300 !py-4 rounded-xl font-black uppercase tracking-widest transition-all"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={confirmProcessing}
                                        className="!bg-indigo-600 hover:!bg-indigo-500 !text-white !py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-900/20"
                                    >
                                        Confirmar
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {step === 'ACTIVE' && deck[currentCardIdx] && (
                    <div className="w-full max-w-2xl text-center space-y-8 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-500 text-[10px] font-mono">{currentCardIdx + 1} / {cardCount}</span>
                            <button onClick={() => setStep('SUMMARY')} className="text-[10px] font-bold text-red-400 px-3 py-1 rounded-full border border-red-500/20 uppercase tracking-tighter">Sair</button>
                        </div>
                        <div className="relative w-full h-[260px] sm:h-[350px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)} style={{ perspective: '1000px' }}>
                            <div className="relative w-full h-full transition-all duration-500" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                                <div className="absolute inset-0 bg-gray-800 border-2 border-indigo-500/30 rounded-3xl p-5 md:p-8 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden' }}>
                                    <h3 className="text-lg md:text-2xl font-bold text-white leading-tight px-4">{deck[currentCardIdx].front}</h3>
                                    <p className="text-[8px] md:text-[9px] text-gray-500 mt-6 md:mt-8 uppercase tracking-widest animate-pulse">Toque para revelar</p>
                                </div>
                                <div className="absolute inset-0 bg-white rounded-3xl p-5 md:p-8 flex flex-col items-center justify-center text-gray-900 text-center shadow-2xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                    <p className="text-sm md:text-lg font-medium leading-relaxed px-2">{deck[currentCardIdx].back}</p>
                                </div>
                            </div>
                        </div>
                        <div className={`flex gap-3 justify-center transition-all ${isFlipped ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                            <button onClick={() => { setIsFlipped(false); setCardsReviewed(c => c + 1); if (currentCardIdx < deck.length - 1) setCurrentCardIdx(i => i + 1); else setStep('ANALYSIS_POPUP'); }} className="bg-red-500/10 text-red-500 p-3.5 md:p-4 rounded-2xl border border-red-500/20 font-black flex-1 text-xs md:text-sm uppercase tracking-tighter">Esqueci 🤯</button>
                            <button onClick={() => { setIsFlipped(false); setCardsReviewed(c => c + 1); setCorrectCount(c => c + 1); if (currentCardIdx < deck.length - 1) setCurrentCardIdx(i => i + 1); else setStep('ANALYSIS_POPUP'); }} className="bg-green-500/10 text-green-500 p-3.5 md:p-4 rounded-2xl border border-green-500/20 font-black flex-1 text-xs md:text-sm uppercase tracking-tighter">Acertei 😎</button>
                        </div>
                    </div>
                )}

                {step === 'ANALYSIS_POPUP' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in text-center">
                        <div className="bg-gray-900 border border-brand-primary p-6 md:p-8 rounded-3xl max-w-sm w-full space-y-5 md:space-y-6">
                            <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-500 mx-auto" />
                            <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter">Sessão Finalizada!</h2>
                            <p className="text-sm text-gray-400">Você acertou <span className="text-green-400 font-bold">{correctCount}</span> de <span className="text-white font-bold">{cardsReviewed}</span> cards.</p>
                            <Button onClick={() => setStep('SUMMARY')} className="w-full !bg-white !text-black font-black uppercase tracking-widest !py-4">Ver Extrato</Button>
                        </div>
                    </div>
                )}

                {step === 'SUMMARY' && (
                    <div className="text-center space-y-6 md:space-y-8 animate-fade-in max-w-md w-full px-4">
                        <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-green-500 mx-auto" />
                        <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter">Evolução Concluída</h2>
                        <div className="bg-gray-800 rounded-2xl p-5 md:p-6 border border-gray-700">
                            <div className="flex justify-between items-center mb-4 text-xs md:text-sm">
                                <span className="text-gray-400 italic">Custo da Sessão</span>
                                <span className="text-red-400 font-black">-{consumedCredits} CR</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-700 pt-4">
                                <span className="text-white font-bold text-xs md:text-sm">Saldo Atual</span>
                                <span className="text-brand-primary font-black text-lg md:text-xl">{user?.creditBalance || 0} CR</span>
                            </div>
                        </div>
                        <Button onClick={() => { setStep('SETUP'); setCurrentCardIdx(0); setCorrectCount(0); setCardsReviewed(0); }} className="w-full !bg-white !text-black font-bold uppercase tracking-widest !py-4">Reiniciar Estudo</Button>
                    </div>
                )}
            </div>

            {/* Global Modals */}
            <InsufficientFundsAlert
                isOpen={showInsufficientModal}
                onClose={() => setShowInsufficientModal(false)}
                onRecharge={() => {
                    setShowInsufficientModal(false);
                    if (navigateTo) navigateTo('recharge');
                    else toast.error("Navegação indisponível");
                }}
                requiredCredits={reservedCredits}
                currentCredits={user?.creditBalance || 0}
            />
        </div>
    );
};
