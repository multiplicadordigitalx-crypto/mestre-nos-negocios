
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Sparkles, MessageCircle, Lock, Unlock, BookOpen, Smile, Frown, Meh, AlertCircle } from '../Icons';
import Button from '../Button';

export const TherapyLogCard: React.FC = () => {
    const [selectedTherapyType, setSelectedTherapyType] = useState<string>("");
    const [sessionFeeling, setSessionFeeling] = useState<string>("");
    const [sessionNotes, setSessionNotes] = useState<string>("");
    const [isScanning, setIsScanning] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

    const therapyTypes = [
        "Psicanálise", "TCC (Cognitiva)", "Gestalt", "Constelação Familiar",
        "Plantão Psicológico", "Mentor-Guiada", "Auto-Análise"
    ];

    const feelings = [
        { label: "Leve", icon: Smile, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
        { label: "Reflexivo", icon: Meh, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        { label: "Mexido", icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
        { label: "Pesado", icon: Frown, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" }
    ];

    const handleAnalysis = () => {
        if (!sessionNotes) return;
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            // Simulated AI Logic based on keywords
            if (sessionNotes.toLowerCase().includes("término") || sessionNotes.toLowerCase().includes("ex")) {
                setAiSuggestion("Protocolo de Luto Amoroso: O Nexus identificou um padrão de apego. Sugiro o exercício 'Carta de Despedida Não Enviada' para processar esse ciclo.");
            } else if (sessionNotes.toLowerCase().includes("medo") || sessionNotes.toLowerCase().includes("ansiedade")) {
                setAiSuggestion("Protocolo de Ancoragem: Para reduzir a ansiedade citada, pratique a técnica '5-4-3-2-1' agora. Clique para iniciar.");
            } else {
                setAiSuggestion("Insight do Mentor: Ótimo progresso. Identificar essas questões é o primeiro passo para o desbloqueio. Continue focado na sua autopercepção.");
            }
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-[2.5rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                            <Brain className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase italic">Sessão de Terapia</h2>
                            <p className="text-gray-400 text-sm">Registro de insights e desbloqueios emocionais.</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* 1. Therapy Type Selector */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Tipo de Terapia</label>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                {therapyTypes.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedTherapyType(type)}
                                        className={`px-5 py-3 border rounded-xl font-black text-[10px] uppercase whitespace-nowrap transition-all ${selectedTherapyType === type ? "bg-purple-500 border-purple-400 text-white shadow-lg" : "bg-gray-950 border-gray-800 text-gray-500 hover:text-white"}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Feeling Selector */}
                        <AnimatePresence>
                            {selectedTherapyType && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Como você saiu da sessão?</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {feelings.map(feel => (
                                            <button
                                                key={feel.label}
                                                onClick={() => setSessionFeeling(feel.label)}
                                                className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${sessionFeeling === feel.label ? `bg-gray-800 border-white text-white shadow-lg` : `bg-gray-950/50 border-gray-800 text-gray-500 hover:bg-gray-900`}`}
                                            >
                                                <feel.icon className={`w-8 h-8 ${sessionFeeling === feel.label ? "text-white" : feel.color}`} />
                                                <span className="text-xs font-bold uppercase">{feel.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 3. Session Notes & AI Unblocking */}
                        <AnimatePresence>
                            {sessionFeeling && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Pontos Chave / Bloqueios Identificados</label>
                                    <div className="relative">
                                        <textarea
                                            value={sessionNotes}
                                            onChange={(e) => setSessionNotes(e.target.value)}
                                            placeholder="Ex: Falamos sobre o término do meu relacionamento e a dificuldade de confiar novamente..."
                                            className="w-full bg-gray-950/50 border border-gray-800 rounded-3xl p-6 text-gray-300 placeholder-gray-600 outline-none focus:border-purple-500/50 transition-colors min-h-[120px] resize-none"
                                        />
                                        <div className="absolute bottom-4 right-4">
                                            <Button
                                                onClick={handleAnalysis}
                                                disabled={!sessionNotes || isScanning}
                                                className={`!py-2 !px-4 text-[10px] flex items-center gap-2 ${!sessionNotes ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {isScanning ? (
                                                    <>
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        >
                                                            <Sparkles className="w-3 h-3" />
                                                        </motion.div>
                                                        Analisando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Unlock className="w-3 h-3" />
                                                        Desbloquear com IA
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* AI Suggestion Result */}
                                    {aiSuggestion && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-purple-900/20 border border-purple-500/30 p-6 rounded-3xl flex gap-4"
                                        >
                                            <div className="p-3 bg-purple-500/20 rounded-full h-fit">
                                                <Sparkles className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-purple-200 mb-1">Sugestão do Mentor</h3>
                                                <p className="text-sm text-gray-300 leading-relaxed">{aiSuggestion}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                </div>
            </div>
        </div>
    );
};
