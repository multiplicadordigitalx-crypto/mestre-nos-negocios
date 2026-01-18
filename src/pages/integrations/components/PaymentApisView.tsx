
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { CreditCard, PlusCircle, Trash, DollarSign, RefreshCw, Zap, ShieldCheck, Settings } from '../../../components/Icons';
import { getAdminIntegrations, saveAdminIntegration, deleteAdminIntegration } from '../../../services/mockFirebase';
import toast from 'react-hot-toast';

const GATEWAY_OPTIONS = [
    { id: 'infinitepay', name: 'InfinitePay', icon: '🚀', color: 'text-green-400', border: 'border-green-500' },
    { id: 'appmax', name: 'Appmax', icon: '🛒', color: 'text-purple-400', border: 'border-purple-500' },
    { id: 'pagarme', name: 'Pagar.me', icon: '💳', color: 'text-blue-400', border: 'border-blue-500' },
    { id: 'mercadopago', name: 'Mercado Pago', icon: '🤝', color: 'text-blue-300', border: 'border-blue-300' },
    { id: 'asaas', name: 'Asaas', icon: '🏦', color: 'text-yellow-400', border: 'border-yellow-500' },
    { id: 'stripe', name: 'Stripe', icon: 'S', color: 'text-indigo-400', border: 'border-indigo-500' },
];

export const PaymentApisView: React.FC = () => {
    const [gateways, setGateways] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newGateway, setNewGateway] = useState({ provider: 'infinitepay', name: '', apiKey: '', secretKey: '', webhookSecret: '' });
    
    // Routing Configuration
    const [routing, setRouting] = useState({
        pix: 'infinitepay',
        creditCard: 'appmax',
        boleto: 'asaas',
        international: 'stripe'
    });

    useEffect(() => {
        getAdminIntegrations('payment_gateways').then(setGateways);
    }, []);

    const handleAdd = async () => {
        if (!newGateway.name || !newGateway.apiKey) return toast.error("Preencha os campos obrigatórios");
        const newItem = {
            id: Date.now().toString(),
            provider: newGateway.provider,
            name: newGateway.name,
            apiKey: newGateway.apiKey,
            status: 'active',
            volumeProcessed: 0
        };
        await saveAdminIntegration('payment_gateways', newItem);
        setGateways(prev => [...prev, newItem]);
        setIsAdding(false);
        setNewGateway({ provider: 'infinitepay', name: '', apiKey: '', secretKey: '', webhookSecret: '' });
        toast.success("Gateway conectado com sucesso!");
    };

    const handleDelete = async (id: string) => {
        if(confirm("Remover este gateway? Transações em curso podem falhar.")) {
            await deleteAdminIntegration('payment_gateways', id);
            setGateways(prev => prev.filter(g => g.id !== id));
            toast.success("Gateway removido.");
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-green-400"/> Gateways de Pagamento (Split & Processamento)
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">Conecte as APIs bancárias para processar o checkout nativo da plataforma.</p>
                </div>
                <Button onClick={() => setIsAdding(true)} className="!bg-green-600 hover:!bg-green-500">
                    <PlusCircle className="w-4 h-4 mr-2"/> Novo Gateway
                </Button>
            </div>

            {/* Routing Rules (Switch de Pagamentos) */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <h4 className="text-white font-bold mb-4 flex items-center gap-2 relative z-10">
                    <Settings className="w-5 h-5 text-gray-400"/> Regras de Roteamento Inteligente (Checkout Nativo)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        <label className="text-xs text-gray-400 font-bold uppercase mb-2 block flex items-center gap-2">
                            <Zap className="w-3 h-3 text-yellow-400"/> Transações PIX
                        </label>
                        <select 
                            className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm"
                            value={routing.pix}
                            onChange={(e) => setRouting({...routing, pix: e.target.value})}
                        >
                            <option value="infinitepay">InfinitePay (Taxa 0.7%)</option>
                            <option value="mercadopago">Mercado Pago</option>
                            <option value="asaas">Asaas</option>
                        </select>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        <label className="text-xs text-gray-400 font-bold uppercase mb-2 block flex items-center gap-2">
                            <CreditCard className="w-3 h-3 text-blue-400"/> Cartão de Crédito
                        </label>
                        <select 
                            className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm"
                            value={routing.creditCard}
                            onChange={(e) => setRouting({...routing, creditCard: e.target.value})}
                        >
                            <option value="appmax">Appmax (Alta Aprovação)</option>
                            <option value="pagarme">Pagar.me</option>
                            <option value="stripe">Stripe</option>
                        </select>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        <label className="text-xs text-gray-400 font-bold uppercase mb-2 block flex items-center gap-2">
                            <DollarSign className="w-3 h-3 text-green-400"/> Boleto Bancário
                        </label>
                        <select 
                            className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm"
                            value={routing.boleto}
                            onChange={(e) => setRouting({...routing, boleto: e.target.value})}
                        >
                            <option value="asaas">Asaas (Melhor Taxa)</option>
                            <option value="pagarme">Pagar.me</option>
                        </select>
                    </div>
                     <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        <label className="text-xs text-gray-400 font-bold uppercase mb-2 block flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-purple-400"/> Antifraude
                        </label>
                        <select className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" disabled>
                            <option>ClearSale (Integrado)</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button className="!py-2 !text-xs">Salvar Regras de Roteamento</Button>
                </div>
            </div>

            {/* Add Form */}
            {isAdding && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-gray-900 p-6 rounded-xl border border-green-500/30">
                    <h4 className="text-white font-bold mb-4">Adicionar Nova Credencial</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Provedor</label>
                            <div className="grid grid-cols-3 gap-2">
                                {GATEWAY_OPTIONS.map(opt => (
                                    <button 
                                        key={opt.id}
                                        onClick={() => setNewGateway({...newGateway, provider: opt.id})}
                                        className={`p-2 rounded border flex flex-col items-center gap-1 transition-all ${newGateway.provider === opt.id ? `bg-gray-800 ${opt.border} text-white` : 'border-gray-700 text-gray-500 hover:bg-gray-800'}`}
                                    >
                                        <span className="text-xl">{opt.icon}</span>
                                        <span className="text-[10px] font-bold">{opt.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Input label="Nome Interno (ex: Conta PJ 01)" value={newGateway.name} onChange={e => setNewGateway({...newGateway, name: e.target.value})} />
                            <Input label="API Key (Public)" value={newGateway.apiKey} onChange={e => setNewGateway({...newGateway, apiKey: e.target.value})} />
                            <Input label="Secret Key (Private)" type="password" value={newGateway.secretKey} onChange={e => setNewGateway({...newGateway, secretKey: e.target.value})} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="secondary" onClick={() => setIsAdding(false)}>Cancelar</Button>
                        <Button onClick={handleAdd} className="!bg-green-600 hover:!bg-green-500">Conectar Gateway</Button>
                    </div>
                </motion.div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gateways.map(gw => {
                    const opt = GATEWAY_OPTIONS.find(o => o.id === gw.provider) || GATEWAY_OPTIONS[0];
                    return (
                        <div key={gw.id} className="bg-gray-900 border border-gray-700 rounded-xl p-5 hover:border-green-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-gray-800 border ${opt.border}`}>
                                        {opt.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{gw.name}</h4>
                                        <p className="text-[10px] text-gray-500 uppercase">{opt.name}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="bg-green-500/10 text-green-400 text-[9px] px-2 py-1 rounded font-bold border border-green-500/20">ATIVO</span>
                                    <button onClick={() => handleDelete(gw.id)} className="text-gray-600 hover:text-red-400"><Trash className="w-4 h-4"/></button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs bg-black/20 p-2 rounded">
                                <span className="text-gray-500">Processado (24h)</span>
                                <span className="text-white font-mono font-bold">R$ {gw.volumeProcessed?.toLocaleString() || '0,00'}</span>
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500">
                                <RefreshCw className="w-3 h-3"/> Último ping: 2s atrás
                            </div>
                        </div>
                    )
                })}
                 {gateways.length === 0 && <div className="col-span-full text-center py-10 text-gray-500">Nenhum gateway conectado. O checkout nativo não funcionará.</div>}
            </div>
        </div>
    );
};
