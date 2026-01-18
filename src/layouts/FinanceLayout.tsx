
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign, ShieldCheck, Receipt, CreditCard, Users,
    LayoutDashboard, LogOut, Menu, X, User, MessageSquare, FileText, AlertTriangle, ChevronLeft, ChevronRight
} from '../components/Icons';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';

interface FinanceLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    user: any;
}

// Define these outside the component
const MENU_ITEMS = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'chat', label: 'Atendimento', icon: MessageSquare },
    { id: 'commissions', label: 'Comissões', icon: DollarSign },
    { id: 'payables', label: 'Contas a Pagar', icon: Receipt },
    { id: 'requests', label: 'Solicitações', icon: CreditCard },
    { id: 'withdrawals', label: 'Saques (Lotes)', icon: DollarSign },
    { id: 'audit', label: 'Auditoria', icon: ShieldCheck },
    { id: 'hr-approvals', label: 'Gestão de Pessoas', icon: AlertTriangle },
    { id: 'team-chat', label: 'Chat Equipe', icon: Users },
    { id: 'profile', label: 'Meu Perfil', icon: User },
];

interface SidebarItemProps {
    item: typeof MENU_ITEMS[0];
    activeTab: string;
    onTabChange: (tab: string) => void;
    isSidebarCollapsed: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, activeTab, onTabChange, isSidebarCollapsed, setIsMobileMenuOpen }) => (
    <button
        onClick={() => {
            onTabChange(item.id);
            setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 group relative
            ${activeTab === item.id
                ? 'bg-brand-primary text-black font-bold shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.5)]'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }
            ${isSidebarCollapsed ? 'justify-center' : ''}
        `}
    >
        <item.icon className="w-5 h-5 shrink-0" />
        {!isSidebarCollapsed && (
            <span className="text-sm tracking-wide">{item.label}</span>
        )}

        {isSidebarCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg border border-gray-700 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                {item.label}
            </div>
        )}
    </button>
);

export const FinanceLayout: React.FC<FinanceLayoutProps> = ({
    children,
    activeTab,
    onTabChange,
    user
}) => {
    const { signOut } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen md:h-[100dvh] bg-[#050505] text-gray-200 overflow-hidden font-sans">
            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex flex-col border-r border-gray-800 bg-[#0a0a0a] transition-all duration-300 z-20 ${isSidebarCollapsed ? 'w-24' : 'w-72'}`}>
                {/* Header */}
                <div className={`h-16 flex items-center px-6 border-b border-gray-800 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isSidebarCollapsed && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center text-black font-bold">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">Financeiro</span>
                        </div>
                    )}
                    {isSidebarCollapsed && (
                        <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-black">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    )}

                    {/* Toggle Button in Header */}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className={`p-1.5 text-gray-400 hover:text-brand-primary hover:bg-white/5 border border-transparent hover:border-white/10 rounded-lg transition-all ${isSidebarCollapsed ? 'mt-4 mx-auto' : ''}`}
                        title={isSidebarCollapsed ? "Expandir" : "Recolher"}
                    >
                        {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {MENU_ITEMS.map(item => (
                        <SidebarItem
                            key={item.id}
                            item={item}
                            activeTab={activeTab}
                            onTabChange={onTabChange}
                            isSidebarCollapsed={isSidebarCollapsed}
                            setIsMobileMenuOpen={setIsMobileMenuOpen}
                        />
                    ))}
                </nav>


                {/* Footer / User */}
                <div className="p-4 border-t border-gray-800 bg-[#080808]">
                    <div className={`flex items-center gap-3 mb-4 ${isSidebarCollapsed ? 'justify-center' : 'px-2'}`}>
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                            <User className="w-5 h-5 text-gray-400" />
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user?.displayName || 'Usuário'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        )}
                    </div>
                    <button onClick={signOut} className={`w-full flex items-center gap-2 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                        <LogOut className="w-5 h-5" />
                        {!isSidebarCollapsed && <span className="font-bold text-sm">Sair</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Header & Overlay */}
            <div className={`fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)} />

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0a0a] border-r border-gray-800 transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-black">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="font-black text-white text-lg uppercase">Financeiro</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400"><X className="w-6 h-6" /></button>
                </div>
                <nav className="p-4 space-y-2">
                    {MENU_ITEMS.map(item => (
                        <SidebarItem
                            key={item.id}
                            item={item}
                            activeTab={activeTab}
                            onTabChange={onTabChange}
                            isSidebarCollapsed={isSidebarCollapsed}
                            setIsMobileMenuOpen={setIsMobileMenuOpen}
                        />
                    ))}
                </nav>
            </aside>



            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-gray-900 relative overflow-hidden">
                {/* Mobile Top Bar */}
                <div className="md:hidden h-16 border-b border-gray-800 flex items-center justify-between px-4 bg-[#0a0a0a]">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-brand-primary" />
                        <span className="font-bold text-white">Painel Financeiro</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Content Area */}
                {/* Content Area */}
                <div className={`flex-1 flex flex-col relative h-full ${(activeTab === 'chat' || activeTab === 'team-chat') ? 'overflow-hidden p-0' : 'overflow-y-auto custom-scrollbar p-4 md:p-8'}`}>
                    <div className={`${(activeTab === 'chat' || activeTab === 'team-chat') ? 'flex-1 flex flex-col w-full !h-full' : 'max-w-7xl mx-auto w-full'}`} style={{ height: (activeTab === 'chat' || activeTab === 'team-chat') ? '100%' : 'auto' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className={(activeTab === 'chat' || activeTab === 'team-chat') ? 'flex-1 flex flex-col w-full !h-full' : ''}
                                style={{ height: (activeTab === 'chat' || activeTab === 'team-chat') ? '100%' : 'auto' }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};
