
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/Card';
import Button from '../../components/Button';

import { Monitor, Zap, AlertTriangle, CheckCircle, TrendingUp, Search, Activity, ArrowRight, ArrowLeft, PlusCircle, LockClosed } from '../../components/Icons';
import { Course, ProducerWallet } from '../../types/legacy';

import { getProducerWallet, debitWallet, getWinningProductMatch, getToolCosts } from '../../services/mockFirebase';
import { WinningProductProfile, NexusProductDNA as ProductDNA } from '../../types/nexus';
import { toast } from 'react-hot-toast';

// --- SUB-COMPONENTS ---

const NexusDossier = ({ product, onBack, onStatusUpdate }: { product: Course, onBack: () => void, onStatusUpdate: (id: string, status: string) => void }) => {
    const [winner, setWinner] = useState<WinningProductProfile | null>(null);
    const [wallet, setWallet] = useState<ProducerWallet | null>(null);
    const [viewState, setViewState] = useState<'SCANNING' | 'REPORT' | 'MONITORING'>('SCANNING');
    const [scanProgress, setScanProgress] = useState(0);
    const [currentAction, setCurrentAction] = useState("Inicializando satélites Nexus...");

    // --- State for Execution Engine ---
    const [repairingId, setRepairingId] = useState<string | null>(null);
    const [solvedIds, setSolvedIds] = useState<string[]>([]);
    const [executionLogs, setExecutionLogs] = useState<string[]>([]);
    const [repairProgress, setRepairProgress] = useState(0);

    // Mock logs for simulation
    const repairSteps = [
        "Iniciando handshake com servidor de anúncios...",
        "Analisando estrutura do DOM...",
        "Detectando gargalos de conversão...",
        "Reescrevendo copy com PNL avançada...",
        "Otimizando scripts de checkout...",
        "Injetando pixels de rastreamento faltantes...",
        "Validando integridade do funil...",
        "Aplicando correções finais..."
    ];

    // Queue System
    const [repairQueue, setRepairQueue] = useState<any[]>([]);
    const [isBatchRepairing, setIsBatchRepairing] = useState(false);
    const [batchConfirmation, setBatchConfirmation] = useState<{ total: number, items: any[] } | null>(null);

    useEffect(() => {
        init();
    }, []);

    // Queue Processor
    useEffect(() => {
        if (repairQueue.length > 0 && !repairingId) {
            const next = repairQueue[0];
            const remaining = repairQueue.slice(1);
            setRepairQueue(remaining);
            triggerSingleRepair(next.id, next.title);
        } else if (repairQueue.length === 0 && isBatchRepairing && !repairingId) {
            setIsBatchRepairing(false);
            toast.success("Ciclo de Otimização Completo! Monitoramento Ativado.", {
                icon: '🔭',
                duration: 5000
            });
            setViewState('MONITORING');
            onStatusUpdate(product.id, 'monitoring');
        }
    }, [repairQueue, repairingId, isBatchRepairing]);

    const init = async () => {
        const [w] = await Promise.all([getProducerWallet()]);
        setWallet(w);

        // Simulate Scan if first time (mocked)
        simulateScan();
    };

    const simulateScan = async () => {
        const stages = [
            "Conectando ao núcleo Nexus Neural...",
            "Interceptando tráfego de concorrentes...",
            "Decodificando estratégias de Copywriting...",
            "Analisando 12.402 Funis de Venda...",
            "Identificando padrões de alta conversão...",
            "Calculando métricas de rejeição do seu produto...",
            "Cruzando dados com Banco Central de Vendas...",
            "Gerando matriz de reparação financeira...",
            "Finalizando Dossiê da Verdade."
        ];

        for (let i = 0; i < stages.length; i++) {
            setCurrentAction(stages[i]);
            setScanProgress(((i + 1) / stages.length) * 100);
            await new Promise(r => setTimeout(r, 800)); // Slower, more impactful
        }

        // Mock Winner Match
        const mockDNA: ProductDNA = {
            productId: product.id,
            niche: (product.niche as any) || 'Wealth',
            subNiche: 'Marketing',
            format: 'Course',
            pricePoint: 97,
            targetAudience: { ageRange: [25, 45], gender: 'Male', painPoints: [] },
            funnelStructure: [],
            alignmentScore: 40
        };
        // Type assertion to bypass ambiguous ProductDNA definition in mockFirebase
        const win = await getWinningProductMatch(mockDNA as any);
        setWinner(win);
        setViewState('REPORT');
    };

    const handleDebit = async (cost: number) => {
        if (!wallet || wallet.balance < cost) {
            toast.error("Saldo insuficiente.");
            return false;
        }
        // Using 'service_usage' which seems to be the expected literal based on previous compilation errors
        await debitWallet(cost, `Reparação Nexus`, 'service_usage' as any);
        setWallet(prev => prev ? { ...prev, balance: prev.balance - cost } : null);
        return true;
    }

    const triggerSingleRepair = (id: string, title: string) => {
        setRepairingId(id);
        setRepairProgress(0);
        setExecutionLogs(["Inicializando Agente de Reparo v4.0..."]);

        let step = 0;
        const interval = setInterval(() => {
            if (step >= repairSteps.length) {
                clearInterval(interval);
                setRepairingId(null);
                setSolvedIds(prev => [...prev, id]);
                toast.success(`"${title}" corrigido com sucesso!`, {
                    style: { background: '#10B981', color: '#fff' },
                    icon: '🚀'
                });
            } else {
                setExecutionLogs(prev => [...prev.slice(-4), repairSteps[step]]);
                setRepairProgress(Math.floor(((step + 1) / repairSteps.length) * 100));
                step++;
            }
        }, 1200); // 1.2s per step for more "weight"
    };

    const executeRepair = async (id: string, cost: number, title: string) => {
        const problemsList = [
            { id: 'fix_headline', cost: 35, title: 'Conversão de Headline' },
            { id: 'fix_funnel', cost: 50, title: 'Estrutura de Checkout' },
            { id: 'fix_recovery', cost: 80, title: 'Recuperação de Vendas' }
        ];

        if (repairingId || isBatchRepairing) {
            console.log("Busy: Repairing or Batch Repairing active.");
            return;
        }

        if (id === 'ALL') {
            console.log("Execute Repair: ALL initiated.");
            const pending = problemsList.filter(p => !solvedIds.includes(p.id));
            if (pending.length === 0) {
                console.log("Execute Repair: No pending items.");
                return;
            }

            const total = Math.floor(pending.reduce((acc, p) => acc + p.cost, 0) * 0.9);
            console.log(`Execute Repair: Total cost calculated: ${total}`);

            // Replace window.confirm with custom modal state
            setBatchConfirmation({ total, items: pending });
            return;
        }

        // Single Repair Logic
        if (cost > 0) {
            const paid = await handleDebit(cost);
            if (!paid) return;
        }

        triggerSingleRepair(id, title);
    };

    const confirmBatchRepair = async () => {
        if (!batchConfirmation) return;
        const { total, items } = batchConfirmation;

        console.log("Batch Repair Confirmed via Modal. Processing debit...");
        const canPay = await handleDebit(total);
        if (!canPay) {
            setBatchConfirmation(null);
            return;
        }

        console.log("Debit successful. Starting batch repair.");
        setIsBatchRepairing(true);
        setRepairQueue(items);
        setBatchConfirmation(null);
    };

    if (viewState === 'MONITORING') {
        const monitoringMetrics = [
            { label: 'Taxa de Conversão', before: '1.2%', after: '3.8%', lift: '+216%', icon: TrendingUp, color: 'green' },
            { label: 'Custo por Lead', before: 'R$ 4.50', after: 'R$ 1.80', lift: '-60%', icon: Zap, color: 'blue' },
            { label: 'Checkout Abandonado', before: '68%', after: '22%', lift: '-46%', icon: AlertTriangle, color: 'yellow' }
        ];

        return (
            <div className="max-w-6xl mx-auto pb-20 animate-fade-in px-4 md:px-0">
                <div className="flex items-center gap-4 mb-8 pt-4">
                    <Button variant="ghost" onClick={onBack} className="!p-0 text-gray-400 hover:text-white">← Voltar</Button>
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase flex items-center gap-2">
                            <Monitor className="text-purple-500 animate-pulse" /> Monitoramento Ativo
                        </h1>
                        <p className="text-gray-400 text-sm">Vigilância Neural: <strong>Dia 1 de 30</strong></p>
                    </div>
                </div>

                {/* STATUS CARD */}
                <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-2xl p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <Activity className="w-24 h-24 text-green-500/20" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white mb-2">Protocolo de Segurança Ativado</h3>
                        <p className="text-gray-300 max-w-2xl mb-6">
                            O Agente Nexus está monitorando seu tráfego em tempo real. Qualquer anomalia na conversão ou aumento de CPC será interceptado e corrigido instantaneamente.
                        </p>
                        <div className="flex gap-4">
                            <div className="bg-black/40 px-4 py-2 rounded-lg border border-green-500/30 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-400 font-bold uppercase">Pixel Guard: ON</span>
                            </div>
                            <div className="bg-black/40 px-4 py-2 rounded-lg border border-green-500/30 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-400 font-bold uppercase">Copy Defender: ON</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* METRICS COMPARISON */}
                <h3 className="text-xl font-bold text-white mb-6">Relatório de Impacto Imediato</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {monitoringMetrics.map((m, i) => (
                        <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500/30 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg bg-${m.color}-500/10 text-${m.color}-500`}>
                                    <m.icon className="w-6 h-6" />
                                </div>
                                <span className={`text-lg font-black ${m.lift.startsWith('+') ? 'text-green-500' : 'text-blue-400'}`}>
                                    {m.lift}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm font-bold uppercase mb-4">{m.label}</p>
                            <div className="flex items-center justify-between text-sm">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase">Antes</p>
                                    <p className="text-gray-400 font-mono">{m.before}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-600" />
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase">Agora</p>
                                    <p className="text-white font-bold font-mono text-lg">{m.after}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <p className="text-gray-500 text-xs mb-4">O próximo relatório detalhado será gerado em 29 dias.</p>
                    <Button variant="outline" className="opacity-50 hover:opacity-100">
                        Exportar PDF Preliminar
                    </Button>
                </div>
            </div>
        );
    }

    if (viewState === 'SCANNING') {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] relative overflow-hidden bg-black">
                {/* Matrix Rain Effect Background */}
                <div className="absolute inset-0 opacity-20">
                    <div className="grid grid-cols-12 gap-1 h-full animate-pulse">
                        {Array.from({ length: 144 }).map((_, i) => (
                            <div key={i} className="text-[10px] sm:text-xs text-green-500 font-mono overflow-hidden whitespace-nowrap opacity-50">
                                {Math.random().toString(36).substring(2)}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 w-full max-w-2xl px-8 flex flex-col items-center">
                    <div className="w-32 h-32 mb-8 relative">
                        <div className="absolute inset-0 border-4 border-green-500/30 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 border-4 border-t-green-500 rounded-full animate-spin"></div>
                        <Monitor className="w-16 h-16 text-green-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>

                    <h2 className="text-3xl font-black text-white mb-2 text-center uppercase tracking-widest glitch-effect">
                        RAIO-X NEXUS
                    </h2>
                    <p className="text-green-400 font-mono text-center mb-8 h-6">
                        {currentAction}
                    </p>

                    <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-800">
                        <div
                            className="bg-green-500 h-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(34,197,94,0.8)]"
                            style={{ width: `${scanProgress}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between w-full text-xs text-gray-500 mt-2 font-mono">
                        <span>CPU: 89%</span>
                        <span>NET: 1.2GB/s</span>
                        <span>TARGETS: 12.4K</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!winner) return null;

    const problems = [
        {
            id: 'fix_headline',
            title: 'Conversão de Headline (Promessa)',
            yourMetric: '12% de Retenção',
            winnerMetric: '48% de Retenção',
            yourDesc: 'Sua promessa está vaga e não gera curiosidade imediata.',
            winnerDesc: 'Usa "Mecanismo Único" e prova social no 1º segundo.',
            cost: 35,
            severity: 'critical'
        },
        {
            id: 'fix_funnel',
            title: 'Estrutura de Checkout',
            yourMetric: 'R$ 97,00 (Sem Upsell)',
            winnerMetric: 'R$ 147,00 (Com Order Bump)',
            yourDesc: 'Você está perdendo dinheiro por não oferecer complementos.',
            winnerDesc: '22% dos compradores levam o Order Bump de R$ 27,00.',
            cost: 50,
            severity: 'critical'
        },
        {
            id: 'fix_recovery',
            title: 'Recuperação de Vendas',
            yourMetric: '0% (Manual)',
            winnerMetric: '32% (Bot Automático)',
            yourDesc: 'Seu tráfego pago está vazando pelo checkout sem retorno.',
            winnerDesc: 'Resgata 3 a cada 10 carrinhos abandonados em 5 min.',
            cost: 80,
            severity: 'high'
        }
    ];

    const totalCost = problems.reduce((acc, p) => acc + p.cost, 0);

    // ... (inside NexusDossier) ...
    return (
        <div className="max-w-6xl mx-auto pb-48 animate-fade-in px-4 md:px-0">
            {/* Header / Nav - Mobile Optimized */}
            <div className="flex items-center gap-2 md:gap-4 mb-4 pt-4">
                <Button variant="ghost" onClick={onBack} className="!p-0 min-w-[40px] text-gray-400 hover:text-white flex items-center justify-center rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                    <span className="hidden md:inline ml-2">Voltar</span>
                </Button>
                <div className="flex-1 overflow-hidden">
                    <h1 className="text-lg md:text-2xl font-black text-white uppercase flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
                        <AlertTriangle className="text-red-500 animate-pulse flex-shrink-0" /> <span className="truncate">Dossiê Forense de Mercado</span>
                    </h1>
                    <p className="text-gray-400 text-xs md:text-sm truncate">Relatório Confidencial para <strong>{product.title}</strong></p>
                </div>
                <div className="hidden md:block ml-auto bg-gray-900 border border-gray-800 px-4 py-2 rounded-lg text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Saldo Disponível</p>
                    <p className="font-bold text-white">{wallet?.balance || 0} créditos</p>
                </div>
            </div>

            {/* HEADER COMPARISON CARD */}
            <div className="bg-gray-900 border border-gray-800 p-6 md:p-8 mb-12 rounded-3xl relative overflow-hidden">
                <div className="grid grid-cols-3 gap-2 md:gap-8 items-center relative z-10">
                    {/* WINNER (LEFT) */}
                    <div className="text-center flex flex-col items-center">
                        <div className="relative mx-auto mb-2 md:mb-4 w-16 h-16 md:w-20 md:h-20">
                            <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center border-4 border-yellow-200 shadow-lg overflow-hidden">
                                {/* Winner Logo Mock */}
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(winner.name)}&background=FBBF24&color=fff&size=128`}
                                    alt="Winner"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="absolute -top-2 -right-3 md:-right-4 bg-green-500 text-white text-[8px] md:text-[10px] font-bold px-2 py-1 rounded shadow-lg z-20 border-2 border-gray-900">TOP 1%</span>
                        </div>
                        <p className="text-yellow-500/80 text-xs md:text-sm mb-1 font-bold line-clamp-1">{winner.name}</p>
                        <p className="text-lg md:text-2xl font-black text-yellow-400">R$ {(winner.monthlyRevenue / 1000).toFixed(0)}k<span className="text-[10px] md:text-sm font-normal text-yellow-600/80">/mês</span></p>
                    </div>

                    {/* VS - TEXT ONLY */}
                    <div className="flex flex-col items-center justify-center py-2">
                        <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] md:text-xs px-2 md:px-4 py-1 md:py-1.5 rounded-full uppercase font-bold tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.2)] text-center">
                            Disparidade<br className="md:hidden" /> Crítica
                        </span>
                    </div>

                    {/* YOU (RIGHT) - RED BG */}
                    <div className="text-center flex flex-col items-center">
                        <div className="relative mx-auto mb-2 md:mb-4 w-16 h-16 md:w-20 md:h-20">
                            <div className="w-full h-full bg-red-600 rounded-full flex items-center justify-center border-4 border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.4)] overflow-hidden">
                                {/* User Product Logo */}
                                {product.coverUrl ? (
                                    <img src={product.coverUrl} alt="Você" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xl font-black text-white">VOCÊ</span>
                                )}
                            </div>
                            <span className="absolute -top-2 -right-3 md:-right-4 bg-gray-900 text-gray-300 text-[8px] md:text-[10px] font-bold px-2 py-1 rounded border border-gray-700 shadow-lg z-20">VOCÊ</span>
                        </div>
                        {/* Added Product Name for User */}
                        <p className="text-gray-400 text-xs md:text-sm mb-1 font-bold line-clamp-1">{product.title}</p>
                        <p className="text-gray-500 text-xs md:text-sm mb-1 md:hidden">Faturamento Est.</p>
                        <p className="text-lg md:text-2xl font-black text-white">R$ 12k<span className="text-[10px] md:text-sm font-normal text-gray-500">/mês</span></p>
                    </div>
                </div>
            </div>

            {/* SIDE-BY-SIDE PROBLEM CARDS - CLEANER BORDERS */}
            <h3 className="text-xl md:text-2xl font-black text-white mb-8 flex items-center gap-3 px-2 md:px-0">
                <Activity className="text-purple-500" /> Plano de Correção Imediata
            </h3>



            <div className="space-y-8">
                {problems.map((problem) => (
                    <div key={problem.id} className="relative">
                        {/* Connecting Line (Desktop) - Subtler */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-800 transform -translate-x-1/2 z-0"></div>
                        <div className="hidden md:flex absolute left-1/2 top-1/2 w-8 h-8 bg-gray-900 border border-gray-600 rounded-full items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10 text-[10px] text-gray-400 font-bold">
                            VS
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 relative z-10">

                            {/* LEFT CARD: SOLUTION (Winner First) */}
                            <div className="bg-gray-900 border border-green-900/30 rounded-2xl p-6 flex flex-col h-full relative overflow-hidden">
                                <span className="absolute top-4 right-4 bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded border border-green-500/30">TOP 1%</span>
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="text-green-500 font-bold uppercase text-xs tracking-wider">Estratégia Vencedora</span>
                                </div>

                                <h4 className="text-xl font-bold text-gray-500 mb-2 opacity-50">{problem.title}</h4>
                                <div className="bg-green-900/10 border border-green-900/20 p-3 rounded mb-4">
                                    <p className="text-sm text-green-700 uppercase font-bold mb-1">Métrica do Vencedor</p>
                                    <p className="text-2xl font-black text-green-500">{problem.winnerMetric}</p>
                                </div>

                                <div className="flex-grow">
                                    <p className="text-base text-gray-300 font-medium mb-2">
                                        {problem.winnerDesc}
                                    </p>
                                    <p className="text-xs text-green-400 bg-green-900/10 inline-block px-2 py-1 rounded">
                                        Potencial de converter 3x mais.
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT CARD: PROBLEM (Producer Second) */}
                            <div className={`
                                border-2 rounded-2xl p-6 flex flex-col h-full transition-all duration-500 relative overflow-hidden
                                ${solvedIds.includes(problem.id)
                                    ? 'bg-green-900/10 border-green-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                                    : 'bg-gray-900/50 border-red-900/40 hover:border-red-500/40'}
                            `}>
                                {/* STATUS TAGS */}
                                {solvedIds.includes(problem.id) ? (
                                    <span className="absolute top-4 right-4 bg-green-500 text-black text-[10px] font-bold px-2 py-1 rounded shadow animate-pulse">
                                        RESOLVIDO
                                    </span>
                                ) : (
                                    <span className="absolute top-4 right-4 bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-1 rounded border border-red-500/30">
                                        VOCÊ
                                    </span>
                                )}

                                {/* REPAIRING OVERLAY (MATRIX STYLE) */}
                                {repairingId === problem.id && (
                                    <div className="absolute inset-0 bg-black/90 z-20 flex flex-col p-6 font-mono">
                                        <div className="flex items-center gap-2 mb-4 text-green-500">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                            <span className="text-xs font-bold tracking-widest uppercase">Executando Reparo Neural</span>
                                        </div>
                                        <div className="flex-grow space-y-2 overflow-hidden text-xs text-green-400 opacity-80">
                                            {executionLogs.map((log, i) => (
                                                <div key={i} className="border-l-2 border-green-800 pl-2">
                                                    <span className="text-gray-500 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                                                    {log}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="w-full bg-gray-900 h-1 mt-4 rounded-full overflow-hidden">
                                            <div
                                                className="bg-green-500 h-full transition-all duration-300 ease-out"
                                                style={{ width: `${repairProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* CARD CONTENT (Conditional) */}
                                <div className={`transition-opacity duration-500 ${repairingId === problem.id ? 'opacity-0' : 'opacity-100'}`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        {solvedIds.includes(problem.id) ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <AlertTriangle className="w-5 h-5 text-red-500" />
                                        )}
                                        <span className={`font-bold uppercase text-xs tracking-wider ${solvedIds.includes(problem.id) ? 'text-green-500' : 'text-red-400'}`}>
                                            {solvedIds.includes(problem.id) ? 'Otimização Concluída' : 'Falha Detectada'}
                                        </span>
                                    </div>

                                    <h4 className={`text-xl font-bold mb-2 ${solvedIds.includes(problem.id) ? 'text-green-100' : 'text-white'}`}>{problem.title}</h4>

                                    <div className={`p-3 rounded mb-4 ${solvedIds.includes(problem.id) ? 'bg-green-500/10' : 'bg-black/20'}`}>
                                        <p className={`text-sm uppercase font-bold mb-1 ${solvedIds.includes(problem.id) ? 'text-green-400' : 'text-gray-500'}`}>
                                            {solvedIds.includes(problem.id) ? 'Nova Métrica Projetada' : 'Sua Métrica Atual'}
                                        </p>
                                        <p className={`text-2xl font-black ${solvedIds.includes(problem.id) ? 'text-green-400' : 'text-red-500'}`}>
                                            {solvedIds.includes(problem.id) ? problem.winnerMetric : problem.yourMetric}
                                        </p>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-6 flex-grow border-l-2 border-red-900/50 pl-3">
                                        {solvedIds.includes(problem.id)
                                            ? "Correção aplicada com sucesso. O sistema reescreveu os parâmetros para igualar a eficiência do Top 1%."
                                            : problem.yourDesc
                                        }
                                    </p>

                                    <div className={`mt-auto pt-6 border-t ${solvedIds.includes(problem.id) ? 'border-green-900/30' : 'border-gray-800'}`}>
                                        <Button
                                            onClick={() => executeRepair(problem.id, problem.cost, problem.title)}
                                            disabled={solvedIds.includes(problem.id) || repairingId !== null}
                                            className={`
                                                w-full shadow-md flex items-center justify-center gap-2 py-3 transition-colors
                                                ${solvedIds.includes(problem.id)
                                                    ? '!bg-green-900/50 !text-green-500 cursor-not-allowed border border-green-500/20'
                                                    : '!bg-red-600 hover:!bg-red-500'
                                                }
                                            `}
                                        >
                                            {solvedIds.includes(problem.id) ? (
                                                <><CheckCircle className="w-4 h-4" /> REPARADO</>
                                            ) : (
                                                <><Zap className="w-4 h-4" /> <span>REPARAR ({problem.cost} CRÉDITOS)</span></>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

            {/* FLOATING CTA - ADJUSTED FOR MOBILE NAV */}
            <div className="fixed bottom-20 md:bottom-0 left-0 w-full p-4 z-40 flex justify-center pointer-events-none">
                <div className="bg-gray-950/90 backdrop-blur-xl border border-purple-500 w-full max-w-4xl rounded-2xl p-4 shadow-2xl pointer-events-auto flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold">Custo Total para Reparação Completa</p>
                        <p className="text-xl md:text-2xl font-black text-white flex flex-col md:flex-row md:items-center md:gap-2">
                            {totalCost} créditos
                            <span className="text-[10px] md:text-xs font-normal text-green-400 bg-green-900/20 px-2 py-0.5 rounded w-fit">-10% no Combo</span>
                        </p>
                    </div>
                    <Button
                        onClick={() => executeRepair('ALL', Math.floor(totalCost * 0.9), 'Reparação Completa')}
                        disabled={solvedIds.length === problems.length}
                        className={`
                            hover:scale-105 transition-transform shadow-xl !py-3 !px-4 md:!px-8 text-sm md:text-lg font-black
                            ${solvedIds.length === problems.length
                                ? '!bg-gray-800 !text-gray-500 cursor-not-allowed'
                                : '!bg-gradient-to-r from-purple-600 to-indigo-600'
                            }
                        `}
                    >
                        {solvedIds.length === problems.length ? 'TUDO OTIMIZADO' : <><Zap className="w-5 h-5 mr-2" /> REPARAR TUDO</>}
                    </Button>
                </div>
            </div>

            {/* BATCH REPAIR CONFIRMATION MODAL */}
            {batchConfirmation && (
                <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-gray-900 border border-gray-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="relative z-10 text-center">
                            <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                                <Zap className="w-8 h-8 text-green-400 animate-pulse" />
                            </div>

                            <h3 className="text-xl font-black text-white uppercase leading-none mb-2">Protocolo de Correção Total</h3>
                            <p className="text-gray-400 text-sm mb-6">Você está prestes a iniciar a sequência automática de reparos para <strong>{batchConfirmation.items.length} falhas críticas</strong>.</p>

                            <div className="bg-gray-950/50 rounded-xl p-4 border border-gray-800 mb-6 text-left">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400 text-xs uppercase font-bold">Ações Programadas</span>
                                    <span className="text-white font-mono">{batchConfirmation.items.length}</span>
                                </div>
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-800">
                                    <span className="text-gray-400 text-xs uppercase font-bold">Bônus de Monitoramento</span>
                                    <span className="text-green-400 font-mono text-xs">30 DIAS GRÁTIS</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-bold uppercase">Investimento Total</span>
                                    <span className="text-2xl font-black text-white">{batchConfirmation.total} <span className="text-xs text-gray-500 font-normal">créditos</span></span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="secondary" onClick={() => setBatchConfirmation(null)}>
                                    Cancelar
                                </Button>
                                <Button onClick={confirmBatchRepair} className="!bg-green-600 hover:!bg-green-500 border-0">
                                    INICIAR AGORA
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};


// --- MAIN PAGE ---

export const ProducerConsultancyPage: React.FC = () => {
    const { user } = useAuth();
    const [selectedProduct, setSelectedProduct] = useState<Course | null>(null);
    const [schools, setSchools] = useState<Course[]>([]);

    // Payment / Lock State
    const [showScanModal, setShowScanModal] = useState(false);
    const [pendingSchool, setPendingSchool] = useState<Course | null>(null);
    const [scanCost, setScanCost] = useState(15);
    const [detectionOverhead, setDetectionOverhead] = useState(5.50); // Hardcoded 'sunk cost' of detection

    useEffect(() => {
        if (user) {
            // In real app, fetch from API
            // For now read local storage
            const saved = localStorage.getItem(`student_courses_${user.uid}`);
            if (saved) setSchools(JSON.parse(saved));

            // Fetch dynamic cost
            getToolCosts().then(tools => {
                const tool = tools.find(t => t.toolId === 'nexus_deep_scan');
                if (tool) setScanCost(tool.costPerTask);
            });
        }
    }, [user]);

    const handleUnlockDossier = async () => {
        if (!pendingSchool || !user) return;

        const total = scanCost + detectionOverhead; // Dynamic Total

        try {
            await debitWallet(total, `Nexus Raio-X: ${pendingSchool.title}`, 'service_usage' as any);

            // Mark as unlocked locally
            const updated = schools.map(s => s.id === pendingSchool.id ? { ...s, scanUnlocked: true } : s);
            setSchools(updated);
            localStorage.setItem(`student_courses_${user.uid}`, JSON.stringify(updated));

            toast.success("Acesso Liberado! Iniciando varredura profunda...", { icon: '🔓' });
            setShowScanModal(false);
            setSelectedProduct(pendingSchool);
            setPendingSchool(null);
        } catch (error) {
            toast.error("Saldo insuficiente para realizar o Raio-X.");
        }
    };

    const handleCardClick = (school: Course) => {
        // If already monitored or explicitly unlocked, allow access
        if ((school as any).consultancyStatus === 'monitoring' || (school as any).scanUnlocked) {
            setSelectedProduct(school);
        } else {
            setPendingSchool(school);
            setShowScanModal(true);
        }
    };

    const handleStatusUpdate = (productId: string, status: string) => {
        const updated = schools.map(s =>
            s.id === productId ? { ...s, consultancyStatus: status } : s
        );
        setSchools(updated);
        if (user) {
            localStorage.setItem(`student_courses_${user.uid}`, JSON.stringify(updated));
        }
    };

    if (selectedProduct) {
        return <NexusDossier
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            onStatusUpdate={handleStatusUpdate}
        />;
    }

    return (
        <div className="animate-fade-in pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl p-8 mb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-white mb-2">Nexus Consultoria Premium</h2>
                        <p className="text-gray-400 max-w-2xl">
                            Bem-vindo ao centro de inteligência. Nossos agentes autônomos escaneiam seus produtos,
                            comparam com os maiores vendedores do mercado e aplicam correções automáticas para
                            multiplicar seu faturamento.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <Monitor className="w-24 h-24 text-purple-500 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Product List */}
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Search className="text-gray-500" /> Selecione um Produto para Analisar
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map(school => (
                    <Card key={school.id} className="p-6 border border-gray-800 hover:border-purple-500 transition-all hover:bg-gray-900/80 cursor-pointer group" onClick={() => handleCardClick(school)}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 overflow-hidden relative ${(school as any).consultancyStatus === 'monitoring' ? 'bg-green-900/20' : 'bg-gray-800 group-hover:bg-purple-900/20'}`}>
                                {school.coverUrl ? (
                                    <img src={school.coverUrl} alt={school.title} className="w-full h-full object-cover" />
                                ) : (
                                    <Monitor className={`w-6 h-6 ${(school as any).consultancyStatus === 'monitoring' ? 'text-green-400' : 'text-gray-400 group-hover:text-purple-400'}`} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-white leading-tight truncate">{school.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-gray-500 uppercase">{school.niche || 'Geral'}</span>
                                    {/* Online Tag */}
                                    {school.isPublished && (
                                        <span className="flex items-center gap-1 bg-green-900/20 text-green-500 text-[9px] px-1.5 py-0.5 rounded border border-green-900/30">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                            ONLINE
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/40 rounded-lg p-3 mb-4 border border-gray-800">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Saúde do Negócio</span>
                                <span className={`text-xs font-bold ${(school as any).consultancyStatus === 'monitoring' ? 'text-green-400' : 'text-red-400'}`}>
                                    {(school as any).consultancyStatus === 'monitoring' ? 'Otimizado (98/100)' : 'Crítico (42/100)'}
                                </span>
                            </div>
                            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full ${(school as any).consultancyStatus === 'monitoring' ? 'bg-green-500 w-[98%]' : 'bg-red-500 w-[42%]'}`}></div>
                            </div>
                        </div>

                        {(school as any).consultancyStatus === 'monitoring' ? (
                            <Button className="w-full !bg-green-900/20 !text-green-400 border border-green-500/30 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all">
                                <Activity className="w-4 h-4 mr-2 animate-pulse" /> Monitoramento: Dia 1/30
                            </Button>
                        ) : (
                            <Button className="w-full !bg-red-500/10 !text-red-500 border border-red-500/30 hover:!bg-red-600 hover:!text-white group-hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all animate-pulse-slow">
                                <AlertTriangle className="w-4 h-4 mr-2" /> 3 Falhas Críticas Detectadas
                            </Button>
                        )}
                    </Card>
                ))}

                {schools.length === 0 && (
                    <div className="col-span-full py-12 text-center border border-dashed border-gray-800 rounded-2xl flex flex-col items-center">
                        <div className="bg-yellow-900/20 text-yellow-500 text-xs px-2 py-1 rounded mb-4 font-bold border border-yellow-500/30">
                            MODO DESENVOLVIMENTO
                        </div>
                        <p className="text-gray-500 mb-4">Nenhum produto encontrado.</p>
                        <Button
                            onClick={() => {
                                const demoProduct: Course = {
                                    id: 'demo-prod-01',
                                    title: 'Curso de Marketing Digital 2.0',
                                    description: 'Aprenda a vender online.',
                                    coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426', // Fixed: thumbnailUrl -> coverUrl
                                    totalModules: 0, // Required
                                    transformation: 'Liberdade Financeira', // Required
                                    isPublished: true,
                                    niche: 'Wealth',
                                    schoolSubdomain: 'marketing-demo'
                                };
                                const newSchools = [...schools, demoProduct];
                                setSchools(newSchools);
                                if (user) {
                                    localStorage.setItem(`student_courses_${user.uid}`, JSON.stringify(newSchools));
                                    toast.success("Produto Demo Criado!");
                                }
                            }}
                            className="bg-purple-600 hover:bg-purple-500"
                        >
                            <PlusCircle className="w-5 h-5 mr-2" /> Criar Produto de Teste
                        </Button>
                    </div>
                )}

                {schools.length === 0 && (// @ts-ignore
                    !import.meta.env.DEV) && (
                        <div className="col-span-full py-12 text-center border border-dashed border-gray-800 rounded-2xl">
                            <p className="text-gray-500">Nenhum produto encontrado. Crie uma escola para começar.</p>
                        </div>
                    )}
            </div>
            {/* PAYWALL MODAL */}
            {showScanModal && pendingSchool && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-gray-900 border border-gray-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                        {/* Background FX */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-purple-900/20 rounded-xl border border-purple-500/30">
                                    <Zap className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase leading-none">Desbloquear Raio-X</h3>
                                    <p className="text-xs text-purple-300 font-bold mt-1">DIAGNÓSTICO PROFUNDO NEXUS</p>
                                </div>
                            </div>

                            <div className="bg-gray-950/50 rounded-xl p-4 border border-gray-800 mb-6">
                                <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-4">
                                    <span className="text-sm text-gray-400 flex items-center gap-2"><Search className="w-4 h-4" /> Produto Alvo</span>
                                    <span className="text-sm font-bold text-white max-w-[150px] truncate">{pendingSchool.title}</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Taxa de Detecção (Sunk Cost)</span>
                                        <span className="text-white font-mono opacity-70">{detectionOverhead.toFixed(2)} créditos</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Varredura Profunda (IA)</span>
                                        <span className="text-white font-mono opacity-70">{scanCost.toFixed(2)} créditos</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg pt-3 border-t border-gray-800">
                                        <span className="font-bold text-purple-400 uppercase">Custo Total</span>
                                        <span className="font-black text-white text-xl">{(scanCost + detectionOverhead).toFixed(2)} <span className="text-xs font-normal text-gray-500">créditos</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-900/10 border border-yellow-500/20 p-3 rounded-lg flex gap-3 mb-6">
                                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                <p className="text-xs text-yellow-200 leading-relaxed">
                                    <strong className="block text-yellow-400 mb-1 uppercase">Risco de Perda Financeira</strong>
                                    Detectamos gargalos no seu funil. Ative o diagnóstico para mapear a causa raiz e liberar o protocolo de correção automática imediatamente.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="secondary" onClick={() => setShowScanModal(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleUnlockDossier} className="!bg-gradient-to-r hover:scale-[1.02] shadow-lg from-purple-600 to-indigo-600 border-0">
                                    <Zap className="w-4 h-4 mr-2 animate-pulse" /> ATIVAR DIAGNÓSTICO
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
