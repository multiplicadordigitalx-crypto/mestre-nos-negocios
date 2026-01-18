
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Home, Users, DollarSign, MessageSquare, Settings, Briefcase, Monitor, ChevronLeft, ChevronRight } from '../components/Icons';
import { NavItem } from '../components/common/NavItem';
import { motion, AnimatePresence } from 'framer-motion';
import { ProducerSchoolsPage } from '../pages/producer/ProducerSchoolsPage';
import { ProducerOverviewPage } from '../pages/producer/ProducerOverviewPage';
import { ProducerSupportPage } from '../pages/producer/ProducerSupportPage';
import { ProducerTeamPage } from '../pages/producer/ProducerTeamPage';
import { ProducerFinancePage } from '../pages/producer/ProducerFinancePage';
import { ProducerSettingsPage } from '../pages/producer/ProducerSettingsPage';
import { ProducerConsultancyPage } from '../pages/producer/ProducerConsultancyPage';

export const ProducerDashboardLayout: React.FC = () => {
    const { user } = useAuth();
    const [activePage, setActivePage] = useState<string>('dashboard');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const navigateTo = (page: string) => {
        setActivePage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col md:flex-row h-screen relative bg-gray-950 overflow-hidden">
            {/* Sidebar */}
            <nav className={`fixed bottom-0 left-0 w-full md:relative ${isSidebarCollapsed ? 'md:w-20 lg:w-20' : 'md:w-20 lg:w-64'} bg-gray-900 border-r border-gray-800 flex md:flex-col justify-between py-2 md:py-8 px-2 ${isSidebarCollapsed ? 'lg:px-2' : 'lg:px-4'} z-50 overflow-x-auto md:overflow-x-visible transition-all duration-300`}>

                {/* Manual Toggle Button */}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="hidden lg:flex absolute -right-3 top-24 bg-purple-600 rounded-full p-1 text-white z-[60] shadow-lg shadow-purple-500/40 hover:scale-110 transition-all border border-purple-400"
                >
                    {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                <div className={`hidden md:flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} mb-12 px-2 lg:px-4 flex-shrink-0`}>
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                        <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    {!isSidebarCollapsed && (
                        <motion.h1
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm font-black text-white hidden lg:block uppercase leading-tight"
                        >
                            Área do<br />Produtor
                        </motion.h1>
                    )}
                </div>

                <div className="flex md:flex-col w-full md:w-auto h-full items-center md:items-stretch px-2 md:px-0 gap-2 md:gap-1 min-w-max md:min-w-0">
                    <NavItem
                        icon={<Home className="w-5 h-5" />}
                        label="Visão Geral"
                        isActive={activePage === 'dashboard'}
                        onClick={() => navigateTo('dashboard')}
                        isCollapsed={isSidebarCollapsed}
                    />
                    <NavItem
                        icon={<Monitor className="w-5 h-5" />}
                        label="Minhas Escolas"
                        isActive={activePage === 'schools'}
                        onClick={() => navigateTo('schools')}
                        iconColor="text-brand-primary"
                        isCollapsed={isSidebarCollapsed}
                    />

                    <div className="my-2 border-t border-gray-800 hidden md:block" />
                    <NavItem
                        icon={<Monitor className="w-5 h-5" />}
                        label="Consultoria Nexus"
                        isActive={activePage === 'consultancy'}
                        onClick={() => navigateTo('consultancy')}
                        iconColor="text-purple-400"
                        isCollapsed={isSidebarCollapsed}
                    />
                    <div className="my-2 border-t border-gray-800 hidden md:block" />

                    <NavItem
                        icon={<MessageSquare className="w-5 h-5" />}
                        label="Suporte Unificado"
                        isActive={activePage === 'support'}
                        onClick={() => navigateTo('support')}
                        isCollapsed={isSidebarCollapsed}
                    />
                    <NavItem
                        icon={<Users className="w-5 h-5" />}
                        label="Equipes"
                        isActive={activePage === 'teams'}
                        onClick={() => navigateTo('teams')}
                        isCollapsed={isSidebarCollapsed}
                    />
                    <NavItem
                        icon={<DollarSign className="w-5 h-5" />}
                        label="Financeiro"
                        isActive={activePage === 'finance'}
                        onClick={() => navigateTo('finance')}
                        isCollapsed={isSidebarCollapsed}
                    />
                    <div className="my-4 border-t border-gray-800 hidden md:block" />
                    <NavItem
                        icon={<Settings className="w-5 h-5" />}
                        label="Configurações"
                        isActive={activePage === 'settings'}
                        onClick={() => navigateTo('settings')}
                        isCollapsed={isSidebarCollapsed}
                    />
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative bg-gray-950 scroll-smooth">
                <div className={`${activePage === 'support' || activePage === 'consultancy' ? 'p-0 md:p-0' : 'p-4 sm:p-6 lg:p-8'} pb-24 md:pb-8 flex flex-col h-full`}>
                    <div className={`flex justify-between items-center mb-8 ${activePage === 'consultancy' ? 'hidden md:flex' : ''}`}>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                                {activePage === 'dashboard' && 'Visão Geral'}
                                {activePage === 'schools' && 'Minhas Escolas'}
                                {activePage === 'consultancy' && 'Consultoria & Inteligência'}
                                {activePage === 'support' && 'Central de Suporte'}
                                {activePage === 'teams' && 'Gestão de Equipes'}
                                {activePage === 'finance' && 'Financeiro'}
                                {activePage === 'settings' && 'Configurações'}
                            </h2>
                            <p className="text-gray-400 text-sm">Gerencie seu império digital.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-white font-bold text-sm">{user?.displayName}</span>
                                <span className="text-gray-500 text-xs uppercase font-bold">Produtor</span>
                            </div>
                            {user?.photoURL && <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-xl border border-gray-700" />}
                        </div>
                    </div>

                    {/* Router */}


                    {activePage === 'dashboard' && <ProducerOverviewPage />}
                    {activePage === 'schools' && <ProducerSchoolsPage onNavigate={navigateTo} />}
                    {activePage === 'consultancy' && <ProducerConsultancyPage />}
                    {activePage === 'support' && <ProducerSupportPage />}
                    {activePage === 'teams' && <ProducerTeamPage />}
                    {activePage === 'finance' && <ProducerFinancePage />}
                    {activePage === 'settings' && <ProducerSettingsPage />}
                </div>
            </main>
        </div>
    );
};
