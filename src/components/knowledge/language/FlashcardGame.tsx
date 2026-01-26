import React, { useState } from 'react';

import { Brain, RotateCw, Check, X, ArrowRight, Sparkles, Zap } from '../../Icons';
import { motion, AnimatePresence } from 'framer-motion';

interface Flashcard {
    id: number;
    front: string;
    back: string;
    context: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

const MOCK_CARDS: Flashcard[] = [
    {
        id: 1,
        front: 'Serendipity',
        back: 'Serendipidade',
        context: 'Finding something good without looking for it.',
        difficulty: 'hard'
    },
    {
        id: 2,
        front: 'Ephemeral',
        back: 'Efêmero',
        context: 'Lasting for a very short time.',
        difficulty: 'medium'
    },
    {
        id: 3,
        front: 'Resilience',
        back: 'Resiliência',
        context: 'The capacity to recover quickly from difficulties.',
        difficulty: 'medium'
    },
    {
        id: 4,
        front: 'Eloquent',
        back: 'Eloquente',
        context: 'Fluent or persuasive in speaking or writing.',
        difficulty: 'easy'
    },
    {
        id: 5,
        front: 'Ineffable',
        back: 'Inefável',
        context: 'Too great or extreme to be expressed in words.',
        difficulty: 'hard'
    }
];

export const FlashcardGame = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [direction, setDirection] = useState(0); // -1 for left (wrong), 1 for right (correct)
    const [xp, setXp] = useState(120);
    const [streak, setStreak] = useState(5);

    const currentCard = MOCK_CARDS[currentIndex];
    const progress = ((currentIndex + 1) / MOCK_CARDS.length) * 100;

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleNext = (result: 'correct' | 'wrong') => {
        setDirection(result === 'correct' ? 1 : -1);

        // Simulate delay for animation
        setTimeout(() => {
            if (result === 'correct') {
                setXp(prev => prev + 10);
            }

            if (currentIndex < MOCK_CARDS.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setIsFlipped(false);
                setDirection(0);
            } else {
                // Game Over / Summary Logic would go here
                alert("Sessão finalizada! +50 XP Bônus");
                setCurrentIndex(0);
                setIsFlipped(false);
                setDirection(0);
            }
        }, 200);
    };

    return (
        <div className="rounded-2xl shadow-xl p-6 bg-gray-900 border border-gray-800 h-[500px] flex flex-col relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            {/* Header Stats */}
            <div className="flex justify-between items-center mb-6 z-10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                        <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-yellow-500 font-bold text-sm">{xp} XP</span>
                    </div>
                    <div className="flex items-center gap-1 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        <span className="text-orange-500 font-bold text-sm">{streak} Dias</span>
                    </div>
                </div>
                <div className="text-gray-400 text-sm font-medium">
                    Card {currentIndex + 1}/{MOCK_CARDS.length}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-800 h-1.5 rounded-full mb-8 overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Card Area */}
            <div className="flex-1 flex items-center justify-center relative perspective-1000">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCard.id}
                        initial={{ opacity: 0, x: direction * 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -direction * 50, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="w-full max-w-sm h-72 cursor-pointer group"
                        onClick={handleFlip}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <motion.div
                            className={`relative w-full h-full rounded-2xl shadow-2xl transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                        >
                            {/* Front */}
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl flex flex-col items-center justify-center p-8 backface-hidden">
                                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">Termo</span>
                                <h3 className="text-4xl font-black text-white text-center mb-2">{currentCard.front}</h3>
                                <p className="text-gray-500 text-sm text-center">Toque para revelar</p>
                                <RotateCw className="w-5 h-5 text-gray-600 absolute bottom-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Back */}
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-500/30 rounded-2xl flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180">
                                <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">Tradução</span>
                                <h3 className="text-3xl font-bold text-white text-center mb-4">{currentCard.back}</h3>
                                <div className="w-full h-px bg-white/10 mb-4" />
                                <p className="text-indigo-200 text-sm text-center italic">"{currentCard.context}"</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-6 mt-6">
                <button
                    onClick={() => handleNext('wrong')}
                    className="p-4 rounded-full bg-gray-800 text-red-500 hover:bg-red-500/10 hover:text-red-400 border border-gray-700 hover:border-red-500/30 transition-all active:scale-95"
                    title="Não sei"
                >
                    <X className="w-6 h-6" />
                </button>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Avaliar</div>
                <button
                    onClick={() => handleNext('correct')}
                    className="p-4 rounded-full bg-gray-800 text-green-500 hover:bg-green-500/10 hover:text-green-400 border border-gray-700 hover:border-green-500/30 transition-all active:scale-95"
                    title="Aprendi"
                >
                    <Check className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};
