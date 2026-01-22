
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp, MessageSquare, HeartPulse, ExternalLink, Award, Zap } from '../../../components/Icons';

export const MuralTab: React.FC = () => {
    const feedItems = [
        {
            id: '1',
            user: { name: 'Gustavo Mestre', role: 'Staff', avatar: 'https://i.pravatar.cc/150?u=gustavo', level: 'Ouro' },
            content: '🚀 Novo recorde na comunidade! O aluno Alisson acaba de atingir 5.4x de ROAS no primeiro funil automatizado pelo Nexus.',
            likes: 42,
            comments: 12,
            time: '2h atrás',
            type: 'announcement'
        },
        {
            id: '2',
            user: { name: 'Alisson Designer', role: 'Aluno', avatar: 'https://i.pravatar.cc/150?u=alisson', level: 'Prata' },
            content: 'Gente, o Nexus Ads Command é surreal. Pela primeira vez consegui fazer criativos que convertem de verdade sem gastar horas no Canva. Recomendo muito o guia rápido!',
            likes: 128,
            comments: 45,
            time: '5h atrás',
            type: 'result'
        },
        {
            id: '3',
            user: { name: 'Rodrigo Pro', role: 'Aluno', avatar: 'https://i.pravatar.cc/150?u=rodrigo', level: 'Bronze' },
            content: 'Acabei de subir de nível para Bronze! O networking aqui está valendo cada centavo.',
            likes: 15,
            comments: 3,
            time: '8h atrás',
            type: 'achievement'
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Top Featured Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
                    <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] text-yellow-500 font-bold uppercase">Ranking Semanal</p>
                        <p className="text-xl font-black text-white">#1 Alisson D.</p>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 border border-brand-primary/20 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
                    <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary">
                        <Zap className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] text-brand-primary font-bold uppercase">Atividade Global</p>
                        <p className="text-xl font-black text-white">Alta (98%)</p>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                        <Star className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] text-blue-400 font-bold uppercase">Novos Membros</p>
                        <p className="text-xl font-black text-white">+14 Hoje</p>
                    </div>
                </div>
            </div>

            {/* Main Feed */}
            <div className="space-y-6">
                {feedItems.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl"
                    >
                        <div className="p-4 md:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={item.user.avatar} className="w-12 h-12 rounded-full border-2 border-gray-700 shadow-md" alt="" />
                                        <div className="absolute -bottom-1 -right-1">
                                            {item.user.level === 'Ouro' && <Award className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />}
                                            {item.user.level === 'Prata' && <Award className="w-5 h-5 text-gray-300 fill-gray-300/20" />}
                                            {item.user.level === 'Bronze' && <Award className="w-5 h-5 text-orange-400 fill-orange-400/20" />}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-white leading-none">{item.user.name}</h4>
                                            {item.user.role === 'Staff' && (
                                                <span className="bg-brand-primary text-black text-[10px] font-black px-1.5 py-0.5 rounded uppercase">STAFF</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{item.time} • {item.user.level}</p>
                                    </div>
                                </div>
                                <div className="p-2 text-gray-400 hover:text-white cursor-pointer transition-colors">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            </div>

                            <p className="text-gray-200 text-sm md:text-base leading-relaxed mb-6">
                                {item.content}
                            </p>

                            <div className="flex items-center gap-6 border-t border-gray-700/50 pt-4">
                                <button className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors group">
                                    <HeartPulse className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-bold">{item.likes}</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-400 hover:text-brand-primary transition-colors group">
                                    <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-bold">{item.comments}</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors ml-auto group">
                                    <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
