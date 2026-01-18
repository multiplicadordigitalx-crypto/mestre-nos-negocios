
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { NavItem } from '@/components/common/NavItem';
import AdminHeader from '@/components/AdminHeader';
import Button from '@/components/Button';
import { PainelDoAluno } from '@/pages/painel/PainelDoAluno';

// Imports das Views
import AdminPage from '../pages/AdminPage';
import AdminTrainingPage from '../pages/AdminTrainingPage';
import MestreIAAdminPage from '../pages/MestreIAAdminPage';
import MestreIAPage from '../pages/MestreIAPage';
import MarketingPage from '../pages/MarketingPage';
import IntegrationsPage from '../pages/IntegrationsPage';
import FunnelsPage from '../pages/FunnelsPage';
import EmailPage from '../pages/EmailPage';
import InternalCampaignsPage from '../pages/InternalCampaignsPage';
import SystemHealthPage from '../pages/SystemHealthPage';
import NexusAIPage from '../pages/NexusAIPage';
import NexusAdsPage from '../pages/NexusAdsPage'; // New Import
import PurchaseButtonsView from '../pages/admin/views/PurchaseButtonsView';
import PricesCreditsView from '../pages/admin/views/prices/PricesCreditsView';

import TeamManagementView from '../pages/admin/views/TeamManagementView';

import {
    ShieldCheck, FileText, Crown, Megaphone, Link as LinkIcon,
    Filter, Mail, Rocket, MousePointer, HeartPulse, Cpu, Eye, ArrowLeft,
    Coins, User, Users, Target, ChevronLeft, ChevronRight
} from '@/components/Icons';
import { StudentPage } from '@/types';

type AdminPageType =
    | 'overview'
    | 'team'
    | 'costs_prices'
    | 'training'
    | 'mestre-ia-admin'
    | 'mestre-ia-test'
    | 'mestre-ia-use'
    | 'marketing'
    | 'nexus_ads' // New Type
    | 'integrations'
    | 'email'
    | 'system_health'
    | 'funnels'
    | 'nexus_ai'
    | 'internal_campaigns'
    | 'purchase_buttons'


export const AdminLayout: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<AdminPageType>('overview');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { isImpersonating, stopImpersonation, user } = useAuth();
    const [activeStudentPage, setActiveStudentPage] = useState<StudentPage>('dashboard');

    const MENU_ITEMS = [
        {
            id: 'overview',
            label: 'Visão Geral',
            icon: <ShieldCheck className="w-5 h-5" />,
            color: 'text-blue-400'
        },


        {
            id: 'costs_prices',
            label: 'Custos e Preços',
            icon: <Coins className="w-5 h-5" />,
            color: 'text-emerald-400'
        },
        {
            id: 'training',
            label: 'Treinamento',
            icon: <FileText className="w-5 h-5" />,
            color: 'text-indigo-400'
        },
        {
            id: 'mestre-ia-admin',
            label: 'Mestre IA',
            icon: <Crown className="w-5 h-5" />,
            color: 'text-purple-500',
            activeIds: ['mestre-ia-admin', 'mestre-ia-test', 'mestre-ia-use']
        },
        {
            id: 'marketing',
            label: 'Marketing',
            icon: <Megaphone className="w-5 h-5" />,
            color: 'text-red-500'
        },
        {
            id: 'nexus_ads', // New Item
            label: 'Nexus Ads',
            icon: <Target className="w-5 h-5" />,
            color: 'text-red-600'
        },
        {
            id: 'integrations',
            label: 'Integrações',
            icon: <LinkIcon className="w-5 h-5" />,
            color: 'text-cyan-400'
        },
        {
            id: 'funnels',
            label: 'FUNIL & PGS',
            icon: <Filter className="w-5 h-5" />,
            color: 'text-orange-500'
        },
        {
            id: 'email',
            label: 'E-mail',
            icon: <Mail className="w-6 h-6" />,
            color: 'text-yellow-400'
        },
        {
            id: 'internal_campaigns',
            label: 'Campanhas',
            icon: <Rocket className="w-5 h-5 text-yellow-500" />,
            color: 'text-rose-500'
        },
        {
            id: 'purchase_buttons',
            label: 'Botões Compra',
            icon: <MousePointer className="w-6 h-6" />,
            color: 'text-emerald-400'
        },
        {
            id: 'system_health',
            label: 'Monitoramento',
            icon: <HeartPulse className="w-6 h-6" />,
            color: 'text-teal-400'
        },
        {
            id: 'nexus_ai',
            label: 'Nexus AI',
            icon: <Cpu className="w-5 h-5" />,
            color: 'text-fuchsia-500'
        }
    ];

    if (isImpersonating) {
        return (
            <div className="relative">
                <div className="fixed top-0 left-0 w-full bg-indigo-600 z-[100] flex justify-between items-center px-4 py-2 shadow-lg">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <Eye className="w-5 h-5" />
                        <span>Modo Personificação: Visualizando como {user?.displayName}</span>
                    </div>
                    <Button
                        onClick={stopImpersonation}
                        className="!py-1 !px-3 !text-xs !bg-white !text-indigo-600 hover:!bg-gray-100 font-bold"
                    >
                        Voltar para Admin
                    </Button>
                </div>
                <PainelDoAluno activePage={activeStudentPage} navigateTo={(p) => setActiveStudentPage(p)} />
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-gray-200 overflow-hidden">
            {/* Global Scrollbar Hide Style */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .custom-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            {/* Sidebar Wrapper (Static) */}
            <aside className={`fixed bottom-0 left-0 w-full md:relative ${isSidebarCollapsed ? 'md:w-20' : 'md:w-20 lg:w-64'} bg-gray-900/95 backdrop-blur-sm border-t md:border-t-0 md:border-r border-gray-700 z-50 flex flex-col transition-all duration-300`}>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-x-auto md:overflow-y-auto custom-scrollbar flex md:flex-col justify-around md:justify-start md:py-6 md:px-2 lg:px-3">
                    <div className={`hidden md:flex items-center gap-2 mb-6 px-2 lg:px-2 flex-shrink-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                        <ShieldCheck className="h-7 w-7 text-brand-primary" />
                        {!isSidebarCollapsed && <h1 className="text-lg font-bold text-white hidden lg:block animate-fade-in">Painel Admin</h1>}
                    </div>

                    <div className="flex md:flex-col gap-1 w-full min-w-max md:min-w-0 pr-4 md:pr-0">
                        {MENU_ITEMS.map((item) => (
                            <NavItem
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                isActive={
                                    (item as any).activeIds
                                        ? (item as any).activeIds.includes(currentPage)
                                        : currentPage === item.id
                                }
                                onClick={() => setCurrentPage(item.id as AdminPageType)}
                                iconColor={item.color}
                                isCollapsed={isSidebarCollapsed}
                            />
                        ))}
                    </div>
                </div>

                {/* Toggle Button (Absolute to Aside, Outside Scroll) */}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="hidden md:flex absolute top-6 -right-3 w-6 h-6 bg-gray-800 border border-gray-600 rounded-full items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors z-[60] shadow-md"
                    title={isSidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
                >
                    {isSidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </button>
            </aside>

            <main className="flex-1 pb-24 md:pb-0 overflow-y-auto bg-gray-900 relative">
                <AdminHeader />
                <div className="p-4 sm:p-6 lg:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {currentPage === 'overview' && <AdminPage />}
                            {currentPage === 'team' && <TeamManagementView />}
                            {currentPage === 'costs_prices' && <PricesCreditsView />}
                            {currentPage === 'training' && <AdminTrainingPage />}
                            {currentPage === 'mestre-ia-admin' && (
                                <MestreIAAdminPage
                                    onTestMode={() => setCurrentPage('mestre-ia-test')}
                                    onUseTool={() => setCurrentPage('mestre-ia-use')}
                                />
                            )}
                            {(currentPage === 'mestre-ia-test' || currentPage === 'mestre-ia-use') && (
                                <div className="relative">
                                    <div className={`flex items-center justify-between mb-4 p-4 rounded-xl border ${currentPage === 'mestre-ia-test' ? 'bg-gray-800 border-yellow-500/30' : 'bg-purple-900/20 border-purple-500/30'}`}>
                                        <span className={`${currentPage === 'mestre-ia-test' ? 'text-yellow-400' : 'text-purple-400'} font-bold text-sm flex items-center gap-2`}>
                                            {currentPage === 'mestre-ia-test' ? <Eye className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                                            {currentPage === 'mestre-ia-test' ? 'Modo de Teste: Visualizando como Aluno' : 'Modo Admin: Acesso Ilimitado'}
                                        </span>
                                        <Button
                                            onClick={() => setCurrentPage('mestre-ia-admin')}
                                            className="!py-1 !text-xs !bg-white !text-black hover:!bg-gray-200"
                                        >
                                            <ArrowLeft className="w-3 h-3 mr-1" /> Voltar
                                        </Button>
                                    </div>
                                    <MestreIAPage />
                                </div>
                            )}
                            {currentPage === 'marketing' && <MarketingPage />}
                            {currentPage === 'nexus_ads' && <NexusAdsPage />}
                            {currentPage === 'integrations' && <IntegrationsPage />}
                            {currentPage === 'funnels' && <FunnelsPage />}
                            {currentPage === 'email' && <EmailPage />}
                            {currentPage === 'internal_campaigns' && <InternalCampaignsPage />}
                            {currentPage === 'purchase_buttons' && <PurchaseButtonsView />}
                            {currentPage === 'system_health' && <SystemHealthPage />}
                            {currentPage === 'nexus_ai' && <NexusAIPage />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
};

export default AdminLayout;
