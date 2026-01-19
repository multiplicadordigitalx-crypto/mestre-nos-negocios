
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Scale, Ruler, Camera, Zap, Plus,
    TrendingUp, ArrowRight, CheckCircle,
    Info, Star
} from '../Icons';
import Button from '../Button';
import { useCreditGuard } from '../../hooks/useCreditGuard';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface BodyMetricsCardProps {
    hasPhysicalKit?: boolean;
}

export const BodyMetricsCard: React.FC<BodyMetricsCardProps> = ({ hasPhysicalKit }) => {
    const [isLogging, setIsLogging] = useState(false);
    const [logType, setLogType] = useState<'weight' | 'measurements'>('weight');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Credit Guard
    const { checkAndConsume, isProcessing } = useCreditGuard();
    const { user } = useAuth();

    const handleAnalyzePhoto = async () => {
        // HYBRID CREDIT LOGIC: 3 Scans/Day (Hardcoded for now, ideal: get from course config)
        // We use contextId = 'global_health' so it shares a bucket if we want, or user unique bucket.
        const proceed = await checkAndConsume('health_metric_scan', 'Scan Métricas Corporais', {
            cost: 5, // Higher cost for OCR
            dailyLimit: 50, // 10 scans (Default Platform Limit for Health tools)
            contextId: 'health_suite'
        });

        if (proceed) {
            toast.promise(
                new Promise(resolve => setTimeout(resolve, 2000)),
                {
                    loading: 'Nexus IA lendo display...',
                    success: 'Valor Extraído com Sucesso! (83.4kg)',
                    error: 'Erro na leitura'
                }
            );
        }
    };

    const metricsHistory = [
        { id: 1, date: '12 Jan', weight: 82.5, waist: 92, unit: 'kg/cm' },
        { id: 2, date: '05 Jan', weight: 84.1, waist: 94, unit: 'kg/cm' },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setCapturedImage(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Log Section */}
            <div className="lg:col-span-2 space-y-6">

                {/* Evolution Banner */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-green-900/40 border border-green-500/30 p-8 rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-60 h-60 bg-green-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h3 className="text-2xl font-black uppercase italic text-white mb-2 flex items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-green-400" /> Evolução Física
                            </h3>
                            <p className="text-sm text-gray-300">Você eliminou <span className="text-green-400 font-black">1.6kg</span> e <span className="text-green-400 font-black">2cm</span> de cintura na última semana!</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => { setLogType('weight'); setIsLogging(true); }}
                                className={(!isLogging || logType === 'weight')
                                    ? "!bg-green-400 text-black font-black uppercase text-[10px] px-6 py-3 rounded-2xl shadow-xl shadow-green-500/20"
                                    : "!bg-gray-900/50 border border-gray-700 text-gray-400 font-black uppercase text-[10px] px-6 py-3 rounded-2xl hover:text-white transition-colors"
                                }
                            >
                                <Scale className={`w-3.5 h-3.5 mr-2 ${(!isLogging || logType === 'weight') ? 'text-black' : 'text-gray-500'}`} /> Registrar Peso
                            </Button>
                            <Button
                                onClick={() => { setLogType('measurements'); setIsLogging(true); }}
                                className={(isLogging && logType === 'measurements')
                                    ? "!bg-green-400 text-black font-black uppercase text-[10px] px-6 py-3 rounded-2xl shadow-xl shadow-green-500/20"
                                    : "!bg-gray-900/50 border border-gray-700 text-gray-400 font-black uppercase text-[10px] px-6 py-3 rounded-2xl hover:text-white transition-colors"
                                }
                            >
                                <Ruler className={`w-3.5 h-3.5 mr-2 ${(isLogging && logType === 'measurements') ? 'text-black' : 'text-gray-500'}`} /> Registrar Medidas
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Log Modal/Section */}
                <AnimatePresence>
                    {isLogging && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-gray-800 border-2 border-emerald-500/30 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h4 className="text-xl font-black text-white uppercase italic mb-1">
                                        {logType === 'weight' ? 'Registrar Peso' : 'Registrar Medidas'}
                                    </h4>
                                    <p className="text-[10px] text-gray-500 tracking-widest uppercase">
                                        {capturedImage ? 'Nexus IA analisando imagem...' : 'Tire uma foto ou insira manualmente'}
                                    </p>
                                </div>
                                <button onClick={() => { setIsLogging(false); setCapturedImage(null); }} className="text-gray-500 hover:text-white transition-colors">
                                    <Plus className="w-6 h-6 rotate-45" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Photo Upload */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square bg-gray-950 rounded-3xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all group relative overflow-hidden"
                                >
                                    {capturedImage ? (
                                        <div className="relative w-full h-full">
                                            <img src={capturedImage} className="w-full h-full object-cover" alt="Captured metric" />
                                            {/* OCR Trigger Overlay */}
                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4">
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAnalyzePhoto();
                                                    }}
                                                    isLoading={isProcessing}
                                                    className="!bg-green-400 text-black font-black uppercase text-[10px] w-full"
                                                >
                                                    <Zap className="w-4 h-4 mr-1" />
                                                    {isProcessing ? 'Lendo...' : 'Ler Números (IA)'}
                                                </Button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setCapturedImage(null); }}
                                                    className="mt-3 text-white text-[10px] underline hover:text-red-400"
                                                >
                                                    Remover Foto
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-green-500/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <Camera className="w-8 h-8 text-green-400" />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-500 uppercase">Enviar Foto {logType === 'weight' ? 'da Balança' : 'da Medida'}</span>
                                            <span className="text-[8px] text-gray-700 mt-2">O Nexus lerá os números para você</span>
                                        </>
                                    )}
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                </div>

                                {/* Manual Inputs */}
                                <div className="space-y-6">
                                    {logType === 'weight' ? (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Peso Atual (kg)</label>
                                            <input type="number" step="0.1" placeholder="00.0" className="w-full bg-black border-2 border-gray-800 rounded-2xl p-4 text-2xl font-black text-white focus:border-green-400 outline-none transition-colors" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4">
                                            {[
                                                { label: 'Cintura', unit: 'cm' },
                                                { label: 'Quadril', unit: 'cm' },
                                                { label: 'Peito', unit: 'cm' }
                                            ].map((field, i) => (
                                                <div key={i} className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{field.label} ({field.unit})</label>
                                                    <input type="number" placeholder="00" className="w-full bg-black border-2 border-gray-800 rounded-2xl p-3 text-lg font-black text-white focus:border-green-400 outline-none transition-colors" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="pt-4">
                                        <Button className="w-full !bg-green-400 text-black font-black uppercase py-4 rounded-2xl shadow-xl shadow-green-900/20">
                                            Confirmar Registro
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* History List */}
                <div className="bg-gray-800 border border-gray-700 rounded-[2.5rem] p-8">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Histórico Recente</h4>
                    <div className="space-y-4">
                        {metricsHistory.map((log) => (
                            <div key={log.id} className="bg-gray-950 p-6 rounded-3xl border border-gray-800 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="text-center bg-gray-900 p-3 rounded-2xl min-w-[60px]">
                                        <p className="text-[10px] text-green-400 font-black uppercase leading-none mb-1">{log.date.split(' ')[1]}</p>
                                        <p className="text-xl font-black text-white leading-none">{log.date.split(' ')[0]}</p>
                                    </div>
                                    <div className="flex gap-8">
                                        <div>
                                            <p className="text-[9px] text-gray-600 font-bold uppercase mb-1">Peso</p>
                                            <p className="text-lg font-black text-white">{log.weight} <span className="text-[10px] text-gray-700">kg</span></p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-gray-600 font-bold uppercase mb-1">Cintura</p>
                                            <p className="text-lg font-black text-white">{log.waist} <span className="text-[10px] text-gray-700">cm</span></p>
                                        </div>
                                    </div>
                                </div>
                                <button className="text-gray-700 hover:text-white transition-colors">
                                    <Info className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar: Kit & Tips */}
            <div className="space-y-6">
                {hasPhysicalKit && (
                    <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-[2rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
                            <Scale className="w-16 h-16 text-green-400" />
                        </div>
                        <h4 className="text-xs font-black text-green-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5" /> Kit Integrado Ativo
                        </h4>
                        <p className="text-xs text-indigo-100/80 leading-relaxed mb-4">
                            Sua balança e fita métrica digital estão conectadas. Use-as para precisão máxima nos relatórios do Nexus.
                        </p>
                        <button className="text-[10px] text-white font-black uppercase flex items-center gap-1 hover:gap-2 transition-all">
                            Tutorial de Calibragem <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {!hasPhysicalKit && (
                    <div className="bg-gray-800 border border-gray-700 p-6 rounded-[2rem]">
                        <h4 className="text-xs font-black text-gray-500 uppercase mb-3 tracking-widest flex items-center gap-2">
                            <Star className="w-3.5 h-3.5 text-yellow-500" /> Upgrade Disponível
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">
                            Adquira o Kit Nexus (Balança Smart + Cinta de Bioimpedância) para automatizar 100% dos seus registros.
                        </p>
                        <button className="w-full bg-brand-primary text-black font-black uppercase py-3 rounded-xl text-[10px] shadow-lg shadow-brand-primary/10 hover:scale-105 transition-transform">
                            Ver na Loja da Escola
                        </button>
                    </div>
                )}

                <div className="bg-gray-800 border border-gray-700 rounded-[2rem] p-6">
                    <h4 className="text-xs font-black text-gray-500 uppercase mb-4 tracking-widest">Análise de IA</h4>
                    <div className="space-y-4">
                        <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 border-l-4 border-l-green-500">
                            <p className="text-[10px] text-gray-400 leading-relaxed">
                                "Sua redução de cintura em 2cm coincide com os 5 dias em que você bateu a meta de hidratação e fibras."
                            </p>
                            <p className="text-[9px] text-green-400 font-black uppercase mt-2">Alta Correlação</p>
                        </div>
                        <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800">
                            <p className="text-[10px] text-gray-400 leading-relaxed">
                                "Mantenha o ritmo. Seu metabolismo basal estimado subiu 3% devido ao aumento de massa magra."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
