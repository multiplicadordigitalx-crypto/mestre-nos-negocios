
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InternalCampaign, User } from '../types';
import { getActiveCampaignsForUser, generateNexusAutoCampaign } from '../services/mockFirebase';
import { Megaphone, ArrowRight, X as XIcon, Sparkles } from './Icons';

interface CampaignBannerProps {
    user: User;
}

const CampaignBanner: React.FC<CampaignBannerProps> = ({ user }) => {
    const [campaigns, setCampaigns] = useState<InternalCampaign[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [isNexusGenerated, setIsNexusGenerated] = useState(false);

    useEffect(() => {
        const fetchCampaigns = async () => {
            // 1. Tenta buscar campanhas manuais ativas (Painel Admin > Campanhas Internas)
            const active = await getActiveCampaignsForUser(user);
            
            if (active.length > 0) {
                setCampaigns(active);
                setIsNexusGenerated(false);
            } else {
                // 2. TRIGGER ETAPA 1: Banner vazio detectado.
                // Aciona Nexus IA para gerar campanha personalizada baseada no perfil do aluno.
                // Isso garante que o espaço de publicidade nunca fique ocioso.
                const nexusCampaign = await generateNexusAutoCampaign(user);
                if (nexusCampaign) {
                    setCampaigns([nexusCampaign]);
                    setIsNexusGenerated(true);
                }
            }
        };
        fetchCampaigns();
    }, [user]);

    // Auto-rotation logic
    useEffect(() => {
        if (campaigns.length <= 1 || isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % campaigns.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [campaigns.length, isPaused]);

    if (campaigns.length === 0 || !isVisible) return null;

    const currentCampaign = campaigns[currentIndex];
    
    // Default gradient if not provided
    const bgGradient = currentCampaign.backgroundColor || 'bg-gradient-to-r from-purple-600 to-blue-600';

    return (
        <div 
            className="w-full mb-6 relative group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentCampaign.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.5 }}
                    className={`w-full rounded-2xl p-6 shadow-2xl relative overflow-hidden ${bgGradient}`}
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 hidden sm:block">
                                {isNexusGenerated ? (
                                    <Sparkles className="w-8 h-8 text-yellow-300 drop-shadow-md animate-pulse" />
                                ) : (
                                    <Megaphone className="w-8 h-8 text-white drop-shadow-md" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    {isNexusGenerated && (
                                        <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-yellow-300 font-bold border border-yellow-500/30 uppercase tracking-wider">
                                            Recomendado por Nexus IA
                                        </span>
                                    )}
                                    <h2 className="text-2xl font-black text-white leading-tight drop-shadow-md">
                                        {currentCampaign.title}
                                    </h2>
                                </div>
                                <p className="text-white/90 text-sm font-medium max-w-2xl leading-relaxed">
                                    {currentCampaign.description}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            {currentCampaign.ctaLink && (
                                <a 
                                    href={currentCampaign.ctaLink} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-6 py-3 bg-white text-black font-black uppercase text-sm rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2 whitespace-nowrap w-full md:w-auto justify-center"
                                >
                                    {currentCampaign.ctaText} <ArrowRight className="w-4 h-4" />
                                </a>
                            )}
                            <button 
                                onClick={() => setIsVisible(false)}
                                className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <XIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>

                    {/* Pagination Indicators */}
                    {campaigns.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                            {campaigns.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                                ></div>
                            ))}
                        </div>
                    )}
                    
                    {/* Counter Badge */}
                    {campaigns.length > 1 && (
                        <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10">
                            {currentIndex + 1} / {campaigns.length}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default CampaignBanner;
