import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Star, Clock, CheckCircle, XCircle, Zap, Trophy, ArrowRight, RotateCcw, ChevronDown, TrendingUp, Target, Award } from '../../Icons';
import Button from '../../Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { consumeCredits } from '../../../services/mockFirebase';
import { InsufficientFundsAlert } from './InsufficientFundsAlert';

import { StudentPage } from '../../../types';
import { specializedService } from '../../../services/specializedModulesService';

interface NexusQuizProps {
    onBack: () => void;
    navigateTo?: (page: StudentPage) => void;
}

type QuizState = 'CONFIG' | 'PLAYING' | 'RESULT';

interface Question {
    id: number;
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

const COST_PER_QUESTION = 2;

export const NexusQuiz: React.FC<NexusQuizProps> = ({ onBack, navigateTo }) => {
    const { user, refreshUser } = useAuth();
    const [gameState, setGameState] = useState<QuizState>('CONFIG');

    // Config State
    const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
    const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
    const [questionCount, setQuestionCount] = useState(5);
    const [showCostModal, setShowCostModal] = useState(false);
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);

    // Gameplay State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [loading, setLoading] = useState(false);

    // Mock Questions Database (In real app, this would come from AI or DB)
    const MOCK_QUESTIONS: Question[] = [
        { id: 1, text: "Qual termo descreve melhor o 'Lucro antes de juros e impostos'?", options: ["ROI", "EBITDA", "Revenue", "Gross Margin"], correctIndex: 1, explanation: "EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization) é a medida padrão de eficiência operacional." },
        { id: 2, text: "Em uma negociação, o que significa BATNA?", options: ["Best Alternative to a Negotiated Agreement", "Better Agreement To Negotiate Always", "Business Analysis Tools & Analytics", "Basic Agreement Terms & Actions"], correctIndex: 0, explanation: "BATNA é sua 'Melhor Alternativa a um Acordo Negociado' - seu plano B se a negociação falhar." },
        { id: 3, text: "O que caracteriza um mercado 'Bearish'?", options: ["Alta confiança e preços subindo", "Estabilidade lateral", "Pessimismo e preços caindo", "Alta volatilidade sem direção"], correctIndex: 2, explanation: "Bear Market (Urso) ataca de cima para baixo, simbolizando queda de preços e pessimismo." },
        { id: 4, text: "Qual a principal função de um 'Angel Investor'?", options: ["Empréstimo bancário com juros baixos", "Capital semente para startups em estágio inicial", "Investimento em empresas de grande porte", "Auditoria fiscal governamental"], correctIndex: 1, explanation: "Investidores Anjo fornecem capital inicial (Seed) para startups em troca de participação, assumindo alto risco." },
        { id: 5, text: "O que é 'Churn Rate'?", options: ["Taxa de conversão de leads", "Taxa de cancelamento de clientes", "Custo de aquisição de cliente", "Margem de lucro líquido"], correctIndex: 1, explanation: "Churn Rate mede a porcentagem de clientes que cancelam o serviço em um determinado período." },
    ];

    const generateQuestions = (count: number) => {
        // Here we would ideally filter by selectedFocus and selectedLevel
        // For now, we simulate by shuffling/repeating the mocks
        const generated: Question[] = [];
        for (let i = 0; i < count; i++) {
            const mockBase = MOCK_QUESTIONS[i % MOCK_QUESTIONS.length];
            generated.push({ ...mockBase, id: i, text: `${mockBase.text} ${i >= 5 ? '(Variação ' + (i + 1) + ')' : ''}` });
        }
        return generated;
    };

    const handlePreStart = () => {
        if (!selectedObjective) {
            toast.error("Por favor, selecione um Objetivo.");
            return;
        }
        if (!selectedFocus) {
            toast.error("Por favor, selecione um Foco de Interesse.");
            return;
        }
        if (!selectedLevel) {
            toast.error("Por favor, selecione um Nível de Dificuldade.");
            return;
        }
        setShowCostModal(true);
    };

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
            const result = await consumeCredits(user.uid, 'nexus_quiz', totalCost, `Nexus Quiz (${questionCount}q - ${selectedFocus})`);
            if (result.success) {
                if (refreshUser) refreshUser();
                setQuestions(generateQuestions(questionCount));
                setCurrentQuestionIndex(0);
                setScore(0);
                setGameState('PLAYING');
                setShowCostModal(false);
                toast.success("Quiz Iniciado! Boa sorte 🧠");
            } else {
                toast.error(`Erro ao iniciar: ${result.error || result.message || 'Desconhecido'}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro técnico ao processar créditos.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        if (index === questions[currentQuestionIndex].correctIndex) {
            setScore(prev => prev + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setGameState('RESULT');
            // Log Session
            if (user) {
                specializedService.savePracticeSession(user.uid, {
                    moduleType: 'poliglota',
                    activityType: 'nexus_quiz',
                    title: `Nexus Quiz - ${selectedObjective}`,
                    score: score * 10,
                    durationSeconds: questionCount * 30, // Estimate
                    details: {
                        level: selectedLevel,
                        focus: selectedFocus,
                        correct: score,
                        total: questionCount
                    }
                });
            }
        }
    };

    const restartGame = () => {
        setGameState('CONFIG');
        setSelectedOption(null);
        setIsAnswered(false);
        setShowCostModal(false);
        setSelectedFocus(null);
        setSelectedLevel(null);
        setSelectedObjective(null);
    };

    return (
        <>
            {gameState === 'CONFIG' ? (
                <div className="flex flex-col h-full bg-gray-950 p-6 overscroll-contain relative rounded-[2.5rem] overflow-hidden border border-gray-800">
                    {/* Cost Confirmation Modal */}
                    <AnimatePresence>
                        {showCostModal && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-20 bg-purple-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />

                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-purple-400" /> Confirmar Início
                                    </h3>

                                    <div className="space-y-4 mb-6">
                                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-400">Objetivo:</span>
                                                <span className="text-white font-medium">
                                                    {[
                                                        { id: 'carreira', label: 'Carreira & Negócios' },
                                                        { id: 'viagem', label: 'Viagem e Turismo' },
                                                        { id: 'intercambio', label: 'Intercâmbio & Estudos' },
                                                    ].find(o => o.id === (selectedObjective || ''))?.label}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-400">Foco:</span>
                                                <span className="text-white font-medium">
                                                    {selectedObjective && {
                                                        'carreira': [
                                                            { id: 'negociacao', label: 'Negociação & Vendas' },
                                                            { id: 'lideranca', label: 'Liderança & Gestão' },
                                                            { id: 'marketing', label: 'Marketing & Branding' }
                                                        ],
                                                        'viagem': [
                                                            { id: 'aeroporto', label: 'Aeroporto & Transporte' },
                                                            { id: 'hotel', label: 'Hotel & Restaurante' },
                                                            { id: 'social', label: 'Social & Lazer' }
                                                        ],
                                                        'intercambio': [
                                                            { id: 'academico', label: 'Vida Acadêmica' },
                                                            { id: 'acomodacao', label: 'Acomodação' },
                                                            { id: 'cultura', label: 'Cultura & Adaptação' }
                                                        ]
                                                    }[selectedObjective as 'carreira' | 'viagem' | 'intercambio']?.find(f => f.id === selectedFocus)?.label}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-400">Nível:</span>
                                                <span className="text-white font-medium capitalize">
                                                    {[
                                                        { id: 'iniciante', label: 'Iniciante' },
                                                        { id: 'intermediario', label: 'Intermediário' },
                                                        { id: 'avancado', label: 'Avançado' },
                                                    ].find(l => l.id === selectedLevel)?.label}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Qtd. Questões:</span>
                                                <span className="text-white font-medium">{questionCount}</span>
                                            </div>
                                        </div>

                                        <div className={`flex items-center justify-between p-3 border rounded-lg ${((user?.creditBalance || 0) >= (questionCount * COST_PER_QUESTION)) ? 'bg-purple-900/20 border-purple-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                                            <span className={`font-medium ${((user?.creditBalance || 0) >= (questionCount * COST_PER_QUESTION)) ? 'text-purple-300' : 'text-red-300'}`}>Custo Total:</span>
                                            <div className={`flex items-center gap-1 font-bold text-lg ${((user?.creditBalance || 0) >= (questionCount * COST_PER_QUESTION)) ? 'text-purple-400' : 'text-red-400'}`}>
                                                <img src="https://cdn-icons-png.flaticon.com/512/12660/12660183.png" className="w-5 h-5" alt="C" />
                                                {questionCount * COST_PER_QUESTION}
                                            </div>
                                        </div>

                                        {!((user?.creditBalance || 0) >= (questionCount * COST_PER_QUESTION)) && (
                                            <p className="text-xs text-center text-red-500 font-medium">
                                                Saldo insuficiente ({user?.creditBalance || 0} créditos). Recarregue para continuar.
                                            </p>
                                        )}
                                        {((user?.creditBalance || 0) >= (questionCount * COST_PER_QUESTION)) && (
                                            <p className="text-xs text-center text-gray-500">
                                                Ao confirmar, os créditos serão debitados e o desafio começará imediatamente.
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            onClick={() => setShowCostModal(false)}
                                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl font-medium transition-colors"
                                        >
                                            Cancelar
                                        </Button>
                                        {((user?.creditBalance || 0) >= (questionCount * COST_PER_QUESTION)) ? (
                                            <Button
                                                onClick={handleStartGame}
                                                isLoading={loading}
                                                className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-600/20"
                                            >
                                                Confirmar
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => {
                                                    setShowCostModal(false);
                                                    setShowInsufficientModal(true);
                                                }}
                                                className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-600/20"
                                            >
                                                Recarregar
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                            <ArrowRight className="w-6 h-6 rotate-180" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Brain className="w-6 h-6 text-purple-500" /> Nexus Quiz
                            </h2>
                            <p className="text-gray-400 text-sm">Configure sua sessão de treinamento.</p>
                        </div>
                    </div>

                    {/* Config Card */}
                    <div className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full pb-8 scrollbar-hide">
                        <div className="grid grid-cols-1 gap-8">

                            {/* Gamification Dashboard */}
                            <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-3xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-24 bg-purple-500/5 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none" />

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
                                        <span className="text-gray-400 text-xs uppercase tracking-wider mb-2">Desempenho por Nível</span>
                                        <div className="space-y-2">
                                            {[
                                                { lvl: 'iniciante', score: 88 },
                                                { lvl: 'intermediario', score: 72 },
                                                { lvl: 'avancado', score: 58 }
                                            ].map(({ lvl, score }) => (
                                                <div key={lvl} className="flex items-center justify-between gap-2">
                                                    <span className="text-[10px] text-gray-400 capitalize w-16 truncate">{lvl}</span>
                                                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                            style={{ width: `${score}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-[10px] font-bold w-6 text-right ${score >= 70 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{score}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 1. Objective Selection */}
                            <section>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-purple-600 text-sm flex items-center justify-center font-bold">1</span>
                                    Objetivo
                                </h3>
                                <div className="relative">
                                    <select
                                        value={selectedObjective || ''}
                                        onChange={(e) => {
                                            setSelectedObjective(e.target.value);
                                            setSelectedFocus(null);
                                        }}
                                        className="w-full bg-gray-900 border border-gray-800 text-white p-4 rounded-xl appearance-none cursor-pointer focus:outline-none focus:border-purple-500 transition-colors"
                                    >
                                        <option value="" disabled>Selecione seu objetivo principal...</option>
                                        {[
                                            { id: 'carreira', label: 'Carreira & Negócios' },
                                            { id: 'viagem', label: 'Viagem e Turismo' },
                                            { id: 'intercambio', label: 'Intercâmbio & Estudos' },
                                        ].map(option => (
                                            <option key={option.id} value={option.id}>{option.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                            </section>

                            {/* 2. Focus Selection */}
                            <section>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-purple-600 text-sm flex items-center justify-center font-bold">2</span>
                                    Escolha o Foco
                                </h3>
                                <div className="relative">
                                    <select
                                        value={selectedFocus || ''}
                                        onChange={(e) => setSelectedFocus(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-800 text-white p-4 rounded-xl appearance-none cursor-pointer focus:outline-none focus:border-purple-500 transition-colors"
                                    >
                                        <option value="" disabled>
                                            {selectedObjective ? "Selecione uma área de foco..." : "Selecione um Objetivo primeiro..."}
                                        </option>
                                        {selectedObjective && {
                                            'carreira': [
                                                { id: 'negociacao', label: 'Negociação & Vendas' },
                                                { id: 'lideranca', label: 'Liderança & Gestão' },
                                                { id: 'marketing', label: 'Marketing & Branding' }
                                            ],
                                            'viagem': [
                                                { id: 'aeroporto', label: 'Aeroporto & Transporte' },
                                                { id: 'hotel', label: 'Hotel & Restaurante' },
                                                { id: 'social', label: 'Social & Lazer' }
                                            ],
                                            'intercambio': [
                                                { id: 'academico', label: 'Vida Acadêmica' },
                                                { id: 'acomodacao', label: 'Acomodação' },
                                                { id: 'cultura', label: 'Cultura & Adaptação' }
                                            ]
                                        }[selectedObjective as 'carreira' | 'viagem' | 'intercambio']?.map(option => (
                                            <option key={option.id} value={option.id}>{option.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                            </section>

                            {/* 3. Level Selection */}
                            <section>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-purple-600 text-sm flex items-center justify-center font-bold">3</span>
                                    Nível de Dificuldade
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'iniciante', label: 'Iniciante' },
                                        { id: 'intermediario', label: 'Intermediário' },
                                        { id: 'avancado', label: 'Avançado' },
                                    ].map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => setSelectedLevel(option.id)}
                                            className={`p-3 rounded-xl border text-center transition-all flex items-center justify-center h-14 ${selectedLevel === option.id
                                                ? 'bg-purple-600/20 border-purple-500 text-white'
                                                : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700 hover:bg-gray-800'
                                                }`}
                                        >
                                            <div className="font-semibold text-[10px] sm:text-xs md:text-sm w-full whitespace-normal leading-tight px-1 flex items-center justify-center h-full">
                                                {option.label}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* 4. Quantity Selection */}
                            <section>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-purple-600 text-sm flex items-center justify-center font-bold">4</span>
                                    Quantidade de Perguntas
                                </h3>
                                <div className="grid grid-cols-4 gap-4">
                                    {[5, 10, 15, 20].map(count => (
                                        <button
                                            key={count}
                                            onClick={() => setQuestionCount(count)}
                                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${questionCount === count
                                                ? 'bg-purple-600/20 border-purple-500 text-white'
                                                : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700 hover:bg-gray-800'
                                                }`}
                                        >
                                            <span className="font-bold text-lg">{count}</span>
                                            <span className="text-[10px] uppercase tracking-wider">Questões</span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Summary & Action */}
                            <div className="mt-8">
                                <Button
                                    onClick={handlePreStart}
                                    className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all text-lg ${selectedFocus && selectedLevel && selectedObjective
                                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20 transform hover:-translate-y-1'
                                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                        }`}
                                    disabled={!selectedFocus || !selectedLevel || !selectedObjective}
                                >
                                    Iniciar Desafio
                                </Button>
                            </div>

                        </div>
                    </div>
                </div>
            ) : gameState === 'PLAYING' ? (
                <div className="flex flex-col h-full bg-gray-950 p-6 max-w-3xl mx-auto w-full">
                    {/* Top Bar */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-400">Questão {currentQuestionIndex + 1}/{questions.length}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 rounded-full border border-gray-800">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-white font-mono">{score}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-gray-800 rounded-full mb-8">
                        <motion.div
                            className="h-full bg-purple-500 rounded-full"
                            initial={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    {/* Question */}
                    <div className="flex-1 flex flex-col justify-center">
                        <motion.div
                            key={questions[currentQuestionIndex].id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="mb-8"
                        >
                            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-8">
                                {questions[currentQuestionIndex].text}
                            </h2>

                            <div className="space-y-3">
                                {questions[currentQuestionIndex].options.map((opt, idx) => {
                                    const isSelected = selectedOption === idx;
                                    const isCorrect = idx === questions[currentQuestionIndex].correctIndex;
                                    const showStatus = isAnswered;

                                    let cardClass = "bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-gray-700";
                                    if (showStatus) {
                                        if (isCorrect) cardClass = "bg-green-500/10 border-green-500 text-green-100";
                                        else if (isSelected) cardClass = "bg-red-500/10 border-red-500 text-red-100";
                                        else cardClass = "bg-gray-900 border-gray-800 text-gray-500 opacity-50";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(idx)}
                                            disabled={isAnswered}
                                            className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group ${cardClass}`}
                                        >
                                            <span className="font-medium text-lg">{opt}</span>
                                            {showStatus && isCorrect && <CheckCircle className="w-6 h-6 text-green-500" />}
                                            {showStatus && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Feedback / Next Button */}
                        <AnimatePresence>
                            {isAnswered && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 p-4 bg-gray-900/80 border border-gray-800 rounded-xl"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-lg ${selectedOption === questions[currentQuestionIndex].correctIndex ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {selectedOption === questions[currentQuestionIndex].correctIndex ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-bold mb-1 ${selectedOption === questions[currentQuestionIndex].correctIndex ? 'text-green-400' : 'text-red-400'}`}>
                                                {selectedOption === questions[currentQuestionIndex].correctIndex ? 'Correto!' : 'Incorreto'}
                                            </h4>
                                            <p className="text-gray-300 text-sm leading-relaxed mb-4">{questions[currentQuestionIndex].explanation}</p>
                                            <Button onClick={nextQuestion} className="w-full bg-white text-black font-bold hover:bg-gray-200">
                                                {currentQuestionIndex < questions.length - 1 ? 'Próxima Questão' : 'Ver Resultados'}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            ) : gameState === 'RESULT' ? (
                <div className="flex flex-col h-full items-center justify-center bg-gray-950 p-6 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-8 relative"
                    >
                        <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
                        <Trophy className="w-32 h-32 text-yellow-500 relative z-10 mx-auto drop-shadow-2xl" />
                    </motion.div>

                    <h2 className={`text-4xl font-black mb-2 ${Math.round((score / questions.length) * 100) >= 80 ? 'text-green-400' : Math.round((score / questions.length) * 100) >= 50 ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {Math.round((score / questions.length) * 100) >= 80 ? 'Excelente!' : Math.round((score / questions.length) * 100) >= 50 ? 'Na Média' : 'Bom Esforço!'}
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-xs mx-auto">
                        {Math.round((score / questions.length) * 100) >= 80 ? 'Você domina este assunto.' : Math.round((score / questions.length) * 100) >= 50 ? 'Você tem uma boa base, mas pode melhorar.' : 'Continue praticando para chegar ao topo.'}
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
                            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Acertos</div>
                            <div className="text-2xl font-bold text-white">{score}/{questions.length}</div>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
                            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">XP Ganho</div>
                            <div className="text-2xl font-bold text-purple-400">+{score * 10} XP</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full max-w-sm">
                        <Button onClick={restartGame} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold">
                            <RotateCcw className="w-4 h-4 mr-2" /> Nova Rodada
                        </Button>
                        <button onClick={onBack} className="w-full text-gray-500 hover:text-white py-2 text-sm">
                            Voltar ao Menu
                        </button>
                    </div>
                </div>
            ) : null}

            {/* Global Modals */}
            <InsufficientFundsAlert
                isOpen={showInsufficientModal}
                onClose={() => setShowInsufficientModal(false)}
                onRecharge={() => {
                    setShowInsufficientModal(false);
                    if (navigateTo) navigateTo('recharge');
                    else toast.error("Navegação indisponível");
                }}
            />
        </>
    );
};
