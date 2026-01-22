
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';
import { LogOut, ArrowLeft, Bell, ChevronDown, PlusCircle, User, Settings, Camera, ShoppingBag, CreditCard, Trophy, Brain, Wallet, DollarSign, Zap, MessageSquare } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Student, StudentPage, SchoolConfig } from '../types';

interface HeaderProps {
    goBack?: () => void;
    canGoBack?: boolean;
    navigateTo?: (page: StudentPage) => void;
    schoolConfig?: SchoolConfig | null;
}

export const StudentHeader: React.FC<HeaderProps> = ({ goBack, canGoBack = false, navigateTo, schoolConfig }) => {
    const { user, signOut, updateProfilePhoto } = useAuth();
    const student = user as Student;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Dados Mockados ou do Contexto
    const mockCredits = student?.dailyMestreIALimit || 30;
    // Calculando saldo disponível mockado baseado no histórico ou valor fixo para demo
    const availableBalance = student?.incomeHistory?.reduce((acc, curr) => acc + curr.amount, 0) || 1250.00;
    const planName = "Elite";

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePhotoChangeClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Por favor, selecione um arquivo de imagem.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('A imagem deve ter no máximo 5MB.');
                return;
            }
            updateProfilePhoto(file);
        }
    };

    const handleRecharge = () => {
        if (navigateTo) {
            navigateTo('recharge');
            setIsDropdownOpen(false);
        } else {
            toast("Redirecionando para recarga...", { icon: '🟣' });
        }
    };

    const handleNavigateToFinancial = () => {
        if (navigateTo) {
            navigateTo('financial');
            setIsDropdownOpen(false);
        } else {
            toast.error("Navegação indisponível");
        }
    };

    return (
        <header className="flex flex-row justify-between items-center px-4 py-3 md:p-5 bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 relative z-40 rounded-b-[1.5rem] md:rounded-b-[2rem] shadow-2xl">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            <div className="flex items-center gap-2 md:gap-4 shrink-0 max-w-[65%]">
                {canGoBack && goBack && (
                    <Button variant="ghost" onClick={goBack} className="!p-1.5 md:!p-2.5 hover:bg-gray-800 rounded-xl md:rounded-2xl text-gray-300 hover:text-white transition-all border border-transparent hover:border-gray-700 shrink-0">
                        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="ml-2 hidden sm:inline font-bold uppercase text-[10px] tracking-widest">Voltar</span>
                    </Button>
                )}

                {/* Identidade da Marca (Logo + Slogan) */}
                <div className="flex items-center gap-2 md:gap-3 overflow-hidden cursor-pointer" onClick={() => navigateTo && navigateTo('dashboard')}>
                    {schoolConfig?.theme?.logoUrl ? (
                        <img
                            src={schoolConfig.theme.logoUrl}
                            alt={schoolConfig.name || "School Logo"}
                            className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-lg shadow-lg"
                        />
                    ) : (
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-brand-primary to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20 shrink-0">
                            <Brain className="w-5 h-5 md:w-6 md:h-6 text-black" />
                        </div>
                    )}

                    <div className="flex flex-col justify-center min-w-0">
                        <h1 className="text-[10px] sm:text-xs md:text-sm font-black text-white uppercase leading-none tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                            {schoolConfig?.name || "Mestre nos Negócios"}
                        </h1>
                        <p className="text-[8px] md:text-[10px] text-brand-primary font-bold tracking-wider uppercase mt-0.5 opacity-100 whitespace-nowrap">
                            {schoolConfig?.subdomain ? "PLATAFORMA EXCLUSIVA" : "TRANSFORMANDO VIDAS"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-8 justify-end shrink-0" ref={dropdownRef}>

                {/* Student Specific: Credits (Desktop) - Clickable & Improved */}
                <button
                    onClick={() => navigateTo && navigateTo('wallet')}
                    className="hidden lg:flex flex-col items-end group cursor-pointer hover:bg-gray-800/50 p-2 rounded-xl transition-all border border-transparent hover:border-gray-700/50"
                >
                    <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded-full bg-brand-primary/10 group-hover:bg-brand-primary/20 transition-colors">
                            <Zap className="w-3.5 h-3.5 text-brand-primary" />
                        </div>
                        <p className="text-white font-black text-sm tracking-tight leading-none">{mockCredits} CRÉDITOS</p>
                    </div>
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest group-hover:text-brand-primary transition-colors mt-0.5">
                        Carteira & Extrato
                    </p>
                </button>

                {/* Available Balance (Desktop) - Conditional for Marketing/Sales */}
                {(student?.onboarding?.niche?.toUpperCase().includes('MARKETING') ||
                    student?.onboarding?.niche?.toUpperCase().includes('VENDAS') ||
                    student?.onboarding?.niche?.toUpperCase().includes('SALES')) && (
                        <div className="hidden md:block text-right cursor-pointer" onClick={handleNavigateToFinancial}>
                            <p className="text-green-400 font-black text-sm tracking-tight leading-none mb-1">R$ {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest flex items-center justify-end gap-1">
                                <Wallet className="w-3 h-3" /> Saldo Livre
                            </p>
                        </div>
                    )}

                {/* Notifications */}
                <div className="relative cursor-pointer group p-1.5 md:p-2 bg-gray-800/40 rounded-xl border border-gray-700 hover:border-gray-500 transition-all shrink-0">
                    <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-white transition-colors" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-gray-900"></span>
                </div>

                {/* User Profile */}
                <div
                    className="flex items-center gap-2 md:gap-4 cursor-pointer group select-none shrink-0"
                    onClick={toggleDropdown}
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-white font-black text-xs md:text-sm leading-tight group-hover:text-brand-primary transition-colors truncate max-w-[100px] md:max-w-none">
                            {user?.displayName || 'Aluno'}
                        </p>
                        <div className="flex items-center justify-end gap-1.5 text-[9px] text-gray-500 font-black uppercase tracking-tighter">
                            <Trophy className="w-2.5 h-2.5 md:w-3 md:h-3 text-yellow-500" />
                            <span>{student?.gamification?.level || 'Iniciante'}</span>
                        </div>
                    </div>

                    <div className="relative">
                        <img
                            src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.email}`}
                            alt="Avatar"
                            className={`w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl border-2 transition-all object-cover ${isDropdownOpen ? 'border-brand-primary shadow-[0_0_15px_#FACC15]' : 'border-gray-700 group-hover:border-gray-500'}`}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-gray-800 rounded-lg p-0.5 border border-gray-600 shadow-xl hidden md:block">
                            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </div>
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            transition={{ duration: 0.2, type: 'spring', damping: 20 }}
                            className="absolute top-full right-0 mt-4 w-72 md:w-80 bg-[#0c0d12] border border-[#27272A] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 ring-1 ring-white/5"
                        >
                            <div className="p-5 border-b border-[#27272A] bg-[#0c0d12]">
                                <h4 className="text-white font-black text-lg tracking-tighter truncate">{user?.displayName}</h4>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 mb-3 truncate">{user?.email}</p>

                                <div className="inline-flex items-center gap-2 bg-gray-800/30 px-3 py-1.5 rounded-xl border border-gray-700/50 w-full shadow-inner">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                                    <div className="flex-1">
                                        <p className="text-[8px] text-gray-500 font-black uppercase">Plano Ativo</p>
                                        <p className="text-[10px] text-white font-black">{planName}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 space-y-5">
                                {/* Créditos IA - Yellow Block */}
                                <div className="space-y-2">
                                    <div className="flex flex-col">
                                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Saldo Créditos IA</p>
                                        <div className="flex items-center gap-1.5">
                                            <Zap className="w-5 h-5 text-brand-primary" />
                                            <span className="text-2xl font-black text-white">{mockCredits}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={handleRecharge}
                                            className="col-span-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
                                        >
                                            <PlusCircle className="w-3 h-3" /> Recarregar
                                        </button>
                                        <button
                                            onClick={() => { setIsDropdownOpen(false); navigateTo && navigateTo('wallet'); }}
                                            className="col-span-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-gray-700 flex items-center justify-center gap-2"
                                        >
                                            <Wallet className="w-3 h-3" /> Extrato
                                        </button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-gray-800"></div>

                                {/* Financeiro - Green Block - Conditional */}
                                {(student?.onboarding?.niche?.toUpperCase().includes('MARKETING') ||
                                    student?.onboarding?.niche?.toUpperCase().includes('VENDAS') ||
                                    student?.onboarding?.niche?.toUpperCase().includes('SALES')) && (
                                        <div className="space-y-2">
                                            <div className="flex flex-col">
                                                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Disponível para Saque</p>
                                                <div className="flex items-center gap-1.5">
                                                    <Wallet className="w-5 h-5 text-green-500" />
                                                    <span className="text-2xl font-black text-green-400">R$ {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleNavigateToFinancial}
                                                className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                                            >
                                                <DollarSign className="w-4 h-4" /> Realizar Saque
                                            </button>
                                        </div>
                                    )}
                            </div>

                            <div className="p-2 bg-[#121214] border-t border-[#27272A] space-y-1">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handlePhotoChangeClick(); }}
                                    className="w-full text-left px-4 py-2.5 text-xs text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all flex items-center gap-3 font-bold group"
                                >
                                    <div className="p-1.5 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors"><Camera className="w-3.5 h-3.5 text-brand-primary" /></div>
                                    ALTERAR FOTO
                                </button>

                                <button
                                    onClick={() => { setIsDropdownOpen(false); navigateTo && navigateTo('profile'); }}
                                    className="w-full text-left px-4 py-2.5 text-xs text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all flex items-center gap-3 font-bold group"
                                >
                                    <div className="p-1.5 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors"><User className="w-3.5 h-3.5 text-gray-400" /></div>
                                    MEUS DADOS
                                </button>

                                <button
                                    onClick={() => { setIsDropdownOpen(false); navigateTo && navigateTo('support'); }}
                                    className="w-full text-left px-4 py-2.5 text-xs text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all flex items-center gap-3 font-bold group"
                                >
                                    <div className="p-1.5 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors"><MessageSquare className="w-3.5 h-3.5 text-emerald-400" /></div>
                                    SUPORTE
                                </button>

                                <div className="h-px bg-gray-800/50 my-1 mx-2"></div>
                                <button
                                    onClick={() => { setIsDropdownOpen(false); signOut(); }}
                                    className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all flex items-center gap-3 font-black uppercase tracking-widest group"
                                >
                                    <div className="p-1.5 bg-red-900/10 rounded-lg group-hover:bg-red-900/20 transition-colors"><LogOut className="w-3.5 h-3.5" /></div>
                                    SAIR
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
};
