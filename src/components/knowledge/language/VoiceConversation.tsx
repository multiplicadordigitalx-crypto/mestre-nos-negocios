import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, User, Briefcase, StopCircle, Loader2, ShieldCheck, Play, Volume2, AlertCircle, ArrowLeft, X, Globe, MessageSquare } from '../../../Icons';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { consumeCredits } from '../../../services/mockFirebase';
import { InsufficientFundsAlert } from './InsufficientFundsAlert';
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition';
import { LanguageAnalysisService } from '../../../services/LanguageAnalysisService';
import { StudentPage } from '../../../types';

// Mock types
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

const DIFFICULTY_LEVELS = [
    { id: 'BASIC', label: 'Básico', description: 'Reunião de rotina. Ritmo lento.', cost: 2, color: 'text-green-400', border: 'border-green-500/50' },
    { id: 'INTERMEDIATE', label: 'Intermediário', description: 'Negociação de contrato. Ritmo normal.', cost: 4, color: 'text-yellow-400', border: 'border-yellow-500/50' },
    { id: 'ADVANCED', label: 'Avançado', description: 'Crise Management. Ritmo acelerado.', cost: 6, color: 'text-red-400', border: 'border-red-500/50' }
];

export interface MissionContext {
    type: 'mission_conversation';
    region: string;
    mission: string;
    description: string;
    difficulty: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
    cost: number;
}

export const VoiceConversation: React.FC<{ onBack?: () => void; initialContext?: MissionContext; navigateTo?: (page: StudentPage) => void }> = ({ onBack, initialContext, navigateTo }) => {
    const { user, refreshUser } = useAuth();
    // If initialContext exists, start active immediately
    const [isActive, setIsActive] = useState(!!initialContext);
    const [showConfirmStart, setShowConfirmStart] = useState(false);
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);

    // Legacy support for Generic Mode, synced with mission difficulty if provided
    const [selectedLevel, setSelectedLevel] = useState(() => {
        if (initialContext?.difficulty) {
            return DIFFICULTY_LEVELS.find(l => l.id === initialContext.difficulty) || DIFFICULTY_LEVELS[0];
        }
        return DIFFICULTY_LEVELS[0];
    });

    const { isListening, startListening, stopListening, transcript: liveTranscript, isSupported } = useSpeechRecognition(undefined, 'en-US');
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');

    // Audio Wave Simulation
    const [audioLevels, setAudioLevels] = useState<number[]>([10, 20, 15, 30, 20, 10]);

    useEffect(() => {
        console.log("[VoiceConversation] Mounted with context:", initialContext);
        if (initialContext) {
            setIsActive(true);
            // Ensure level is synced
            const level = DIFFICULTY_LEVELS.find(l => l.id === initialContext.difficulty);
            if (level) setSelectedLevel(level);

            // Initialize mission chat with context-aware complexity
            const difficultyLabel = initialContext.difficulty === 'BASIC' ? 'Nível Básico' : initialContext.difficulty === 'INTERMEDIATE' ? 'Nível Intermediário' : 'Nível Avançado';

            setMessages([{
                id: '1',
                role: 'assistant',
                content: `Bem-vindo a ${initialContext.region} (${difficultyLabel}). Eu sou seu contato local. Sua missão é: ${initialContext.mission}. A complexidade da conversa será analisada em tempo real. Vamos começar? (Fale em inglês)`,
                timestamp: Date.now()
            }]);
        }
    }, [initialContext]);

    // Sync isRecording with isListening from hook
    useEffect(() => {
        setIsRecording(isListening);
    }, [isListening]);

    useEffect(() => {
        if (isRecording) {
            const interval = setInterval(() => {
                setAudioLevels(Array.from({ length: 6 }, () => Math.floor(Math.random() * 40) + 10));
            }, 100);
            return () => clearInterval(interval);
        } else {
            setAudioLevels([10, 10, 10, 10, 10, 10]);
        }
    }, [isRecording]);

    const handleStartClick = () => {
        setShowConfirmStart(true);
    };

    const confirmStart = async () => {
        if (!user) return;

        if ((user.creditBalance || 0) < selectedLevel.cost) {
            setShowConfirmStart(false);
            setShowInsufficientModal(true);
            return;
        }

        const result = await consumeCredits(user.uid, 'boardroom_sim', selectedLevel.cost, `Boardroom Sim: ${selectedLevel.label}`);

        if (result.success) {
            toast.success(`Simulação Iniciada (-${selectedLevel.cost} Créditos)`);
            if (refreshUser) refreshUser();
            setShowConfirmStart(false);
            setIsActive(true);
            setMessages([{
                id: '1',
                role: 'assistant',
                content: "Bom dia. O Conselho está pronto. Estamos aguardando sua proposta sobre a fusão em Berlim. Pode começar (em inglês, por favor).",
                timestamp: Date.now()
            }]);
        } else {
            toast.error("Erro ao processar créditos.");
        }
    };

    const handleSendMessage = async (textOverride?: string) => {
        const textToSend = textOverride || inputText;
        if (!textToSend.trim()) return;

        const newMessage: Message = { id: Date.now().toString(), role: 'user', content: textToSend, timestamp: Date.now() };
        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        setIsProcessing(true);

        try {
            // Use real Language Analysis with Gemini
            const aiResponse = await LanguageAnalysisService.analyzeSpeech(textToSend, {
                mission: initialContext?.mission || "General business negotiation",
                region: initialContext?.region || "Corporate HQ",
                difficulty: initialContext?.difficulty || selectedLevel.id,
                role: "Senior Executive Board Member"
            });

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiResponse,
                timestamp: Date.now()
            }]);
        } catch (error) {
            console.error("AI Error:", error);
            toast.error("Erro na comunicação com a IA.");
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleRecording = () => {
        if (!isSupported) {
            toast.error("Seu navegador não suporta reconhecimento de voz.");
            return;
        }

        if (isRecording) {
            stopListening();
            // The hook will trigger effect to sync and we wait for transcript
            if (liveTranscript) {
                handleSendMessage(liveTranscript);
            }
        } else {
            startListening();
        }
    };

    // SETUP SCREEN
    if (!isActive) {
        return (
            <div className="flex flex-col h-full bg-black/40 border border-gray-800 rounded-2xl overflow-hidden relative">

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
                                    O Conselho Virtual irá interagir com você. Esta sessão consome créditos.
                                </p>
                            </div>

                            <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-400">Custo da Sessão:</span>
                                    <span className="text-sm font-bold text-yellow-400">{selectedLevel.cost} Créditos</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-gray-700 pt-2">
                                    <span className="text-sm text-gray-400">Seu Saldo:</span>
                                    <span className={`text-sm font-bold ${user?.creditBalance && user.creditBalance >= selectedLevel.cost ? 'text-green-400' : 'text-red-400'}`}>
                                        {user?.creditBalance?.toFixed(2) || 0} Créditos
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setShowConfirmStart(false)} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors font-medium">
                                    Cancelar
                                </button>
                                <button onClick={confirmStart} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-colors">
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden relative">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="absolute top-4 left-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div className="text-center mb-6 shrink-0 mt-8 md:mt-0">
                        <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 border ${initialContext ? 'bg-blue-600/20 border-blue-500/30' : 'bg-indigo-600/20 border-indigo-500/30'}`}>
                            {initialContext ? <Globe className="w-6 h-6 md:w-8 md:h-8 text-blue-400" /> : <Mic className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" />}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                            {initialContext ? `Missão: ${initialContext.region}` : 'Boardroom Simulator'}
                        </h2>
                        <p className="text-gray-400 text-xs md:text-base max-w-md mx-auto">
                            {initialContext ? initialContext.mission : 'Selecione o nível de dificuldade.'}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 space-y-3 mb-4 pr-1 scrollbar-hide">
                        {DIFFICULTY_LEVELS.map((level) => (
                            <button
                                key={level.id}
                                onClick={() => setSelectedLevel(level)}
                                className={`w-full p-4 rounded-xl border transition-all text-left group relative overflow-hidden shrink-0 flex items-center justify-between ${selectedLevel.id === level.id
                                    ? `bg-gray-800 ${level.border} ring-1 ring-${level.color.split('-')[1]}-500`
                                    : 'bg-gray-900 border-gray-800 hover:bg-gray-800'}`}
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-gray-700 to-transparent opacity-20"></div>

                                <div className="flex-1 min-w-0 pr-4 relative z-10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`text-base font-bold ${level.color}`}>{level.label}</h3>
                                        <div className="text-[10px] font-bold bg-black/40 px-2 py-0.5 rounded text-gray-400 border border-white/5">
                                            {level.cost} CR
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 line-clamp-1">{level.description}</p>
                                </div>

                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${selectedLevel.id === level.id ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-gray-800 border-gray-700 text-gray-600'}`}>
                                    <Briefcase className="w-5 h-5" />
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="shrink-0 pt-2">
                        <button
                            onClick={handleStartClick}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black rounded-xl font-black text-base uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                        >
                            <Play className="w-5 h-5 fill-black" />
                            Iniciar Simulação
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-h-[85vh] bg-black/40 rounded-2xl overflow-hidden relative">

            {/* Header: Secure Line */}
            <div className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]"></div>
                    <span className="text-red-500 font-mono text-xs tracking-widest uppercase">Gravando • Reunião em Andamento</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded border ${selectedLevel.color.replace('text', 'border')} ${selectedLevel.color} bg-opacity-10`}>
                        {selectedLevel.label.toUpperCase()}
                    </span>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 transition-colors"
                            title="Encerrar Chamada"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${msg.role === 'user' ? 'bg-indigo-600 border-indigo-500' : 'bg-gray-800 border-gray-700'
                            }`}>
                            {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Briefcase className="w-5 h-5 text-green-500" />}
                        </div>

                        <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed border ${msg.role === 'user'
                                ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-100 rounded-tr-none'
                                : 'bg-gray-800/80 border-gray-700 text-gray-300 rounded-tl-none'
                                }`}>
                                {msg.content}
                            </div>
                            <span className="text-[10px] text-gray-600 mt-1 font-mono uppercase">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {msg.role === 'user' ? 'Você' : 'Conselho'}
                            </span>
                        </div>
                    </motion.div>
                ))}

                {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-gray-500 text-xs font-mono ml-14">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Analisando métricas da proposta...
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="bg-gray-900 border-t border-gray-800 p-4">
                <div className="flex items-center gap-4">
                    {/* Voice Button */}
                    <button
                        onClick={toggleRecording}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg border-2 ${isRecording
                            ? 'bg-red-500/20 border-red-500 text-red-500 scale-110 shadow-red-500/30'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                            }`}
                        title="Manter pressionado para falar"
                    >
                        {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>

                    {/* Waveform Visualization (Simulated) */}
                    <div className="flex-1 h-12 bg-black/50 rounded-xl border border-gray-800 flex items-center px-4 gap-1 overflow-hidden">
                        {isRecording ? (
                            audioLevels.map((level, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ height: `${level}%` }}
                                    className="w-1 bg-red-500 rounded-full mx-0.5"
                                />
                            ))
                        ) : (
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Digite sua resposta para o conselho..."
                                className="w-full bg-transparent border-none focus:ring-0 text-gray-300 text-sm font-mono placeholder-gray-600"
                            />
                        )}
                        {/* Fake static waveform bg */}
                        {!isRecording && <div className="absolute right-20 flex gap-0.5 opacity-20 pointer-events-none">
                            {[1, 2, 3, 4, 5, 3, 2, 4, 6, 3].map((h, i) => <div key={i} className="w-1 bg-gray-500" style={{ height: h * 3 }}></div>)}
                        </div>}
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputText.trim() && !isRecording}
                        className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-gray-600 font-mono">CONEXÃO SEGURA ESTABELECIDA</p>
                </div>
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
