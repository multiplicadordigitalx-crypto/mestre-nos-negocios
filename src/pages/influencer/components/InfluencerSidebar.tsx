
import React from 'react';
import {
    Home, Wallet, Settings, Link as LinkIcon,
    ShoppingBag, Brain, PlayCircle, MessageSquare, User, LogOut
} from '@/components/Icons';
import { NavItem } from '@/components/common/NavItem';

export type InfluencerTab = 'overview' | 'links' | 'marketplace' | 'financial' | 'mestre_ia_partner' | 'videos' | 'support' | 'profile';

interface InfluencerSidebarProps {
    activeTab: InfluencerTab;
    setActiveTab: (tab: InfluencerTab) => void;
    onLogout: () => void;
    onEditProfile: () => void;
    influencerRole?: string;
}

export const InfluencerSidebar: React.FC<InfluencerSidebarProps> = ({
    activeTab,
    setActiveTab,
    onLogout,
    onEditProfile,
    influencerRole
}) => {

    return (
        <nav className={`fixed bottom-0 left-0 w-full md:relative md:w-20 lg:w-64 bg-gray-900/95 backdrop-blur-md border-t md:border-t-0 md:border-r border-gray-700 flex md:flex-col items-center md:items-stretch md:justify-start md:py-8 md:px-2 lg:px-4 z-50 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto no-scrollbar scroll-smooth snap-x snap-mandatory`}>
            <div className="hidden md:flex items-center gap-3 mb-12 px-2 lg:px-4 flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20">
                    <Brain className="w-6 h-6 text-black" />
                </div>
                <h1 className="text-sm font-black text-white hidden lg:block uppercase leading-tight">Painel do<br />Parceiro</h1>
            </div>

            <div className="flex md:flex-col w-full md:w-auto h-full items-center md:items-stretch px-4 md:px-0 gap-1 md:gap-0.5 min-w-max md:min-w-0 pb-2 md:pb-0">
                <div className="snap-center">
                    <NavItem icon={<Home className="w-5 h-5" />} label="Performance" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} iconColor="text-yellow-400" />
                </div>
                <div className="snap-center">
                    <NavItem icon={<LinkIcon className="w-5 h-5" />} label="Meus Links" isActive={activeTab === 'links'} onClick={() => setActiveTab('links')} iconColor="text-blue-400" />
                </div>
                <div className="snap-center">
                    <NavItem icon={<ShoppingBag className="w-5 h-5" />} label="Marketplace" isActive={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} iconColor="text-orange-400" />
                </div>
                <div className="snap-center">
                    <NavItem icon={<Wallet className="w-5 h-5" />} label="Financeiro" isActive={activeTab === 'financial'} onClick={() => setActiveTab('financial')} iconColor="text-green-400" />
                </div>
                <div className="snap-center">
                    <NavItem icon={<Brain className="w-5 h-5" />} label="Mestre IA" isActive={activeTab === 'mestre_ia_partner'} onClick={() => setActiveTab('mestre_ia_partner')} iconColor="text-purple-400" />
                </div>
                <div className="snap-center">
                    <NavItem icon={<PlayCircle className="w-5 h-5" />} label="Vídeos" isActive={activeTab === 'videos'} onClick={() => setActiveTab('videos')} iconColor="text-red-400" />
                </div>
                <div className="snap-center">
                    <NavItem icon={<MessageSquare className="w-5 h-5" />} label="Suporte" isActive={activeTab === 'support'} onClick={() => setActiveTab('support')} iconColor="text-emerald-400" />
                </div>

                <div className="h-px bg-gray-800 my-4 hidden lg:block opacity-50"></div>

                <div className="snap-center">
                    <NavItem icon={<User className="w-5 h-5" />} label="Meu Perfil" isActive={false} onClick={onEditProfile} iconColor="text-gray-300" />
                </div>
                <div className="snap-center md:mt-4">
                    <NavItem icon={<LogOut className="w-5 h-5" />} label="Sair" isActive={false} onClick={onLogout} iconColor="text-red-500" />
                </div>
            </div>
        </nav>
    );
};
