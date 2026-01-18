import React, { useState, useEffect } from 'react';
import { X, CheckCircle, TrendingUp, AlertTriangle, Monitor, Zap, ArrowRight, Activity, Briefcase, LockClosed, Search, Crosshair, BarChart2 } from '../../../components/Icons';
import Button from '../../../components/Button';
import { ConsultancyReport, ActionItem, ProducerWallet } from '../../../types/legacy';
import { WinningProductProfile, NexusProductDNA, ConsultancyStage } from '../../../types/nexus';
import { getConsultancyReport, getProducerWallet, debitWallet, getToolCosts, getWinningProductMatch, runNexusForensics } from '../../../services/mockFirebase';
import { nexusCore } from '../../../services/NexusCore';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface NexusConsultancyModalProps {
    productId: string;
    productName: string;
    onClose: () => void;
}

type ViewMode = 'IDLE' | 'SCANNING' | 'VERSUS' | 'EXECUTION';

export const NexusConsultancyModal: React.FC<NexusConsultancyModalProps> = ({ productId, productName, onClose }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('IDLE');
    const [scanProgress, setScanProgress] = useState(0);
    const [scanLogs, setScanLogs] = useState<string[]>([]);

    // Data State
    const [winningProfile, setWinningProfile] = useState<WinningProductProfile | null>(null);
    const [productDNA, setProductDNA] = useState<NexusProductDNA | null>(null);
    const [forensics, setForensics] = useState<any>(null);

    // Business Logic State
    const [wallet, setWallet] = useState<ProducerWallet | null>(null);
    const [analysisCost, setAnalysisCost] = useState(50); // Default fallback

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        const [w, costObj] = await Promise.all([
            getProducerWallet(),
            nexusCore.calculateServiceCost('nexus_deep_scan')
        ]);
        setWallet(w);
        setAnalysisCost(costObj.cost);
    };

    const runForensicScan = async () => {
        if (!wallet || wallet.balance < analysisCost) {
            toast.error(`Saldo insuficiente. Necessário: ${analysisCost} créditos.`);
            return;
        }

        const paid = await debitWallet(analysisCost, `Varredura Forense: ${productName}`, 'service_usage');
        if (!paid) return;

        setWallet(prev => prev ? { ...prev, balance: prev.balance - analysisCost } : null);
        setViewMode('SCANNING');

        // Simulated Scan Sequence
        const logs = [
            "Conectando ao núcleo Nexus...",
            "Analisando estrutura de URL...",
            "Detectando pixels e tags...",
            "Mapeando funil de vendas...",
            "Comparando com banco de dados (12.404 Produtos)...",
            "Identificando Vencedor Anônimo...",
            "Gerando relatório de Gap..."
        ];

        for (let i = 0; i < logs.length; i++) {
            setScanLogs(prev => [...prev, logs[i]]);
            setScanProgress(((i + 1) / logs.length) * 100);
            await new Promise(r => setTimeout(r, 800));
        }

        // Mock Business Logic
        const mockDNA: NexusProductDNA = {
            productId,
            niche: 'Health', // mocked
            subNiche: 'Weight Loss',
            format: 'Course',
            pricePoint: 97,
            targetAudience: { ageRange: [25, 45], gender: 'Female', painPoints: ['Belly Fat', 'Time'] },
            funnelStructure: ['VSL'],
            alignmentScore: 65
        };
        const winner = await getWinningProductMatch(mockDNA as any);
        const forensicsResult = await runNexusForensics(productId);

        setProductDNA(mockDNA);
        setWinningProfile(winner);
        setForensics(forensicsResult);

        await new Promise(r => setTimeout(r, 1000));
        setViewMode('VERSUS');
    };

    // --- RENDERERS ---

    const renderIdle = () => (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
            <div className="w-24 h-24 bg-purple-900/20 rounded-full flex items-center justify-center mb-6 ring-4 ring-purple-500/20">
                <Search className="w-12 h-12 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Nexus Forensics 2.0</h2>
            <p className="text-gray-400 max-w-md mb-8">
                Esta ferramenta fará uma varredura completa no seu produto, identificará seu nicho e encontrará um <strong>Vencedor Anônimo</strong> que fatura milhões para comparar suas métricas.
            </p>

            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 w-full max-w-sm mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Custo da Varredura</span>
                    <span className="text-white font-bold">{analysisCost} créditos</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Seu saldo</span>
                    <span className={wallet && wallet.balance >= analysisCost ? "text-green-400" : "text-red-400"}>
                        {wallet?.balance} créditos
                    </span>
                </div>
            </div>

            <Button
                onClick={runForensicScan}
                className="w-full max-w-sm !py-4 !text-lg !bg-purple-600 hover:!bg-purple-500 shadow-xl shadow-purple-900/40"
            >
                <Crosshair className="w-5 h-5 mr-2" /> Iniciar Varredura
            </Button>
        </div>
    );

    const renderScanning = () => (
        <div className="flex flex-col items-center justify-center h-full p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/3o7TKsAM1sZ5s68N7q/giphy.gif')] opacity-5 mix-blend-overlay bg-cover"></div>

            <div className="w-full max-w-lg z-10">
                <div className="flex justify-between text-xs text-purple-300 mb-2 font-mono">
                    <span>NEXUS_CORE_V2.1</span>
                    <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-8 border border-gray-700">
                    <motion.div
                        className="bg-purple-500 h-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${scanProgress}%` }}
                    />
                </div>

                <div className="font-mono text-sm space-y-2 h-48 overflow-hidden flex flex-col-reverse">
                    {scanLogs.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-green-400/80 border-l-2 border-green-500/30 pl-3"
                        >
                            <span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                            {log}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderVersus = () => {
        if (!winningProfile) return null;
        return (
            <div className="flex flex-col h-full animate-fade-in custom-scrollbar overflow-y-auto">
                {/* Header Battle */}
                <div className="p-8 bg-gradient-to-b from-purple-900/20 to-transparent border-b border-gray-800 sticky top-0 backdrop-blur-md z-10">
                    <div className="measure-battle flex items-center justify-center gap-12">
                        {/* User Side - NOW VIBRANT */}
                        <div className="text-center w-1/3 transform hover:scale-105 transition-all duration-300">
                            <div className="w-24 h-24 mx-auto bg-blue-600/20 rounded-full flex items-center justify-center border-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] mb-3 relative">
                                <span className="text-xl font-bold text-blue-100">VOCÊ</span>
                            </div>
                            <h3 className="font-bold text-white text-lg">{productName}</h3>
                            <div className="flex flex-col gap-1 mt-2">
                                <p className="text-xs text-blue-300 bg-blue-900/40 px-2 py-1 rounded inline-block mx-auto">
                                    Conv: 1.2%
                                </p>
                                <p className="text-xs text-gray-400">
                                    Fat: R$ 12.500/mês
                                </p>
                            </div>
                        </div>

                        {/* VS Badge */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse"></div>
                            <img src="https://cdn-icons-png.flaticon.com/512/9446/9446643.png" className="w-16 h-16 relative z-10 drop-shadow-lg" alt="VS" />
                        </div>

                        {/* Winner Side - REVEALED */}
                        <div className="text-center w-1/3 scale-110 transform transition-transform">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center border-4 border-yellow-200 shadow-[0_0_30px_rgba(234,179,8,0.3)] mb-3 relative overflow-hidden group cursor-help" title="Produto validado e real">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                                <Zap className="w-10 h-10 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
                            </div>

                            <h3 className="font-bold text-yellow-400 text-lg">{winningProfile.name}</h3>

                            <div className="flex flex-col gap-1 mt-2">
                                <p className="text-xs text-yellow-300 bg-yellow-900/40 px-2 py-1 rounded inline-block mx-auto font-mono">
                                    Fat: R$ {winningProfile.monthlyRevenue.toLocaleString()}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                    Conv: {winningProfile.conversionRate}%
                                </p>
                            </div>

                            {winningProfile.marketplaceUrl && (
                                <a
                                    href="#" // Mock link
                                    onClick={(e) => { e.preventDefault(); toast('Link para Marketplace (Simulação)', { icon: '🔗' }); }}
                                    className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline mt-2 block"
                                >
                                    Ver no Marketplace ↗
                                </a>
                            )}

                            <span className="absolute -top-4 -right-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow animate-bounce">TOP 1%</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 pb-32">

                    {/* Insight Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-red-500/50 transition-colors">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="text-red-400" />
                                <h4 className="font-bold text-white">Análise de Emoção (Ads)</h4>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="text-center">
                                    <p className="text-gray-500 mb-1">Você usa</p>
                                    <p className="font-mono text-white text-lg">Curiosidade</p>
                                </div>
                                <ArrowRight className="text-gray-600" />
                                <div className="text-center">
                                    <p className="text-gray-500 mb-1">Vencedor usa</p>
                                    <p className="font-mono text-red-400 text-lg font-bold">{winningProfile.adSentiment}</p>
                                </div>
                            </div>
                            <p className="text-xs text-red-300 mt-4 bg-red-900/20 p-2 rounded border border-red-500/20">
                                ⚠ Alerta: Neste nicho, "{winningProfile.adSentiment}" converte 3x mais que sua estratégia atual.
                            </p>
                        </div>

                        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-green-500/50 transition-colors">
                            <div className="flex items-center gap-2 mb-4">
                                <Briefcase className="text-green-400" />
                                <h4 className="font-bold text-white">Armas Secretas Detectadas</h4>
                            </div>
                            <ul className="space-y-2">
                                {winningProfile.secretWeapons.map((weapon, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        {weapon}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 pt-4 border-t border-gray-700 text-center">
                                <span className="text-xs text-gray-500">Você não possui essas implementações.</span>
                            </div>
                        </div>
                    </div>

                    {/* Funnel Comparison Bar */}
                    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                        <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                            <BarChart2 className="text-blue-500" /> Comparativo de Funil
                        </h4>

                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Taxa de Conversão (Checkout)</span>
                                <span className="text-white font-bold">{winningProfile.conversionRate}% (Vencedor)</span>
                            </div>
                            <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden flex">
                                <div className="bg-gray-600 h-full w-[20%]" title="Você (1.2%)"></div>
                                <div className="bg-transparent h-full w-[1%]"></div>
                                <div className="bg-green-500 h-full w-[60%] flex items-center justify-end pr-2 text-[9px] text-black font-bold" title="Vencedor (4.8%)">
                                    GAP de +210%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Floating */}
                    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[600px] z-50">
                        <div className="bg-gray-900/90 backdrop-blur-xl border border-purple-500/50 p-4 rounded-2xl shadow-2xl flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-purple-400 text-xs font-bold uppercase tracking-wider">Próximo Passo</span>
                                <span className="text-white font-bold">Ver Plano de Correção</span>
                            </div>
                            <Button
                                onClick={() => setViewMode('EXECUTION')}
                                className="!bg-purple-600 hover:!bg-purple-500 !px-8 shadow-lg shadow-purple-900/50"
                            >
                                <Zap className="w-4 h-4 mr-2" /> Reparar Meu Funil
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        );
    };

    const renderExecution = () => (
        <div className="flex flex-col h-full bg-gray-900">
            <div className="p-6 border-b border-gray-800">
                <Button variant="ghost" className="mb-4 !p-0 text-gray-400" onClick={() => setViewMode('VERSUS')}>
                    ← Voltar para Análise
                </Button>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Monitor className="text-green-500" /> Menu de Execução
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                    Selecione os módulos que deseja que a IA implemente automaticamente no seu produto.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {[
                    { id: 'nexus_exec_offer', title: 'Alinhamento de Oferta', desc: 'Reescrever Headline e Promessa para bater com o Vencedor.', cost: 35 },
                    { id: 'nexus_exec_copy', title: 'Neuro-Copywriting VSL', desc: 'Gerar script de vendas usando gatilhos de "Medo" (Vencedor).', cost: 120 },
                    { id: 'nexus_exec_recovery', title: 'Bot de Recuperação WhatsApp', desc: 'Instalar fluxo de mensagens para carrinhos abandonados.', cost: 80 },
                    { id: 'nexus_auto_clone', title: 'CLONAGEM COMPLETA', desc: 'Aplicar todas as correções acima de uma vez.', cost: 200, featured: true }
                ].map((item) => (
                    <div key={item.id} className={`p-4 rounded-xl border ${item.featured ? 'border-purple-500 bg-purple-900/10' : 'border-gray-800 bg-gray-800/50'} flex justify-between items-center hover:bg-gray-800 transition-colors`}>
                        <div className="flex-1">
                            <h4 className={`font-bold ${item.featured ? 'text-purple-300' : 'text-white'}`}>{item.title}</h4>
                            <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                            <span className="text-sm font-bold text-white bg-gray-900 px-2 py-1 rounded border border-gray-700">
                                {item.cost} créditos
                            </span>
                            <Button
                                size="sm"
                                className={item.featured ? "!bg-purple-600 hover:!bg-purple-500" : "!bg-gray-700 hover:!bg-gray-600"}
                                onClick={() => toast.success(`Módulo "${item.title}" adicionado à fila de execução!`)}
                            >
                                <Zap className="w-3 h-3 mr-1" /> Executar
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in p-4">
                <div className="bg-gray-900 w-full max-w-4xl h-[85vh] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden relative flex flex-col">
                    <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-gray-800/50 rounded-full hover:bg-gray-700 text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>

                    {viewMode === 'IDLE' && renderIdle()}
                    {viewMode === 'SCANNING' && renderScanning()}
                    {viewMode === 'VERSUS' && renderVersus()}
                    {viewMode === 'EXECUTION' && renderExecution()}
                </div>
            </div>
        </AnimatePresence>
    );
};

