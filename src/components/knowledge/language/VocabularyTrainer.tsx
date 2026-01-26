import React, { useState } from 'react';
import { ChevronLeft, Zap, CheckCircle, Brain, Layers, Star, AlertCircle } from '../../Icons';
import { Trophy } from '../../../Icons';
import Button from '../../Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { consumeCredits } from '../../../services/mockFirebase';
import { InsufficientFundsAlert } from './InsufficientFundsAlert';

import { StudentPage } from '../../../types';

interface VocabularyTrainerProps {
    onBack: () => void;
    navigateTo?: (page: StudentPage) => void;
}

type SetupState = 'SETUP' | 'ESTIMATING' | 'ACTIVE' | 'ANALYSIS_POPUP' | 'SUMMARY';

export const VocabularyTrainer: React.FC<VocabularyTrainerProps> = ({ onBack, navigateTo }) => {
    const { user, refreshUser } = useAuth();
    const [step, setStep] = useState<SetupState>('SETUP');
    const [topic, setTopic] = useState('');
    const [category, setCategory] = useState('');
    const [cardCount, setCardCount] = useState(10);
    const [showProcessConfirm, setShowProcessConfirm] = useState(false);
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);

    const [reservedCredits, setReservedCredits] = useState(0);
    const [consumedCredits, setConsumedCredits] = useState(0);
    const [cardsReviewed, setCardsReviewed] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    const [currentCardIdx, setCurrentCardIdx] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const [difficulty, setDifficulty] = useState('BASIC');

    const DIFFICULTY_LEVELS = {
        'BASIC': { label: 'Básico', cost: 1, color: 'text-blue-400', border: 'border-blue-500/50' },
        'INTERMEDIATE': { label: 'Intermediário', cost: 2, color: 'text-purple-400', border: 'border-purple-500/50' },
        'ADVANCED': { label: 'Avançado', cost: 4, color: 'text-yellow-400', border: 'border-yellow-500/50' }
    };

    const getCostPerCard = () => DIFFICULTY_LEVELS[difficulty as keyof typeof DIFFICULTY_LEVELS].cost;

    const categories = [
        "Carreira & Negócios", "Viagens & Turismo", "Intercâmbio & Estudos"
    ];

    // Mock User Stats for Gamification Card
    const USER_VOCAB_STATS = {
        wordsLearned: 342,
        accuracy: 89,
        streak: 12,
        byCategory: {
            'Carreira & Negócios': 92,
            'Viagens & Turismo': 85,
            'Intercâmbio & Estudos': 78
        }
    };

    const getPlaceholderForCategory = (cat: string) => {
        switch (cat) {
            case "Carreira & Negócios": return "Ex: Reunião, Apresentação, Email, Negociação...";
            case "Viagens & Turismo": return "Ex: Aeroporto, Hotel, Restaurante, Táxi...";
            case "Intercâmbio & Estudos": return "Ex: Campus, Biblioteca, Matrícula, Dormitório...";
            default: return "Ex: Digite seu tema de interesse...";
        }
    };

    const mockDb = {
        "Carreira & Negócios": [
            { front: "Equity", back: "Patrimônio Líquido / Participação Acionária. Refere-se à propriedade de ações de uma empresa." },
            { front: "Revenue Stream", back: "Fonte de Receita. Uma forma específica pela qual uma empresa ganha dinheiro." },
            { front: "Overhead", back: "Despesas Gerais/Operacionais. Custos contínuos para administrar um negócio (aluguel, luz) não ligados diretamente à produção." }
        ],
        "Viagens & Turismo": [
            { front: "Itinerary", back: "Itinerário. O plano detalhado de uma viagem, incluindo locais a visitar e horários." },
            { front: "Customs", back: "Alfândega. O local no aeroporto onde os bens trazidos de outros países são verificados." },
            { front: "Concierge", back: "Concierge. Profissional em hotéis responsável por auxiliar hóspedes com reservas, passeios e informações." }
        ],
        "Intercâmbio & Estudos": [
            { front: "Syllabus", back: "Ementa/Programa do Curso. Documento que descreve os tópicos, leituras e avaliações de uma disciplina." },
            { front: "Dormitory", back: "Dormitório (Dorm). Acomodação estudantil dentro ou perto do campus universitário." },
            { front: "Grant", back: "Bolsa de Pesquisa/Subsídio. Ajuda financeira, geralmente para pesquisa, que não precisa ser reembolsada." }
        ]
    };

    const generateDeck = (topic: string, count: number, cat: string) => {
        const specificMocks = mockDb[cat as keyof typeof mockDb] || [];
        const deck = [];

        for (let i = 0; i < count; i++) {
            if (i < specificMocks.length) {
                deck.push({ id: i, ...specificMocks[i] });
            } else {
                deck.push({
                    id: i,
                    front: `Termo Executivo #${i + 1} (${topic})`,
                    back: `Definição formal e estratégica do termo #${i + 1} aplicada ao contexto de ${cat}. Exemplo de uso em frase corporativa.`
                });
            }
        }
        return deck;
    };

    const [deck, setDeck] = useState<any[]>([]);

    const handleInitialRequest = () => {
        if (!topic || !category) {
            toast.error("Preencha a categoria e o tópico para continuar.");
            return;
        }
        setReservedCredits(cardCount * getCostPerCard());
        setShowProcessConfirm(true);
    };

    const confirmProcessing = async () => {
        if (!user) {
            toast.error("Erro de autenticação. Recarregue a página.");
            return;
        }

        if ((user.creditBalance || 0) < reservedCredits) {
            setShowProcessConfirm(false);
            setShowInsufficientModal(true);
            return;
        }

        setShowProcessConfirm(false);
        setStep('ESTIMATING');

        const result = await consumeCredits(user.uid, 'nexus_vocabulary', reservedCredits, `Treinar Vocabulário: ${topic} (${cardCount} cards)`);

        if (!result.success) {
            setStep('SETUP');
            toast.error(result.message || "Erro ao processar pagamento.");
            return;
        }

        if (refreshUser) refreshUser();

        setTimeout(() => {
            setDeck(generateDeck(topic, cardCount, category));
            setConsumedCredits(reservedCredits);
            toast.success("Deck gerado com sucesso!", { icon: '🎓' });
            setStep('ACTIVE');
        }, 2000);
    };

    const handleFlip = () => setIsFlipped(!isFlipped);

    const handleNextCard = (remembered: boolean) => {
        if (remembered) setCorrectCount(prev => prev + 1);

        const newReviewed = cardsReviewed + 1;
        setCardsReviewed(newReviewed);

        setIsFlipped(false);
        if (currentCardIdx < deck.length - 1) {
            setCurrentCardIdx(prev => prev + 1);
        } else {
            finishSession(newReviewed);
        }
    };

    const finishSession = (_finalReviewedCount?: number) => {
        setStep('ANALYSIS_POPUP');
    };

    const closeAnalysis = () => {
        setStep('SUMMARY');
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden flex flex-col relative h-auto min-h-[600px]">
            {/* Header */}
            <div className="bg-gray-950/80 p-6 border-b border-gray-800 flex items-center justify-center relative backdrop-blur-md sticky top-0 z-20">
                <div className="absolute left-6">
                    <Button onClick={onBack} className="!p-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </div>
                <div className="text-center flex flex-col items-center justify-center">
                    <h2 className="text-xl md:text-2xl font-black text-white flex items-center justify-center gap-2 tracking-tight">
                        🧠 Treinar Vocabulário
                    </h2>
                    <p className="text-xs text-gray-400 font-medium">Flashcards Executivos com IA</p>
                </div>
                {step === 'ACTIVE' && (
                    <div className="absolute right-6 hidden md:flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-gray-300">Investimento: {reservedCredits} CR</span>
                    </div>
                )}
            </div>

            <div className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center max-w-4xl mx-auto w-full relative">

                {/* SETUP */}
                {step === 'SETUP' && (
                    <div className="max-w-md w-full space-y-6 animate-fade-in relative z-10">
                        {/* Gamification Dashboard */}
                        <div className="bg-gray-800/50 border border-gray-700 p-5 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-24 bg-indigo-500/5 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none" />

                            <div className="flex items-center gap-2 mb-6 relative z-10">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <h3 className="text-white font-bold text-lg">Seu Progresso</h3>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10">
                                <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                                    <span className="text-gray-400 text-xs uppercase tracking-wider">Palavras</span>
                                    <span className="text-2xl font-bold text-white">{USER_VOCAB_STATS.wordsLearned}</span>
                                </div>
                                <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                                    <span className="text-gray-400 text-xs uppercase tracking-wider">Precisão</span>
                                    <span className={`text-2xl font-bold ${USER_VOCAB_STATS.accuracy >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>{USER_VOCAB_STATS.accuracy}%</span>
                                </div>
                                <div className="col-span-2 bg-gray-900 border border-gray-800 p-3 rounded-2xl flex flex-col justify-center">
                                    <span className="text-gray-400 text-xs uppercase tracking-wider mb-2">Domínio por Área</span>
                                    <div className="space-y-2">
                                        {Object.entries(USER_VOCAB_STATS.byCategory).map(([cat, score]) => (
                                            <div key={cat} className="flex items-center justify-between gap-2">
                                                <span className="text-[10px] text-gray-400 truncate w-24">{cat.split(' ')[0]}</span>
                                                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                        style={{ width: `${score}%` }}
                                                    />
                                                </div>
                                                <span className={`text-[10px] font-bold w-6 text-right ${score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{score}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">Expanda seu Conhecimento</h3>
                            <p className="text-gray-400 text-sm">A IA selecionará termos de alta relevância para sua carreira.</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Área de Interesse</label>
                                <select className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={category} onChange={(e) => setCategory(e.target.value)}>
                                    <option value="">Selecione o objetivo...</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Foco Específico (Opcional)</label>
                                <input type="text" placeholder={getPlaceholderForCategory(category)} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={topic} onChange={(e) => setTopic(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nível de Senioridade</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(DIFFICULTY_LEVELS).map(([key, data]) => (
                                        <button
                                            key={key}
                                            onClick={() => setDifficulty(key)}
                                            className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${difficulty === key ? `bg-gray-800 ${data.border} ${data.color} ring-1 ring-offset-1 ring-offset-gray-900 ring-${data.color.split('-')[1]}-500` : 'bg-gray-800 border-gray-700 text-gray-500 hover:bg-gray-700'}`}
                                        >
                                            <span className="uppercase tracking-tighter">{data.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantidade de Cards</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[5, 10, 20].map(num => (
                                        <button key={num} onClick={() => setCardCount(num)} className={`p-3 rounded-xl border font-bold transition-all ${cardCount === num ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}>{num} Cards</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 pb-8 md:pb-0">
                            <Button onClick={handleInitialRequest} className="w-full !py-4 !bg-white !text-black hover:!bg-gray-200 font-black uppercase tracking-wider shadow-lg shadow-white/10">
                                <Zap className="w-5 h-5 mr-2" /> Iniciar Treinamento
                            </Button>
                        </div>
                    </div>
                )}

                {/* LOADING */}
                {step === 'ESTIMATING' && (
                    <div className="text-center space-y-4 animate-pulse py-20">
                        <Brain className="w-16 h-16 text-indigo-500 mx-auto animate-bounce" />
                        <h3 className="text-xl font-bold text-white">Consultando Base de Dados...</h3>
                        <p className="text-gray-500">A IA está curando os termos mais impactantes para você.</p>
                    </div>
                )}

                {/* CONFIRMATION POPUP */}
                {showProcessConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl animate-scale-up">
                            <div className="flex items-center gap-3 text-indigo-500 mb-2">
                                <Layers className="w-6 h-6" />
                                <h3 className="text-lg font-bold text-white">Investimento em Conhecimento</h3>
                            </div>
                            <p className="text-sm text-gray-300">
                                Gerando {cardCount} flashcards sobre <strong>{topic}</strong>.
                            </p>
                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Valor do Pacote:</span>
                                    <span className="text-white font-mono">{reservedCredits} Créditos</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-2 border-t border-gray-700 pt-2">
                                    <span>Seu Saldo:</span>
                                    <span className="text-green-400">{user?.creditBalance} Créditos</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={() => setShowProcessConfirm(false)} className="flex-1 !bg-gray-800 hover:!bg-gray-700 !text-white border border-gray-600">Cancelar</Button>
                                <Button onClick={confirmProcessing} className="flex-1 !bg-indigo-600 hover:!bg-indigo-500">Confirmar</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ACTIVE GAME */}
                {step === 'ACTIVE' && deck[currentCardIdx] && (
                    <div className="w-full max-w-2xl text-center space-y-8 animate-fade-in relative z-10 pb-8 md:pb-0">
                        <div className="flex justify-between items-center px-4">
                            <span className="text-gray-400 text-sm font-mono bg-gray-800 px-3 py-1 rounded-full">{currentCardIdx + 1} / {cardCount}</span>
                            <button onClick={() => finishSession(cardsReviewed)} className="text-xs text-red-400 hover:text-red-300 border border-red-900/50 bg-red-900/10 px-3 py-1 rounded-full text-center transition-colors hover:bg-red-900/30">
                                Encerrar Sessão
                            </button>
                        </div>
                        <div className="relative w-full h-[350px] cursor-pointer group" onClick={handleFlip} style={{ perspective: '1000px' }}>
                            <div className="relative w-full h-full transition-all duration-500" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                                <div className="absolute inset-0 bg-gray-800 border border-gray-600 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl hover:border-indigo-500 transition-colors" style={{ backfaceVisibility: 'hidden' }}>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Termo em Inglês</span>
                                    <h3 className="text-3xl font-bold text-white leading-relaxed">{deck[currentCardIdx].front}</h3>
                                    <p className="text-xs text-gray-500 mt-8 animate-pulse border border-gray-700 px-3 py-1 rounded-full">Clique para revelar</p>
                                </div>
                                <div className="absolute inset-0 bg-white border border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Significado & Uso</span>
                                    <p className="text-lg text-gray-800 leading-relaxed font-medium">{deck[currentCardIdx].back}</p>
                                </div>
                            </div>
                        </div>
                        <div className={`flex gap-4 justify-center transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
                            <button onClick={(e) => { e.stopPropagation(); handleNextCard(false); }} className="group relative overflow-hidden bg-red-100 hover:bg-red-200 text-red-600 border-2 border-red-200 hover:border-red-300 rounded-2xl w-40 h-16 shadow-[0_4px_0_rgb(239,68,68)] hover:shadow-[0_2px_0_rgb(239,68,68)] hover:translate-y-0.5 active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2">
                                <span className="text-2xl group-hover:animate-shake">🤔</span>
                                <div className="flex flex-col leading-none"><span className="text-xs font-bold uppercase tracking-wider opacity-70">Esqueci</span><span className="font-black text-sm">Revisar</span></div>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleNextCard(true); }} className="group relative overflow-hidden bg-green-100 hover:bg-green-200 text-green-600 border-2 border-green-200 hover:border-green-300 rounded-2xl w-40 h-16 shadow-[0_4px_0_rgb(34,197,94)] hover:shadow-[0_2px_0_rgb(34,197,94)] hover:translate-y-0.5 active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2">
                                <span className="text-2xl group-hover:animate-bounce">🎯</span>
                                <div className="flex flex-col leading-none"><span className="text-xs font-bold uppercase tracking-wider opacity-70">Acertei</span><span className="font-black text-sm">Dominado</span></div>
                            </button>
                        </div>
                    </div>
                )}

                {/* AI ANALYSIS POP-UP */}
                {step === 'ANALYSIS_POPUP' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
                        <div className="bg-gray-900 border border-indigo-500/50 p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500"></div>

                            <div className="text-center">
                                <div className="inline-block p-4 rounded-full bg-yellow-500/10 mb-4 border border-yellow-500/20">
                                    <Star className="w-12 h-12 text-yellow-500 animate-spin-slow" />
                                </div>
                                <h2 className="text-2xl font-black text-white italic transform -rotate-2">
                                    {correctCount > (cardsReviewed / 2) ? "RESULTADO EXCELENTE!" : "CONTINUE PRATICANDO"}
                                </h2>
                                <p className="text-gray-400 text-sm mt-2">Você dominou {correctCount} de {cardsReviewed} termos.</p>
                            </div>

                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Brain className="w-4 h-4" /> Feedback da IA
                                </h4>
                                <p className="text-sm text-gray-300 leading-relaxed italic">
                                    "{correctCount > (cardsReviewed / 2)
                                        ? "Sua retenção de vocabulário técnico está impressionante. Estes termos elevarão o nível da sua comunicação em reuniões internacionais."
                                        : "Bom esforço inicial. Recomendamos focar na aplicação destes termos em frases completas para fixar o contexto de uso."}"
                                </p>
                            </div>

                            <Button onClick={closeAnalysis} className="w-full !py-4 !bg-white !text-black hover:scale-105 font-black uppercase tracking-widest shadow-xl">
                                Ver Extrato & Fechar
                            </Button>
                        </div>
                    </div>
                )}


                {/* SUMMARY (EXTRATO) */}
                {step === 'SUMMARY' && (
                    <div className="text-center space-y-8 animate-fade-in max-w-md w-full relative z-10 py-10">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto relative">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white mb-2">Sessão Concluída</h2>
                            <p className="text-gray-400">Extrato final da operação.</p>
                        </div>
                        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-4 shadow-xl">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm text-gray-500 px-2">
                                    <span>Saldo Anterior</span>
                                    <span className="font-mono">{(user?.creditBalance || 0) + consumedCredits} CR</span>
                                </div>

                                <div className="flex justify-between items-center text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                    <span className="font-bold text-sm">Treinamento ({cardCount} termos)</span>
                                    <span className="font-mono font-black text-lg">-{consumedCredits} CR</span>
                                </div>

                                <div className="flex justify-between items-center border-t border-gray-700 pt-4 px-2">
                                    <span className="text-gray-300 font-bold uppercase text-xs tracking-wider">Saldo Final</span>
                                    <span className={`font-mono font-black text-2xl ${(user?.creditBalance || 0) < 10 ? 'text-red-500' : 'text-green-500'}`}>
                                        {user?.creditBalance || 0} CR
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button onClick={() => { setStep('SETUP'); setCardsReviewed(0); setCorrectCount(0); setCurrentCardIdx(0); }} className="w-full !py-4 font-bold !bg-white !text-black border border-gray-300 hover:!bg-gray-200">
                            Novo Treinamento
                        </Button>
                    </div>
                )}

            </div>
            {/* Footer Note */}
            <div className="p-4 border-t border-gray-800 bg-gray-950/50 flex items-center justify-center gap-2 text-center">
                <AlertCircle className="w-4 h-4 text-gray-600" />
                <p className="text-[10px] text-gray-500 max-w-lg">
                    <strong>Nota:</strong> Ferramenta de aprendizado acelerado. A prática constante é essencial para a fluência.
                </p>
            </div>
            {/* Insufficient Funds Modal */}
            <InsufficientFundsAlert
                isOpen={showInsufficientModal}
                onClose={() => setShowInsufficientModal(false)}
                onRecharge={() => {
                    setShowInsufficientModal(false);
                    if (navigateTo) navigateTo('recharge');
                    else toast.error("Navegação indisponível");
                }}
            />
        </div>
    );
};
