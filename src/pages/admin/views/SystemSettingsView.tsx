import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Settings, User } from '../../../components/Icons';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { SystemSettings } from '../../../types';
import { getSystemSettings, saveSystemSettings } from '../../../services/mockFirebase';
import toast from 'react-hot-toast';
import AdminProfileView from './AdminProfileView';

const SystemSettingsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'profile'>('general');
    const [settings, setSettings] = useState<SystemSettings>({ purchaseLink: '', forgotPasswordLink: '', supportLink: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSystemSettings().then(s => {
            setSettings(s);
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        setLoading(true);
        await saveSystemSettings(settings);
        toast.success("Configurações atualizadas!");
        setLoading(false);
    };

    if (loading) return <div className="flex justify-center p-10"><LoadingSpinner /></div>;

    return (
        <div className="space-y-6">
            {/* Tabs Header */}
            <div className="flex space-x-4 border-b border-gray-700 pb-2 mb-6 ml-1">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'general'
                        ? 'text-brand-primary border-b-2 border-brand-primary'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Geral
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'profile'
                        ? 'text-brand-primary border-b-2 border-brand-primary'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Meu Perfil
                    </div>
                </button>
            </div>

            {activeTab === 'general' ? (
                <Card className="p-6 max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-brand-primary" /> Configurações do Sistema
                    </h2>

                    <div className="space-y-8">
                        {/* 1. Identidade */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider border-b border-gray-700 pb-2">
                                1. Identidade da Plataforma
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Nome da Plataforma"
                                    value={settings.platformName || ''}
                                    onChange={e => setSettings({ ...settings, platformName: e.target.value })}
                                    placeholder="Ex: Nexus Academy"
                                />
                                <Input
                                    label="Cor Primária (Hex)"
                                    value={settings.primaryColor || ''}
                                    onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                                    placeholder="Ex: #00ff00"
                                />
                                <div className="md:col-span-2">
                                    <Input
                                        label="URL do Logo"
                                        value={settings.logoUrl || ''}
                                        onChange={e => setSettings({ ...settings, logoUrl: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>



                        {/* 1.1 Perfil do Negócio (Stripe & Emails) */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider border-b border-gray-700 pb-2">
                                1.1 Perfil do Negócio (Stripe & Emails)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Domínio Principal"
                                    value={settings.businessDomain || ''}
                                    onChange={e => setSettings({ ...settings, businessDomain: e.target.value })}
                                    placeholder="Ex: mestrenosnegocios.com"
                                />
                                <Input
                                    label="E-mail de Suporte (Público)"
                                    value={settings.businessEmail || ''}
                                    onChange={e => setSettings({ ...settings, businessEmail: e.target.value })}
                                    placeholder="Ex: contato@mestrenosnegocios.com"
                                />
                                <div className="md:col-span-2">
                                    <Input
                                        label="Descriptor da Fatura (Cartão)"
                                        value={settings.businessDescriptor || ''}
                                        onChange={e => setSettings({ ...settings, businessDescriptor: e.target.value })}
                                        placeholder="Ex: MESTRENEGOCIOS (Max 22 chars)"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Este nome aparecerá na fatura do cartão dos alunos.</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Contato e Suporte */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider border-b border-gray-700 pb-2">
                                2. Contato & Suporte
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="E-mail do Sistema (Remetente)"
                                    value={settings.systemEmail || ''}
                                    onChange={e => setSettings({ ...settings, systemEmail: e.target.value })}
                                    placeholder="noreply@plataforma.com"
                                />
                                <Input
                                    label="WhatsApp de Suporte (URL)"
                                    value={settings.whatsapp || ''}
                                    onChange={e => setSettings({ ...settings, whatsapp: e.target.value })}
                                    placeholder="https://wa.me/..."
                                />
                            </div>
                            <Input
                                label="Link de Suporte Geral (Ajuda)"
                                value={settings.supportLink}
                                onChange={e => setSettings({ ...settings, supportLink: e.target.value })}
                                placeholder="https://..."
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Link de Compra"
                                    value={settings.purchaseLink}
                                    onChange={e => setSettings({ ...settings, purchaseLink: e.target.value })}
                                    placeholder="https://pagina-de-vendas..."
                                />
                                <div>
                                    <Input
                                        label="Link 'Esqueceu Senha'"
                                        value={settings.forgotPasswordLink}
                                        onChange={e => setSettings({ ...settings, forgotPasswordLink: e.target.value })}
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Controle */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider border-b border-gray-700 pb-2">
                                3. Controle & Manutenção
                            </h3>
                            <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <div>
                                    <h4 className="font-bold text-white">Modo Manutenção</h4>
                                    <p className="text-xs text-gray-400">Impede o login de alunos e exibe aviso.</p>
                                </div>
                                <div
                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-600'}`}
                                    onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <div>
                                    <h4 className="font-bold text-white">Permitir Novos Cadastros</h4>
                                    <p className="text-xs text-gray-400">Habilita/desabilita criações de conta públicas.</p>
                                </div>
                                <div
                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.allowSignup !== false ? 'bg-green-500' : 'bg-gray-600'}`}
                                    onClick={() => setSettings({ ...settings, allowSignup: settings.allowSignup === undefined ? false : !settings.allowSignup })}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.allowSignup !== false ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-700 flex justify-end">
                            <Button onClick={handleSave} isLoading={loading}>Salvar Alterações</Button>
                        </div>
                    </div>
                </Card >
            ) : (
                <div className="animate-fade-in">
                    <AdminProfileView />
                </div>
            )}
        </div>
    );
};

export default SystemSettingsView;
