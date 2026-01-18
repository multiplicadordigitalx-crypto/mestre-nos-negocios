
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import Input from './Input';
import { Brain, CloudUpload, CheckCircle, Palette, Monitor, ArrowLeft, Sparkles, X as XIcon, Zap, LockClosed, AlertTriangle, ShieldCheck } from './Icons';
import { uploadFileToStorage, saveSchoolSettings, consumeCredits } from '../services/mockFirebase';
import { generateSchoolLogo } from '../services/mestreIaService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { SchoolConfig, SchoolNiche } from '../types';
import { AICreditGate } from './AICreditGate';
import { getSchoolConfigByNiche } from '../services/schoolService';
import { StudentMenuItem } from '../types';

const DEFAULT_MENU_ITEMS: StudentMenuItem[] = [
    { id: 'dashboard', label: 'Início', icon: 'Home', path: 'dashboard', isEnabled: true },
    { id: 'training', label: 'Treinamento', icon: 'BookOpen', path: 'training', isEnabled: true },
    { id: 'financial', label: 'Financeiro', icon: 'DollarSign', path: 'financial', isEnabled: true },
    { id: 'create_course', label: 'Criar Curso', icon: 'PlusCircle', path: 'create_course', isEnabled: true },
    { id: 'minhas_escolas', label: 'Minhas Escolas', icon: 'Monitor', path: 'producer_dashboard', isEnabled: true },
    { id: 'mestre_ia', label: 'Mentor IA', icon: 'Sparkles', path: 'mestre_ia', isEnabled: true },
    { id: 'coach', label: 'Coach IA', icon: 'Bot', path: 'coach', isEnabled: true },
    { id: 'products', label: 'Produtos', icon: 'ShoppingBag', path: 'products', isEnabled: true },
    { id: 'marketing', label: 'Marketing', icon: 'Megaphone', path: 'marketing', isEnabled: true },
    { id: 'nexus_ads', label: 'Nexus Ads', icon: 'Target', path: 'nexus_ads', isEnabled: true },
    { id: 'integrations', label: 'Integrações', icon: 'Link', path: 'integrations', isEnabled: true },
    { id: 'funnels', label: 'Funil & PGS', icon: 'Filter', path: 'funnels', isEnabled: true },
    { id: 'email_marketing', label: 'E-mail Mkt', icon: 'Mail', path: 'email_marketing', isEnabled: true },
    { id: 'diario_alimentar', label: 'Diário Alimentar', icon: 'HeartPulse', path: 'diario_alimentar', isEnabled: true },
    { id: 'jurista_ia', label: 'Jurista IA', icon: 'Hammer', path: 'jurista_ia', isEnabled: true },
    { id: 'community', label: 'Comunidade', icon: 'Users', path: 'community', isEnabled: true },
    { id: 'profile', label: 'Perfil', icon: 'User', path: 'profile', isEnabled: true },
    { id: 'support', label: 'Suporte', icon: 'MessageSquare', path: 'support', isEnabled: true },
];

interface SchoolSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (settings: SchoolConfig) => void;
    niche?: string;
    hideMenuCustomization?: boolean;
    selectedTools?: string[];
}

export const SchoolSetupModal: React.FC<SchoolSetupModalProps> = (props) => {
    const { isOpen, onClose, onSuccess, niche, selectedTools = [] } = props;
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);

    // AI State
    const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
    const [logoDescription, setLogoDescription] = useState('');

    // Gate State
    const [isCreditGateOpen, setIsCreditGateOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    // Form State
    const [schoolName, setSchoolName] = useState('');
    const [subdomain, setSubdomain] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#FACC15');
    const [secondaryColor, setSecondaryColor] = useState('#111827');
    const [menuLabels, setMenuLabels] = useState<Record<string, string>>({});

    // Auto-fill defaults when niche changes or modal opens
    React.useEffect(() => {
        if (isOpen && niche) {
            const config = getSchoolConfigByNiche(niche);
            if (config.theme) {
                setPrimaryColor(config.theme.primaryColor || '#FACC15');
                setSecondaryColor(config.theme.secondaryColor || '#111827');
            }
            if (config.menuConfig) {
                const initialLabels: Record<string, string> = {};
                config.menuConfig.forEach(item => {
                    initialLabels[item.id] = item.label;
                });
                setMenuLabels(initialLabels);
            }
        }
    }, [isOpen, niche]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleTriggerGenerate = () => {
        if (!schoolName) return toast.error("Defina o nome da escola primeiro.");
        if (!logoDescription.trim()) return toast.error("Descreva como deseja a sua logo para a IA.");

        setPendingAction(() => executeGeneration);
        setIsCreditGateOpen(true);
    }

    const executeGeneration = async () => {
        setIsGeneratingLogo(true);
        const toastId = toast.loading("Mestre IA: Desenhando sua marca exclusiva...");

        try {
            // 2. Real Generation
            const imageUrl = await generateSchoolLogo({
                title: schoolName,
                description: logoDescription
            });

            setLogoUrl(imageUrl);

            // Suggest primary color based on logo (mock random for now)
            const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
            setPrimaryColor(randomColor);

            toast.success("Logo gerada com sucesso!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Erro ao processar imagem.", { id: toastId });
        } finally {
            setIsGeneratingLogo(false);
        }
    };

    const confirmGate = async () => {
        setIsCreditGateOpen(false);
        if (pendingAction && user) {
            const result = await consumeCredits(user.uid, 'ai_school_logo', 10, `Criação de Logo IA - ${schoolName}`);
            if (result.success) {
                await pendingAction();
                await refreshUser();
            } else {
                toast.error("Saldo insuficiente.");
            }
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = toast.loading("Enviando logo...");
        uploadFileToStorage(file, () => { }).then(url => {
            setLogoUrl(url);
            toast.success("Logo enviada!", { id: toastId });
        });
    };

    const handleSave = async () => {
        if (!schoolName || !subdomain || !logoUrl) return toast.error("Preencha todos os campos obrigatórios.");
        if (!user) return;

        setLoading(true);
        // Using any cast temporarily if strict type mismatch persists, but SchoolConfig should now match
        const settings: any = {
            id: `school-${Date.now()}`, // Added ID
            producerId: user.uid, // Renamed from ownerId
            name: schoolName, // Renamed from schoolName
            subdomain: subdomain.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            logoUrl, // Note: LogoUrl not in SchoolConfig interface yet? Check Theme.
            // Wait, SchoolConfig.theme has logoUrl. SchoolConfig root DOES NOT.
            // We need to map properly to SchoolConfig structure.
            theme: {
                primaryColor,
                secondaryColor,
                backgroundColor: '#111827',
                sidebarColor: '#1F2937',
                accentColor: primaryColor,
                logoUrl,
            },
            niche: (niche as SchoolNiche) || 'GENERIC',
            features: {
                enableMestreIA: true,
                enableNexusPlayer: true,
                enableGamification: true,
                enableStore: true,
                enableCommunity: true,
                enableLiveEvents: true
            },
            menuConfig: DEFAULT_MENU_ITEMS.map(item => ({
                ...item,
                label: menuLabels[item.id] || item.label
            })),
            welcomeMessage: `Bem-vindo à ${schoolName}!`,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Note: I am changing structure significantly. 
        // If saveSchoolSettings EXPECTS SchoolSettings (old), this BREAKS runtime if not aligned.
        // But the error said "Argument of type 'SchoolSettings' is not assignable to parameter of type 'SchoolConfig'".
        // This means saveSchoolSettings expects SchoolConfig!
        // So I MUST construct a SchoolConfig.

        await saveSchoolSettings(settings);
        setLoading(false);
        onSuccess(settings);
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-900 w-full max-w-5xl h-[85vh] rounded-2xl border border-brand-primary/30 shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
            >
                {/* Left: Preview (Live) */}
                <div className="hidden md:flex w-1/2 flex-col relative overflow-hidden transition-colors duration-500" style={{ backgroundColor: secondaryColor }}>
                    <div className="absolute top-0 left-0 w-full p-2 bg-gray-800 flex items-center gap-2 z-10 border-b border-gray-700">
                        <div className="flex gap-1.5 ml-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        </div>
                        <div className="bg-black/50 text-gray-500 text-[10px] px-3 py-1 rounded-full flex-1 text-center font-mono">
                            {subdomain ? `${subdomain}.mestre.com` : 'sua-escola.mestre.com'}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                        <div className="absolute inset-0 opacity-10 transition-colors duration-500" style={{ backgroundColor: primaryColor }}></div>
                        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 transition-colors duration-500" style={{ backgroundColor: primaryColor }}></div>

                        <div className="w-full max-w-sm bg-gray-900/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-700 shadow-2xl relative z-10">
                            <div className="flex justify-center mb-6">
                                {logoUrl ? (
                                    <img src={logoUrl} className="h-24 w-24 object-contain rounded-lg shadow-sm" alt="Logo" />
                                ) : (
                                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center border-2 border-dashed border-gray-600">
                                        <span className="text-xs text-gray-500">Logo</span>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-white text-center font-bold text-lg mb-1">{schoolName || 'Nome da Sua Escola'}</h3>
                            <p className="text-gray-400 text-center text-xs mb-6">Acesse sua área do aluno</p>

                            <div className="space-y-3">
                                <div className="h-10 bg-gray-800 rounded border border-gray-700 w-full opacity-50"></div>
                                <div className="h-10 bg-gray-800 rounded border border-gray-700 w-full opacity-50"></div>
                                <div
                                    className="h-10 rounded font-bold text-white text-sm flex items-center justify-center shadow-lg transition-colors duration-500"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    ENTRAR
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-900 text-center border-t border-gray-800">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Preview em Tempo Real</p>
                    </div>
                </div>

                {/* Right: Configuration Form */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-gray-900">
                    <div className="mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-brand-primary/20">
                            <Monitor className="w-6 h-6 text-black" />
                        </div>
                        <h2 className="text-2xl font-black text-white">Configure sua Escola</h2>
                        <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                            Crie um portal exclusivo para seus alunos com sua marca e cores.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-5">
                            <Input
                                label="Nome da Escola / Projeto"
                                placeholder="Ex: Academia do Tráfego, Método Alpha..."
                                value={schoolName}
                                onChange={e => {
                                    setSchoolName(e.target.value);
                                    if (!subdomain) setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                                }}
                            />
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Subdomínio de Acesso</label>
                                <div className="flex shadow-sm">
                                    <input
                                        className="bg-gray-800 border border-gray-600 rounded-l-xl p-3 text-white text-sm outline-none flex-1 text-right focus:border-brand-primary"
                                        placeholder="seunome"
                                        value={subdomain}
                                        onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    />
                                    <div className="bg-gray-700 border border-l-0 border-gray-600 rounded-r-xl px-3 flex items-center text-gray-400 text-sm font-mono">
                                        .mestre.com
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-800 space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-purple-400" /> Identidade Visual
                                </h4>
                                <span className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-black uppercase tracking-widest">
                                    Nexus AI Design
                                </span>
                            </div>

                            {/* IA Logo Generator Section */}
                            <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-300 mb-2 block flex items-center gap-2">
                                        <Brain className="w-4 h-4 text-brand-primary" />
                                        Descreva como você quer a sua logo
                                    </label>
                                    <textarea
                                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white text-sm focus:border-brand-primary outline-none h-24 resize-none placeholder-gray-600"
                                        placeholder="Ex: Um leão minimalista dourado com fundo preto, transmitindo força e autoridade. Estilo moderno e clean."
                                        value={logoDescription}
                                        onChange={(e) => setLogoDescription(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        onClick={handleTriggerGenerate}
                                        isLoading={isGeneratingLogo}
                                        className="flex-1 !py-3 !text-xs font-black uppercase !bg-purple-600 hover:!bg-purple-500 shadow-lg"
                                    >
                                        {isGeneratingLogo ? 'Gerando...' : 'Gerar Logo com IA'}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="flex-1 !py-3 !text-xs border-dashed border-gray-600"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <CloudUpload className="w-4 h-4 mr-2" /> Upload Próprio
                                    </Button>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </div>
                            </div>

                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4 bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Cor Principal</label>
                                    <div className="flex gap-2 items-center bg-gray-900 p-2 rounded-lg border border-gray-700">
                                        <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
                                        <span className="text-xs text-white font-mono uppercase">{primaryColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Fundo / Secundária</label>
                                    <div className="flex gap-2 items-center bg-gray-900 p-2 rounded-lg border border-gray-700">
                                        <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
                                        <span className="text-xs text-white font-mono uppercase">{secondaryColor}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>


                        {/* Menu Customization Section - Conditionally Rendered */}
                        {!props.hideMenuCustomization && (
                            <div className="pt-6 border-t border-gray-800 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        <Monitor className="w-4 h-4 text-blue-400" /> Personalização do Menu
                                    </h4>
                                </div>

                                <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 grid gap-4">
                                    <p className="text-xs text-gray-500 mb-2">Edite os nomes dos menus que seus alunos irão ver.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {DEFAULT_MENU_ITEMS
                                            .filter(item => {
                                                // Always show core items
                                                const coreItems = ['dashboard', 'training', 'community', 'mestre_ia', 'profile', 'support'];
                                                if (coreItems.includes(item.id)) return true;

                                                // Special case: Marketing Pack tools
                                                const isMarketingPack = selectedTools.includes('marketing_pack');
                                                const marketingTools = ['nexus_ads', 'marketing', 'funnels', 'email_marketing', 'integrations', 'products', 'create_course'];
                                                if (isMarketingPack && marketingTools.includes(item.id)) return true;

                                                // Direct tool matches
                                                return selectedTools.includes(item.id);
                                            })
                                            .map(item => (
                                                <div key={item.id} className="space-y-1">
                                                    <label className="text-[10px] text-gray-400 uppercase font-bold">{item.label}</label>
                                                    <input
                                                        value={menuLabels[item.id] || item.label}
                                                        onChange={(e) => setMenuLabels(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-brand-primary outline-none"
                                                    />
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row gap-4">
                            <Button
                                variant="secondary"
                                onClick={onClose}
                                className="flex-1 !py-4 font-bold uppercase text-xs !bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                            </Button>
                            <Button
                                onClick={handleSave}
                                isLoading={loading}
                                className="flex-[2] !py-4 font-black text-lg !bg-green-600 hover:!bg-green-500 shadow-xl shadow-green-900/30 uppercase tracking-tighter"
                            >
                                <CheckCircle className="w-6 h-6 mr-2" /> CRIAR MINHA ESCOLA
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <AICreditGate
                isOpen={isCreditGateOpen}
                onClose={() => setIsCreditGateOpen(false)}
                onConfirm={confirmGate}
                onOpenShop={() => toast.error("Loja em manutenção.")}
                cost={10}
                balance={(user as any)?.creditBalance || 0}
                title="Criar Identidade Visual"
                description="A IA vai gerar sua logo baseada na descrição. Custo: 10 créditos."
            />
        </div>
    );
};
