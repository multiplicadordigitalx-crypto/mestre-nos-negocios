
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Camera, Rocket, Robot, TrendingUp, Brain, Activity } from '../../../components/Icons';
import Card from '../../../components/Card';

export const NexusAutonomousSystem: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [activeStep, setActiveStep] = useState(0);
    const steps = [
        { name: 'Radar Viral', icon: Search, color: 'text-blue-400', status: 'Varrendo...' },
        { name: 'Studio IA', icon: Camera, color: 'text-purple-400', status: 'Produzindo...' },
        { name: 'Distribuição', icon: Rocket, color: 'text-green-400', status: 'Publicando...' },
        { name: 'Bot Sentinela', icon: Robot, color: 'text-yellow-400', status: 'Moderando...' },
        { name: 'Funil Scale', icon: TrendingUp, color: 'text-red-500', status: 'Injetando Ads...' }
    ];

    useEffect(() => {
        const cycle = [
            { step: 0, msg: "📡 [RADAR] Vídeo tendência detectado: 'Nicho Renda Extra' (2.1M views). Estrutura copiada." },
            { step: 1, msg: "🎬 [STUDIO] Gerando roteiro adaptado via Card 11... Renderizando no Card 12 (100%)." },
            { step: 2, msg: "🚀 [DISTRIBUIÇÃO] Card 13 ativado: Publicando em 5 contas (TikTok, Insta, Kwai)." },
            { step: 3, msg: "🤖 [SENTINELA] Bot WhatsApp: Lead 'João' qualificado como 'Quente'. Áudio de vendas enviado." },
            { step: 4, msg: "💰 [ECOSSISTEMA] Venda confirmada via Webhook Hotmart: R$ 197,00 (Produto: Mestre 15X)." },
            { step: 4, msg: "📧 [EMAIL MKT] Lead de abandono recuperado. Tag 'Cliente' aplicada no CRM." },
            { step: 4, msg: "⚡ [OTIMIZADOR] Página de Vendas (Funil & PGS): Conversão subiu para 28%. Escalando orçamento." }
        ];

        let index = 0;
        const interval = setInterval(() => {
            const current = cycle[index % cycle.length];
            setActiveStep(current.step);
            setLogs(prev => [current.msg, ...prev].slice(0, 8));
            index++;
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="col-span-full p-0 overflow-hidden border border-brand-primary/30 relative mb-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 animate-pulse"></div>
            <div className="bg-gray-900/90 p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="font-black text-white uppercase flex items-center gap-2 tracking-wider">
                    <Brain className="w-6 h-6 text-brand-primary" /> Nexus Autônomo <span className="text-[10px] bg-brand-primary text-black px-2 py-0.5 rounded font-bold">LIVE</span>
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Activity className="w-4 h-4 text-green-500 animate-pulse" /> Ecossistema Integrado (Funil + Bot + IA)
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Pipeline */}
                <div className="flex flex-col justify-center">
                    <div className="flex justify-between items-center relative px-2">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -z-0"></div>
                        <motion.div
                            className="absolute top-1/2 left-0 h-0.5 bg-brand-primary -z-0"
                            initial={{ width: '0%' }}
                            animate={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        ></motion.div>

                        {steps.map((step, idx) => (
                            <div key={idx} className="relative z-10 flex flex-col items-center gap-1.5">
                                <motion.div
                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-gray-900 transition-all duration-300 ${activeStep === idx ? `border-brand-primary shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-110` : activeStep > idx ? 'border-brand-primary/50 text-gray-400' : 'border-gray-700 text-gray-600'}`}
                                >
                                    <step.icon className={`w-5 h-5 ${activeStep === idx ? step.color : activeStep > idx ? 'text-gray-400' : 'text-gray-600'}`} />
                                </motion.div>
                                <p className={`text-[9px] font-bold uppercase tracking-wide text-center max-w-[60px] leading-tight ${activeStep === idx ? 'text-white' : 'text-gray-500'}`}>{step.name}</p>
                                {activeStep === idx && (
                                    <motion.span
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute -bottom-5 text-[8px] text-brand-primary whitespace-nowrap bg-black/80 border border-brand-primary/20 px-1.5 py-0.5 rounded shadow-lg backdrop-blur-sm"
                                    >
                                        {step.status}
                                    </motion.span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Terminal */}
                <div className="bg-black/50 rounded-xl border border-gray-700 p-4 font-mono text-xs h-40 overflow-hidden flex flex-col shadow-inner">
                    <div className="flex justify-between text-gray-500 mb-2 border-b border-gray-800 pb-1">
                        <span>SYSTEM LOG</span>
                        <span>AUTO-EXEC</span>
                    </div>
                    <div className="flex-1 space-y-2 overflow-hidden relative">
                        <AnimatePresence initial={false}>
                            {logs.map((log, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-green-400/90 truncate flex items-center gap-2"
                                >
                                    <span className="text-gray-600 w-[70px]">[{new Date().toLocaleTimeString()}]</span>
                                    <span>{log}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
