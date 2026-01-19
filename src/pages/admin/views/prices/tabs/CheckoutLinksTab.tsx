
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../../../components/Card';
import Button from '../../../../../components/Button';
import Input from '../../../../../components/Input';
import {
    Link as LinkIcon, PlusCircle, Trash, CreditCard, Zap,
    FileText, ShoppingBag, CheckCircle, LockClosed, Settings,
    ShieldCheck, Activity, DollarSign, Users, PieChart
} from '../../../../../components/Icons';
import { CreditCombo } from '../../../../../types';
import { getCreditCombos, getAdminIntegrations } from '../../../../../services/mockFirebase';
import toast from 'react-hot-toast';

// Mock de taxas base dos gateways (Simulando importação da API)
const GATEWAY_FEES: Record<string, { percent: number, fixed: number }> = {
    'InfinitePay': { percent: 0.7, fixed: 0 },
    'Mercado Pago': { percent: 3.99, fixed: 0.50 },
    'Asaas': { percent: 1.99, fixed: 0.0 }, // Boleto barato
    'Appmax': { percent: 2.5, fixed: 1.0 },
    'Pagar.me': { percent: 3.0, fixed: 0.90 },
    'Stripe': { percent: 2.9, fixed: 0.30 }, // Padrão internacional
};

export const CheckoutLinksTab: React.FC = () => {
    const [combos, setCombos] = useState<CreditCombo[]>([]);
    const [selectedComboId, setSelectedComboId] = useState<string | null>(null);
    const [editingCombo, setEditingCombo] = useState<CreditCombo & { stripePaymentLink?: string } | null>(null); // Extended Type

    // Routing state for Native Checkout
    const [nativeRouting, setNativeRouting] = useState({
        active: true,
        pixGateway: 'Stripe',
        cardGateway: 'Stripe',
        boletoGateway: 'Stripe'
    });

    // Platform Fee Config (O lucro do SaaS)
    const [platformFees, setPlatformFees] = useState({
        percent: 10, // 10%
        fixed: 1.00  // + R$ 1.00
    });

    // Simulador de Split
    const simulationAmount = 100.00;

    useEffect(() => {
        getCreditCombos().then(setCombos);
    }, []);

    const handleSelectCombo = (combo: CreditCombo) => {
        setSelectedComboId(combo.id);
        // Simulate fetching extra metadata like payment link
        const existingLink = localStorage.getItem(`stripe_link_${combo.id}`) || '';
        // Initialize DRAFT with EXISTING (Published) link so they match initially
        setEditingCombo({ ...combo, paymentMethods: combo.paymentMethods || [], stripePaymentLink: existingLink });
    };

    const handleToggleNative = () => {
        setNativeRouting(prev => ({ ...prev, active: !prev.active }));
        toast.success(nativeRouting.active ? "Checkout Nativo Desativado" : "Checkout Nativo Ativado Globalmente");
    };

    // Cálculo do Split Simulator
    const splitSimulation = useMemo(() => {
        // Usa o gateway de cartão como base para o exemplo
        const currentGateway = nativeRouting.cardGateway;
        const baseFees = GATEWAY_FEES[currentGateway] || { percent: 2.99, fixed: 0.50 };

        // Custo do Gateway (Custo)
        const gatewayCost = (simulationAmount * (baseFees.percent / 100)) + baseFees.fixed;

        // Taxa da Plataforma (Revenue)
        const platformRevenue = (simulationAmount * (platformFees.percent / 100)) + platformFees.fixed;

        // Comissão Afiliado (Exemplo fixo de 20%)
        const affiliateCommission = simulationAmount * 0.20;

        // Net para o Produtor
        const producerNet = simulationAmount - gatewayCost - platformRevenue - affiliateCommission;

        return {
            gatewayCost,
            platformRevenue,
            affiliateCommission,
            producerNet,
            baseFees
        };
    }, [nativeRouting.cardGateway, platformFees]);

    return (
        <div className="animate-fade-in flex flex-col gap-8 pb-10">
            {/* GLOBAL ROUTING CONFIG */}
            <div className="relative">
                <Card className="p-8 bg-gray-800 border-gray-700 shadow-2xl relative overflow-visible z-10">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500 rounded-l-xl"></div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <Settings className="w-6 h-6 text-green-400" /> Roteamento Inteligente (Checkout Nativo)
                            </h3>
                            <p className="text-gray-400 text-sm mt-1 max-w-2xl">
                                Configure qual gateway processa cada método. As taxas base são importadas automaticamente da API do Gateway.
                            </p>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer bg-gray-900 p-3 rounded-xl border border-gray-600 hover:border-green-500 transition-colors shadow-lg">
                            <span className="text-sm font-bold text-white uppercase">Checkout Nativo</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={nativeRouting.active}
                                    onChange={handleToggleNative}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </div>
                        </label>
                    </div>

                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300 ${!nativeRouting.active ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                        {/* ROTA PIX */}
                        <div className="bg-gray-900/80 p-5 rounded-2xl border border-gray-600 shadow-inner flex flex-col gap-2">
                            <div className="flex items-center gap-2 mb-2 text-yellow-400 font-bold uppercase text-xs tracking-wider">
                                <Zap className="w-4 h-4" /> Rota PIX
                            </div>
                            <select
                                className="w-full bg-gray-800 text-white text-sm border border-gray-600 rounded-lg p-3 outline-none focus:border-yellow-500 transition-colors cursor-pointer"
                                value={nativeRouting.pixGateway}
                                onChange={(e) => {
                                    setNativeRouting({ ...nativeRouting, pixGateway: e.target.value });
                                    toast.success(`PIX roteado para ${e.target.value}`);
                                }}
                            >
                                {Object.keys(GATEWAY_FEES).map(gw => <option key={gw} value={gw}>{gw}</option>)}
                            </select>
                            <p className="text-[10px] text-gray-500 mt-1">Taxa Base: {(GATEWAY_FEES[nativeRouting.pixGateway]?.percent || 0)}% (Importado)</p>
                        </div>

                        {/* ROTA CARTÃO */}
                        <div className="bg-gray-900/80 p-5 rounded-2xl border border-gray-600 shadow-inner flex flex-col gap-2">
                            <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold uppercase text-xs tracking-wider">
                                <CreditCard className="w-4 h-4" /> Rota Cartão
                            </div>
                            <select
                                className="w-full bg-gray-800 text-white text-sm border border-gray-600 rounded-lg p-3 outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                value={nativeRouting.cardGateway}
                                onChange={(e) => {
                                    setNativeRouting({ ...nativeRouting, cardGateway: e.target.value });
                                    toast.success(`Cartões roteados para ${e.target.value}`);
                                }}
                            >
                                {Object.keys(GATEWAY_FEES).map(gw => <option key={gw} value={gw}>{gw}</option>)}
                            </select>
                            <p className="text-[10px] text-gray-500 mt-1">Taxa Base: {(GATEWAY_FEES[nativeRouting.cardGateway]?.percent || 0)}% + R$ {GATEWAY_FEES[nativeRouting.cardGateway]?.fixed.toFixed(2)}</p>
                        </div>

                        {/* ROTA BOLETO */}
                        <div className="bg-gray-900/80 p-5 rounded-2xl border border-gray-600 shadow-inner flex flex-col gap-2">
                            <div className="flex items-center gap-2 mb-2 text-purple-400 font-bold uppercase text-xs tracking-wider">
                                <FileText className="w-4 h-4" /> Rota Boleto
                            </div>
                            <select
                                className="w-full bg-gray-800 text-white text-sm border border-gray-600 rounded-lg p-3 outline-none focus:border-purple-500 transition-colors cursor-pointer"
                                value={nativeRouting.boletoGateway}
                                onChange={(e) => {
                                    setNativeRouting({ ...nativeRouting, boletoGateway: e.target.value });
                                    toast.success(`Boletos roteados para ${e.target.value}`);
                                }}
                            >
                                {Object.keys(GATEWAY_FEES).map(gw => <option key={gw} value={gw}>{gw}</option>)}
                            </select>
                            <p className="text-[10px] text-gray-500 mt-1">Taxa Base: {(GATEWAY_FEES[nativeRouting.boletoGateway]?.percent || 0)}% (Importado)</p>
                        </div>
                    </div>

                    {/* SPLIT & FEES CONFIGURATOR */}
                    <div className="mt-8 border-t border-gray-700 pt-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Inputs */}
                            <div className="w-full md:w-1/3 space-y-4">
                                <h4 className="text-white font-bold flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-brand-primary" /> Configurar Taxas da Plataforma
                                </h4>
                                <p className="text-xs text-gray-400">
                                    Defina sua margem sobre as transações (Application Fee). Isso é adicionado ao custo base do gateway.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Sua Taxa (%)"
                                        type="number"
                                        step="0.1"
                                        value={platformFees.percent}
                                        onChange={e => setPlatformFees({ ...platformFees, percent: parseFloat(e.target.value) || 0 })}
                                        className="!bg-gray-900"
                                    />
                                    <Input
                                        label="Taxa Fixa (R$)"
                                        type="number"
                                        step="0.10"
                                        value={platformFees.fixed}
                                        onChange={e => setPlatformFees({ ...platformFees, fixed: parseFloat(e.target.value) || 0 })}
                                        className="!bg-gray-900"
                                    />
                                </div>
                                <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/20 text-[10px] text-blue-200">
                                    <p><strong>Gateway Selecionado (Cartão):</strong> {nativeRouting.cardGateway}</p>
                                    <p><strong>Custo Base Importado:</strong> {splitSimulation.baseFees.percent}% + R$ {splitSimulation.baseFees.fixed.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Visual Simulator */}
                            <div className="w-full md:w-2/3 bg-gray-900 rounded-2xl border border-gray-700 p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <PieChart className="w-32 h-32 text-white" />
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-white font-bold text-sm uppercase tracking-wider">Simulador de Split Automático</h4>
                                    <span className="text-xs bg-gray-800 px-2 py-1 rounded text-white font-mono">Exemplo: R$ 100,00</span>
                                </div>

                                {/* Progress Bar Visualization */}
                                <div className="w-full h-8 bg-gray-800 rounded-full flex overflow-hidden mb-4 border border-gray-600">
                                    <div className="h-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white relative group" style={{ width: `${(splitSimulation.gatewayCost / simulationAmount) * 100}%` }}>
                                        <span className="truncate px-1">Gateway</span>
                                        <div className="absolute bottom-full mb-1 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">Custo: R$ {splitSimulation.gatewayCost.toFixed(2)}</div>
                                    </div>
                                    <div className="h-full bg-brand-primary flex items-center justify-center text-[10px] font-bold text-black relative group" style={{ width: `${(splitSimulation.platformRevenue / simulationAmount) * 100}%` }}>
                                        <span className="truncate px-1">Plat.</span>
                                        <div className="absolute bottom-full mb-1 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">Sua Receita: R$ {splitSimulation.platformRevenue.toFixed(2)}</div>
                                    </div>
                                    <div className="h-full bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white relative group" style={{ width: `${(splitSimulation.affiliateCommission / simulationAmount) * 100}%` }}>
                                        <span className="truncate px-1">Afil.</span>
                                        <div className="absolute bottom-full mb-1 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">Afiliado (20%): R$ {splitSimulation.affiliateCommission.toFixed(2)}</div>
                                    </div>
                                    <div className="h-full bg-green-500 flex items-center justify-center text-[10px] font-bold text-black flex-1 relative group">
                                        <span className="truncate px-1">Produtor</span>
                                        <div className="absolute bottom-full mb-1 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">Produtor: R$ {splitSimulation.producerNet.toFixed(2)}</div>
                                    </div>
                                </div>

                                {/* Legend / Details */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div className="bg-red-500/10 p-2 rounded border border-red-500/30">
                                        <p className="text-[9px] text-red-300 uppercase font-bold">Custo Gateway</p>
                                        <p className="text-sm font-black text-red-500">- R$ {splitSimulation.gatewayCost.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-brand-primary/10 p-2 rounded border border-brand-primary/30">
                                        <p className="text-[9px] text-yellow-600 uppercase font-bold">Sua Receita</p>
                                        <p className="text-sm font-black text-brand-primary">+ R$ {splitSimulation.platformRevenue.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-purple-500/10 p-2 rounded border border-purple-500/30">
                                        <p className="text-[9px] text-purple-300 uppercase font-bold">Afiliado (20%)</p>
                                        <p className="text-sm font-black text-purple-400">R$ {splitSimulation.affiliateCommission.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-green-500/10 p-2 rounded border border-green-500/30">
                                        <p className="text-[9px] text-green-300 uppercase font-bold">Produtor (Liq)</p>
                                        <p className="text-sm font-black text-green-400">R$ {splitSimulation.producerNet.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px]">
                {/* Left Column: Combo List */}
                <Card className="lg:col-span-1 p-0 overflow-hidden bg-gray-800 border-gray-700 flex flex-col h-full shadow-lg">
                    <div className="p-5 border-b border-gray-700 bg-gray-900/80">
                        <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2 tracking-wider">
                            <ShoppingBag className="w-4 h-4 text-brand-primary" /> Produtos (Combos)
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar max-h-[500px]">
                        {combos.map(combo => (
                            <div
                                key={combo.id}
                                onClick={() => handleSelectCombo(combo)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${selectedComboId === combo.id
                                    ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_15px_rgba(250,204,21,0.1)]'
                                    : 'bg-gray-900/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800'
                                    }`}
                            >
                                <span className={`text-sm font-bold ${selectedComboId === combo.id ? 'text-white' : 'text-gray-300'}`}>{combo.name}</span>
                                <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                                    R$ {combo.price.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Right Column: Generated Links View */}
                <Card className="lg:col-span-2 p-8 bg-gray-800 border-gray-700 flex flex-col h-full shadow-lg relative overflow-hidden">
                    {editingCombo ? (
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-700 pb-6 gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                                            <ShoppingBag className="w-5 h-5 text-brand-primary" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white">{editingCombo.name}</h3>
                                    </div>
                                    <p className="text-xs text-gray-400 ml-1">Gerenciamento de Links de Checkout</p>
                                </div>
                                <div className="bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-green-400 text-xs font-bold uppercase">Ativo</span>
                                </div>
                            </div>

                            <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-600 mb-6 shadow-inner">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500 border border-green-500/20">
                                        <LinkIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-white font-bold text-sm block">Link Único (Checkout Nativo)</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Roteamento Automático</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="bg-black/40 border border-gray-600 rounded-xl p-3 flex items-center justify-between group hover:border-brand-primary/50 transition-colors w-full flex-1 relative">
                                        <div className="relative w-full">
                                            <Input
                                                label="Link de Pagamento Stripe (Rascunho)"
                                                placeholder="https://buy.stripe.com/..."
                                                value={editingCombo.stripePaymentLink || ''} // Uses DRAFT value from state
                                                onChange={(e) => {
                                                    const newLink = e.target.value;
                                                    setEditingCombo({ ...editingCombo, stripePaymentLink: newLink });
                                                    // Only update DRAFT state, do NOT save to localStorage yet
                                                }}
                                                className="!bg-transparent !border-none !p-0 !text-blue-300 md:!text-sm !text-xs w-full focus:ring-0"
                                            />
                                            {/* Visual HINT if Draft differs from Published (Simulated check) */}
                                            {editingCombo.stripePaymentLink !== (localStorage.getItem(`stripe_link_${editingCombo.id}`) || '') && (
                                                <span className="absolute right-0 top-0 text-[10px] text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                                                    Não Publicado
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2 justify-center"
                                            onClick={() => {
                                                if (editingCombo.stripePaymentLink) {
                                                    window.open(editingCombo.stripePaymentLink, '_blank');
                                                } else {
                                                    toast.error("Nenhum link configurado.");
                                                }
                                            }}
                                        >
                                            TESTAR
                                        </button>

                                        <button
                                            className="bg-brand-primary hover:bg-yellow-400 text-black px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg flex items-center gap-2 justify-center"
                                            onClick={() => {
                                                if (editingCombo.stripePaymentLink) {
                                                    // PUBLISH ACTION
                                                    localStorage.setItem(`stripe_link_${editingCombo.id}`, editingCombo.stripePaymentLink);
                                                    toast.success("Link PUBLICADO na Loja!");
                                                    // Force re-render to clear "Unpublished" indicator
                                                    setEditingCombo({ ...editingCombo });
                                                } else {
                                                    toast.error("Insira um link para publicar.");
                                                }
                                            }}
                                        >
                                            PUBLICAR
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400 bg-gray-800/50 p-2 rounded-lg w-fit">
                                    <ShieldCheck className="w-3 h-3 text-green-500" />
                                    <span>Define o redirecionamento do botão de compra se o Stripe estiver ativo.</span>
                                </div>
                            </div>

                            <div className="mt-auto bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex gap-3 items-start">
                                <div className="p-1 bg-blue-500/20 rounded-full mt-0.5">
                                    <Activity className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-blue-300 font-bold text-sm mb-1">Como funciona o Roteamento?</p>
                                    <p className="text-blue-100/70 text-xs leading-relaxed">
                                        Quando o cliente acessa este link, o sistema verifica automaticamente a disponibilidade dos gateways.
                                        Se o cliente escolher PIX, a transação é direcionada para <strong>{nativeRouting.pixGateway}</strong>.
                                        Se escolher Cartão, vai para <strong>{nativeRouting.cardGateway}</strong>.
                                        Isso maximiza a aprovação e reduz taxas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-4 border-2 border-gray-700 border-dashed">
                                <ShoppingBag className="w-8 h-8 opacity-30" />
                            </div>
                            <p className="text-sm font-medium">Selecione um produto ao lado para gerenciar os links.</p>
                        </div>
                    )}
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                </Card>
            </div>
        </div>
    );
};
