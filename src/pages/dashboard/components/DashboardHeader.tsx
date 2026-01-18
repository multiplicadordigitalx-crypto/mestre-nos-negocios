
import React from 'react';
import Button from '../../../components/Button';
import { BarChart3, Trophy } from '../../../components/Icons';
import { Student } from '../../../types';

interface DashboardHeaderProps {
  user: Student | null;
  navigateTo: (page: any) => void;
  onCheckIn: () => void;
  onOpenLevel: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, navigateTo, onCheckIn, onOpenLevel }) => {
  const level = user?.gamification?.level || 'Iniciante';

  return (
    <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
        <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigateTo('profile')}>
            <img 
                src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.email}`} 
                alt="Avatar" 
                className="w-12 h-12 rounded-full border-2 border-brand-primary"
            />
            <div>
                <h1 className="text-lg font-bold text-white">Olá, {user?.displayName?.split(' ')[0]}! 👋</h1>
                <button 
                    onClick={(e) => { e.stopPropagation(); onOpenLevel(); }}
                    className="text-xs text-gray-400 hover:text-brand-primary flex items-center gap-1"
                >
                    <Trophy className="w-3 h-3 text-yellow-500"/> Nível: {level}
                </button>
            </div>
        </div>
        
        <Button onClick={onCheckIn} className="!py-2 !px-4 !text-xs whitespace-nowrap">
            <BarChart3 className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Meus Resultados</span>
        </Button>
    </div>
  );
};
