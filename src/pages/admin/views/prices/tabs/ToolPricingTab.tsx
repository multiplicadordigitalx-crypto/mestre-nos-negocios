
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calculator, Search, Save, AlertTriangle, CheckCircle, Coins, DollarSign, RefreshCw, TrendingUp, Server, Brain, ShieldCheck, Zap, Box, Activity, Users, Mic, List, PlayCircle, Percent
} from '../../../../../components/Icons';
import { LoadingSpinner } from '../../../../../components/LoadingSpinner';
import { getToolCosts, saveToolCost, getSystemSettings, saveSystemSettings } from '../../../../../services/mockFirebase';
import { ToolCost } from '../../../../../types';
import toast from 'react-hot-toast';
import { SYSTEM_MODULES } from '../constants';
import Button from '../../../../../components/Button';
import { AICreditGate } from '../../../../../components/AICreditGate';

export const ToolPricingTab: React.FC = () => {
    const [tools, setTools] = useState<ToolCost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [usdRate, setUsdRate] = useState(5.50);
    const [isFetchingRate, setIsFetchingRate] = useState(false);
    const [isNexusActive, setIsNexusActive] = useState(true);
    const [creditValueBRL, setCreditValueBRL] = useState(1.00);
    const [isSaving, setIsSaving] = useState(false);
    const [commissionPct, setCommissionPct] = useState(0);

    const [testingGate, setTestingGate] = useState<{ id: string, cost: number, name: string } | null>(null);

    const fetchRealUSD = async () => {
        setIsFetchingRate(true);
        try {
            const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
            const data = await response.json();
            const rate = parseFloat(data.USDBRL.bid);
            setUsdRate(rate);
            toast.success(`Dólar atualizado: R$ ${rate.toFixed(2)}`, { icon: '💵' });
        } catch (error) {
            toast.error("Erro ao buscar cotação.");
        } finally {
            setIsFetchingRate(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const savedCosts = await getToolCosts();
                const settings = await getSystemSettings();
                setCommissionPct(settings.producerCommissionPercentage || 0);

                const allTools: any[] = [];

                SYSTEM_MODULES.forEach((module) => {
                    module.tools.forEach((toolDef) => {
                        const savedTool = savedCosts.find(t => t.toolId === toolDef.id);
                        allTools.push({
                            toolId: toolDef.id,
                            toolName: toolDef.label,
                            costPerTask: savedTool ? savedTool.costPerTask : 5,
                            realCostEstimate: toolDef.costUSD,
                            profitMargin: savedTool?.profitMargin || 100,
                            baseUnit: toolDef.baseUnit,
                            billingType: toolDef.billingType,
                            description: toolDef.description
                        });
                    });
                });
                setTools(allTools);
                await fetchRealUSD();
            } catch (error) {
                toast.error("Erro ao carregar matriz financeira.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const handleUpdateMargin = (toolId: string, newMargin: number) => {
        const safeMargin = Math.max(30, newMargin);
        setTools(prev => prev.map(t => {
            if (t.toolId === toolId) {
                const costBRL = t.realCostEstimate * usdRate;
                const newCreditCost = (costBRL * (1 + (safeMargin / 100))) / creditValueBRL;
                return {
                    ...t,
                    profitMargin: safeMargin,
                    costPerTask: Math.ceil(newCreditCost * 100) / 100
                };
            }
            return t;
        }));
    };

    const handleUpdateCreditPriceDirect = (toolId: string, newPrice: number) => {
        setTools(prev => prev.map(t => {
            if (t.toolId === toolId) {
                const costBRL = t.realCostEstimate * usdRate;
                const revenueBRL = newPrice * creditValueBRL;
                const newMargin = ((revenueBRL - costBRL) / costBRL) * 100;
                return {
                    ...t,
                    costPerTask: newPrice,
                    profitMargin: Math.max(30, Math.round(newMargin))
                };
            }
            return t;
        }));
    }

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            await Promise.all(tools.map(t => saveToolCost(t)));
            const currentSettings = await getSystemSettings();
            await saveSystemSettings({ ...currentSettings, producerCommissionPercentage: commissionPct });

            toast.success('Matriz de Preços e Margens Salva!');
        } catch (error) {
            toast.error('Erro ao salvar.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-brand-primary/20 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="flex flex-col xl:flex-row gap-8 items-center justify-between relative z-10">
                    <div className="flex gap-4 items-start">
                        <div className="p-4 bg-brand-primary/10 rounded-2xl border border-brand-primary/30 shadow-lg">
                            <Brain className={`w-10 h-10 ${isNexusActive ? 'text-brand-primary animate-pulse' : 'text-gray-500'}`} />
                        </div>
                        <div>
                            <h4 className="text-white font-black text-2xl tracking-tighter uppercase flex items-center gap-2">
                                Nexus Financial Core
                                {isNexusActive && <span className="text-[10px] bg-brand-primary text-black px-2 py-0.5 rounded font-black">CONTROLE DE MARGEM</span>}
                            </h4>
                            <p className="text-sm text-gray-400 mt-1 max-w-md">Gerencie custos de API e defina sua margem de lucro por crédito.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 w-full xl:w-auto bg-black/40 p-4 rounded-2xl border border-gray-700">
                        <div className="flex flex-col items-center sm:items-start border-r border-gray-700/50 pr-4 last:border-0">
                            <span className="text-[10px] text-gray-500 uppercase font-black mb-1">Módulos Ativos</span>
                            <div className="flex items-center gap-2">
                                <List className="w-4 h-4 text-brand-primary" />
                                <span className="text-white font-black text-xl">{tools.length}</span>
                                <span className="text-[9px] text-gray-500 font-bold uppercase mt-1">Tools</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center sm:items-start border-r border-gray-700/50 pr-4 last:border-0">
                            <span className="text-[10px] text-gray-500 uppercase font-black mb-1">Câmbio Base</span>
                            <div className="flex items-center gap-2">
                                <span className="text-green-500 font-bold">$1 = </span>
                                <input type="number" step="0.01" className="w-20 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1 text-white font-mono text-sm" value={usdRate} onChange={e => setUsdRate(parseFloat(e.target.value) || 0)} />
                                <button onClick={fetchRealUSD} className="p-1 text-brand-primary hover:bg-gray-700 rounded"><RefreshCw className={`w-4 h-4 ${isFetchingRate ? 'animate-spin' : ''}`} /></button>
                            </div>
                        </div>
                        <div className="flex flex-col items-center sm:items-start border-r border-gray-700/50 pr-4 last:border-0">
                            <span className="text-[10px] text-gray-500 uppercase font-black mb-1">Custo do Crédito</span>
                            <div className="flex items-center gap-2">
                                <span className="text-brand-primary font-bold">R$ </span>
                                <input type="number" step="0.01" className="w-20 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1 text-white font-mono text-sm" value={creditValueBRL} onChange={e => setCreditValueBRL(parseFloat(e.target.value) || 0)} />
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center border-r border-gray-700/50 pr-4">
                            <span className="text-[9px] text-brand-primary uppercase font-black mb-1">Proteção Nexus</span>
                            <button onClick={() => setIsNexusActive(!isNexusActive)} className={`w-full py-1.5 px-3 rounded-lg font-black text-[10px] transition-all flex items-center justify-center gap-2 ${isNexusActive ? 'bg-brand-primary text-black shadow-lg shadow-yellow-500/20' : 'bg-gray-800 text-gray-400'}`}>
                                {isNexusActive ? <ShieldCheck className="w-3 h-3" /> : <Zap className="w-3 h-3" />} {isNexusActive ? 'LIGADA' : 'DESLIGADA'}
                            </button>
                        </div>
                        <div className="flex items-center">
                            <Button onClick={handleSaveAll} isLoading={isSaving} className="w-full !bg-green-600 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-green-900/30">
                                <Save className="w-4 h-4 mr-2" /> SALVAR MATRIZ
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* PARTNER COMMISSION CARD */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-2 border-dashed border-gray-700 p-6 rounded-3xl relative overflow-hidden group hover:border-brand-primary/50 transition-colors">
                <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Users className="w-32 h-32 text-white" /></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div className="flex gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className="text-white font-black text-xl uppercase flex items-center gap-2">Nexus Partner Program</h4>
                            <p className="text-sm text-gray-400 max-w-lg">
                                Defina a porcentagem do <strong>Lucro Líquido (Receita - Custos)</strong> das recargas de crédito que será repassada aos Produtores parceiros.
                                <span className="block mt-1 text-xs text-blue-400">*Válido por 12 meses após a compra do curso.</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 bg-black/40 p-4 rounded-2xl border border-gray-700">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Comissão Produtor</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={commissionPct}
                                    onChange={(e) => setCommissionPct(parseFloat(e.target.value) || 0)}
                                    className="w-16 bg-gray-800 border border-gray-600 rounded-lg p-2 text-white font-black text-xl text-center focus:border-blue-500 outline-none"
                                />
                                <span className="text-xl font-black text-white">%</span>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-gray-700 mx-2"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Simulação (Recarga R$100)</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">Lucro Líquido Est. ~R$65 <br /> Repasse: <span className="text-green-400 font-bold">R$ {(65 * (commissionPct / 100)).toFixed(2)}</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <input className="w-full bg-gray-800 border border-gray-700 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:border-brand-primary outline-none shadow-xl transition-all" placeholder="Buscar ferramenta ou módulo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            {loading ? <div className="flex justify-center p-20"><LoadingSpinner size="lg" /></div> : (
                <div className="space-y-16 pb-32">
                    {SYSTEM_MODULES.map(module => {
                        const moduleTools = module.tools.filter(t => t.label.toLowerCase().includes(searchTerm.toLowerCase()) || module.label.toLowerCase().includes(searchTerm.toLowerCase()));
                        if (moduleTools.length === 0) return null;
                        return (
                            <div key={module.id} className="space-y-8">
                                <div className="flex items-center gap-4 px-2">
                                    <div className="p-2.5 bg-gray-800 rounded-2xl text-brand-primary border border-gray-700 shadow-lg">{module.icon}</div>
                                    <div><h3 className="text-2xl font-black text-white uppercase tracking-tighter">{module.label}</h3><p className="text-xs text-gray-500 font-medium">{module.description}</p></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {moduleTools.map(toolDef => {
                                        const toolState = tools.find(t => t.toolId === toolDef.id) || { costPerTask: 5, profitMargin: 100 };
                                        const costBRL = toolDef.costUSD * usdRate;
                                        const revenueBRL = toolState.costPerTask * creditValueBRL;
                                        const profitBRL = revenueBRL - costBRL;
                                        const margin = toolState.profitMargin;
                                        const isAudio = toolDef.id.includes('audio') || toolDef.id.includes('voice');

                                        return (
                                            <motion.div key={toolDef.id} className={`bg-gray-800 border rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-2xl relative ${isNexusActive && margin < 35 ? 'border-yellow-500 bg-yellow-900/5 shadow-yellow-900/10' : isAudio ? 'border-purple-500/40' : 'border-gray-700 hover:border-brand-primary/50'}`}>
                                                <div className="p-6 bg-gray-900/50 border-b border-gray-700 flex justify-between items-start">
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <h4 className="font-black text-white text-base leading-tight truncate" title={toolDef.label}>{toolDef.label}</h4>
                                                        <p className="text-[9px] text-gray-500 font-mono mt-1 uppercase tracking-widest">{toolDef.id}</p>
                                                    </div>
                                                    <div className={`p-2 rounded-xl flex-shrink-0 ${isAudio ? 'bg-purple-500/20 text-purple-400' : toolDef.billingType === 'monthly' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>{isAudio ? <Mic className="w-5 h-5" /> : <Box className="w-5 h-5" />}</div>
                                                </div>
                                                <div className="p-6 space-y-6">
                                                    <div className="space-y-3">
                                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] flex items-center gap-2"><Server className="w-3 h-3" /> Custo Real (API/Infra)</p>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="bg-black/30 p-3 rounded-2xl border border-gray-700 text-center"><span className="text-[9px] text-gray-500 font-bold mb-1 block uppercase">USD ($)</span><span className="text-white font-mono font-black text-sm">{formatUSD(toolDef.costUSD)}</span></div>
                                                            <div className="bg-black/30 p-3 rounded-2xl border border-gray-700 text-center"><span className="text-[9px] text-gray-500 font-bold mb-1 block uppercase">BRL (R$)</span><span className="text-green-500/80 font-mono font-black text-sm">{formatBRL(costBRL)}</span></div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-2">
                                                                <Percent className="w-3.5 h-3.5" /> Margem de Lucro (%)
                                                            </label>
                                                            <div className="flex items-center gap-1 bg-gray-800 px-3 py-1 rounded-lg border border-gray-600">
                                                                <input
                                                                    type="number"
                                                                    className="w-12 bg-transparent text-white font-black text-right outline-none text-sm"
                                                                    value={toolState.profitMargin}
                                                                    onChange={(e) => handleUpdateMargin(toolDef.id, parseFloat(e.target.value) || 0)}
                                                                />
                                                                <span className="text-xs text-gray-500">%</span>
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="30"
                                                            max="500"
                                                            step="5"
                                                            value={toolState.profitMargin}
                                                            onChange={(e) => handleUpdateMargin(toolDef.id, parseFloat(e.target.value))}
                                                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                                        />
                                                    </div>

                                                    <div className={`p-5 rounded-3xl border shadow-inner transition-colors ${margin < 35 ? 'bg-red-900/20 border-red-500/40' : 'bg-gray-900/80 border-brand-primary/20'}`}>
                                                        <div className="flex justify-between items-center">
                                                            <label className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2"><Coins className="w-3.5 h-3.5" /> Preço Aluno (Créditos)</label>
                                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-xl border border-gray-600">
                                                                <input
                                                                    type="number"
                                                                    className="w-16 bg-transparent text-white font-black text-right outline-none text-base"
                                                                    value={toolState.costPerTask}
                                                                    onChange={(e) => handleUpdateCreditPriceDirect(toolDef.id, parseFloat(e.target.value) || 0)}
                                                                />
                                                                <span className="text-[9px] text-gray-500 font-black">CRÉD</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 rounded-2xl border bg-green-500/5 border-green-500/20 flex justify-between items-center shadow-lg">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Ganho Líquido</span>
                                                            <span className="font-black text-lg text-green-400">{formatBRL(profitBRL)}</span>
                                                        </div>
                                                        <div className="text-right flex flex-col">
                                                            <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Preço/Unid</span>
                                                            <span className="font-black text-lg text-white">{formatBRL(revenueBRL)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
