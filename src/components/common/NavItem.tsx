
import React from 'react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
  iconColor?: string;
  isCollapsed?: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, badge, iconColor, isCollapsed }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col md:flex-row items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start lg:pl-4'} p-2 my-1 md:my-0.5 rounded-lg transition-all duration-300 ${isCollapsed ? 'w-full h-12' : 'w-16 h-16 md:w-full md:h-auto'} relative group flex-shrink-0 ${isActive
          ? 'bg-brand-primary text-brand-secondary shadow-lg shadow-brand-primary/20'
          : 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
        }`}
    >
      <div className={`w-5 h-5 mb-1 md:mb-0 ${isCollapsed ? 'md:mr-0' : 'md:mr-0 lg:mr-3'} flex-shrink-0 ${isActive ? '' : (iconColor || 'text-brand-primary')} relative transition-all`}>
        {icon}
        {badge && badge > 0 && (
          <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold ${isCollapsed ? 'w-3.5 h-3.5' : 'w-4 h-4'} rounded-full flex items-center justify-center border-2 border-gray-900`}>
            {badge}
          </span>
        )}
      </div>

      {!isCollapsed && (
        <span className="text-[10px] md:hidden lg:inline-block lg:text-sm font-medium truncate w-full text-center lg:text-left transition-all">
          {label}
        </span>
      )}

      {/* Tooltip for collapsed state */}
      {(isCollapsed || (!isCollapsed && false)) && (
        <div className="absolute left-full ml-3 px-2 py-1.5 bg-gray-800 text-white text-[10px] uppercase font-bold tracking-wider rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 whitespace-nowrap hidden md:block border border-gray-700 shadow-xl">
          {label}
          {badge && badge > 0 ? ` (${badge})` : ''}
        </div>
      )}
    </button>
  );
};
