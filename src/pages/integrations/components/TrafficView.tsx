
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Target, PlusCircle, Facebook, Google, ShoppingBag, Trash, Tiktok } from '../../../components/Icons';
import {
    getTrafficAccounts,
    saveTrafficAccount,
    deleteTrafficAccount,
    TrafficAccount
} from '../../../services/integrationService';
import { getAppProducts } from '../../../services/mockFirebase';
import { AppProduct } from '../../../types';
import toast from 'react-hot-toast';

const PLATFORM_OPTIONS = [
    { id: 'Meta Ads', icon: <Facebook className="w-4 h-4" />, color: 'text-blue-500', border: 'border-blue-500' },
    { id: 'Google Ads', icon: <Google className="w-4 h-4" />, color: 'text-red-500', border: 'border-red-500' },
    { id: 'TikTok Ads', icon: <Tiktok className="w-4 h-4" />, color: 'text-white', border: 'border-gray-400' },
    { id: 'Kwai Ads', icon: <span className="w-4 h-4 font-black flex items-center justify-center">K</span>, color: 'text-orange-500', border: 'border-orange-500' },
    { id: 'Pinterest Ads', icon: <span className="w-4 h-4 font-black flex items-center justify-center">P</span>, color: 'text-red-600', border: 'border-red-600' },
    { id: 'Taboola', icon: <span className="w-4 h-4 font-black flex items-center justify-center">T</span>, color: 'text-blue-800', border: 'border-blue-800' },
];

export const TrafficView: React.FC = () => {
    const [accounts, setAccounts] = useState<TrafficAccount[]>([]);
    const [newAccount, setNewAccount] = useState({ platform: 'Meta Ads', name: '', accountId: '', pixelId: '', conversionId: '', product: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [availableProducts, setAvailableProducts] = useState<AppProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [data, products] = await Promise.all([
                getTrafficAccounts(),
                getAppProducts()
            ]);
            setAccounts(data || []);
            setAvailableProducts(products || []);
        } catch (error) {
            console.error("Error loading traffic data:", error);
            const toastId = "traffic-load-error";
            if (error instanceof Error && (
                error.message.includes('permission-denied') ||
                error.message.includes('insufficient permissions') ||
                error.message.toLowerCase().includes('permission')
            )) {
                toast.error("Acesso restrito: Sem permissão para ler contas de tráfego", { id: toastId });
            } else {
                toast.error("Erro ao carregar contas de tráfego", { id: toastId });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newAccount.name || !newAccount.accountId || !newAccount.product) return toast.error("Preencha os campos obrigatórios");

        try {
            const newItem: TrafficAccount = {
                id: Date.now().toString(),
                name: newAccount.name,
                platform: newAccount.platform,
                accountId: newAccount.accountId,
                pixelId: newAccount.pixelId,
                status: 'active',
                product: newAccount.product,
                updatedAt: new Date()
            };
            await saveTrafficAccount(newItem);
            setAccounts(prev => [...prev, newItem]);
            setNewAccount({ platform: 'Meta Ads', name: '', accountId: '', pixelId: '', conversionId: '', product: '' });
            setIsAdding(false);
            toast.success(`Conta ${newItem.platform} conectada ao Nexus!`);
        } catch (error) {
            toast.error("Erro ao salvar conta de tráfego");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Remover conta de tráfego?")) {
            try {
                await deleteTrafficAccount(id);
                setAccounts(prev => prev.filter(a => String(a.id) !== String(id)));
                toast.success("Conta removida.");
            } catch (error) {
                toast.error("Erro ao remover conta.");
            }
        }
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'Meta Ads': return <Facebook className="w-5 h-5 text-blue-500" />;
            case 'Google Ads': return <Google className="w-5 h-5 text-red-500" />;
            case 'TikTok Ads': return <Tiktok className="w-5 h-5 text-white" />;
            case 'Kwai Ads': return <span className="w-5 h-5 font-black text-orange-500 bg-white rounded-full flex items-center justify-center text-[10px]">K</span>;
            case 'Pinterest Ads': return <span className="w-5 h-5 font-black text-red-600 bg-white rounded-full flex items-center justify-center text-[10px]">P</span>;
            case 'Taboola': return <span className="w-5 h-5 font-black text-blue-800 bg-white rounded-full flex items-center justify-center text-[10px]">T</span>;
            default: return <Target className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-red-500" /> Contas de Tráfego
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">Conecte suas contas de anúncio para leitura de dados e otimização.</p>
                </div>
                <Button onClick={() => setIsAdding(true)} className="!py-1.5 !px-3 !text-xs !bg-red-600 hover:!bg-red-500">
                    <PlusCircle className="w-3 h-3 mr-1" /> Adicionar Conta
                </Button>
            </div>

            {isAdding && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-gray-900 p-4 rounded-xl border border-red-500/30 mb-4">
                    <h4 className="text-white font-bold text-sm mb-3">Nova Conexão de Tráfego</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Vincular ao Produto (Obrigatório)</label>
                            <select className="w-full bg-gray-800 border border-gray-600 rounded p-2.5 text-white text-sm outline-none" value={newAccount.product} onChange={e => setNewAccount({ ...newAccount, product: e.target.value })}>
                                <option value="">Selecione...</option>
                                {availableProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Plataforma</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {PLATFORM_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setNewAccount({ ...newAccount, platform: opt.id })}
                                        className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-bold transition-all ${newAccount.platform === opt.id
                                            ? `bg-gray-800 ${opt.color} ${opt.border} shadow-lg scale-[1.02]`
                                            : 'bg-gray-800/50 border-gray-700 text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        {opt.icon} {opt.id}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Input label="Nome da Conta (Interno)" placeholder="Ex: Conta 01 - Nicho Black" value={newAccount.name} onChange={e => setNewAccount({ ...newAccount, name: e.target.value })} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="ID da Conta (Act ID)" placeholder="Ex: 123456789" value={newAccount.accountId} onChange={e => setNewAccount({ ...newAccount, accountId: e.target.value })} />
                            <Input
                                label={newAccount.platform === 'Google Ads' ? "Conversion ID / Label" : "Pixel ID / Tag ID"}
                                placeholder={newAccount.platform === 'Google Ads' ? "Ex: AW-938..." : "Ex: 8372..."}
                                value={newAccount.pixelId}
                                onChange={e => setNewAccount({ ...newAccount, pixelId: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setIsAdding(false)}>Cancelar</Button>
                            <Button onClick={handleAdd} className="!bg-red-600 hover:!bg-red-500">Conectar API</Button>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts.map(acc => (
                    <div key={acc.id} className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-col justify-between group hover:border-red-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                {getPlatformIcon(acc.platform)}
                                <div>
                                    <h4 className="font-bold text-white text-sm">{acc.name}</h4>
                                    <p className="text-[10px] text-gray-500 font-mono">ID: {acc.accountId}</p>
                                </div>
                            </div>
                            <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold uppercase">Ativa</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3" /> {acc.product}
                            </span>
                            <button onClick={() => handleDelete(acc.id)} className="text-gray-600 hover:text-white text-xs"><Trash className="w-3 h-3" /></button>
                        </div>
                    </div>
                ))}
                {accounts.length === 0 && <div className="col-span-full text-center py-8 text-gray-500 text-sm">Nenhuma conta de tráfego conectada.</div>}
            </div>
        </div>
    );
};
