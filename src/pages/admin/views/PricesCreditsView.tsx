
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import {
    Coins, Calculator, Settings,
    PlusCircle, Trash, AlertTriangle, PieChart,
    Percent, Box, ShoppingBag, Copy, Calendar, Tag,
    CheckCircle, Brain, ShieldCheck, Star, Crown, Zap,
    TrendingUp, ActivityIcon, DollarSign, Server, LockClosed, Filter,
    Megaphone, Link as LinkIcon, Database, ChevronDown, ChevronRight,
    Briefcase, FileText, Check, X
} from '../../../components/Icons';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import {
    getToolCosts, saveToolCost, getCreditCombos, saveCreditCombo,
    deleteCreditCombo, getAppProducts, getPendingCreditRequests, respondToCreditRequest,
    getWhiteLabelConfig, saveWhiteLabelConfig
} from '../../../services/mockFirebase';
import { ToolCost, CreditCombo, AppProduct, CreditRequest } from '../../../types';
import toast from 'react-hot-toast';

// --- CONSTANTES DO SISTEMA (MODULOS E FERRAMENTAS) ---
// Isso define a estrutura de tudo que existe no seu SaaS
const SYSTEM_MODULES = [
    {
        id: 'mestre_ia',
        label: 'Mestre IA (Ferramentas)',
        icon: <Brain className="w-5 h-5 text-purple-400" />,
        description: 'Geradores de conteúdo, copy, imagens e estratégia.',
        tools: [
            { id: 'mestre_dos_negocios', label: 'Consultor de Negócios', cost: 0.10 },
            { id: 'vendas_hoje', label: 'Campanhas Vendas Hoje', cost: 0.15 },
            { id: 'gerador_logomarcas', label: 'Gerador de Logos (Dall-E 3)', cost: 0.80 },
            { id: 'criativos_arts', label: 'Criador de Artes/Posts', cost: 0.50 },
            { id: 'ugc_viral_scripts', label: 'Roteiros UGC Viral', cost: 0.10 },
            { id: 'copy_generator', label: 'Gerador de Copy', cost: 0.05 },
            { id: 'video_maker', label: 'Gerador de Vídeos (Veo)', cost: 2.50 }
        ]
    },
    {
        id: 'marketing',
        label: 'Marketing 360º',
        icon: <Megaphone className="w-5 h-5 text-pink-500" />,
        description: 'Automação de redes sociais, radar viral e bots.',
        tools: [
            { id: 'viral_radar', label: 'Radar de Tendências', cost: 0.00 },
            { id: 'ugc_automation', label: 'Máquina de UGC Autônoma', cost: 1.00 },
            { id: 'bot_automation', label: 'Bot de Comentários', cost: 0.20 },
            { id: 'whatsapp_evolution', label: 'WhatsApp Evolution API', cost: 15.00 } // Custo fixo mensal estimado por aluno
        ]
    },
    {
        id: 'funnels',
        label: 'Funil & PGS',
        icon: <Filter className="w-5 h-5 text-orange-500" />,
        description: 'Construtor de páginas e otimizador de conversão.',
        tools: [
            { id: 'page_builder', label: 'Construtor de Páginas AI', cost: 0.50 },
            { id: 'optimizer_ab', label: 'Testes A/B Autônomos', cost: 0.00 },
            { id: 'analytics_pro', label: 'Analytics Avançado (Heatmaps)', cost: 0.00 },
            { id: 'hosting_subdomain', label: 'Hospedagem Subdomínio', cost: 2.00 } // Custo infra
        ]
    },
    {
        id: 'integrations',
        label: 'Integrações',
        icon: <LinkIcon className="w-5 h-5 text-blue-400" />,
        description: 'Conexão com plataformas externas.',
        tools: [
            { id: 'webhooks', label: 'Webhooks de Venda', cost: 0.00 },
            { id: 'pixel_api', label: 'API de Conversão (Pixel)', cost: 0.00 },
            { id: 'domain_manager', label: 'Gerenciador de Domínios', cost: 0.00 }
        ]
    },
    {
        id: 'support',
        label: 'Suporte & Comunidade',
        icon: <ShieldCheck className="w-5 h-5 text-green-400" />,
        description: 'Acesso a atendimento e grupos.',
        tools: [
            { id: 'community_access', label: 'Acesso à Comunidade', cost: 0.00 },
            { id: 'support_chat', label: 'Chat com Suporte Humano', cost: 10.00 }, // Custo alto de HH
            { id: 'certificate', label: 'Emissão de Certificado', cost: 1.00 }
        ]
    },
    {
        id: 'producer_b2b',
        label: 'Produtor & B2B',
        icon: <Briefcase className="w-5 h-5 text-indigo-400" />,
        description: 'Ferramentas de gestão e consultoria para produtores.',
        tools: [
            { id: 'nexus_consultancy', label: 'Consultoria Nexus IA', cost: 50.00 },
            { id: 'nexus_deep_scan', label: 'Raio-X Diagnóstico (Scan)', cost: 15.00 },
            { id: 'producer_action_auto', label: 'Execução Autônoma (Action)', cost: 25.00 },
            { id: 'team_member_seat', label: 'Vaga de Equipe (Mensal)', cost: 100.00 }
        ]
    }
];

// --- TYPES ---
interface PlanConfig {
    price: number;
    credits: number; // Créditos mensais para uso nas ferramentas que gastam
    activeFeatures: string[]; // IDs das tools ativas (ex: 'mestre_dos_negocios', 'viral_radar')
}

interface PlansState {
    basic: PlanConfig;
    pro: PlanConfig;
    elite: PlanConfig;
}

const INITIAL_PLAN_STATE: PlansState = {
    basic: { price: 49.90, credits: 50, activeFeatures: ['mestre_dos_negocios', 'copy_generator', 'community_access'] },
    pro: { price: 97.00, credits: 200, activeFeatures: ['mestre_dos_negocios', 'vendas_hoje', 'ugc_viral_scripts', 'copy_generator', 'page_builder', 'community_access', 'certificate'] },
    elite: { price: 197.00, credits: 1000, activeFeatures: SYSTEM_MODULES.flatMap(m => m.tools.map(t => t.id)) } // Tudo ativo
};

// --- ABA 1: COMBOS DE CRÉDITOS ---
const CombosTab: React.FC = () => {
    const [combos, setCombos] = useState<CreditCombo[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCombo, setCurrentCombo] = useState<Partial<CreditCombo>>({});

    useEffect(() => { getCreditCombos().then(setCombos); }, []);

    const handleSave = async () => {
        if (!currentCombo.name || !currentCombo.credits || !currentCombo.price) return toast.error("Preencha todos os campos.");
        await saveCreditCombo(currentCombo as CreditCombo);
        setCombos(await getCreditCombos());
        setIsEditing(false);
        toast.success("Pacote salvo com sucesso!");
    };

    const handleDelete = async (id: string) => {
        if (confirm("Excluir este pacote?")) {
            await deleteCreditCombo(id);
            setCombos(await getCreditCombos());
            toast.success("Pacote removido.");
        }
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-white">Pacotes de Venda (Loja)</h3>
                    <p className="text-gray-400 text-sm">Defina os pacotes de créditos disponíveis para compra pelo aluno.</p>
                </div>
                <Button onClick={() => { setCurrentCombo({ name: '', credits: 100, price: 0, active: true, id: `combo-${Date.now()}`, salesCount: 0, targetRole: 'student' }); setIsEditing(true); }} className="!bg-green-600 hover:!bg-green-500 font-bold"><PlusCircle className="w-4 h-4 mr-2" /> Novo Combo</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {combos.map(combo => (
                    <Card key={combo.id} className="p-6 bg-gray-800 border-gray-700 relative overflow-hidden group hover:border-brand-primary/50 transition-colors">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <h4 className="text-xl font-black text-white">{combo.name}</h4>
                                {combo.active ? <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold uppercase">Ativo</span> : <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold uppercase">Inativo</span>}
                            </div>
                            <p className="text-3xl font-black text-brand-primary mt-4">{combo.credits} <span className="text-sm text-gray-500 font-normal">créditos</span></p>
                            <p className="text-xl font-bold text-white mt-1">R$ {combo.price.toFixed(2)}</p>

                            <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
                                <Button variant="secondary" onClick={() => { setCurrentCombo(combo); setIsEditing(true); }} className="flex-1 !text-xs">Editar</Button>
                                <button onClick={() => handleDelete(combo.id)} className="p-2 bg-gray-900 rounded text-red-400 hover:text-red-300 transition-colors"><Trash className="w-4 h-4" /></button>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2 text-center">{combo.salesCount} vendas realizadas</p>
                        </div>
                    </Card>
                ))}
            </div>

            {isEditing && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
                    <div className="bg-gray-800 w-full max-w-lg rounded-2xl border border-gray-700 p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Editar Pacote</h3>
                            <button onClick={() => setIsEditing(false)}><Trash className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                        </div>
                        <div className="space-y-4">
                            <Input label="Nome do Pacote" value={currentCombo.name} onChange={e => setCurrentCombo({ ...currentCombo, name: e.target.value })} placeholder="Ex: Pack Iniciante" />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Qtd. Créditos" type="number" value={currentCombo.credits} onChange={e => setCurrentCombo({ ...currentCombo, credits: parseInt(e.target.value) })} />
                                <Input label="Preço (R$)" type="number" value={currentCombo.price} onChange={e => setCurrentCombo({ ...currentCombo, price: parseFloat(e.target.value) })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Público Alvo</label>
                                <select
                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white text-sm outline-none"
                                    value={currentCombo.targetRole}
                                    onChange={e => setCurrentCombo({ ...currentCombo, targetRole: e.target.value as any })}
                                >
                                    <option value="student">Alunos</option>
                                    <option value="influencer">Influencers</option>
                                    <option value="all">Todos</option>
                                </select>
                            </div>

                            <div className="bg-gray-900 p-3 rounded-lg border border-gray-600">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={currentCombo.active} onChange={e => setCurrentCombo({ ...currentCombo, active: e.target.checked })} className="rounded bg-gray-700 border-gray-500 text-brand-primary" />
                                    <span className="text-white text-sm">Disponível para venda na loja</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button>
                                <Button onClick={handleSave} className="!bg-green-600 hover:!bg-green-500">Salvar Pacote</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- ABA 2: CUSTO POR FERRAMENTA ---
const ToolPricingTab: React.FC = () => {
    const [tools, setTools] = useState<ToolCost[]>([]);
    const [wlConfig, setWlConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getToolCosts(),
            getWhiteLabelConfig()
        ]).then(([toolsData, wlData]) => {
            setTools(toolsData);
            setWlConfig(wlData);
            setLoading(false);
        });
    }, []);

    const handleUpdateCost = async (tool: ToolCost, newCost: number) => {
        const updated = { ...tool, costPerTask: newCost };
        await saveToolCost(updated);
        setTools(prev => prev.map(t => t.toolId === tool.toolId ? updated : t));
        toast.success(`Custo de ${tool.toolName} atualizado!`);
    };

    const handleUpdateWlTool = async (index: number, field: string, value: any) => {
        if (!wlConfig) return;
        const newTools = [...wlConfig.tools];
        newTools[index] = { ...newTools[index], [field]: value };
        const newConfig = { ...wlConfig, tools: newTools };
        setWlConfig(newConfig);
        await saveWhiteLabelConfig(newConfig);
        toast.success("Configuração White Label atualizada!"); // Auto-save for smooth UX? Or add button?
    };

    const handleUpdateBaseFee = async (val: number) => {
        if (!wlConfig) return;
        const newConfig = { ...wlConfig, platformBaseFee: val };
        setWlConfig(newConfig);
        await saveWhiteLabelConfig(newConfig);
    };

    const handleUpdateCommission = async (val: number) => {
        if (!wlConfig) return;
        const newConfig = { ...wlConfig, creditCommissionRate: val };
        setWlConfig(newConfig);
        await saveWhiteLabelConfig(newConfig);
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-xl flex gap-3 items-start">
                <Calculator className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                    <h4 className="text-yellow-400 font-bold text-sm">Calculadora de Custos & White Label</h4>
                    <p className="text-xs text-yellow-200 mt-1">
                        Defina aqui tanto o custo de consumo (créditos) quanto os valores cobrados dos produtores (White Label).
                    </p>
                </div>
            </div>

            {wlConfig && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="bg-gray-800 border-purple-500/30 p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Server className="w-5 h-5 text-purple-400" /> Taxa de Plataforma Base
                        </h3>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-400">Mensalidade por Aluno Ativo (R$)</label>
                            <input
                                type="number"
                                className="bg-gray-900 border border-gray-600 rounded-lg p-3 text-white font-bold text-lg"
                                value={wlConfig.platformBaseFee}
                                onChange={(e) => handleUpdateBaseFee(parseFloat(e.target.value))}
                            />
                            <p className="text-[10px] text-gray-500">Custo fixo cobrado do produtor por aluno cadastrado.</p>
                        </div>
                    </Card>

                    <Card className="bg-gray-800 border-brand-primary/30 p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-brand-primary" /> Comissão de Créditos (IA)
                        </h3>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-400">Comissão do Produtor sobre Lucro (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white font-bold text-lg focus:border-brand-primary outline-none"
                                    value={wlConfig.creditCommissionRate || 5}
                                    onChange={(e) => handleUpdateCommission(parseFloat(e.target.value))}
                                />
                                <span className="absolute right-3 top-4 text-gray-500 font-bold">%</span>
                            </div>
                            <p className="text-[10px] text-gray-500">Porcentagem do lucro líquido de créditos repassada ao produtor.</p>
                        </div>
                    </Card>
                </div>
            )}

            <Card className="overflow-hidden bg-gray-800 border-gray-700">
                <div className="p-4 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-white">Custos de Ferramentas (Consumo & Revenda)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-900 text-gray-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">Ferramenta</th>
                                <th className="p-4">Custo API (R$)</th>
                                <th className="p-4">Preço (Créditos)</th>
                                <th className="p-4 bg-purple-900/10 text-purple-300">Setup Fee (R$)</th>
                                <th className="p-4 bg-purple-900/10 text-purple-300">Mensal (R$)</th>
                                <th className="p-4 bg-purple-900/10 text-purple-300">Markup (%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? <tr><td colSpan={6} className="p-8 text-center"><LoadingSpinner /></td></tr> :
                                // Merge tools from getToolCosts and getWhiteLabelConfig if needed, 
                                // but for now we iterate wlConfig.tools largely or toolCosts.
                                // Let's iterate wlConfig.tools as it drives the WL availability.
                                wlConfig?.tools.map((wlTool: any, index: number) => {
                                    // Find cost info if available (fuzzy match or direct ID match)
                                    const costTool = tools.find(t => t.toolId === wlTool.id);

                                    return (
                                        <tr key={wlTool.id} className="hover:bg-gray-700/50 transition-colors">
                                            <td className="p-4 font-bold text-white flex items-center gap-2">
                                                {wlTool.name}
                                                {costTool && <span className="text-[10px] bg-gray-700 px-1 rounded">{costTool.complexity}</span>}
                                            </td>
                                            <td className="p-4 text-gray-500 font-mono">
                                                {costTool ? `~R$ ${costTool.realCostEstimate.toFixed(3)}` : '-'}
                                            </td>
                                            <td className="p-4">
                                                {costTool ? (
                                                    <input
                                                        type="number"
                                                        className="w-20 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-center font-bold focus:border-brand-primary outline-none"
                                                        value={costTool.costPerTask}
                                                        onChange={(e) => handleUpdateCost(costTool, parseFloat(e.target.value))}
                                                    />
                                                ) : <span className="text-xs text-gray-500">N/A</span>}
                                            </td>
                                            {/* White Label Config Columns */}
                                            <td className="p-4 bg-purple-900/5 border-l border-gray-700/50">
                                                <input
                                                    type="number"
                                                    className="w-24 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-center text-xs focus:border-purple-500 outline-none"
                                                    value={wlTool.setupFee}
                                                    onChange={(e) => handleUpdateWlTool(index, 'setupFee', parseFloat(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-4 bg-purple-900/5">
                                                <input
                                                    type="number"
                                                    className="w-24 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-center text-xs focus:border-purple-500 outline-none"
                                                    value={wlTool.monthlyCost}
                                                    onChange={(e) => handleUpdateWlTool(index, 'monthlyCost', parseFloat(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-4 bg-purple-900/5">
                                                <div className="relative w-20">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-center text-xs focus:border-purple-500 outline-none"
                                                        value={wlTool.dilutedMarkup}
                                                        onChange={(e) => handleUpdateWlTool(index, 'dilutedMarkup', parseFloat(e.target.value))}
                                                    />
                                                    <span className="absolute right-1 top-1 text-[10px] text-gray-500">%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// --- ABA 3: PROMOÇÕES E OFERTAS ---
interface Coupon {
    id: string;
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
    product: string;
    uses: number;
    limit: number | null;
    expiration: string;
    status: 'active' | 'expired' | 'scheduled';
}

const PromotionsTab: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([
        { id: '1', code: 'MESTRE10', discount: 10, type: 'percentage', product: 'Todos', uses: 142, limit: null, expiration: '2025-12-31', status: 'active' },
        { id: '2', code: 'BLACKFRIDAY', discount: 50, type: 'percentage', product: 'Mestre 15X', uses: 500, limit: 500, expiration: '2023-11-30', status: 'expired' }
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({ code: '', discount: 10, type: 'percentage', product: 'Todos', limit: 100, expiration: '' });

    const handleSave = () => {
        if (!newCoupon.code || !newCoupon.discount || !newCoupon.expiration) return toast.error("Preencha campos obrigatórios.");
        setCoupons(prev => [{ ...newCoupon, id: `cp-${Date.now()}`, uses: 0, status: 'active' } as Coupon, ...prev]);
        setIsModalOpen(false);
        toast.success("Cupom criado!");
    };

    const handleDelete = (id: string) => {
        if (confirm("Excluir cupom?")) {
            setCoupons(prev => prev.filter(c => c.id !== id));
            toast.success("Cupom excluído.");
        }
    }

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Código copiado!");
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Cupons de Desconto</h3>
                <Button onClick={() => setIsModalOpen(true)} className="!bg-pink-600 hover:!bg-pink-500"><PlusCircle className="w-4 h-4 mr-2" /> Criar Cupom</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map(coupon => (
                    <Card key={coupon.id} className={`p-0 overflow-hidden border ${coupon.status === 'active' ? 'border-pink-500/30' : 'border-gray-700 opacity-70'} relative group`}>
                        {/* Ticket Cutout Effect */}
                        <div className="absolute -left-3 top-1/2 w-6 h-6 bg-gray-900 rounded-full"></div>
                        <div className="absolute -right-3 top-1/2 w-6 h-6 bg-gray-900 rounded-full"></div>

                        <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-1 flex items-center gap-2 cursor-pointer hover:border-pink-500 transition-colors" onClick={() => copyCode(coupon.code)}>
                                    <span className="text-lg font-mono font-black text-white tracking-widest">{coupon.code}</span>
                                    <Copy className="w-3 h-3 text-gray-500" />
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${coupon.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{coupon.status}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-4xl font-black text-pink-500">{coupon.discount}%</span>
                                <div className="flex flex-col"><span className="text-xs font-bold text-white uppercase">OFF</span><span className="text-[10px] text-gray-500">Desconto</span></div>
                            </div>
                            <div className="space-y-2 text-xs text-gray-400 border-t border-gray-700/50 pt-4 border-dashed">
                                <div className="flex justify-between"><span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> Produto:</span><span className="text-white font-medium">{coupon.product}</span></div>
                                <div className="flex justify-between"><span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Usos:</span><span className="text-white font-medium">{coupon.uses} / {coupon.limit === null ? '∞' : coupon.limit}</span></div>
                                <div className="flex justify-between"><span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Expira em:</span><span className="text-white font-medium">{new Date(coupon.expiration).toLocaleDateString()}</span></div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-end">
                                <button onClick={() => handleDelete(coupon.id)} className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-900/10 transition-colors"><Trash className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-gray-800 w-full max-w-lg rounded-2xl border border-pink-500/30 shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <PlusCircle className="w-6 h-6 text-pink-500" /> Criar Cupom
                            </h3>
                            <button onClick={() => setIsModalOpen(false)}><Trash className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Código" value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} className="!uppercase font-mono" />
                                <Input label="Desconto (%)" type="number" value={newCoupon.discount} onChange={e => setNewCoupon({ ...newCoupon, discount: Number(e.target.value) })} />
                            </div>
                            <Input label="Expiração" type="date" value={newCoupon.expiration} onChange={e => setNewCoupon({ ...newCoupon, expiration: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Limite</label><input type="number" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none" value={newCoupon.limit || ''} onChange={e => setNewCoupon({ ...newCoupon, limit: e.target.value ? Number(e.target.value) : null })} placeholder="Vazio = Ilimitado" /></div>
                                <div><label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Produto</label><select className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none" value={newCoupon.product} onChange={e => setNewCoupon({ ...newCoupon, product: e.target.value })}><option>Todos</option><option>Mestre 15X</option></select></div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8 pt-4 border-t border-gray-700">
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button>
                            <Button onClick={handleSave} className="flex-1 !bg-pink-600 hover:!bg-pink-500 font-bold">Salvar Cupom</Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

// --- ABA 4: REGRAS GERAIS ---
const GeneralRulesTab: React.FC = () => (
    <div className="space-y-6 animate-fade-in">
        <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" /> Regras Globais de Consumo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Créditos Gratuitos (Recorrência)</label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input type="number" placeholder="0" defaultValue="5" />
                            </div>
                            <select className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm outline-none">
                                <option>Diário</option>
                                <option>Semanal</option>
                                <option>Mensal</option>
                                <option>Único (Cadastro)</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl">
                    <h4 className="text-blue-300 font-bold text-sm mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4" /> Proteção Financeira (Nexus Guard)
                    </h4>
                    <p className="text-xs text-blue-200 leading-relaxed">
                        O sistema Nexus IA monitora o uso em tempo real. Se o custo da API exceder a margem definida no combo, a ferramenta será temporariamente limitada para evitar prejuízo.
                    </p>
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <Button className="!bg-green-600 hover:!bg-green-500 font-bold">Salvar Regras</Button>
            </div>
        </Card>
    </div>
);

// --- ABA 5: PLANOS & BI (Nexus CFO & Modular) ---
const PlansBiTab: React.FC = () => {
    // Estado do Produto/Contexto
    const [context, setContext] = useState<'global' | string>('global');
    const [products, setProducts] = useState<AppProduct[]>([]);

    // Estado dos Planos
    const [activeTier, setActiveTier] = useState<'basic' | 'pro' | 'elite'>('basic');
    const [plans, setPlans] = useState<PlansState>(INITIAL_PLAN_STATE);

    // Estado da Matriz de Features (Modular)
    const [expandedModule, setExpandedModule] = useState<string | null>('mestre_ia');

    useEffect(() => {
        getAppProducts().then(setProducts);
    }, []);

    const currentPlan = plans[activeTier];

    // Nexus CFO Logic (Real-time Calculation)
    const calculateFinancials = useMemo(() => {
        // Base Infrastructure Cost
        let baseCost = 15.00;

        // Feature Costs (Dynamic based on selected tools in the Matrix)
        let activeToolsCost = 0;
        SYSTEM_MODULES.forEach(mod => {
            mod.tools.forEach(tool => {
                if (currentPlan.activeFeatures.includes(tool.id)) {
                    // Estimated usage cost per active user/tool
                    // Assume 10 uses per month per active tool as a baseline for risk calculation
                    activeToolsCost += (tool.cost * 10);
                }
            });
        });

        // AI Cost Calculation Adjustment
        const aiCost = (currentPlan.credits * 0.10);

        const totalCost = baseCost + activeToolsCost + aiCost;
        const margin = currentPlan.price - totalCost;
        const marginPercent = currentPlan.price > 0 ? (margin / currentPlan.price) * 100 : 0;

        let status: 'healthy' | 'risk' | 'loss' = 'healthy';
        if (marginPercent < 20) status = 'risk';
        if (marginPercent < 0) status = 'loss';

        const suggestedPrice = totalCost * 3; // Ideal SaaS markup

        return { totalCost, margin, marginPercent, status, suggestedPrice, aiCost, activeToolsCost };
    }, [currentPlan]);

    const handleUpdatePlan = (field: keyof PlanConfig, value: any) => {
        setPlans(prev => ({
            ...prev,
            [activeTier]: { ...prev[activeTier], [field]: value }
        }));
    };

    const toggleFeature = (featureId: string) => {
        setPlans(prev => {
            const currentFeatures = prev[activeTier].activeFeatures;
            const newFeatures = currentFeatures.includes(featureId)
                ? currentFeatures.filter(id => id !== featureId)
                : [...currentFeatures, featureId];
            return {
                ...prev,
                [activeTier]: { ...prev[activeTier], activeFeatures: newFeatures }
            };
        });
    };

    const toggleModuleAll = (moduleId: string, enable: boolean) => {
        const module = SYSTEM_MODULES.find(m => m.id === moduleId);
        if (!module) return;

        const toolIds = module.tools.map(t => t.id);

        setPlans(prev => {
            let currentFeatures = [...prev[activeTier].activeFeatures];
            if (enable) {
                // Add all missing
                toolIds.forEach(id => {
                    if (!currentFeatures.includes(id)) currentFeatures.push(id);
                });
            } else {
                // Remove all
                currentFeatures = currentFeatures.filter(id => !toolIds.includes(id));
            }
            return {
                ...prev,
                [activeTier]: { ...prev[activeTier], activeFeatures: currentFeatures }
            };
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left: Configuration (Admin Architect) */}
            <div className="lg:col-span-2 space-y-6">

                {/* Context Selector */}
                <Card className="p-4 bg-gray-800 border-gray-700 flex items-center justify-between">
                    <div>
                        <h4 className="text-white font-bold flex items-center gap-2">
                            <Filter className="w-4 h-4 text-brand-primary" /> Contexto do Produto
                        </h4>
                        <p className="text-xs text-gray-400">Personalize o acesso às ferramentas para cada curso.</p>
                    </div>
                    <select
                        className="bg-gray-900 border border-gray-600 rounded-lg p-2 text-white text-sm outline-none min-w-[200px]"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                    >
                        <option value="global">Global (Padrão do Sistema)</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </Card>

                <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700">
                    {(['basic', 'pro', 'elite'] as const).map(tier => (
                        <button
                            key={tier}
                            onClick={() => setActiveTier(tier)}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 ${activeTier === tier
                                ? `bg-gray-700 text-white shadow-lg ${tier === 'elite' ? 'border-b-2 border-yellow-500' : tier === 'pro' ? 'border-b-2 border-blue-500' : 'border-b-2 border-gray-500'}`
                                : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {tier === 'elite' && <Crown className="w-4 h-4 text-yellow-500" />}
                            {tier === 'pro' && <Star className="w-4 h-4 text-blue-500" />}
                            {tier === 'basic' && <ShieldCheck className="w-4 h-4 text-gray-500" />}
                            {tier}
                        </button>
                    ))}
                </div>

                <Card className="p-6 bg-gray-800 border-gray-700">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gray-400" /> Configuração do Plano {activeTier.toUpperCase()}
                    </h3>

                    <div className="space-y-8">
                        {/* Price & Credits */}
                        <div className="grid grid-cols-2 gap-6">
                            <Input
                                label="Preço de Venda (R$)"
                                type="number"
                                value={currentPlan.price}
                                onChange={e => handleUpdatePlan('price', parseFloat(e.target.value))}
                                className="!bg-gray-900"
                            />
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex justify-between">
                                    Créditos Mensais (Token) <span>{currentPlan.credits}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="5000"
                                    step="50"
                                    value={currentPlan.credits}
                                    onChange={e => handleUpdatePlan('credits', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                />
                            </div>
                        </div>

                        {/* Feature Matrix (Modular) */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-sm font-bold text-white uppercase">Gestor de Acesso Modular</label>
                                <p className="text-[10px] text-gray-500">Selecione quais ferramentas este plano acessa.</p>
                            </div>

                            <div className="space-y-3">
                                {SYSTEM_MODULES.map(module => {
                                    const activeToolsInModule = module.tools.filter(t => currentPlan.activeFeatures.includes(t.id)).length;
                                    const allActive = activeToolsInModule === module.tools.length;
                                    const isExpanded = expandedModule === module.id;

                                    return (
                                        <div key={module.id} className={`border rounded-xl transition-all ${isExpanded ? 'bg-gray-900/50 border-brand-primary/30' : 'bg-gray-900 border-gray-700'}`}>
                                            <div
                                                className="p-4 flex items-center justify-between cursor-pointer"
                                                onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${isExpanded ? 'bg-brand-primary/20' : 'bg-gray-800'}`}>
                                                        {module.icon}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{module.label}</p>
                                                        <p className="text-[10px] text-gray-500">{module.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${activeToolsInModule > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                                                        {activeToolsInModule}/{module.tools.length} Ativos
                                                    </span>
                                                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="border-t border-gray-700 p-4"
                                                    >
                                                        <div className="flex justify-end mb-3">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); toggleModuleAll(module.id, !allActive); }}
                                                                className="text-xs text-brand-primary hover:underline font-bold"
                                                            >
                                                                {allActive ? 'Desmarcar Todos' : 'Selecionar Todos'}
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {module.tools.map(tool => (
                                                                <label
                                                                    key={tool.id}
                                                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${currentPlan.activeFeatures.includes(tool.id)
                                                                        ? 'bg-blue-900/20 border-blue-500/50'
                                                                        : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${currentPlan.activeFeatures.includes(tool.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-500'}`}>
                                                                            {currentPlan.activeFeatures.includes(tool.id) && <CheckCircle className="w-3 h-3 text-white" />}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className={`text-sm ${currentPlan.activeFeatures.includes(tool.id) ? 'text-white' : 'text-gray-400'}`}>{tool.label}</span>
                                                                            <input type="checkbox" className="hidden" checked={currentPlan.activeFeatures.includes(tool.id)} onChange={() => toggleFeature(tool.id)} />
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-[10px] text-gray-500 font-mono">
                                                                        Custo: R$ {tool.cost.toFixed(2)}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Right: Nexus CFO (Financial Simulation) */}
            <div className="lg:col-span-1">
                <Card className={`h-full p-6 border-l-4 relative overflow-hidden transition-all duration-500 sticky top-6 ${calculateFinancials.status === 'healthy' ? 'border-l-green-500 bg-gray-800' :
                    calculateFinancials.status === 'risk' ? 'border-l-yellow-500 bg-gray-800' : 'border-l-red-500 bg-red-900/10'
                    }`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <h3 className="text-lg font-black text-white uppercase flex items-center gap-2 mb-6">
                            <Brain className="w-6 h-6 text-brand-primary" /> Nexus CFO
                        </h3>

                        <div className="space-y-6">
                            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                                <p className="text-gray-400 text-xs font-bold uppercase mb-2">Custo Operacional (Por Aluno)</p>
                                <p className="text-3xl font-black text-white">R$ {calculateFinancials.totalCost.toFixed(2)}</p>
                                <div className="mt-2 text-[10px] text-gray-500 space-y-1">
                                    <div className="flex justify-between"><span>Infra Base:</span> <span>R$ 15.00</span></div>
                                    <div className="flex justify-between"><span>Ferramentas Ativas (Risco):</span> <span className="text-yellow-500">R$ {calculateFinancials.activeToolsCost.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>Créditos Tokens:</span> <span>R$ {calculateFinancials.aiCost.toFixed(2)}</span></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400 uppercase font-bold">Margem Líquida</span>
                                    <span className={`font-bold ${calculateFinancials.status === 'healthy' ? 'text-green-400' : calculateFinancials.status === 'risk' ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {calculateFinancials.marginPercent.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.max(0, Math.min(100, calculateFinancials.marginPercent))}%` }}
                                        className={`h-full ${calculateFinancials.status === 'healthy' ? 'bg-green-500' : calculateFinancials.status === 'risk' ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    />
                                </div>
                                <p className="text-right text-xs font-bold text-white mt-1">Lucro: R$ {calculateFinancials.margin.toFixed(2)} / venda</p>
                            </div>

                            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                                <p className="text-[10px] font-bold text-blue-300 uppercase mb-2 flex items-center gap-1">
                                    <Zap className="w-3 h-3" /> Conselho Estratégico
                                </p>
                                <p className="text-xs text-blue-100 italic leading-relaxed">
                                    {calculateFinancials.status === 'healthy' ?
                                        "Configuração equilibrada. O mix de ferramentas entrega valor sem comprometer a margem." :
                                        calculateFinancials.status === 'risk' ?
                                            `Margem arriscada. Você ativou ferramentas caras (ex: Vídeo) para um plano barato. Sugiro aumentar o preço para R$ ${calculateFinancials.suggestedPrice.toFixed(2)}.` :
                                            "CRÍTICO: Prejuízo projetado. Desative ferramentas pesadas como 'Geração de Vídeo' ou 'WhatsApp API' deste plano imediatamente."}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

// --- ABA 6: SOLICITAÇÕES DE CRÉDITO (FEEDBACK LOOP) ---
const RequestsTab: React.FC = () => {
    const [requests, setRequests] = useState<CreditRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<CreditRequest | null>(null);
    const [feedback, setFeedback] = useState('');
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        const data = await getPendingCreditRequests();
        setRequests(data);
        setLoading(false);
    };

    const handleProcessRequest = async () => {
        if (!selectedRequest || !action || !feedback) return toast.error("Por favor, forneça um motivo/feedback.");

        const status = action === 'approve' ? 'approved' : 'rejected';
        await respondToCreditRequest(selectedRequest.id, status, feedback);

        toast.success(status === 'approved' ? "Solicitação aprovada!" : "Solicitação rejeitada.");
        setSelectedRequest(null);
        setAction(null);
        setFeedback('');
        loadRequests();
    };

    return (
        <div className="animate-fade-in space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" /> Solicitações Pendentes
                </h3>

                {loading ? <LoadingSpinner /> : requests.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Nenhuma solicitação pendente.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.map(req => (
                            <div key={req.id} className="bg-gray-900 border border-gray-700 rounded-xl p-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-50 text-[10px] text-gray-400 font-mono">
                                    {new Date(req.requestedAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                        {req.producerName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{req.producerName}</p>
                                        <p className="text-xs text-gray-400">ID: {req.producerId}</p>
                                    </div>
                                </div>

                                <div className="my-4 py-3 border-y border-gray-800">
                                    <p className="text-2xl font-black text-brand-primary">{req.amount} <span className="text-sm font-normal text-gray-500">créditos</span></p>
                                    <p className="text-xs text-gray-300 mt-2 bg-gray-800 p-2 rounded italic">"{req.reason}"</p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => { setSelectedRequest(req); setAction('reject'); }}
                                        className="flex-1 !bg-red-900/30 hover:!bg-red-900/50 !text-red-400 !border !border-red-900/50"
                                    >
                                        Rejeitar
                                    </Button>
                                    <Button
                                        onClick={() => { setSelectedRequest(req); setAction('approve'); }}
                                        className="flex-1 !bg-green-600 hover:!bg-green-500"
                                    >
                                        Aprovar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Modal de Feedback */}
            {selectedRequest && action && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-gray-800 w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl p-6">
                        <h3 className={`text-xl font-bold mb-2 ${action === 'approve' ? 'text-green-400' : 'text-red-400'}`}>
                            {action === 'approve' ? 'Aprovar Solicitação' : 'Rejeitar Solicitação'}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            {action === 'approve'
                                ? `Você está prestes a adicionar ${selectedRequest.amount} créditos para ${selectedRequest.producerName}.`
                                : `Você está rejeitando a solicitação de ${selectedRequest.producerName}.`}
                        </p>

                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-300 uppercase mb-2 block">
                                {action === 'approve' ? 'Observação / Feedback (Opcional)' : 'Motivo da Rejeição (Obrigatório)'}
                            </label>
                            <textarea
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white text-sm outline-none focus:border-brand-primary min-h-[100px]"
                                placeholder={action === 'approve' ? "Ex: Aprovado conforme acordo..." : "Ex: Saldo insuficiente por..."}
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button variant="secondary" onClick={() => { setSelectedRequest(null); setAction(null); setFeedback(''); }}>Cancelar</Button>
                            <Button
                                onClick={handleProcessRequest}
                                className={action === 'approve' ? '!bg-green-600 hover:!bg-green-500' : '!bg-red-600 hover:!bg-red-500'}
                            >
                                Confirmar {action === 'approve' ? 'Aprovação' : 'Rejeição'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const PricesCreditsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('combos');

    const TABS = [
        { id: 'combos', label: 'Combos de Venda', icon: <Box className="w-4 h-4" /> },
        { id: 'tools', label: 'Custo Ferramentas', icon: <Calculator className="w-4 h-4" /> },
        { id: 'plans', label: 'Planos & BI (Nexus)', icon: <TrendingUp className="w-4 h-4" /> }, // New Tab
        { id: 'promotions', label: 'Ofertas & Cupons', icon: <Percent className="w-4 h-4" /> },
        { id: 'requests', label: 'Solicitações', icon: <FileText className="w-4 h-4" /> },
        { id: 'rules', label: 'Regras Gerais', icon: <Settings className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-6 animate-fade-in w-full pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
                        <Coins className="w-8 h-8 text-green-400" /> Preços e Créditos
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Gestão financeira, precificação de IA e inteligência de negócios.</p>
                </div>
            </div>

            <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700 w-full overflow-x-auto custom-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-4 py-3 rounded-lg text-xs md:text-sm font-bold uppercase transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === tab.id
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'combos' && <CombosTab />}
                        {activeTab === 'tools' && <ToolPricingTab />}
                        {activeTab === 'plans' && <PlansBiTab />}
                        {activeTab === 'promotions' && <PromotionsTab />}
                        {activeTab === 'requests' && <RequestsTab />}
                        {activeTab === 'rules' && <GeneralRulesTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PricesCreditsView;
