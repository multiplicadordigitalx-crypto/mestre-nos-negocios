
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Crown, ArrowRight, LockClosed, BookOpen, Bot, 
  ShoppingBag, BarChart3, Users, MessageSquare, Trophy, 
  Star, PlusCircle 
} from '../../../components/Icons';
import toast from 'react-hot-toast';
import { Student } from '../../../types';

interface LaunchpadGridProps {
  user: Student | null;
  navigateTo: (page: any) => void;
  onCheckIn: () => void;
  onOpenLevel: () => void;
}

const GridButton = ({ icon, label, onClick, color = "text-brand-primary" }: { icon: React.ReactNode, label: string, onClick: () => void, color?: string }) => (
  <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-gray-800/60 border border-gray-700 rounded-xl hover:bg-gray-700 hover:border-brand-primary/50 transition-all shadow-lg h-32 w-full"
  >
      <div className={`mb-3 p-3 rounded-full bg-gray-900/50 ${color}`}>
          {icon}
      </div>
      <span className="text-sm font-bold text-white text-center leading-tight">{label}</span>
  </motion.button>
);

export const LaunchpadGrid: React.FC<LaunchpadGridProps> = ({ user, navigateTo, onCheckIn, onOpenLevel }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* CARD MESTRE IA – DASHBOARD DO ALUNO */}
        {user?.hasMestreIA ? (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateTo('mestre_ia')}
            className="relative bg-gradient-to-br from-brand-primary to-yellow-600 rounded-2xl p-6 cursor-pointer shadow-xl shadow-brand-primary/10 overflow-hidden col-span-2 md:col-span-2 row-span-2 flex flex-col justify-between border border-yellow-400/50 group"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/30 transition-all"></div>
            <Crown className="w-40 h-40 absolute -bottom-10 -right-10 text-black/5 rotate-12" />
            
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-black/20 p-2 rounded-lg backdrop-blur-sm">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-black/60 font-bold text-xs uppercase tracking-wider">Novo</span>
                </div>
                <h3 className="text-3xl lg:text-4xl font-black text-black leading-tight">Mestre IA</h3>
                <p className="text-black/80 font-medium text-sm mt-2 max-w-[80%]">Seu consultor 24h: crie posts, roteiros e estratégias em segundos.</p>
            </div>

            <div className="mt-6">
                <div className="flex items-center justify-between bg-black/10 rounded-xl p-3 backdrop-blur-sm border border-black/5">
                    <span className="text-black font-bold text-sm">
                        {user.dailyMestreIALimit || 5} créditos hoje
                    </span>
                    <div className="bg-black text-brand-primary px-4 py-2 rounded-lg text-xs font-bold flex items-center group-hover:bg-gray-900 transition-colors">
                        ACESSAR <ArrowRight className="w-3 h-3 ml-1"/>
                    </div>
                </div>
            </div>
        </motion.div>
        ) : (
        <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => toast("Funcionalidade Premium: Upgrade em breve!", { icon: '🔒' })}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 cursor-pointer text-center col-span-2 md:col-span-2 row-span-2 flex flex-col justify-center items-center relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
            <LockClosed className="w-12 h-12 text-gray-600 mb-4 group-hover:text-brand-primary transition-colors" />
            <h3 className="text-2xl font-black mb-1 text-white">Mestre IA</h3>
            <p className="text-gray-400 text-sm mb-4 max-w-xs">Desbloqueie o poder da Inteligência Artificial para escalar seu negócio.</p>
            
            <div className="bg-gray-800 rounded-xl p-3 w-full border border-gray-700">
                <p className="text-brand-primary text-2xl font-black">R$ 197</p>
                <p className="text-gray-500 text-[10px] uppercase tracking-wide">Vitalício + 50 créditos</p>
            </div>
            
            <button className="mt-4 bg-brand-primary text-black font-bold text-sm py-3 px-6 rounded-lg hover:bg-yellow-400 transition w-full">
                DESBLOQUEAR
            </button>
        </motion.div>
        )}

        <GridButton 
            icon={<BookOpen className="w-6 h-6"/>} 
            label="Treinamento" 
            onClick={() => navigateTo('training')}
            color="text-blue-400"
        />
        <GridButton 
            icon={<Bot className="w-6 h-6"/>} 
            label="Coach IA" 
            onClick={() => navigateTo('coach')}
            color="text-indigo-400"
        />
        <GridButton 
            icon={<ShoppingBag className="w-6 h-6"/>} 
            label="Produtos" 
            onClick={() => navigateTo('products')}
            color="text-green-400"
        />
        <GridButton 
            icon={<BarChart3 className="w-6 h-6"/>} 
            label="Meus Resultados" 
            onClick={onCheckIn}
            color="text-yellow-400"
        />
        <GridButton 
            icon={<Users className="w-6 h-6"/>} 
            label="Comunidade" 
            onClick={() => navigateTo('community')}
            color="text-purple-400"
        />
        <GridButton 
            icon={<MessageSquare className="w-6 h-6"/>} 
            label="Suporte" 
            onClick={() => navigateTo('support')}
            color="text-pink-400"
        />
        <GridButton 
            icon={<Trophy className="w-6 h-6"/>} 
            label="Meu Nível" 
            onClick={onOpenLevel}
            color="text-orange-400"
        />
         <GridButton 
            icon={<Star className="w-6 h-6"/>} 
            label="Bônus" 
            onClick={() => toast.success("Bônus liberados no módulo final!")}
            color="text-teal-400"
        />
         <GridButton 
            icon={<PlusCircle className="w-6 h-6"/>} 
            label="Criar Curso" 
            onClick={() => navigateTo('create_course')}
            color="text-gray-400"
        />
    </div>
  );
};
