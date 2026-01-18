import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProduct } from '../../../../../types';
import { getAppProducts } from '../../../../../services/mockFirebase';
import Card from '../../../../../components/Card';
import Button from '../../../../../components/Button';
import Input from '../../../../../components/Input';
import { 
    Brain, CheckCircle, AlertTriangle, Zap, Filter, Crown, Star, ShieldCheck, 
    Save, RefreshCw, ChevronDown, ChevronRight, Settings, DollarSign, Wallet, Activity
} from '../../../../../components/Icons';
import toast from 'react-hot-toast';
import { SYSTEM_MODULES, INITIAL_PLAN_STATE } from '../constants';
import { PlansState, PlanConfig } from '../types';

export const PlansBiTab: React.FC = () => {
    const [context, setContext] = useState<'global' | string>('global');
    const [products, setProducts] = useState<AppProduct[]>([]);
    const [activeTier, setActiveTier] = useState<'basic' | 'pro' | 'elite'>('basic');
    const [plans, setPlans] = useState<PlansState>(INITIAL_PLAN_STATE);
    const [expandedModule, setExpandedModule] = useState<string | null>('mestre_ia_strategy');
    const [usdRate, setUsdRate] = useState(5.50);

    useEffect(() => {
        getAppProducts().then(setProducts);
    }, []);

    const currentPlan = plans[activeTier];

    // Formatação Brasileira
    const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    const bi = useMemo(() => {
        let fixedInfraBRL = 15.00;
        let estimatedToolsCostBRL = 0;
        
        SYSTEM_MODULES.forEach(mod => {
            mod.tools.forEach((tool) => {
                if (currentPlan.activeFeatures.includes(tool.id)) {
                    // Calculamos um uso médio mensal por feature ativa
                    estimatedToolsCostBRL += (tool.costUSD * usdRate * 10); 
                }
            });
        });

        const aiTokenCostBRL = (currentPlan.credits * 0.15); 
        const totalEstimatedCostBRL = fixedInfraBRL + estimatedToolsCostBRL + aiTokenCostBRL;
        const profitBRL = currentPlan.price - totalEstimatedCostBRL;
        const margin = currentPlan.price > 0 ? (profitBRL / currentPlan.price) * 100 : 0;

        return { 
            totalEstimatedCostBRL, 
            profitBRL, 
            margin, 
            isRed: profitBRL < 0,
            isYellow: margin > 0 && margin < 40,
            suggestedPrice: totalEstimatedCostBRL * 3 // SaaS Standard: 3x o custo
        };
    }, [currentPlan, usdRate]);

    const toggleFeature = (featureId: string) => {
        setPlans(prev => {
            const currentFeatures = prev[activeTier].activeFeatures;
            const newFeatures = currentFeatures.includes(featureId)
                ? currentFeatures.filter(id => id !== featureId)
                : [...currentFeatures, featureId];
            return { ...prev, [activeTier]: { ...prev[activeTier], activeFeatures: newFeatures } };
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-2 space-y-6">
                {/* Painel de Controle de BI */}
                <Card className="p-6 bg-gray-800 border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 border-b border-gray-700 pb-6">
                        <div className="flex-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Seletor de Contexto</label>
                            <select 
                                className="bg-gray-900 border border-gray-600 rounded-xl p-3 text-white text-sm outline-none w-full"
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                            >
                                <option value="global">Estratégia Global (Default)</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="w-full md:w-48">
                            <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Câmbio de Cálculo (R$)</label>
                            <div className="flex items-center gap-2 bg-gray-900 p-3 rounded-xl border border-gray-700">
                                <DollarSign className="w-4 h-4 text-green-500"/>
                                <input type="number" step="0.01" className="bg-transparent text-white font-bold w-full outline-none" value={usdRate} onChange={e => setUsdRate(parseFloat(e.target.value) || 0)} />
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-gray-900 p-1 rounded-2xl border border-gray-700 mb-8">
                        {(['basic', 'pro', 'elite'] as const).map(tier => (
                            <button
                                key={tier}
                                onClick={() => setActiveTier(tier)}
                                className={`flex-1 py-4 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${
                                    activeTier === tier 
                                        ? `bg-gray-800 text-white shadow-2xl border border-gray-600`
                                        : 'text-gray-500 hover:text-white'
                                }`}
                            >
                                {tier === 'elite' ? <Crown className="w-4 h-4 text-yellow-500"/> : tier === 'pro' ? <Star className="w-4 h-4 text-blue-500"/> : <ShieldCheck className="w-4 h-4 text-gray-500"/>}
                                {tier}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <Input label="Valor do Ticket do Plano (R$)" type="number" value={currentPlan.price} onChange={e => setPlans({...plans, [activeTier]: {...currentPlan, price: parseFloat(e.target.value)}})} className="!bg-gray-900 !py-4 !text-xl !font-black" />
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase mb-4 block flex justify-between">Franquia de Créditos IA <span>{currentPlan.credits}</span></label>
                            <input type="range" min="0" max="5000" step="50" value={currentPlan.credits} onChange={e => setPlans({...plans, [activeTier]: {...currentPlan, credits: parseInt(e.target.value)}})} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                            <p className="text-[9px] text-gray-500 mt-2">Custo estimado em tokens: {brl(currentPlan.credits * 0.15)}</p>
                        </div>
                    </div>
                </Card>

                {/* Lista de Recursos Ativos no Plano */}
                <div className="space-y-4">
                    {SYSTEM_MODULES.map(module => (
                        <div key={module.id} className={`bg-gray-800 border rounded-3xl transition-all overflow-hidden ${expandedModule === module.id ? 'border-brand-primary/30' : 'border-gray-700'}`}>
                            <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-700/30" onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}>
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-gray-900 rounded-xl">{module.icon}</div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest">{module.label}</h4>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedModule === module.id ? 'rotate-180' : ''}`}/>
                            </div>
                            <AnimatePresence>
                                {expandedModule === module.id && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-gray-900/50 px-5 pb-5 border-t border-gray-700 pt-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {module.tools.map(tool => (
                                                <label key={tool.id} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${currentPlan.activeFeatures.includes(tool.id) ? 'bg-brand-primary/10 border-brand-primary/40 shadow-[0_0_10px_rgba(250,204,21,0.05)]' : 'bg-gray-800 border-gray-700'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <input type="checkbox" className="w-5 h-5 rounded-lg border-gray-600 bg-gray-700 text-brand-primary focus:ring-0" checked={currentPlan.activeFeatures.includes(tool.id)} onChange={() => toggleFeature(tool.id)}/>
                                                        <span className={`text-xs font-bold ${currentPlan.activeFeatures.includes(tool.id) ? 'text-white' : 'text-gray-500'}`}>{tool.label}</span>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-gray-500">{brl(tool.costUSD * usdRate)}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            {/* Coluna Direita: Nexus CFO Sidebar */}
            <div className="lg:col-span-1">
                <Card className={`sticky top-6 p-8 border-l-8 flex flex-col h-fit shadow-2xl relative overflow-hidden ${bi.isRed ? 'border-l-red-600 bg-red-900/10' : bi.isYellow ? 'border-l-yellow-500 bg-gray-800' : 'border-l-green-500 bg-gray-800'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Brain className="w-40 h-40 text-white"/></div>
                    <h3 className="text-xl font-black text-white uppercase flex items-center gap-3 mb-10 relative z-10">
                        <Brain className="w-8 h-8 text-brand-primary"/> NEXUS CFO CORE
                    </h3>
                    
                    <div className="space-y-8 relative z-10">
                        <div className="bg-black/40 p-5 rounded-3xl border border-gray-700">
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Custo Operacional Aluno/Mês</p>
                            <p className="text-4xl font-black text-white">{brl(bi.totalEstimatedCostBRL)}</p>
                            <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-2">
                                {/* Fix Activity error by adding to imports */}
                                <Activity className="w-3 h-3 text-brand-primary"/> Análise baseada em {currentPlan.activeFeatures.length} recursos.
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <p className="text-gray-400 text-[10px] font-black uppercase">Sua Margem de Lucro</p>
                                <p className={`text-xl font-black ${bi.isRed ? 'text-red-500' : bi.isYellow ? 'text-yellow-500' : 'text-green-500'}`}>
                                    {bi.margin.toFixed(1)}%
                                </p>
                            </div>
                            <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden border border-gray-600 shadow-inner">
                                <motion.div 
                                    animate={{ width: `${Math.max(5, Math.min(100, bi.margin))}%` }} 
                                    className={`h-full ${bi.isRed ? 'bg-red-600' : bi.isYellow ? 'bg-yellow-500' : 'bg-green-500'} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                                />
                            </div>
                            <p className={`text-right text-xs font-bold mt-2 ${bi.isRed ? 'text-red-400' : 'text-green-400'}`}>
                                {bi.isRed ? 'Prejuízo de: ' : 'Lucro de: '} {brl(Math.abs(bi.profitBRL))}
                            </p>
                        </div>

                        {bi.isRed && (
                            <div className="p-4 bg-red-600/10 border border-red-600/30 rounded-2xl flex gap-3">
                                <AlertTriangle className="w-10 h-10 text-red-500 flex-shrink-0"/>
                                <p className="text-xs text-red-100 leading-relaxed">
                                    <strong>ATENÇÃO PRODUTOR:</strong> Plano operando no prejuízo. Aumente o preço ou remova recursos caros como Vídeo/Evolution API.
                                </p>
                            </div>
                        )}

                        <div className="pt-6 border-t border-gray-700">
                            <p className="text-[10px] text-gray-500 font-black uppercase mb-2">Preço de Equilíbrio Sugerido</p>
                            <p className="text-3xl font-black text-white">{brl(bi.suggestedPrice)}</p>
                        </div>

                        <Button 
                            onClick={() => {
                                toast.success("Estratégia de precificação enviada para a plataforma!");
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            className="w-full !py-5 font-black uppercase tracking-widest text-xs shadow-2xl !bg-brand-primary text-black hover:!bg-yellow-300 border-none"
                        >
                            ATUALIZAR PREÇOS AGORA
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
