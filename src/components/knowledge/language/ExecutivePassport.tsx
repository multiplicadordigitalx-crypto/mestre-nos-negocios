import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Globe, Target, Briefcase, MapPin, Star, Award, ChevronRight, Lock, BookOpen, User, X, CheckCircle, Smartphone, AlertTriangle } from '../../Icons';
import { GraduationCap, Plane, Bot } from '../../Icons';
import Button from '../../Button';
import { useAuth } from '../../../hooks/useAuth';
import { consumeCredits, getToolCosts } from '../../../services/mockFirebase';
import { InsufficientFundsAlert } from './InsufficientFundsAlert';
import { toast } from 'react-hot-toast';

import { StudentPage } from '../../../types';

interface ExecutivePassportProps {
    onBack: () => void;
    onStartMission?: (missionContext: any) => void;
    navigateTo?: (page: StudentPage) => void;
}

type ObjectiveType = 'business' | 'travel' | 'academic' | null;
type Difficulty = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';

interface Region {
    id: string;
    name: string;
    lat: number; // Percentage from top
    lng: number; // Percentage from left
    status: 'locked' | 'unlocked' | 'completed';
    description: string;
    mission: string;
}

export const ExecutivePassport: React.FC<ExecutivePassportProps> = ({ onBack, onStartMission, navigateTo }) => {
    const { user, refreshUser } = useAuth();
    const [objective, setObjective] = useState<ObjectiveType>(null);
    const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
    const [showMissionModal, setShowMissionModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [difficulty, setDifficulty] = useState<Difficulty>('BASIC');
    const [baseCost, setBaseCost] = useState(20);
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);

    // Fetch dynamic base cost
    React.useEffect(() => {
        getToolCosts().then(costs => {
            const tool = costs.find(t => t.toolId === 'executive_mission');
            if (tool) setBaseCost(tool.costPerTask);
        });
    }, []);

    const calculateCost = () => {
        const multipliers: Record<Difficulty, number> = {
            'BASIC': 1.0,
            'INTERMEDIATE': 1.5,
            'ADVANCED': 2.0
        };
        return Math.ceil(baseCost * multipliers[difficulty]);
    };

    const handleStartMission = async () => {
        if (!user) {
            toast.error("Erro: Usuário não identificado.");
            return;
        }
        if (!selectedRegion) return;

        setLoading(true);
        const finalCost = calculateCost();

        try {
            console.log(`[Passport] Consuming ${finalCost} credits for ${selectedRegion.name}`);
            const result = await consumeCredits(user.uid, 'executive_mission', finalCost, `Missão Executiva (${difficulty}): ${selectedRegion.name}`);

            if (result.success) {
                toast.success(`Pagamento confirmado! Iniciando missão.`);
                if (refreshUser) refreshUser();

                // Important: Close modal and update state before switching views
                setShowMissionModal(false);
                setSelectedRegion({ ...selectedRegion, status: 'completed' });

                // Small delay to let modal close animation breathe
                setTimeout(() => {
                    if (onStartMission) {
                        onStartMission({
                            type: 'mission_conversation',
                            region: selectedRegion.name,
                            mission: selectedRegion.mission,
                            description: selectedRegion.description,
                            difficulty: difficulty,
                            cost: finalCost
                        });
                    }
                }, 100);
            } else {
                // Instead of only toast, show the dedicated alert modal
                setShowInsufficientModal(true);
            }
        } catch (error) {
            console.error("[Passport] Start Mission Error:", error);
            toast.error('Erro ao conectar com o servidor de missões.');
        } finally {
            setLoading(false);
        }
    };



    // Mock User Progress
    const userLevel = 5;
    const userXP = 2450;
    const nextLevelXP = 5000;

    // Personalized Data based on Objective
    const regions = useMemo<Region[]>(() => {
        const baseRegions = [
            { id: 'ny', lat: 35, lng: 28, status: 'unlocked' as const },
            { id: 'london', lat: 28, lng: 48, status: 'locked' as const },
            { id: 'sv', lat: 38, lng: 18, status: 'completed' as const },
            { id: 'tokyo', lat: 38, lng: 85, status: 'locked' as const },
            { id: 'dubai', lat: 45, lng: 65, status: 'locked' as const },
        ];

        switch (objective) {
            case 'business':
                return [
                    { ...baseRegions[0], name: 'Wall Street', description: 'O coração financeiro do mundo. Domine termos de mercado, ações e investimentos.', mission: 'Simular uma negociação de fusão.' },
                    { ...baseRegions[1], name: 'The City (London)', description: 'Centro bancário tradicional. Aprenda etiqueta corporativa britânica e direito contratual.', mission: 'Redigir um memorando legal.' },
                    { ...baseRegions[2], name: 'Silicon Valley', description: 'O berço da inovação. Vocabulário de startups, venture capital e tecnologia.', mission: 'Fazer um Pitch Deck em inglês.' },
                    { ...baseRegions[3], name: 'Marunouchi (Tokyo)', description: 'Formalidade executiva asiática. Respeito hierárquico e negociações de longo prazo.', mission: 'Conduzir uma reunião formal.' },
                    { ...baseRegions[4], name: 'DIFC (Dubai)', description: 'Luxo e grandes transações. Imobiliário, petróleo e comércio global.', mission: 'Negociar um contrato de exportação.' },
                ];
            case 'travel':
                return [
                    { ...baseRegions[0], name: 'Nova York', description: 'A cidade que nunca dorme. Turismo urbano, musicais na Broadway e gastronomia.', mission: 'Pedir direções e reservar um show.' },
                    { ...baseRegions[1], name: 'Londres Histórica', description: 'Cultura real e museus. Transporte público e história britânica.', mission: 'Comprar bilhetes de metrô e visitar museus.' },
                    { ...baseRegions[2], name: 'Califórnia Coast', description: 'Road trip e natureza. Vocabulário de viagens, hotéis e lazer.', mission: 'Alugar um carro conversível.' },
                    { ...baseRegions[3], name: 'Tóquio Moderna', description: 'Tradição e modernidade. Culinária local e etiqueta em templos.', mission: 'Fazer um pedido em um Izakaya.' },
                    { ...baseRegions[4], name: 'Dubai Marina', description: 'Compras e deserto. Resorts de luxo e aventuras nas dunas.', mission: 'Reservar um safari no deserto.' },
                ];
            case 'academic':
                return [
                    { ...baseRegions[0], name: 'Columbia University', description: 'Excelência acadêmica. Pesquisa, escrita de artigos e debates.', mission: 'Escrever um abstract de artigo.' },
                    { ...baseRegions[1], name: 'Oxford / Cambridge', description: 'Tradição intelectual. Literatura clássica e história da língua.', mission: 'Participar de um debate universitário.' },
                    { ...baseRegions[2], name: 'Stanford', description: 'Pesquisa tecnológica. Termos científicos e inovação disruptiva.', mission: 'Apresentar um projeto de pesquisa.' },
                    { ...baseRegions[3], name: 'Univ. de Tóquio', description: 'Estudos asiáticos e robótica. Intercâmbio acadêmico e bolsas.', mission: 'Aplicar para uma bolsa de estudos.' },
                    { ...baseRegions[4], name: 'Knowledge Park', description: 'Conferências internacionais. Networking acadêmico e publicações.', mission: 'Organizar um painel de conferência.' },
                ];
            default:
                return [];
        }
    }, [objective]);

    // --- RENDER: OBJECTIVE SELECTION ---
    if (!objective) {
        return (
            <div className="flex flex-col h-full bg-gray-950 p-4 md:p-6 overscroll-contain animate-fade-in">
                <div className="max-w-5xl mx-auto w-full">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8 md:mb-12">
                        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                            <ChevronRight className="w-6 h-6 rotate-180" />
                        </button>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                                <Globe className="w-8 h-8 text-blue-500" /> Passaporte Executivo
                            </h2>
                            <p className="text-gray-400 text-sm md:text-base mt-2">Defina sua trajetória global para personalizar sua experiência.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Option 1: Business */}
                        <div
                            onClick={() => setObjective('business')}
                            className="bg-gray-900/50 border border-gray-800 p-6 md:p-8 rounded-3xl hover:border-blue-500 hover:bg-gray-900 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                                <Briefcase className="w-7 h-7 md:w-8 md:h-8" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-white mb-2">Foco Executivo</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                Domine reuniões, negociações e liderança global. Para quem busca ascensão corporativa.
                            </p>
                            <span className="text-blue-400 text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                Selecionar <ChevronRight className="w-4 h-4" />
                            </span>
                        </div>

                        {/* Option 2: Travel */}
                        <div
                            onClick={() => setObjective('travel')}
                            className="bg-gray-900/50 border border-gray-800 p-6 md:p-8 rounded-3xl hover:border-green-500 hover:bg-gray-900 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 text-green-400 group-hover:scale-110 transition-transform">
                                <Plane className="w-7 h-7 md:w-8 md:h-8" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-white mb-2">Viajante Global</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                Fluência para explorar o mundo. Foco em cultura, turismo e conexões internacionais.
                            </p>
                            <span className="text-green-400 text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                Selecionar <ChevronRight className="w-4 h-4" />
                            </span>
                        </div>

                        {/* Option 3: Academic */}
                        <div
                            onClick={() => setObjective('academic')}
                            className="bg-gray-900/50 border border-gray-800 p-6 md:p-8 rounded-3xl hover:border-purple-500 hover:bg-gray-900 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-7 h-7 md:w-8 md:h-8" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-white mb-2">Mestre Acadêmico</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                Vocabulário técnico, leitura aprofundada e preparação para exames de proficiência.
                            </p>
                            <span className="text-purple-400 text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                Selecionar <ChevronRight className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: MAP INTERFACE ---
    return (
        <div className="flex flex-col h-full bg-gray-950 p-4 md:p-6 animate-fade-in relative min-h-[600px] md:min-h-0">
            {/* Top Stats Bar - Stacked on Mobile */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-6 relative z-20">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white shrink-0">
                        <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                    <div className="flex-1">
                        <h2 className="text-lg md:text-xl font-bold text-white flex flex-wrap items-center gap-2">
                            Passaporte: <span className="text-blue-400 capitalize">{objective === 'business' ? 'Executivo' : objective === 'travel' ? 'Viajante' : 'Acadêmico'}</span>
                        </h2>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                            <span className="bg-gray-800 px-2 py-0.5 rounded text-white text-[10px] uppercase font-bold">Nível {userLevel}</span>
                            <div className="w-24 md:w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(userXP / nextLevelXP) * 100}%` }}></div>
                            </div>
                            <span className="text-[10px] md:text-xs">{userXP}/{nextLevelXP} XP</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <div className="bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl flex items-center gap-3 shrink-0">
                        <Award className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Rank Global</p>
                            <p className="text-white font-bold text-xs md:text-sm">Diplomata Jr.</p>
                        </div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl flex items-center gap-3 shrink-0">
                        <Globe className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Regiões</p>
                            <p className="text-white font-bold text-xs md:text-sm">1/5 Conquistadas</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 bg-[#0a0f1c] rounded-3xl border border-gray-800 relative overflow-hidden shadow-2xl min-h-[400px]">
                {/* Stylized World Map Background - Scales better on mobile */}
                <div className="absolute inset-0 opacity-40">
                    <svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" className="w-full h-full text-gray-700 fill-current">
                        {/* Abstract simple shapes representing continents for visual feel - simplified polygons */}
                        <path d="M200,100 Q250,50 300,100 T400,150 T350,250 T200,300 T150,200 Z" /> {/* North America-ish */}
                        <path d="M250,320 Q300,300 350,350 T300,450 T200,400 Z" /> {/* South America-ish */}
                        <path d="M450,100 Q500,80 550,100 T600,200 T550,300 T450,250 T420,150 Z" /> {/* Europe/Africa-ish */}
                        <path d="M620,80 Q700,50 800,80 T850,200 T750,300 T650,250 Z" /> {/* Asia-ish */}
                        <path d="M750,350 Q800,350 820,400 T700,420 Z" /> {/* Oceania-ish */}
                    </svg>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
                </div>

                {/* Grid Lines */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                {/* Region Pins - Adjusted size for touch */}
                {regions.map((region) => (
                    <motion.div
                        key={region.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group tap-highlight-transparent"
                        style={{ top: `${region.lat}%`, left: `${region.lng}%` }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedRegion(region)}
                    >
                        <div className={`relative flex flex-col items-center ${selectedRegion?.id === region.id ? 'z-50' : 'z-10'}`}>
                            {/* Pin Icon */}
                            <div className={`
                                w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg border-2 transition-all
                                ${region.status === 'locked' ? 'bg-gray-800 border-gray-600 text-gray-500' :
                                    region.status === 'completed' ? 'bg-green-500 border-white text-white' :
                                        'bg-blue-600 border-white text-white animate-pulse'}
                            `}>
                                {region.status === 'locked' ? <Lock className="w-3 h-3 md:w-4 md:h-4" /> :
                                    region.status === 'completed' ? <Star className="w-3 h-3 md:w-4 md:h-4 fill-white" /> :
                                        <MapPin className="w-3 h-3 md:w-4 md:h-4" />}
                            </div>

                            {/* Label - Hidden on very small screens unless selected */}
                            <span className={`
                                mt-2 px-2 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap transition-all shadow-md
                                ${selectedRegion?.id === region.id ? 'bg-white text-black scale-110 block' : 'bg-gray-900/80 text-white backdrop-blur-sm group-hover:bg-gray-800 hidden md:block'}
                            `}>
                                {region.name}
                            </span>
                        </div>
                    </motion.div>
                ))}

                {/* Selected Region info Panel (Floating) - Responsive Bottom Sheet */}
                <AnimatePresence>
                    {selectedRegion && (
                        <>
                            {/* Backdrop for mobile */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="md:hidden absolute inset-0 bg-black/60 z-40"
                                onClick={() => setSelectedRegion(null)}
                            />

                            <motion.div
                                initial={{ opacity: 0, y: 100 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 100 }}
                                className="absolute bottom-0 left-0 right-0 md:bottom-8 md:left-8 md:right-auto md:w-96 bg-gray-900 border-t md:border border-gray-700 p-6 rounded-t-3xl md:rounded-2xl shadow-2xl z-50 md:backdrop-blur-xl md:bg-gray-900/95"
                            >
                                <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-4 md:hidden"></div>

                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-white">{selectedRegion.name}</h3>
                                    <button onClick={() => setSelectedRegion(null)} className="text-gray-400 hover:text-white p-1 bg-gray-800 rounded-full md:bg-transparent md:p-0">
                                        <ChevronRight className="w-5 h-5 md:rotate-90 rotate-90" />
                                    </button>
                                </div>

                                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                                    {selectedRegion.description}
                                </p>

                                <div className="bg-gray-800/50 p-3 rounded-xl mb-6 border border-gray-700/50">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Missão Atual</p>
                                    <p className="text-white text-sm font-medium">{selectedRegion.mission}</p>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedRegion.status === 'locked' ? 'bg-gray-800 text-gray-500' :
                                        selectedRegion.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                            'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {selectedRegion.status === 'locked' ? 'Bloqueado' :
                                            selectedRegion.status === 'completed' ? 'Conquistado' : 'Disponível'}
                                    </div>
                                    <div className="text-xs text-gray-500">Recompensa: <span className="text-yellow-500 font-bold">+500 XP</span></div>
                                </div>

                                <Button
                                    onClick={() => {
                                        if (selectedRegion.status !== 'locked') {
                                            setShowMissionModal(true);
                                        }
                                    }}
                                    disabled={selectedRegion.status === 'locked'}
                                    className={`w-full py-4 text-sm ${selectedRegion.status === 'locked' ? 'opacity-50 cursor-not-allowed bg-gray-700' :
                                        'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20'
                                        }`}
                                >
                                    {selectedRegion.status === 'locked' ? 'Requer Nível Superior' :
                                        selectedRegion.status === 'completed' ? 'Revisar Missão' : 'Iniciar Jornada'}
                                </Button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>


            {/* Mission Review Modal */}
            <AnimatePresence>
                {showMissionModal && selectedRegion && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowMissionModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-gray-900 border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 via-blue-900/10 to-gray-900 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-600/20 p-2 rounded-lg text-blue-400">
                                        <Bot className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Mentor Executivo IA</h3>
                                        <p className="text-xs text-blue-300">Planejamento Estratégico da Missão</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowMissionModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
                                {/* Context */}
                                <div className="space-y-2">
                                    <h4 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <Globe className="w-4 h-4" /> Contexto Global
                                    </h4>
                                    <p className="text-sm md:text-gray-300 leading-relaxed bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                                        "{selectedRegion.description} Para dominar esta região, você precisa demonstrar competência em <span className="text-white font-bold">{selectedRegion.mission}</span>. O mercado local exige precisão no vocabulário e entendimento cultural."
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex items-start gap-3 bg-gray-800/30 p-3 rounded-lg border border-gray-700/30">
                                        <div className="mt-1 bg-green-500/20 p-1 rounded text-green-400">
                                            <CheckCircle className="w-3 h-3" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-sm">Domínio de Vocabulário</p>
                                            <p className="text-[10px] md:text-xs text-gray-500">Aprenda termos essenciais desta região.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 bg-gray-800/30 p-3 rounded-lg border border-gray-700/30">
                                        <div className="mt-1 bg-purple-500/20 p-1 rounded text-purple-400">
                                            <Smartphone className="w-3 h-3" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-sm">Prática Realista</p>
                                            <p className="text-[10px] md:text-xs text-gray-500">Simulação interativa com o Mentor IA.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Difficulty Selection */}
                                <div className="space-y-3">
                                    <h4 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <Award className="w-4 h-4" /> Nível de Desafio
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { id: 'BASIC', label: 'Básico', mult: '1.0x', desc: 'Iniciante' },
                                            { id: 'INTERMEDIATE', label: 'Médio', mult: '1.5x', desc: 'Padrão' },
                                            { id: 'ADVANCED', label: 'Avançado', mult: '2.0x', desc: 'Expert' }
                                        ].map((level) => (
                                            <div
                                                key={level.id}
                                                onClick={() => setDifficulty(level.id as any)}
                                                className={`
                                                        cursor-pointer p-3 rounded-xl border transition-all text-center flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2 sm:gap-1
                                                        ${difficulty === level.id
                                                        ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-900/20'
                                                        : 'bg-gray-800/30 border-gray-700/30 hover:bg-gray-800 hover:border-gray-600'}
                                                    `}
                                            >
                                                <div className="text-left sm:text-center w-full">
                                                    <p className={`font-bold text-sm ${difficulty === level.id ? 'text-white' : 'text-gray-400'}`}>
                                                        {level.label}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500">{level.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Rewards */}
                                <div className="bg-yellow-900/10 border border-yellow-500/20 p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Award className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
                                        <div>
                                            <p className="text-yellow-200 font-bold text-xs md:text-sm">Recompensa</p>
                                            <p className="text-[10px] text-yellow-500/80">Ao finalizar a missão</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl md:text-2xl font-bold text-white">+500 XP</p>
                                        <p className="text-[9px] text-gray-400 uppercase">Experiência</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-800 bg-gray-900 flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="text-center md:text-left">
                                    <p className="text-sm text-gray-400">Investimento Total</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-bold text-white">{calculateCost()} Créditos</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <Button onClick={() => setShowMissionModal(false)} className="bg-transparent border border-gray-600 hover:bg-gray-800 text-white flex-1 md:flex-none">
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleStartMission} disabled={loading} className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold flex-1 md:flex-none px-8 shadow-lg shadow-yellow-500/20">
                                        {loading ? 'Iniciando...' : 'Iniciar Missão'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence >

            <InsufficientFundsAlert
                isOpen={showInsufficientModal}
                onClose={() => setShowInsufficientModal(false)}
                onRecharge={() => {
                    setShowInsufficientModal(false);
                    if (navigateTo) navigateTo('recharge');
                    else toast.error("Navegação indisponível");
                }}
            />
        </div>
    );
};
