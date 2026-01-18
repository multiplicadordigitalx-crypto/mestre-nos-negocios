import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';
import { LogOut, ArrowLeft, Bell, ChevronDown, PlusCircle, User, Settings, Camera, ShoppingBag, CreditCard } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface HeaderProps {
  user?: any; // Prop para sobrescrever o usuário do useAuth
  onLogout?: () => void; // Prop para logout customizado (importante para Influencers/Sales)
  goBack?: () => void;
  canGoBack?: boolean;
  navigateTo?: (page: any) => void;
}

const MotionDiv = motion.div as any;

const Header: React.FC<HeaderProps> = ({ user: userProp, onLogout, goBack, canGoBack = false, navigateTo }) => {
  const { user: authUser, signOut, updateProfilePhoto } = useAuth();
  const user = userProp || authUser;
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock Data ou do usuário
  const mockCredits = (user as any)?.creditBalance || 30;
  const mockSales = (user as any)?.totalEarnings || 8742.00;
  
  // Lógica para definir o nome do plano ou tipo de parceria
  const getAccountTypeLabel = () => {
    if (!user) return "Acesso Aluno";
    
    // Verificação por roles (Prioridade para identificação de acesso)
    switch (user.role) {
      case 'influencer':
        return "Parceiro Influencer";
      case 'affiliate':
        return "Afiliado 50X";
      case 'coproducer':
        return "Parceiro Co-Produtor";
      case 'super_admin':
      case 'admin':
        return "Administrador";
      case 'support':
      case 'support_agent':
        return "Suporte";
      case 'sales_agent':
      case 'sales_manager':
        return "Comercial";
    }

    // Fallback para campos de parceria se a role for genérica
    if (user.partnershipType) {
        if (user.partnershipType.includes('Influenciador')) return "Parceiro Influencer";
        if (user.partnershipType.includes('Afiliado')) return "Afiliado 50X";
        if (user.partnershipType.includes('Co-produtor')) return "Parceiro Co-Produtor";
        return user.partnershipType;
    }
    
    return "Plano Elite"; // Padrão para alunos
  };

  const planName = getAccountTypeLabel();

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Close dropdown when clicking outside
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
      toast("Redirecionando para recarga...", { icon: '🟣' });
  };

  const handleLogout = () => {
      setIsDropdownOpen(false);
      if (onLogout) {
          onLogout();
      } else {
          signOut();
      }
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-900/30 backdrop-blur-sm border-b border-gray-700 relative z-40">
      <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
      />

      <div>
        {canGoBack && goBack && (
            <Button variant="ghost" onClick={goBack} className="!p-2 hover:bg-gray-800 rounded-full text-gray-300 hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
                <span className="ml-2 hidden sm:inline">Voltar</span>
            </Button>
        )}
      </div>
      
      <div className="flex items-center gap-6" ref={dropdownRef}>
        
        <div className="hidden md:block text-right">
             <p className="text-brand-primary font-black text-sm tracking-wide">{mockCredits} CRÉDITOS</p>
             <p className="text-[10px] text-gray-400 uppercase font-bold">Saldo de Investimento</p>
        </div>

        <div className="relative cursor-pointer group">
            <Bell className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-900"></span>
        </div>

        <div 
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={toggleDropdown}
        >
            <div className="text-right hidden md:block">
                <p className="text-white font-bold text-sm leading-tight group-hover:text-brand-primary transition-colors">
                    {user?.displayName || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                    {user?.email || ''}
                </p>
            </div>
            
            <div className="relative">
                <img
                    src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.email}`}
                    alt="User Avatar"
                    className={`w-12 h-12 rounded-full border-2 transition-all object-cover ${isDropdownOpen ? 'border-brand-primary shadow-[0_0_10px_#FACC15]' : 'border-gray-700 group-hover:border-gray-500'}`}
                />
                
                <div className="absolute -bottom-1 -right-1 bg-gray-800 rounded-full p-1 border border-gray-600 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
            </div>
        </div>

        <AnimatePresence>
            {isDropdownOpen && (
                <MotionDiv
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-4 w-80 bg-[#141621] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                    <div className="p-5 border-b border-[#27272A] bg-[#141621]">
                        <h4 className="text-white font-bold text-lg">{user?.displayName}</h4>
                        <p className="text-xs text-gray-400 mb-3">{user?.email}</p>
                        
                        <div className="inline-flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
                             <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div>
                             <span className="text-[10px] text-gray-300">
                                 Acesso: <strong className="text-white">{planName}</strong>
                             </span>
                        </div>
                    </div>

                    <div className="p-5 border-b border-[#27272A]">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Créditos ativos</p>
                                <p className="text-2xl font-black text-white">{mockCredits} CRÉDITOS</p>
                            </div>
                            <div className="p-2 bg-brand-primary/10 rounded-lg">
                                <CreditCard className="w-5 h-5 text-brand-primary"/>
                            </div>
                        </div>
                        <button 
                            onClick={handleRecharge}
                            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <PlusCircle className="w-3 h-3"/> Recarregar Créditos
                        </button>
                    </div>

                    <div className="p-5 border-b border-[#27272A] bg-[#1a1c26]/50">
                         <div className="flex justify-between items-start mb-1">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Ganhos acumulados</p>
                                <p className="text-xl font-black text-green-400">R$ {mockSales.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                            </div>
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <ShoppingBag className="w-5 h-5 text-green-500"/>
                            </div>
                        </div>
                        <p className="text-[9px] text-gray-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Saques via LucPay integrados
                        </p>
                    </div>

                    <div className="p-2">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePhotoChangeClick();
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl transition-colors flex items-center gap-3"
                        >
                            <Camera className="w-4 h-4 text-brand-primary" /> Alterar foto de perfil
                        </button>
                        <button className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl transition-colors flex items-center gap-3">
                            <User className="w-4 h-4 text-gray-400" /> Editar perfil
                        </button>
                        <div className="h-px bg-[#27272A] my-1 mx-2"></div>
                        <button 
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-3"
                        >
                            <LogOut className="w-4 h-4" /> Sair
                        </button>
                    </div>

                </MotionDiv>
            )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;