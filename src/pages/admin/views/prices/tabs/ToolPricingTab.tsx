import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calculator, Search, Save, AlertTriangle, CheckCircle, Check, Coins, DollarSign, RefreshCw, TrendingUp, Server, Brain, ShieldCheck, Zap, Box, ActivityIcon, Users, Mic, List, PlayCircle, Percent
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
    const [globalThresholdInput, setGlobalThresholdInput] = useState(10); // Default to 10%

    // Platform Fees & Costs (State for Simulator)
    const [lucPayFee, setLucPayFee] = useState(2.0); // %
    const [hostingCost, setHostingCost] = useState(0.05); // R$ per credit amortized
    const [marketingFee, setMarketingFee] = useState(1.0); // % for Ads
    const [stripeFee, setStripeFee] = useState(2.99); // % Gateway

    // Smart Analysis
    const criticalTools = tools.filter(t => t.profitMargin < 40);
    const avgMargin = tools.reduce((acc, t) => acc + t.profitMargin, 0) / (tools.length || 1);
    const textStatus = avgMargin < 50 ? 'danger' : avgMargin < 80 ? 'warning' : 'success';

    const fetchRealUSD = async () => {
        setIsFetchingRate(true);
        try {
            const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
            const data = await response.json();
            const rate = parseFloat(data.USDBRL.bid);
            setUsdRate(rate);
            toast.success(`Dólar atualizado: R$ ${rate.toFixed(2)} `, { icon: '💵' });
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
                if (settings.globalProtectionThreshold) {
                    setGlobalThresholdInput(settings.globalProtectionThreshold);
                }
                if (settings.creditValueBRL) {
                    setCreditValueBRL(settings.creditValueBRL);
                }

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
                    targetMargin: safeMargin, // Update target when manual change happens
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

    const handleBulkAdjustment = (type: 'all' | 'critical', percent: number) => {
        setTools(prev => prev.map(t => {
            if (type === 'critical' && t.profitMargin >= 40) return t; // Skip healthy tools

            const costBRL = t.realCostEstimate * usdRate;
            const currentMargin = t.profitMargin;
            const newMargin = currentMargin + percent;

            // Recalculate credit price based on new margin
            const newCreditCost = (costBRL * (1 + (newMargin / 100))) / creditValueBRL;

            return {
                ...t,
                profitMargin: newMargin,
                costPerTask: Math.ceil(newCreditCost * 100) / 100
            };
        }));
        toast.success(type === 'all' ? `Margem global aumentada em + ${percent}% ` : `Corrigido ferramentas críticas em + ${percent}% `);
        toast.success(type === 'all' ? `Margem global aumentada em + ${percent}% ` : `Corrigido ferramentas críticas em + ${percent}% `);
    };

    const handleUpdateTrigger = (toolId: string, val: number) => {
        setTools(prev => prev.map(t => t.toolId === toolId ? { ...t, triggerThreshold: val } : t));
    };

    const handleSaveCreditValue = async () => {
        try {
            const currentSettings = await getSystemSettings();
            await saveSystemSettings({ ...currentSettings, creditValueBRL });
            toast.success("Valor do Crédito salvo com sucesso!");
        } catch (error) {
            toast.error("Erro ao salvar valor do crédito.");
        }
    };

    const handleSimulateRisk = () => {
        // Simulates a cost spike (e.g., Dollar goes to R$ 7.00) to test protection
        setUsdRate(7.00);
        toast('⚠️ CÂMBIO SIMULADO: Dólar a R$ 7.00! Verifique se a Proteção IA reage.', { icon: '📉', duration: 5000 });
        // In real app, this would trigger the backend check. Here we rely on the periodic loop in NexusCore or trigger it manually if possible.
        // For visual test, user just waits for the next "health check" interval or we force a refresh if connected.
    };

    const handleToggleAutoAdjust = (toolId: string) => {
        setTools(prev => prev.map(t => {
            if (t.toolId === toolId) {
                return { ...t, autoAdjust: !t.autoAdjust, targetMargin: t.profitMargin }; // Set current margin as target when enabling
            }
            return t;
        }));
        toast.success("Proteção Atualizada");
    };

    const handleRevertAdjustment = (toolId: string) => {
        setTools(prev => prev.map(t => {
            if (t.toolId === toolId && t.lastAutoAdjustment) {
                const oldPrice = t.lastAutoAdjustment.oldPrice;
                const costBRL = t.realCostEstimate * usdRate;
                const revenueBRL = oldPrice * creditValueBRL;
                const recoveredMargin = ((revenueBRL - costBRL) / costBRL) * 100;

                return {
                    ...t,
                    costPerTask: oldPrice,
                    profitMargin: recoveredMargin,
                    lastAutoAdjustment: undefined // Clear backup
                };
            }
            return t;
        }));
        toast.success("Preço revertido ao valor anterior.");
    };



    const handleRunAnalysis = () => {
        const critical = tools.filter(t => t.profitMargin < 40);
        const avg = tools.reduce((acc, t) => acc + t.profitMargin, 0) / (tools.length || 1);

        if (critical.length > 0) {
            toast((t) => (
                <div className="flex items-center gap-2">
                    <AlertTriangle className="text-red-500 w-6 h-6" />
                    <div>
                        <p className="font-bold">Atenção Necessária</p>
                        <p className="text-xs">{critical.length} ferramentas com margem crítica.</p>
                    </div>
                </div>
            ), { duration: 5000 });
        } else if (avg < 50) {
            toast((t) => (
                <div className="flex items-center gap-2">
                    <TrendingUp className="text-yellow-500 w-6 h-6" />
                    <div>
                        <p className="font-bold">Margem Média Baixa ({avg.toFixed(0)}%)</p>
                        <p className="text-xs">Considere um ajuste global.</p>
                    </div>
                </div>
            ), { duration: 4000 });
        } else {
            toast.success("Saúde Financeira Excelente! Margens estáveis.", { icon: '🤖' });
        }
    };

    const handleSetGlobalTrigger = async () => {
        if (globalThresholdInput === 0) return;

        // 1. Update local tools state for immediate feedback
        setTools(prev => prev.map(t => ({
            ...t,
            triggerThreshold: globalThresholdInput
        })));

        // 2. Persist to System Settings (Global Trigger)
        try {
            const currentSettings = await getSystemSettings();
            await saveSystemSettings({
                ...currentSettings,
                globalProtectionThreshold: globalThresholdInput
            });
            toast.success(`Gatilho de ${globalThresholdInput}% definido globalmente!`, { icon: '🛡️' });
        } catch (error) {
            toast.error("Erro ao salvar gatilho global.");
        }
    };

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
            {/* --- TOP ROW: FINANCIAL CORE & METRICS --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* 1. NEXUS FINANCIAL CORE (Clean & Compact) */}
                <div className="xl:col-span-1 bg-gray-900 border border-gray-700 p-6 rounded-3xl relative overflow-hidden shadow-xl flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="p-3 bg-brand-primary/10 rounded-xl border border-brand-primary/20 shadow-inner">
                            <Brain className={`w-8 h-8 ${isNexusActive ? 'text-brand-primary animate-pulse' : 'text-gray-500'} `} />
                        </div>
                        <div>
                            <h4 className="text-white font-black text-xl uppercase tracking-tight">Nexus Core</h4>
                            <p className="text-xs text-gray-500 font-bold uppercase">Matriz Financeira</p>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="bg-black/30 p-3 rounded-xl border border-gray-700 flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 font-black uppercase">Câmbio Base (USD)</span>
                            <div className="flex items-center gap-2">
                                <span className="text-green-500 font-mono font-bold text-sm">$1 = </span>
                                <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1 border border-gray-600">
                                    <span className="text-xs text-gray-400">R$</span>
                                    <input type="number" step="0.01" className="w-20 bg-transparent text-white font-mono text-sm outline-none text-right" value={usdRate} onChange={e => setUsdRate(parseFloat(e.target.value) || 0)} />
                                </div>
                                <button onClick={fetchRealUSD} className="text-brand-primary hover:text-white transition-colors" title="Atualizar Cotação"><RefreshCw className={`w-3 h-3 ${isFetchingRate ? 'animate-spin' : ''}`} /></button>
                            </div>
                        </div>

                        <div className="bg-black/30 p-3 rounded-xl border border-gray-700 flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 font-black uppercase">Valor do Crédito</span>
                            <div className="flex items-center gap-1.5 border border-transparent">
                                <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1 border border-gray-600">
                                    <span className="text-xs text-brand-primary font-bold">R$</span>
                                    <input type="number" step="0.01" className="w-20 bg-transparent text-white font-mono text-sm outline-none text-right" value={creditValueBRL} onChange={e => setCreditValueBRL(parseFloat(e.target.value) || 0)} />
                                </div>
                                <button onClick={handleSaveCreditValue} className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 p-1.5 rounded-lg transition-all flex-shrink-0 flex items-center justify-center shadow-lg shadow-green-900/10" title="Confirmar Valor">
                                    <Check className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                                <List className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{tools.length} Ferramentas</span>
                            </div>
                            <button onClick={() => setIsNexusActive(!isNexusActive)} className={`px-2 py-1 rounded-md font-bold text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition-all border ${isNexusActive ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20 shadow-[0_0_10px_rgba(255,215,0,0.1)]' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>
                                {isNexusActive ? <ShieldCheck className="w-3 h-3" /> : <Zap className="w-3 h-3" />} Proteção {isNexusActive ? 'ON' : 'OFF'}
                            </button>
                        </div>

                        {/* GLOBAL ACTIONS SECTION */}
                        <div className="border-t border-gray-800 pt-3 mt-1 space-y-2">
                            <label className="text-[9px] text-gray-500 font-black uppercase flex items-center gap-1"><ActivityIcon className="w-3 h-3" /> Gatilho Global</label>

                            <div className="grid grid-cols-2 gap-2">
                                {/* Trigger Input */}
                                <div className="col-span-1 bg-gray-800/50 rounded-lg p-1 flex items-center border border-gray-700 focus-within:border-brand-primary/30 transition-colors">
                                    <input
                                        type="number"
                                        placeholder="Gatilho ± %"
                                        className="w-full bg-transparent text-white text-[10px] px-2 outline-none font-mono placeholder:text-gray-600 font-bold"
                                        value={globalThresholdInput || ''}
                                        onChange={e => setGlobalThresholdInput(parseFloat(e.target.value))}
                                    />
                                    <button onClick={handleSetGlobalTrigger} className="bg-brand-primary hover:bg-yellow-400 text-black text-[9px] font-black px-2 py-1 rounded transition-colors whitespace-nowrap">
                                        DEFINIR
                                    </button>
                                </div>

                                {/* AI Analysis */}
                                <button onClick={handleRunAnalysis} className="col-span-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-1.5 transition-all">
                                    <Brain className="w-3 h-3" /> Análise IA
                                </button>
                            </div>

                            {/* Risk Simulation */}
                            <button onClick={handleSimulateRisk} className="w-full bg-red-500/5 hover:bg-red-500/10 text-red-400/80 hover:text-red-400 border border-red-500/10 hover:border-red-500/30 rounded-lg text-[9px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all py-1.5 mt-1">
                                <AlertTriangle className="w-3 h-3" /> Simular Risco Câmbio
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. CONFIGURAR TAXAS & SIMULADOR (Enhanced) */}
                <div className="xl:col-span-2 bg-gray-900 border border-gray-700 p-6 rounded-3xl relative overflow-hidden shadow-xl">
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>

                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><TrendingUp className="w-6 h-6" /></div>
                            <div>
                                <h4 className="text-white font-black text-lg uppercase tracking-tight">Taxas da Plataforma & Split</h4>
                                <p className="text-xs text-gray-400">Simulação de distribuição de receita por Crédito vendido.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* NEXUS INTELLIGENCE ACTIONS */}
                            {(textStatus === 'danger' || criticalTools.length > 0) && (
                                <div className="flex gap-1 animate-fade-in">
                                    <Button onClick={() => handleBulkAdjustment('critical', 5)} className="!py-1.5 !px-3 !text-[9px] uppercase font-black !bg-red-600 hover:!bg-red-500">
                                        <AlertTriangle className="w-3 h-3 mr-1" /> Corrigir Críticas (+5%)
                                    </Button>
                                    <Button onClick={() => handleBulkAdjustment('all', 2)} className="!py-1.5 !px-3 !text-[9px] uppercase font-black !bg-yellow-600 hover:!bg-yellow-500">
                                        <TrendingUp className="w-3 h-3 mr-1" /> Ajuste Global (+2%)
                                    </Button>
                                </div>
                            )}
                            <Button onClick={handleSaveAll} isLoading={isSaving} className="!py-1.5 !px-4 !text-[10px] uppercase font-black !bg-green-600 hover:!bg-green-500 shadow-lg shadow-green-900/20">
                                <Save className="w-3 h-3 mr-2" /> Salvar Config
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 relative z-10">
                        {/* 1. INPUTS & INTELLIGENCE (Top Section) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Inputs de Taxas */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="col-span-2 grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="text-[9px] text-gray-500 uppercase font-black mb-1 block">Stripe (%)</label>
                                        <div className="bg-gray-800 border border-gray-600 rounded-lg flex items-center px-2 py-2">
                                            <Server className="w-3 h-3 text-purple-400 mr-1" />
                                            <input type="number" step="0.01" value={stripeFee} onChange={e => setStripeFee(parseFloat(e.target.value))} className="w-full bg-transparent text-white font-mono text-sm outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-gray-500 uppercase font-black mb-1 block">LucPay (%)</label>
                                        <div className="bg-gray-800 border border-gray-600 rounded-lg flex items-center px-2 py-2">
                                            <Percent className="w-3 h-3 text-blue-500 mr-1" />
                                            <input type="number" step="0.1" value={lucPayFee} onChange={e => setLucPayFee(parseFloat(e.target.value))} className="w-full bg-transparent text-white font-mono text-sm outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-gray-500 uppercase font-black mb-1 block">Marketing (%)</label>
                                        <div className="bg-gray-800 border border-gray-600 rounded-lg flex items-center px-2 py-2">
                                            <Percent className="w-3 h-3 text-pink-500 mr-1" />
                                            <input type="number" step="0.1" value={marketingFee} onChange={e => setMarketingFee(parseFloat(e.target.value))} className="w-full bg-transparent text-white font-mono text-sm outline-none" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[9px] text-gray-500 uppercase font-black mb-1 block flex items-center gap-2">Custo Hospedagem (Invisível) <Server className="w-3 h-3" /></label>
                                    <div className="bg-gray-800 border border-gray-600 rounded-lg flex items-center px-3 py-2">
                                        <span className="text-gray-500 text-xs mr-2">R$</span>
                                        <input type="number" step="0.01" value={hostingCost} onChange={e => setHostingCost(parseFloat(e.target.value))} className="w-full bg-transparent text-white font-mono text-sm outline-none" />
                                        <span className="text-[9px] text-gray-600 uppercase font-bold">/ Crédito</span>
                                    </div>
                                    <p className="text-[9px] text-gray-500 mt-1 italic">*Custo médio de infraestrutura por unidade vendida.</p>
                                </div>
                            </div>

                            {/* Nexus Insight Box (Right Side of Inputs) */}
                            <div className={`p-4 rounded-xl border flex flex-col justify-center gap-3 transition-colors ${textStatus === 'danger' ? 'bg-red-900/20 border-red-500/30' : 'bg-gray-800 border-gray-700'} `}>
                                <div className="flex items-center gap-3">
                                    <Brain className={`w-8 h-8 ${textStatus === 'danger' ? 'text-red-500' : 'text-gray-400'} `} />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Nexus Intelligence</p>
                                        <p className="text-xs text-gray-400 italic leading-snug">
                                            {textStatus === 'danger'
                                                ? `Alerta: ${criticalTools.length} ferramentas com margem crítica(< 40 %).`
                                                : "Monitoramento Ativo. Margens saudáveis e sistema estável."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. SIMULATOR (Full Width Bottom) */}
                        <div className="bg-black/20 rounded-xl p-6 border border-gray-700/50">
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-4 flex justify-between items-center border-b border-gray-800 pb-2">
                                <span className="flex items-center gap-2"><ActivityIcon className="w-4 h-4" /> Simulação de Transação (Venda Limpa R$ 100,00)</span>
                                <div className="text-right">
                                    <span className="block text-[9px] text-gray-500">Taxa Total Produtor: <span className="text-red-400">{(lucPayFee + marketingFee + stripeFee).toFixed(2)}%</span></span>
                                    <span className="text-white">Repasse Líquido: <span className="text-green-400 font-mono text-lg">{(100 - (100 * (lucPayFee + marketingFee + stripeFee) / 100)).toFixed(2)}%</span></span>
                                </div>
                            </p>

                            <div className="w-full h-8 bg-gray-800 rounded-lg overflow-hidden flex mb-6 shadow-inner relative">
                                <div className="h-full bg-purple-600 flex items-center justify-center text-[9px] font-bold text-white/90" style={{ width: `${stripeFee}% ` }} title={`Stripe: ${stripeFee}% `}>{stripeFee > 4 && `${stripeFee}% `}</div>
                                <div className="h-full bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white/90" style={{ width: `${lucPayFee}% ` }} title={`LucPay: ${lucPayFee}% `}>{lucPayFee > 3 && `${lucPayFee}% `}</div>
                                <div className="h-full bg-pink-600 flex items-center justify-center text-[9px] font-bold text-white/90" style={{ width: `${marketingFee}% ` }} title={`Marketing: ${marketingFee}% `}>{marketingFee > 3 && `${marketingFee}% `}</div>
                                <div className="h-full bg-gray-500 flex items-center justify-center text-[9px] font-bold text-white/50" style={{ width: `${hostingCost * 100}% ` }} title={`Infra: ${(hostingCost * 100).toFixed(1)}% `}></div>
                                <div className="h-full bg-green-500 flex items-center justify-center text-[10px] font-bold text-black/80" style={{ flex: 1 }} title="Lucro Bruto Plataforma">REPASSE</div>
                            </div>

                            <div className="flex justify-between gap-4 text-[11px] px-2">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-600 rounded"></div> <span className="text-gray-300">Gateway Stripe ({stripeFee}%)</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-600 rounded"></div> <span className="text-gray-300">Taxa LucPay ({lucPayFee}%)</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-pink-600 rounded"></div> <span className="text-gray-300">Marketing ({marketingFee}%)</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-500 rounded"></div> <span className="text-gray-400">Infra (~{formatBRL(hostingCost)})</span></div>
                            </div>
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

            {
                loading ? <div className="flex justify-center p-20"><LoadingSpinner size="lg" /></div> : (
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
                                                <motion.div key={toolDef.id} className={`bg-gray-800 border rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-2xl relative ${isNexusActive && margin < 35 ? 'border-yellow-500 bg-yellow-900/5 shadow-yellow-900/10' : isAudio ? 'border-purple-500/40' : 'border-gray-700 hover:border-brand-primary/50'} `}>
                                                    <div className="p-6 bg-gray-900/50 border-b border-gray-700 flex justify-between items-start">
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <h4 className="font-black text-white text-base leading-tight truncate" title={toolDef.label}>{toolDef.label}</h4>
                                                            <p className="text-[9px] text-gray-500 font-mono mt-1 uppercase tracking-widest">{toolDef.id}</p>
                                                        </div>
                                                        <div className={`p-2 rounded-xl flex-shrink-0 ${isAudio ? 'bg-purple-500/20 text-purple-400' : toolDef.billingType === 'monthly' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/10 text-green-400'} `}>{isAudio ? <Mic className="w-5 h-5" /> : <Box className="w-5 h-5" />}</div>
                                                    </div>

                                                    {/* AUTO-PROTECT ALERT */}
                                                    <div className="px-6 pt-4">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <button
                                                                onClick={() => handleToggleAutoAdjust(toolDef.id)}
                                                                className={`flex items-center gap-2 text-[10px] uppercase font-black px-3 py-1.5 rounded-lg border transition-all ${toolState.autoAdjust ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-500'} `}
                                                            >
                                                                <ShieldCheck className={`w-3.5 h-3.5 ${toolState.autoAdjust ? 'animate-pulse' : ''} `} />
                                                                {toolState.autoAdjust ? 'Proteção Ativa' : 'Proteção Inativa'}
                                                            </button>

                                                            {/* Always visible Trigger Input */}
                                                            <div className={`flex items-center gap-2 transition-opacity ${toolState.autoAdjust ? 'opacity-100' : 'opacity-40 hover:opacity-100'} `}>
                                                                <span className="text-[10px] text-gray-500 font-bold uppercase">Gatilho:</span>
                                                                <div className="flex items-center bg-gray-800 border-gray-700 border rounded-lg px-2 py-1">
                                                                    <span className="text-xs text-gray-400 mr-1">±</span>
                                                                    <input
                                                                        type="number"
                                                                        className="w-10 bg-transparent text-white text-xs font-mono outline-none text-center font-bold"
                                                                        value={toolState.triggerThreshold || 10}
                                                                        onChange={(e) => handleUpdateTrigger(toolDef.id, parseFloat(e.target.value) || 10)}
                                                                    />
                                                                    <span className="text-[10px] text-gray-500 font-bold">%</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {toolState.lastAutoAdjustment && (
                                                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 flex items-center justify-between mb-2">
                                                                <div>
                                                                    <p className="text-[9px] text-yellow-500 font-bold uppercase flex items-center gap-1"><Zap className="w-3 h-3" /> IA Reajustou Preço</p>
                                                                    <p className="text-[9px] text-gray-400">De {toolState.lastAutoAdjustment.oldPrice} para {toolState.lastAutoAdjustment.newPrice} créditos.</p>
                                                                </div>
                                                                <button onClick={() => handleRevertAdjustment(toolDef.id)} className="text-[9px] bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-2 py-1 rounded border border-yellow-500/30 uppercase font-black">
                                                                    Reverter
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-6 space-y-6 pt-2">
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

                                                        <div className={`p-5 rounded-3xl border shadow-inner transition-colors ${margin < 35 ? 'bg-red-900/20 border-red-500/40' : 'bg-gray-900/80 border-brand-primary/20'} `}>
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
                )
            }
        </div >
    );
};
