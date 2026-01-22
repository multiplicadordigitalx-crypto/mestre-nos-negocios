
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Card from '../../../components/Card';
import { Brain, ShoppingBag, ChevronLeft, Box, CheckCircle, Layers, FileText, Trash, Archive, Globe, Zap, CloudUpload, Eye, ShieldCheck, Rocket, Search } from '../../../components/Icons';
import toast from 'react-hot-toast';
import { getAppProducts, consumeCredits } from '../../../services/mockFirebase';
import { PageItem } from '../types';
import { AppProduct } from '../../../types';
import { LeadModeModal } from '../modals/FunnelsModals';
import { AICreditGate } from '../../../components/AICreditGate';
import { useAuth } from '../../../hooks/useAuth';

interface Props {
    onPageCreated: (page: PageItem) => void;
    setActiveTab: (tab: any) => void;
}

const FRAMEWORKS = ['AIDA', 'PAS', 'BAB', '4U', 'Jornada do Herói'];
const PALETTES = ['Energia (Vermelho/Laranja)', 'Confiança (Azul/Verde)', 'Luxo (Preto/Dourado)', 'Saúde (Verde/Pastel)', 'Criativo (Roxo/Gradiente)'];

export const BuilderTab: React.FC<Props> = ({ onPageCreated, setActiveTab }) => {
    const { user, refreshUser } = useAuth();
    const [builderStep, setBuilderStep] = useState<'input' | 'generating' | 'preview' | 'hosting'>('input');
    const [selectedObjective, setSelectedObjective] = useState('');
    const [customObjectiveInput, setCustomObjectiveInput] = useState('');
    const [generatedPageData, setGeneratedPageData] = useState<any>(null);
    const [showLeadMode, setShowLeadMode] = useState(false);

    // Search State
    const [searchParams] = useSearchParams();
    const [productSearch, setProductSearch] = useState(searchParams.get('product') || '');

    // Hosting State
    const [subdomainName, setSubdomainName] = useState('');
    const [autoConfigSEO, setAutoConfigSEO] = useState(true);
    const [selectedHostingProvider, setSelectedHostingProvider] = useState<'free' | 'cloudflare' | 'cpanel'>('free');

    // Configs
    const [selectedFramework, setSelectedFramework] = useState<string>('AIDA');
    const [selectedPalette, setSelectedPalette] = useState<string>('Energia (Vermelho/Laranja)');
    const [loadingLog, setLoadingLog] = useState<string[]>([]);

    // Products
    const [products, setProducts] = useState<AppProduct[]>([]);
    const [builderProduct, setBuilderProduct] = useState<AppProduct | null>(null);

    // Gate State
    const [isCreditGateOpen, setIsCreditGateOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    useEffect(() => {
        getAppProducts().then(setProducts);
    }, []);

    const filteredProductsForBuilder = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    const triggerGenerate = () => {
        const objective = selectedObjective === 'Outros Objetivos' ? customObjectiveInput : selectedObjective;
        if (!objective) return toast.error("Defina um objetivo!");

        setPendingAction(() => executeGenerate);
        setIsCreditGateOpen(true);
    };

    const confirmGate = async () => {
        setIsCreditGateOpen(false);
        if (pendingAction && user) {
            const result = await consumeCredits(user.uid, 'funnel_page_builder', 15, "Criação de Página IA");
            if (result.success) {
                await pendingAction();
            } else {
                toast.error("Saldo insuficiente.");
            }
            await refreshUser();
        }
    };

    const executeGenerate = () => {
        const objective = selectedObjective === 'Outros Objetivos' ? customObjectiveInput : selectedObjective;
        setBuilderStep('generating');
        setLoadingLog([]);
        const logs = [
            `> Acessando Otimizador IA...`,
            `> Analisando 142 páginas anteriores (Taxa média: 14%)...`,
            `> Padrão de alta conversão identificado: Layout em Z + Botões Vermelhos.`,
            `> Aplicando Framework Selecionado: ${selectedFramework}...`,
            `> Gerando Design System com Paleta: ${selectedPalette}...`,
            `> Solicitando vídeo VSL ao Studio IA... Recebido.`,
            `> Compilando página otimizada...`
        ];
        let i = 0;
        const interval = setInterval(() => {
            if (i < logs.length) {
                setLoadingLog(prev => [...prev, logs[i]]);
                i++;
            } else {
                clearInterval(interval);
                finishGeneration(objective);
            }
        }, 800);
    };

    const finishGeneration = (objective: string) => {
        const paletteName = selectedPalette ? selectedPalette.split(' ')[0] : 'Padrão';

        setGeneratedPageData({
            title: "Página Gerada por IA: " + objective,
            structure: `Framework: ${selectedFramework} | Design: ${paletteName}`,
            funnelPart: "Topo/Meio de Funil (Conversão Fria)",
            copySnippet: "Você já tentou de tudo e continua travado? Descubra o método...",
            framework: selectedFramework,
            palette: selectedPalette
        });
        setBuilderStep('preview');
        toast.success("Página gerada! Otimizada com base em dados históricos.", { icon: '✨' });
    };

    const handlePublishPage = () => {
        if (!subdomainName) return toast.error("Defina um subdomínio.");
        const fullUrl = selectedHostingProvider === 'free' ? `${subdomainName}.mestre.com` : `${subdomainName}.seudominio.com`;
        const newPage: PageItem = {
            name: generatedPageData.title.replace('Página Gerada por IA: ', ''),
            url: fullUrl,
            type: selectedHostingProvider === 'free' ? 'PV (Free)' : 'PV (Pro)',
            status: 'active'
        };
        onPageCreated(newPage);
        toast.success(`Página publicada em: ${fullUrl}`, { icon: 'globe' });
        setBuilderStep('input');
        setSelectedObjective('');
        setCustomObjectiveInput('');
        setGeneratedPageData(null);
        setSubdomainName('');
        setActiveTab('optimizer');
    };

    const handleArchivePage = () => {
        if (!generatedPageData) return;
        const newPage: PageItem = {
            name: generatedPageData.title.replace('Página Gerada por IA: ', ''),
            url: 'Rascunho (Não publicado)',
            type: 'Draft',
            status: 'archived'
        };
        onPageCreated(newPage);
        setBuilderStep('input');
        setSelectedObjective('');
        setCustomObjectiveInput('');
        setGeneratedPageData(null);
        setSubdomainName('');
        toast.success("Página arquivada em 'Visão Geral'!", { icon: '🗄️' });
        setActiveTab('overview');
    };

    const handleDeletePage = () => {
        if (confirm("Tem certeza? O trabalho da IA será perdido.")) {
            setBuilderStep('input');
            setSelectedObjective('');
            setGeneratedPageData(null);
            toast("Página descartada.", { icon: '🗑️' });
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <Card className="p-8 bg-gray-800 border border-purple-500/30 text-center relative overflow-hidden min-h-[500px] flex flex-col justify-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

                {builderStep === 'input' && (
                    <div className="animate-fade-in w-full max-w-2xl mx-auto text-left">
                        <div className="w-20 h-20 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/50">
                            <Brain className="w-10 h-10 text-purple-400" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2 text-center">Construtor de Páginas AI</h2>
                        <p className="text-gray-400 mb-8 text-center">
                            Selecione o objetivo, estrutura e estilo. A IA criará uma página otimizada.
                        </p>

                        <div className="space-y-6">
                            {/* Product Selection - Searchable Interface */}
                            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                                <h4 className="text-sm font-bold text-white uppercase mb-3 flex items-center gap-2">
                                    <span className="bg-purple-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
                                    Selecione o Produto
                                </h4>

                                {!builderProduct ? (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                            <input
                                                type="text"
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-brand-primary outline-none transition-all"
                                                placeholder="Pesquisar produto pelo nome..."
                                                value={productSearch}
                                                onChange={(e) => setProductSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                            {products.length === 0 ? (
                                                <p className="text-gray-500 text-xs italic text-center py-4">Carregando catálogo...</p>
                                            ) : filteredProductsForBuilder.length === 0 ? (
                                                <p className="text-gray-500 text-xs italic text-center py-4">Nenhum produto encontrado para sua busca.</p>
                                            ) : (
                                                filteredProductsForBuilder.map(p => (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => setBuilderProduct(p)}
                                                        className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-3 cursor-pointer flex items-center gap-3 transition-colors group"
                                                    >
                                                        <div className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center text-gray-500 group-hover:text-brand-primary transition-colors">
                                                            <Box className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white text-sm font-bold truncate">{p.name}</p>
                                                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">{p.platform}</p>
                                                        </div>
                                                        <div className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-purple-900/20 border border-purple-500/50 rounded-lg p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-500/20 rounded text-purple-400">
                                                <Box className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm">{builderProduct.name}</p>
                                                <p className="text-purple-300 text-[10px]">Produto Selecionado</p>
                                            </div>
                                        </div>
                                        <Button variant="secondary" onClick={() => { setBuilderProduct(null); setProductSearch(''); }} className="!py-1 !px-3 !text-xs">Trocar</Button>
                                    </div>
                                )}
                            </div>

                            {/* Goal Selection */}
                            <div className={`transition-opacity duration-300 ${!builderProduct ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                                <div className="mb-6">
                                    <label className="text-sm font-bold text-gray-300 mb-3 block flex items-center gap-2">
                                        <span className="bg-gray-700 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
                                        Objetivo da Página
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {['Página de Vendas (Perpétuo)', 'Página de Captura (Lançamento)', 'Webinar / Aula Gratuita', 'Aplicação / Mentoria', 'Outros Objetivos'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedObjective(type)}
                                                className={`p-3 rounded-lg border transition-all flex items-center justify-between text-left ${selectedObjective === type ? 'bg-purple-900/40 border-purple-500 ring-1 ring-purple-500' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}
                                            >
                                                <span className="text-white text-xs font-bold">{type}</span>
                                                {selectedObjective === type && <CheckCircle className="w-4 h-4 text-purple-400" />}
                                            </button>
                                        ))}
                                    </div>
                                    <AnimatePresence>
                                        {selectedObjective === 'Outros Objetivos' && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3">
                                                <Input
                                                    placeholder="Ex: Página de Obrigado para Ebook..."
                                                    value={customObjectiveInput}
                                                    onChange={e => setCustomObjectiveInput(e.target.value)}
                                                    className="!bg-gray-900"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Framework & Palette Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-bold text-gray-300 mb-3 block flex items-center gap-2">
                                            <span className="bg-gray-700 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">3</span>
                                            Framework Estrutural (Copy)
                                        </label>
                                        <select
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                                            value={selectedFramework}
                                            onChange={e => setSelectedFramework(e.target.value)}
                                        >
                                            {FRAMEWORKS.map(fw => <option key={fw} value={fw}>{fw}</option>)}
                                        </select>
                                        <p className="text-[10px] text-gray-500 mt-1">A IA seguirá rigorosamente a estrutura escolhida.</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-gray-300 mb-3 block flex items-center gap-2">
                                            <span className="bg-gray-700 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">4</span>
                                            Paleta & Estilo Visual
                                        </label>
                                        <select
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                                            value={selectedPalette}
                                            onChange={e => setSelectedPalette(e.target.value)}
                                        >
                                            {PALETTES.map(pl => <option key={pl} value={pl}>{pl}</option>)}
                                        </select>
                                        <p className="text-[10px] text-gray-500 mt-1">Cores otimizadas para psicologia de conversão.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <Button
                                onClick={triggerGenerate}
                                className="w-full !py-4 !px-10 text-lg font-black uppercase !bg-purple-600 hover:!bg-purple-500 shadow-lg shadow-purple-900/40"
                                disabled={!selectedObjective || (selectedObjective === 'Outros Objetivos' && !customObjectiveInput) || !builderProduct}
                            >
                                GERAR PÁGINA OTIMIZADA
                            </Button>
                        </div>
                    </div>
                )}

                {builderStep === 'generating' && (
                    <div className="text-left font-mono text-xs bg-black p-6 rounded-xl border border-gray-700 h-96 w-full flex flex-col">
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                            {loadingLog.map((log, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`${log.includes('Studio') ? 'text-yellow-400' : log.includes('Otimizador') ? 'text-blue-400' : 'text-green-400'}`}
                                >
                                    {log}
                                </motion.div>
                            ))}
                            <div className="w-2 h-4 bg-green-500 animate-pulse inline-block align-middle ml-1"></div>
                        </div>
                    </div>
                )}

                {builderStep === 'preview' && generatedPageData && (
                    <div className="animate-fade-in w-full text-left">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <CheckCircle className="w-6 h-6 text-green-500" /> Página Gerada com Sucesso
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">{generatedPageData.title}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => setShowLeadMode(true)} className="!py-2 !text-xs border-gray-600">
                                    <Eye className="w-4 h-4 mr-2" /> Modo Lead
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gray-900 p-5 rounded-xl border border-gray-700">
                                <h4 className="text-purple-400 font-bold text-xs uppercase mb-3 flex items-center gap-2">
                                    <Layers className="w-4 h-4" /> Estrutura & Funil
                                </h4>
                                <p className="text-white font-medium text-sm mb-2">{generatedPageData.structure}</p>
                                <p className="text-gray-500 text-xs bg-black/30 p-2 rounded border border-gray-800">
                                    Local no Funil: <span className="text-yellow-500">{generatedPageData.funnelPart}</span>
                                </p>
                                <div className="mt-3 flex gap-2">
                                    <span className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-400 border border-gray-700">{generatedPageData.framework}</span>
                                    <span className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-400 border border-gray-700">{generatedPageData.palette}</span>
                                </div>
                            </div>
                            <div className="bg-gray-900 p-5 rounded-xl border border-gray-700">
                                <h4 className="text-blue-400 font-bold text-xs uppercase mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Preview da Copy
                                </h4>
                                <p className="text-gray-300 text-sm italic">"{generatedPageData.copySnippet}"</p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-700">
                            <Button variant="secondary" onClick={handleDeletePage} className="!bg-red-900/20 text-red-400 border-red-900/50 hover:border-red-500 flex-1">
                                <Trash className="w-4 h-4 mr-2" /> Descartar
                            </Button>
                            <Button variant="secondary" onClick={handleArchivePage} className="!bg-yellow-900/20 text-yellow-400 border-yellow-900/50 hover:border-yellow-500 flex-1">
                                <Archive className="w-4 h-4 mr-2" /> Arquivar
                            </Button>
                            <Button onClick={() => setBuilderStep('hosting')} className="flex-[2] !bg-green-600 hover:!bg-green-500 text-white font-bold">
                                <Globe className="w-4 h-4 mr-2" /> CONFIGURAR DOMÍNIO
                            </Button>
                        </div>
                    </div>
                )}

                {builderStep === 'hosting' && (
                    <div className="animate-fade-in w-full text-left max-w-xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/50">
                                <Globe className="w-8 h-8 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Configuração de Hospedagem</h2>
                            <p className="text-gray-400 text-sm mt-1">Defina onde sua página será publicada.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                <label className="block text-sm font-bold text-gray-300 mb-3">Escolha o Tipo de Domínio</label>

                                <div className="flex flex-col gap-3">
                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedHostingProvider === 'free' ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-800 border-gray-600 hover:border-gray-500'}`}>
                                        <input
                                            type="radio"
                                            name="provider"
                                            value="free"
                                            checked={selectedHostingProvider === 'free'}
                                            onChange={() => setSelectedHostingProvider('free')}
                                            className="hidden"
                                        />
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedHostingProvider === 'free' ? 'border-blue-500' : 'border-gray-500'}`}>
                                            {selectedHostingProvider === 'free' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                        </div>
                                        <div>
                                            <span className="text-white text-sm font-bold block">Subdomínio Gratuito (Mestre.com)</span>
                                            <span className="text-xs text-gray-400">Rápido, sem configuração.</span>
                                        </div>
                                    </label>

                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedHostingProvider !== 'free' ? 'bg-green-600/20 border-green-500' : 'bg-gray-800 border-gray-600 hover:border-gray-500'}`}>
                                        <input
                                            type="radio"
                                            name="provider"
                                            value="cloudflare"
                                            checked={selectedHostingProvider !== 'free'}
                                            onChange={() => setSelectedHostingProvider('cloudflare')}
                                            className="hidden"
                                        />
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedHostingProvider !== 'free' ? 'border-green-500' : 'border-gray-500'}`}>
                                            {selectedHostingProvider !== 'free' && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                                        </div>
                                        <div>
                                            <span className="text-white text-sm font-bold block flex items-center gap-2">Domínio Próprio (100% Autônomo) <ShieldCheck className="w-3 h-3 text-green-400" /></span>
                                            <span className="text-xs text-gray-400">Usa sua API (Cloudflare/cPanel) para criar subdomínios limpos.</span>
                                        </div>
                                    </label>
                                </div>

                                {selectedHostingProvider !== 'free' && (
                                    <div className="mt-3 p-3 bg-green-900/20 border border-green-500/30 rounded text-xs text-green-300">
                                        <p>A ferramenta usará a API Key configurada no <strong>Hub de Integrações</strong> para criar registros DNS automaticamente.</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">
                                    Nome do Subdomínio {selectedHostingProvider !== 'free' ? '(Será criado via API)' : ''}
                                </label>
                                <div className="flex">
                                    <input
                                        className="flex-1 bg-gray-900 border border-gray-600 rounded-l-lg p-3 text-white focus:border-brand-primary outline-none text-right"
                                        placeholder="sua-oferta"
                                        value={subdomainName}
                                        onChange={e => setSubdomainName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    />
                                    <div className="bg-gray-800 border border-l-0 border-gray-600 rounded-r-lg px-3 flex items-center text-gray-400 text-sm">
                                        {selectedHostingProvider === 'free' ? '.mestre.com' : '.seudominio.com'}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm text-white font-medium flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-yellow-400" /> Auto Configuração (Recomendado)
                                    </span>
                                    <input type="checkbox" className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-brand-primary" checked={autoConfigSEO} onChange={e => setAutoConfigSEO(e.target.checked)} />
                                </label>
                                {autoConfigSEO && (
                                    <div className="mt-3 text-xs text-gray-400 space-y-1 pl-6 border-l-2 border-gray-700">
                                        <p>✅ Instalação de Pixel (Meta/Google)</p>
                                        <p>✅ Otimização SEO (Meta Tags)</p>
                                        <p>✅ Configuração de Métricas de Performance</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setBuilderStep('preview')} className="flex-1">Voltar</Button>
                                <Button onClick={handlePublishPage} className="flex-[2] !bg-green-600 hover:!bg-green-500 text-white font-bold">
                                    <Rocket className="w-4 h-4 mr-2" />
                                    {selectedHostingProvider === 'free' ? 'PUBLICAR AGORA' : 'CRIAR DNS & PUBLICAR'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            <LeadModeModal isOpen={showLeadMode} onClose={() => setShowLeadMode(false)} title="Página Vendas Exemplo" />

            <AICreditGate
                isOpen={isCreditGateOpen}
                onClose={() => setIsCreditGateOpen(false)}
                onConfirm={confirmGate}
                onOpenShop={() => toast.error("Loja em manutenção.")}
                toolId="funnel_page_builder"
                cost={15}
                balance={(user as any)?.creditBalance || 0}
                title="Criar Página de Vendas"
                description="O Nexus IA irá arquitetar, escrever e otimizar sua página. Custo: 15 créditos."
            />
        </motion.div>
    );
};
