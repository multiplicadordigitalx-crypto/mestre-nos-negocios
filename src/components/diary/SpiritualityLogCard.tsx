
import React, { useState } from 'react';
import { Sun, Moon, Heart, Star, CloudRain, Feather, Zap } from '../Icons';
import { useAuth } from '../../hooks/useAuth';
import { saveGratitudeEntry } from '../../services/mockFirebase';
import { toast } from 'react-hot-toast';
import { useCreditGuard } from '../../hooks/useCreditGuard';

export const SpiritualityLogCard: React.FC = () => {
    const { user } = useAuth();
    const [selectedPractice, setSelectedPractice] = useState<string>("");
    const [gratitudeText, setGratitudeText] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Credit Guard
    const { checkAndConsume, isProcessing } = useCreditGuard();

    const handleSave = async () => {
        if (!user || !gratitudeText) return;
        setIsSaving(true);
        try {
            await saveGratitudeEntry({
                studentId: user.uid,
                content: gratitudeText,
                practice: selectedPractice
            });
            toast.success("Gratidão salva com sucesso! 🙏");
            setGratitudeText("");
            setSelectedPractice("");
        } catch (error) {
            toast.error("Erro ao salvar. Tente novamente.");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCosmicInsight = async () => {
        const hasCredit = await checkAndConsume('health_gratitude_insight', 'Insight Gratidão IA');
        if (hasCredit) {
            toast.promise(
                new Promise(resolve => setTimeout(resolve, 2500)),
                {
                    loading: 'Conectando com a energia universal...',
                    success: '✨ "O universo agradece sua gratidão e retribui com abundância."',
                    error: 'Falha na conexão cósmica.'
                }
            );
        }
    };

    const practices = [
        "Oração / Reza", "Meditação", "Culto / Missa",
        "Leitura Sagrada", "Jejum Espiritual", "Conexão Natureza"
    ];

    return (
        <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-[2.5rem] p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                        <Sun className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase italic">Espiritualidade & Crenças</h2>
                        <p className="text-gray-400 text-sm">Conexão, propósito e gratidão diária.</p>
                    </div>
                    <div className="ml-auto">
                        <button
                            onClick={handleCosmicInsight}
                            disabled={isProcessing}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 shadow-lg shadow-purple-900/40 transition-all transform hover:scale-105"
                        >
                            <Zap className="w-4 h-4 text-yellow-300" />
                            Receber Insight Cósmico
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Practice Selector */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Prática do Dia</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {practices.map(item => (
                                <button
                                    key={item}
                                    onClick={() => setSelectedPractice(item)}
                                    className={`p-4 rounded-2xl text-xs font-bold transition-all border ${selectedPractice === item ? "bg-yellow-500 border-yellow-400 text-black shadow-lg" : "bg-gray-950 border-gray-800 text-gray-400 hover:border-yellow-500/30"}`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Gratitude Journal */}
                    <div className="bg-gray-950/30 border border-gray-800 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Feather className="w-5 h-5 text-pink-400" />
                            <h3 className="font-bold text-gray-200">Diário da Gratidão</h3>
                        </div>
                        <textarea
                            value={gratitudeText}
                            onChange={(e) => setGratitudeText(e.target.value)}
                            placeholder="Hoje eu sou grato por..."
                            className="w-full bg-transparent text-lg text-white placeholder-gray-600 outline-none min-h-[80px] resize-none leading-relaxed mb-4"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={!gratitudeText || isSaving}
                                className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${gratitudeText && !isSaving ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}
                            >
                                {isSaving ? "Salvando..." : "Salvar Gratidão"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
