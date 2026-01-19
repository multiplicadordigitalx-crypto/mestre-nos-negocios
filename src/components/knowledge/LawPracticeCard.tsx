import React, { useState } from 'react';
import { Scale, FileText, MessageSquare, BookOpen, AlertCircle, Zap, ArrowRight, Target, Brain } from '../Icons';
import Button from '../Button';
import toast from 'react-hot-toast';
import { LegalSageAgent } from './law/LegalSageAgent';
import { EssayCorrector } from './law/EssayCorrector';
import { VadeMecum } from './law/VadeMecum';
import { AudienceSimulator } from './law/AudienceSimulator';
import { OABQuizSimulator } from './law/OABQuizSimulator';
import { JurisMemoria } from './law/JurisMemoria';

export const LawPracticeCard: React.FC = () => {
    const [activeTool, setActiveTool] = useState<'sage' | 'corrector' | 'vade' | 'audience' | 'quiz' | 'memoria' | null>(null);

    if (activeTool === 'sage') return <LegalSageAgent onBack={() => setActiveTool(null)} />;
    if (activeTool === 'corrector') return <EssayCorrector onBack={() => setActiveTool(null)} />;
    if (activeTool === 'vade') return <VadeMecum onBack={() => setActiveTool(null)} />;
    if (activeTool === 'audience') return <AudienceSimulator onBack={() => setActiveTool(null)} />;
    if (activeTool === 'quiz') return <OABQuizSimulator onBack={() => setActiveTool(null)} />;
    if (activeTool === 'memoria') return <JurisMemoria onBack={() => setActiveTool(null)} />;

    return (
        <div className="space-y-6">

            {/* FEATURED: O SÁBIO */}
            <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border border-blue-500/30 rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-blue-500/60 transition-colors">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-blue-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg shadow-blue-500/50">Novo</span>
                            <span className="text-blue-300 text-xs font-bold tracking-widest uppercase">Inteligência Artificial Jurídica</span>
                        </div>
                        <h2 className="text-4xl font-black italic text-white mb-4">"O Sábio"</h2>
                        <p className="text-blue-100 text-sm leading-relaxed mb-6 max-w-lg">
                            Seu novo copiloto jurídico. Faça upload de processos (OCR), descreva casos por voz e peça teses de defesa completas baseadas em jurisprudência atualizada.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button onClick={() => setActiveTool('sage')} className="!bg-white !text-blue-900 !py-3 !px-8 font-black uppercase hover:scale-105 transition-transform shadow-xl">
                                <Zap className="w-5 h-5 mr-2" /> Acessar Agente
                            </Button>
                            <div className="flex items-center gap-2 text-xs text-blue-300 px-4 py-2 bg-blue-950/50 rounded-lg border border-blue-800">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> OCR Ativo
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex justify-center">
                        <div className="w-40 h-40 bg-blue-500/20 rounded-full border-4 border-blue-400/30 flex items-center justify-center text-6xl backdrop-blur-sm shadow-2xl">
                            🦉
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-900/50 border border-red-900/30 rounded-[2.5rem] p-8 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-900/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 z-10">
                        <Scale className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase italic text-white">Laboratório Jurídico</h2>
                        <p className="text-red-200/60 text-sm">Ferramentas de IA para advogados e estudantes.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">

                    {/* Tool 1: Corretor de Peças */}
                    <div className="bg-gray-800 border border-gray-700 p-6 rounded-3xl hover:border-red-500 transition-colors group cursor-pointer flex flex-col justify-between" onClick={() => setActiveTool('corrector')}>
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-red-500/10 p-2 rounded-xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase bg-gray-900 px-2 py-1 rounded text-red-400 border border-red-900/50">OAB / Prática</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Corretor de Peças</h3>
                            <p className="text-xs text-gray-400 leading-relaxed mb-6 h-10">
                                Cole sua petição inicial ou contestação. A IA corrige estrutura, latim e fundamentação.
                            </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                            <span className="text-[10px] text-gray-500 font-mono">Custo: 15 Créditos</span>
                            <Button onClick={() => setActiveTool('corrector')} className="!py-2 !px-4 text-xs !bg-red-600 hover:!bg-red-500">Iniciar</Button>
                        </div>
                    </div>

                    {/* Tool 2: JurisMemória */}
                    <div className="bg-gray-800 border border-gray-700 p-6 rounded-3xl hover:border-purple-500 transition-colors group cursor-pointer flex flex-col justify-between" onClick={() => setActiveTool('memoria')}>
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-purple-500/10 p-2 rounded-xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase bg-purple-900/30 px-2 py-1 rounded text-purple-400 border border-purple-900/50">Memorização</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">JurisMemória Flashcards</h3>
                            <p className="text-xs text-gray-400 leading-relaxed mb-6 h-10">
                                Memorize leis e prazos. Sistema inteligente com reserva e estorno de créditos.
                            </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                            <span className="text-[10px] text-gray-500 font-mono"></span>
                            <Button onClick={() => setActiveTool('memoria')} className="!py-2 !px-4 text-xs !bg-purple-600 hover:!bg-purple-500">Treinar</Button>
                        </div>
                    </div>

                    {/* Tool 3: Simulado OAB */}
                    <div className="bg-gray-800 border border-gray-700 p-6 rounded-3xl hover:border-yellow-500 transition-colors group cursor-pointer flex flex-col justify-between" onClick={() => setActiveTool('quiz')}>
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-yellow-500/10 p-2 rounded-xl text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                    <Target className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase bg-yellow-900/30 px-2 py-1 rounded text-yellow-400 border border-yellow-900/50">1ª Fase</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Simulado OAB</h3>
                            <p className="text-xs text-gray-400 leading-relaxed mb-6 h-10">
                                Questões comentadas do exame de ordem. Teste seus conhecimentos teóricos.
                            </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                            <span className="text-[10px] text-gray-500 font-mono">Custo: 10 Créditos</span>
                            <Button onClick={() => setActiveTool('quiz')} className="!py-2 !px-4 text-xs !bg-red-600 hover:!bg-red-500">Simular</Button>
                        </div>
                    </div>

                    {/* Tool 4: Simulador de Audiência */}
                    <div className="bg-gray-800 border border-gray-700 p-6 rounded-3xl hover:border-blue-500 transition-colors group cursor-pointer flex flex-col justify-between" onClick={() => setActiveTool('audience')}>
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
                            <span className="text-[10px] text-gray-500 font-mono">Custo: 25 Créditos</span>
                            <Button onClick={() => setActiveTool('audience')} className="w-full !py-2 !px-4 text-xs !bg-gray-700 hover:!bg-gray-600">Treinar Voz</Button>
                        </div>
                    </div>

                    {/* Tool 5: Vade Mecum Semantic */}
                    <div className="bg-gray-800 border border-gray-700 p-6 rounded-3xl hover:border-green-500 transition-colors group cursor-pointer flex flex-col justify-between" onClick={() => setActiveTool('vade')}>
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-green-900/30 p-2 rounded-xl text-green-400 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase bg-green-900/30 px-2 py-1 rounded text-green-400 border border-green-900/50">Grátis</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Vade Mecum Semântico</h3>
                            <p className="text-xs text-gray-400 leading-relaxed mb-6 h-10">
                                Encontre artigos de lei descrevendo o problema com suas palavras.
                            </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                            <span className="text-[10px] text-gray-500 font-mono">*Até 10/dia</span>
                            <Button onClick={() => setActiveTool('vade')} className="w-full !py-2 !px-4 text-xs !bg-gray-700 hover:!bg-gray-600">Pesquisar</Button>
                        </div>
                    </div>

                </div>

                <div className="mt-8 bg-red-900/20 border border-red-500/10 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-xs text-red-200">
                        <strong>Nota:</strong> Estas ferramentas usam modelos jurídicos treinados. As respostas servem de auxílio e aprendizado, não substituem consultoria legal oficial.
                    </p>
                </div>
            </div>
        </div>
    );
};
