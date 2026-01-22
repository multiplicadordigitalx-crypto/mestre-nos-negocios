
import React from 'react';
import { FLOWS_CONFIG } from '../data/flows';
import { Star, Zap, LockClosed } from '../../../components/Icons';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';

interface ToolGridProps {
    onSelect: (id: string) => void;
    onInfo: (id: string) => void;
}

const ToolGrid: React.FC<ToolGridProps> = ({ onSelect, onInfo }) => {
    const { user } = useAuth();

    // Parceiros, admins e usuários com hasMestreIA têm acesso total
    const hasAccess = user?.role === 'super_admin' ||
        user?.role === 'admin' ||
        user?.role === 'influencer' ||
        user?.role === 'coproducer' ||
        user?.role === 'affiliate' ||
        user?.hasMestreIA ||
        user?.email?.endsWith('@mestredosnegocios.com');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto pb-20">
            {FLOWS_CONFIG.map(flow => {
                // Bloqueia apenas para alunos regulares sem hasMestreIA
                const isLocked = !hasAccess;

                return (
                    <div
                        key={flow.id}
                        onClick={() => {
                            if (isLocked) {
                                toast.error("Funcionalidade exclusiva para alunos Elite. Desbloqueie agora!", {
                                    icon: <LockClosed className="w-5 h-5 text-red-500" />
                                });
                                return;
                            }
                            onSelect(flow.id);
                        }}
                        className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-left hover:scale-[1.02] transition-all duration-300 border border-gray-700 hover:border-brand-primary/50 shadow-lg hover:shadow-brand-primary/10 flex flex-col h-full cursor-pointer ${isLocked ? 'opacity-80' : ''}`}
                    >
                        {/* Tag "Exclusivo Elite" removida para parceiros - mostrada apenas para alunos regulares bloqueados */}
                        {isLocked && (
                            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-red-500 text-[10px] font-bold px-2 py-1 rounded-full border border-red-500/30 flex items-center gap-1 z-10">
                                <LockClosed className="w-3 h-3" /> Exclusivo Elite
                            </div>
                        )}

                        <div className="flex justify-between items-start w-full mb-2">
                            <div className="text-5xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                                {(flow as any).icon ? (flow as any).icon : flow.emoji}
                            </div>
                            {/* Badge Zap sempre exibido quando não está bloqueado (incluindo parceiros) */}
                            {!isLocked && (
                                <div className="bg-gray-900/80 backdrop-blur-sm rounded-full px-2 py-1 border border-gray-700">
                                    <Zap className="w-4 h-4 text-brand-primary" />
                                </div>
                            )}
                        </div>

                        <h3 className={`text-xl font-bold text-white mb-1 leading-tight ${isLocked ? '' : 'group-hover:text-brand-primary'} transition-colors`}>
                            {flow.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {flow.subtitle}
                        </p>

                        <div className="mt-auto flex items-center justify-start w-full border-t border-gray-700 pt-3">
                            <div className="flex gap-0.5 mr-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 text-[#FFD700] fill-current" />
                                ))}
                            </div>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onInfo(flow.id);
                                }}
                                className="text-[#FFD700] hover:underline cursor-pointer text-sm font-medium transition-all"
                            >
                                saber mais
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

export default ToolGrid;
