import React, { useState } from 'react';
import { BookOpen, CheckCircle, AlertCircle, ChevronLeft, Target, Award } from '../../Icons';
import Button from '../../Button';
import toast from 'react-hot-toast';

interface OABQuizSimulatorProps {
    onBack: () => void;
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

export const OABQuizSimulator: React.FC<OABQuizSimulatorProps> = ({ onBack }) => {
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const question = MOCK_QUESTIONS[currentQuestionIdx];

    const handleAnswer = (idx: number) => {
        if (isAnswered) return;
        setSelectedOption(idx);
        setIsAnswered(true);
        if (idx === question.correct) {
            setScore(prev => prev + 1);
            toast.success("Resposta Correta!", { icon: '🎯' });
        } else {
            toast.error("Resposta Incorreta");
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIdx < MOCK_QUESTIONS.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
        }
    };

    const restartQuiz = () => {
        setCurrentQuestionIdx(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setShowResult(false);
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden flex flex-col min-h-[600px] relative">
            {/* Header */}
            <div className="bg-gray-950 p-6 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button onClick={onBack} className="!p-2 bg-gray-800 hover:bg-gray-700 rounded-full">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <span className="text-2xl">🎓</span> Simulado OAB <span className="text-[10px] bg-red-600 font-bold text-white px-2 py-0.5 rounded uppercase">1ª Fase</span>
                        </h2>
                        <p className="text-xs text-gray-400">Questões comentadas e atualizadas.</p>
                    </div>
                </div>
                <div className="bg-gray-800 px-3 py-1 rounded-full text-xs font-bold text-white border border-gray-700">
                    Questão {currentQuestionIdx + 1}/{MOCK_QUESTIONS.length}
                </div>
            </div>

            <div className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">

                {!showResult ? (
                    <div className="w-full space-y-8 animate-fade-in">
                        {/* Question Card */}
                        <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-700">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 block">{question.area}</span>
                            <h3 className="text-lg md:text-xl font-medium text-white leading-relaxed">{question.question}</h3>
                        </div>

                        {/* Options */}
                        <div className="grid gap-4">
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
                                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 text-sm md:text-base ${btnClass}`}
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
                                        {currentQuestionIdx < MOCK_QUESTIONS.length - 1 ? 'Próxima Questão' : 'Ver Resultado'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Quiz Result
                    <div className="text-center space-y-6 animate-fade-in">
                        <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-yellow-500 relative">
                            <Target className="w-12 h-12 text-yellow-500" />
                            <div className="absolute -bottom-2 -right-2 bg-gray-900 text-white font-black text-xs px-3 py-1 rounded-full border border-gray-700">OAB</div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-black text-white mb-2">Simulado Finalizado!</h2>
                            <p className="text-gray-400">Você acertou <strong className="text-white text-xl">{score}</strong> de <span className="text-gray-500">{MOCK_QUESTIONS.length}</span> questões.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <span className="block text-2xl font-black text-green-500">{(score / MOCK_QUESTIONS.length) * 100}%</span>
                                <span className="text-xs text-gray-500 uppercase font-bold">Aproveitamento</span>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <span className="block text-2xl font-black text-blue-500">2 min</span>
                                <span className="text-xs text-gray-500 uppercase font-bold">Tempo Médio</span>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 pt-4">
                            <Button onClick={onBack} className="!bg-gray-800 text-gray-300 border border-gray-700">Voltar ao Menu</Button>
                            <Button onClick={restartQuiz} className="!bg-red-600 hover:!bg-red-500 font-bold">Tentar Novamente</Button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
