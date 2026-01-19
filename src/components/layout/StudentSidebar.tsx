import React from 'react';
import {
  Home, BookOpen, DollarSign, Sparkles, Bot, ShoppingBag,
  Megaphone, Link as LinkIcon, Filter,
  Mail, Users, User, MessageSquare, Brain, PlusCircle, Target,
  Hammer, HeartPulse, ShieldCheck, TrendingUp, Monitor, Zap,
  ChevronLeft, ChevronRight
} from '../Icons';
import { StudentPage, SchoolConfig, StudentMenuItem } from '../../types';
import { NavItem } from '../common/NavItem';
import { useAuth } from '../../hooks/useAuth';

// Helper to get Icon by string name
const getIcon = (iconName: string, className: string = "w-5 h-5") => {
  switch (iconName) {
    case 'Home': return <Home className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'DollarSign': return <DollarSign className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Bot': return <Bot className={className} />;
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    case 'Megaphone': return <Megaphone className={className} />;
    case 'Target': return <Target className={className} />;
    case 'Link': return <LinkIcon className={className} />;
    case 'Filter': return <Filter className={className} />;
    case 'Mail': return <Mail className={className} />;
    case 'Users': return <Users className={className} />;
    case 'User': return <User className={className} />;
    case 'MessageSquare': return <MessageSquare className={className} />;
    case 'PlusCircle': return <PlusCircle className={className} />;
    case 'Monitor': return <Monitor className={className} />;
    case 'Zap': return <Zap className={className} />;
    // Niche specific
    case 'Gavel': return <Hammer className={className} />;
    case 'HeartPulse': return <HeartPulse className={className} />;
    case 'Scale': return <ShieldCheck className={className} />;
    case 'LineChart': return <TrendingUp className={className} />;
    default: return <Brain className={className} />;
  }
};

interface StudentSidebarProps {
  activePage: StudentPage;
  navigateTo: (page: StudentPage) => void;
  supportBadge: number;
  isImpersonating: boolean;
  schoolConfig?: SchoolConfig | null; // Optional config wrapper
  visiblePages?: string[]; // New: Filter prop
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  activePage,
  navigateTo,
  supportBadge,
  isImpersonating,
  schoolConfig,
  visiblePages // Destructure
}) => {
  const { user } = useAuth();

  // State for Sidebar Collapse
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Default Menu (Legacy Fallback)
  const defaultMenu: StudentMenuItem[] = [
    { id: 'dashboard', label: 'Início', icon: 'Home', path: 'dashboard', isEnabled: true },
    { id: 'training', label: 'Treinamento', icon: 'BookOpen', path: 'training', isEnabled: true },
    { id: 'financial', label: 'Financeiro', icon: 'DollarSign', path: 'financial', isEnabled: true },
    { id: 'health_diary', label: 'Saúde & Mente', icon: 'HeartPulse', path: 'health_diary', isEnabled: true },
    { id: 'create_course', label: 'Criar Curso', icon: 'PlusCircle', path: 'create_course', isEnabled: true },
    { id: 'minhas_escolas', label: 'Minhas Escolas', icon: 'Monitor', path: 'producer_dashboard', isEnabled: true },
    { id: 'mestre_ia', label: 'Mentor IA', icon: 'Sparkles', path: 'mestre_ia', isEnabled: true },
    { id: 'coach', label: 'Coach IA', icon: 'Bot', path: 'coach', isEnabled: true },
    { id: 'products', label: 'Produtos', icon: 'ShoppingBag', path: 'products', isEnabled: true },
    // Marketing Tools
    { id: 'marketing', label: 'Marketing', icon: 'Megaphone', path: 'marketing', isEnabled: true },
    { id: 'nexus_ads', label: 'Nexus Ads', icon: 'Target', path: 'nexus_ads', isEnabled: true },
    { id: 'integrations', label: 'Integrações', icon: 'Link', path: 'integrations', isEnabled: true },
    { id: 'funnels', label: 'Funil & PGS', icon: 'Filter', path: 'funnels', isEnabled: true },
    { id: 'email_marketing', label: 'E-mail Mkt', icon: 'Mail', path: 'email_marketing', isEnabled: true },
    // Community
    { id: 'community', label: 'Comunidade', icon: 'Users', path: 'community', isEnabled: true },
    { id: 'profile', label: 'Perfil', icon: 'User', path: 'profile', isEnabled: true },
    { id: 'support', label: 'Suporte', icon: 'MessageSquare', path: 'support', isEnabled: true },
  ];

  // Merge logic: If schoolConfig exists, use its menu. Otherwise use default.
  // In a real scenario, we might merge them or completely replace. 
  // For now, if no config, we assume standard Nexus layout.
  let menuItems = schoolConfig?.menuConfig || defaultMenu;

  // --- DYNAMIC FILTERING LOGIC ---
  menuItems = menuItems.map(item => {
    // 1. Minhas Escolas: Only for producers with published courses
    if (item.id === 'minhas_escolas') {
      const hasCourses = user?.publishedCourses && user.publishedCourses.length > 0;
      return { ...item, isEnabled: hasCourses || false };
    }

    // 2. Premium Tools Visibility
    // If we are in a White Label School (schoolConfig exists), we check if the tool is bought.
    if (schoolConfig) {
      const premiumTools = schoolConfig.premiumTools || [];

      // Marketing Pack bundling logic
      // COMMENTED OUT FOR TESTING: Allow all tools visible by default
      /*
      const isMarketingPackEnabled = premiumTools.includes('marketing_pack' as any);

      if (['nexus_ads', 'marketing', 'funnels', 'email_marketing'].includes(item.id)) {
        if (!isMarketingPackEnabled) return { ...item, isEnabled: false };
      }
      */

      // Other checks (if ID matches exactly)
      // e.g. 'diet_ai' -> 'diario_alimentar' mapping if needed
    }
    return item;
  });

  // Theme Color overrides
  const primaryColor = schoolConfig?.theme?.primaryColor || '#FACC15'; // Default Yellow

  const MENU_COLORS: Record<string, string> = {
    dashboard: 'text-white',
    training: 'text-yellow-400',
    financial: 'text-green-400',
    health_diary: 'text-pink-400',
    create_course: 'text-indigo-400',
    minhas_escolas: 'text-purple-400',
    mestre_ia: 'text-pink-500',
    coach: 'text-blue-400',
    products: 'text-orange-400',
    marketing: 'text-red-500',
    nexus_ads: 'text-red-600',
    integrations: 'text-cyan-400',
    funnels: 'text-orange-500',
    email_marketing: 'text-yellow-400',
    community: 'text-teal-400',
    profile: 'text-gray-400',
    support: 'text-blue-300',
    default: 'text-gray-400'
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 w-full md:relative ${isCollapsed ? 'md:w-20' : 'md:w-64'} transition-all duration-300 bg-gray-900/95 backdrop-blur-md md:bg-gray-900/50 border-t md:border-t-0 md:border-r border-gray-700 flex md:flex-col justify-between md:justify-start py-2 md:py-8 px-2 lg:px-4 z-50 overflow-x-auto md:overflow-x-visible md:overflow-y-visible ${isImpersonating ? 'pt-14' : ''} safe-area-bottom h-auto md:h-screen`}
      role="navigation"
      aria-label="Menu Principal"
      style={{
        borderColor: schoolConfig ? `${primaryColor}20` : undefined
      }}
    >
      <div className={`hidden md:flex items-center gap-3 mb-8 px-2 ${isCollapsed ? 'justify-center' : 'lg:px-4'} flex-shrink-0 transition-all`}>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0"
          style={{
            background: schoolConfig
              ? `linear-gradient(135deg, ${primaryColor}, ${schoolConfig.theme?.secondaryColor || '#111827'})`
              : 'linear-gradient(135deg, #FACC15, #9333EA)'
          }}
        >
          {schoolConfig?.theme?.logoUrl ? (
            <img src={schoolConfig.theme.logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
          ) : (
            <Brain className="w-6 h-6 text-black" />
          )}
        </div>
        {!isCollapsed && (
          <h1 className="text-sm font-black text-white hidden lg:block uppercase leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {schoolConfig?.name || <>Mestre nos<br />Negócios</>}
          </h1>
        )}
      </div>

      <div className="flex md:flex-col w-full md:w-auto h-full md:h-auto md:flex-1 items-center md:items-stretch px-2 md:px-0 gap-2 md:gap-1 min-w-max md:min-w-0 md:overflow-y-auto no-scrollbar pb-20">
        {menuItems
          .filter(item => item.isEnabled)
          .filter(item => !visiblePages || visiblePages.includes(item.id)) // Apply White Label Filter
          .map((item, index) => {
            // Determine icon color if specified or default
            let iconClass = "w-5 h-5";

            // Apply custom color if exists, else default
            const customColorClass = MENU_COLORS[item.id] || MENU_COLORS.default;

            return (
              <NavItem
                key={item.id}
                label={item.label}
                icon={getIcon(item.icon, `${iconClass} ${activePage === item.path ? 'text-black' : customColorClass}`)}
                isActive={activePage === item.path}
                themeColor={primaryColor}
                colorClass={customColorClass} // Pass for text styling in NavItem if supported
                isCollapsed={isCollapsed}
                onClick={() => {
                  if (item.path.startsWith('http')) {
                    window.open(item.path, '_blank');
                  } else {
                    // Special mapping for combined health/mind diary
                    const finalPath = ['diario_alimentar', 'health_diary'].includes(item.id)
                      ? 'health_diary'
                      : item.path;
                    navigateTo(finalPath as StudentPage);
                  }
                }}
              />
            );
          })}
      </div>

      {/* Collapse Button - Desktop Only */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute top-12 right-[-12px] bg-gray-800 border border-gray-600 rounded-full p-1 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors shadow-lg z-50 items-center justify-center transform hover:scale-110 active:scale-95"
        title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
        style={{ width: '24px', height: '24px' }}
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

    </nav >
  );
};
