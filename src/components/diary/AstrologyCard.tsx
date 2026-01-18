
import React, { useState } from 'react';
import { Sparkles, Star, Sun, Moon, Zap, Heart, Briefcase, Smile } from '../Icons';
import Button from '../Button';
import { motion, AnimatePresence } from 'framer-motion';

export const AstrologyCard: React.FC = () => {
    const [selectedSign, setSelectedSign] = useState<string>("");
    const [selectedArea, setSelectedArea] = useState<string>("");
    const [prediction, setPrediction] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const signs = [
        "Áries", "Touro", "Gêmeos", "Câncer",
        "Leão", "Virgem", "Libra", "Escorpião",
        "Sagitário", "Capricórnio", "Aquário", "Peixes"
    ];

    const areas = [
        { id: "love", label: "Amor & Relacionamentos", icon: Heart, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
        { id: "career", label: "Carreira & Dinheiro", icon: Briefcase, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
        { id: "luck", label: "Sorte do Dia", icon: Sparkles, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
        { id: "wellness", label: "Bem-estar & Energia", icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" }
    ];

    const generatePrediction = () => {
        setIsLoading(true);
        setPrediction(null);
        setTimeout(() => {
            setIsLoading(false);
            // Mock logic - in a real app this would call an API
            const baseText = `Para ${selectedSign} na área de ${areas.find(a => a.id === selectedArea)?.label.split(" ")[0]}, `;
            const predictions = [
                "os astros indicam um momento de grande expansão. Confie na sua intuição hoje.",
                "é necessário cautela. Evite decisões precipitadas e foque no longo prazo.",
                "uma surpresa agradável está a caminho. Esteja aberto ao novo.",
                "Saturno pede estrutura. Organize suas prioridades antes de agir.",
                "a energia de Vênus favorece a harmonia. Ótimo dia para conexões."
            ];
            setPrediction(baseText + predictions[Math.floor(Math.random() * predictions.length)]);
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-[2.5rem] p-8 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <Moon className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase italic">Astrologia & Cosmos</h2>
                            <p className="text-gray-400 text-sm">Alinhamento astral e previsões personalizadas.</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* 1. Sign Selector */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Seu Signo Solar</label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {signs.map(sign => (
                                    <button
                                        key={sign}
                                        onClick={() => setSelectedSign(sign)}
                                        className={`p-3 rounded-xl text-[10px] font-black uppercase transition-all border ${selectedSign === sign ? "bg-indigo-500 border-indigo-400 text-white shadow-lg" : "bg-gray-950 border-gray-800 text-gray-500 hover:border-indigo-500/30 hover:text-indigo-400"}`}
                                    >
                                        {sign}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Area Selector */}
                        <AnimatePresence>
                            {selectedSign && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">O que você busca hoje?</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {areas.map(area => (
                                            <button
                                                key={area.id}
                                                onClick={() => setSelectedArea(area.id)}
                                                className={`p-5 rounded-2xl border text-left transition-all group ${selectedArea === area.id ? `bg-gray-800 border-white ring-1 ring-white/50` : `bg-gray-950/50 border-gray-800 hover:bg-gray-900`}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl ${area.bg} ${area.border} border`}>
                                                        <area.icon className={`w-6 h-6 ${area.color}`} />
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-black uppercase text-xs mb-1 ${selectedArea === area.id ? "text-white" : "text-gray-400 group-hover:text-gray-200"}`}>{area.label}</h4>
                                                        <p className="text-[10px] text-gray-600 font-medium">Ver previsão</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 3. Generate & Result */}
                        <AnimatePresence>
                            {selectedArea && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="pt-4"
                                >
                                    {!prediction && !isLoading && (
                                        <Button
                                            onClick={generatePrediction}
                                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black uppercase shadow-xl shadow-indigo-900/30"
                                        >
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Revelar Previsão para {selectedSign}
                                        </Button>
                                    )}

                                    {isLoading && (
                                        <div className="w-full py-8 flex flex-col items-center justify-center text-indigo-400 gap-3 bg-gray-950/30 border border-gray-800 rounded-3xl border-dashed">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Star className="w-8 h-8" />
                                            </motion.div>
                                            <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Lendo o Mapa Astral...</span>
                                        </div>
                                    )}

                                    {prediction && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-indigo-950/30 border border-indigo-500/30 p-8 rounded-[2rem] relative overflow-hidden text-center"
                                        >
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                                            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
                                            <p className="text-lg md:text-xl text-indigo-100 font-medium leading-relaxed italic">
                                                "{prediction}"
                                            </p>
                                            <div className="mt-6 flex justify-center">
                                                <Button
                                                    onClick={() => setPrediction(null)}
                                                    className="!bg-indigo-500/20 !text-indigo-300 hover:!bg-indigo-500/30 !py-2 !px-6 text-xs"
                                                >
                                                    Nova Consulta
                                                </Button>
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
