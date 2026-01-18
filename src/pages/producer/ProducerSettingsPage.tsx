import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Bell, LockClosed, ShieldCheck, Mail, Camera, Save, ArrowRight, DollarSign, AlertTriangle } from '../../components/Icons';
import Button from '../../components/Button';
import { toast } from 'react-hot-toast';

export const ProducerSettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
    const [loading, setLoading] = useState(false);

    const [profile, setProfile] = useState({
        displayName: user?.displayName || '',
        email: user?.email || '',
        bio: 'Empreendedor digital focado em produtos de alta conversão.',
        phone: '(11) 99999-9999'
    });

    const [notifications, setNotifications] = useState({
        emailSales: true,
        emailRefunds: true,
        pushSales: true,
        pushSecurity: true
    });

    const handleSave = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Configurações salvas com sucesso!');
        setLoading(false);
    };

    return (
        <div className="text-white max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Configurações</h1>
            <p className="text-gray-400 mb-8">Gerencie seus dados e preferências da plataforma.</p>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <User className="w-5 h-5" /> Perfil
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'notifications' ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <Bell className="w-5 h-5" /> Notificações
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'security' ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <ShieldCheck className="w-5 h-5" /> Segurança
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-bold flex items-center gap-2"><User className="text-purple-500" /> Meu Perfil</h2>

                            <div className="flex items-center gap-6">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-purple-500 transition-colors">
                                        <img src={user?.photoURL || 'https://ui-avatars.com/api/?name=User&background=random'} alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{profile.displayName}</p>
                                    <p className="text-gray-400 text-sm">Produtor Verificado</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={profile.displayName}
                                        onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-400 mb-1">Bio</label>
                                    <textarea
                                        value={profile.bio}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        rows={3}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Bell className="text-purple-500" /> Preferências de Notificação</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><DollarSign className="w-5 h-5" /></div>
                                        <div>
                                            <p className="font-bold">Vendas Realizadas</p>
                                            <p className="text-sm text-gray-400">Receber notificações a cada nova venda</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={notifications.pushSales} onChange={(e) => setNotifications({ ...notifications, pushSales: e.target.checked })} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><AlertTriangle className="w-5 h-5" /></div>
                                        <div>
                                            <p className="font-bold">Solicitações de Reembolso</p>
                                            <p className="text-sm text-gray-400">Alertas críticos para retenção imediata (24h)</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={notifications.emailRefunds} onChange={(e) => setNotifications({ ...notifications, emailRefunds: e.target.checked })} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="text-purple-500" /> Segurança</h2>

                            <div className="bg-yellow-900/20 p-4 rounded-xl border border-yellow-500/20 flex items-start gap-3">
                                <LockClosed className="w-6 h-6 text-yellow-500 shrink-0" />
                                <div>
                                    <p className="text-yellow-500 font-bold mb-1">Mude sua senha regularmente</p>
                                    <p className="text-sm text-gray-300">Recomendamos usar uma senha forte e única para proteger seus ganhos.</p>
                                </div>
                            </div>

                            <Button variant="secondary" className="w-full justify-center">
                                Alterar Senha <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">
                        <Button onClick={handleSave} disabled={loading} className="px-8">
                            {loading ? 'Salvando...' : 'Salvar Alterações'} <Save className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
