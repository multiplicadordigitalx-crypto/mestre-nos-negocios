
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import {
    ClipboardCopy, Pencil, Link as LinkIcon, Eye, CheckCircle,
    Clock, X as XIcon, LockClosed, PlusCircle, ShoppingBag, Trophy, ExternalLink,
    DollarSign, BarChart3, Users, Zap, ShieldCheck,
    Search, Trash, ActivityIcon,
    Brain, Crown, Info,
    TrendingUp, PieChart, Whatsapp, Wallet, Target, Star, ArrowRight,
    Filter, AlertTriangle, Film
} from '../../../components/Icons';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
// Added ProductDNA to imports
import { AppProduct, CheckoutLink, ProductDNA } from '../../../types';
import { getAppProducts, saveAppProduct, updateProductDNA, calibrateAutonomousDNA, sendInviteViaWhatsAppInstance } from '../../../services/mockFirebase';
// Added callMestreIA to imports
import { callMestreIA } from '../../../services/mestreIaService';
import { ProductWizardModal } from '../../../components/ProductWizardModal';
import { NexusOnboardingModal } from '../../../components/NexusOnboardingModal';

// --- CONSTANTS ---
const PLATFORM_INFO: Record<string, string> = {
    'Hotmart': 'Taxa de 9.9% + R$ 1,00 por venda. Líder de mercado, maior segurança.',
    'Kiwify': 'Taxa de 8.99% + R$ 2,49. Saque em D+2. Ótimo para infoprodutos rápidos.',
    'Monetizze': 'Taxa de 9.9% + R$ 1,00. Forte em produtos físicos.',
    'Cakto': 'Taxas competitivas e foco em conversão mobile.',
    'Eduzz': 'Taxa de 4.9% + R$ 1,00 (Start). Recuperação de vendas nativa.'
};

// --- SUB-COMPONENTS (Local Definitions to mirror Admin View) ---

const KpiCard: React.FC<{
    label: string,
    value: string,
    icon: React.ReactNode,
    color: string,
    subValue?: string,
    onClick?: () => void
}> = ({ label, value, icon, color, subValue, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-${color.split('-')[1]}-500/50 transition-all shadow-lg cursor-pointer hover:scale-[1.02] group relative overflow-hidden`}
    >
        <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full ${color.replace('text-', 'bg-').replace('400', '500')}/10 blur-xl group-hover:blur-2xl transition-all`}></div>
        <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
            <div className={`p-2 rounded-lg ${color} bg-opacity-20 border border-current border-opacity-10`}>
                {icon}
            </div>
        </div>
        <p className="text-2xl font-black text-white relative z-10">{value}</p>
        {subValue && (
            <p className="text-[10px] text-gray-500 font-medium mt-1">{subValue}</p>
        )}
        {onClick && (
            <p className="text-[9px] text-gray-600 mt-2 flex items-center justify-end gap-1 group-hover:text-white transition-colors uppercase font-bold tracking-wider">
                Ver detalhes <ArrowRight className="w-3 h-3" />
            </p>
        )}
    </div>
);

const DetailModal: React.FC<{ isOpen: boolean, onClose: () => void, title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ isOpen, onClose, title, icon, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-900 w-full max-w-5xl h-[90vh] rounded-[2rem] border border-gray-800 shadow-2xl flex flex-col overflow-hidden"
            >
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/80 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-800 rounded-xl border border-gray-700">{icon}</div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">{title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-all">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-grid-white/[0.02]">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

const DnaGoldenQuestion: React.FC<{ label: string, value?: string, icon?: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-brand-primary/30 transition-colors">
        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 flex items-center gap-2">
            {icon} {label}
        </p>
        <p className="text-sm text-gray-200 leading-relaxed italic">{value || 'Aguardando mapeamento estratégico...'}</p>
    </div>
);

const PersonaCard: React.FC<{ title: string, persona?: any, type: 'ideal' | 'real' }> = ({ title, persona, type }) => (
    <div className={`p-5 rounded-2xl border ${type === 'ideal' ? 'bg-purple-900/10 border-purple-500/30 shadow-lg' : 'bg-green-900/10 border-green-500/30 shadow-lg'}`}>
        <h4 className={`text-sm font-black uppercase mb-4 flex items-center gap-2 ${type === 'ideal' ? 'text-purple-400' : 'text-green-400'}`}>
            {type === 'ideal' ? <Brain className="w-4 h-4" /> : <Target className="w-4 h-4" />}
            {title}
        </h4>
        <div className="space-y-3">
            <div className="flex justify-between text-xs border-b border-gray-700/50 pb-2">
                <span className="text-gray-500 font-bold uppercase text-[9px]">Público Alvo:</span>
                <span className="text-white font-black">{persona?.ageRange || persona?.topDemographics || '-'}</span>
            </div>
            <div className="flex justify-between text-xs border-b border-gray-700/50 pb-2">
                <span className="text-gray-500 font-bold uppercase text-[9px]">Gênero:</span>
                <span className="text-white font-black">{persona?.gender || '-'}</span>
            </div>
            <div className="flex justify-between text-xs border-b border-gray-700/50 pb-2">
                <span className="text-gray-500 font-bold uppercase text-[9px]">Dor Central:</span>
                <span className="text-white font-black truncate max-w-[150px]">{persona?.mainPain || persona?.commonObjections?.[0] || '-'}</span>
            </div>
            <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-bold uppercase text-[9px]">Desejo / LTV:</span>
                <span className="text-white font-black truncate max-w-[150px]">{persona?.mainDesire || `R$ ${persona?.avgLtv?.toFixed(2) || '0,00'}`}</span>
            </div>
        </div>
    </div>
);

const CheckoutManagerModal: React.FC<{ isOpen: boolean, onClose: () => void, product: AppProduct, onUpdate: (updatedProduct: AppProduct) => void }> = ({ isOpen, onClose, product, onUpdate }) => {
    const [links, setLinks] = useState<CheckoutLink[]>(product.checkoutLinks || []);
    const [newPlatform, setNewPlatform] = useState('Hotmart');
    const [newUrl, setNewUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { setLinks(product.checkoutLinks || []); }, [product]);
    if (!isOpen) return null;

    const handleAddLink = () => {
        if (!newUrl.trim()) return toast.error("Insira a URL do checkout.");
        const newLinkObj: CheckoutLink = { id: `link-${Date.now()}`, platform: newPlatform, url: newUrl, active: true };
        setLinks(prev => [...prev, newLinkObj]);
        setNewUrl('');
        toast.success("Link importado para a lista!");
    };

    const handleToggleLinkLocal = (id: string, platform: string, isActive: boolean) => {
        const newState = !isActive;
        setLinks(prev => prev.map(l => l.id === id ? { ...l, active: newState } : l));
        if (!newState) toast(`Vendas PAUSADAS para ${platform}.`, { icon: '⏸️' });
        else toast(`Vendas ATIVADAS para ${platform}.`, { icon: '▶️' });
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            const updatedProduct = { ...product, checkoutLinks: links };
            if (links.length > 0) {
                const activeLink = links.find(l => l.active) || links[0];
                updatedProduct.platform = activeLink.platform as any;
                updatedProduct.baseAffiliateLink = activeLink.url;
            }
            await saveAppProduct(updatedProduct);
            onUpdate(updatedProduct);
            toast.success("Configuração salva!");
            onClose();
        } catch (e) { toast.error("Erro ao salvar."); } finally { setIsSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[160] p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-800 w-full max-w-xl rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-2xl">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><LinkIcon className="w-5 h-5 text-brand-primary" /> Gerenciar Links</h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                    <div className="space-y-3">
                        {links.length === 0 && <p className="text-center text-gray-500 text-xs py-4">Nenhum link cadastrado.</p>}
                        {links.map((link) => (
                            <div key={link.id} className={`bg-gray-900 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${link.active ? 'border-green-500/30' : 'border-red-500/30 opacity-75'}`}>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-bold text-white">{link.platform}</span>
                                        {link.active ?
                                            <span className="bg-green-500/20 text-green-400 text-[9px] px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Vendas Ativas</span> :
                                            <span className="bg-red-500/20 text-red-400 text-[9px] px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1"><LockClosed className="w-3 h-3" /> Pausado</span>
                                        }
                                    </div>
                                    <p className="text-[10px] text-blue-300 font-mono truncate max-w-xs">{link.url}</p>
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                    <div className="flex gap-2">
                                        <button onClick={() => { navigator.clipboard.writeText(link.url); toast.success("Copiado!"); }} className="p-2 bg-gray-800 rounded text-gray-400 hover:text-white transition-colors border border-gray-700" title="Copiar Link"><ClipboardCopy className="w-4 h-4" /></button>
                                        <button onClick={() => window.open(link.url, '_blank')} className="p-2 bg-gray-800 rounded text-gray-400 hover:text-white transition-colors border border-gray-700" title="Testar Link"><ArrowRight className="w-4 h-4" /></button>
                                    </div>

                                    <label className="relative inline-flex items-center cursor-pointer ml-2" title={link.active ? "Pausar Vendas" : "Ativar Vendas"}>
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={link.active}
                                            onChange={() => handleToggleLinkLocal(link.id, link.platform, link.active)}
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 mt-6">
                        <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase flex items-center gap-2"><PlusCircle className="w-4 h-4" /> Importar Link Externo</h4>
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                <select className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white text-xs outline-none w-1/3" value={newPlatform} onChange={e => setNewPlatform(e.target.value)}>{Object.keys(PLATFORM_INFO).map(p => <option key={p} value={p}>{p}</option>)}</select>
                                <input className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white text-xs outline-none flex-1" placeholder="https://pay..." value={newUrl} onChange={e => setNewUrl(e.target.value)} />
                            </div>
                            <Button onClick={handleAddLink} variant="secondary" className="!py-2 !text-xs w-full border-dashed border-gray-600 text-gray-300 hover:text-white">Adicionar à Lista</Button>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-700 bg-gray-900/50 flex justify-end gap-3 rounded-b-2xl">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSaveAll} isLoading={isSaving} className="!bg-green-600 hover:!bg-green-500">Salvar</Button>
                </div>
            </motion.div>
        </div>
    );
};

interface ProductIntelligenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: AppProduct;
    onManageLinks: () => void;
    onToggleLink: (product: AppProduct, linkId: string) => void;
    onGenerateDna: () => void;
    onCalibrate: () => void;
    isGeneratingDna: boolean;
    isCalibrating: boolean;
    initialTab?: 'stats' | 'dna';
    onSetupNexus?: () => void;
}

const ProductIntelligenceModal: React.FC<ProductIntelligenceModalProps> = ({
    isOpen, onClose, product, onManageLinks, onToggleLink, onGenerateDna, onCalibrate, isGeneratingDna, isCalibrating, onSetupNexus, initialTab = 'stats'
}) => {
    const [activeTab, setActiveTab] = useState<'stats' | 'dna'>(initialTab);

    useEffect(() => {
        if (isOpen) setActiveTab(initialTab);
    }, [isOpen, initialTab]);

    if (!isOpen) return null;

    const revenue = product.stats?.revenue || 0;
    const adSpend = revenue * 0.35;
    const profit = revenue - adSpend;
    const roas = adSpend > 0 ? (revenue / adSpend).toFixed(2) : "0.00";
    const alignmentScore = product.dna?.alignmentScore || 0;
    const scoreColor = alignmentScore >= 80 ? 'text-green-400' : alignmentScore >= 50 ? 'text-yellow-400' : 'text-red-400';
    const strokeColor = alignmentScore >= 80 ? '#4ade80' : alignmentScore >= 50 ? '#facc15' : '#f87171';

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] p-0 md:p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-900 w-full h-full md:max-w-6xl md:h-[90vh] md:rounded-[2rem] border border-gray-800 shadow-2xl flex flex-col overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-800 bg-gray-900 shrink-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 w-full md:w-auto relative">
                            <div className="w-12 h-12 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center shrink-0">
                                {product.coverUrl ? <img src={product.coverUrl} className="w-full h-full object-cover rounded-lg" alt="" /> : <ShoppingBag className="w-6 h-6 text-gray-500" />}
                            </div>

                            <div className="flex-1 min-w-0 pr-8 md:pr-0">
                                <h2 className="text-lg md:text-2xl font-bold text-white leading-tight break-words">
                                    {product.name}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-[10px] md:text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30 uppercase shrink-0">
                                        {product.status}
                                    </span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${activeTab === 'stats' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                        {activeTab === 'stats' ? 'Performance' : 'Inteligência Artificial'}
                                    </span>
                                </div>
                            </div>
                            <button onClick={onClose} className="md:hidden absolute top-0 right-0 p-1 text-gray-400 hover:text-white">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="bg-gray-800 p-1 rounded-lg border border-gray-700 flex w-full md:w-auto">
                                <button
                                    onClick={() => setActiveTab('stats')}
                                    className={`flex-1 md:flex-none px-6 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center ${activeTab === 'stats' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    VENDAS
                                </button>
                                <button
                                    onClick={() => setActiveTab('dna')}
                                    className={`flex-1 md:flex-none px-6 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'dna' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Brain className="w-3 h-3" /> DNA
                                </button>
                            </div>

                            <button onClick={onClose} className="hidden md:block p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    {activeTab === 'stats' ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <KpiCard label="Receita Bruta" value={`R$ ${revenue.toLocaleString()}`} icon={<DollarSign className="w-5 h-5 md:w-6 md:h-6 text-white" />} color="text-green-500" />
                                <KpiCard label="Investimento (Ads)" value={`R$ ${adSpend.toLocaleString()}`} icon={<Target className="w-5 h-5 md:w-6 md:h-6 text-red-400" />} color="text-red-500" subValue="~35% da Receita" />
                                <KpiCard label="Lucro Líquido" value={`R$ ${profit.toLocaleString()}`} icon={<Wallet className="w-5 h-5 md:w-6 md:h-6 text-green-400" />} color="text-green-500" />
                                <KpiCard label="ROAS Global" value={`${roas}x`} icon={<TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />} color="text-yellow-500" subValue="Excelente" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <Card className="p-4 md:p-6 bg-gray-800 border-gray-700">
                                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                            <PieChart className="w-5 h-5 text-brand-primary" /> Origem do Tráfego
                                        </h3>
                                        <div className="space-y-4">
                                            {/* Traffic Source Details... */}
                                        </div>
                                    </Card>

                                    <Card className="p-4 md:p-6 bg-gray-800 border-gray-700">
                                        <h3 className="text-white font-bold mb-6 flex items-center gap-2"><ActivityIcon className="w-5 h-5 text-orange-400" /> Funil de Conversão</h3>
                                        {/* Funnel Details... */}
                                    </Card>
                                </div>

                                <div className="space-y-6">
                                    <Card className="p-4 md:p-6 bg-gray-800 border-gray-700">
                                        <div className="flex flex-col gap-4 mb-6">
                                            <h3 className="text-white font-bold flex items-center gap-2"><LinkIcon className="w-5 h-5 text-blue-400" /> Meus Ativos de Venda</h3>
                                            <Button onClick={onManageLinks} className="!py-2 !px-3 !text-xs !bg-gray-700 hover:!bg-gray-600 border border-gray-600 flex items-center justify-center gap-2 w-full">
                                                <Pencil className="w-3 h-3" /> Gerenciar Links
                                            </Button>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 group hover:border-blue-500/50 transition-all">
                                                <div className="flex justify-between mb-1"><span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Página de Vendas (Principal)</span><button className="text-blue-400 hover:text-white text-xs font-bold" onClick={() => { navigator.clipboard.writeText(product!.landingPage); toast.success("Copiado!") }}>COPIAR LINK</button></div>
                                                <p className="text-sm text-white truncate font-mono opacity-80">{product?.landingPage || 'https://mestre15x.com/oferta'}</p>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-6 bg-gray-800 border-gray-700 relative overflow-hidden">
                                        {!product.dna && (
                                            <div className="absolute top-0 right-0 bg-brand-primary text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                                                NOVO
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <Brain className="w-5 h-5 text-pink-500" /> DNA do Produto
                                            </h3>
                                            <div className="flex flex-col items-end">
                                                <span className={`text-2xl font-black ${product.dna?.alignmentScore && product.dna.alignmentScore >= 90 ? 'text-green-400' : 'text-gray-500'}`}>
                                                    {product.dna?.alignmentScore || 0}%
                                                </span>
                                                <span className="text-[9px] text-gray-400 uppercase">Score IA</span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={onGenerateDna}
                                            className={`w-full !text-xs font-bold shadow-lg ${product.dna ? '!bg-pink-600 hover:!bg-pink-500' : '!bg-gray-700 hover:!bg-gray-600 text-gray-300'}`}
                                        >
                                            {product.dna ? 'Ver Estratégia Completa' : 'Verificar Setup Nexus'}
                                        </Button>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <Card className="p-5 md:p-8 border border-purple-500/30 bg-gray-800 rounded-2xl md:rounded-[2.5rem] relative overflow-hidden shadow-2xl mb-8">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 mb-8">
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className="p-3 md:p-4 bg-purple-600/20 rounded-xl md:rounded-[1.5rem] border border-purple-500/30">
                                            <Brain className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">DNA Estratégico</h3>
                                            <p className="text-gray-400 text-xs md:text-sm">Mapeamento psicométrico para automação.</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end gap-4 w-full md:w-auto justify-between md:justify-start">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] hidden md:inline">Assertividade:</span>
                                            <div className="relative w-12 h-12 md:w-16 md:h-16">
                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                                                    <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-800" />
                                                    <motion.circle
                                                        cx="60" cy="60" r="50"
                                                        stroke={strokeColor}
                                                        strokeWidth="10"
                                                        fill="transparent"
                                                        strokeDasharray="314"
                                                        strokeDashoffset={314 - (314 * alignmentScore) / 100}
                                                        strokeLinecap="round"
                                                        initial={{ strokeDashoffset: 314 }}
                                                        animate={{ strokeDashoffset: 314 - (314 * alignmentScore) / 100 }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className={`text-sm md:text-lg font-black ${scoreColor}`}>{alignmentScore}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={onGenerateDna}
                                                isLoading={isGeneratingDna}
                                                className="!bg-purple-600 hover:!bg-purple-500 font-black uppercase tracking-widest !text-[9px] md:!text-[10px] !py-2 md:!py-3 rounded-xl shadow-xl shadow-purple-900/30"
                                            >
                                                {product.dna ? 'Refinar' : 'Mapear DNA'}
                                            </Button>
                                            {product.dna && (
                                                <Button
                                                    onClick={onCalibrate}
                                                    isLoading={isCalibrating}
                                                    className="!bg-green-600 hover:!bg-green-500 font-black uppercase tracking-widest !text-[9px] md:!text-[10px] !py-2 md:!py-3 rounded-xl shadow-xl shadow-green-900/30"
                                                >
                                                    Calibrar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {!product.dna ? (
                                    <div className="py-12 md:py-24 text-center flex flex-col items-center bg-gray-950/30 rounded-2xl md:rounded-[2rem] border border-dashed border-gray-700">
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-900 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-gray-800 shadow-inner">
                                            <Brain className="w-8 h-8 md:w-10 md:h-10 text-gray-700" />
                                        </div>
                                        <h4 className="text-white font-black text-lg md:text-xl mb-2">O DNA ainda está em branco</h4>
                                        <p className="text-gray-400 max-w-xs md:max-w-sm text-xs md:text-sm px-4 mb-6">Inicie o mapeamento para que a IA analise seu produto e gere a estrutura de venda impossíveis de ignorar.</p>

                                        <Button
                                            onClick={() => {
                                                if (onSetupNexus) {
                                                    onClose();
                                                    onSetupNexus();
                                                }
                                            }}
                                            className="!bg-yellow-500 hover:!bg-yellow-400 text-black font-black uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.3)] !py-4 !px-8 text-sm rounded-xl transform hover:scale-105 transition-all"
                                        >
                                            VERIFICAR SETUP NEXUS
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-fade-in relative z-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <PersonaCard title="Persona Projetada (Teoria)" type="ideal" persona={product.dna.idealPersona} />
                                            <PersonaCard title="Persona Real (Validação)" type="real" persona={product.dna.realPersona} />

                                            <div className="col-span-full bg-blue-900/20 border border-blue-500/30 p-4 md:p-6 rounded-2xl md:rounded-[1.5rem] flex items-start gap-4 shadow-inner">
                                                <Info className="w-6 h-6 md:w-8 md:h-8 text-blue-400 flex-shrink-0 mt-1" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] md:text-[11px] text-blue-200 font-black uppercase mb-2 tracking-widest">Insights de Aprendizado Autônomo:</p>
                                                    <ul className="text-[10px] md:text-xs text-blue-100 list-disc pl-4 space-y-2 font-medium leading-relaxed opacity-80">
                                                        {product.dna.learningInsights?.map((insight: string, i: number) => (
                                                            <li key={i}>{insight}</li>
                                                        ))}
                                                        {(!product.dna.learningInsights || product.dna.learningInsights.length === 0) && (
                                                            <li>Aguardando calibragem com dados reais de tráfego e vendas...</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase mb-6 flex items-center gap-2 md:gap-3 tracking-[0.2em] md:tracking-[0.3em]">
                                                <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-current" /> Mapeamento das 7 Perguntas de Ouro
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <DnaGoldenQuestion label="1. Ganhos Reais" value={product.dna.sevenGoldenQuestions.moneyGainOrSave} icon={<DollarSign className="w-4 h-4 text-green-500" />} />
                                                <DnaGoldenQuestion label="2. Tempo Economizado" value={product.dna.sevenGoldenQuestions.timeSaved} icon={<Clock className="w-4 h-4 text-blue-500" />} />
                                                <DnaGoldenQuestion label="3. Alívio Operacional" value={product.dna.sevenGoldenQuestions.tasksEliminated} icon={<Trash className="w-4 h-4 text-red-500" />} />
                                                <DnaGoldenQuestion label="4. Erradicação de Dor" value={product.dna.sevenGoldenQuestions.painEliminated} icon={<ActivityIcon className="w-4 h-4 text-purple-500" />} />
                                                <DnaGoldenQuestion label="5. Status & Poder" value={product.dna.sevenGoldenQuestions.statusAndEnvy} icon={<Crown className="w-4 h-4 text-yellow-400" />} />
                                                <DnaGoldenQuestion label="6. Reconhecimento" value={product.dna.sevenGoldenQuestions.socialPopularity} icon={<Users className="w-4 h-4 text-indigo-400" />} />
                                                <DnaGoldenQuestion label="7. Vitalidade" value={product.dna.sevenGoldenQuestions.healthAndVibrancy} icon={<CheckCircle className="w-4 h-4 text-green-400" />} />
                                            </div>

                                            {product.dna.universalObjections && (
                                                <div className="mt-8 pt-8 border-t border-gray-700">
                                                    <h4 className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase mb-6 flex items-center gap-2 md:gap-3 tracking-[0.2em] md:tracking-[0.3em]">
                                                        <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 text-red-500 fill-current" /> Matriz de Quebra de Objeções Universais
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <DnaGoldenQuestion label="1. Não é pra mim" value={product.dna.universalObjections.notForMe} />
                                                        <DnaGoldenQuestion label="2. Sem Dinheiro" value={product.dna.universalObjections.noMoney} />
                                                        <DnaGoldenQuestion label="3. Sem Tempo" value={product.dna.universalObjections.noTime} />
                                                        <DnaGoldenQuestion label="4. Não acredito no método" value={product.dna.universalObjections.dontBelieveMethod} />
                                                        <DnaGoldenQuestion label="5. Quem é você?" value={product.dna.universalObjections.dontBelieveAuthor} />
                                                        <DnaGoldenQuestion label="6. Procrastinação" value={product.dna.universalObjections.procrastination} />
                                                        <DnaGoldenQuestion label="7. Aprovação de Outros" value={product.dna.universalObjections.needApproval} />
                                                        <DnaGoldenQuestion label="8. Já tentei tudo" value={product.dna.universalObjections.triedEverything} />
                                                        <DnaGoldenQuestion label="9. Medo de Falhar" value={product.dna.universalObjections.fearOfFailure} />
                                                        <DnaGoldenQuestion label="10. Custo-Benefício" value={product.dna.universalObjections.costBenefit} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    <div className="p-4 border-t border-gray-700 bg-gray-900 flex flex-col sm:flex-row justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto !py-2 !text-xs">Fechar</Button>
                        {activeTab === 'stats' && (
                            <Button onClick={onManageLinks} className="w-full sm:w-auto !bg-blue-600 hover:!bg-blue-500 !py-2 !text-xs font-bold flex items-center justify-center gap-2">
                                <LinkIcon className="w-3 h-3" /> Gerenciar Links
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// --- MODAL: CONVIDAR AFILIADO (UPDATED) ---
const AffiliateManagerModal: React.FC<{ isOpen: boolean, onClose: () => void, products: AppProduct[] }> = ({ isOpen, onClose, products }) => {
    const [loading, setLoading] = useState(false);
    const [inviteData, setInviteData] = useState({ name: '', phone: '', product: '' });

    if (!isOpen) return null;

    const handleSendInvite = async () => {
        if (!inviteData.name || !inviteData.phone || !inviteData.product) return toast.error("Preencha todos os campos.");

        setLoading(true);
        try {
            // Generate unique link
            const link = `https://mestre15x.com/invite?ref=${Math.random().toString(36).substring(7)}&product=${inviteData.product}`;

            // Send via system integration
            await sendInviteViaWhatsAppInstance(inviteData.phone, inviteData.name, products.find(p => p.id === inviteData.product)?.name || 'Produto', link);

            toast.success(`Convite enviado para ${inviteData.name} via WhatsApp!`, { icon: '📲' });
            onClose();
        } catch (error: any) {
            console.error("Invite Error:", error);
            toast.error(`Erro ao enviar: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150] p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-800 w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
                <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-400" /> Convidar Parceiro
                    </h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30 text-xs text-blue-200">
                            <strong>Nota:</strong> Ao convidar, o sistema enviará uma mensagem automática via WhatsApp com o link de login. O Afiliado convidado será responsável por preencher seus dados fiscais e bancários completos no primeiro acesso.
                        </div>

                        <Input label="Nome" value={inviteData.name} onChange={e => setInviteData({ ...inviteData, name: e.target.value })} placeholder="Nome do afiliado" />
                        <Input label="WhatsApp (com DDD)" value={inviteData.phone} onChange={e => setInviteData({ ...inviteData, phone: e.target.value })} placeholder="5511999999999" />
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Produto</label>
                            <select className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 text-white text-sm" value={inviteData.product} onChange={e => setInviteData({ ...inviteData, product: e.target.value })}>
                                <option value="">Selecione...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <Button onClick={handleSendInvite} isLoading={loading} className="w-full mt-2 !bg-green-600 hover:!bg-green-500 font-bold">
                            <Whatsapp className="w-4 h-4 mr-2" /> ENVIAR CONVITE AUTOMÁTICO
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

interface AppProductsViewProps {
    navigateTo?: (page: any) => void;
}

const AppProductsView: React.FC<AppProductsViewProps> = ({ navigateTo }) => {
    const { user, refreshUser } = useAuth();
    const [products, setProducts] = useState<AppProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [selectedProduct, setSelectedProduct] = useState<AppProduct | null>(null);
    const [activeProductTab, setActiveProductTab] = useState<'active' | 'development'>('active');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isGeneratingDna, setIsGeneratingDna] = useState(false);
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [isAffiliateManagerOpen, setIsAffiliateManagerOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [productToEdit, setProductToEdit] = useState<AppProduct | null>(null);
    const [wizardOpen, setWizardOpen] = useState(false);
    const [isCheckoutManagerOpen, setIsCheckoutManagerOpen] = useState(false);
    const [nexusModalOpen, setNexusModalOpen] = useState(false);
    const [createdProductName, setCreatedProductName] = useState('');
    const [createdProduct, setCreatedProduct] = useState<AppProduct | null>(null);

    const [activeModal, setActiveModal] = useState<'none' | 'vendas' | 'receitas' | 'afiliados'>('none');
    const [intelligenceTab, setIntelligenceTab] = useState<'stats' | 'dna'>('stats');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const prods = await getAppProducts();
        setProducts(prods);
        setLoading(false);
    };

    const handleProductUpdate = (updatedProduct: AppProduct) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        if (selectedProduct && selectedProduct.id === updatedProduct.id) {
            setSelectedProduct(updatedProduct);
        }
        if (createdProduct && createdProduct.id === updatedProduct.id) {
            setCreatedProduct(updatedProduct);
        }
    };

    const handleEditProduct = (product: AppProduct) => {
        setProductToEdit(product);
        setIsEditMode(true);
        setWizardOpen(true);
    };

    const handleGenerateDna = async (prod?: AppProduct) => {
        const target = prod || selectedProduct;
        if (!target) return;

        setIsGeneratingDna(true);
        const tid = toast.loading("Nexus IA: Mapeando Estratégia...");

        try {
            const res = await callMestreIA('product_dna_generator', {
                name: target.name,
                description: target.description || '...'
            });

            let dnaContent = res.output;
            if (dnaContent.includes('```json')) {
                dnaContent = dnaContent.replace(/```json/g, '').replace(/```/g, '').trim();
            } else if (dnaContent.includes('```')) {
                dnaContent = dnaContent.replace(/```/g, '').trim();
            }

            const dna: ProductDNA = JSON.parse(dnaContent);

            await updateProductDNA(target.id, dna);
            const updated = await getAppProducts();
            setProducts(updated);

            if (selectedProduct && selectedProduct.id === target.id) {
                setSelectedProduct(updated.find(p => p.id === target.id) || null);
            }

            toast.success("DNA Gerado! Sua Assertividade subiu.", { id: tid });
        } catch (e) {
            console.error("AI Error:", e);
            toast.error("Erro ao processar IA. Tente novamente.", { id: tid });
        } finally {
            setIsGeneratingDna(false);
        }
    };

    const handleCalibrate = async (prod?: AppProduct) => {
        const target = prod || selectedProduct;
        if (!target) return;

        setIsCalibrating(true);
        const tid = toast.loading("Nexus AI: Sincronizando dados de conversão real...");
        try {
            await calibrateAutonomousDNA(target.id);
            await loadData();

            if (selectedProduct && selectedProduct.id === target.id) {
                const updatedProds = await getAppProducts();
                setSelectedProduct(updatedProds.find(p => p.id === target.id) || null);
            }

            toast.success(`Calibragem Nexus Concluída!`, { id: tid });
        } catch (e) {
            toast.error("Erro na calibragem.", { id: tid });
        } finally {
            setIsCalibrating(false);
        }
    };

    const handleToggleLink = async (product: AppProduct, linkId: string) => {
        if (!product.checkoutLinks) return;

        const updatedLinks = product.checkoutLinks.map(l =>
            l.id === linkId ? { ...l, active: !l.active } : l
        );

        const updatedProduct = { ...product, checkoutLinks: updatedLinks };

        if (selectedProduct && selectedProduct.id === product.id) {
            setSelectedProduct(updatedProduct);
        }

        await saveAppProduct(updatedProduct);
        const prods = await getAppProducts();
        setProducts(prods);
    };

    const handleWizardSuccess = async (savedProduct?: AppProduct) => {
        await loadData();

        if (savedProduct && savedProduct.status === 'active') {
            setCreatedProductName(savedProduct.name);
            setCreatedProduct(savedProduct);
            setNexusModalOpen(true);
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            // Lógica Reconstruída: Aba 'Ativos' mostra tudo que NÃO é Rascunho (development) ou Arquivado.
            const matchesTab = activeProductTab === 'active'
                ? (p.status !== 'development' && p.status !== 'archived')
                : p.status === 'development';
            return matchesSearch && matchesTab;
        });
    }, [products, searchTerm, activeProductTab]);

    const stats_summary = useMemo(() => {
        const activeList = products.filter(p => p.status === 'active');
        return {
            active: activeList.length,
            sales: activeList.reduce((acc, p) => acc + (p.stats.totalSales || 0), 0),
            revenue: activeList.reduce((acc, p) => acc + (p.stats.revenue || 0), 0),
            afiliados: activeList.reduce((acc, p) => acc + (p.affiliates?.length || 0), 0)
        };
    }, [products]);

    if (loading) return <div className="flex justify-center p-10"><LoadingSpinner /></div>;

    return (
        <div className="space-y-8 pb-24">
            {view === 'list' ? (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><ShoppingBag className="w-8 h-8 text-brand-primary" /> Meus Produtos</h2>
                            <p className="text-gray-400 text-sm">Crie, publique e monitore seus produtos digitais e físicos.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            {/* Botão Convidar Afiliado Atualizado */}
                            <Button onClick={() => setIsAffiliateManagerOpen(true)} className="!py-3 !px-6 !bg-green-600 hover:!bg-green-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 text-xs w-full sm:w-auto justify-center">
                                <Whatsapp className="w-5 h-5" /> Convidar Afiliado
                            </Button>
                            {/* Botão Novo Produto */}
                            <Button onClick={() => { setIsEditMode(false); setProductToEdit(null); setWizardOpen(true); }} className="!bg-brand-primary text-black hover:!bg-yellow-400 font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/10 text-xs w-full sm:w-auto justify-center">
                                <PlusCircle className="w-5 h-5" /> Novo Produto
                            </Button>
                            {/* Botão Criar Com IA - Redireciona para Mestre IA */}
                            <Button
                                onClick={() => navigateTo && navigateTo('mestre-ia-use')}
                                className="!py-3 !px-6 !bg-purple-600 hover:!bg-purple-500 font-black text-white shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 text-xs w-full sm:w-auto justify-center"
                            >
                                <Brain className="w-5 h-5" /> CRIAR COM IA
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiCard label="Produtos Ativos" value={stats_summary.active.toString()} icon={<ShoppingBag className="w-6 h-6 text-blue-400" />} color="text-blue-500" onClick={() => setActiveModal('none')} />
                        <KpiCard label="Vendas Totais" value={stats_summary.sales.toLocaleString()} icon={<BarChart3 className="w-6 h-6 text-green-400" />} color="text-green-500" onClick={() => setActiveModal('vendas')} />
                        <KpiCard label="Faturamento" value={`R$ ${stats_summary.revenue.toLocaleString()}`} icon={<DollarSign className="w-6 h-6 text-yellow-400" />} color="text-yellow-500" onClick={() => setActiveModal('receitas')} />
                        <KpiCard label="Afiliados" value={stats_summary.afiliados.toString()} icon={<Users className="w-6 h-6 text-purple-400" />} color="text-purple-500" onClick={() => setActiveModal('afiliados')} />
                    </div>

                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden min-h-[500px]">
                        <div className="flex border-b border-gray-700">
                            <button onClick={() => setActiveProductTab('active')} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeProductTab === 'active' ? 'border-brand-primary text-white bg-gray-700/50' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700'}`}>Produtos Ativos ({stats_summary.active})</button>
                            <button onClick={() => setActiveProductTab('development')} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeProductTab === 'development' ? 'border-brand-primary text-white bg-gray-700/50' : 'border-transparent text-gray-400 hover:text-yellow-500 hover:bg-gray-700'}`}>Em Desenvolvimento</button>
                        </div>

                        <div className="p-4 bg-gray-800 border-b border-gray-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                <input className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-brand-primary outline-none" placeholder="Buscar produto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map(product => (
                                    <Card key={product.id} className="p-4 hover:border-brand-primary/50 transition-all cursor-pointer group flex flex-col h-full" onClick={() => { setSelectedProduct(product); setIntelligenceTab('stats'); setView('detail'); }}>
                                        <div className="relative h-40 bg-gray-900 rounded-lg mb-4 overflow-hidden border border-gray-700 flex items-center justify-center">
                                            {product.coverUrl ? <img src={product.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <ShoppingBag className="w-12 h-12 text-gray-600" />}
                                            {product.status === 'active' && (
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white font-bold text-xs uppercase border border-white px-3 py-1 rounded">Ver Inteligência</span>
                                                </div>
                                            )}

                                            {/* TAGS DE STATUS DO SETUP NEXUS */}
                                            {product.status === 'pending' && (
                                                <div className="absolute bottom-2 left-2 right-2 z-20">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCreatedProductName(product.name);
                                                            setCreatedProduct(product);
                                                            setNexusModalOpen(true);
                                                        }}
                                                        className="w-full bg-yellow-400/90 hover:bg-yellow-500 text-black text-[10px] font-bold py-1.5 rounded shadow-lg flex items-center justify-center gap-2 animate-pulse backdrop-blur-sm"
                                                    >
                                                        <AlertTriangle className="w-3 h-3" />
                                                        SETUP PENDENTE
                                                    </button>
                                                </div>
                                            )}

                                            {product.status === 'active' && (
                                                <div className="absolute bottom-2 left-2 right-2 z-20">
                                                    <div className="flex gap-1 justify-center">
                                                        <span className="bg-green-500/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1 backdrop-blur-sm">
                                                            <Brain className="w-3 h-3" /> SETUP ATIVO
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-white text-lg line-clamp-1">{product.name}</h4>
                                        </div>
                                        <div className="space-y-2 text-sm text-gray-400 mb-4 flex-1">
                                            <div className="flex justify-between"><span>Plataforma:</span> <span className="text-white">{product.platform}</span></div>
                                            <div className="flex justify-between"><span>Preço:</span> <span className="text-green-400 font-bold">R$ {product.price?.toFixed(2)}</span></div>
                                            <div className="flex justify-between"><span>Comissão:</span> <span className="text-yellow-400">{product.commission}%</span></div>

                                            {product.status === 'active' && product.baseAffiliateLink && (
                                                <div className="mt-4 pt-2 border-t border-gray-700/50">
                                                    <div className="flex items-center gap-2 bg-gray-900 p-3 rounded-lg text-xs text-blue-300 border border-gray-700 group-hover:border-blue-500/30 transition-colors w-full">
                                                        <div className="flex-1 min-w-0 flex flex-col">
                                                            <span className="text-[9px] text-gray-500 uppercase font-bold mb-0.5 flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Checkout Principal</span>
                                                            <span className="truncate font-mono text-xs opacity-90">{product.baseAffiliateLink}</span>
                                                        </div>
                                                        <div className="flex gap-1 flex-shrink-0">
                                                            <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(product.baseAffiliateLink || ''); toast.success("Link copiado!"); }} className="text-gray-400 hover:text-white p-2 rounded hover:bg-gray-700" title="Copiar"><ClipboardCopy className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {product.checkoutLinks && product.checkoutLinks.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-gray-700/50 flex flex-wrap gap-1">
                                                    {product.checkoutLinks.map(link => (
                                                        <span
                                                            key={link.id}
                                                            className={`text-[8px] px-1.5 py-0.5 rounded border uppercase font-bold ${link.active ? 'text-white border-gray-600 bg-gray-800' : 'text-gray-500 border-gray-800 bg-gray-900 opacity-50'}`}
                                                            title={`${link.platform} (${link.active ? 'Ativo' : 'Inativo'})`}
                                                        >
                                                            {link.platform.substring(0, 3)}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-auto pt-3 border-t border-gray-700 flex flex-col sm:flex-row gap-2">
                                            <Button variant="secondary" className="flex-1 !text-xs !py-2 justify-center" onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}><Pencil className="w-3 h-3 mr-1" /> Editar</Button>

                                            <Button
                                                className="flex-1 !text-xs !py-2 !bg-purple-600 hover:!bg-purple-500 text-white font-bold shadow-lg shadow-purple-900/20 justify-center"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedProduct(product);
                                                    setIntelligenceTab('dna');
                                                    setView('detail');
                                                }}
                                            >
                                                <Brain className="w-3 h-3 mr-1" /> Analisar DNA
                                            </Button>

                                            {product.status === 'development' && (
                                                <Button className="flex-1 !text-xs !py-2 !bg-green-600 hover:!bg-green-500 justify-center" onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}>Publicar</Button>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                                {filteredProducts.length === 0 && <div className="col-span-full text-center py-10 text-gray-500"><ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>Nenhum produto encontrado nesta aba.</p></div>}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                /* DETAIL VIEW */
                selectedProduct && (
                    <ProductIntelligenceModal
                        isOpen={true}
                        onClose={() => setView('list')}
                        product={selectedProduct}
                        onManageLinks={() => setIsCheckoutManagerOpen(true)}
                        onToggleLink={handleToggleLink}
                        onGenerateDna={() => handleGenerateDna(selectedProduct)}
                        onCalibrate={() => handleCalibrate(selectedProduct)}
                        isGeneratingDna={isGeneratingDna}
                        isCalibrating={isCalibrating}
                        initialTab={intelligenceTab}
                        onSetupNexus={() => {
                            setCreatedProductName(selectedProduct.name);
                            setCreatedProduct(selectedProduct);
                            setNexusModalOpen(true);
                        }}
                    />
                )
            )}

            <AffiliateManagerModal isOpen={isAffiliateManagerOpen} onClose={() => setIsAffiliateManagerOpen(false)} products={products} />

            <ProductWizardModal
                isOpen={wizardOpen}
                onClose={() => setWizardOpen(false)}
                onSuccess={handleWizardSuccess}
                user={user}
                initialProduct={productToEdit}
                isEditMode={isEditMode}
            />

            {selectedProduct && isCheckoutManagerOpen && (
                <CheckoutManagerModal
                    isOpen={isCheckoutManagerOpen}
                    onClose={() => setIsCheckoutManagerOpen(false)}
                    product={selectedProduct}
                    onUpdate={handleProductUpdate}
                />
            )}

            <DetailModal isOpen={activeModal === 'vendas'} onClose={() => setActiveModal('none')} title="Vendas Detalhadas" icon={<BarChart3 className="w-6 h-6 text-green-400" />}>
                <div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-gray-800 p-4 rounded-xl border border-gray-700"><p className="text-gray-400 text-xs font-bold uppercase mb-2">Vendas por Método</p><div className="space-y-2"><div className="flex justify-between items-center"><span className="text-white text-sm">Cartão de Crédito</span><span className="text-green-400 font-bold">65%</span></div><div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden"><div className="bg-blue-500 h-full w-[65%]"></div></div><div className="flex justify-between items-center pt-2"><span className="text-white text-sm">PIX</span><span className="text-green-400 font-bold">35%</span></div><div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden"><div className="bg-green-500 h-full w-[35%]"></div></div></div></div><div className="bg-gray-800 p-4 rounded-xl border border-gray-700"><p className="text-gray-400 text-xs font-bold uppercase mb-2">Ticket Médio</p><div className="flex items-center justify-center h-24"><span className="text-3xl font-black text-white">R$ 197,00</span></div></div></div></div>
            </DetailModal>

            <DetailModal isOpen={activeModal === 'receitas'} onClose={() => setActiveModal('none')} title="Relatório Financeiro" icon={<DollarSign className="w-6 h-6 text-yellow-400" />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center"><p className="text-gray-400 text-xs font-bold uppercase mb-1">Bruto</p><p className="text-xl font-black text-white">R$ {stats_summary.revenue.toLocaleString()}</p></div><div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center"><p className="text-gray-400 text-xs font-bold uppercase mb-1">Taxas (Est.)</p><p className="text-xl font-black text-red-400">- R$ {(stats_summary.revenue * 0.1).toLocaleString()}</p></div><div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center border-l-4 border-l-green-500"><p className="text-gray-400 text-xs font-bold uppercase mb-1">Líquido</p><p className="text-xl font-black text-green-400">R$ {(stats_summary.revenue * 0.9).toLocaleString()}</p></div></div>
            </DetailModal>

            <DetailModal isOpen={activeModal === 'afiliados'} onClose={() => setActiveModal('none')} title="Top Afiliados" icon={<Users className="w-6 h-6 text-purple-400" />}>
                <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-800 text-gray-400 text-xs uppercase font-bold"><tr><th className="p-3">Nome</th><th className="p-3 text-right">Vendas</th><th className="p-3 text-right">Comissão</th></tr></thead><tbody className="divide-y divide-gray-700"><tr className="hover:bg-gray-800/50"><td className="p-3 text-white">João Silva</td><td className="p-3 text-right">45</td><td className="p-3 text-right text-green-400">R$ 1.200</td></tr><tr className="hover:bg-gray-800/50"><td className="p-3 text-white">Maria Oliveira</td><td className="p-3 text-right">32</td><td className="p-3 text-right text-green-400">R$ 980</td></tr><tr className="hover:bg-gray-800/50"><td className="p-3 text-white">Carlos Tech</td><td className="p-3 text-right">18</td><td className="p-3 text-right text-green-400">R$ 450</td></tr></tbody></table></div>
            </DetailModal>

            {/* Nexus Onboarding Modal */}
            <NexusOnboardingModal
                isOpen={nexusModalOpen}
                onClose={() => setNexusModalOpen(false)}
                productName={createdProductName}
                product={createdProduct}
                onUpdate={handleProductUpdate}
            />

        </div>
    );
};

export default AppProductsView;
