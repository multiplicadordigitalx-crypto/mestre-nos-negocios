
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smile, Meh, Frown, Angry, CheckCircle, Send } from '../Icons';
import Button from '../Button';

export const MoodTrackerCard: React.FC = () => {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [story, setStory] = useState('');

    const moods = [
        { id: 'terrible', icon: Angry, color: 'text-red-500', label: 'Terrível' },
        { id: 'bad', icon: Frown, color: 'text-orange-400', label: 'Ruim' },
        { id: 'meh', icon: Meh, color: 'text-yellow-400', label: 'Normal' },
        { id: 'good', icon: Smile, color: 'text-green-400', label: 'Bem' },
        { id: 'great', icon: Smile, color: 'text-indigo-400', label: 'Excelente' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-gray-800 border-2 border-purple-500/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl"></div>

                    <h3 className="text-2xl font-black uppercase italic text-white mb-8 flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-purple-500 rounded-full"></div>
                        Como você está se sentindo hoje?
                    </h3>

                    <div className="flex justify-between items-center gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
                        {moods.map((mood) => {
                            const Icon = mood.icon;
                            const isActive = selectedMood === mood.id;
                            return (
                                <button
                                    key={mood.id}
                                    onClick={() => setSelectedMood(mood.id)}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-3xl min-w-[100px] transition-all duration-300 ${isActive ? 'bg-purple-500/20 border-2 border-purple-500 scale-110 shadow-lg shadow-purple-900/20' : 'bg-gray-900/50 border-2 border-transparent hover:border-gray-700'}`}
                                >
                                    <Icon className={`w-10 h-10 ${isActive ? mood.color : 'text-gray-600'}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-500'}`}>{mood.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">O que está na sua mente? (Opcional)</label>
                        <div className="relative group">
                            <textarea
                                value={story}
                                onChange={(e) => setStory(e.target.value)}
                                placeholder="Descreva brevemente como foi seu dia ou seus pensamentos atuais..."
                                className="w-full h-40 bg-gray-950 border-2 border-gray-800 rounded-2xl p-6 text-white text-sm focus:border-purple-500 transition-colors resize-none outline-none"
                            />
                            <div className="absolute bottom-4 right-4 text-[10px] text-gray-600 font-mono">
                                {story.length} caracteres
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <Button className="!bg-purple-600 !text-white font-black uppercase px-12 py-4 rounded-2xl shadow-xl shadow-purple-900/30 hover:scale-105 transition-transform">
                            <Send className="w-4 h-4 mr-2" /> Registrar Humor
                        </Button>
                    </div>
                </div>
            </div>

            {/* History/Insights Sidebar */}
            <div className="space-y-6">
                <div className="bg-gray-800 border border-gray-700 rounded-[2rem] p-6">
                    <h4 className="text-xs font-black text-gray-500 uppercase mb-4 tracking-widest">Padrões Emocionais</h4>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-gray-950 p-4 rounded-xl border border-gray-800">
                            <div className="bg-green-400/10 p-2 rounded-lg"><Plus className="w-4 h-4 text-green-400" /></div>
                            <div>
                                <p className="text-white text-xs font-bold uppercase">7 dias de Brilho</p>
                                <p className="text-[10px] text-gray-600">Você registrou humor 'Bem' ou 'Excelente' na última semana!</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-950 p-4 rounded-xl border border-gray-800 opacity-50">
                            <div className="bg-indigo-500/10 p-2 rounded-lg"><Smile className="w-4 h-4 text-indigo-500" /></div>
                            <div>
                                <p className="text-white text-xs font-bold uppercase">Conexão com Sono</p>
                                <p className="text-[10px] text-gray-600">Disponível após 15 registros.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 p-8 rounded-[2rem]">
                    <h4 className="text-lg font-black text-white uppercase italic mb-2">Desafio Mental</h4>
                    <p className="text-xs text-gray-400 mb-6">Pratique 5 minutos de meditação para desbloquear o insight de clareza mental do Nexus.</p>
                    <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Plus = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
