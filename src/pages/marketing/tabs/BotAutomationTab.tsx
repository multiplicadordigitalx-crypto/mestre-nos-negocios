import React, { useState, useEffect, useRef } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { User, PlusCircle, Brain, TrendingUp, Box, CheckCircle, Clock, AlertTriangle, Trash, MessageCircle, Instagram, Tiktok, Search, Activity, Link as LinkIcon, Copy, ChevronDown, ChevronRight, Users, Server, Terminal, Shield, Lock, FileText, Zap } from '../../../components/Icons';
import { SharedAccount } from '../../../types';
import { ConnectAccountModal } from '../components/ConnectAccountModal';
import { getAppProducts, getProductDNA } from '../../../services/mockFirebase';
import toast from 'react-hot-toast';

interface SalesLink {
    id: number;
    offerName: string;
    url: string;
    product: string;
    isDefault: boolean;
}

interface BotAutomationTabProps {
    accounts: SharedAccount[];
    onAddAccount: (acc: SharedAccount) => void;
    onRemoveAccount: (id: number) => void;
}

interface BotLog {
    id: string;
    platform: 'Instagram' | 'TikTok' | 'Kwai';
    user: string;
    comment: string;
    action: string;
    reply: string;
    timestamp: number;
}

const MetricsDashboardItem: React.FC<{ label: string, value: string | number, trend?: 'up' | 'down' | 'neutral', subtext?: string, icon?: React.ReactNode, color?: string }> = ({ label, value, trend, subtext, icon, color = 'blue' }) => (
    <div className={`bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col justify-between relative overflow-hidden group hover:border-${color}-500/50 transition-all`}>
        <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity text-${color}-400`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{label}</p>
            <div className="flex items-end gap-2 mt-1">
                <h4 className="text-2xl font-bold text-white leading-none">{value}</h4>
                {trend && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center ${trend === 'up' ? 'text-green-400 bg-green-500/10' : trend === 'down' ? 'text-red-400 bg-red-500/10' : 'text-gray-400'}`}>
                        {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '-'}
                    </span>
                )}
            </div>
        </div>
        {subtext && <p className={`text-[10px] mt-2 font-mono ${trend === 'up' ? 'text-green-500/80' : 'text-gray-500'}`}>{subtext}</p>}
    </div>
);

const ConversionBarChart: React.FC<{ data: number[] }> = ({ data }) => {
    const max = Math.max(...data);
    return (
        <div className="flex items-end justify-between h-16 gap-1 w-full mt-2">
            {data.map((value, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1 group">
                    <div className="w-full bg-gray-700/50 rounded-t relative h-full flex items-end overflow-hidden group-hover:bg-gray-700/80 transition-colors">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(value / max) * 100}%` }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="w-full bg-brand-primary/80 group-hover:bg-brand-primary"
                        >
                        </motion.div>
                    </div>
                    <span className="text-[8px] text-gray-600 font-mono hidden md:block">D-{7 - i}</span>
                </div>
            ))}
        </div>
    );
};

export const BotAutomationTab: React.FC<BotAutomationTabProps> = ({ accounts, onAddAccount, onRemoveAccount }) => {
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [autoBoostEnabled, setAutoBoostEnabled] = useState(true);
    const [liveLogs, setLiveLogs] = useState<BotLog[]>([]);

    // Metrics State
    const [metrics, setMetrics] = useState({
        leadsToday: 4892,
        botSales: 1847,
        activeLeads: 317,
        avgResponseTime: '4,8s',
        avgSaleTime: '11min 42s',
        humanSales: 892,
        roas: '52.4x',
        audiosSent: 1204,
        conversionRate: 41.2, // %
        salesHistory: [140, 165, 152, 180, 205, 230, 265], // Last 7 days
        botVsHuman: { bot: 85, human: 15 } // % share
    });

    // State Declarations (Cleaned)
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
    const [productTab, setProductTab] = useState<'accounts' | 'links'>('accounts');
    const [activeDNA, setActiveDNA] = useState<any>(null);

    // Logs State
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Links State
    const [links, setLinks] = useState<SalesLink[]>([
        { id: 1, offerName: 'Básico', url: 'https://mestredosnegocios.com.br/basico', product: 'Mestre Básico', isDefault: false },
        { id: 2, offerName: 'Pro 48h', url: 'https://mestredosnegocios.com.br/pro-48h', product: 'Mestre Pro', isDefault: true },
    ]);
    const [newLink, setNewLink] = useState({ offerName: '', url: '', product: '', isDefault: false });

    // Rules State
    const [rules, setRules] = useState([
        { id: 1, text: 'Se comentário contiver "quanto custa" → responder com link do produto mais vendido hoje' },
        { id: 2, text: 'Se for mulher + palavra "mãe" → mandar link do Pro' },
        { id: 3, text: 'Se comentário for positivo (emoji/elogio) → curtir e agradecer' }
    ]);
    const [newRuleText, setNewRuleText] = useState('');

    // --- SIMULAÇÃO DE MONITORAMENTO EM TEMPO REAL ---
    useEffect(() => {
        const users = ['mariasilva', 'joao_tech', 'fer_oliveira', 'carlos_mkt', 'ana_vendas', 'lucas_pro', 'bia_digital'];
        const comments = [
            'Quanto custa?', 'Como faço pra entrar?', 'Funciona pra iniciante?',
            'Tem suporte?', 'Quero saber o valor', 'Amei o vídeo! 😍',
            'Manda o link no direct', 'Qual o site oficial?'
        ];
        const platforms: ('Instagram' | 'TikTok' | 'Kwai')[] = ['Instagram', 'TikTok', 'Kwai'];

        const interval = setInterval(() => {
            // Fake Metrics Update
            setMetrics(prev => ({
                ...prev,
                leadsToday: prev.leadsToday + Math.floor(Math.random() * 2),
                botSales: prev.botSales + (Math.random() > 0.8 ? 1 : 0),
                conversionRate: Math.min(55, Math.max(35, prev.conversionRate + (Math.random() - 0.5))),
                salesHistory: [...prev.salesHistory.slice(1), prev.salesHistory[prev.salesHistory.length - 1] + Math.floor(Math.random() * 5)]
            }));

            if (accounts.length === 0) return;

            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomComment = comments[Math.floor(Math.random() * comments.length)];
            const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];

            const newLog: BotLog = {
                id: `log-${Date.now()}`,
                platform: randomPlatform,
                user: `@${randomUser}`,
                comment: randomComment,
                action: 'Analisando Intenção (Nexus IA)...',
                reply: randomComment.includes('?') || randomComment.toLowerCase().includes('valor') || randomComment.toLowerCase().includes('custa')
                    ? `Olá! Te enviei os detalhes e o link com desconto no direct: ${(links.find(l => l.isDefault)?.url || 'https://mestre.com/oferta')} 🚀`
                    : `Obrigado pelo carinho! Vamos pra cima! 🔥`,
                timestamp: Date.now()
            };

            setLiveLogs(prev => [newLog, ...prev].slice(0, 10)); // Mantém os últimos 10
        }, 5000);

        return () => clearInterval(interval);
    }, [accounts]);

    const generateProductLinks = (productName: string): SalesLink[] => {
        const slug = productName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        return [
            { id: Date.now(), offerName: 'Página de Vendas (Oficial)', url: `https://mestredosnegocios.com.br/${slug}`, product: productName, isDefault: true },
            { id: Date.now() + 1, offerName: 'Checkout Direto (12x)', url: `https://pay.mestredosnegocios.com.br/checkout/${slug}`, product: productName, isDefault: false },
            { id: Date.now() + 2, offerName: 'Isqueiro de Conversão (WhatsApp)', url: `https://wa.me/551199999999?text=Quero+saber+sobre+${slug}`, product: productName, isDefault: false }
        ];
    };



    const handleConnectAccount = async (data: any) => {
        const newAcc: SharedAccount = {
            id: Date.now(),
            username: data.username,
            platform: data.platform,
            status: 'ONLINE',
            followers: '0 seg',
            responseTime: '8s',
            postingStatus: 'idle',
            product: data.product
        };
        onAddAccount(newAcc);

        // AUTO-GENERATE LINKS & DNA
        const newLinks = generateProductLinks(data.product);
        setLinks(prev => [...prev, ...newLinks]);

        const dna = await getProductDNA(data.product);
        setActiveDNA(dna); // In real app, this would be a map of product -> dna

        toast.success(`Conta sincronizada! DNA de Vendas do produto "${data.product}" carregado com sucesso.`);
    };

    const handleAddRule = () => {
        if (!newRuleText) return;
        setRules([...rules, { id: Date.now(), text: newRuleText }]);
        setNewRuleText('');
        toast.success("Regra adicionada à fila.");
    }

    const handleDeleteRule = (id: number) => {
        setRules(rules.filter(rule => rule.id !== id));
        toast.success("Regra removida.");
    }

    const handleSaveRules = () => {
        toast.success("REGRAS SALVAS E ATIVAS IMEDIATAMENTE!", { icon: '⚡' });
    }

    return (
        <div className="space-y-8 animate-fade-in text-gray-200 pb-20">
            {/* CABEÇALHO DE STATUS - METRICS DASHBOARD */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
                <div className="relative z-10 mb-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-1">
                                Monitoramento & Resposta automática
                            </h2>
                            <p className="text-gray-400 text-sm">Gestão centralizada de interações de comentários e direct.</p>
                        </div>
                        <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30 flex items-center gap-2 animate-pulse">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> NEXUS AI ATIVADO
                        </span>
                    </div>

                    {/* DASHBOARD GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Esquerda - KPIs Principais */}
                        <div className="col-span-1 md:col-span-3 grid grid-cols-1 gap-4">
                            <MetricsDashboardItem
                                label="ROAS (Ads)"
                                value={metrics.roas}
                                trend="up"
                                subtext="Eficiência de Tráfego"
                                icon={<TrendingUp className="w-10 h-10" />}
                                color="green"
                            />
                            <MetricsDashboardItem
                                label="Taxa de Conversão"
                                value={`${metrics.conversionRate.toFixed(1)}%`}
                                trend="up"
                                subtext="Comentário -> Direct -> Venda"
                                icon={<Zap className="w-10 h-10" />}
                                color="purple"
                            />
                        </div>

                        {/* Meio - Gráfico de Conversão */}
                        <Card className="col-span-1 md:col-span-6 p-4 flex flex-col justify-between border-t-0 rounded-t-none md:rounded-xl md:border-t border-gray-700 bg-gray-900/50">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-brand-primary" /> Volume de Respostas (7 Dias)
                                    </h3>
                                    <p className="text-[10px] text-gray-500">Fluxo de interações automáticas nos posts.</p>
                                </div>
                                <span className="text-xs font-mono text-brand-primary bg-brand-primary/10 px-2 py-1 rounded">+18% vs semana passada</span>
                            </div>
                            <ConversionBarChart data={metrics.salesHistory} />
                        </Card>

                        {/* Direita - Batalha Bot vs Humano */}
                        <Card className="col-span-1 md:col-span-3 p-4 flex flex-col justify-center border-t-0 rounded-t-none md:rounded-xl md:border-t border-gray-700 bg-gray-900/50">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <Brain className="w-4 h-4 text-pink-500" /> Automação vs Manual
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-green-500" /> Bot Automático</span>
                                        <span className="text-white font-bold">{metrics.botVsHuman.bot}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: `${metrics.botVsHuman.bot}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                        <span className="flex items-center gap-1"><User className="w-3 h-3 text-blue-500" /> Manual (Direct)</span>
                                        <span className="text-white font-bold">{metrics.botVsHuman.human}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${metrics.botVsHuman.human}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-2 bg-gray-800 border border-gray-700 rounded text-[10px] text-center text-gray-400">
                                O Bot responde <strong>52x mais rápido</strong>.
                            </div>
                        </Card>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            </div>

            {/* MAIN GRID - COMMAND CENTER LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* LEFT COLUMN - FLEET MANAGEMENT (Span 4) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Header & Add Button */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Server className="w-4 h-4" /> Frotas por Produto
                        </h3>
                        <Button onClick={() => setIsConnectModalOpen(true)} className="text-[10px] font-bold uppercase !bg-brand-primary text-black hover:!bg-yellow-400 h-8 px-3 shadow-lg shadow-brand-primary/10">
                            + Conectar
                        </Button>
                    </div>

                    {/* PRODUCT FOLDERS LIST */}
                    <div className="space-y-3">
                        {Array.from(new Set([...accounts.map(a => a.product), ...links.map(l => l.product)])).map((prodName) => {
                            const prodAccounts = accounts.filter(a => a.product === prodName);
                            const prodLinks = links.filter(l => l.product === prodName);
                            const isExpanded = expandedProduct === prodName;

                            return (
                                <div key={prodName} className={`bg-gray-800 border transition-all overflow-hidden rounded-xl ${isExpanded ? 'border-brand-primary/50 shadow-lg shadow-brand-primary/5' : 'border-gray-700 hover:border-gray-600'}`}>
                                    {/* Folder Header */}
                                    <div
                                        onClick={() => setExpandedProduct(isExpanded ? null : prodName)}
                                        className="p-4 cursor-pointer flex items-center justify-between bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isExpanded ? 'bg-brand-primary/20 border-brand-primary text-brand-primary' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>
                                                <Box className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-bold ${isExpanded ? 'text-white' : 'text-gray-300'}`}>{prodName}</h4>
                                                <p className="text-[10px] text-gray-500 flex items-center gap-2">
                                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {prodAccounts.length}</span>
                                                    <span className="w-px h-2 bg-gray-600"></span>
                                                    <span className="flex items-center gap-1"><LinkIcon className="w-3 h-3" /> {prodLinks.length}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm(`Tem certeza que deseja excluir TODO o produto "${prodName}" e seus dados?`)) {
                                                        prodAccounts.forEach(a => onRemoveAccount(a.id));
                                                        setLinks(prev => prev.filter(l => l.product !== prodName));
                                                        toast.success(`Produto "${prodName}" removido.`);
                                                    }
                                                }}
                                                className="p-1 hover:bg-red-500/20 rounded text-gray-600 hover:text-red-500 transition-colors"
                                                title="Excluir produto e dados"
                                            >
                                                <Trash className="w-3 h-3" />
                                            </button>
                                            {isExpanded ? <ChevronDown className="w-4 h-4 text-brand-primary" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="border-t border-gray-700 bg-black/20"
                                            >
                                                {/* Mini Tabs */}
                                                <div className="flex border-b border-gray-700">
                                                    <button
                                                        onClick={() => setProductTab('accounts')}
                                                        className={`flex-1 py-2 text-[10px] font-bold uppercase transition-colors ${productTab === 'accounts' ? 'bg-brand-primary/10 text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500 hover:text-gray-300'}`}
                                                    >
                                                        Contas ({prodAccounts.length})
                                                    </button>
                                                    <button
                                                        onClick={() => setProductTab('links')}
                                                        className={`flex-1 py-2 text-[10px] font-bold uppercase transition-colors ${productTab === 'links' ? 'bg-brand-primary/10 text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500 hover:text-gray-300'}`}
                                                    >
                                                        Links ({prodLinks.length})
                                                    </button>
                                                </div>

                                                {/* Tab Content */}
                                                <div className="p-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                    {productTab === 'accounts' && (
                                                        <div className="space-y-2">
                                                            {prodAccounts.map(acc => (
                                                                <div key={acc.id} className="flex items-center justify-between p-2 rounded bg-gray-700/30 border border-gray-700 hover:border-gray-500">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-5 h-5 rounded flex items-center justify-center text-[8px] ${acc.platform === 'Instagram' ? 'bg-pink-600 text-white' : 'bg-black text-white'}`}>
                                                                            {acc.platform[0]}
                                                                        </div>
                                                                        <span className="text-xs text-gray-300 font-mono">{acc.username}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <button onClick={() => onRemoveAccount(acc.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                                                                            <Trash className="w-3 h-3" />
                                                                        </button>
                                                                        <span className="text-[9px] text-green-400">● ON</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {prodAccounts.length === 0 && <p className="text-xs text-gray-500 text-center py-2">Nenhuma conta conectada.</p>}
                                                        </div>
                                                    )}

                                                    {productTab === 'links' && (
                                                        <div className="space-y-2">
                                                            {prodLinks.map(link => (
                                                                <div key={link.id} className={`p-2 rounded border ${link.isDefault ? 'bg-brand-primary/5 border-brand-primary/30' : 'bg-gray-700/30 border-gray-700'}`}>
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <span className={`text-[10px] font-bold ${link.isDefault ? 'text-brand-primary' : 'text-gray-300'}`}>{link.offerName}</span>
                                                                        {link.isDefault && <span className="text-[8px] bg-brand-primary/20 text-brand-primary px-1 rounded">DEFAULT</span>}
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <code className="text-[9px] text-gray-500 bg-black/30 px-1 py-0.5 rounded flex-1 truncate">{link.url}</code>
                                                                        <button onClick={() => { navigator.clipboard.writeText(link.url); toast.success("Copiado") }}><Copy className="w-3 h-3 text-gray-500 hover:text-white" /></button>
                                                                        <button onClick={() => { setLinks(prev => prev.filter(l => l.id !== link.id)); toast.success("Link removido") }}><Trash className="w-3 h-3 text-gray-500 hover:text-red-500" /></button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    {/* Global Rules Config (STRATEGY BOARD) */}
                    <Card className="p-0 bg-gray-800 border-gray-700 shadow-xl mt-8 overflow-hidden">
                        <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                                <Brain className="w-4 h-4 text-brand-primary" /> Matriz Estratégica (DNA)
                            </h3>
                            <div className="flex gap-2">
                                <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1"><Lock className="w-2 h-2" /> 4 Diretrizes Blindadas</span>
                                <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 flex items-center gap-1"><Zap className="w-2 h-2" /> DNA Ativo</span>
                            </div>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* SECTION A: MANDATORY DIRECTIVES */}
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest pl-1">01. Diretrizes Globais Obrigatórias</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="bg-gray-900/80 border-l-2 border-red-500 p-2 rounded-r flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-3 h-3 text-red-500" />
                                            <span className="text-[10px] text-gray-200 font-bold">Nunca Encerrar Sem CTA</span>
                                        </div>
                                        <span className="text-[9px] text-gray-500 italic">"Sempre envie o link."</span>
                                    </div>
                                    <div className="bg-gray-900/80 border-l-2 border-red-500 p-2 rounded-r flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-3 h-3 text-red-500" />
                                            <span className="text-[10px] text-gray-200 font-bold">Espelhamento de Energia</span>
                                        </div>
                                        <span className="text-[9px] text-gray-500 italic">"Use emojis se o cliente usar."</span>
                                    </div>
                                    <div className="bg-gray-900/80 border-l-2 border-red-500 p-2 rounded-r flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-3 h-3 text-red-500" />
                                            <span className="text-[10px] text-gray-200 font-bold">Anti-Vácuo Protocol</span>
                                        </div>
                                        <span className="text-[9px] text-gray-500 italic">"Responder &lt; 2 min."</span>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION B: PRODUCT DNA */}
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest pl-1 mt-2">02. DNA do Produto (Variável)</h4>
                                {!activeDNA ? (
                                    <div className="border border-dashed border-gray-700 rounded-lg p-4 text-center">
                                        <p className="text-[10px] text-gray-500">Selecione/Conecte um produto para carregar seu DNA.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-2">
                                            <p className="text-[9px] text-blue-400 font-bold mb-1 uppercase flex items-center gap-1"><FileText className="w-3 h-3" /> {activeDNA.product} - 7 Golden Qs</p>
                                            <div className="space-y-1 pl-1">
                                                {activeDNA.goldenQuestions.slice(0, 2).map((qi: any, i: number) => (
                                                    <div key={i} className="text-[9px] text-gray-400">
                                                        <span className="text-gray-500 font-bold">{qi.q}:</span> {qi.a}
                                                    </div>
                                                ))}
                                                <div className="text-[9px] text-gray-600 italic">+5 perguntas carregadas no contexto...</div>
                                            </div>
                                        </div>

                                        <div className="bg-orange-900/10 border border-orange-500/20 rounded-lg p-2">
                                            <p className="text-[9px] text-orange-400 font-bold mb-1 uppercase flex items-center gap-1"><Shield className="w-3 h-3" /> Killer Objections</p>
                                            <div className="space-y-1 pl-1">
                                                {activeDNA.objections.slice(0, 2).map((obj: any, i: number) => (
                                                    <div key={i} className="text-[9px] text-gray-400">
                                                        <span className="text-gray-500 font-bold">{obj.obj}:</span> {obj.handler}
                                                    </div>
                                                ))}
                                                <div className="text-[9px] text-gray-600 italic">+8 objeções carregadas no contexto...</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* SECTION C: CUSTOM RULES */}
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest pl-1 mt-2">03. Ajustes Finos (Opcional)</h4>
                                <div className="space-y-2">
                                    {rules.map((rule, idx) => (
                                        <div key={rule.id} className="flex gap-2 text-[10px] text-gray-400 font-mono border border-gray-700 bg-gray-900 px-2 py-1 rounded">
                                            <span className="text-yellow-600">User_Rule_{idx + 1}:</span>
                                            <span className="truncate flex-1">{rule.text}</span>
                                            <button onClick={() => handleDeleteRule(rule.id)} className="text-red-500 hover:text-red-400"><Trash className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <input
                                        className="flex-1 bg-black border border-gray-700 rounded p-1.5 text-[10px] text-white focus:border-brand-primary outline-none"
                                        placeholder="Ex: Não usar gíria 'Mano'..."
                                        value={newRuleText}
                                        onChange={e => setNewRuleText(e.target.value)}
                                    />
                                    <button onClick={handleAddRule} className="px-3 bg-gray-700 text-white text-[10px] font-bold rounded hover:bg-gray-600">+</button>
                                </div>
                            </div>
                        </div>
                    </Card>

                </div>

                {/* RIGHT COLUMN - TACTICAL HUD (Span 8) */}
                <div className="lg:col-span-8">

                    {/* MONITOR DISPLAY */}
                    <Card className="p-0 overflow-hidden border border-gray-800 bg-black shadow-2xl relative h-[750px] flex flex-col font-mono">
                        {/* Scanline Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[5] pointer-events-none bg-[length:100%_2px,3px_100%]"></div>

                        {/* Header Monitor */}
                        <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-900/90 z-10">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-5 h-5 text-green-500" />
                                <div>
                                    <h3 className="text-sm font-bold text-green-500 uppercase tracking-widest leading-none">Nexus_Terminal<span className="animate-pulse">_</span></h3>
                                    <p className="text-[10px] text-gray-600">Live Traffic Surveillance • Port 8080</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-gray-500 uppercase font-bold">Auto-Boost</span>
                                    <span className={`text-[9px] font-bold ${autoBoostEnabled ? 'text-green-500' : 'text-red-500'}`}>{autoBoostEnabled ? 'ENABLED' : 'DISABLED'}</span>
                                </div>
                                <div className="h-6 w-px bg-gray-800"></div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-gray-500 uppercase font-bold">System Load</span>
                                    <span className="text-[9px] font-bold text-green-500">12%</span>
                                </div>
                            </div>
                        </div>

                        {/* Logs Table Header */}
                        <div className="grid grid-cols-12 gap-2 text-[9px] text-gray-600 font-bold uppercase p-2 border-b border-gray-800 bg-gray-900/50 z-10">
                            <div className="col-span-2">Timestamp</div>
                            <div className="col-span-2">Source</div>
                            <div className="col-span-4">Incoming Message</div>
                            <div className="col-span-4">System Action / Response</div>
                        </div>

                        {/* Live Feed Container (Terminal Style) */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 relative z-10">
                            {liveLogs.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-xs text-green-900 font-mono animate-pulse">WAITING FOR DATA STREAM...</p>
                                </div>
                            ) : (
                                <AnimatePresence initial={false}>
                                    {liveLogs.map((log) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="grid grid-cols-12 gap-2 text-[10px] items-start p-1.5 hover:bg-green-500/5 group border-b border-gray-900 last:border-0"
                                        >
                                            {/* Time */}
                                            <div className="col-span-2 text-gray-500 font-mono">
                                                [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]
                                            </div>

                                            {/* Source */}
                                            <div className="col-span-2 flex flex-col">
                                                <span className={`font-bold ${log.platform === 'Instagram' ? 'text-pink-500' : log.platform === 'TikTok' ? 'text-white' : 'text-orange-500'}`}>{log.platform.toUpperCase()}</span>
                                                <span className="text-gray-400 group-hover:text-green-400 transition-colors cursor-pointer">{log.user}</span>
                                            </div>

                                            {/* Message */}
                                            <div className="col-span-4 text-gray-300 truncate pr-2">
                                                "{log.comment}"
                                            </div>

                                            {/* Action/Reply */}
                                            <div className="col-span-4 flex flex-col gap-1">
                                                <span className="text-[9px] text-blue-500 uppercase tracking-tighter flex items-center gap-1">
                                                    <Brain className="w-2 h-2" /> {log.action}
                                                </span>
                                                <span className="text-green-500/80 truncate">
                                                    {'>'} {log.reply}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </Card>
                </div>

            </div>

            <ConnectAccountModal
                isOpen={isConnectModalOpen}
                onClose={() => setIsConnectModalOpen(false)}
                onConnect={handleConnectAccount}
            />
        </div>
    );
};