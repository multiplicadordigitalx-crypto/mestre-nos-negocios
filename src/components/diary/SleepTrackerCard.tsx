
import React, { useState } from 'react';
import { Moon, Star, Clock, Zap, CloudRain, CheckCircle, Brain } from '../Icons';
import Button from '../Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreditGuard } from '../../hooks/useCreditGuard';
import toast from 'react-hot-toast';

export const SleepTrackerCard: React.FC = () => {
    const [hoursSlept, setHoursSlept] = useState<string>("");
    const [sleepQuality, setSleepQuality] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Credit Guard
    const { checkAndConsume, isProcessing } = useCreditGuard();

    const qualityOptions = [
        { id: 'restorative', label: 'Restaurador', icon: Zap, color: 'text-green-400' },
        { id: 'average', label: 'Médio', icon: CloudRain, color: 'text-yellow-400' },
        { id: 'poor', label: 'Ruim', icon: Moon, color: 'text-red-400' }
    ];

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaved(true);
        setIsSaving(false);
        setTimeout(() => {
            setSaved(false);
            setHoursSlept("");
            setSleepQuality(null);
        }, 3000);
    };

    const handleAnalyzeAI = async () => {
        const hasCredit = await checkAndConsume('health_sleep_analysis', 'Análise de Sono IA');
        if (hasCredit) {
            toast.promise(
                new Promise(resolve => setTimeout(resolve, 2000)),
                {
                    loading: 'Nexus IA analisando padrões de sono...',
                    success: 'Análise concluída! (Simulação)',
                    error: 'Erro na análise'
                }
            );
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-[2.5rem] p-8 relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <Moon className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase italic">Higiene do Sono</h2>
                            <p className="text-gray-400 text-sm">Monitore a qualidade do seu descanso.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Input Section */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-500 ml-2">Horas Dormidas</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                    <input
                                        type="number"
                                        value={hoursSlept}
                                        onChange={(e) => setHoursSlept(e.target.value)}
                                        placeholder="Ex: 7.5"
                                        className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white text-lg outline-none focus:border-indigo-500 transition-all font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase text-gray-500 ml-2">Qualidade do Sono</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {qualityOptions.map((opt) => {
                                        const Icon = opt.icon;
                                        const isSelected = sleepQuality === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                onClick={() => setSleepQuality(opt.id)}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${isSelected ? `bg-indigo-500/20 border-indigo-500 shadow-lg shadow-indigo-500/20` : 'bg-gray-950 border-gray-800 hover:border-gray-700'}`}
                                            >
                                                <Icon className={`w-6 h-6 ${opt.color}`} />
                                                <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-white' : 'text-gray-500'}`}>{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSave}
                                    disabled={!hoursSlept || !sleepQuality || isSaving}
                                    className={`flex-1 !py-4 font-black uppercase rounded-2xl shadow-xl transition-all ${saved ? '!bg-green-500 !text-black' : '!bg-indigo-600 hover:!bg-indigo-500 !text-white'}`}
                                >
                                    {saved ? (
                                        <span className="flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> Registrado!</span>
                                    ) : isSaving ? (
                                        "Salvando..."
                                    ) : (
                                        "Registrar Noite"
                                    )}
                                </Button>
                                <Button
                                    onClick={handleAnalyzeAI}
                                    disabled={!hoursSlept || isProcessing}
                                    className="!py-4 !px-4 !bg-purple-600 hover:!bg-purple-500 rounded-2xl shadow-lg border border-purple-400/30"
                                    title="Gerar Insights com IA"
                                >
                                    <Brain className="w-6 h-6 text-white" />
                                </Button>
                            </div>
                        </div>

                        {/* Recent History / Insights */}
                        <div className="space-y-4">
                            <div className="bg-gray-950/50 p-6 rounded-3xl border border-gray-800">
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Média Semanal</h4>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-4xl font-black text-white">6.8</span>
                                    <span className="text-sm text-gray-500 mb-1">horas/noite</span>
                                </div>
                                <div className="w-full bg-gray-900 rounded-full h-2 mb-2">
                                    <div className="bg-yellow-500 h-2 rounded-full w-[65%]"></div>
                                </div>
                                <p className="text-[10px] text-gray-400">Você está dormindo <span className="text-yellow-500 font-bold">-1.2h</span> a menos que o ideal (8h).</p>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-6 rounded-3xl border border-indigo-500/20 flex items-start gap-3">
                                <Star className="w-5 h-5 text-indigo-400 shrink-0 mt-1" />
                                <div>
                                    <p className="text-xs font-bold text-indigo-300 uppercase mb-1">Dica do Nexus</p>
                                    <p className="text-[11px] text-gray-400 leading-relaxed">
                                        Tente desligar telas 1 hora antes de deitar. Seu sono profundo aumentou 15% nas noites em que você registrou leitura antes de dormir.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
