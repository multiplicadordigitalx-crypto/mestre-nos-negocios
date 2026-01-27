
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Star, ActivityIcon, Crown, PlusCircle, Search } from '../../components/Icons';
import { MuralTab } from './tabs/MuralTab';
import { EliteTab } from './tabs/EliteTab';
import ChatPage from '../ChatPage'; // Existing chat component
import { CreditBalanceWidget } from '../../components/CreditBalanceWidget';

type CommunityTab = 'mural' | 'chat' | 'elite';

const CommunityPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<CommunityTab>('mural');

    const tabs = [
        { id: 'mural', label: 'Mural Social', icon: <ActivityIcon className="w-5 h-5" /> },
        { id: 'chat', label: 'Canais de Chat', icon: <MessageSquare className="w-5 h-5" /> },
        { id: 'elite', label: 'Elite Hub', icon: <Crown className="w-5 h-5" /> },
    ];

    return (
        <div className="min-h-screen animate-fade-in">
            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-800">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-primary/10 rounded-2xl border border-brand-primary/20">
                        <Users className="w-8 h-8 text-brand-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
                            Comunidade <span className="text-brand-primary">2.0</span>
                        </h1>
                        <p className="text-gray-400 text-xs md:text-sm font-medium">Interaja, aprenda e domine o mercado com os melhores.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <CreditBalanceWidget navigateTo={(page) => window.location.href = `/${page}`} />
                    <button className="bg-brand-primary text-black font-black uppercase text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" /> Novo Post
                    </button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex p-1 bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 mb-8 max-w-fit overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as CommunityTab)}
                        className={`
                            flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                            ${activeTab === tab.id
                                ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/20'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}
                        `}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'mural' && <MuralTab />}
                        {activeTab === 'chat' && (
                            <div className="rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
                                <ChatPage />
                            </div>
                        )}
                        {activeTab === 'elite' && <EliteTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CommunityPage;
