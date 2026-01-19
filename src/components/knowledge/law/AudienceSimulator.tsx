import React, { useState, useEffect } from 'react';
import { Mic, Play, MessageSquare, ChevronLeft, User, Volume2, AlertCircle } from '../../Icons';
import Button from '../../Button';
import toast from 'react-hot-toast';

interface AudienceSimulatorProps {
    onBack: () => void;
}

export const AudienceSimulator: React.FC<AudienceSimulatorProps> = ({ onBack }) => {
    const [status, setStatus] = useState<'idle' | 'listening' | 'speaking' | 'feedback'>('idle');
    const [transcript, setTranscript] = useState<string[]>([]);
    const [judgeMood, setJudgeMood] = useState<'neutral' | 'impressed' | 'annoyed'>('neutral');

    const startSimulation = () => {
        setStatus('speaking');
        setTranscript(prev => [...prev, "JUIZ (IA): Bom dia, Doutor(a). Estamos reunidos para a audiência de instrução do processo 10234. A palavra é sua para as considerações iniciais da defesa. Seja breve."]);
        setTimeout(() => setStatus('listening'), 4000);
    };

    const toggleMic = () => {
        if (status === 'listening') {
            setStatus('speaking'); // Simulating "Processing" then Judge speaks
            // Simulate User Speech
            setTranscript(prev => [...prev, "VOCÊ: Excelência, a defesa sustenta que não houve vínculo empregatício, pois faltam os requisitos de habitualidade e subordinação..."]);

            setTimeout(() => {
                // Judge Responds
                setTranscript(prev => [...prev, "JUIZ (IA): Entendo. Mas e quanto às testemunhas que afirmam ter visto o reclamante na empresa todos os dias? Como o senhor explica isso?"]);
                setJudgeMood('annoyed');
                setStatus('listening');
            }, 3000);
        } else {
            toast("Aguarde a vez de falar...", { icon: '✋' });
        }
    };

    const finishSimulation = () => {
        setStatus('feedback');
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden flex flex-col min-h-[600px] relative">
            {/* Header */}
            <div className="bg-gray-950 p-6 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button onClick={onBack} className="!p-2 bg-gray-800 hover:bg-gray-700 rounded-full">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <span className="text-2xl">⚖️</span> Simulador de Audiência <span className="text-[10px] bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded uppercase border border-blue-500/30">Voz AI</span>
                        </h2>
                        <p className="text-xs text-gray-400">Treine sua oratória e argumentação sob pressão.</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Visual Stage */}
                <div className="lg:col-span-2 bg-gray-950 rounded-3xl border border-gray-800 relative overflow-hidden flex flex-col">
                    {/* Judge Avatar Area */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-900 to-gray-950 relative">
                        <div className={`w-32 h-32 rounded-2xl mb-4 border-4 transition-colors ${judgeMood === 'neutral' ? 'border-gray-600 bg-gray-700' : judgeMood === 'impressed' ? 'border-green-500 bg-green-900' : 'border-red-500 bg-red-900'} flex items-center justify-center`}>
                            <User className="w-16 h-16 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Juiz Virtual</h3>
                        <p className={`text-xs uppercase font-bold tracking-widest ${judgeMood === 'neutral' ? 'text-gray-500' : judgeMood === 'impressed' ? 'text-green-500' : 'text-red-500'}`}>
                            {judgeMood === 'neutral' ? 'Atento' : judgeMood === 'impressed' ? 'Impressionado' : 'Cético'}
                        </p>

                        {/* Audio visualizer bars (Fake) */}
                        {status === 'speaking' && (
                            <div className="flex gap-1 mt-6 h-8 items-end">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-2 bg-blue-500 rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="p-6 bg-gray-900 border-t border-gray-800 flex justify-center gap-4">
                        {status === 'idle' ? (
                            <Button onClick={startSimulation} className="!bg-green-600 hover:!bg-green-500 !py-4 !px-8 shadow-lg shadow-green-500/20 text-base">
                                <Play className="w-5 h-5 mr-2" /> Iniciar Audiência
                            </Button>
                        ) : status === 'feedback' ? (
                            <Button onClick={() => setStatus('idle')} className="!bg-gray-700">Reiniciar</Button>
                        ) : (
                            <>
                                <button
                                    onClick={toggleMic}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${status === 'listening' ? 'bg-red-600 hover:bg-red-500 shadow-xl shadow-red-600/30 scale-110' : 'bg-gray-700 cursor-not-allowed opacity-50'}`}
                                >
                                    <Mic className="w-8 h-8 text-white" />
                                </button>
                                <Button onClick={finishSimulation} className="!bg-gray-800 border border-red-900/50 text-red-400 hover:!bg-gray-700">
                                    Encerrar
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Transcript / Feedback */}
                <div className="bg-gray-900 rounded-3xl border border-gray-800 p-6 flex flex-col h-full">
                    {status === 'feedback' ? (
                        <div className="animate-fade-in space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertCircle className="w-6 h-6 text-yellow-500" />
                                <h3 className="font-bold text-white">Análise da Performance</h3>
                            </div>
                            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Clareza</p>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[80%]"></div></div>
                            </div>
                            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Argumentação Jurídica</p>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-yellow-500 w-[60%]"></div></div>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                "Você manteve a calma, mas hesitou ao responder sobre as testemunhas. Na próxima, cite o princípio da Primazia da Realidade com mais firmeza."
                            </p>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Transcrição em Tempo Real</h3>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {transcript.length === 0 && <p className="text-center text-gray-600 text-sm italic mt-10">A audiência vai começar...</p>}
                                {transcript.map((line, i) => (
                                    <div key={i} className={`p-3 rounded-xl text-sm ${line.startsWith('VOCÊ') ? 'bg-blue-900/20 text-blue-200 ml-4 border border-blue-900/30' : 'bg-gray-800 text-gray-300 mr-4'}`}>
                                        <strong>{line.split(':')[0]}:</strong>{line.split(':')[1]}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};
