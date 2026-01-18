
import React from 'react';
import {
  Home, BookOpen, DollarSign, Sparkles, Bot, ShoppingBag,
  Megaphone, Link as LinkIcon, Filter,
  Mail, Users, User, MessageSquare, Brain, PlusCircle, Target
} from '../components/Icons';
import { StudentPage } from '../../types';
import { NavItem } from '../common/NavItem';

interface StudentSidebarProps {
  activePage: StudentPage;
  navigateTo: (page: StudentPage) => void;
  supportBadge: number;
  isImpersonating: boolean;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  activePage,
  navigateTo,
  supportBadge,
  isImpersonating
}) => {
  return (
    <nav className={`fixed bottom-0 left-0 w-full md:relative md:w-20 lg:w-64 bg-gray-900/50 backdrop-blur-sm border-t md:border-t-0 md:border-r border-gray-700 flex md:flex-col justify-around md:justify-start md:py-8 md:px-2 lg:px-4 z-50 overflow-x-auto md:overflow-x-visible ${isImpersonating ? 'pt-14' : ''} no-scrollbar`}>
      <div className="hidden md:flex items-center gap-3 mb-12 px-2 lg:px-4 flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20">
          <Brain className="w-6 h-6 text-black" />
        </div>
        <h1 className="text-sm font-black text-white hidden lg:block uppercase leading-tight">Mestre nos<br />Negócios</h1>
      </div>

      <div className="flex md:flex-col w-full md:w-auto h-full items-center md:items-stretch px-4 md:px-0 gap-1 md:gap-1 min-w-max md:min-w-0 pb-2 md:pb-0">
        {/* Core & Management */}
        <NavItem icon={<Home className="w-5 h-5" />} label="Início" isActive={activePage === 'dashboard'} onClick={() => navigateTo('dashboard')} iconColor="text-blue-400" />

        <NavItem icon={<BookOpen className="w-5 h-5" />} label="Treinamento" isActive={activePage === 'training'} onClick={() => navigateTo('training')} iconColor="text-yellow-400" />

        <NavItem icon={<DollarSign className="w-5 h-5" />} label="Financeiro" isActive={activePage === 'financial'} onClick={() => navigateTo('financial')} iconColor="text-green-400" />

        <NavItem icon={<PlusCircle className="w-5 h-5" />} label="Criar Curso" isActive={activePage === 'create_course'} onClick={() => navigateTo('create_course')} iconColor="text-indigo-400" />

        {/* Intelligence & Assets */}
        <NavItem icon={<Sparkles className="w-5 h-5" />} label="Mestre IA" isActive={activePage === 'mestre_ia'} onClick={() => navigateTo('mestre_ia')} iconColor="text-purple-400" />

        <NavItem icon={<Bot className="w-5 h-5" />} label="Coach IA" isActive={activePage === 'coach'} onClick={() => navigateTo('coach')} iconColor="text-pink-400" />

        <NavItem icon={<ShoppingBag className="w-5 h-5" />} label="Produtos" isActive={activePage === 'products'} onClick={() => navigateTo('products')} iconColor="text-cyan-400" />

        {/* Growth & Marketing Tools */}
        <NavItem icon={<Megaphone className="w-5 h-5" />} label="Marketing" isActive={activePage === 'marketing'} onClick={() => navigateTo('marketing')} iconColor="text-red-500" />

        <NavItem icon={<Target className="w-5 h-5" />} label="Nexus Ads" isActive={activePage === 'nexus_ads'} onClick={() => navigateTo('nexus_ads')} iconColor="text-rose-500" />

        <NavItem icon={<LinkIcon className="w-5 h-5" />} label="Integrações" isActive={activePage === 'integrations'} onClick={() => navigateTo('integrations')} iconColor="text-teal-400" />

        <NavItem icon={<Filter className="w-5 h-5" />} label="Funil & PGS" isActive={activePage === 'funnels'} onClick={() => navigateTo('funnels')} iconColor="text-orange-500" />

        <NavItem icon={<Mail className="w-5 h-5" />} label="E-mail Mkt" isActive={activePage === 'email_marketing'} onClick={() => navigateTo('email_marketing')} iconColor="text-amber-400" />

        {/* Espaçamento ajustado para separar ferramentas de social/conta */}
        <div className="w-4 md:w-full md:h-8 flex-shrink-0"></div>

        {/* Social & Account */}
        <NavItem icon={<Users className="w-5 h-5" />} label="Comunidade" isActive={activePage === 'community'} onClick={() => navigateTo('community')} iconColor="text-violet-400" />

        <NavItem icon={<User className="w-5 h-5" />} label="Meu Perfil" isActive={activePage === 'profile'} onClick={() => navigateTo('profile')} iconColor="text-sky-200" />

        <NavItem
          icon={<MessageSquare className="w-5 h-5" />}
          label="Suporte"
          isActive={activePage === 'support'}
          onClick={() => navigateTo('support')}
          badge={supportBadge > 0 ? supportBadge : undefined}
          iconColor="text-emerald-400"
        />
      </div>

    </nav>
  );
};
