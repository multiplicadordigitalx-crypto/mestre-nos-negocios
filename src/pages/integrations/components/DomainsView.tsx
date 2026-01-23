
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Globe, Eye, EyeOff, PlusCircle, CloudUpload, ShoppingBag, Database, Trash } from '../../../components/Icons';
import {
    getDomainProviders,
    saveDomainProvider,
    deleteDomainProvider,
    DomainProvider
} from '../../../services/integrationService';
import { getAppProducts } from '../../../services/mockFirebase';
import { AppProduct } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';

export const DomainsView: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
    const [showSecrets, setShowSecrets] = useState(false);
    const [providers, setProviders] = useState<DomainProvider[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [data, products] = await Promise.all([
                getDomainProviders(),
                getAppProducts()
            ]);
            setProviders(data || []);
            setAvailableProducts(products || []);
        } catch (error) {
            console.error("Error loading domain data:", error);
            const toastId = "domains-load-error";
            if (error instanceof Error && (
                error.message.includes('permission-denied') ||
                error.message.includes('insufficient permissions') ||
                error.message.toLowerCase().includes('permission')
            )) {
                toast.error("Acesso restrito: Sem permissão para ler domínios", { id: toastId });
            } else {
                toast.error("Erro ao carregar dados de domínios", { id: toastId });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const [isAdding, setIsAdding] = useState(false);
    const [newProvider, setNewProvider] = useState({ name: '', type: 'Cloudflare', apiKey: '', zoneId: '', domain: '', product: '' });
    const [availableProducts, setAvailableProducts] = useState<AppProduct[]>([]);

    const handleAddProvider = async () => {
        if (!newProvider.name || !newProvider.apiKey || !newProvider.domain || !newProvider.product) return toast.error("Preencha todos os campos obrigatórios");

        try {
            const newItem: DomainProvider = {
                id: Date.now().toString(),
                name: newProvider.name,
                type: newProvider.type,
                status: 'active',
                domain: newProvider.domain,
                apiKey: newProvider.apiKey,
                zoneId: newProvider.zoneId,
                dnsRecords: 0,
                product: newProvider.product,
                updatedAt: new Date()
            };
            await saveDomainProvider(newItem);
            setProviders(prev => [...prev, newItem]);
            setIsAdding(false);
            setNewProvider({ name: '', type: 'Cloudflare', apiKey: '', zoneId: '', domain: '', product: '' });
            toast.success("Provedor de DNS conectado com sucesso!");
        } catch (error) {
            toast.error("Erro ao salvar provedor de domínio");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Desconectar domínio? Isso pode afetar páginas ativas.")) {
            try {
                await deleteDomainProvider(id);
                setProviders(prev => prev.filter(p => p.id !== id));
                toast.success("Domínio desconectado.");
            } catch (error) {
                toast.error("Erro ao remover domínio.");
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div><h3 className="text-lg font-bold text-white flex items-center gap-2"><Globe className="w-5 h-5 text-blue-400" /> Provedores de Domínio & DNS</h3><p className="text-gray-400 text-xs mt-1">Conecte para permitir que o sistema crie subdomínios automaticamente (Funil & PGS).</p></div>
                <div className="flex gap-2">
                    {isAdmin && (
                        <Button onClick={() => setShowSecrets(!showSecrets)} className="!py-1.5 !px-3 !text-xs !bg-gray-700 hover:!bg-gray-600 text-white flex items-center gap-2">{showSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}{showSecrets ? 'Ocultar Chaves' : 'Ver Chaves'}</Button>
                    )}
                    <Button onClick={() => setIsAdding(true)} className="!py-1.5 !px-3 !text-xs !bg-blue-600 hover:!bg-blue-500"><PlusCircle className="w-3 h-3 mr-1" /> Adicionar Provedor</Button>
                </div>
            </div>
            {isAdding && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-gray-900 p-4 rounded-xl border border-blue-500/30 mb-4">
                    <h4 className="text-white font-bold text-sm mb-3">Nova Conexão DNS</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="md:col-span-2"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Vincular ao Produto (Obrigatório)</label><select className="w-full bg-gray-800 border border-gray-600 rounded p-2.5 text-white text-sm outline-none" value={newProvider.product} onChange={e => setNewProvider({ ...newProvider, product: e.target.value })}><option value="">Selecione...</option>{availableProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
                        <Input label="Nome da Conexão" placeholder="Ex: Minha Cloudflare" value={newProvider.name} onChange={e => setNewProvider({ ...newProvider, name: e.target.value })} />
                        <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Provedor</label><select className="w-full bg-gray-800 border border-gray-600 rounded p-2.5 text-white text-sm outline-none" value={newProvider.type} onChange={e => setNewProvider({ ...newProvider, type: e.target.value })}><option>Cloudflare</option><option>GoDaddy</option><option>Hostinger</option><option>cPanel / WHM</option><option>Route53 (AWS)</option><option>Vercel</option></select></div>
                        <Input label="Domínio Base" placeholder="meusite.com" value={newProvider.domain} onChange={e => setNewProvider({ ...newProvider, domain: e.target.value })} />
                        <Input label="API Key / Token" type={showSecrets ? "text" : "password"} placeholder="Global API Key ou Token" value={newProvider.apiKey} onChange={e => setNewProvider({ ...newProvider, apiKey: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setIsAdding(false)}>Cancelar</Button><Button onClick={handleAddProvider} className="!bg-blue-600 hover:!bg-blue-500">Salvar Conexão</Button></div>
                </motion.div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((prov: any) => (
                    <div key={prov.id} className="bg-gray-900 p-4 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-colors group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <div className="flex items-center gap-3"><div className="p-2 bg-gray-800 rounded-lg border border-gray-600 font-bold text-gray-300 text-xs"><CloudUpload className="w-4 h-4 text-blue-400" /></div><div><h4 className="font-bold text-white text-sm">{prov.name}</h4><p className="text-[10px] text-gray-500">{prov.type} • {prov.domain}</p></div></div>
                            <div className="flex gap-2"><span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${prov.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-700 text-gray-400 border-gray-600'}`}>{prov.status.toUpperCase()}</span></div>
                        </div>
                        <div className="mt-2 mb-3"><span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-1 rounded flex items-center gap-1 w-fit border border-brand-primary/20"><ShoppingBag className="w-3 h-3" /> {prov.product}</span></div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800 relative z-10"><span className="text-xs text-gray-400 flex items-center gap-1"><Database className="w-3 h-3" /> {prov.dnsRecords} Registros DNS</span><button onClick={() => handleDelete(prov.id)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"><Trash className="w-3 h-3" /> Desconectar</button></div>
                    </div>
                ))}
            </div>
        </div>
    );
};
