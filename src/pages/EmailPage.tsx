
import React, { useState, useEffect, useRef } from 'react';
import { useCreditGuard } from '../hooks/useCreditGuard';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
    Mail, Zap, BarChart3,
    Activity, CheckCircle,
    Trash, PlusCircle, Filter,
    Clock, DollarSign, Link as LinkIcon,
    RefreshCw, Brain, FileText,
    Globe, LockClosed, ShieldCheck, Download,
    CloudUpload, MousePointer, X as XIcon, Phone,
    Eye, Pencil, ChevronLeft, Save, Server, Sliders, TrendingUp,
    PlayCircle, Users, Settings, Paperclip, Send, Database, HeartPulse, ShoppingBag, AlertTriangle, Tag
} from '../components/Icons';
import toast from 'react-hot-toast';
import { callMestreIA } from '../services/mestreIaService';
import { getAppProducts, getProductSmtpConfig } from '../services/mockFirebase';
import { AppProduct } from '../types';

// --- CONFIG & TYPES ---
const CAMPAIGN_TYPES = [
    'Recuperação de Carrinho (Urgência)',
    'Boas-vindas (Nutrição & Autoridade)',
    'Lançamento (Aquecimento)',
    'Venda Direta (Oferta Flash)',
    'Reengajamento (Lista Fria)',
    'Aplicação High Ticket',
    'Broadcast Sazonal'
];

interface EmailGenerated {
    subject: string;
    preview_text: string;
    corpo_email: string;
    analise_estrategica: string;
    score_otimizacao?: number;
}

// --- SUB-COMPONENT: SERVICE EMAIL CONFIG MODAL ---
const ServiceEmailConfigModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const [configs, setConfigs] = useState([
        { id: 'welcome', service: 'Boas-vindas (Novo Aluno)', tag: 'Marketing' },
        { id: 'reset', service: 'Recuperação de Senha', tag: 'Segurança' },
        { id: 'invoice', service: 'Fatura / Comprovante', tag: 'Financeiro' },
        { id: 'support', service: 'Respostas de Suporte', tag: 'Suporte' },
        { id: 'notification', service: 'Notificações do Sistema', tag: 'Geral' },
        { id: 'recovery', service: 'Recuperação de Carrinho', tag: 'Marketing' }
    ]);

    const handleTagChange = (id: string, newTag: string) => {
        setConfigs(prev => prev.map(c => c.id === id ? { ...c, tag: newTag } : c));
    };

    const handleSave = () => {
        // In a real app, this would save to backend. Mocking save.
        toast.success("Roteamento de serviços atualizado!");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-800 w-full max-w-lg rounded-2xl border border-gray-700 shadow-2xl p-6"
            >
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Tag className="w-6 h-6 text-brand-primary" /> E-mails de Serviço & Roteamento
                    </h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl mb-6">
                    <p className="text-xs text-blue-200">
                        Associe cada serviço automático a uma <strong>Tag de SMTP</strong>. O Nexus usará o servidor configurado com essa tag para realizar o disparo.
                    </p>
                </div>

                <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {configs.map((config) => (
                        <div key={config.id} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-700">
                            <span className="text-sm text-white font-medium">{config.service}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Enviar via:</span>
                                <select
                                    className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-brand-primary font-bold outline-none focus:border-brand-primary"
                                    value={config.tag}
                                    onChange={(e) => handleTagChange(config.id, e.target.value)}
                                >
                                    <option value="Marketing">Marketing</option>
                                    <option value="Financeiro">Financeiro</option>
                                    <option value="Suporte">Suporte</option>
                                    <option value="Segurança">Segurança</option>
                                    <option value="Geral">Geral</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave} className="!bg-green-600 hover:!bg-green-500">Salvar Roteamento</Button>
                </div>
            </motion.div>
        </div>
    );
};

// --- SUB-COMPONENT: MESTRE FULL CONTROL ---
const MestreFullControl: React.FC<{
    isActive: boolean;
    onToggle: (val: boolean) => void;
    syncStatus: 'synced' | 'disconnected'
}> = ({ isActive, onToggle, syncStatus }) => (
    <div className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-500 ${isActive ? 'bg-gray-900 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'bg-gray-800 border-gray-700'}`}>
        <div>
            <h3 className={`text-sm font-black uppercase flex items-center gap-2 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                <Zap className={`w-4 h-4 ${isActive ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
                Modo Mestre Full
                {isActive && <span className="text-[9px] bg-yellow-500 text-black px-2 py-0.5 rounded font-bold ml-2 animate-pulse">AUTÔNOMO</span>}
            </h3>
            <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                {syncStatus === 'synced' ? (
                    <span className="text-green-400 flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Sincronizado com Funil & PGS</span>
                ) : (
                    <span>Aguardando conexão...</span>
                )}
            </p>
        </div>
        <button
            onClick={() => onToggle(!isActive)}
            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isActive ? 'bg-yellow-500' : 'bg-gray-600'}`}
        >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md ${isActive ? 'left-7' : 'left-1'}`}></div>
        </button>
    </div>
);

// --- SUB-COMPONENT: OPTIMIZER AI STATUS ---
const OptimizerStatus: React.FC<{ isActive: boolean, onToggle: (val: boolean) => void }> = ({ isActive, onToggle }) => (
    <div className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-500 ${isActive ? 'bg-green-900/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-gray-800 border-gray-700'}`}>
        <div>
            <h3 className={`text-sm font-black uppercase flex items-center gap-2 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                <Brain className={`w-4 h-4 ${isActive ? 'text-green-400' : 'text-gray-500'}`} />
                Otimizador AI
                {isActive && <span className="text-[9px] bg-green-500 text-black px-2 py-0.5 rounded font-bold ml-2">24H ATIVO</span>}
            </h3>
            <p className="text-[10px] text-gray-500 mt-1">
                Testes A/B, hora certa e anti-spam automático.
            </p>
        </div>
        <button
            onClick={() => onToggle(!isActive)}
            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isActive ? 'bg-green-500' : 'bg-gray-600'}`}
        >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md ${isActive ? 'left-7' : 'left-1'}`}></div>
        </button>
    </div>
);

// --- MAIN PAGE ---

const EmailPage: React.FC = () => {
    // State
    const [activeTab, setActiveTab] = useState<'dashboard' | 'creator' | 'lists' | 'settings'>('creator');
    const [isMestreFull, setIsMestreFull] = useState(false);
    const [isOptimizer, setIsOptimizer] = useState(false);
    const [isServiceConfigOpen, setIsServiceConfigOpen] = useState(false);

    // Creator State
    const [availableProducts, setAvailableProducts] = useState<AppProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>(''); // NEW: Selected Product ID/Name
    const [smtpStatus, setSmtpStatus] = useState<'checking' | 'connected' | 'missing' | null>(null);
    const [smtpDetails, setSmtpDetails] = useState<any>(null);

    const [campaignType, setCampaignType] = useState(CAMPAIGN_TYPES[1]);
    const [targetAudience, setTargetAudience] = useState('');
    const [objection, setObjection] = useState('');
    const [destinationLink, setDestinationLink] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedEmail, setGeneratedEmail] = useState<EmailGenerated | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    // Automation Mock
    const [autoLogs, setAutoLogs] = useState<string[]>([]);
    const [isSending, setIsSending] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        sent: 15420,
        openRate: 42.5,
        clickRate: 18.2,
        sales: 489,
        roas: 12.4,
        spamScore: 9.8 // 10 is clean
    });

    const { checkAndConsume } = useCreditGuard();

    useEffect(() => {
        getAppProducts().then(setAvailableProducts);
    }, []);

    // NEW: Handle Product Selection & SMTP Check
    const handleProductSelect = async (prodName: string) => {
        setSelectedProduct(prodName);
        if (!prodName) {
            setSmtpStatus(null);
            return;
        }

        setSmtpStatus('checking');
        // Simulate checking integrations
        const config = await getProductSmtpConfig(prodName);

        if (config) {
            setSmtpStatus('connected');
            setSmtpDetails(config);
            toast.success("SMTP Conectado! Disparos autônomos habilitados.", { icon: '🔌' });
        } else {
            setSmtpStatus('missing');
            toast.error("Produto sem SMTP configurado em Integrações.", { icon: '⚠️' });
        }
    };

    // Mestre Full / Optimizer Simulation
    useEffect(() => {
        let interval: any;
        if (isMestreFull || isOptimizer) {
            interval = setInterval(() => {
                const actions = [
                    "Otimizador: Teste A/B iniciado para 'Recuperação V3'...",
                    "Anti-Spam: Domínio verificado (Limpo).",
                    "Funil Sync: Novo lead 'Quente' detectado. Disparando sequência de conversão.",
                    "Mestre Full: Escala de orçamento aprovada (+20%).",
                    "Métrica: Taxa de abertura subiu para 44% na última hora."
                ];
                const randomAction = actions[Math.floor(Math.random() * actions.length)];

                // Add log
                setAutoLogs(prev => [randomAction, ...prev].slice(0, 5));

                // Update stats slightly
                setStats(prev => ({
                    ...prev,
                    sent: prev.sent + Math.floor(Math.random() * 5),
                    openRate: parseFloat((prev.openRate + (Math.random() * 0.1 - 0.05)).toFixed(1)),
                    sales: prev.sales + (Math.random() > 0.8 ? 1 : 0)
                }));
            }, 4000);
        }
        return () => clearInterval(interval);
    }, [isMestreFull, isOptimizer]);

    // Handlers
    const handleMestreFullToggle = (val: boolean) => {
        setIsMestreFull(val);
        if (val) {
            setIsOptimizer(true); // Force optimizer on
            toast.success("MODO MESTRE FULL ATIVADO! Sincronizado com Funil & PGS.", { icon: '⚡', duration: 4000 });
        } else {
            toast("Modo Mestre Full Desativado.", { icon: '⏸️' });
        }
    };

    const handleGenerateEmail = async () => {
        if (!selectedProduct) return toast.error("Selecione um Produto primeiro!");
        if (smtpStatus !== 'connected') return toast.error("Configure o SMTP em Integrações antes de gerar campanha.");
        if (!destinationLink) return toast.error("Link de destino é obrigatório.");

        const proceed = await checkAndConsume('email_marketing_generator', 'Geração Campanha Email');
        if (!proceed) return;

        setIsGenerating(true);
        setGeneratedEmail(null);

        // Prepare data with correct mapping
        const inputData = {
            campaignType: campaignType,
            product: selectedProduct, // Use selected product
            target: targetAudience || "Público Geral do Produto",
            objection: objection || "Preço/Confiança",
            link: destinationLink,
        };

        try {
            const res = await callMestreIA('email_marketing_master', inputData);

            let content = res.output;
            // JSON Cleaning logic
            if (content.includes('```json')) {
                content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            } else if (content.includes('```')) {
                content = content.replace(/```/g, '').trim();
            }

            try {
                const parsed = JSON.parse(content);
                setGeneratedEmail({
                    subject: parsed.assunto,
                    preview_text: parsed.preview_text || "Preview otimizado...",
                    corpo_email: parsed.corpo_email,
                    analise_estrategica: parsed.analise_estrategica,
                    score_otimizacao: Math.floor(Math.random() * 15) + 85
                });
                toast.success("E-mail Estratégico Gerado!", { icon: '📧' });
            } catch (e) {
                console.error("JSON Parse Error", e);
                setGeneratedEmail({
                    subject: `Estratégia: ${campaignType.split('(')[0].trim()}`,
                    preview_text: "...",
                    corpo_email: content,
                    analise_estrategica: "Gerado em modo texto."
                });
            }
        } catch (e) {
            toast.error("Erro na geração. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendNow = async () => {
        if (!generatedEmail) return;

        const proceed = await checkAndConsume('email_broadcast', 'Envio Email SMTP');
        if (!proceed) return;

        setIsSending(true);
        // Simulate sending via SMTP
        setTimeout(() => {
            setIsSending(false);
            toast.success(`Enviado via ${smtpDetails?.host} com sucesso!`);
            setStats(prev => ({ ...prev, sent: prev.sent + 1 }));
            setAutoLogs(prev => [`[SMTP] Disparo manual realizado para lista ativa.`, ...prev]);
        }, 2000);
    }

    const handleListUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            toast.success(`Lista "${file.name}" carregada no Firebase!`, { icon: 'cloud' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 md:p-8 animate-fade-in pb-20">
            {/* HEADER AREA */}
            <div className="flex flex-col xl:flex-row justify-between items-start gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Mail className="w-10 h-10 text-brand-primary" />
                        E-mail Marketing <span className="text-purple-500">360º</span>
                    </h1>
                    <p className="text-gray-400 mt-2 max-w-xl">
                        A única plataforma que integra Funil, WhatsApp e E-mail em um organismo vivo.
                        Gera copy, envia, otimiza e escala vendas automaticamente.
                    </p>
                </div>

                {/* CONTROL SWITCHES */}
                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    <OptimizerStatus isActive={isOptimizer} onToggle={setIsOptimizer} />
                    <MestreFullControl isActive={isMestreFull} onToggle={handleMestreFullToggle} syncStatus="synced" />
                </div>
            </div>

            {/* LIVE KPI BAR */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <Card className="p-3 bg-gray-800 border-l-4 border-l-purple-500">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">E-mails Enviados</p>
                    <h3 className="text-xl font-black text-white">{stats.sent.toLocaleString()}</h3>
                </Card>
                <Card className="p-3 bg-gray-800 border-l-4 border-l-green-500">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Taxa Abertura</p>
                    <h3 className="text-xl font-black text-green-400">{stats.openRate}%</h3>
                </Card>
                <Card className="p-3 bg-gray-800 border-l-4 border-l-blue-500">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">CTR (Cliques)</p>
                    <h3 className="text-xl font-black text-blue-400">{stats.clickRate}%</h3>
                </Card>
                <Card className="p-3 bg-gray-800 border-l-4 border-l-yellow-500">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Vendas (Email)</p>
                    <h3 className="text-xl font-black text-yellow-400">{stats.sales}</h3>
                </Card>
                <Card className="p-3 bg-gray-800 border-l-4 border-l-red-500 hidden md:block">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Saúde Domínio</p>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                        {stats.spamScore}/10 <ShieldCheck className="w-4 h-4 text-green-500" />
                    </h3>
                </Card>
            </div>

            {/* AUTONOMOUS LOG (VISIBLE IF OPTIMIZER OR FULL MODE) */}
            <AnimatePresence>
                {(isOptimizer || isMestreFull) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ height: 0, opacity: 0 }} className="mb-8">
                        <div className="bg-black/50 border border-green-500/30 rounded-xl p-4 font-mono text-xs shadow-inner">
                            <p className="text-green-500 font-bold mb-2 flex items-center gap-2"><Activity className="w-3 h-3 animate-pulse" /> LOG DE ATIVIDADE AUTÔNOMA</p>
                            <div className="space-y-1">
                                {autoLogs.map((log, i) => (
                                    <p key={i} className="text-gray-400 truncate border-b border-gray-800/50 pb-1 last:border-0">
                                        <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span> {log}
                                    </p>
                                ))}
                                {autoLogs.length === 0 && <p className="text-gray-600 italic">Iniciando monitoramento...</p>}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN NAVIGATION & CONTENT */}
            <div className="flex flex-col lg:flex-row gap-8">

                {/* SIDEBAR NAVIGATION (PURPLE NEON STYLE AS REQUESTED) */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg sticky top-6">
                        <div className="p-4 bg-purple-900/20 border-b border-purple-500/30">
                            <h3 className="text-purple-400 font-bold text-sm uppercase tracking-wide">Menu Principal</h3>
                        </div>
                        <nav className="p-2 space-y-1">
                            <button onClick={() => setActiveTab('creator')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${activeTab === 'creator' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                                <Brain className="w-4 h-4" /> Criar Campanhas
                            </button>
                            <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${activeTab === 'dashboard' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                                <BarChart3 className="w-4 h-4" /> Dashboard
                            </button>
                            <button onClick={() => setActiveTab('lists')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${activeTab === 'lists' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                                <Users className="w-4 h-4" /> Listas & Leads
                            </button>
                            <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${activeTab === 'settings' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                                <Settings className="w-4 h-4" /> Configurações
                            </button>
                        </nav>

                        <div className="p-4 border-t border-gray-700 mt-2">
                            <div className="bg-gray-900 rounded p-3 text-xs text-gray-500 text-center border border-dashed border-gray-600">
                                Integração: <span className={smtpStatus === 'connected' ? "text-green-400 font-bold" : "text-gray-500"}>{smtpStatus === 'connected' ? 'Ativa' : 'Inativa'}</span>
                                <br />{smtpDetails ? smtpDetails.host : 'Nenhum SMTP'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">

                        {/* 1. CREATOR VIEW (INTEGRATED) */}
                        {activeTab === 'creator' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <Card className="p-6 bg-gray-800 border-gray-700 h-full flex flex-col">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Brain className="w-6 h-6 text-brand-primary" /> Gerador Estratégico (Funil Integrado)
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-1">
                                            A IA lê os dados do Card FUNIL & PGS para criar campanhas que convertem.
                                        </p>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        {/* STEP 1: PRODUCT SELECTION (MANDATORY) */}
                                        <div className="bg-gray-900 p-4 rounded-xl border border-gray-600">
                                            <label className="text-gray-300 text-xs font-bold uppercase mb-2 block flex items-center gap-2">
                                                <ShoppingBag className="w-4 h-4 text-green-500" /> 1. Selecione o Produto (Obrigatório)
                                            </label>
                                            <select
                                                className="w-full bg-gray-800 border border-gray-500 rounded-lg p-3 text-white outline-none focus:border-brand-primary transition-colors"
                                                value={selectedProduct}
                                                onChange={e => handleProductSelect(e.target.value)}
                                            >
                                                <option value="">-- Selecione um Produto --</option>
                                                {availableProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                            </select>

                                            {/* SMTP Status Indicator */}
                                            <div className="mt-3 flex items-center gap-2 text-xs">
                                                <span className="text-gray-500 font-bold uppercase">Status SMTP:</span>
                                                {smtpStatus === 'checking' && <span className="text-yellow-500 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Verificando Integração...</span>}
                                                {smtpStatus === 'connected' && <span className="text-green-400 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Conectado: {smtpDetails?.host}</span>}
                                                {smtpStatus === 'missing' && (
                                                    <span className="text-red-400 font-bold flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" /> Sem SMTP configurado em Integrações.
                                                    </span>
                                                )}
                                                {!smtpStatus && <span className="text-gray-600">Aguardando seleção...</span>}
                                            </div>
                                        </div>

                                        {/* Nexus Connection Visualization */}
                                        {selectedProduct && smtpStatus === 'connected' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg flex items-center gap-3"
                                            >
                                                <Server className="w-5 h-5 text-blue-400 animate-pulse" />
                                                <div>
                                                    <p className="text-blue-200 text-xs font-bold">Nexus Autônomo Conectado</p>
                                                    <p className="text-gray-400 text-[10px]">Lendo dados de Funil & PGS para: {selectedProduct}</p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* STEP 2: CAMPAIGN CONFIG (LOCKED UNTIL PRODUCT) */}
                                        <div className={`space-y-4 transition-opacity ${!selectedProduct || smtpStatus !== 'connected' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                            <div>
                                                <label className="text-gray-300 text-xs font-bold uppercase mb-2 block">2. Objetivo / Campanha</label>
                                                <select
                                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white outline-none focus:border-brand-primary transition-colors"
                                                    value={campaignType}
                                                    onChange={e => setCampaignType(e.target.value)}
                                                >
                                                    {CAMPAIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <Input label="Público / Temp." value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="Ex: Lead Frio" />
                                                <Input label="Objeção Principal" value={objection} onChange={e => setObjection(e.target.value)} placeholder="Ex: Preço" />
                                            </div>

                                            <div>
                                                <label className="text-gray-300 text-xs font-bold uppercase mb-2 block flex items-center gap-2">
                                                    Link de Ação <span className="text-[10px] bg-green-900 text-green-400 px-1 rounded">Rastreado</span>
                                                </label>
                                                <input
                                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white outline-none focus:border-brand-primary transition-colors font-mono text-xs text-blue-300"
                                                    value={destinationLink}
                                                    onChange={e => setDestinationLink(e.target.value)}
                                                    placeholder="https://mestre15x.com/checkout?src=email_ia"
                                                />
                                            </div>

                                            {/* File Upload for Lead Magnet Campaigns */}
                                            <div className="pt-2">
                                                <label className="flex items-center gap-3 p-3 border border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                                                    <Paperclip className="w-5 h-5 text-gray-400" />
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-300">Anexar PDF / Isca Digital (Opcional)</p>
                                                        <p className="text-[10px] text-gray-500">Armazenado no Firebase Secure Storage</p>
                                                    </div>
                                                    <input type="file" className="hidden" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-700">
                                        <Button
                                            onClick={handleGenerateEmail}
                                            isLoading={isGenerating}
                                            disabled={!selectedProduct || smtpStatus !== 'connected'}
                                            className="w-full !bg-purple-600 hover:!bg-purple-500 font-black uppercase text-sm !py-4 shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
                                        >
                                            <Brain className="w-5 h-5" /> GERAR E-MAIL OTIMIZADO
                                        </Button>
                                    </div>
                                </Card>

                                {/* RESULT PREVIEW */}
                                <div className="bg-white rounded-xl overflow-hidden flex flex-col shadow-2xl h-full min-h-[500px]">
                                    <div className="bg-gray-100 p-4 border-b border-gray-300 flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        </div>
                                        <div className="bg-white px-3 py-1 rounded text-xs text-gray-500 flex-1 text-center font-mono">
                                            preview: {selectedProduct ? `${selectedProduct.toLowerCase().replace(/\s/g, '_')}.eml` : 'novo_email.eml'}
                                        </div>
                                    </div>

                                    <div className="flex-1 p-6 overflow-y-auto bg-white text-gray-800 font-sans relative">
                                        {generatedEmail ? (
                                            <div className="space-y-6">
                                                <div className="border-b pb-4">
                                                    <p className="text-sm text-gray-500 font-bold">Assunto:</p>
                                                    <p className="text-lg font-bold text-gray-900">{generatedEmail.subject}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{generatedEmail.preview_text}</p>
                                                </div>

                                                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                    {generatedEmail.corpo_email}
                                                </div>

                                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mt-8">
                                                    <p className="text-xs font-bold text-purple-700 uppercase mb-1 flex items-center gap-2">
                                                        <Brain className="w-3 h-3" /> Análise da IA
                                                    </p>
                                                    <p className="text-xs text-purple-600">{generatedEmail.analise_estrategica}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                                <Mail className="w-16 h-16 mb-4" />
                                                <p className="text-sm font-medium">Aguardando geração...</p>
                                            </div>
                                        )}
                                    </div>

                                    {generatedEmail && (
                                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                                            <Button variant="secondary" className="flex-1 !bg-white border-gray-300 text-gray-600 hover:!bg-gray-100" onClick={() => { navigator.clipboard.writeText(generatedEmail.corpo_email); toast.success("Copiado!"); }}>
                                                Copiar
                                            </Button>
                                            <Button
                                                onClick={handleSendNow}
                                                isLoading={isSending}
                                                className="flex-[2] !bg-green-600 hover:!bg-green-500 font-bold"
                                            >
                                                <Send className="w-4 h-4 mr-2" />
                                                {isMestreFull && smtpDetails ? `DISPARAR VIA ${smtpDetails.host}` : 'ENVIAR AGORA'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* 2. DASHBOARD VIEW */}
                        {activeTab === 'dashboard' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                                <Card className="p-6 bg-gray-800 border-gray-700">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-brand-primary" /> Performance Recente</h3>
                                    <div className="h-64 flex items-end justify-between gap-2 px-2 bg-gray-900/50 rounded-lg border border-gray-700 p-4">
                                        {[45, 60, 35, 70, 80, 55, 90, 65, 85, 95].map((h, i) => (
                                            <div key={i} className="flex-1 bg-purple-900/30 rounded-t relative group h-full flex flex-col justify-end">
                                                <div className="w-full bg-purple-500 hover:bg-purple-400 transition-all rounded-t" style={{ height: `${h}%` }}></div>
                                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                                                    {h}% Abertura
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* 3. LISTS VIEW */}
                        {activeTab === 'lists' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <Card className="p-6 bg-gray-800 border-gray-700">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Database className="w-5 h-5 text-blue-400" /> Listas de Contatos
                                        </h3>
                                        <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
                                            <CloudUpload className="w-4 h-4" /> Importar CSV/XLSX
                                            <input type="file" className="hidden" accept=".csv,.xlsx" onChange={handleListUpload} />
                                        </label>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-900 text-gray-400 text-xs uppercase font-bold">
                                                <tr>
                                                    <th className="p-4 rounded-l-lg">Nome da Lista</th>
                                                    <th className="p-4">Leads</th>
                                                    <th className="p-4">Origem</th>
                                                    <th className="p-4">Status</th>
                                                    <th className="p-4 text-right rounded-r-lg">Ação</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700">
                                                {[
                                                    { name: 'Compradores Mestre 15X', count: 489, origin: 'Hotmart Webhook', status: 'Ativa' },
                                                    { name: 'Abandono Checkout (7d)', count: 1250, origin: 'Funil & PGS', status: 'Ativa' },
                                                    { name: 'Lead Magnet (Ebook)', count: 3400, origin: 'Página Captura', status: 'Ativa' },
                                                    { name: 'Lista Fria (Importada)', count: 5000, origin: 'CSV Upload', status: 'Aquecendo' },
                                                ].map((list, i) => (
                                                    <tr key={i} className="hover:bg-gray-700/30 transition-colors">
                                                        <td className="p-4 text-white font-bold">{list.name}</td>
                                                        <td className="p-4 text-gray-300">{list.count.toLocaleString()}</td>
                                                        <td className="p-4 text-brand-primary text-xs">{list.origin}</td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${list.status === 'Ativa' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                                {list.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <button className="text-gray-500 hover:text-white"><Settings className="w-4 h-4" /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* 4. SETTINGS VIEW (MOCK) */}
                        {activeTab === 'settings' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <Card className="p-6 bg-gray-800 border-gray-700">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-white">Configurações Avançadas</h3>
                                        <Button
                                            onClick={() => setIsServiceConfigOpen(true)}
                                            className="!py-2 !px-4 !text-xs !bg-blue-600 hover:!bg-blue-500 flex items-center gap-2"
                                        >
                                            <Tag className="w-4 h-4" /> Conf. Email de Serviços
                                        </Button>
                                    </div>
                                    <p className="text-gray-400 text-sm">Integração SMTP e Regras de Disparo estão no Hub de Integrações.</p>
                                    <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-600">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-white font-bold text-sm">Domínio de Envio</span>
                                            <span className="text-green-400 text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> VERIFICADO</span>
                                        </div>
                                        <p className="text-gray-500 text-xs">mail.mestre15x.com (IP Dedicado)</p>
                                    </div>

                                    <div className="mt-4">
                                        <label className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg cursor-pointer">
                                            <input type="checkbox" className="form-checkbox text-purple-600 rounded bg-gray-800 border-gray-600" />
                                            <div>
                                                <span className="text-white font-bold text-sm block">Modo Aquecimento de IP</span>
                                                <span className="text-gray-500 text-xs">Limita envios diários para evitar spam.</span>
                                            </div>
                                        </label>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>

            {/* Service Config Modal */}
            <ServiceEmailConfigModal
                isOpen={isServiceConfigOpen}
                onClose={() => setIsServiceConfigOpen(false)}
            />
        </div>
    );
};

export default EmailPage;
