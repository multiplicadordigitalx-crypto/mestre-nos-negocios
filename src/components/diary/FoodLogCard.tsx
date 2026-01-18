
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Zap, Info, Plus,
    Trash, Search, Filter,
    ArrowRight, Clock, Star
} from '../Icons';
import Button from '../Button';

import { useCreditGuard } from '../../hooks/useCreditGuard';
import toast from 'react-hot-toast';

export const FoodLogCard: React.FC = () => {
    const [isLogging, setIsLogging] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [waterIntake, setWaterIntake] = useState(2100); // 2.1L in ml
    const [showTipDetails, setShowTipDetails] = useState(false);
    const [isAddingWater, setIsAddingWater] = useState(false);
    const [customWater, setCustomWater] = useState('250');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Credit Guard
    const { checkAndConsume, isProcessing } = useCreditGuard();

    const waterTarget = 3000; // 3L
    const waterProgress = Math.min((waterIntake / waterTarget) * 100, 100);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setCapturedImage(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyzePlate = async () => {
        const hasCredit = await checkAndConsume('health_meal_scan', 'Scan Refeição OCR');
        if (hasCredit) {
            // Mock OCR Success
            setTimeout(() => {
                toast.success("Prato Identificado: Salada Caesar com Frango (350kcal)", {
                    duration: 4000,
                    icon: '🥗'
                });
                setIsLogging(false);
                setCapturedImage(null);
            }, 2000);
        }
    };

    const mealHistory = [
        { id: 1, name: 'Café da Manhã Fitness', time: '08:20', calories: 450, macros: { p: 25, c: 45, f: 12 }, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=400&auto=format&fit=crop' },
        { id: 2, name: 'Bowl de Frutas & Whey', time: '11:00', calories: 280, macros: { p: 30, c: 35, f: 5 }, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Log Section */}
            <div className="lg:col-span-2 space-y-6">

                {/* Daily Target Progress */}
                <div className="bg-gray-800 border border-gray-700 rounded-[2.5rem] p-8 overflow-hidden relative">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                        <div className="text-center md:text-left">
                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Energia Consumida</h4>
                            <div className="text-5xl font-black text-white mb-2">730 <span className="text-lg text-gray-600 font-medium">kcal</span></div>
                            <p className="text-xs text-brand-primary font-bold">Faltam 1,270 kcal para bater a meta</p>
                        </div>

                        <div className="flex gap-4">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-700 flex flex-col items-center justify-center mb-2 hover:border-brand-primary transition-colors cursor-help">
                                    <span className="text-[10px] text-gray-500 font-bold">P</span>
                                    <span className="text-xs font-black">55g</span>
                                </div>
                                <div className="w-full h-1 bg-gray-700 rounded-full"><div className="w-2/3 h-full bg-indigo-500"></div></div>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-700 flex flex-col items-center justify-center mb-2 hover:border-brand-primary transition-colors cursor-help">
                                    <span className="text-[10px] text-gray-500 font-bold">C</span>
                                    <span className="text-xs font-black">80g</span>
                                </div>
                                <div className="w-full h-1 bg-gray-700 rounded-full"><div className="w-1/3 h-full bg-brand-primary"></div></div>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-700 flex flex-col items-center justify-center mb-2 hover:border-brand-primary transition-colors cursor-help">
                                    <span className="text-[10px] text-gray-500 font-bold">F</span>
                                    <span className="text-xs font-black">17g</span>
                                </div>
                                <div className="w-full h-1 bg-gray-700 rounded-full"><div className="w-1/2 h-full bg-orange-400"></div></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Log History */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2 px-2">
                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Atividade Hoje</h4>
                        <Button
                            onClick={() => setIsLogging(true)}
                            className="!px-6 !py-2 !text-[10px] !bg-green-400 text-black font-black uppercase shadow-lg shadow-green-500/20"
                        >
                            <Plus className="w-3 h-3 mr-1" /> Novo Registro
                        </Button>
                    </div>

                    <AnimatePresence>
                        {isLogging && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-gray-800 border-2 border-brand-primary/30 rounded-[2rem] p-6 mb-6 overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full md:w-48 h-48 bg-gray-950 rounded-2xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary transition-colors overflow-hidden group"
                                    >
                                        {capturedImage ? (
                                            <img src={capturedImage} className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <Camera className="w-8 h-8 text-gray-700 mb-2 group-hover:text-brand-primary group-hover:scale-110 transition-all" />
                                                <span className="text-[10px] font-black text-gray-600 uppercase">Soltar Foto</span>
                                            </>
                                        )}
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="text-xl font-black text-white uppercase italic mb-1">Analisar com Nexus IA</h5>
                                                <p className="text-[10px] text-gray-500">Tire uma foto do prato para detecção automática de macros.</p>
                                            </div>
                                            <button onClick={() => setIsLogging(false)} className="text-gray-600 hover:text-white transition-colors">
                                                <Plus className="w-5 h-5 rotate-45" />
                                            </button>
                                        </div>

                                        <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                                            <div className="flex items-center gap-3 text-green-400 mb-2">
                                                <Zap className={`w-4 h-4 ${isProcessing ? 'animate-spin' : 'animate-pulse'}`} />
                                                <span className="text-[10px] font-black uppercase">
                                                    {isProcessing ? 'Nexus IA Analisando...' : 'IA Aguardando Imagem...'}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                                                <div className={`h-full bg-green-400 transition-all duration-[2000ms] ${isProcessing ? 'w-full' : 'w-0'}`}></div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleAnalyzePlate}
                                                disabled={!capturedImage || isProcessing}
                                                className="flex-1 !bg-green-400 text-black font-black uppercase text-xs"
                                            >
                                                {isProcessing ? 'Processando...' : 'Analisar Prato (IA)'}
                                            </Button>
                                            <Button variant="secondary" className="!bg-gray-900 border-gray-800 text-xs font-bold uppercase" onClick={() => setIsLogging(false)}>Cancelar</Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {mealHistory.map((meal) => (
                        <div key={meal.id} className="bg-gray-800 border border-gray-700 p-4 rounded-[1.5rem] flex items-center justify-between group hover:border-brand-primary/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg">
                                    <img src={meal.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h5 className="text-white font-bold text-sm tracking-tight">{meal.name}</h5>
                                        <span className="text-[9px] text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {meal.time}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-[10px] font-bold text-gray-400">P: <span className="text-white">{meal.macros.p}g</span></span>
                                        <span className="text-[10px] font-bold text-gray-400">C: <span className="text-white">{meal.macros.c}g</span></span>
                                        <span className="text-[10px] font-bold text-gray-400">F: <span className="text-white">{meal.macros.f}g</span></span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-black text-white">{meal.calories} <span className="text-[10px]">kcal</span></div>
                                <button className="text-[9px] text-brand-primary font-black uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Ver Detalhes</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Nutrition Insights Sidebar */}
            <div className="space-y-6">
                <div className="bg-gray-800 border border-gray-700 rounded-[2rem] p-6">
                    <h4 className="text-xs font-black text-gray-500 uppercase mb-4 tracking-widest">Metas Semanais</h4>
                    <div className="space-y-5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-white font-bold uppercase">Meta de Hidratação</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-blue-400 font-black">{(waterIntake / 1000).toFixed(1)}L / {(waterTarget / 1000).toFixed(1)}L</span>
                                <button
                                    onClick={() => setIsAddingWater(!isAddingWater)}
                                    className="w-6 h-6 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/5 group"
                                    title="Registar Água"
                                >
                                    <Plus className={`w-3.5 h-3.5 transition-transform ${isAddingWater ? 'rotate-45' : ''}`} />
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {isAddingWater && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                    className="bg-gray-900/80 border border-blue-500/30 p-3 rounded-2xl mb-4 flex items-center gap-3 backdrop-blur-sm"
                                >
                                    <div className="flex-1">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={customWater}
                                                onChange={(e) => setCustomWater(e.target.value)}
                                                className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-black focus:border-blue-500 outline-none pr-8"
                                                placeholder="Amount"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-gray-600 uppercase">ml</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => {
                                                const val = parseInt(customWater) || 0;
                                                setWaterIntake(prev => Math.min(prev + val, 5000));
                                                setIsAddingWater(false);
                                            }}
                                            className="bg-blue-500 text-black px-3 py-2 rounded-xl text-[9px] font-black uppercase hover:scale-105 transition-transform"
                                        >Adicionar</button>
                                        <button
                                            onClick={() => setWaterIntake(0)}
                                            className="bg-gray-800 text-gray-500 px-3 py-2 rounded-xl text-[9px] font-black uppercase hover:text-red-400"
                                        >Reset</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden">
                            <motion.div
                                animate={{ width: `${waterProgress}%` }}
                                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            ></motion.div>
                        </div>

                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] text-white font-bold uppercase">Consistência Proteica</span>
                            <span className="text-[10px] text-purple-400 font-black">5 / 7 dias</span>
                        </div>
                        <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '71%' }} className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></motion.div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-[2rem] p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Star className="w-20 h-20 text-brand-primary" />
                    </div>
                    <h4 className="text-xs font-black text-brand-primary uppercase mb-3 tracking-widest flex items-center gap-2">
                        <Star className="w-3 h-3" /> Tip do Nexus
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed mb-4">
                        Adicione 30g de fibras hoje para melhorar sua digestão e aumentar o foco mental no período da tarde.
                    </p>
                    <button
                        onClick={() => setShowTipDetails(true)}
                        className="text-[10px] text-white font-black uppercase flex items-center gap-1 group"
                    >
                        Ver Lista de Alimentos <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Tip Details Modal */}
                <AnimatePresence>
                    {showTipDetails && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowTipDetails(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-gray-800 border-2 border-brand-primary/30 rounded-[2.5rem] p-8 w-full max-w-lg relative z-10 shadow-3xl"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-2">
                                        <Star className="w-6 h-6 text-brand-primary" /> Sugestões Nexus
                                    </h3>
                                    <button onClick={() => setShowTipDetails(false)} className="text-gray-500 hover:text-white transition-colors">
                                        <Plus className="w-6 h-6 rotate-45" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-brand-primary/10 border border-brand-primary/20 p-5 rounded-2xl">
                                        <p className="text-sm text-gray-200 leading-relaxed font-medium">
                                            "Com base no seu registro de hoje, você está com um déficit de fibras. Isso pode causar picos de insulina que afetam sua clareza mental às 16h."
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Fontes Recomendadas</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { name: 'Aveia em Flocos', fibre: '10g/100g' },
                                                { name: 'Sementes de Chia', fibre: '34g/100g' },
                                                { name: 'Grão de Bico', fibre: '12g/100g' },
                                                { name: 'Maçã com Casca', fibre: '4g/unid' }
                                            ].map((item, i) => (
                                                <div key={i} className="bg-gray-950 p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                                                    <span className="text-[10px] text-white font-bold">{item.name}</span>
                                                    <span className="text-[9px] text-brand-primary font-black uppercase">{item.fibre}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-gray-900/50 p-4 rounded-xl text-[10px] text-gray-400 italic">
                                        * O Nexus analisa seu histórico e propõe correções nutricionais para otimizar seu desempenho nos estudos.
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
