import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Brain, Zap, Plus,
    Scale, Globe, Award, TrendingUp,
    Search, Mic, FileText, CheckCircle,
    Play, LockClosed, Star, Folder, ArrowRight
} from '../components/Icons';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

// Placeholders / Sub-components
import { LawPracticeCard } from '../components/knowledge/LawPracticeCard';
import { LegalRepository } from '../components/knowledge/law/LegalRepository';
// import { LanguagePracticeCard } from '../components/knowledge/LanguagePracticeCard';

export const KnowledgePracticePage: React.FC = () => {
    const { user } = useAuth();


    // Niche Config
    const [activeNiche] = useState<'law'>('law');

    // Tab State
    const [activeTab, setActiveTab] = useState<'study' | 'practice' | 'stats'>('practice');

    // Sub-view states
    const [viewRepository, setViewRepository] = useState(false);

    if (viewRepository) {
        return <LegalRepository onBack={() => setViewRepository(false)} />;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 animate-fade-in pb-32">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4">
                        <div className="p-3 rounded-2xl border border-white/10 bg-red-900/40 text-red-500">
                            <Scale className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                        <span className="break-words">Sabedoria & <span className="text-red-500">Prática</span></span>
                    </h1>
                    <p className="text-gray-400 mt-2 text-base md:text-lg">
                        Domine a advocacia com prática real e inteligência artificial.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-3 w-full md:w-auto">

                    {/* Credit Badge */}
                    <div className="bg-gray-800/80 px-4 py-1.5 rounded-full border border-gray-700 flex items-center gap-2 text-xs font-bold text-gray-300 w-fit self-end">
                        <span>💳 {user?.creditBalance || 0} Créditos</span>
                        <span className="text-gray-600">|</span>
                        <button onClick={() => window.location.href = '/painel/credits'} className="text-brand-primary hover:underline uppercase text-[10px]">Recarregar</button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('study')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-xs transition-all whitespace-nowrap border ${activeTab === 'study' ? 'bg-white text-black border-white shadow-lg shadow-white/20 scale-105' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white'}`}
                        >
                            <BookOpen className="w-4 h-4" /> Estudo
                        </button>
                        <button
                            onClick={() => setActiveTab('practice')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-xs transition-all whitespace-nowrap border ${activeTab === 'practice' ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/20 scale-105' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white'}`}
                        >
                            <Zap className="w-4 h-4" /> Prática
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-xs transition-all whitespace-nowrap border ${activeTab === 'stats' ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/20 scale-105' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white'}`}
                        >
                            <TrendingUp className="w-4 h-4" /> Desempenho
                        </button>
                    </div>
                </div>
            </div>

            {/* Dynamic Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${activeNiche}-${activeTab}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                >
                    {activeTab === 'study' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* NEW: Banco de Modelos */}
                            <div
                                onClick={() => setViewRepository(true)}
                                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 rounded-[2rem] hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/10 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-4 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                                    <Folder className="w-6 h-6 text-yellow-500 group-hover:text-black transition-colors" />
                                </div>

                                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-yellow-400 transition-colors">Banco de Modelos</h3>
                                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                                    Acesse o maior acervo de peças e contratos. Modelos de Holdings, Inventários, Petições Iniciais e muito mais.
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-[10px] font-bold uppercase bg-gray-950 px-3 py-1 rounded-full text-yellow-500 border border-gray-800">Premium</span>
                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-yellow-500 transition-colors">
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors -rotate-45 group-hover:rotate-0" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                    {activeTab === 'practice' && (
                        <LawPracticeCard />
                    )}

                    {activeTab === 'stats' && (
                        <div className="bg-gray-800 border border-gray-700 p-8 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[400px]">
                            <Star className="w-16 h-16 text-yellow-500 mb-6" />
                            <h3 className="text-2xl font-bold mb-2">Seus Resultados</h3>
                            <p className="text-gray-400">Complete exercícios na aba Prática para gerar estatísticas.</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default KnowledgePracticePage;
