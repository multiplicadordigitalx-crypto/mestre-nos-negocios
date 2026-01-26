
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Server, Eye, EyeOff, PlusCircle, Mail as MailIcon, ShoppingBag, Trash } from '../../../components/Icons';
import {
    getSmtpConfigs,
    saveSmtpConfig,
    deleteSmtpConfig,
    SmtpConfig
} from '../../../services/integrationService';
import { getAppProducts } from '../../../services/mockFirebase';
import { AppProduct } from '../../../types';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';

export const SmtpView: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
    const [showSecrets, setShowSecrets] = useState(false);
    const [smtpConfigs, setSmtpConfigs] = useState<SmtpConfig[]>([]);
    const [newConfig, setNewConfig] = useState({ host: '', port: '587', user: '', password: '', senderName: '', senderEmail: '', product: '', role: 'general' });
    const [isAdding, setIsAdding] = useState(false);
    const [availableProducts, setAvailableProducts] = useState<AppProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [configs, products] = await Promise.all([
                getSmtpConfigs(),
                getAppProducts()
            ]);
            setSmtpConfigs(configs || []);
            setAvailableProducts(products || []);
        } catch (error) {
            console.error("Error loading SMTP data:", error);
            const toastId = "smtp-load-error";
            if (error instanceof Error && (
                error.message.includes('permission-denied') ||
                error.message.includes('insufficient permissions') ||
                error.message.toLowerCase().includes('permission')
            )) {
                toast.error("Acesso restrito: Sem permissão para ler SMTP", { id: toastId });
            } else {
                toast.error("Erro ao carregar configurações de e-mail", { id: toastId });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!newConfig.host || !newConfig.user || !newConfig.password || !newConfig.product) return toast.error("Preencha Host, Usuário, Senha e Produto.");

        try {
            const newItem: SmtpConfig = {
                id: Date.now().toString(),
                host: newConfig.host,
                port: newConfig.port,
                user: newConfig.user,
                password: newConfig.password,
                senderName: newConfig.senderName,
                senderEmail: newConfig.senderEmail,
                product: newConfig.product,
                status: 'active',
                updatedAt: new Date(),
                role: newConfig.role as any || 'general'
            };
            await saveSmtpConfig(newItem);
            setSmtpConfigs(prev => [...prev, newItem]);
            setNewConfig({ host: '', port: '587', user: '', password: '', senderName: '', senderEmail: '', product: '', role: 'general' });
            setIsAdding(false);
            toast.success("Credenciais SMTP salvas com sucesso!");
        } catch (error) {
            toast.error("Erro ao salvar configuração SMTP");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Remover configuração SMTP?")) {
            try {
                await deleteSmtpConfig(id);
                setSmtpConfigs(prev => prev.filter(c => c.id !== id));
                toast.success("SMTP removido.");
            } catch (error) {
                toast.error("Erro ao remover SMTP.");
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div><h3 className="text-lg font-bold text-white flex items-center gap-2"><Server className="w-5 h-5 text-green-400" /> Configurações de Disparo (SMTP)</h3><p className="text-gray-400 text-xs mt-1">Conecte sua hospedagem de e-mail para disparos transacionais.</p></div>
                <div className="flex gap-2">{isAdmin && (<Button onClick={() => setShowSecrets(!showSecrets)} className="!py-1.5 !px-3 !text-xs !bg-gray-700 hover:!bg-gray-600 text-white flex items-center gap-2">{showSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}{showSecrets ? 'Ocultar Chaves' : 'Ver Chaves'}</Button>)}<Button onClick={() => setIsAdding(true)} className="!py-1.5 !px-3 !text-xs !bg-green-600 hover:!bg-green-500"><PlusCircle className="w-3 h-3 mr-1" /> Novo SMTP</Button></div>
            </div>
            {isAdding && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-gray-900 p-6 rounded-xl border border-green-500/30 mb-4">
                    <h4 className="text-white font-bold text-sm mb-4">Novo Servidor SMTP</h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Finalidade (Role)</label>
                                <select
                                    className="w-full bg-gray-800 border border-gray-600 rounded p-2.5 text-white text-sm outline-none focus:border-green-500"
                                    value={newConfig.role}
                                    onChange={e => setNewConfig({ ...newConfig, role: e.target.value as any })}
                                >
                                    <option value="general">Geral (Padrão)</option>
                                    <option value="marketing">⚡ Marketing (Massa)</option>
                                    <option value="system">🔒 Sistema (Transacional)</option>
                                    <option value="support">🛡️ Suporte</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Vincular ao Produto</label>
                                <select
                                    className="w-full bg-gray-800 border border-gray-600 rounded p-2.5 text-white text-sm outline-none focus:border-green-500"
                                    value={newConfig.product}
                                    onChange={e => setNewConfig({ ...newConfig, product: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {availableProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2"><Input label="Servidor SMTP (Host)" placeholder="ex: smtp.hostinger.com" value={newConfig.host} onChange={e => setNewConfig({ ...newConfig, host: e.target.value })} /></div>
                            <div><Input label="Porta" placeholder="587" value={newConfig.port} onChange={e => setNewConfig({ ...newConfig, port: e.target.value })} /></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="E-mail de Envio (Usuário)" placeholder="contato@seudominio.com" value={newConfig.user} onChange={e => setNewConfig({ ...newConfig, user: e.target.value })} />
                            <Input label="Senha do E-mail" type={showSecrets ? "text" : "password"} placeholder="********" value={newConfig.password} onChange={e => setNewConfig({ ...newConfig, password: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Nome do Remetente" placeholder="Ex: João - Mestre 15X" value={newConfig.senderName} onChange={e => setNewConfig({ ...newConfig, senderName: e.target.value })} />
                            <Input label="E-mail de Resposta" placeholder="suporte@seudominio.com" value={newConfig.senderEmail} onChange={e => setNewConfig({ ...newConfig, senderEmail: e.target.value })} />
                        </div>
                        <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => setIsAdding(false)}>Cancelar</Button><Button onClick={handleSave} className="!bg-green-600 hover:!bg-green-500">Salvar SMTP</Button></div>
                    </div>
                </motion.div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {smtpConfigs.map((conf: any) => (
                    <div key={conf.id} className="bg-gray-900 p-4 rounded-xl border border-gray-700 hover:border-green-500/50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-3"><div className="flex items-center gap-3"><div className="p-2 bg-gray-800 rounded-lg border border-gray-600 font-bold text-gray-300 text-xs"><MailIcon className="w-4 h-4 text-green-400" /></div><div><h4 className="font-bold text-white text-sm">{conf.host}</h4><p className="text-[10px] text-gray-500">{conf.user}</p></div></div><span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold uppercase">Ativo</span></div>
                        <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                            <div className="flex gap-2">
                                <span className="text-[10px] text-brand-primary flex items-center gap-1 bg-brand-primary/10 px-2 rounded"><ShoppingBag className="w-3 h-3" /> {conf.product}</span>
                                <span className={`text-[10px] px-2 rounded flex items-center gap-1 uppercase font-bold border ${conf.role === 'marketing' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                        conf.role === 'system' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            conf.role === 'support' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                'bg-gray-800 text-gray-400 border-gray-700'
                                    }`}>
                                    {conf.role === 'marketing' ? '⚡ MKT' : conf.role === 'system' ? '🔒 SYS' : conf.role === 'support' ? '🛡️ SUP' : 'Geral'}
                                </span>
                            </div>
                            <button onClick={() => handleDelete(conf.id)} className="text-red-400 hover:text-red-300 text-xs"><Trash className="w-3 h-3" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
