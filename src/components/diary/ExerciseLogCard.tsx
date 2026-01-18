import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dumbbell, Timer, Trophy, Sparkles,
    Trash2, Edit2, Plus, Check, Scan,
    Search, ChevronRight, Activity, Zap,
    Target, Clock, ArrowRight, Bluetooth,
    ArrowUpRight, Monitor
} from "../Icons";
import Button from "../Button";

// Missing icons for specific sports - using placeholders or generic ones
const Sword = Trophy;
const Bike = Activity;
const Waves = Activity;
const Music = Activity;

const LoadingSpinner = ({ className }: { className?: string }) => (
    <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={className}
    >
        <Zap className="w-full h-full" />
    </motion.div>
);

type ExerciseCategory = "strength" | "cardio" | "sports" | "wellness";

interface ExerciseLog {
    id: string;
    category: ExerciseCategory;
    activity: string;
    timestamp: Date;
    metrics: Record<string, any>;
}

export const ExerciseLogCard: React.FC = () => {
    const [category, setCategory] = useState<ExerciseCategory>("strength");
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");
    const [selectedMuscle, setSelectedMuscle] = useState<string>("");
    const [selectedCardio, setSelectedCardio] = useState<string>("Corrida");
    const [selectedCardioVariant, setSelectedCardioVariant] = useState<string>("");
    const [selectedActivity, setSelectedActivity] = useState<string>("");
    const [selectedActivityVariant, setSelectedActivityVariant] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Universal Session Metrics
    const [intensity, setIntensity] = useState<string>("Moderado");
    // Reuse duration for all categories

    // Swimming specific states
    const [poolSize, setPoolSize] = useState<string>("25");
    const [currentIntensity, setCurrentIntensity] = useState<string>("Normal");

    // Cardio metrics states
    const [distance, setDistance] = useState<string>("");
    const [duration, setDuration] = useState<string>("");
    const [pace, setPace] = useState<string>("0:00");
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleOCRClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsScanning(true);
            // Simulate AI analysis time after photo upload
            setTimeout(() => {
                if (selectedCardio.includes("Natação")) {
                    setDistance("800");
                    setDuration("15:45");
                    setPace("1:58");
                } else {
                    setDistance("5.42");
                    setDuration("32:10");
                    setPace("5:56");
                }
                setIsScanning(false);
            }, 3000);
        }
    };

    const cardioConfig: Record<string, { unit: string; placeholder: string; variants: string[]; extraFields?: string[] }> = {
        "Corrida": { unit: "km", placeholder: "5.2", variants: ["Rua", "Esteira", "Trilha"] },
        "Ciclismo": { unit: "km", placeholder: "20.0", variants: ["Estrada", "MTB", "Rolo/Indoor"] },
        "Natação": { unit: "metros", placeholder: "800", variants: ["Piscina", "Mar / Aberto"], extraFields: ["pool", "current"] },
        "Remo": { unit: "metros", placeholder: "2000", variants: ["Indoor", "Água"] },
        "Caminhada": { unit: "km", placeholder: "3.5", variants: ["Rua", "Trilha", "Esteira", "Pista"] }
    };

    const sportsConfig: Record<string, string[]> = {
        "Dança de Salão": ["Samba", "Salsa", "Forró", "Bolero", "Valsa", "Bachata", "Zouk", "Tango"],
        "Artes Marciais": ["BJJ (Jiu-Jitsu)", "Muay Thai", "Boxe", "Judô", "Karatê", "Krav Maga", "Capoeira", "MMA", "Taekwondo"],
        "Tênis": ["Saibro", "Quadra Rápida", "Grama", "Simples", "Duplas"],
        "Ballet": ["Clássico", "Contemporâneo", "Barra", "Jazz", "Sapateado"],
        "Futebol": ["Campo (11)", "Society (7)", "Futsal", "Areia", "Altinha"],
        "Vôlei": ["Quadra", "Areia", "Futvôlei"],
        "Basquete": ["Quadra (5x5)", "3x3", "Street", "21"],
        "Hipismo": ["Salto", "Adestramento", "Vaquejada", "Laço Comprido", "Três Tambores", "Polo", "Enduro", "Volteio", "Rédeas", "Mangalarga (Marcha)"],
        "Tiro Esportivo": ["Pistola 10m", "Fuzil", "Carabina", "Trap / Prato", "IPSC", "Precisão"],
        "Airsoft": ["Milsim", "Speedsoft", "CQB", "Sniper", "Reencenação"],
        "Crossfit": ["WOD", "LPO", "Gymnastics", "Endurance", "Murph"],
        "Surfe": ["Shortboard", "Longboard", "Stand Up Paddle", "Bodyboard", "Tow-in", "Kitesurf"],
        "Skate": ["Street", "Park", "Bowl", "Vertical", "Downhill", "Longboard"],
        "Caça": ["Aproximação", "Espera", "Batida", "Arco e Flecha", "Cetraria"],
        "Pesca": ["Esportiva (Pesque e Solte)", "Subaquática (Apneia)", "Embarcada", "Barranco", "Fly Fishing"],
        "Artes": ["Pintura", "Escultura", "Teatro", "Música (Instrumento)", "Canto"]
    };

    const categories = [
        { id: "strength", label: "Musculação", icon: Dumbbell, color: "text-orange-500", bg: "bg-orange-500/10" },
        { id: "cardio", label: "Cardio", icon: Timer, color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "sports", label: "Esportes", icon: Trophy, color: "text-purple-500", bg: "bg-purple-500/10" },
        { id: "wellness", label: "Bem-Estar", icon: Target, color: "text-green-500", bg: "bg-green-500/10" }
    ];

    const muscleGroups = {
        "Peito": ["Peitoral Maior", "Peitoral Menor", "Serrátil"],
        "Costas": ["Latíssimo do Dorso", "Trapézio", "Romboides", "Lombar"],
        "Pernas": ["Quadríceps", "Posteriores", "Glúteos", "Panturrilhas"],
        "Ombros": ["Deltoide Anterior", "Deltoide Lateral", "Deltoide Posterior"],
        "Braços": ["Bíceps", "Tríceps", "Antebraço"],
        "Core": ["Reto Abdominal", "Oblíquos", "Transverso"]
    };

    const equipments = ["Barra", "Halter", "Máquina", "Cabo", "Peso do Corpo", "Kettlebell"];

    const sportsList = [
        "Hipismo", "Esgrima", "Golfe", "Tênis", "Futevôlei", "Beach Tennis",
        "Vôlei", "Basquete", "Futebol", "Dança de Salão", "Ballet", "Artes Marciais",
        "Tiro Esportivo", "Airsoft", "Paintball", "Tiro com Arco", "Crossfit", "Funcional",
        "Padel", "Squash", "Rugby", "Surfe", "Skate", "Escalada", "Parkour",
        "Triatlo", "Ironman", "Maratona", "Powerlifting", "Cross-Training",
        "Caça", "Pesca"
    ].sort();

    const wellnessList = [
        "Yoga", "Calistenia", "Fisioterapia", "Meditação Ativa", "Xadrez / Dama",
        "Tai Chi Chuan", "Pilates", "Alongamento", "Sauna (Recovery)", "Banheira de Gelo",
        "Quiropraxia", "Massagem Desportiva", "Respiração Guiada", "Leitura Focada"
    ].sort();

    const filteredItems = (category === "sports" ? sportsList : wellnessList).filter(item =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Category Selector */}
            <div className="flex bg-gray-900/50 p-1.5 rounded-2xl border border-gray-800 shadow-inner overflow-x-auto no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id as ExerciseCategory)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] transition-all whitespace-nowrap ${category === cat.id ? `${cat.bg} ${cat.color} shadow-lg shadow-black/20` : "text-gray-500 hover:text-white"}`}
                    >
                        <cat.icon className="w-4 h-4" /> {cat.label}
                    </button>
                ))}
            </div>

            <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            {category === "strength" && <Dumbbell className="w-32 h-32 text-orange-500" />}
                            {category === "cardio" && <Timer className="w-32 h-32 text-blue-500" />}
                            {category === "sports" && <Trophy className="w-32 h-32 text-purple-500" />}
                            {category === "wellness" && <Target className="w-32 h-32 text-green-500" />}
                        </div>

                        <div className="relative z-10 space-y-8">
                            {category === "strength" && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Grupo Muscular</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.keys(muscleGroups).map(group => (
                                                    <button
                                                        key={group}
                                                        onClick={() => {
                                                            setSelectedMuscleGroup(group);
                                                            setSelectedMuscle("");
                                                        }}
                                                        className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${selectedMuscleGroup === group ? "bg-orange-500 border-orange-400 text-black shadow-lg shadow-orange-900/40" : "bg-gray-900 border-gray-700 text-gray-400 hover:border-orange-500/50"}`}
                                                    >
                                                        {group}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {selectedMuscleGroup && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-3"
                                                >
                                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Músculo Alvo</label>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {(muscleGroups as any)[selectedMuscleGroup].map((muscle: string) => (
                                                            <button
                                                                key={muscle}
                                                                onClick={() => setSelectedMuscle(muscle)}
                                                                className={`py-3 px-4 rounded-xl text-xs font-bold text-left transition-all border ${selectedMuscle === muscle ? "bg-white border-white text-black" : "bg-gray-950/50 border-gray-800 text-gray-500 hover:border-orange-500/30"}`}
                                                            >
                                                                {muscle}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase text-gray-600 block">Equipamento</label>
                                            <select className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-orange-500/50">
                                                {equipments.map(e => <option key={e}>{e}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase text-gray-600 block">Carga (kg)</label>
                                            <input type="number" placeholder="0" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-lg font-black text-white outline-none focus:border-orange-500/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase text-gray-600 block">Séries</label>
                                            <input type="number" placeholder="4" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-lg font-black text-white outline-none focus:border-orange-500/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase text-gray-600 block">Reps</label>
                                            <input type="number" placeholder="12" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-lg font-black text-white outline-none focus:border-orange-500/50" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {category === "cardio" && (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Atividade</label>
                                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                            {Object.keys(cardioConfig).map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => {
                                                        setSelectedCardio(type);
                                                        setSelectedCardioVariant("");
                                                    }}
                                                    className={`px-5 py-3 border rounded-xl font-black text-[10px] uppercase whitespace-nowrap transition-all ${selectedCardio === type ? "bg-blue-500 border-blue-400 text-white shadow-lg" : "bg-gray-900 border-gray-800 text-gray-500 hover:text-white"}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {selectedCardio && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-4"
                                            >
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Variante / Ambiente</label>
                                                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                                    {cardioConfig[selectedCardio].variants.map(variant => (
                                                        <button
                                                            key={variant}
                                                            onClick={() => setSelectedCardioVariant(variant)}
                                                            className={`px-5 py-3 border rounded-xl font-black text-[10px] uppercase whitespace-nowrap transition-all ${selectedCardioVariant === variant ? "bg-white border-white text-black" : "bg-gray-950/50 border-gray-800 text-gray-500 hover:border-blue-500/30"}`}
                                                        >
                                                            {variant}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-gray-950/50 border border-gray-800 p-6 rounded-3xl space-y-4 relative overflow-hidden">
                                            {isScanning && (
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: "100%" }}
                                                    className="absolute top-0 left-0 right-0 bg-blue-500/10 z-0"
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                />
                                            )}
                                            <div className="flex justify-between items-center relative z-10">
                                                <label className="text-[10px] font-black uppercase text-gray-500">Distância</label>
                                                <button
                                                    onClick={handleOCRClick}
                                                    disabled={isScanning}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest ${isScanning ? "bg-blue-500 text-white animate-pulse" : "bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white"}`}
                                                >
                                                    {isScanning ? <LoadingSpinner className="w-3.5 h-3.5" /> : <Scan className="w-3.5 h-3.5" />}
                                                    OCR SCAN
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    accept="image/*"
                                                    capture="environment"
                                                />
                                            </div>
                                            <div className="flex items-baseline gap-2 relative z-10">
                                                <input
                                                    type="number"
                                                    value={distance}
                                                    onChange={(e) => setDistance(e.target.value)}
                                                    placeholder={cardioConfig[selectedCardio]?.placeholder || "5.2"}
                                                    className="bg-transparent text-4xl font-black text-white outline-none w-full"
                                                />
                                                <span className="text-gray-600 font-bold uppercase text-xs tracking-tighter">
                                                    {cardioConfig[selectedCardio]?.unit || "km"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Dynamic Extra Fields - Granular Control */}
                                        {selectedCardio === "Natação" && selectedCardioVariant === "Piscina" && (
                                            <div className="bg-gray-950/50 border border-gray-800 p-6 rounded-3xl space-y-4">
                                                <label className="text-[10px] font-black uppercase text-gray-500">Tamanho da Piscina</label>
                                                <div className="flex items-baseline gap-2">
                                                    <select
                                                        value={poolSize}
                                                        onChange={(e) => setPoolSize(e.target.value)}
                                                        className="bg-transparent text-3xl font-black text-white outline-none w-full appearance-none cursor-pointer"
                                                    >
                                                        <option value="25" className="bg-gray-900">25m</option>
                                                        <option value="50" className="bg-gray-900">50m</option>
                                                        <option value="custom" className="bg-gray-900">Custom</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {((selectedCardio === "Natação" && selectedCardioVariant === "Mar / Aberto") ||
                                            (selectedCardio === "Remo" && selectedCardioVariant === "Água")) && (
                                                <div className="bg-gray-950/50 border border-gray-800 p-6 rounded-3xl space-y-4">
                                                    <label className="text-[10px] font-black uppercase text-gray-500">Intensidade da Correnteza</label>
                                                    <div className="flex items-baseline gap-2">
                                                        <select
                                                            value={currentIntensity}
                                                            onChange={(e) => setCurrentIntensity(e.target.value)}
                                                            className="bg-transparent text-2xl font-black text-white outline-none w-full appearance-none cursor-pointer"
                                                        >
                                                            <option value="Fraca" className="bg-gray-900 text-green-400">Fraca (Léve)</option>
                                                            <option value="Normal" className="bg-gray-900 text-blue-400">Normal</option>
                                                            <option value="Forte" className="bg-gray-900 text-orange-400">Forte (Elite)</option>
                                                            <option value="Extrema" className="bg-gray-900 text-red-500">Extrema (Pro)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        <div className="bg-gray-950/50 border border-gray-800 p-6 rounded-3xl space-y-4 relative overflow-hidden">
                                            {isScanning && (
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: "100%" }}
                                                    className="absolute top-0 left-0 right-0 bg-blue-500/10 z-0"
                                                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                                                />
                                            )}
                                            <label className="text-[10px] font-black uppercase text-gray-500 relative z-10">Duração</label>
                                            <div className="flex items-baseline gap-2 relative z-10">
                                                <input
                                                    type="text"
                                                    value={duration}
                                                    onChange={(e) => setDuration(e.target.value)}
                                                    placeholder="30:00"
                                                    className="bg-transparent text-4xl font-black text-white outline-none w-full"
                                                />
                                                <span className="text-gray-600 font-bold uppercase text-xs tracking-tighter">min</span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-950/50 border border-gray-800 p-6 rounded-3xl space-y-4 relative overflow-hidden">
                                            <label className="text-[10px] font-black uppercase text-gray-500 relative z-10">Pace Médio</label>
                                            <div className="flex items-baseline gap-2 relative z-10">
                                                <span className="text-3xl font-black text-white">{pace}</span>
                                                <span className="text-gray-600 font-bold uppercase text-xs tracking-tighter">
                                                    {cardioConfig[selectedCardio]?.unit === "metros" ? "min/100m" : "min/km"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-gradient-to-r from-blue-900/20 to-transparent border-l-4 border-blue-500 rounded-r-2xl flex items-center gap-4">
                                        <div className="p-3 bg-blue-500/10 rounded-xl"><Monitor className="w-6 h-6 text-blue-400" /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Conectar Dispositivo</p>
                                            <p className="text-xs text-gray-400">Escaneando Apple Watch e Garmin via Bluetooth...</p>
                                        </div>
                                        <Button className="ml-auto !bg-blue-500 !text-white text-[10px] px-4 py-2">Buscar</Button>
                                    </div>
                                </div>
                            )}

                            {(category === "sports" || category === "wellness") && (
                                <div className="space-y-8">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                        <input
                                            type="text"
                                            placeholder="Buscar esporte ou atividade (ex: Tiro, Airsoft, Yoga...)"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-brand-primary text-white"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                                        {filteredItems.map(item => (
                                            <button
                                                key={item}
                                                onClick={() => {
                                                    setSelectedActivity(item);
                                                    setSelectedActivityVariant("");
                                                }}
                                                className={`p-4 border rounded-2xl transition-all text-center ${selectedActivity === item ? "bg-purple-500 border-purple-400 text-white shadow-lg" : "bg-gray-950 border-gray-800 text-gray-400 hover:border-brand-primary/50"}`}
                                            >
                                                <div className={`text-sm font-bold mb-1 ${selectedActivity === item ? "text-white" : "text-gray-300"}`}>{item}</div>
                                                <div className="text-[8px] font-black uppercase text-gray-600">
                                                    {selectedActivity === item ? "Selecionado" : "Selecionar"}
                                                </div>
                                            </button>
                                        ))}
                                        {filteredItems.length === 0 && (
                                            <div className="col-span-full border-2 border-dashed border-gray-800 p-8 rounded-3xl text-center">
                                                <p className="text-gray-500 text-sm mb-4">Atividade não encontrada...</p>
                                                <Button className="!bg-gray-800 !text-white text-xs px-6">
                                                    Sugerir ao Nexus
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <AnimatePresence>
                                        {selectedActivity && sportsConfig[selectedActivity] && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-4 p-6 bg-purple-500/5 border border-purple-500/20 rounded-3xl"
                                            >
                                                <label className="text-[10px] font-black uppercase text-purple-400 tracking-widest px-1">Estilo / Sub-tipo</label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                                    {sportsConfig[selectedActivity].map(style => (
                                                        <button
                                                            key={style}
                                                            onClick={() => setSelectedActivityVariant(style)}
                                                            className={`p-3 rounded-xl text-[10px] font-bold transition-all border ${selectedActivityVariant === style ? "bg-white border-white text-black" : "bg-gray-950 border-gray-800 text-gray-500 hover:border-purple-500/50"}`}
                                                        >
                                                            {style}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Universal Session Details for Sports */}
                                    <AnimatePresence>
                                        {selectedActivity && (selectedActivityVariant || !sportsConfig[selectedActivity]) && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4"
                                            >
                                                <div className="bg-gray-950/50 border border-gray-800 p-6 rounded-3xl space-y-4">
                                                    <label className="text-[10px] font-black uppercase text-gray-500">Tempo de Prática</label>
                                                    <div className="flex items-baseline gap-2">
                                                        <input
                                                            type="text"
                                                            value={duration}
                                                            onChange={(e) => setDuration(e.target.value)}
                                                            placeholder="60:00"
                                                            className="bg-transparent text-4xl font-black text-white outline-none w-full"
                                                        />
                                                        <span className="text-gray-600 font-bold uppercase text-xs tracking-tighter">minutos</span>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-950/50 border border-gray-800 p-6 rounded-3xl space-y-4">
                                                    <label className="text-[10px] font-black uppercase text-gray-500">Intensidade (Percepção)</label>
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        {["Leve", "Moderado", "Intenso", "Exaustivo"].map(level => (
                                                            <button
                                                                key={level}
                                                                onClick={() => setIntensity(level)}
                                                                className={`py-2 rounded-lg text-[10px] font-black uppercase transition-all border ${intensity === level ? "bg-white border-white text-black" : "bg-transparent border-gray-800 text-gray-500 hover:border-gray-600"}`}
                                                            >
                                                                {level}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            <Button className={`w-full py-5 font-black uppercase tracking-widest text-sm shadow-xl ${category === "strength" ? "!bg-orange-500" : category === "cardio" ? "!bg-blue-500" : "!bg-brand-primary"} text-black`}>
                                Registrar Atividade
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Info & Insights Column */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-lg"><Sparkles className="w-5 h-5 text-indigo-300" /></div>
                                <h4 className="font-black uppercase italic text-sm text-white">Nexus Coach</h4>
                            </div>
                            <p className="text-sm text-gray-200 leading-relaxed">
                                "Percebi que seu nível de procrastinação cai 40% quando você inicia o dia com 20 min de cardio. Que tal uma corrida leve hoje?"
                            </p>
                            <div className="pt-4 border-t border-white/10">
                                <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest mb-2">Sugestão de Hoje</p>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                                    <span className="text-xs font-bold">Dança de Salão (Imersão)</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/40 border border-gray-700/50 p-8 rounded-[2.5rem] space-y-6">
                        <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Histórico Recente</h4>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-gray-950/40 rounded-2xl border border-gray-800/50">
                                    <div className={`p-3 rounded-xl ${i === 1 ? "bg-orange-500/10 text-orange-400" : "bg-blue-500/10 text-blue-400"}`}>
                                        {i === 1 ? <Dumbbell className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white">{i === 1 ? "Musculação" : "Corrida de Rua"}</p>
                                        <p className="text-[10px] text-gray-500">{i === 1 ? "Peito & Tríceps" : "5.2km em 30min"}</p>
                                    </div>
                                    <ArrowUpRight className="ml-auto w-4 h-4 text-gray-600" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
