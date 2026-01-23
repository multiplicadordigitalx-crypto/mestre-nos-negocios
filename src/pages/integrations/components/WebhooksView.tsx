
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Brain, PlusCircle, Trash, ClipboardCopy, ShoppingBag } from '../../../components/Icons';
import {
    getWebhooks,
    saveWebhook,
    deleteWebhook,
    WebhookIntegration
} from '../../../services/integrationService';
import { getAppProducts } from '../../../services/mockFirebase';
import { AppProduct } from '../../../types';
import toast from 'react-hot-toast';
import { WebhookGeneratorModal } from '../modals/WebhookGeneratorModal';

export const WebhooksView: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
    const [integrations, setIntegrations] = useState<WebhookIntegration[]>([]);
    const [newIntegration, setNewIntegration] = useState({ name: '', platform: 'Hotmart', action: 'Liberar Acesso', product: '' });
    const [isCreating, setIsCreating] = useState(false);
    const [availableProducts, setAvailableProducts] = useState<AppProduct[]>([]);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
    }, [isAdmin]);

    const loadData = async () => {
        try {
            const [webhooks, products] = await Promise.all([
                getWebhooks(),
                getAppProducts()
            ]);
            setIntegrations(webhooks || []);
            setAvailableProducts(products || []);
        } catch (error) {
            console.error("Error loading webhooks data:", error);
            const toastId = "webhooks-load-error";
            if (error instanceof Error && (
                error.message.includes('permission-denied') ||
                error.message.includes('insufficient permissions') ||
                error.message.toLowerCase().includes('permission')
            )) {
                toast.error("Acesso restrito: Sem permissão para ler webhooks", { id: toastId });
            } else {
                toast.error("Erro ao carregar webhooks", { id: toastId });
            }
        }
    };

    const handleCreateWebhook = async () => {
        if (!newIntegration.name || !newIntegration.product) return toast.error("Nome e Produto obrigatórios");

        try {
            const newId = Date.now().toString();
            const newItem: WebhookIntegration = {
                id: newId,
                name: newIntegration.name,
                platform: newIntegration.platform,
                status: 'active',
                eventsToday: 0,
                lastEvent: '-',
                url: `https://api.mestre15x.com/wh/${newIntegration.platform.toLowerCase()}/${newId}`,
                action: newIntegration.action,
                product: newIntegration.product,
                updatedAt: new Date()
            };
            await saveWebhook(newItem);
            setIntegrations(prev => [...prev, newItem]);
            setIsCreating(false);
            setNewIntegration({ name: '', platform: 'Hotmart', action: 'Liberar Acesso', product: '' });
            toast.success("Webhook criado com sucesso!");
        } catch (error) {
            toast.error("Erro ao criar webhook no Firestore");
        }
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("Copiado!");
    };

    if (!isAdmin) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Conectores de Plataforma</h3>
                <div className="flex gap-2">
                    <Button onClick={() => setIsGeneratorOpen(true)} className="!py-1.5 !px-3 !text-xs !bg-purple-600 hover:!bg-purple-500 text-white flex items-center gap-1">
                        <Brain className="w-4 h-4" /> Gerar c/ IA
                    </Button>
                    <Button onClick={() => setIsCreating(true)} className="!py-1.5 !px-3 !text-xs !bg-orange-600 hover:!bg-orange-500">
                        <PlusCircle className="w-3 h-3 mr-1" /> Novo Webhook
                    </Button>
                </div>
            </div>

            {isCreating && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-gray-900 p-4 rounded-xl border border-orange-500/30 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Vincular ao Produto (Obrigatório)</label>
                            <select className="w-full bg-gray-800 border border-gray-600 rounded p-2.5 text-white text-sm outline-none" value={newIntegration.product} onChange={e => setNewIntegration({ ...newIntegration, product: e.target.value })}>
                                <option value="">Selecione...</option>
                                {availableProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                            </select>
                        </div>
                        <Input label="Nome" placeholder="Ex: Vendas Produto X" value={newIntegration.name} onChange={e => setNewIntegration({ ...newIntegration, name: e.target.value })} />
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Plataforma</label>
                            <select
                                className="w-full bg-gray-800 border border-gray-600 rounded p-2.5 text-white text-sm outline-none"
                                value={newIntegration.platform}
                                onChange={e => setNewIntegration({ ...newIntegration, platform: e.target.value })}
                            >
                                <option>Hotmart</option>
                                <option>Kiwify</option>
                                <option>Eduzz</option>
                                <option>Monetizze</option>
                                <option>Braip</option>
                                <option>Ticto</option>
                                <option>Kirvano</option>
                                <option>Perfect Pay</option>
                                <option>Pepper</option>
                                <option>Greenn</option>
                                <option>Yampi</option>
                                <option>Doppus</option>
                                <option>Stripe</option>
                                <option>Meta Ads</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancelar</Button>
                        <Button onClick={handleCreateWebhook} className="!bg-orange-600 hover:!bg-orange-500">Criar</Button>
                    </div>
                </motion.div>
            )}

            <div className="space-y-4">
                {integrations.map(int => (
                    <div key={int.id} className="bg-gray-900 p-4 rounded-xl border border-gray-700 hover:border-orange-500/50 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-800 rounded-lg border border-gray-600 font-bold text-gray-300 text-xs">{int.platform.slice(0, 2).toUpperCase()}</div>
                                <div><h4 className="font-bold text-white text-sm">{int.name}</h4><p className="text-[10px] text-gray-500">Último evento: {int.lastEvent}</p></div>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30 font-bold">ATIVO</span>
                                <button
                                    onClick={() => {
                                        if (confirm("Deletar?")) {
                                            deleteWebhook(int.id).then(() => {
                                                setIntegrations(prev => prev.filter(i => i.id !== int.id));
                                                toast.success("Webhook deletado.");
                                            });
                                        }
                                    }}
                                    className="text-gray-600 hover:text-red-400"
                                >
                                    <Trash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="mt-2 mb-3"><span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-1 rounded flex items-center gap-1 w-fit border border-brand-primary/20"><ShoppingBag className="w-3 h-3" /> {int.product}</span></div>
                        <div className="flex items-center justify-between bg-black/30 p-2 rounded border border-gray-700/50"><code className="text-xs text-gray-400 font-mono truncate mr-2">{int.url}</code><button onClick={() => copyUrl(int.url)} className="text-orange-400 hover:text-orange-300 text-[10px] font-bold flex items-center gap-1"><ClipboardCopy className="w-3 h-3" /> COPIAR</button></div>
                    </div>
                ))}
            </div>

            <WebhookGeneratorModal isOpen={isGeneratorOpen} onClose={() => setIsGeneratorOpen(false)} />
        </div>
    );
};
