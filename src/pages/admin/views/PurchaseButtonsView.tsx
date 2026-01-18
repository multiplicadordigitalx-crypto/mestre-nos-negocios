import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import {
    MousePointer, PlusCircle, Trash, Save, ExternalLink, PlayCircle,
    Video, ShoppingBag, CheckCircle, X as XIcon, Edit, AlertTriangle, Clock, Eye,
    Layout, Sidebar, List, Image, Brain
} from '../../../components/Icons';
import { SystemButtonConfig, SystemVideoConfig, CreditSystemConfig } from '../../../types';
import {
    getSystemButtons, saveSystemButton, deleteSystemButton,
    getSystemVideos, saveSystemVideo, deleteSystemVideo,
    getCreditPopupConfig, saveCreditPopupConfig
} from '../../../services/mockFirebase';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

const TABS = [
    { id: 'student', label: 'Área do Aluno' },
    { id: 'influencer', label: 'Área do Parceiro (Influencer)' },
    { id: 'affiliate', label: 'Área do Afiliado' },
    { id: 'credits', label: 'Popups de Crédito' }
];

// Configuração das Zonas de Posicionamento
const ZONES: Record<string, { label: string, description: string, icon: any }> = {
    // Aluno
    'dashboard_header': { label: 'Cabeçalho Principal', description: 'Topo do Dashboard (Lado direito)', icon: Layout },
    'sidebar_bottom': { label: 'Sidebar (Menu)', description: 'Rodapé do Menu Lateral', icon: Sidebar },
    'training_list': { label: 'Área de Treinamento', description: 'Acima da lista de cursos', icon: PlayCircle },
    'products_list': { label: 'Lista de Produtos', description: 'Botões de ação nos produtos', icon: List },

    // Parceiro
    'influencer_header': { label: 'Cabeçalho do Parceiro', description: 'Topo do Dashboard do Influencer', icon: Layout },
    'mestre_ia_partner': { label: 'Mestre IA (Parceiro)', description: 'Tela principal da IA para parceiros', icon: Brain },
    'marketplace_list': { label: 'Marketplace', description: 'Lista de novos produtos para afiliação', icon: ShoppingBag },
};

const PurchaseButtonsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'student' | 'influencer' | 'affiliate' | 'credits'>('student');
    const [buttons, setButtons] = useState<SystemButtonConfig[]>([]);
    const [videos, setVideos] = useState<SystemVideoConfig[]>([]);
    const [creditConfig, setCreditConfig] = useState<CreditSystemConfig | null>(null);
    const [activeScenario, setActiveScenario] = useState<'insufficientBalance' | 'confirmUsage'>('insufficientBalance');
    const [loading, setLoading] = useState(true);

    // Editing State
    const [editingButton, setEditingButton] = useState<SystemButtonConfig | null>(null);
    const [editingVideo, setEditingVideo] = useState<SystemVideoConfig | null>(null);
    const [isButtonModalOpen, setIsButtonModalOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    // Additional Links State
    const [newLinkTitle, setNewLinkTitle] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [btns, vids, creds] = await Promise.all([getSystemButtons(), getSystemVideos(), getCreditPopupConfig()]);
            setButtons(btns);
            setVideos(vids);
            setCreditConfig(creds);
        } catch (error) {
            toast.error("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    };

    // --- BUTTON HANDLERS ---
    const handleAddButton = (preselectedZone?: string) => {
        setEditingButton({
            id: `btn-${Date.now()}`,
            section: preselectedZone || (activeTab === 'student' ? 'dashboard_header' : 'influencer_header'),
            label: 'Novo Botão',
            url: 'https://',
            color: '#FACC15',
            targetRole: activeTab,
            active: true,
            isExternal: true
        });
        setIsButtonModalOpen(true);
    };

    const handleEditButton = (btn: SystemButtonConfig) => {
        setEditingButton({ ...btn });
        setIsButtonModalOpen(true);
    };

    const handleSaveButton = async () => {
        if (!editingButton) return;
        if (!editingButton.label || !editingButton.url) {
            toast.error("Preencha o rótulo e a URL.");
            return;
        }

        // URL Validation (Simple Mock)
        if (!editingButton.url.startsWith('http')) {
            toast.error("URL inválida. Use http:// ou https://");
            return;
        }

        await saveSystemButton(editingButton);
        toast.success("Botão salvo e posicionado!");
        setIsButtonModalOpen(false);
        setEditingButton(null);
        loadData();
    };

    const handleDeleteButton = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir este botão?")) {
            await deleteSystemButton(id);
            toast.success("Botão removido.");
            loadData();
        }
    };

    // --- VIDEO HANDLERS ---
    const handleAddVideo = () => {
        setEditingVideo({
            id: `vid-${Date.now()}`,
            title: 'Novo Vídeo Educativo',
            url: '',
            description: '',
            targetRole: activeTab as 'influencer' | 'affiliate',
            duration: '',
            isRequired: false,
            views: 0,
            createdAt: Date.now()
        });
        setIsVideoModalOpen(true);
    };

    const handleEditVideo = (vid: SystemVideoConfig) => {
        setEditingVideo({ ...vid });
        setIsVideoModalOpen(true);
    };

    const handleSaveVideo = async () => {
        if (!editingVideo) return;
        if (!editingVideo.title || !editingVideo.url) {
            toast.error("Título e URL são obrigatórios.");
            return;
        }

        await saveSystemVideo(editingVideo);
        toast.success("Vídeo salvo com sucesso!");
        setIsVideoModalOpen(false);
        setEditingVideo(null);
        loadData();
    };

    const handleDeleteVideo = async (id: string) => {
        if (confirm("Remover este vídeo?")) {
            await deleteSystemVideo(id);
            toast.success("Vídeo removido.");
            loadData();
        }
    };

    // Filtered Data
    const filteredButtons = buttons.filter(b => b.targetRole === activeTab);
    const filteredVideos = videos.filter(v => v.targetRole === activeTab);

    // Group buttons by Zone
    const buttonsByZone = filteredButtons.reduce((acc, btn) => {
        const zone = btn.section || 'outros';
        if (!acc[zone]) acc[zone] = [];
        acc[zone].push(btn);
        return acc;
    }, {} as Record<string, SystemButtonConfig[]>);

    // Get available zones for current tab
    const availableZones = Object.keys(ZONES).filter(key => {
        if (activeTab === 'student') return ['dashboard_header', 'sidebar_bottom', 'training_list', 'products_list'].includes(key);
        return ['influencer_header', 'mestre_ia_partner', 'marketplace_list'].includes(key);
    });

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
                        <MousePointer className="w-8 h-8 text-brand-primary" /> Mapeamento de Botões & Mídia
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Gerencie onde os botões de compra aparecem nas páginas dos usuários.</p>
                </div>
            </div>

            {/* TABS */}
            <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700 w-full md:w-auto overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 px-6 py-3 rounded-lg text-sm font-bold uppercase transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-brand-primary text-black shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><LoadingSpinner size="lg" /></div>
            ) : (
                <div className="space-y-8">

                    {/* CREDIT POPUP EDITOR */}
                    {activeTab === 'credits' && creditConfig && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                {/* Scenario Selector */}
                                <div className="bg-gray-800 p-1 rounded-lg flex border border-gray-700">
                                    <button
                                        onClick={() => setActiveScenario('insufficientBalance')}
                                        className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-all ${activeScenario === 'insufficientBalance' ? 'bg-brand-primary text-black shadow' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Saldo Insuficiente
                                    </button>
                                    <button
                                        onClick={() => setActiveScenario('confirmUsage')}
                                        className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-all ${activeScenario === 'confirmUsage' ? 'bg-brand-primary text-black shadow' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Confirmar Utilização
                                    </button>
                                </div>

                                <Card className="p-6 bg-gray-900 border-gray-700">
                                    <h3 className="text-lg font-bold text-white mb-6 uppercase flex items-center gap-2">
                                        <Layout className="w-5 h-5 text-purple-400" />
                                        Personalizar: {activeScenario === 'insufficientBalance' ? 'Sem Créditos' : 'Confirmar Uso'}
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex bg-blue-900/20 p-3 rounded-lg gap-3 items-center border border-blue-500/20 mb-4">
                                            <Brain className="w-8 h-8 text-blue-400" />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-blue-100">Consultoria Nexus IA</h4>
                                                <p className="text-xs text-blue-300">Gere textos de alta conversão para este cenário.</p>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    const bestCopy = activeScenario === 'insufficientBalance'
                                                        ? { title: 'Ops! Créditos Esgotados', msg: 'Para continuar usando a inteligência artificial, recarregue seus créditos agora mesmo.' }
                                                        : { title: 'Confirmar Análise?', msg: 'Esta ação utilizará 1 crédito do seu saldo. Deseja prosseguir com a análise profunda?' };

                                                    setCreditConfig({
                                                        ...creditConfig,
                                                        [activeScenario]: {
                                                            ...creditConfig[activeScenario],
                                                            titleText: bestCopy.title,
                                                            messageText: bestCopy.msg
                                                        }
                                                    });
                                                    toast.success("Sugestão da IA aplicada!");
                                                }}
                                                className="!bg-blue-600 hover:!bg-blue-500 !text-[10px] uppercase font-bold"
                                            >
                                                ✨ Gerar Copy
                                            </Button>
                                        </div>

                                        <Input
                                            label="Título do Popup"
                                            value={creditConfig[activeScenario].titleText}
                                            onChange={e => setCreditConfig({
                                                ...creditConfig,
                                                [activeScenario]: { ...creditConfig[activeScenario], titleText: e.target.value }
                                            })}
                                        />
                                        <div>
                                            <label className="text-sm font-bold text-gray-400 uppercase mb-1 block">Mensagem Principal</label>
                                            <textarea
                                                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-purple-500 outline-none resize-none h-24"
                                                value={creditConfig[activeScenario].messageText}
                                                onChange={e => setCreditConfig({
                                                    ...creditConfig,
                                                    [activeScenario]: { ...creditConfig[activeScenario], messageText: e.target.value }
                                                })}
                                            />
                                        </div>

                                        <h4 className="text-sm font-bold text-gray-400 uppercase mt-4">Botão de Ação</h4>
                                        <div className="space-y-3 p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                                            <Input
                                                label="Texto do Botão"
                                                value={creditConfig[activeScenario].confirmButton.label}
                                                onChange={e => setCreditConfig({
                                                    ...creditConfig,
                                                    [activeScenario]: {
                                                        ...creditConfig[activeScenario],
                                                        confirmButton: { ...creditConfig[activeScenario].confirmButton, label: e.target.value }
                                                    }
                                                })}
                                            />
                                            {activeScenario === 'insufficientBalance' && (
                                                <Input
                                                    label="Link de Destino"
                                                    value={creditConfig[activeScenario].confirmButton.actionUrl || ''}
                                                    onChange={e => setCreditConfig({
                                                        ...creditConfig,
                                                        [activeScenario]: {
                                                            ...creditConfig[activeScenario],
                                                            confirmButton: { ...creditConfig[activeScenario].confirmButton, actionUrl: e.target.value }
                                                        }
                                                    })}
                                                />
                                            )}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 block">Cor do Botão</label>
                                                    <input
                                                        type="color"
                                                        value={creditConfig[activeScenario].confirmButton.bgColor}
                                                        onChange={e => setCreditConfig({
                                                            ...creditConfig,
                                                            [activeScenario]: {
                                                                ...creditConfig[activeScenario],
                                                                confirmButton: { ...creditConfig[activeScenario].confirmButton, bgColor: e.target.value }
                                                            }
                                                        })}
                                                        className="w-full h-8 rounded cursor-pointer"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 block">Cor do Texto</label>
                                                    <input
                                                        type="color"
                                                        value={creditConfig[activeScenario].confirmButton.textColor}
                                                        onChange={e => setCreditConfig({
                                                            ...creditConfig,
                                                            [activeScenario]: {
                                                                ...creditConfig[activeScenario],
                                                                confirmButton: { ...creditConfig[activeScenario].confirmButton, textColor: e.target.value }
                                                            }
                                                        })}
                                                        className="w-full h-8 rounded cursor-pointer"
                                                    />
                                                </div>
                                            </div>

                                            {/* Additional Links Manager - Only for Insufficient Balance */}
                                            {activeScenario === 'insufficientBalance' && (
                                                <div className="pt-4 mt-4 border-t border-gray-700">
                                                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Links Alternativos (Lojas)</h4>

                                                    {/* Existing Additional Links */}
                                                    <div className="space-y-2 mb-3">
                                                        {creditConfig[activeScenario].additionalLinks?.map((link, idx) => (
                                                            <div key={idx} className="flex gap-2 items-center bg-gray-900 p-2 rounded border border-gray-700">
                                                                <div className="flex-1 text-xs">
                                                                    <div className="font-bold text-white">{link.label}</div>
                                                                    <div className="text-gray-500 truncate">{link.url}</div>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        const newLinks = [...(creditConfig[activeScenario].additionalLinks || [])];
                                                                        newLinks.splice(idx, 1);
                                                                        setCreditConfig({
                                                                            ...creditConfig,
                                                                            [activeScenario]: { ...creditConfig[activeScenario], additionalLinks: newLinks }
                                                                        });
                                                                    }}
                                                                    className="p-1 text-red-400 hover:text-red-300"
                                                                >
                                                                    <Trash className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Add New Link Form */}
                                                    <div className="flex flex-col gap-2 bg-gray-800 p-2 rounded">
                                                        <input placeholder="Título (ex: Plano Anual)" className="bg-gray-900 border-gray-700 rounded text-xs p-2 text-white" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} />
                                                        <input placeholder="URL (ex: /shop/annual)" className="bg-gray-900 border-gray-700 rounded text-xs p-2 text-white" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} />
                                                        <Button
                                                            onClick={() => {
                                                                if (!newLinkTitle || !newLinkUrl) return toast.error("Preencha título e URL");
                                                                const currentLinks = creditConfig[activeScenario].additionalLinks || [];
                                                                setCreditConfig({
                                                                    ...creditConfig,
                                                                    [activeScenario]: {
                                                                        ...creditConfig[activeScenario],
                                                                        additionalLinks: [...currentLinks, { label: newLinkTitle, url: newLinkUrl }]
                                                                    }
                                                                });
                                                                setNewLinkTitle('');
                                                                setNewLinkUrl('');
                                                            }}
                                                            className="!py-1 !text-xs !bg-blue-600 w-full"
                                                        >
                                                            <PlusCircle className="w-3 h-3 mr-1" /> Adicionar Link
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-700">
                                        <Button onClick={async () => { await saveCreditPopupConfig(creditConfig); toast.success("Configuração de Créditos Salva!"); }} className="w-full !bg-green-600 hover:!bg-green-500 font-bold uppercase shadow-lg">
                                            <Save className="w-4 h-4 mr-2" /> Salvar Alterações
                                        </Button>
                                    </div>
                                </Card>
                            </div>

                            {/* PREVIEW */}
                            <div className="flex flex-col">
                                <h3 className="text-lg font-bold text-white mb-6 uppercase flex items-center gap-2"><Eye className="w-5 h-5 text-brand-primary" /> Preview em Tempo Real</h3>
                                <div className="flex-1 rounded-[2rem] border border-gray-700 relative overflow-hidden flex items-center justify-center p-10" style={{ backgroundColor: '#000' }}>
                                    {/* Mock App Background */}
                                    <div className="absolute inset-0 bg-gray-900 opacity-50 grid grid-cols-3 gap-4 p-4 pointer-events-none filter blur-sm">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <div key={i} className="bg-gray-800 rounded-xl h-32"></div>)}
                                    </div>

                                    {/* The Popup */}
                                    <div className="relative z-10 w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center animate-fade-in-up"
                                        style={{ backgroundColor: creditConfig[activeScenario].cardBackgroundColor, boxShadow: `0 20px 50px ${creditConfig[activeScenario].overlayColor}40` }}>

                                        <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center mb-4 border border-gray-600">
                                            {activeScenario === 'insufficientBalance' ? (
                                                <AlertTriangle className="w-8 h-8 text-red-500" />
                                            ) : (
                                                <Brain className="w-8 h-8 text-purple-400" />
                                            )}
                                        </div>

                                        <h3 className="text-xl font-black mb-2" style={{ color: creditConfig[activeScenario].titleColor }}>{creditConfig[activeScenario].titleText}</h3>
                                        <p className="text-sm mb-6 leading-relaxed" style={{ color: creditConfig[activeScenario].messageColor }}>{creditConfig[activeScenario].messageText}</p>

                                        {/* Cost Simulation Badge */}
                                        {activeScenario === 'confirmUsage' && (
                                            <div className="flex items-center gap-2 bg-gray-800/80 px-4 py-1.5 rounded-full border border-gray-600 mb-6 mx-auto w-max shadow-sm">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Custo: 1 Crédito</span>
                                            </div>
                                        )}

                                        <button
                                            className="w-full py-3 rounded-xl font-bold uppercase tracking-wide mb-3 shadow-lg transition-transform hover:scale-105"
                                            style={{ backgroundColor: creditConfig[activeScenario].confirmButton.bgColor, color: creditConfig[activeScenario].confirmButton.textColor }}
                                        >
                                            {creditConfig[activeScenario].confirmButton.label}
                                        </button>

                                        {/* Additional Links Preview */}
                                        {creditConfig[activeScenario].additionalLinks?.map((link, idx) => (
                                            <button
                                                key={idx}
                                                className="w-full py-3 rounded-xl font-bold uppercase tracking-wide mb-3 shadow-md border border-gray-600 hover:bg-gray-700 transition-colors"
                                                style={{ backgroundColor: 'transparent', color: '#fff' }}
                                            >
                                                {link.label}
                                            </button>
                                        ))}

                                        <button
                                            className="w-full py-3 rounded-xl font-bold uppercase tracking-wide"
                                            style={{ backgroundColor: creditConfig[activeScenario].cancelButton.bgColor, color: creditConfig[activeScenario].cancelButton.textColor }}
                                        >
                                            {creditConfig[activeScenario].cancelButton.label}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-center text-gray-500 text-xs mt-4">
                                    Visualização: {activeScenario === 'insufficientBalance' ? 'Popup de Saldo Zero' : 'Popup de Confirmação'}
                                </p>
                            </div>
                        </div>
                    )}


                    {/* ZONES MAPPING VIEW */}
                    {activeTab !== 'credits' && (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {availableZones.map(zoneKey => {
                                    const zone = ZONES[zoneKey];
                                    const ZoneIcon = zone.icon;
                                    const zoneButtons = buttonsByZone[zoneKey] || [];

                                    return (
                                        <Card key={zoneKey} className="p-0 bg-gray-800 border-gray-700 flex flex-col h-full overflow-hidden">
                                            <div className="p-4 bg-gray-900/50 border-b border-gray-700 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-800 rounded-lg border border-gray-600">
                                                        <ZoneIcon className="w-5 h-5 text-gray-300" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white text-sm">{zone.label}</h4>
                                                        <p className="text-[10px] text-gray-500">{zone.description}</p>
                                                    </div>
                                                </div>
                                                <Button onClick={() => handleAddButton(zoneKey)} className="!py-1.5 !px-3 !text-[10px] !bg-brand-primary text-black hover:!bg-yellow-400">
                                                    <PlusCircle className="w-3 h-3 mr-1" /> Adicionar
                                                </Button>
                                            </div>

                                            <div className="p-4 flex-1 bg-gray-800/30 min-h-[100px]">
                                                {zoneButtons.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-gray-600 py-4 border-2 border-dashed border-gray-700 rounded-xl">
                                                        <p className="text-xs">Nenhum botão nesta área.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {zoneButtons.map(btn => (
                                                            <div key={btn.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors flex justify-between items-center group">
                                                                <div className="flex items-center gap-3">
                                                                    <div
                                                                        className="w-3 h-3 rounded-full shadow-sm"
                                                                        style={{ backgroundColor: btn.color }}
                                                                    ></div>
                                                                    <div>
                                                                        <p className="text-white font-bold text-xs">{btn.label}</p>
                                                                        <p className="text-[10px] text-gray-500 truncate max-w-[200px]">{btn.url}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${btn.active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                                        {btn.active ? 'ON' : 'OFF'}
                                                                    </div>
                                                                    <button onClick={() => handleEditButton(btn)} className="text-gray-400 hover:text-white p-1.5 hover:bg-gray-700 rounded transition-colors"><Edit className="w-3 h-3" /></button>
                                                                    <button onClick={() => handleDeleteButton(btn.id)} className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-900/20 rounded transition-colors"><Trash className="w-3 h-3" /></button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* VIDEOS SECTION (Only for Influencer/Affiliate) */}
                            {(activeTab === 'influencer' || activeTab === 'affiliate') && (
                                <div className="mt-12 pt-8 border-t border-gray-700">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase">
                                            <Video className="w-5 h-5 text-purple-400" /> Biblioteca de Vídeos Educativos
                                        </h3>
                                        <Button onClick={handleAddVideo} className="!py-2 !px-4 !text-xs !bg-purple-600 hover:!bg-purple-500 font-bold">
                                            <PlusCircle className="w-3 h-3 mr-2" /> Novo Vídeo
                                        </Button>
                                    </div>

                                    {filteredVideos.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-900/50 rounded-xl border border-gray-700 border-dashed">
                                            <PlayCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">Nenhum vídeo educativo cadastrado.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {filteredVideos.map(vid => (
                                                <div key={vid.id} className="flex flex-col sm:flex-row items-center bg-gray-900 p-4 rounded-xl border border-gray-700 gap-4 group hover:border-purple-500/30 transition-colors">
                                                    <div className="w-full sm:w-40 aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden border border-gray-800">
                                                        {vid.thumbnailUrl ? (
                                                            <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover opacity-60" />
                                                        ) : (
                                                            <PlayCircle className="w-10 h-10 text-gray-600" />
                                                        )}
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <PlayCircle className="w-8 h-8 text-white opacity-80" />
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 w-full text-center sm:text-left">
                                                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                                            <h4 className="text-white font-bold text-sm line-clamp-1">{vid.title}</h4>
                                                            {vid.isRequired && <span className="bg-red-500/20 text-red-400 text-[9px] px-2 py-0.5 rounded border border-red-500/30 font-bold uppercase">Obrigatório</span>}
                                                        </div>
                                                        <p className="text-gray-400 text-xs mb-2 line-clamp-2 h-8">{vid.description}</p>
                                                        <div className="flex items-center justify-center sm:justify-start gap-4 text-[10px] text-gray-500">
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {vid.duration || '--:--'}</span>
                                                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {vid.views} views</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex sm:flex-col gap-2">
                                                        <button onClick={() => handleEditVideo(vid)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"><Edit className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteVideo(vid.id)} className="p-2 bg-gray-800 hover:bg-red-900/30 rounded text-gray-400 hover:text-red-400 transition-colors"><Trash className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* BUTTON EDITOR MODAL WITH ZONE SELECTOR */}
            <AnimatePresence>
                {isButtonModalOpen && editingButton && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150] p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-gray-800 w-full max-w-lg rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900 rounded-t-2xl">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <MousePointer className="w-5 h-5 text-brand-primary" /> Editar Botão
                                </h3>
                                <button onClick={() => setIsButtonModalOpen(false)}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
                                {/* Zone Selector */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Localização (Zona)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {availableZones.map(zoneKey => {
                                            const zone = ZONES[zoneKey];
                                            const Icon = zone.icon;
                                            const isSelected = editingButton.section === zoneKey;
                                            return (
                                                <div
                                                    key={zoneKey}
                                                    onClick={() => setEditingButton({ ...editingButton, section: zoneKey })}
                                                    className={`p-3 rounded-lg border cursor-pointer flex items-start gap-3 transition-all ${isSelected ? 'bg-brand-primary/10 border-brand-primary' : 'bg-gray-900 border-gray-600 hover:border-gray-500'}`}
                                                >
                                                    <div className={`p-1.5 rounded ${isSelected ? 'bg-brand-primary text-black' : 'bg-gray-800 text-gray-400'}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>{zone.label}</p>
                                                        <p className="text-[9px] text-gray-500 leading-tight mt-0.5">{zone.description}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <Input
                                    label="Texto do Botão"
                                    value={editingButton.label}
                                    onChange={e => setEditingButton({ ...editingButton, label: e.target.value })}
                                />
                                <Input
                                    label="Link de Destino"
                                    value={editingButton.url}
                                    onChange={e => setEditingButton({ ...editingButton, url: e.target.value })}
                                    placeholder="https://..."
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Cor do Botão</label>
                                    <div className="flex gap-2 items-center bg-gray-900 p-2 rounded-lg border border-gray-600">
                                        <input
                                            type="color"
                                            value={editingButton.color}
                                            onChange={e => setEditingButton({ ...editingButton, color: e.target.value })}
                                            className="h-8 w-8 rounded border-none bg-transparent cursor-pointer"
                                        />
                                        <span className="text-gray-400 text-xs font-mono flex-1">{editingButton.color}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-gray-900 p-3 rounded-lg border border-gray-700">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={editingButton.active} onChange={e => setEditingButton({ ...editingButton, active: e.target.checked })} className="rounded bg-gray-700 border-gray-600 text-green-500" />
                                        <span className={`text-xs font-bold ${editingButton.active ? 'text-green-400' : 'text-gray-500'}`}>Botão Ativo</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={editingButton.isExternal} onChange={e => setEditingButton({ ...editingButton, isExternal: e.target.checked })} className="rounded bg-gray-700 border-gray-600 text-blue-500" />
                                        <span className="text-gray-300 text-xs">Nova Aba</span>
                                    </label>
                                </div>

                                <div className="mt-4 p-4 bg-black/40 rounded-lg text-center border border-gray-700">
                                    <p className="text-[10px] text-gray-500 mb-2 uppercase font-bold">Preview em Tempo Real</p>
                                    <button
                                        className="px-6 py-3 rounded-lg font-bold text-sm shadow-lg transition-transform hover:scale-105"
                                        style={{ backgroundColor: editingButton.color, color: '#000' }}
                                    >
                                        {editingButton.label || 'Botão'}
                                        {editingButton.isExternal && <ExternalLink className="w-3 h-3 ml-2 inline-block opacity-50" />}
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-2xl flex gap-3">
                                <Button variant="secondary" onClick={() => setIsButtonModalOpen(false)} className="flex-1">Cancelar</Button>
                                <Button onClick={handleSaveButton} className="flex-1 !bg-green-600 hover:!bg-green-500">Salvar Alterações</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* VIDEO EDITOR MODAL */}
            <AnimatePresence>
                {isVideoModalOpen && editingVideo && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150] p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-gray-800 w-full max-w-lg rounded-2xl border border-gray-700 shadow-2xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <h3 className="text-lg font-bold text-white mb-4">Gerenciar Vídeo Educativo</h3>
                            <div className="space-y-4">
                                <Input label="Título" value={editingVideo.title} onChange={e => setEditingVideo({ ...editingVideo, title: e.target.value })} />
                                <Input label="URL do Vídeo (YouTube/Vimeo)" value={editingVideo.url} onChange={e => setEditingVideo({ ...editingVideo, url: e.target.value })} />
                                <Input label="Duração (ex: 15:00)" value={editingVideo.duration} onChange={e => setEditingVideo({ ...editingVideo, duration: e.target.value })} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                                    <textarea
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white text-sm h-24 focus:border-purple-500 outline-none resize-none"
                                        value={editingVideo.description}
                                        onChange={e => setEditingVideo({ ...editingVideo, description: e.target.value })}
                                    />
                                </div>
                                <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded-lg flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                                        <input type="checkbox" checked={editingVideo.isRequired} onChange={e => setEditingVideo({ ...editingVideo, isRequired: e.target.checked })} className="rounded bg-gray-700 border-gray-600 text-yellow-500" />
                                        <span className="text-yellow-200 text-xs font-bold">Marcar como Obrigatório</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button variant="secondary" onClick={() => setIsVideoModalOpen(false)} className="flex-1">Cancelar</Button>
                                <Button onClick={handleSaveVideo} className="flex-1 !bg-purple-600 hover:!bg-purple-500">Salvar Vídeo</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PurchaseButtonsView;
