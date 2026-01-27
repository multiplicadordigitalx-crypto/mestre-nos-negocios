
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HeartPulse, Brain, Zap, Plus,
    Smile, Meh, Frown, Angry,
    Camera, TrendingUp, Calendar, ArrowRight,
    Sparkles, ActivityIcon
} from '../components/Icons';
import { CreditBalanceWidget } from '../components/CreditBalanceWidget';
import Button from '../components/Button';
import { MoodTrackerCard } from '../components/diary/MoodTrackerCard';
import { FoodLogCard } from '../components/diary/FoodLogCard';
import { BodyMetricsCard } from '../components/diary/BodyMetricsCard';
import { BioLabCard } from '../components/diary/BioLabCard';
import { ExerciseLogCard } from '../components/diary/ExerciseLogCard';
import { TherapyLogCard } from '../components/diary/TherapyLogCard';
import { IntellectLogCard } from '../components/diary/IntellectLogCard';
import { SpiritualityLogCard } from '../components/diary/SpiritualityLogCard';
import { AstrologyCard } from '../components/diary/AstrologyCard';
import { SleepTrackerCard } from '../components/diary/SleepTrackerCard';
import { DynamicHealthFlashcards } from '../components/diary/DynamicHealthFlashcards';
import { DynamicHealthQuiz } from '../components/diary/DynamicHealthQuiz';
import { useCreditGuard } from '../hooks/useCreditGuard';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { InsufficientFundsAlert } from '../components/knowledge/language/InsufficientFundsAlert';


import { StudentPage } from '../types';

interface HealthMindDiaryPageProps {
    navigateTo?: (page: StudentPage) => void;
}

const HealthMindDiaryPage: React.FC<HealthMindDiaryPageProps> = ({ navigateTo }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'mind' | 'body' | 'insights'>('body');
    const [bodySubTab, setBodySubTab] = useState<'food' | 'metrics' | 'biolab' | 'exercise' | 'study' | 'quiz'>('food');
    const [mindSubTab, setMindSubTab] = useState<'feelings' | 'therapy' | 'intellect' | 'spirit' | 'astro' | 'sleep' | 'study' | 'quiz'>('feelings');

    // Niche Detection Logic (Dynamic)
    // In production, this would come from schoolConfig.
    // We'll use 'diet', 'therapy', or 'fitness' based on mock course data.
    const courseNiche = 'diet' as 'diet' | 'therapy' | 'fitness';
    const isTherapyNiche = courseNiche === 'therapy';
    const hasPhysicalKit = courseNiche === 'fitness';

    // Credit Guard Integration
    const { checkAndConsume, isProcessing } = useCreditGuard();
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);

    const handleGenerateReport = async () => {
        // HYBRID CREDIT LOGIC: 5 Reports/Day (Cost 10 each, Limit 50)
        // Sharing 'health_suite' context with OCR so they share the same daily budget!
        // This achieves the "Student can spend where they want" goal.
        // If they did 3 scans (15 cost), they have 35 left. Can do 3 reports (30).

        console.log("Generating report with unified credit logic...");
        // TODO: Pass contextId and dailyLimit when hook supports it
        const proceed = await checkAndConsume('health_evolution_report', 'Relatório de Evolução IA', 10);

        if (!proceed) {
            // Basic fallback since we removed the object with callback
            setShowInsufficientModal(true);
            return;
        }

        if (proceed) {
            setIsGeneratingReport(true);
            setTimeout(() => {
                setIsGeneratingReport(false);
                toast.success("Relatório de Evolução Gerado com Sucesso!");
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 animate-fade-in pb-32">
            {/* Header section */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-4">
                        <div className="p-3 bg-brand-primary/10 rounded-2xl border border-brand-primary/20">
                            <HeartPulse className="w-10 h-10 text-brand-primary" />
                        </div>
                        Saúde & <span className="text-brand-primary">Mente</span>
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">
                        {isTherapyNiche ? 'Sua jornada de autoconhecimento e equilíbrio emocional.' : 'Seu rastreador universal de evolução física e mental.'}
                    </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                    {/* Credit Badge & Daily Limit Indicator */}
                    <div className="flex items-center gap-2">
                        {user?.dailyMestreIALimit && (
                            <div className="bg-gray-800/80 px-3 py-1.5 rounded-full border border-gray-700 flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                <span className={((user.dailyUsage || 0) >= user.dailyMestreIALimit) ? 'text-red-400' : 'text-green-400'}>
                                    Diário: {user.dailyUsage || 0}/{user.dailyMestreIALimit}
                                </span>
                            </div>
                        )}
                        <CreditBalanceWidget onRecharge={() => navigateTo ? navigateTo('recharge') : null} />
                    </div>

                    <div className="flex bg-gray-800/50 p-1.5 rounded-2xl border border-gray-700/50 shadow-inner">
                        <button
                            onClick={() => setActiveTab('body')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase text-xs transition-all ${activeTab === 'body' ? 'bg-brand-primary text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Zap className="w-4 h-4" /> Corpo
                        </button>
                        <button
                            onClick={() => setActiveTab('mind')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase text-xs transition-all ${activeTab === 'mind' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Brain className="w-4 h-4" /> Mente
                        </button>
                        <button
                            onClick={() => setActiveTab('insights')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase text-xs transition-all ${activeTab === 'insights' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <TrendingUp className="w-4 h-4" /> Insights
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Banner - Dynamic based on activeTab */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <AnimatePresence mode="wait">
                    {activeTab === 'body' && (
                        <>
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} key="body-1" className="bg-gray-800 border border-gray-700 p-6 rounded-[2rem] flex items-center justify-between group hover:border-brand-primary transition-colors">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{isTherapyNiche ? 'Clareza Mental' : 'Proteína Diária'}</p>
                                    <h3 className="text-3xl font-black">{isTherapyNiche ? '85%' : '124g'}<span className="text-xs text-gray-600"> {isTherapyNiche ? '' : '/ 180g'}</span></h3>
                                </div>
                                <div className={`w-12 h-12 rounded-full border-4 border-${isTherapyNiche ? 'purple' : 'brand'}-primary/20 border-t-${isTherapyNiche ? 'purple' : 'brand'}-primary flex items-center justify-center font-bold text-xs`}>{isTherapyNiche ? '↑' : '68%'}</div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} key="body-2" className="bg-gray-800 border border-gray-700 p-6 rounded-[2rem] flex items-center justify-between group hover:border-orange-500 transition-colors">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Calorias (Net)</p>
                                    <h3 className="text-3xl font-black">1.840 <span className="text-xs text-gray-600">kcal</span></h3>
                                </div>
                                <TrendingUp className="w-10 h-10 text-orange-400" />
                            </motion.div>
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} key="body-3" className="bg-gray-800 border border-gray-700 p-6 rounded-[2rem] flex items-center justify-between group hover:border-blue-400 transition-colors">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Hidratação</p>
                                    <h3 className="text-3xl font-black">2.4 <span className="text-xs text-gray-600">litros</span></h3>
                                </div>
                                <div className="text-blue-400 font-black text-xl italic">80%</div>
                            </motion.div>
                        </>
                    )}
                    {activeTab === 'mind' && (
                        <>
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} key="mind-1" className="bg-gray-800 border border-gray-700 p-6 rounded-[2rem] flex items-center justify-between group hover:border-purple-500 transition-colors">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Humor Médio (7d)</p>
                                    <h3 className="text-3xl font-black">Excelente</h3>
                                </div>
                                <Smile className="w-10 h-10 text-purple-400" />
                            </motion.div>
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} key="mind-2" className="bg-gray-800 border border-gray-700 p-6 rounded-[2rem] flex items-center justify-between group hover:border-indigo-400 transition-colors">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Sono Profundo</p>
                                    <h3 className="text-3xl font-black">6h 45m</h3>
                                </div>
                                <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20"><Zap className="w-6 h-6 text-indigo-400" /></div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} key="mind-3" className="bg-gray-800 border border-gray-700 p-6 rounded-[2rem] flex items-center justify-between group hover:border-pink-500 transition-colors">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Estresse (HRV)</p>
                                    <h3 className="text-3xl font-black">Baixo</h3>
                                </div>
                                <ActivityIcon className="w-10 h-10 text-pink-400" />
                            </motion.div>
                        </>
                    )}
                    {activeTab === 'insights' && (
                        <>
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} key="ins-1" className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 p-6 rounded-[2rem] flex items-center justify-between group hover:border-indigo-500 transition-colors md:col-span-2">
                                <div>
                                    <p className="text-[11px] text-indigo-300 font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Nexus Correlation</p>
                                    <p className="text-sm text-gray-200 leading-relaxed pr-8 italic">"Sua energia cognitiva sobe 22% nos dias em que você consome mais de 100g de proteína e treina antes das 9h."</p>
                                </div>
                                <div className="bg-white/10 p-3 rounded-2xl border border-white/20 shrink-0"><Sparkles className="w-8 h-8 text-brand-primary" /></div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} key="ins-2" className="bg-gray-800 border border-gray-700 p-6 rounded-[2rem] flex items-center justify-between group hover:border-blue-500 transition-colors">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Eficiência Bio-Cloud</p>
                                    <h3 className="text-3xl font-black">94%</h3>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-blue-400" /></div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Content Tabs */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'body' && (
                        <div className="space-y-8">
                            {!isTherapyNiche && (
                                <div className="flex gap-3 mb-2 overflow-x-auto no-scrollbar pb-2 mask-fade-right">
                                    <button
                                        onClick={() => setBodySubTab('food')}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${bodySubTab === 'food' ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/20' : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-white'}`}
                                    >Alimentação</button>
                                    <button
                                        onClick={() => setBodySubTab('metrics')}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${bodySubTab === 'metrics' ? 'bg-green-400 text-black shadow-lg shadow-green-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-white'}`}
                                    >Métricas Corporais</button>
                                    <button
                                        onClick={() => setBodySubTab('biolab')}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${bodySubTab === 'biolab' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-white'}`}
                                    >Monitoramento Bio-lab</button>
                                    <button
                                        onClick={() => setBodySubTab('exercise')}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${bodySubTab === 'exercise' ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-white'}`}
                                    >{courseNiche === 'diet' ? 'Atividade' : 'Exercícios'}</button>
                                    <button
                                        onClick={() => setBodySubTab('study')}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${bodySubTab === 'study' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-white'}`}
                                    >Estudo Prático</button>
                                    <button
                                        onClick={() => setBodySubTab('quiz')}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${bodySubTab === 'quiz' ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/20' : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-white'}`}
                                    >Desafio IA</button>
                                </div>
                            )}

                            {isTherapyNiche ? (
                                <div className="bg-gray-800 border border-gray-700 rounded-[2.5rem] p-10 text-center">
                                    <h3 className="text-2xl font-black uppercase italic text-white mb-2">Foco Terapêutico</h3>
                                    <p className="text-gray-400">As métricas físicas estão ocultas para este curso. Foque em seu bem-estar mental.</p>
                                </div>
                            ) : (
                                <>
                                    {bodySubTab === 'food' && <FoodLogCard />}
                                    {bodySubTab === 'metrics' && <BodyMetricsCard hasPhysicalKit={hasPhysicalKit} />}
                                    {bodySubTab === 'biolab' && <BioLabCard hasPhysicalKit={hasPhysicalKit} />}
                                    {bodySubTab === 'exercise' && <ExerciseLogCard />}
                                    {bodySubTab === 'study' && <DynamicHealthFlashcards niche={courseNiche} context="body" onBack={() => setBodySubTab('food')} navigateTo={navigateTo} />}
                                    {bodySubTab === 'quiz' && <DynamicHealthQuiz niche={courseNiche} onBack={() => setBodySubTab('food')} navigateTo={navigateTo} />}
                                </>
                            )}
                        </div>
                    )}
                    {activeTab === 'mind' && (
                        <div className="space-y-8">
                            <div className="flex gap-3 mb-2 overflow-x-auto no-scrollbar pb-2 mask-fade-right">
                                <button
                                    onClick={() => setMindSubTab('feelings')}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${mindSubTab === 'feelings' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-white'}`}
                                >Emoções</button>
                                <button
                                    onClick={() => setMindSubTab('therapy')}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${mindSubTab === 'therapy' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-white'}`}
                                >Terapia</button>
                                <button
                                    onClick={() => setMindSubTab('intellect')}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${mindSubTab === 'intellect' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-white'}`}
                                >Intelecto</button>
                                <button
                                    onClick={() => setMindSubTab('spirit')}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${mindSubTab === 'spirit' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-white'}`}
                                >Espiritualidade</button>
                                <button
                                    onClick={() => setMindSubTab('astro')}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${mindSubTab === 'astro' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-white'}`}
                                >Astros</button>
                                <button
                                    onClick={() => setMindSubTab('sleep')}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${mindSubTab === 'sleep' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-white'}`}
                                >Sono</button>
                                <button
                                    onClick={() => setMindSubTab('study')}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${mindSubTab === 'study' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-white'}`}
                                >Memorização</button>
                                <button
                                    onClick={() => setMindSubTab('quiz')}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${mindSubTab === 'quiz' ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/20' : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-white'}`}
                                >Desafio IA</button>
                            </div>

                            <AnimatePresence mode="wait">
                                <div key={mindSubTab}>
                                    {mindSubTab === 'feelings' && <MoodTrackerCard />}
                                    {mindSubTab === 'therapy' && <TherapyLogCard />}
                                    {mindSubTab === 'intellect' && <IntellectLogCard />}
                                    {mindSubTab === 'spirit' && <SpiritualityLogCard />}
                                    {mindSubTab === 'astro' && <AstrologyCard />}
                                    {mindSubTab === 'sleep' && <SleepTrackerCard />}
                                    {mindSubTab === 'study' && <DynamicHealthFlashcards niche={courseNiche} context="mind" onBack={() => setMindSubTab('feelings')} navigateTo={navigateTo} />}
                                    {mindSubTab === 'quiz' && <DynamicHealthQuiz niche={courseNiche} onBack={() => setMindSubTab('feelings')} navigateTo={navigateTo} />}
                                </div>
                            </AnimatePresence>
                        </div>
                    )}
                    {activeTab === 'insights' && (
                        <div className="bg-gray-800 border border-gray-700 rounded-[2.5rem] p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                                <TrendingUp className="w-10 h-10 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-black uppercase italic mb-4">Relatório de Evolução</h2>
                            <p className="text-gray-400 max-w-md mx-auto mb-8">O Nexus está analisando seus últimos 7 dias de dados para gerar correlações entre sua alimentação e seu bem-estar mental.</p>
                            <Button
                                onClick={handleGenerateReport}
                                disabled={isProcessing || isGeneratingReport}
                                className="!bg-blue-600 text-white font-black uppercase px-12 py-4 shadow-xl shadow-blue-900/20"
                            >
                                {isProcessing || isGeneratingReport ? <><ActivityIcon className="animate-spin w-4 h-4 mr-2" /> Gerando...</> : "Gerar Nova Análise"}
                            </Button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            {/* Premium Credit Modals */}
            <InsufficientFundsAlert
                isOpen={showInsufficientModal}
                onClose={() => setShowInsufficientModal(false)}
                onRecharge={() => {
                    setShowInsufficientModal(false);
                    if (navigateTo) navigateTo('recharge');
                    else toast.error("Navegação indisponível");
                }}
                requiredCredits={10}
            />
        </div>
    );
};

// Local assistant icon placeholder removed in favor of global Sparkles

export default HealthMindDiaryPage;
