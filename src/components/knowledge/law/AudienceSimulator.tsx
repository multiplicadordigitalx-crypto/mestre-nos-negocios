import React, { useState, useEffect } from 'react';

import { Mic, Play, MessageSquare, ChevronLeft, User, Volume2, AlertCircle, Award, Brain, Trophy, Activity, Sparkles, Star } from '../../Icons';
import Button from '../../Button';
import toast from 'react-hot-toast';

interface AudienceSimulatorProps {
    onBack: () => void;
}

import { useAuth } from '../../../hooks/useAuth';
import { consumeCredits } from '../../../services/mockFirebase';
import { InsufficientFundsAlert } from '../language/InsufficientFundsAlert';
import { StudentPage } from '../../../types';

export const AudienceSimulator: React.FC<AudienceSimulatorProps & { navigateTo?: (page: StudentPage) => void }> = ({ onBack, navigateTo }) => {
    const { user, refreshUser } = useAuth();
    const [status, setStatus] = useState<'idle' | 'listening' | 'speaking' | 'feedback'>('idle');
    const [transcript, setTranscript] = useState<string[]>([]);
    const [judgeMood, setJudgeMood] = useState<'neutral' | 'impressed' | 'annoyed'>('neutral');
    const transcriptContainerRef = React.useRef<HTMLDivElement>(null);
    const [showConfirmStart, setShowConfirmStart] = useState(false);
    const COST_PER_INTERACTION = 3;

    // Modal States
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);

    // Auto-scroll to bottom of transcript
    useEffect(() => {
        if (transcriptContainerRef.current) {
            transcriptContainerRef.current.scrollTo({
                top: transcriptContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [transcript, status]);

    const handleStartClick = () => {
        setShowConfirmStart(true);
    };

    const confirmStart = () => {
        if (user && (user.creditBalance || 0) < COST_PER_INTERACTION) {
            setShowConfirmStart(false);
            setShowInsufficientModal(true);
            return;
        }
        setShowConfirmStart(false);
        setStatus('speaking');
        setTranscript(prev => [...prev, "JUIZ (IA): Bom dia, Doutor(a). Estamos reunidos para a audiência de instrução do processo 10234. A palavra é sua para as considerações iniciais da defesa. Seja breve."]);
        setTimeout(() => setStatus('listening'), 4000);
    };

    const toggleMic = async () => {
        if (status === 'listening') {
            setStatus('speaking'); // Simulating "Processing" then Judge speaks
            // Simulate User Speech
            setTranscript(prev => [...prev, "VOCÊ: Excelência, a defesa sustenta que não houve vínculo empregatício, pois faltam os requisitos de habitualidade e subordinação..."]);

            // Credit Deduction Logic
            if (user) {
                // Check balance (optional here, consumeCredits checks too but good for UI)
                if ((user.creditBalance || 0) < COST_PER_INTERACTION) {
                    setShowInsufficientModal(true);
                    setTranscript(prev => [...prev, "SISTEMA: Saldo insuficiente para resposta do Juiz."]);
                    setStatus('feedback');
                    return;
                }

                // Deduct Credits
                const result = await consumeCredits(user.uid, 'audience_sim', COST_PER_INTERACTION, 'Simulador Audiência: Interação');
                if (result.success) {
                    toast.success(`-${COST_PER_INTERACTION} Créditos`, { icon: '⚖️', position: 'top-center' });
                    if (refreshUser) refreshUser();
                } else {
                    toast.error("Erro ao debitar créditos.");
                    return;
                }
            }

            setTimeout(() => {
                // Judge Responds
                setTranscript(prev => [...prev, "JUIZ (IA): Entendo. Mas e quanto às testemunhas que afirmam ter visto o reclamante na empresa todos os dias? Como o senhor explica isso?"]);
                setJudgeMood('annoyed');
                setStatus('listening');
            }, 3000);
        } else {
            toast("Aguarde a vez de falar...", { icon: '✋' });
        }
    };

    const finishSimulation = () => {
        setStatus('feedback');
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-none md:rounded-[2.5rem] overflow-hidden flex flex-col h-[calc(100vh-12rem)] md:min-h-[600px] relative mb-20 md:mb-0">

            {/* CONFIRMATION MODAL */}
            {showConfirmStart && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                                <Volume2 className="w-8 h-8 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Iniciar Simulação?</h3>
                            <p className="text-sm text-gray-400">
                                O Juiz Virtual irá interagir com você. Cada resposta da IA consome créditos.
                            </p>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-400">Custo por Interação:</span>
                                <span className="text-sm font-bold text-yellow-400">{COST_PER_INTERACTION} Créditos</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-700 pt-2">
                                <span className="text-sm text-gray-400">Seu Saldo:</span>
                                <span className={`text-sm font-bold ${user?.creditBalance && user.creditBalance >= COST_PER_INTERACTION ? 'text-green-400' : 'text-red-400'}`}>
                                    {user?.creditBalance?.toFixed(2) || 0} Créditos
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={() => setShowConfirmStart(false)} className="!bg-gray-800 hover:!bg-gray-700 text-gray-300">
                                Cancelar
                            </Button>
                            <Button onClick={confirmStart} className="!bg-blue-600 hover:!bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20">
                                Confirmar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-gray-950 p-4 md:p-6 border-b border-gray-800 flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-3 overflow-hidden w-full">
                    <Button onClick={onBack} className="!p-2 bg-gray-800 hover:bg-gray-700 rounded-full shrink-0">
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </Button>
                    <div className="min-w-0 flex items-center flex-1 gap-2">
                        <h2 className="text-sm md:text-xl font-black text-white truncate flex items-center min-w-0">
                            <span className="text-lg md:text-2xl mr-2 shrink-0">⚖️</span>
                            <span className="truncate">Simulador de Audiência</span>
                        </h2>
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase border border-blue-500/30 whitespace-nowrap shrink-0">
                            Voz AI
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col-reverse md:grid md:grid-cols-3 md:gap-8 p-0 md:p-10 overflow-hidden">

                {/* Visual Stage (Judge) */}
                <div className="h-[40%] md:h-auto md:col-span-2 bg-gray-950 md:rounded-3xl border-t md:border-t-0 md:border border-gray-800 relative flex flex-col shrink-0">
                    {/* Judge Avatar Area */}
                    <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 bg-gradient-to-b from-gray-900 to-gray-950 relative">
                        <div className={`w-16 h-16 md:w-32 md:h-32 rounded-2xl mb-2 md:mb-4 border-4 transition-colors ${judgeMood === 'neutral' ? 'border-gray-600 bg-gray-700' : judgeMood === 'impressed' ? 'border-green-500 bg-green-900' : 'border-red-500 bg-red-900'} flex items-center justify-center`}>
                            <User className="w-8 h-8 md:w-16 md:h-16 text-gray-300" />
                        </div>
                        <h3 className="text-sm md:text-lg font-bold text-white mb-0 md:mb-1">Juiz Virtual</h3>
                        <p className={`text-[10px] md:text-xs uppercase font-bold tracking-widest ${judgeMood === 'neutral' ? 'text-gray-500' : judgeMood === 'impressed' ? 'text-green-500' : 'text-red-500'}`}>
                            {judgeMood === 'neutral' ? 'Atento' : judgeMood === 'impressed' ? 'Impressionado' : 'Cético'}
                        </p>

                        {/* Audio visualizer bars (Fake) - Absolute to prevent layout shift */}
                        {status === 'speaking' && (
                            <div className="flex gap-1 h-4 md:h-8 items-end absolute bottom-2 right-4 md:static md:mt-6 opacity-50 md:opacity-100">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-1 md:w-2 bg-blue-500 rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="p-3 md:p-4 bg-gray-900 border-t border-gray-800 flex justify-center gap-3 md:gap-4 shrink-0 z-20">
                        {status === 'idle' ? (
                            <Button onClick={handleStartClick} className="!bg-green-600 hover:!bg-green-500 !py-2.5 !px-5 md:!py-4 md:!px-8 shadow-lg shadow-green-500/20 text-sm md:text-base font-bold text-white">
                                <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" /> <span className="text-white">Iniciar</span>
                            </Button>
                        ) : status === 'feedback' ? (
                            <Button onClick={() => setStatus('idle')} className="!bg-gray-700 text-white">Reiniciar</Button>
                        ) : (
                            <>
                                <button
                                    onClick={toggleMic}
                                    className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all select-none touch-manipulation ${status === 'listening' ? 'bg-red-600 hover:bg-red-500 shadow-xl shadow-red-600/30 scale-110 active:scale-95' : 'bg-gray-700 cursor-not-allowed opacity-50'}`}
                                >
                                    <Mic className="w-5 h-5 md:w-8 md:h-8 text-white pointer-events-none" />
                                </button>
                                <Button onClick={finishSimulation} className="!bg-gray-800 border border-red-900/50 text-red-400 hover:!bg-gray-700">
                                    Encerrar
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Transcript / Feedback */}
                <div className="flex-1 bg-gray-900 md:rounded-3xl md:border border-gray-800 flex flex-col min-h-0">
                    {status === 'feedback' ? (
                        <div className="animate-fade-in space-y-4 p-6 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between mb-6 bg-gray-950 p-4 rounded-2xl border border-gray-800">
                                <div>
                                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                        <Award className="w-5 h-5 text-yellow-500" />
                                        Desempenho Global
                                    </h3>
                                    <p className="text-xs text-gray-400">Média das competências avaliadas</p>
                                </div>
                                <div className="text-3xl font-black text-white bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                                    78
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Clareza</p>
                                        <span className="text-xs font-bold text-blue-400">85%</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[85%]"></div></div>
                                </div>
                                <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Argumentação Jurídica</p>
                                        <span className="text-xs font-bold text-yellow-400">60%</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-yellow-500 w-[60%]"></div></div>
                                </div>
                                <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Tom de Voz</p>
                                        <span className="text-xs font-bold text-green-400">90%</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[90%]"></div></div>
                                </div>
                                <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Controle Emocional</p>
                                        <span className="text-xs font-bold text-purple-400">75%</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[75%]"></div></div>
                                </div>
                            </div>
                            <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 mt-4">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-3 flex items-center gap-2">
                                    <Brain className="w-4 h-4" /> Análise Detalhada da Sessão
                                </p>
                                <div className="space-y-3 text-sm text-gray-300 leading-relaxed text-justify">
                                    <p>
                                        <strong className="text-blue-400">Pontos Fortes:</strong> Sua oratória demonstrou excelente <strong>Tom de Voz (90%)</strong>, mantendo a serenidade mesmo diante das provocações do Juiz. A <strong>Clareza (85%)</strong> na exposição dos fatos iniciais foi louvável, permitindo fácil compreensão da tese.
                                    </p>
                                    <p>
                                        <strong className="text-yellow-400">Pontos de Atenção:</strong> A <strong>Argumentação Jurídica (60%)</strong> precisa de reforço. Ao ser questionado sobre as testemunhas, a resposta careceu de embasamento técnico robusto, como a citação do <em>Princípio da Primazia da Realidade</em> ou jurisprudências específicas sobre contradita.
                                    </p>
                                    <p>
                                        <strong className="text-white">Dica do Mentor:</strong> Na próxima simulação, tente antecipar as objeções do magistrado. Prepare "vacinas" para pontos fracos do processo antes mesmo de serem levantados. Seu <strong>Controle Emocional (75%)</strong> foi bom, mas notei uma leve hesitação na voz na segunda intervenção. Respire fundo antes de responder a perguntas de pressão.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-gray-900/50">
                            <div className="p-3 md:p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10 shrink-0 flex justify-between items-center">
                                <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Transcrição</h3>
                                {transcript.length > 0 && <span className="text-[10px] text-green-500 animate-pulse flex items-center gap-1">● Gravando</span>}
                            </div>

                            <div
                                ref={transcriptContainerRef}
                                className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar scroll-smooth"
                            >
                                {transcript.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full">

                                        {/* Gamification Dashboard (New) */}
                                        <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl relative overflow-hidden max-w-sm w-full shadow-2xl">
                                            <div className="absolute top-0 right-0 p-24 bg-blue-500/5 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none" />

                                            <div className="flex items-center gap-2 mb-6 relative z-10">
                                                <Trophy className="w-5 h-5 text-yellow-500" />
                                                <h3 className="text-white font-bold text-lg">Seu Histórico</h3>
                                            </div>

                                            <div className="space-y-4 relative z-10">
                                                <div className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                                            <Activity className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Audiências</p>
                                                            <p className="text-white font-bold">18 Realizadas</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                                            <Star className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Média Oratória</p>
                                                            <p className="text-white font-bold">9.2 / 10</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                                                            <Sparkles className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Controle Emocional</p>
                                                            <p className="text-white font-bold">Impecável</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-gray-800 text-center">
                                                <p className="text-xs text-gray-500 italic">"A prática leva à perfeição nos tribunais."</p>
                                            </div>
                                        </div>

                                    </div>
                                )}
                                {transcript.map((line, i) => (
                                    <div key={i} className={`p-3 rounded-xl text-sm leading-relaxed animate-fade-in-up ${line.startsWith('VOCÊ') ? 'bg-blue-600/10 text-blue-200 border border-blue-500/10 ml-4' : 'bg-gray-800 text-gray-300 mr-4'}`}>
                                        <strong className={`block text-xs mb-1 ${line.startsWith('VOCÊ') ? 'text-blue-400' : 'text-gray-500'}`}>{line.split(':')[0]}</strong>
                                        {line.split(':')[1]}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

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
                requiredCredits={COST_PER_INTERACTION}
                currentCredits={user?.creditBalance || 0}
            />
        </div>
    );
};
