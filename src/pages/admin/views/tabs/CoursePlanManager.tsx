
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProduct, Course, CoursePlan, PlanTierConfig, NexusPlanAnalysis } from '../../../../types';
import { getCourses, getCoursePlan, saveCoursePlan, calculateNexusPlanCost, getToolCosts } from '../../../../services/mockFirebase';
import Card from '../../../../components/Card';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';
import { 
    Brain, CheckCircle, AlertTriangle, Coins, Zap, 
    ShieldCheck, LockClosed, Crown, Star, RefreshCw, Save
} from '../../../../components/Icons';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';

const TIER_COLORS = {
    'Básico': 'border-gray-500 text-gray-400',
    'Pro': 'border-blue-500 text-blue-400',
    'Elite': 'border-yellow-500 text-yellow-400'
};

const DEFAULT_TIER_CONFIG: PlanTierConfig = {
    name: 'Básico',
    active: false,
    price: 0,
    durationMonths: 12,
    features: {
        accessAllModules: true,
        communityAccess: false,
        supportPriority: 'standard',
        certificate: true,
        downloadMaterials: false,
        lives: false
    },
    aiCredits: {
        dailyLimit: 0,
        cumulative: false,
        toolsAllowed: []
    }
};

export const CoursePlanManager: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [currentPlan, setCurrentPlan] = useState<CoursePlan | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTier, setActiveTier] = useState<'basic' | 'pro' | 'elite'>('basic');
    
    // Nexus Analysis State
    const [analysis, setAnalysis] = useState<NexusPlanAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        getCourses().then(setCourses);
    }, []);

    useEffect(() => {
        if (selectedCourseId) {
            loadPlan(selectedCourseId);
        }
    }, [selectedCourseId]);

    // Sempre que o plano muda, roda a análise da IA para o tier ativo
    useEffect(() => {
        if (currentPlan) {
            runNexusAnalysis();
        }
    }, [currentPlan, activeTier]);

    const loadPlan = async (id: string) => {
        setLoading(true);
        const plan = await getCoursePlan(id);
        const course = courses.find(c => c.id === id);
        
        if (plan) {
            setCurrentPlan(plan);
        } else {
            // Create default template
            setCurrentPlan({
                courseId: id,
                courseName: course?.title || 'Curso',
                updatedAt: Date.now(),
                tiers: {
                    basic: { ...DEFAULT_TIER_CONFIG, name: 'Básico', active: true },
                    pro: { ...DEFAULT_TIER_CONFIG, name: 'Pro' },
                    elite: { ...DEFAULT_TIER_CONFIG, name: 'Elite' }
                }
            });
        }
        setLoading(false);
    };

    const runNexusAnalysis = async () => {
        if (!currentPlan) return;
        setIsAnalyzing(true);
        const result = await calculateNexusPlanCost(currentPlan.tiers[activeTier]);
        setAnalysis(result);
        setIsAnalyzing(false);
    };

    const handleTierChange = (field: string, value: any, nestedField?: string) => {
        if (!currentPlan) return;
        
        setCurrentPlan(prev => {
            if (!prev) return null;
            const updatedTier = { ...prev.tiers[activeTier] };

            if (nestedField) {
                (updatedTier as any)[field][nestedField] = value;
            } else {
                (updatedTier as any)[field] = value;
            }

            return {
                ...prev,
                tiers: {
                    ...prev.tiers,
                    [activeTier]: updatedTier
                }
            };
        });
    };

    const handleSave = async () => {
        if (!currentPlan) return;
        setLoading(true);
        await saveCoursePlan(currentPlan);
        toast.success("Planos e regras salvos com sucesso!");
        setLoading(false);
    };

    if (courses.length === 0) return <div className="text-center p-8 text-gray-500">Nenhum curso disponível para configuração.</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left Column: Configuration */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Course Selector */}
                <Card className="p-4 bg-gray-800 border-gray-700">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Selecione o Curso para Editar</label>
                    <select 
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-brand-primary outline-none transition-colors"
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                    >
                        <option value="">-- Selecione --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </Card>

                {currentPlan && (
                    <Card className="p-0 bg-gray-800 border-gray-700 overflow-hidden">
                        {/* Tier Tabs */}
                        <div className="flex border-b border-gray-700">
                            {(['basic', 'pro', 'elite'] as const).map(tier => (
                                <button
                                    key={tier}
                                    onClick={() => setActiveTier(tier)}
                                    className={`flex-1 py-4 text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                                        activeTier === tier 
                                            ? `bg-gray-700 text-white border-b-2 ${tier === 'elite' ? 'border-yellow-400' : tier === 'pro' ? 'border-blue-400' : 'border-gray-400'}`
                                            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                                    }`}
                                >
                                    {tier === 'elite' && <Crown className="w-4 h-4 text-yellow-400"/>}
                                    {tier === 'pro' && <Star className="w-4 h-4 text-blue-400"/>}
                                    {tier === 'basic' && <ShieldCheck className="w-4 h-4 text-gray-400"/>}
                                    {tier}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Header: Active & Price */}
                            <div className="flex items-center gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={currentPlan.tiers[activeTier].active}
                                        onChange={e => handleTierChange('active', e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-brand-primary"
                                    />
                                    <span className="text-sm font-bold text-white">Plano Ativo</span>
                                </label>
                                <div className="h-8 w-px bg-gray-700 mx-2"></div>
                                <div className="flex-1">
                                    <Input 
                                        label="Preço de Venda (R$)" 
                                        type="number" 
                                        value={currentPlan.tiers[activeTier].price} 
                                        onChange={e => handleTierChange('price', parseFloat(e.target.value))}
                                        className="!bg-gray-900"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Duração</label>
                                    <select 
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white text-sm outline-none"
                                        value={currentPlan.tiers[activeTier].durationMonths}
                                        onChange={e => handleTierChange('durationMonths', parseInt(e.target.value))}
                                    >
                                        <option value={0}>Vitalício (Risco Alto)</option>
                                        <option value={1}>Mensal (1 Mês)</option>
                                        <option value={6}>Semestral (6 Meses)</option>
                                        <option value={12}>Anual (12 Meses)</option>
                                    </select>
                                </div>
                            </div>

                            {/* AI Credits Configuration */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2 border-b border-gray-700 pb-2">
                                    <Brain className="w-4 h-4 text-purple-400"/> Configuração Mestre IA
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input 
                                        label="Créditos Diários" 
                                        type="number"
                                        value={currentPlan.tiers[activeTier].aiCredits.dailyLimit}
                                        onChange={e => handleTierChange('aiCredits', parseInt(e.target.value), 'dailyLimit')}
                                        className="!bg-gray-900"
                                    />
                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={currentPlan.tiers[activeTier].aiCredits.cumulative}
                                                onChange={e => handleTierChange('aiCredits', e.target.checked, 'cumulative')}
                                                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-500"
                                            />
                                            <span className="text-sm text-gray-300">Acumular se não usar?</span>
                                        </label>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    * Créditos diários renovam a cada 24h. Se não cumulativo, zera à meia-noite.
                                </p>
                            </div>

                            {/* Features Toggles */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2 border-b border-gray-700 pb-2">
                                    <Zap className="w-4 h-4 text-yellow-400"/> Funcionalidades Inclusas
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <label className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-700 cursor-pointer hover:border-gray-500">
                                        <span className="text-sm text-gray-300">Acesso a todos os módulos</span>
                                        <input type="checkbox" checked={currentPlan.tiers[activeTier].features.accessAllModules} onChange={e => handleTierChange('features', e.target.checked, 'accessAllModules')} className="rounded bg-gray-800 border-gray-600 text-brand-primary"/>
                                    </label>
                                    <label className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-700 cursor-pointer hover:border-gray-500">
                                        <span className="text-sm text-gray-300">Download de Materiais</span>
                                        <input type="checkbox" checked={currentPlan.tiers[activeTier].features.downloadMaterials} onChange={e => handleTierChange('features', e.target.checked, 'downloadMaterials')} className="rounded bg-gray-800 border-gray-600 text-brand-primary"/>
                                    </label>
                                    <label className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-700 cursor-pointer hover:border-gray-500">
                                        <span className="text-sm text-gray-300">Emissão de Certificado</span>
                                        <input type="checkbox" checked={currentPlan.tiers[activeTier].features.certificate} onChange={e => handleTierChange('features', e.target.checked, 'certificate')} className="rounded bg-gray-800 border-gray-600 text-brand-primary"/>
                                    </label>
                                    <label className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-700 cursor-pointer hover:border-gray-500">
                                        <span className="text-sm text-gray-300">Acesso à Comunidade</span>
                                        <input type="checkbox" checked={currentPlan.tiers[activeTier].features.communityAccess} onChange={e => handleTierChange('features', e.target.checked, 'communityAccess')} className="rounded bg-gray-800 border-gray-600 text-brand-primary"/>
                                    </label>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Nível de Suporte</label>
                                    <div className="flex gap-2">
                                        {['standard', 'priority', 'vip'].map(lvl => (
                                            <button
                                                key={lvl}
                                                onClick={() => handleTierChange('features', lvl, 'supportPriority')}
                                                className={`flex-1 py-2 rounded text-xs font-bold uppercase border transition-all ${
                                                    currentPlan.tiers[activeTier].features.supportPriority === lvl
                                                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                                    : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500'
                                                }`}
                                            >
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-700 flex justify-end">
                                <Button onClick={handleSave} className="!bg-green-600 hover:!bg-green-500 font-bold shadow-lg shadow-green-900/20">
                                    <Save className="w-4 h-4 mr-2"/> Salvar Configurações
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {/* Right Column: Nexus Analysis */}
            <div className="lg:col-span-1">
                {currentPlan ? (
                    <Card className={`p-6 border-l-4 h-full relative overflow-hidden transition-all duration-500 ${
                        analysis?.warning ? 'border-l-red-500 bg-red-900/10' : 'border-l-brand-primary bg-gray-800'
                    }`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2 mb-6">
                                <Brain className={`w-6 h-6 ${isAnalyzing ? 'animate-pulse text-purple-400' : 'text-brand-primary'}`}/> 
                                Nexus Financial Core
                            </h3>

                            {isAnalyzing ? (
                                <div className="py-20 flex flex-col items-center justify-center text-gray-500">
                                    <RefreshCw className="w-8 h-8 animate-spin mb-3"/>
                                    <p className="text-xs">Calculando viabilidade econômica...</p>
                                </div>
                            ) : analysis ? (
                                <div className="space-y-6">
                                    {/* Warning Box */}
                                    {analysis.warning && (
                                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex gap-3 items-start">
                                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"/>
                                            <p className="text-xs text-red-200 font-bold leading-relaxed">{analysis.warning}</p>
                                        </div>
                                    )}

                                    {/* Cost Breakdown */}
                                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                                        <p className="text-gray-400 text-xs font-bold uppercase mb-3">Estimativa de Custo Mensal (Por Aluno)</p>
                                        <p className="text-3xl font-black text-white mb-1">R$ {analysis.estimatedInfrastructureCost.toFixed(2)}</p>
                                        <p className="text-[10px] text-gray-500">Inclui: IA Token, Hosting, Streaming & Suporte</p>
                                    </div>

                                    {/* Pricing Suggestions */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-700">
                                            <span className="text-xs text-gray-400">Preço Mínimo (Breakeven)</span>
                                            <span className="text-sm font-bold text-white">R$ {analysis.recommendedPriceMin.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-700 relative overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                                            <span className="text-xs text-gray-400">Preço Ideal (Lucro Alto)</span>
                                            <span className="text-sm font-black text-green-400">R$ {analysis.recommendedPriceOptimal.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Margin Indicator */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-400">Margem Projetada</span>
                                            <span className={`font-bold ${analysis.margin < 0 ? 'text-red-500' : 'text-brand-primary'}`}>
                                                {analysis.margin.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.max(0, Math.min(100, analysis.margin))}%` }}
                                                className={`h-full ${analysis.margin < 30 ? 'bg-red-500' : analysis.margin < 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                            />
                                        </div>
                                    </div>

                                    {/* AI Advice */}
                                    <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                                        <p className="text-[10px] font-bold text-blue-300 uppercase mb-2 flex items-center gap-1">
                                            <Brain className="w-3 h-3"/> Conselho Estratégico
                                        </p>
                                        <p className="text-xs text-blue-100 italic leading-relaxed">"{analysis.advice}"</p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </Card>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
                        Selecione um curso para ver a análise.
                    </div>
                )}
            </div>
        </div>
    );
};
