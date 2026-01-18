
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Card from '../../../components/Card';
import { Share2, Eye, EyeOff, PlusCircle, X as XIcon, Trash, Youtube, Tiktok, Instagram, Facebook, LockClosed } from '../../../components/Icons';
import { getAdminIntegrations, saveAdminIntegration, deleteAdminIntegration } from '../../../services/mockFirebase';
import { SocialApiIntegration } from '../../../types';
import toast from 'react-hot-toast';

export const SocialApisView: React.FC<{ isAdmin?: boolean }> = ({ isAdmin }) => {
    const [integrations, setIntegrations] = useState<SocialApiIntegration[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [showSecrets, setShowSecrets] = useState(false);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState<Partial<SocialApiIntegration>>({
        platform: 'YouTube',
        name: '',
        clientId: '',
        clientSecret: '',
        apiKey: '',
        redirectUri: '',
        scopes: []
    });

    useEffect(() => {
        if (isAdmin) {
            getAdminIntegrations('social_apis').then(data => {
                setIntegrations(data);
                setLoading(false);
            });
        }
    }, [isAdmin]);

    // PROTEÇÃO EXTRA DE SEGURANÇA
    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-red-500/10 p-4 rounded-full mb-4">
                    <LockClosed className="w-10 h-10 text-red-500"/>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Área Restrita</h3>
                <p className="text-gray-400 max-w-md">
                    As configurações de API das redes sociais são gerenciadas pela plataforma. 
                    Você pode conectar suas contas diretamente no menu <strong>Marketing</strong>.
                </p>
            </div>
        );
    }

    const handleSave = async () => {
        if (!formData.name || !formData.platform) return toast.error("Preencha o nome e selecione a plataforma");
        
        const newItem: SocialApiIntegration = {
            id: `social-${Date.now()}`,
            platform: formData.platform as any,
            name: formData.name!,
            clientId: formData.clientId,
            clientSecret: formData.clientSecret,
            apiKey: formData.apiKey,
            redirectUri: formData.redirectUri,
            status: 'active',
            lastConnection: new Date().toISOString(),
            scopes: formData.scopes || []
        };

        await saveAdminIntegration('social_apis', newItem);
        setIntegrations(prev => [...prev, newItem]);
        setIsAdding(false);
        setFormData({ platform: 'YouTube', name: '', clientId: '', clientSecret: '', apiKey: '', redirectUri: '', scopes: [] });
        toast.success(`Integração ${newItem.platform} adicionada com sucesso!`);
    };

    const handleDelete = async (id: string) => {
        if(confirm("Remover esta API de automação social?")) {
            await deleteAdminIntegration('social_apis', id);
            setIntegrations(prev => prev.filter(i => i.id !== id));
            toast.success("Integração removida.");
        }
    };

    const getPlatformIcon = (platform: string) => {
        switch(platform) {
            case 'YouTube': return <Youtube className="w-5 h-5 text-red-500"/>;
            case 'TikTok': return <Tiktok className="w-5 h-5 text-white"/>;
            case 'Instagram': return <Instagram className="w-5 h-5 text-pink-500"/>;
            case 'Facebook': return <Facebook className="w-5 h-5 text-blue-500"/>;
            case 'Kwai': return <span className="w-5 h-5 font-black text-orange-500 bg-white rounded-full flex items-center justify-center text-[10px]">K</span>;
            case 'LinkedIn': return <span className="w-5 h-5 font-black text-blue-700 bg-white rounded flex items-center justify-center text-[10px]">in</span>;
            case 'Pinterest': return <span className="w-5 h-5 font-black text-red-600 bg-white rounded-full flex items-center justify-center text-[10px]">P</span>;
            default: return <Share2 className="w-5 h-5 text-gray-400"/>;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <Share2 className="w-6 h-6 text-purple-400"/> APIs de Automação Social (Admin)
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">Configure as credenciais oficiais para uploads e postagens automáticas.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setShowSecrets(!showSecrets)} className="!py-1.5 !px-3 !text-xs !bg-gray-700 hover:!bg-gray-600 text-white flex items-center gap-2">
                         {showSecrets ? <EyeOff className="w-3 h-3"/> : <Eye className="w-3 h-3"/>}
                         {showSecrets ? 'Ocultar Segredos' : 'Ver Segredos'}
                    </Button>
                    <Button onClick={() => setIsAdding(true)} className="!py-1.5 !px-3 !text-xs !bg-purple-600 hover:!bg-purple-500">
                        <PlusCircle className="w-3 h-3 mr-1"/> Configurar Nova API
                    </Button>
                </div>
            </div>

            {isAdding && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 p-6 rounded-xl border border-purple-500/30 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-white font-bold">Nova Credencial Social</h4>
                        <button onClick={() => setIsAdding(false)}><XIcon className="w-5 h-5 text-gray-500"/></button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Plataforma</label>
                            <select 
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-white text-sm outline-none focus:border-purple-500"
                                value={formData.platform}
                                onChange={e => setFormData({...formData, platform: e.target.value as any})}
                            >
                                <option>YouTube</option>
                                <option>TikTok</option>
                                <option>Instagram</option>
                                <option>Facebook</option>
                                <option>Kwai</option>
                                <option>LinkedIn</option>
                                <option>Pinterest</option>
                                <option>Twitter</option>
                            </select>
                        </div>
                        <Input label="Identificador Interno (Ex: Canal Principal)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-800 mt-2">
                            <Input label="Client ID / API Key" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} placeholder="Copie do console de dev da plataforma" />
                            <Input label="Client Secret" type={showSecrets ? "text" : "password"} value={formData.clientSecret} onChange={e => setFormData({...formData, clientSecret: e.target.value})} />
                            <div className="md:col-span-2">
                                <Input label="Redirect URI (OAuth)" value={formData.redirectUri} onChange={e => setFormData({...formData, redirectUri: e.target.value})} placeholder="https://api.mestre.com/auth/callback" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setIsAdding(false)}>Cancelar</Button>
                        <Button onClick={handleSave} className="!bg-purple-600 hover:!bg-purple-500">Salvar Credenciais</Button>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrations.map(int => (
                    <Card key={int.id} className="p-4 border-l-4 border-l-purple-500 bg-gray-800 hover:bg-gray-800/80 transition-all group">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gray-900 rounded-xl border border-gray-700">
                                    {getPlatformIcon(int.platform)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{int.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-400 uppercase">{int.platform} API</span>
                                        <span className={`w-1.5 h-1.5 rounded-full ${int.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(int.id)} className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash className="w-4 h-4"/></button>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-700 space-y-2">
                            <div className="flex justify-between text-[10px]">
                                <span className="text-gray-500">Client ID:</span>
                                <span className="text-gray-300 font-mono">{int.clientId ? `${int.clientId.slice(0, 10)}...` : '-'}</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-gray-500">Status:</span>
                                <span className="text-green-400 font-bold uppercase">Sincronizado</span>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                             <Button variant="secondary" className="w-full !py-1 !text-[10px] !bg-gray-700 border-gray-600">Testar Conexão</Button>
                        </div>
                    </Card>
                ))}
                {integrations.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-800 rounded-2xl">
                        <Share2 className="w-12 h-12 text-gray-700 mx-auto mb-3 opacity-30"/>
                        <p className="text-gray-500">Nenhuma API de Automação configurada.</p>
                        <Button onClick={() => setIsAdding(true)} variant="ghost" className="text-xs text-purple-400 mt-2 hover:underline">Adicionar Primeiro Canal Automático</Button>
                    </div>
                )}
            </div>
        </div>
    );
};
