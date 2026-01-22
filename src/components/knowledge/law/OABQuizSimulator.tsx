import React, { useState } from 'react';
import { Trophy, TrendingUp, Target as LucideTarget, BarChart2 } from 'lucide-react';
import { BookOpen, CheckCircle, AlertCircle, ChevronLeft, Target, Award, Brain } from '../../Icons';
import Button from '../../Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { consumeCredits } from '../../../services/mockFirebase';
import { InsufficientFundsAlert } from '../language/InsufficientFundsAlert';
import { StudentPage } from '../../../types';

interface OABQuizSimulatorProps {
    onBack: () => void;
    navigateTo?: (page: StudentPage) => void;
}

// Mock Questions Database
const MOCK_QUESTIONS = [
    {
        id: 1,
        area: 'Ética Profissional',
        question: 'O advogado recém-inscrito na OAB, João, deseja fazer publicidade de seus serviços. Segundo o Código de Ética e Disciplina, é PERMITIDO:',
        options: [
            'A) Utilizar outdoors e painéis luminosos próximos ao escritório.',
            'B) Divulgar seus serviços em rádio e televisão.',
            'C) Mencionar cargo público que exerça para captar clientela.',
            'D) Veicular anúncios discretos e informativos em jornais e revistas.'
        ],
        correct: 3, // Index D (0-based -> 3)
        explanation: "Correto! O Código de Ética permite a publicidade informativa, discreta e sóbria. Outdoors, Rádio/TV e uso de cargo público são vedações expressas (Arts. 28 a 34 do CED)."
    },
    {
        id: 2,
        area: 'Direito Constitucional',
        question: 'Sobre os direitos e garantias fundamentais, é correto afirmar que a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, SALVO em caso de:',
        options: [
            'A) Flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial.',
            'B) Determinação judicial, a qualquer hora do dia ou da noite.',
            'C) Suspeita de crime, mediante autorização do delegado de polícia.',
            'D) Fiscalização tributária, independentemente de horário.'
        ],
        correct: 0,
        explanation: "Exato! Art. 5º, XI, CF/88: 'a casa é asilo inviolável... salvo em caso de flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial'."
    }
];

export const OABQuizSimulator: React.FC<OABQuizSimulatorProps> = ({ onBack, navigateTo }) => {
    const { user, refreshUser } = useAuth();
    const [quizStatus, setQuizStatus] = useState<'WELCOME' | 'SETUP' | 'ACTIVE' | 'RESULT'>('WELCOME');
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [userAnswers, setUserAnswers] = useState<{ questionId: number, area: string, correct: boolean }[]>([]);
    const [consumedCredits, setConsumedCredits] = useState(0);
    const [selectedCount, setSelectedCount] = useState(5);

    // Modal States
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);

    const COST_PER_QUESTION = 2;
    const totalCost = selectedCount * COST_PER_QUESTION;

    const startQuiz = async () => {
        if (!user) return;

        if ((user.creditBalance || 0) < totalCost) {
            setShowInsufficientModal(true);
            return;
        }

        // CHARGE UPFRONT (PROTECTED PROFIT)
        const result = await consumeCredits(user.uid, 'simulado_oab', totalCost, `Simulado OAB: ${selectedCount} Questões`);
        if (!result.success) {
            toast.error(result.message || "Erro ao debitar créditos.");
            return;
        }
        toast.success(`Simulado iniciado! -${totalCost} Créditos debitados.`, { icon: '🎓' });

        if (refreshUser) refreshUser();

        setConsumedCredits(totalCost);
        setQuizStatus('ACTIVE');
    };

    const question = MOCK_QUESTIONS[currentQuestionIdx % MOCK_QUESTIONS.length]; // Cycle through mock questions if we select more than we have

    const handleAnswer = (idx: number) => {
        if (isAnswered) return;
        setSelectedOption(idx);
        setIsAnswered(true);

        const isCorrect = idx === question.correct;
        if (isCorrect) {
            setScore(prev => prev + 1);
            toast.success("Resposta Correta!", { icon: '🎯' });
        } else {
            toast.error("Resposta Incorreta");
        }

        // Track History
        setUserAnswers(prev => [...prev, {
            questionId: question.id,
            area: question.area,
            correct: isCorrect
        }]);
    };

    const nextQuestion = () => {
        if (currentQuestionIdx < selectedCount - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setQuizStatus('RESULT');
        }
    };

    const restartQuiz = () => {
        setQuizStatus('WELCOME');
        setCurrentQuestionIdx(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setUserAnswers([]);
    };

    // AI Analysis Logic
    const getAIAnalysis = () => {
        if (userAnswers.length === 0) return null;
        const accuracy = (score / selectedCount) * 100;

        // Find weak area
        const wrongAnswers = userAnswers.filter(a => !a.correct);
        const areaCounts: { [key: string]: number } = {};
        wrongAnswers.forEach(a => {
            areaCounts[a.area] = (areaCounts[a.area] || 0) + 1;
        });
        let weakArea: string | null = null;
        let maxWrong = 0;
        for (const area in areaCounts) {
            if (areaCounts[area] > maxWrong) {
                maxWrong = areaCounts[area];
                weakArea = area;
            }
        }

        if (accuracy === 100) return {
            title: "Performance Impecável! 🏆",
            message: "Você dominou essa rodada. Continue assim para garantir sua aprovação.",
            action: "Experimente aumentar a dificuldade na próxima!"
        };

        if (accuracy >= 70) return {
            title: "Excelente Resultado! 🚀",
            message: "Você está no caminho certo. Pequenos ajustes te levarão à perfeição.",
            action: weakArea ? `Revisão sugerida: Foco em ${weakArea}.` : "Mantenha o ritmo!"
        };

        return {
            title: "Atenção necessária ⚠️",
            message: "Identificamos lacunas em conceitos fundamentais.",
            action: weakArea ? `🚨 DICA IA: Vá para o JurisMemória e treine "${weakArea}" para fixar este conteúdo!` : "Revise as questões erradas abaixo."
        };
    };

    const analysis = getAIAnalysis();

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden flex flex-col min-h-[600px] relative">
            {/* Header - Always show Back Button */}
            <div className="bg-gray-950 p-6 border-b border-gray-800 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Button onClick={onBack} className="!p-2 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 transition-all hover:scale-105 active:scale-95">
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </Button>
                    <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <span className="text-2xl">🎓</span> Simulado OAB
                        </h2>
                    </div>
                </div>
                {quizStatus === 'ACTIVE' && (
                    <div className="bg-gray-800 px-3 py-1 rounded-full text-xs font-bold text-white border border-gray-700">
                        {currentQuestionIdx + 1}/{selectedCount}
                    </div>
                )}
            </div>

            <div className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center max-w-4xl mx-auto w-full relative">

                {/* VISUAL LAYERS / DECORATION */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none -z-10" />


                {/* WELCOME SCREEN (SALES MODE) */}
                {quizStatus === 'WELCOME' && (
                    <div className="text-center space-y-8 animate-fade-in max-w-md mx-auto">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 animate-pulse" />
                            <Target className="w-20 h-20 text-red-500 relative z-10 mx-auto" />
                        </div>

                        <div>
                            <h2 className="text-3xl font-black text-white mb-4">Treino de Elite</h2>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                A única plataforma que simula o <span className="text-white font-bold">estresse real</span> da prova com correção instantânea por Inteligência Artificial.
                            </p>
                        </div>

                        {/* Gamification Dashboard (New) */}
                        <div className="bg-gray-800/80 border border-gray-700 p-5 rounded-3xl relative overflow-hidden mb-8 text-left">
                            <div className="flex items-center gap-2 mb-4">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <h3 className="text-white font-bold text-sm uppercase tracking-wide">Seus Resultados</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <LucideTarget className="w-4 h-4 text-red-500" />
                                        <span className="text-gray-400 text-[10px] uppercase tracking-wider">Simulados</span>
                                    </div>
                                    <span className="text-2xl font-bold text-white">42</span>
                                </div>
                                <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <BarChart2 className="w-4 h-4 text-blue-500" />
                                        <span className="text-gray-400 text-[10px] uppercase tracking-wider">Média Geral</span>
                                    </div>
                                    <span className="text-2xl font-bold text-blue-400">71%</span>
                                </div>
                                <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl col-span-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400 text-[10px] uppercase tracking-wider">Área Forte</span>
                                        <span className="text-xs font-bold text-green-400">Dir. Constitucional</span>
                                    </div>
                                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[85%]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex items-center gap-3">
                                <Award className="w-8 h-8 text-yellow-500" />
                                <div>
                                    <h4 className="font-bold text-white text-sm">Feedback IA</h4>
                                    <p className="text-xs text-gray-500">Explicação detalhada</p>
                                </div>
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-blue-500" />
                                <div>
                                    <h4 className="font-bold text-white text-sm">Atualizado</h4>
                                    <p className="text-xs text-gray-500">Lei vigente 2024</p>
                                </div>
                            </div>
                        </div>

                        <Button onClick={() => setQuizStatus('SETUP')} className="w-full !py-4 !bg-white !text-black font-black uppercase tracking-widest hover:scale-105 shadow-xl transition-all">
                            Iniciar Preparação
                        </Button>
                    </div>
                )}


                {/* SETUP (PACKAGE SELECTION) */}
                {quizStatus === 'SETUP' && (
                    <div className="text-center space-y-8 animate-fade-in max-w-md w-full">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Escolha seu Ritmo</h3>
                            <p className="text-gray-400 text-sm">Selecione a intensidade do seu treino hoje.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[2, 5, 10].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setSelectedCount(num)}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${selectedCount === num
                                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/50 scale-105'
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-gray-500'
                                        }`}
                                >
                                    <span className="text-2xl font-black">{num}</span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Questões</span>
                                </button>
                            ))}
                        </div>

                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Preço por questão</span>
                                <span className="text-gray-300 font-mono">{COST_PER_QUESTION} CR</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-600">
                                <span className="text-gray-400 text-sm">Custo do Pacote</span>
                                <span className="text-white font-mono font-bold text-2xl">{totalCost} CR</span>
                            </div>
                            <div className="bg-red-500/10 p-2 rounded-lg text-center">
                                <p className="text-[10px] text-red-300">
                                    Valor debitado integralmente no início. Sem reembolso para desistência.
                                </p>
                            </div>
                        </div>

                        <Button onClick={startQuiz} className="w-full !py-4 !bg-red-600 hover:!bg-red-500 font-black uppercase tracking-widest shadow-lg shadow-red-900/20">
                            Confirmar Pagamento
                        </Button>
                    </div>
                )}


                {/* ACTIVE QUIZ */}
                {quizStatus === 'ACTIVE' && (
                    <div className="w-full space-y-8 animate-fade-in">
                        {/* Question Card */}
                        <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-700 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Target className="w-32 h-32 text-white" />
                            </div>
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 block relative z-10">{question.area}</span>
                            <h3 className="text-lg md:text-xl font-medium text-white leading-relaxed relative z-10">{question.question}</h3>
                        </div>

                        {/* Options */}
                        <div className="grid gap-3">
                            {question.options.map((opt, idx) => {
                                let btnClass = "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300";
                                if (isAnswered) {
                                    if (idx === question.correct) btnClass = "bg-green-600 border-green-500 text-white font-bold ring-2 ring-green-500/30";
                                    else if (idx === selectedOption) btnClass = "bg-red-600 border-red-500 text-white opacity-50";
                                    else btnClass = "bg-gray-800 border-gray-700 opacity-50";
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        disabled={isAnswered}
                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-300 text-sm md:text-base ${btnClass}`}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Explanation & Next */}
                        {isAnswered && (
                            <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl animate-fade-in-up">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 mt-1">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm mb-1">Comentário do Professor (IA)</h4>
                                        <p className="text-sm text-gray-300 leading-relaxed">{question.explanation}</p>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <Button onClick={nextQuestion} className="!bg-white !text-black !font-black !px-8 hover:scale-105 transition-transform">
                                        {currentQuestionIdx < selectedCount - 1 ? 'Próxima Questão' : 'Ver Resultado'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {/* RESULT SCREEN (NEW ENHANCED) */}
                {quizStatus === 'RESULT' && analysis && (
                    <div className="text-center space-y-6 animate-fade-in w-full max-w-md mx-auto">

                        {/* 1. Header & Score */}
                        <div className="bg-gray-800 rounded-3xl p-6 border border-gray-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-10 -mt-10" />

                            <h2 className="text-white font-bold text-lg mb-4">Relatório de Performance</h2>

                            <div className="flex justify-center items-center gap-4 mb-4">
                                <div className="w-24 h-24 rounded-full border-4 border-gray-700 flex items-center justify-center relative">
                                    <span className="text-2xl font-black text-white">{Math.round((score / selectedCount) * 100)}%</span>
                                    <div className="absolute inset-0 border-4 border-green-500 rounded-full opacity-50" style={{ clipPath: `inset(0 0 ${100 - ((score / selectedCount) * 100)}% 0)` }} />
                                </div>
                                <div className="text-left">
                                    <div className="text-3xl font-black text-white">{score}/{selectedCount}</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">Acertos</div>
                                </div>
                            </div>

                            {/* AI Insight */}
                            <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4 text-left">
                                <h4 className="flex items-center gap-2 text-blue-300 font-bold text-sm mb-1">
                                    <Brain className="w-4 h-4" /> {analysis.title}
                                </h4>
                                <p className="text-sm text-gray-200 mb-2">{analysis.message}</p>
                                <div className="bg-blue-900/50 p-2 rounded-lg border border-blue-500/20 flex items-start gap-2">
                                    <Target className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                                    <span className="text-xs text-yellow-100 font-medium">{analysis.action}</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Review List (Accordion Style) */}
                        <div className="space-y-3">
                            <h3 className="text-left text-gray-400 text-xs font-bold uppercase tracking-wider ml-2">Revisão Rápida</h3>
                            {userAnswers.map((ans, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border text-left ${ans.correct ? 'bg-green-900/10 border-green-900/30' : 'bg-red-900/10 border-red-900/30'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${ans.correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            Questão {idx + 1}
                                        </span>
                                        <span className="text-[10px] text-gray-500">{ans.area}</span>
                                    </div>
                                    <p className="text-gray-300 text-xs line-clamp-2">
                                        {MOCK_QUESTIONS.find(m => m.id === ans.questionId)?.question}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* 3. Financial Statement (Toggle or Fixed) */}
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">Investimento da Sessão</span>
                                <span className="text-red-400 font-bold">-{consumedCredits} CR</span>
                            </div>
                            <div className="flex justify-between items-center text-xs mt-1">
                                <span className="text-gray-500">Saldo Remanescente</span>
                                <span className="text-green-400 font-bold">{user?.creditBalance} CR</span>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 pt-4">
                            <Button onClick={onBack} className="!bg-gray-800 text-gray-300 border border-gray-700">Voltar</Button>
                            <Button onClick={restartQuiz} className="!bg-red-600 hover:!bg-red-500 font-bold">Novo Simulado</Button>
                        </div>
                    </div>
                )}

            </div>
            {/* Footer Note */}
            <div className="p-4 border-t border-gray-800 bg-gray-950/50 flex items-center justify-center gap-2 text-center mt-auto">
                <AlertCircle className="w-4 h-4 text-gray-600" />
                <p className="text-[10px] text-gray-500 max-w-lg">
                    <strong>Nota:</strong> Ferramenta baseada em IA. As respostas servem de auxílio e aprendizado, não substituem consultoria legal oficial.
                </p>
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
                requiredCredits={totalCost}
                currentCredits={user?.creditBalance || 0}
            />
        </div>
    );
};
