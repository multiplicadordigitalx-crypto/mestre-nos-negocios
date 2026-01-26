
import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import { Smartphone, Zap, Server, PlusCircle, Trash, RefreshCw, LogOut, Eye, EyeOff } from '../../../components/Icons';
import {
    getWhatsAppInstances,
    saveWhatsAppInstance,
    deleteWhatsAppInstance
} from '../../../services/integrationService';
import { WhatsAppInstance } from '../../../types/legacy';
import toast from 'react-hot-toast';
import { WhatsmeowManager } from './WhatsmeowManager';
import { CreateInstanceModal } from '../modals/CreateInstanceModal';
import { ConfirmActionModal } from '../modals/ConfirmActionModal';
import { useAuth } from '../../../hooks/useAuth';
import { nexusCore } from '../../../services/NexusCore';

export const WhatsAppView: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
    const { user } = useAuth();
    // PADRÃO: Whatsmeow inicia ativo. Evolution desligado por padrão.
    const [whatsAppEngine, setWhatsAppEngine] = useState<'evolution' | 'whatsmeow'>('whatsmeow');
    const [enableEvolutionBackup, setEnableEvolutionBackup] = useState(false);

    // Evolution Config
    const [evolutionConfig, setEvolutionConfig] = useState({ serverUrl: 'https://api.evolution.com', globalKey: 'global-secret-key-123456' });
    const [waInstances, setWaInstances] = useState<WhatsAppInstance[]>([]);
    const [showSecrets, setShowSecrets] = useState(false);
    const [isCreateInstanceOpen, setIsCreateInstanceOpen] = useState(false);
    const [connectingInstance, setConnectingInstance] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ isOpen: boolean, type: 'logout' | 'delete', instanceId: string | null }>({ isOpen: false, type: 'logout', instanceId: null });

    useEffect(() => {
        loadInstances();
    }, [isAdmin, whatsAppEngine]);

    const loadInstances = async () => {
        try {
            const data = await getWhatsAppInstances(whatsAppEngine);
            setWaInstances(data || []);
        } catch (error) {
            console.error("Error loading WhatsApp instances:", error);
            const toastId = "whatsapp-load-error";
            if (error instanceof Error && (
                error.message.includes('permission-denied') ||
                error.message.includes('insufficient permissions') ||
                error.message.toLowerCase().includes('permission')
            )) {
                toast.error("Acesso restrito: Sem permissão para ler instâncias", { id: toastId });
            } else {
                toast.error("Erro ao carregar instâncias de WhatsApp", { id: toastId });
            }
        }
    };

    // Added useEffect to handle side effect that was previously in render return
    useEffect(() => {
        if (!isAdmin && !enableEvolutionBackup && whatsAppEngine !== 'whatsmeow') {
            setWhatsAppEngine('whatsmeow');
        }
    }, [isAdmin, enableEvolutionBackup, whatsAppEngine]);

    const handleCreateInstance = async (name: string) => {
        try {
            // SECURITY CHECK: Subscription for Evolution API
            if (!isAdmin && whatsAppEngine === 'evolution' && user) {
                const confirm = window.confirm("Atenção: A Evolution API é um recurso Premium (Backup Profissional).\n\nAo criar esta instância, você ativará uma assinatura MENSAL de ≈40 Créditos ($2.75).\n\nDeseja confirmar a assinatura e criar?");
                if (!confirm) return;

                const subResult = await nexusCore.subscribe(user.uid, 'wa_evolution_api');
                if (!subResult.success) {
                    toast.error(subResult.message);
                    return;
                }
                toast.success("Assinatura Ativada! Criando instância...");
            }

            const newInst: WhatsAppInstance = {
                id: `wa-${Date.now()}`,
                name: name,
                status: 'disconnected',
                lastActivity: new Date(),
                engine: whatsAppEngine,
                ownerId: 'platform',
                isBackup: false,
                phoneNumber: '',
                healthScore: 100,
                activeChats: 0,
                capabilities: [],
                role: 'general'
            };

            await saveWhatsAppInstance(newInst);
            setWaInstances(prev => [...prev, newInst]);
            toast.success("Instância criada! Escaneie o QR Code para conectar.");
        } catch (error) {
            toast.error("Erro ao criar instância no Firestore");
        }
    };

    const handleScanQR = (id: string) => {
        setConnectingInstance(id);
        // Simulate QR Scan Process (In Production this would connect to WhatsApp API)
        setTimeout(async () => {
            try {
                const updatedInstances = waInstances.map(inst =>
                    inst.id === id ? {
                        ...inst,
                        status: 'connected' as const,
                        battery: 98,
                        phone: '5511988887777',
                        profilePic: `https://i.pravatar.cc/150?u=${id}`,
                        lastActivity: new Date()
                    } : inst
                );

                const connectedItem = updatedInstances.find(i => i.id === id);
                if (connectedItem) {
                    await saveWhatsAppInstance(connectedItem);
                    setWaInstances(updatedInstances);
                    toast.success("WhatsApp Conectado com Sucesso!", { icon: '🟢' });
                }
            } catch (error) {
                toast.error("Erro ao sincronizar conexão no Firestore");
            } finally {
                setConnectingInstance(null);
            }
        }, 3000);
    };

    const confirmLogout = (id: string) => {
        setConfirmAction({ isOpen: true, type: 'logout', instanceId: id });
    };

    const confirmDelete = (id: string) => {
        setConfirmAction({ isOpen: true, type: 'delete', instanceId: id });
    };

    const executeConfirmAction = async () => {
        const { type, instanceId } = confirmAction;
        if (!instanceId) return;

        try {
            if (type === 'logout') {
                const instance = waInstances.find(i => i.id === instanceId);
                if (instance) {
                    const updated = { ...instance, status: 'disconnected' as const, battery: 0, phone: '', profilePic: '' };
                    await saveWhatsAppInstance(updated);
                    setWaInstances(prev => prev.map(inst => inst.id === instanceId ? updated : inst));
                    toast.success("Instância desconectada.");
                }
            } else if (type === 'delete') {
                await deleteWhatsAppInstance(instanceId);
                setWaInstances(prev => prev.filter(inst => inst.id !== instanceId));
                toast.success("Instância removida.");
            }
        } catch (error) {
            toast.error("Erro ao processar ação no Firestore");
        } finally {
            setConfirmAction({ ...confirmAction, isOpen: false });
        }
    };

    const handleRestartInstance = (id: string) => {
        toast.loading("Reiniciando serviços...", { duration: 2000 });
        setTimeout(() => toast.success("Instância reiniciada."), 2000);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Admin Controls - Ativação do Backup */}
            {isAdmin && (
                <div className="flex justify-end mb-4">
                    <div className="bg-yellow-900/20 border border-yellow-500/30 px-3 py-2 rounded-lg flex items-center gap-2">
                        <label className="text-xs font-bold text-yellow-500 uppercase mr-2">Admin Control:</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={enableEvolutionBackup}
                                onChange={(e) => {
                                    setEnableEvolutionBackup(e.target.checked);
                                    if (e.target.checked) toast.success("Evolution API liberada como opção de backup.");
                                    else toast("Evolution API ocultada dos alunos.");
                                }}
                            />
                            <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                            <span className="ml-2 text-xs text-gray-300">Liberar Evolution (Backup)</span>
                        </label>
                    </div>
                </div>
            )}

            {/* Engine Switcher - Only Visible if Admin OR Backup Enabled */}
            {(isAdmin || enableEvolutionBackup) && (
                <div className="flex justify-center mb-6">
                    <div className="bg-gray-900 p-1 rounded-xl flex gap-1 border border-gray-700">
                        <button
                            onClick={() => setWhatsAppEngine('whatsmeow')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${whatsAppEngine === 'whatsmeow' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Zap className="w-3 h-3" /> API Padrão (Whatsmeow)
                        </button>

                        <button
                            onClick={() => setWhatsAppEngine('evolution')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${whatsAppEngine === 'evolution' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            Gerenciador Backup (Evolution)
                        </button>
                    </div>
                </div>
            )}

            {whatsAppEngine === 'whatsmeow' ? (
                <WhatsmeowManager isAdmin={isAdmin} />
            ) : (
                <>
                    {/* Evolution Manager (Global Keys) - ONLY FOR ADMIN */}
                    {isAdmin && (
                        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 relative overflow-hidden mb-6">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>
                            <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Server className="w-5 h-5 text-green-500" /> Credenciais Globais Evolution API
                                        </h3>
                                        <Button onClick={() => setShowSecrets(!showSecrets)} className="!py-1.5 !px-3 !text-xs !bg-gray-700 hover:!bg-gray-600 text-white flex items-center gap-2">
                                            {showSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                            {showSecrets ? 'Ocultar Chaves' : 'Ver Chaves'}
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Server URL</label>
                                            <input
                                                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-white text-sm font-mono focus:border-green-500 outline-none"
                                                value={evolutionConfig.serverUrl}
                                                onChange={e => setEvolutionConfig({ ...evolutionConfig, serverUrl: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Global API Key</label>
                                            <input
                                                type={showSecrets ? "text" : "password"}
                                                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-white text-sm font-mono focus:border-green-500 outline-none"
                                                value={evolutionConfig.globalKey}
                                                onChange={e => setEvolutionConfig({ ...evolutionConfig, globalKey: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <Button className="!bg-green-600 hover:!bg-green-500 shadow-lg shadow-green-900/20 text-sm h-10 w-full md:w-auto">
                                        Salvar Configuração
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Instances Manager */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-brand-primary" /> Gerenciador de Instâncias (Evolution)
                            </h3>
                            <Button onClick={() => setIsCreateInstanceOpen(true)} className="!py-2 !px-4 !text-xs !bg-blue-600 hover:!bg-blue-500">
                                <PlusCircle className="w-3 h-3 mr-1" /> Criar Instância
                            </Button>
                        </div>

                        {waInstances.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-gray-700 rounded-xl">
                                <p className="text-gray-500">Nenhuma instância Evolution criada.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {waInstances.map(inst => (
                                    <div key={inst.id} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-all shadow-lg flex flex-col h-full">
                                        {/* Instance Header */}
                                        <div className="p-4 border-b border-gray-800 bg-gray-800/50 flex justify-between items-center">
                                            <span className="font-bold text-white text-sm truncate" title={inst.instanceName}>{inst.instanceName}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${inst.status === 'connected' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${inst.status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                                {inst.status === 'connected' ? 'ONLINE' : 'OFFLINE'}
                                            </span>
                                        </div>

                                        {/* Instance Body */}
                                        <div className="p-6 flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
                                            {inst.status === 'connected' ? (
                                                <>
                                                    <div className="relative mb-4">
                                                        <img src={inst.profilePic} className="w-20 h-20 rounded-full border-4 border-green-500 shadow-xl" alt="Profile" />
                                                        <div className="absolute -bottom-1 -right-1 bg-green-600 text-white text-[10px] font-bold px-1.5 rounded shadow border border-green-400">
                                                            {inst.battery}%
                                                        </div>
                                                    </div>
                                                    <p className="text-white font-mono font-bold text-lg mb-1">{inst.phone}</p>
                                                    <p className="text-gray-500 text-xs">Ativo desde {inst.lastActivity}</p>
                                                </>
                                            ) : (
                                                <>
                                                    {connectingInstance === inst.id ? (
                                                        <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                                                            <div className="absolute inset-0 bg-white opacity-50 z-10"></div>
                                                            <RefreshCw className="w-8 h-8 text-black animate-spin z-20" />
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="w-32 h-32 bg-white rounded-lg flex items-center justify-center mb-4 cursor-pointer hover:opacity-90 transition-opacity border-4 border-white shadow-lg group relative"
                                                            onClick={() => handleScanQR(inst.id)}
                                                        >
                                                            <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full h-full p-2">
                                                                <div className="bg-black col-span-2 row-span-2"></div>
                                                                <div className="bg-black col-span-1 row-span-1 col-start-4"></div>
                                                                <div className="bg-black col-span-1 row-span-1 row-start-2 col-start-3"></div>
                                                                <div className="bg-black col-span-2 row-span-2 row-start-3 col-start-1"></div>
                                                                <div className="bg-black col-span-1 row-span-1 row-start-3 col-start-3"></div>
                                                                <div className="bg-black col-span-1 row-span-1 row-start-4 col-start-4"></div>
                                                            </div>
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                                                <span className="text-white font-bold text-xs">LER QR CODE</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <p className="text-gray-400 text-xs text-center px-4">
                                                        {connectingInstance === inst.id ? 'Conectando...' : 'Clique no QR Code para escanear e conectar'}
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        {/* Instance Footer Actions */}
                                        <div className="p-3 bg-gray-900 border-t border-gray-800 grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => handleRestartInstance(inst.id)}
                                                className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                                                title="Reiniciar"
                                            >
                                                <RefreshCw className="w-4 h-4 mb-1" />
                                                <span className="text-[9px] font-bold">RESTART</span>
                                            </button>
                                            <button
                                                onClick={() => inst.status === 'connected' ? confirmLogout(inst.id) : handleScanQR(inst.id)}
                                                className={`flex flex-col items-center justify-center p-2 rounded hover:bg-gray-800 transition-colors ${inst.status === 'connected' ? 'text-yellow-500 hover:text-yellow-400' : 'text-blue-500 hover:text-blue-400'}`}
                                                title={inst.status === 'connected' ? 'Desconectar' : 'Conectar'}
                                            >
                                                {inst.status === 'connected' ? <LogOut className="w-4 h-4 mb-1" /> : <Zap className="w-4 h-4 mb-1" />}
                                                <span className="text-[9px] font-bold">{inst.status === 'connected' ? 'LOGOUT' : 'CONNECT'}</span>
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(inst.id)}
                                                className="flex flex-col items-center justify-center p-2 rounded hover:bg-red-900/20 text-red-500 hover:text-red-400 transition-colors"
                                                title="Excluir Instância"
                                            >
                                                <Trash className="w-4 h-4 mb-1" />
                                                <span className="text-[9px] font-bold">DELETE</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            <CreateInstanceModal isOpen={isCreateInstanceOpen} onClose={() => setIsCreateInstanceOpen(false)} onConfirm={handleCreateInstance} />

            <ConfirmActionModal
                isOpen={confirmAction.isOpen}
                onClose={() => setConfirmAction({ ...confirmAction, isOpen: false })}
                onConfirm={executeConfirmAction}
                title={confirmAction.type === 'logout' ? 'Desconectar WhatsApp?' : 'Excluir Instância?'}
                description={confirmAction.type === 'logout' ? 'O bot parará de responder imediatamente.' : 'Esta ação não pode ser desfeita. Todos os dados da instância serão perdidos.'}
                confirmText={confirmAction.type === 'logout' ? 'Desconectar' : 'Excluir Definitivamente'}
                isDestructive={true}
            />
        </div>
    );
};
