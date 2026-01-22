
import React from 'react';
import { motion } from 'framer-motion';
import { LockClosed, Crown, Sparkles, Users, Video, Zap, ArrowRight, ShieldCheck } from '../../../components/Icons';
import Button from '../../../components/Button';

export const EliteTab: React.FC = () => {
    const eliteAreas = [
        {
            id: 'elite-live',
            title: 'Live Mentoria Elite',
            description: 'Mentoria ao vivo com estrategistas convidados sobre Funis de Alta Conversão.',
            icon: <Video className="w-6 h-6" />,
            status: 'locked',
            requirement: 'Nível Ouro ou 50 Créditos',
            color: 'from-yellow-600 to-yellow-900'
        },
        {
            id: 'expert-hotseat',
            title: 'Expert Hotseat',
            description: 'Análise individual de funis e criativos feita por nossa equipe de especialistas.',
            icon: <Zap className="w-6 h-6" />,
            status: 'locked',
            requirement: 'Nível Prata ou 30 Créditos',
            color: 'from-purple-600 to-purple-900'
        },
        {
            id: 'mastermind-nexus',
            title: 'Mastermind Nexus',
            description: 'Grupo exclusivo de networking para quem fatura acima de 6 dígitos.',
            icon: <Crown className="w-6 h-6" />,
            status: 'locked',
            requirement: 'Apenas Nível Ouro',
            color: 'from-brand-primary/80 to-brand-primary'
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <header className="text-center relative py-10 overflow-hidden rounded-3xl bg-gray-800/30 border border-gray-700/50">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
                <Sparkles className="w-12 h-12 text-brand-primary mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Elite <span className="text-brand-primary">Hub</span></h2>
                <p className="text-gray-400 max-w-md mx-auto mt-2 text-sm px-4">
                    Acesso exclusivo às mentes mais brilhantes e estratégias que não são compartilhadas em nenhum outro lugar.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eliteAreas.map((area, idx) => (
                    <motion.div
                        key={area.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative bg-gray-800/50 border border-gray-700/50 rounded-3xl p-6 overflow-hidden hover:border-brand-primary/50 transition-all shadow-xl flex flex-col"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${area.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="p-3 bg-gray-900/50 rounded-2xl border border-gray-700 group-hover:border-brand-primary/30 transition-colors">
                                {area.icon}
                            </div>
                            <div className="bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700 flex items-center gap-1.5">
                                <LockClosed className="w-3 h-3 text-brand-primary" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Protegido</span>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 relative z-10">{area.title}</h3>
                        <p className="text-sm text-gray-400 mb-6 flex-1 relative z-10">{area.description}</p>

                        <div className="mt-auto pt-6 border-t border-gray-700/50 relative z-10">
                            <p className="text-[10px] font-bold text-brand-primary uppercase mb-3 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Requisito: {area.requirement}
                            </p>
                            <Button className="w-full !py-3 !text-xs !bg-brand-primary hover:!bg-brand-primary/90 !text-black flex items-center justify-center gap-2 group/btn">
                                DESBLOQUEAR ACESSO <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Social Proof Mini Section */}
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                <div className="flex -space-x-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <img key={i} src={`https://i.pravatar.cc/150?u=${i + 10}`} className="w-12 h-12 rounded-full border-4 border-gray-900 shadow-xl" alt="" />
                    ))}
                    <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center border-4 border-gray-900 font-bold text-black text-xs">
                        +85
                    </div>
                </div>
                <div>
                    <h4 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                        <Users className="w-5 h-5 text-brand-primary" /> Membros Elite Ativos
                    </h4>
                    <p className="text-gray-400 text-sm">Entre para o grupo que está dominando o mercado neste momento.</p>
                </div>
                <Button className="md:ml-auto !bg-transparent !border-2 !border-gray-700 hover:!border-brand-primary !text-white !px-8">
                    Ver Ranking Global
                </Button>
            </div>
        </div>
    );
};
