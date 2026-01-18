import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Droplet, Activity, FlaskConical, Gauge,
    Thermometer, Camera, Zap, Plus,
    CheckCircle, Info, Stethoscope, TestTube,
    Microscope, ArrowRight, Scan, RefreshCw,
    Edit2, XCircle, Heart, Wind
} from '../Icons';
import Button from '../Button';

interface BioLabCardProps {
    hasPhysicalKit?: boolean;
}

interface Biomarker {
    id: string;
    name: string;
    value: string;
    unit: string;
    status: 'Ideal' | 'Normal' | 'Alerta' | 'Crítico';
    statusColor: string;
    icon: any;
    color: string;
}

type KetoneMethod = 'urine' | 'blood' | 'breath';

export const BioLabCard: React.FC<BioLabCardProps> = ({ hasPhysicalKit }) => {
    const [ketoneMethod, setKetoneMethod] = useState<KetoneMethod>('urine');
    const [isScanning, setIsScanning] = useState(false);
    const [scanningMetricId, setScanningMetricId] = useState<string | null>(null);
    const [scanProgress, setScanProgress] = useState(0);
    const [editingMetric, setEditingMetric] = useState<any | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Vital Signs (General)
    const [bpValue, setBpValue] = useState('12/8');
    const [hrValue, setHrValue] = useState('72');
    const [tempValue, setTempValue] = useState('36.6');

    // Blood Markers
    const [bloodMarkers, setBloodMarkers] = useState<Biomarker[]>([
        { id: 'glu', name: 'Glicemia (Açúcar no Sangue)', value: '92', unit: 'mg/dL', status: 'Ideal', statusColor: 'text-green-400', icon: Droplet, color: 'text-red-500' },
        { id: 'ket_blood', name: 'Cetona no Sangue', value: '1.2', unit: 'mmol/L', status: 'Normal', statusColor: 'text-blue-400', icon: FlaskConical, color: 'text-indigo-400' },
    ]);

    // Breath Markers
    const [breathMarkers, setBreathMarkers] = useState<Biomarker[]>([
        { id: 'ket_breath', name: 'Cetona no Hálito', value: '25', unit: 'ACEs', status: 'Ideal', statusColor: 'text-green-400', icon: Wind, color: 'text-cyan-400' },
    ]);

    // 10-Parameter Urine Strip
    const urineParameters = [
        { id: 'uket', name: 'Cetona (Queima de Gordura)', unit: 'mg/dL', colors: ['#e5e7eb', '#fecaca', '#f87171', '#dc2626', '#991b1b'], current: 1 },
        { id: 'uglu', name: 'Glicose na Urina', unit: 'mg/dL', colors: ['#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e'], current: 0 },
        { id: 'uph', name: 'pH (Equilíbrio Ácido)', unit: '', colors: ['#fef3c7', '#fde68a', '#facc15', '#eab308', '#ca8a04'], current: 2 },
        { id: 'uleu', name: 'Leucócitos (Imunidade)', unit: 'leu/uL', colors: ['#fdf2f8', '#fbcfe8', '#f472b6', '#db2777', '#9d174d'], current: 0 },
        { id: 'upro', name: 'Proteína', unit: 'mg/dL', colors: ['#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#4b5563'], current: 0 },
    ];

    const [urineData, setUrineData] = useState(urineParameters);

    const handleOCRRequest = (metricId: string) => {
        setScanningMetricId(metricId);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && scanningMetricId) {
            startOCRScan(scanningMetricId);
        }
    };

    const startOCRScan = (metricId: string) => {
        setIsScanning(true);
        setScanProgress(0);
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsScanning(false);
                    setScanningMetricId(null);
                    // Simulating data update
                    if (metricId.startsWith('u')) {
                        setUrineData(prev => prev.map(p => p.id === metricId ? { ...p, current: Math.floor(Math.random() * p.colors.length) } : p));
                    } else if (metricId === 'bp_monitor') {
                        setBpValue('12/8');
                        setHrValue(Math.floor(70 + Math.random() * 10).toString());
                    } else if (metricId === 'temp') {
                        setTempValue((36.5 + Math.random() * 0.5).toFixed(1));
                    } else if (metricId === 'glu' || metricId === 'ket_blood') {
                        setBloodMarkers(prev => prev.map(m => m.id === metricId ? { ...m, value: (parseFloat(m.value) + (Math.random() * 2 - 1)).toFixed(1) } : m));
                    } else {
                        setBreathMarkers(prev => prev.map(m => m.id === metricId ? { ...m, value: (parseFloat(m.value) + (Math.random() * 2 - 1)).toFixed(1) } : m));
                    }
                    return 100;
                }
                return prev + 10;
            });
        }, 150);
    };

    const scanStyles = `
        @keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
        .animate-scan { animation: scan 2s linear infinite; }
    `;

    const MetricCard = ({ metric, onManual, onOCR }: { metric: Biomarker, onManual: (m: any) => void, onOCR: (id: string) => void }) => {
        const Icon = metric.icon;
        return (
            <div className="bg-gray-800 border-2 border-transparent hover:border-blue-500/30 p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden group transition-all duration-500 shadow-xl w-full">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest">{metric.name}</p>
                            <h3 className="text-2xl md:text-3xl font-black text-white mt-1">
                                {metric.value} <span className="text-xs md:text-sm text-gray-600 font-medium">{metric.unit}</span>
                            </h3>
                            <p className={`text-[9px] md:text-[10px] ${metric.statusColor} font-black mt-2 uppercase flex items-center gap-1`}>
                                <CheckCircle className="w-3 h-3" /> {metric.status}
                            </p>
                        </div>
                        <div className={`p-3 md:p-4 rounded-2xl md:rounded-3xl bg-gray-950 border border-gray-800 ${metric.color}`}>
                            <Icon className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                    </div>

                    <div className="flex gap-2 mt-6 pt-6 border-t border-gray-700/50">
                        <button onClick={() => onManual(metric)} className="flex-1 bg-gray-900/80 hover:bg-gray-700 text-gray-300 py-3 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] font-black uppercase flex items-center justify-center gap-2 transition-all border border-gray-700/50">
                            <Edit2 className="w-3 h-3" /> Manual
                        </button>
                        <button onClick={() => onOCR(metric.id)} className="flex-1 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white py-3 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] font-black uppercase flex items-center justify-center gap-2 transition-all border border-green-500/20">
                            <Scan className="w-3 h-3" /> OCR SCAN
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-20 px-1 md:px-0">
            <style>{scanStyles}</style>

            <div className="lg:col-span-2 space-y-8 md:space-y-10">
                {/* Section Vitals */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-6 md:h-8 w-1.5 bg-blue-500 rounded-full"></div>
                        <h2 className="text-lg md:text-xl font-black text-white uppercase italic tracking-widest">Sinais Vitais</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {/* Unified BP & HR Card */}
                        <div className="bg-gray-800 border-2 border-transparent hover:border-blue-500/30 p-6 md:p-7 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden group transition-all duration-500 shadow-xl w-full">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6 md:mb-8">
                                    <div className="flex-1">
                                        <p className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest">Monitor de Pressão</p>
                                        <h3 className="text-3xl md:text-4xl font-black text-white mt-1">
                                            {bpValue} <span className="text-xs md:text-sm text-gray-600 font-medium">mmHg</span>
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-4">
                                            <div className="flex items-center gap-2">
                                                <Heart className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                                                <span className="text-lg md:text-xl font-black text-white">{hrValue} <span className="text-[8px] md:text-[9px] text-gray-600 font-medium uppercase">bpm</span></span>
                                            </div>
                                            <p className="text-[9px] md:text-[10px] text-green-400 font-black uppercase flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Ideal
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-gray-950 border border-gray-800 text-blue-500 shrink-0">
                                        <Activity className="w-7 h-7 md:w-9 md:h-9" />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-6 pt-6 border-t border-gray-700/50">
                                    <button onClick={() => setEditingMetric({ id: 'bp_monitor', name: 'Monitor de Pressão', value: bpValue, unit: 'mmHg' })} className="flex-1 bg-gray-900/80 hover:bg-gray-700 text-gray-300 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] font-black uppercase flex items-center justify-center gap-2 transition-all border border-gray-700/50">
                                        <Edit2 className="w-3 h-3" /> Manual
                                    </button>
                                    <button onClick={() => handleOCRRequest('bp_monitor')} className="flex-1 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white py-3.5 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] font-black uppercase flex items-center justify-center gap-2 transition-all border border-green-500/20">
                                        <Scan className="w-3 h-3" /> OCR SCAN
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Temperature Card */}
                        <MetricCard
                            metric={{ id: 'temp', name: 'Temperatura Corporal', value: tempValue, unit: '°C', status: 'Ideal', statusColor: 'text-green-400', icon: Thermometer, color: 'text-orange-400' }}
                            onManual={setEditingMetric}
                            onOCR={handleOCRRequest}
                        />
                    </div>
                </section>

                {/* Standalone Selector Bar - Standalone Box */}
                <div className="bg-gray-800 p-2 rounded-[1.5rem] md:rounded-[2rem] flex flex-col gap-2 border border-blue-500/10 shadow-2xl relative z-20">
                    <div className="px-4 md:px-6 py-2 md:py-3 flex items-center gap-3 border-b md:border-b-0 md:border-r border-gray-700/50 md:mr-2">
                        <Zap className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-widest whitespace-nowrap">Opções de Medição de Cetose:</span>
                    </div>
                    <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 flex-1 w-full">
                        {[
                            { id: 'urine', name: 'Urina', icon: TestTube, color: 'bg-green-500' },
                            { id: 'blood', name: 'Sangue', icon: Droplet, color: 'bg-red-500' },
                            { id: 'breath', name: 'Hálito', icon: Wind, color: 'bg-cyan-500' }
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setKetoneMethod(method.id as KetoneMethod)}
                                className={`flex-1 py-3 md:py-4 px-4 md:px-6 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 transition-all ${ketoneMethod === method.id ? `${method.color} text-white font-black shadow-lg scale-102` : 'bg-gray-950 text-gray-600 hover:text-gray-400'}`}
                            >
                                <method.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest">{method.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cetose Results Area */}
                <section>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={ketoneMethod}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            {ketoneMethod === 'urine' && (
                                <div className="bg-gray-800 border-2 border-green-500/5 rounded-[2rem] md:rounded-[3rem] p-5 md:p-10 relative overflow-hidden shadow-2xl">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 md:mb-12 relative z-10">
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-black uppercase italic text-white mb-1 flex items-center gap-3">
                                                <TestTube className="w-6 h-6 md:w-8 md:h-8 text-green-400" /> Exame de Urina em Casa
                                            </h3>
                                            <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest">Painel de Analitos e Reagentes (Fita 10P)</p>
                                        </div>
                                        <div className="bg-green-500 p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-lg shadow-green-500/20 self-end sm:self-auto">
                                            <Stethoscope className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        {urineData.map((param, i) => (
                                            <div key={param.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-gray-950/60 rounded-3xl border border-gray-800 hover:border-green-500/20 transition-all">
                                                <div className="min-w-[150px] md:min-w-[180px] text-center md:text-left">
                                                    <span className="text-[9px] md:text-[10px] text-gray-600 font-black uppercase tracking-tighter">{param.name}</span>
                                                    <p className="text-base md:text-lg font-black text-white mt-0.5">{param.unit || 'Visual'}</p>
                                                </div>

                                                <div className="flex gap-3 items-center justify-center flex-1 overflow-x-auto no-scrollbar py-4 px-6">
                                                    {param.colors.map((color, colorIdx) => (
                                                        <button
                                                            key={colorIdx}
                                                            onClick={() => {
                                                                const newData = [...urineData];
                                                                newData[i].current = colorIdx;
                                                                setUrineData(newData);
                                                            }}
                                                            className={`w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl transition-all duration-300 relative shrink-0 ${param.current === colorIdx ? 'scale-110 ring-2 ring-white ring-offset-4 ring-offset-gray-900 z-10' : 'opacity-25 hover:opacity-100 grayscale-[40%]'}`}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>

                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => handleOCRRequest(param.id)}
                                                        className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 hover:bg-green-500 hover:text-white transition-all flex items-center gap-2 text-[8px] md:text-[9px] font-black uppercase whitespace-nowrap"
                                                    >
                                                        <Scan className="w-3.5 h-3.5" /> OCR SCAN
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(ketoneMethod === 'blood' || ketoneMethod === 'breath') && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    {(ketoneMethod === 'blood' ? bloodMarkers : breathMarkers).map(metric => (
                                        <MetricCard
                                            key={metric.id}
                                            metric={metric}
                                            onManual={setEditingMetric}
                                            onOCR={handleOCRRequest}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </section>
            </div>

            {/* Sidebar - Mobile Responsive Stack */}
            <div className="space-y-6 lg:mt-0 mt-6">
                <div className="bg-gradient-to-br from-indigo-950/40 to-blue-900/40 border-2 border-blue-500/20 p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden group shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                        <h4 className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-3">
                            <Zap className="w-4 h-4" /> Lab AI Insight
                        </h4>
                        <div className="bg-blue-500 p-2.5 md:p-3 rounded-xl md:rounded-2xl shrink-0">
                            <Microscope className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-sm md:text-base text-white/90 leading-relaxed mb-6 md:mb-8 italic font-medium">
                        {ketoneMethod === 'urine' ? '"Suas fitas indicam que você entrou em cetose há 14 horas. Mantenha a hidratação."' :
                            ketoneMethod === 'blood' ? '"Sua glicemia está estável após o exercício. Eficiência metabólica nota 10."' :
                                '"Cetonas no hálito indicam que seu cérebro está usando gordura como combustível principal agora."'}
                    </p>
                    <div className="bg-white/5 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gray-900 flex items-center justify-center border border-gray-800 shrink-0">
                                <Activity className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                            </div>
                            <div>
                                <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">Estado Metabólico</span>
                                <p className="text-xs md:text-sm text-white font-black uppercase">Autofagia Ativa</p>
                            </div>
                        </div>
                        <div className="h-2 md:h-2.5 bg-gray-950 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.6)]" initial={{ width: 0 }} animate={{ width: '85%' }} />
                        </div>
                        <p className="text-[9px] md:text-[10px] text-gray-500 mt-2.5 text-right font-black">PROGRESSO: 85%</p>
                    </div>
                </div>

                <div className="bg-gray-800 border border-gray-700/50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem]">
                    <h4 className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase mb-6 tracking-widest">Sensores Nexus Sync</h4>
                    <div className="space-y-3 md:space-y-4">
                        {[
                            { name: 'Oura Heritage 3', icon: Heart, status: 'Conectado', color: 'text-pink-500' },
                            { name: 'Sensor Nexus S1', icon: Droplet, status: 'Ativo', color: 'text-red-500' },
                            { name: 'Breathalyzer Pro', icon: Wind, status: 'Sincronizado', color: 'text-cyan-400' }
                        ].map((dev, i) => (
                            <div key={i} className="flex items-center justify-between p-3.5 md:p-4 bg-gray-950/50 rounded-xl md:rounded-2xl border border-gray-800 group hover:border-blue-500/30 transition-all">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className={`p-2.5 md:p-3 bg-gray-900 rounded-lg md:rounded-xl group-hover:scale-110 transition-transform ${dev.color}`}>
                                        <dev.icon className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <span className="text-[10px] md:text-[11px] text-white font-black uppercase tracking-tighter">{dev.name}</span>
                                </div>
                                <div className="w-2 md:w-2.5 h-2 md:h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <Button className="w-full !bg-blue-600 !text-white font-black uppercase py-5 md:py-6 rounded-2xl md:rounded-[2.5rem] shadow-3xl shadow-blue-900/40 hover:scale-102 transition-transform text-[9px] md:text-xs tracking-widest">
                    GERAR LAUDO COMPLETO
                </Button>
            </div>

            {/* Mobile-Friendly Full Screen OCR SCAN - Fixed Z-Index */}
            <AnimatePresence>
                {isScanning && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
                        <div className="w-full max-w-sm text-center">
                            <div className="relative aspect-square bg-gray-900 rounded-[3rem] md:rounded-[4rem] border-2 border-blue-500/40 overflow-hidden mb-8 md:mb-10 shadow-3xl shadow-blue-500/20 mx-4">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Scan className="w-24 md:w-40 h-24 md:h-40 text-blue-500/10" />
                                </div>
                                <div className="absolute top-0 left-0 w-full h-1 md:h-1.5 bg-blue-500 shadow-[0_0_40px_rgb(59,130,246)] animate-scan"></div>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic mb-2 md:mb-3 tracking-widest px-2 leading-tight">Analisando Medição</h2>
                            <p className="text-blue-400 font-bold uppercase text-[10px] md:text-xs tracking-widest animate-pulse mb-8 md:mb-10">Processando via Nexus OCR Vision...</p>
                            <div className="w-full h-2.5 md:h-3 bg-gray-800 rounded-full overflow-hidden max-w-[240px] md:max-w-xs mx-auto">
                                <motion.div className="h-full bg-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.6)]" initial={{ width: 0 }} animate={{ width: `${scanProgress}%` }} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

            {/* Touch-First Manual Modal */}
            <AnimatePresence>
                {editingMetric && (
                    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingMetric(null)} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="bg-gray-800 border-t-2 sm:border-2 border-blue-500/30 p-8 md:p-12 rounded-t-[2.5rem] sm:rounded-[4rem] w-full max-w-xl relative z-10 shadow-3xl">
                            <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-8 sm:hidden"></div>
                            <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic mb-2 text-center sm:text-left">Lançamento Manual</h3>
                            <p className="text-[10px] md:text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-8 md:mb-10 text-center sm:text-left">{editingMetric.name} ({editingMetric.unit})</p>
                            <div className="space-y-6 md:space-y-8">
                                <input autoFocus type="text" defaultValue={editingMetric.value} className="w-full bg-black border-2 border-gray-700 rounded-2xl md:rounded-3xl p-6 md:p-8 text-4xl md:text-6xl font-black text-white focus:border-blue-500 outline-none transition-colors text-center" />
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <Button onClick={() => setEditingMetric(null)} className="w-full sm:flex-1 !bg-blue-600 !text-white font-black uppercase py-4 md:py-5 rounded-xl md:rounded-[2rem] text-xs md:text-sm order-2 sm:order-1">Salvar Dados</Button>
                                    <button onClick={() => setEditingMetric(null)} className="w-full sm:w-auto p-4 md:p-5 bg-gray-900 text-gray-500 rounded-xl md:rounded-[2rem] border border-gray-700 hover:text-white transition-colors flex justify-center order-1 sm:order-2"><XCircle className="w-6 h-6 md:w-8 md:h-8" /></button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
