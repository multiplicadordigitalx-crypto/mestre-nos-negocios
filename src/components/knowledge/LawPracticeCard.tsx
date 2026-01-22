import React, { useState } from 'react';
import { Scale, FileText, MessageSquare, BookOpen, AlertCircle, Zap, ArrowRight, Target, Brain, Folder } from '../Icons';
import Button from '../Button';
import toast from 'react-hot-toast';
import { LegalSageAgent } from './law/LegalSageAgent';
import { EssayCorrector } from './law/EssayCorrector';
import { VadeMecum } from './law/VadeMecum';
import { AudienceSimulator } from './law/AudienceSimulator';
import { OABQuizSimulator } from './law/OABQuizSimulator';
import { JurisMemoria } from './law/JurisMemoria';
import { LegalRepository } from './law/LegalRepository';

import { StudentPage } from '../../../types';

export const LawPracticeCard: React.FC<{ section: 'study' | 'practice', onToolActive?: (active: boolean) => void, navigateTo?: (page: StudentPage) => void }> = ({ section, onToolActive, navigateTo }) => {
    const [activeTool, setActiveTool] = useState<'sage' | 'corrector' | 'vade' | 'audience' | 'quiz' | 'memoria' | 'repository' | null>(null);

    const handleToolChange = (tool: 'sage' | 'corrector' | 'vade' | 'audience' | 'quiz' | 'memoria' | 'repository' | null) => {
        setActiveTool(tool);
        onToolActive?.(!!tool);
    };

    // If a tool is active, show it regardless of the tab (since the tool was launched from a tab)
    if (activeTool === 'sage') return <LegalSageAgent onBack={() => handleToolChange(null)} navigateTo={navigateTo} />;
    if (activeTool === 'corrector') return <EssayCorrector onBack={() => handleToolChange(null)} navigateTo={navigateTo} />;
    if (activeTool === 'vade') return <VadeMecum onBack={() => handleToolChange(null)} navigateTo={navigateTo} />;
    if (activeTool === 'audience') return <AudienceSimulator onBack={() => handleToolChange(null)} navigateTo={navigateTo} />;
    if (activeTool === 'quiz') return <OABQuizSimulator onBack={() => handleToolChange(null)} navigateTo={navigateTo} />;
    if (activeTool === 'memoria') return <JurisMemoria onBack={() => handleToolChange(null)} navigateTo={navigateTo} />;
    if (activeTool === 'repository') return <LegalRepository onBack={() => handleToolChange(null)} navigateTo={navigateTo} />;

    return (
        <div className="space-y-6">

            {/* TAB: ESTUDO */}
            {section === 'study' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">

                    {/* Tool: JurisMemória */}
                    <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-3xl hover:border-purple-500 transition-colors group cursor-pointer flex flex-col justify-between" onClick={() => handleToolChange('memoria')}>
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-purple-500/10 p-2 rounded-xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase bg-purple-900/30 px-2 py-1 rounded text-purple-400 border border-purple-900/50">Memorização</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">JurisMemória</h3>
                            <p className="text-xs text-gray-400 leading-relaxed mb-6 h-10">
                                Memorize leis e prazos com Flashcards inteligentes.
                            </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                            <span className="text-[10px] text-gray-500 font-mono"></span>
                            <Button onClick={() => handleToolChange('memoria')} className="!py-2 !px-4 text-xs !bg-purple-600 hover:!bg-purple-500">Treinar</Button>
                        </div>
                    </div>

                    {/* Tool: Simulado OAB */}
                    <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-3xl hover:border-yellow-500 transition-colors group cursor-pointer flex flex-col justify-between" onClick={() => handleToolChange('quiz')}>
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-yellow-500/10 p-2 rounded-xl text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                    <Target className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase bg-yellow-900/30 px-2 py-1 rounded text-yellow-400 border border-yellow-900/50">1ª Fase</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Simulado OAB</h3>
                            <p className="text-xs text-gray-400 leading-relaxed mb-6 h-10">
                                Questões comentadas do exame de ordem. Teste seus conhecimentos.
                            </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                            <span className="text-[10px] text-gray-500 font-mono"></span>
                            <Button onClick={() => handleToolChange('quiz')} className="!py-2 !px-4 text-xs !bg-red-600 hover:!bg-red-500">Simular</Button>
                        </div>
                    </div>

                    {/* Tool: Simulador de Audiência */}
                    <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-3xl hover:border-blue-500 transition-colors group cursor-pointer flex flex-col justify-between" onClick={() => handleToolChange('audience')}>
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-blue-900/30 p-2 rounded-xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase bg-blue-900/30 px-2 py-1 rounded text-blue-400 border border-blue-900/50">Voz Ativa</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Simulador de Audiência</h3>
                            <p className="text-xs text-gray-400 leading-relaxed mb-6 h-10">
                                O Juiz (IA) fará perguntas difíceis. Treine sua oratória.
                            </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                            <span className="text-[10px] text-gray-500 font-mono"></span>
                            <Button onClick={() => handleToolChange('audience')} className="w-full !py-2 !px-4 text-xs !bg-blue-600 hover:!bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20">Treinar Voz</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: PRÁTICA */}
            {section === 'practice' && (
                <div className="space-y-6 animate-fade-in">

                    {/* FEATURED: O SÁBIO */}
                    <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border border-blue-500/30 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 relative overflow-hidden group hover:border-blue-500/60 transition-colors">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 md:gap-8">
                            <div className="flex-1 w-full">
                                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                                    <span className="bg-blue-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg shadow-blue-500/50">Novo</span>
                                    <span className="text-blue-300 text-[10px] md:text-xs font-bold tracking-widest uppercase">Inteligência Artificial Jurídica</span>
                                </div>
                                <h2 className="text-2xl md:text-4xl font-black italic text-white mb-2 md:mb-4">"O Sábio"</h2>
                                <p className="text-blue-100 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 max-w-2xl">
                                    Seu novo copiloto jurídico. Faça upload de processos (OCR), descreva casos por voz e peça teses de defesa completas.
                                </p>
                                <div className="flex flex-col md:flex-row gap-3">
                                    <Button onClick={() => handleToolChange('sage')} className="w-full md:w-auto !bg-white !text-blue-900 !py-3 !px-8 font-black uppercase hover:scale-105 transition-transform shadow-xl justify-center">
                                        <Zap className="w-5 h-5 mr-2" /> Acessar Agente
                                    </Button>
                                    <div className="hidden md:flex items-center gap-2 text-xs text-blue-300 px-4 py-2 bg-blue-950/50 rounded-lg border border-blue-800">
                                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> OCR Ativo
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Tool: Corretor de Peças */}
                        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-3xl hover:border-red-500 transition-colors group cursor-pointer flex flex-col justify-between" onClick={() => handleToolChange('corrector')}>
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-red-500/10 p-2 rounded-xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase bg-gray-900 px-2 py-1 rounded text-red-400 border border-red-900/50">OAB / Prática</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Corretor de Peças</h3>
                                <p className="text-xs text-gray-400 leading-relaxed mb-6 h-10">
                                    Corrige estrutura, latim e fundamentação de suas peças.
                                </p>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                                <span className="text-[10px] text-gray-500 font-mono"></span>
                                <Button onClick={() => handleToolChange('corrector')} className="!py-2 !px-4 text-xs !bg-red-600 hover:!bg-red-500">Iniciar</Button>
                            </div>
                        </div>

                        {/* Tool: Vade Mecum Semantic */}
                        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-3xl hover:border-green-500 transition-colors group cursor-pointer flex flex-col justify-between" onClick={() => handleToolChange('vade')}>
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-green-900/30 p-2 rounded-xl text-green-400 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase bg-green-900/30 px-2 py-1 rounded text-green-400 border border-green-900/50">Busca IA</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Vade Mecum Semântico</h3>
                                <p className="text-xs text-gray-400 leading-relaxed mb-6 h-10">
                                    Encontre artigos de lei descrevendo o problema.
                                </p>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                                <span className="text-[10px] text-gray-500 font-mono"></span>
                                <Button onClick={() => handleToolChange('vade')} className="w-full !py-2 !px-4 text-xs !bg-green-600 hover:!bg-green-500 text-white font-bold shadow-lg shadow-green-500/20">Pesquisar</Button>
                            </div>
                        </div>

                        {/* Tool: Banco de Modelos (Repository) */}
                        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-3xl hover:border-yellow-500 transition-colors group cursor-pointer flex flex-col justify-between" onClick={() => handleToolChange('repository')}>
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-yellow-500/10 p-2 rounded-xl text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                        <Folder className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase bg-yellow-900/30 px-2 py-1 rounded text-yellow-400 border border-yellow-900/50">Premium</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Banco de Modelos</h3>
                                <p className="text-xs text-gray-400 leading-relaxed mb-6 h-10">
                                    +500 Modelos validados. Petições, contratos e documentos.
                                </p>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                                <span className="text-[10px] text-gray-500 font-mono"></span>
                                <Button onClick={() => handleToolChange('repository')} className="!py-2 !px-4 text-xs !bg-yellow-600 hover:!bg-yellow-500 text-black font-bold">Acessar</Button>
                            </div>
                        </div>

                    </div>
                </div>
            )}


        </div>
    );
};
