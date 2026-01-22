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
import { PerformanceDashboard } from '../components/knowledge/PerformanceDashboard';
import { LegalRepository } from '../components/knowledge/law/LegalRepository';

// Import Language Card
import { LanguagePracticeCard } from '../components/knowledge/LanguagePracticeCard';
import { CreditBalanceWidget } from '../components/CreditBalanceWidget';
import { StudentPage } from '../types';


interface KnowledgePracticePageProps {
    initialLanguageMode?: boolean;
    navigateTo?: (page: StudentPage) => void;
}

export const KnowledgePracticePage: React.FC<KnowledgePracticePageProps> = ({ initialLanguageMode = false, navigateTo }) => {
    const { user } = useAuth();

    // Niche Config
    const [activeNiche] = useState<'law'>('law');
    const [isLanguageMode, setIsLanguageMode] = useState(initialLanguageMode);

    // Tab State
    const [activeTab, setActiveTab] = useState<'study' | 'practice' | 'stats'>('practice');
    const [isToolActive, setIsToolActive] = useState(false);
    const { refreshUser } = useAuth();

    // Sub-view states
    const [viewRepository, setViewRepository] = useState(false);

    if (viewRepository) {
        return <LegalRepository onBack={() => setViewRepository(false)} />;
    }

    // Toggle for Demo purposes
    const toggleMode = () => {
        setIsLanguageMode(!isLanguageMode);
        toast.success(`Módulo alterado para: ${!isLanguageMode ? 'Idiomas' : 'Direito'}`);
    };

    if (isLanguageMode) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 animate-fade-in pb-32">
                <div className="flex justify-end mb-4">
                    <div className="flex items-center gap-2">
                        {user?.dailyMestreIALimit && (
                            <div className="bg-gray-800/80 px-3 py-1.5 rounded-full border border-gray-700 flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                <span className={((user.dailyUsage || 0) >= user.dailyMestreIALimit) ? 'text-red-400' : 'text-green-400'}>
                                    Diário: {user.dailyUsage || 0}/{user.dailyMestreIALimit}
                                </span>
                            </div>
                        )}
                        <CreditBalanceWidget onRecharge={() => {
                            if (navigateTo) navigateTo('recharge');
                            else toast.error("Navegação indisponível");
                        }} />
                    </div>
                </div>
                <LanguagePracticeCard navigateTo={navigateTo} />
            </div>
        );
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
                        <span className="break-words">Mentor <span className="text-red-500">Jurídico</span></span>
                    </h1>
                    <p className="text-gray-400 mt-2 text-base md:text-lg">
                        Domine a advocacia com prática real e inteligência artificial.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-3 w-full md:w-auto">

                    <div className="flex items-center gap-3">


                        {/* Credit Wallet Widget */}
                        {user?.dailyMestreIALimit && (
                            <div className="bg-gray-800/80 px-3 py-1.5 rounded-full border border-gray-700 flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                <span className={((user.dailyUsage || 0) >= user.dailyMestreIALimit) ? 'text-red-400' : 'text-green-400'}>
                                    Diário: {user.dailyUsage || 0}/{user.dailyMestreIALimit}
                                </span>
                            </div>
                        )}
                        <CreditBalanceWidget onRecharge={() => {
                            if (navigateTo) navigateTo('recharge');
                            else toast.error("Navegação indisponível");
                        }} />
                    </div>

                    {/* Navigation Tabs */}
                    {!isToolActive && (
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
                    )}
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
                        <LawPracticeCard section="study" onToolActive={setIsToolActive} navigateTo={navigateTo} />
                    )}

                    {activeTab === 'practice' && (
                        <LawPracticeCard section="practice" onToolActive={setIsToolActive} navigateTo={navigateTo} />
                    )}

                    {activeTab === 'stats' && (
                        <PerformanceDashboard />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Modal removed in favor of central recharge page */}
        </div >
    );
};

export default KnowledgePracticePage;
