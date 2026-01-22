
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMentorState } from '@/context/MentorStateContext';
import { Crown, CheckCircle, ArrowLeft, MessageSquare } from '@/components/Icons';
import { GrokChatInterface } from '@/components/GrokChatInterface';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const MentorCompanionWidget: React.FC = () => {
    const { activeMission, isWidgetOpen, toggleWidget, completeMission } = useMentorState();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showChat, setShowChat] = useState(false);

    // Only show if there is an active mission
    if (!activeMission) return null;

    return (
        <div className="fixed bottom-24 right-4 z-[9999] flex flex-col items-end pointer-events-none">

            {/* Chat Overlay */}
            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 bg-gray-900 border border-purple-500/30 rounded-xl shadow-2xl w-80 md:w-96 h-[400px] pointer-events-auto overflow-hidden flex flex-col"
                    >
                        <div className="p-3 bg-purple-900/20 border-b border-purple-500/20 flex justify-between items-center">
                            <span className="text-xs font-bold text-purple-300">MENTOR IA - SUPORTE</span>
                            <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">x</button>
                        </div>
                        <div className="flex-1 bg-black/40 relative">
                            {/* Simplified Chat Interface for Widget */}
                            <GrokChatInterface
                                height="100%"
                                context={`MISSION CONTEXT: The student is performing task: "${activeMission.label}". ${activeMission.context}`}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The Widget */}
            <motion.div
                initial={{ x: 100 }}
                animate={{ x: 0 }}
                className="pointer-events-auto"
            >
                <div className="bg-black/80 backdrop-blur-md border border-purple-500/50 rounded-full p-1 pl-2 pr-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-3">

                    {/* Access Chat */}
                    <button
                        onClick={() => setShowChat(!showChat)}
                        className="bg-purple-600/20 hover:bg-purple-600/40 p-2 rounded-full transition-colors relative group"
                    >
                        <Crown className="w-5 h-5 text-purple-300" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                        </span>

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                            Pedir Ajuda
                        </div>
                    </button>

                    <div className="flex flex-col mr-2" onClick={toggleWidget}>
                        <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Missão Ativa</span>
                        <span className="text-xs font-medium text-white max-w-[120px] truncate">{activeMission.label}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center border-l border-white/10 pl-2 gap-1">
                        <button
                            onClick={() => {
                                completeMission(); // Mark as done
                                // Ideally navigate back to lesson
                                // navigate('/painel/student-player?lessonId=' + activeMission.lessonId);
                            }}
                            className="p-1.5 hover:bg-green-500/20 rounded-full group transition-colors"
                            title="Concluir Missão"
                        >
                            <CheckCircle className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                        </button>
                    </div>

                </div>
            </motion.div>

        </div>
    );
};
