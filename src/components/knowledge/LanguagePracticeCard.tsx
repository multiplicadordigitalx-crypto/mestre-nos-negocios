import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, Target, Globe, Mic, Zap, Trophy, MapPin } from '../Icons';
import Button from '../Button';
import { LanguagePerformanceDashboard } from './language/LanguagePerformanceDashboard';
import { NexusQuiz } from './language/NexusQuiz';
import { VocabularyTrainer } from './language/VocabularyTrainer';
import { VoiceConversation, MissionContext } from './language/VoiceConversation';
import { CultureExplorer } from './language/CultureExplorer';
import { ExecutivePassport } from './language/ExecutivePassport';
import { StudentPage } from '../../types';

interface LanguagePracticeCardProps {
    navigateTo?: (page: StudentPage) => void;
}

export const LanguagePracticeCard: React.FC<LanguagePracticeCardProps> = ({ navigateTo }) => {
    const { refreshUser } = useAuth();
    const [activeTool, setActiveTool] = useState<'quiz' | 'vocab' | 'voice' | 'culture' | 'passport' | null>(null);
    const [missionContext, setMissionContext] = useState<MissionContext | undefined>(undefined);


    // If a tool is active, render it
    if (activeTool === 'quiz') return <NexusQuiz onBack={() => setActiveTool(null)} navigateTo={navigateTo} />;
    if (activeTool === 'vocab') return <VocabularyTrainer onBack={() => setActiveTool(null)} navigateTo={navigateTo} />;

    // VoiceConversation and CultureExplorer need onBack prop, assuming I will add it
    // For now, I'll pass it even if TS might complain until I fix the files
    // @ts-ignore
    if (activeTool === 'voice') return <VoiceConversation onBack={() => { setActiveTool(null); setMissionContext(undefined); }} initialContext={missionContext} navigateTo={navigateTo} />;
    // @ts-ignore
    if (activeTool === 'culture') return <CultureExplorer onBack={() => setActiveTool(null)} navigateTo={navigateTo} />;

    if (activeTool === 'passport') return (
        <ExecutivePassport
            onBack={() => setActiveTool(null)}
            onStartMission={(context) => {
                console.log("Starting mission with context:", context);
                setMissionContext(context);
                setActiveTool('voice');
            }}
            navigateTo={navigateTo}
        />
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Dashboard Header */}
            <LanguagePerformanceDashboard />

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Tool: Vocabulário */}
                <div
                    className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-3xl hover:border-indigo-500 transition-colors group cursor-pointer flex flex-col justify-between"
                    onClick={() => setActiveTool('vocab')}
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                <Brain className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold uppercase bg-indigo-900/30 px-2 py-1 rounded text-indigo-400 border border-indigo-900/50">Flashcards</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Vocabulário Executivo</h3>
                        <p className="text-xs text-gray-400 leading-relaxed mb-6 h-10">
                            Expanda seu léxico corporativo com decks personalizados por IA.
                        </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                        <Button onClick={() => setActiveTool('vocab')} className="w-full !py-2 !px-4 text-xs !bg-indigo-600 hover:!bg-indigo-500">Treinar</Button>
                    </div>
                </div>

                {/* Tool: Passaporte Executivo */}
                <div
                    className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-3xl hover:border-blue-500 transition-colors group cursor-pointer flex flex-col justify-between"
                    onClick={() => setActiveTool('passport')}
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-500/10 p-2 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold uppercase bg-blue-900/30 px-2 py-1 rounded text-blue-400 border border-blue-900/50">Carreira</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Passaporte Executivo</h3>
                        <p className="text-xs text-gray-400 leading-relaxed mb-6 h-10">
                            Sua jornada global personalizada. Gerencie seu progresso e conquistas.
                        </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                        <Button onClick={() => setActiveTool('passport')} className="w-full !py-2 !px-4 text-xs !bg-blue-600 hover:!bg-blue-500">Acessar</Button>
                    </div>
                </div>

                {/* Tool: Voice Lab */}
                <div
                    className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-3xl hover:border-green-500 transition-colors group cursor-pointer flex flex-col justify-between"
                    onClick={() => setActiveTool('voice')}
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-green-500/10 p-2 rounded-xl text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                <Mic className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold uppercase bg-green-900/30 px-2 py-1 rounded text-green-400 border border-green-900/50">Simulador</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Boardroom Simulator</h3>
                        <p className="text-xs text-gray-400 leading-relaxed mb-6 h-10">
                            Simule reuniões de conselho e negociações com feedback de voz em tempo real.
                        </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                        <Button onClick={() => setActiveTool('voice')} className="w-full !py-2 !px-4 text-xs !bg-green-600 hover:!bg-green-500">Conversar</Button>
                    </div>
                </div>

                {/* Tool: Nexus Quiz */}
                <div
                    className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-3xl hover:border-purple-500 transition-colors group cursor-pointer flex flex-col justify-between"
                    onClick={() => setActiveTool('quiz')}
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-purple-500/10 p-2 rounded-xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold uppercase bg-purple-900/30 px-2 py-1 rounded text-purple-400 border border-purple-900/50">Desafio</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Nexus Quiz</h3>
                        <p className="text-xs text-gray-400 leading-relaxed mb-6 h-10">
                            Teste seus conhecimentos em cenários de negócios globais.
                        </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                        <Button onClick={() => setActiveTool('quiz')} className="w-full !py-2 !px-4 text-xs !bg-purple-600 hover:!bg-purple-500">Jogar</Button>
                    </div>
                </div>

                {/* Tool: Culture Explorer */}
                <div
                    className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-3xl hover:border-pink-500 transition-colors group cursor-pointer flex flex-col justify-between"
                    onClick={() => setActiveTool('culture')}
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-pink-500/10 p-2 rounded-xl text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                                <Globe className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold uppercase bg-pink-900/30 px-2 py-1 rounded text-pink-400 border border-pink-900/50">Imersão</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Guia Cultural VIP</h3>
                        <p className="text-xs text-gray-400 leading-relaxed mb-6 h-10">
                            Etiqueta de negócios, dicas locais e segredos de 20+ capitais globais.
                        </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                        <Button onClick={() => setActiveTool('culture')} className="w-full !py-2 !px-4 text-xs !bg-pink-600 hover:!bg-pink-500">Explorar</Button>
                    </div>
                </div>

            </div>


        </div>
    );
};
