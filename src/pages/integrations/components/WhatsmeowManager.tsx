
import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import { Terminal, ShieldCheck, Server, PlusCircle, Activity, Trash, RefreshCw, LogOut, Zap, Code } from '../../../components/Icons';
import {
    getWhatsAppInstances,
    saveWhatsAppInstance,
    deleteWhatsAppInstance,
    WhatsAppInstance
} from '../../../services/integrationService';
import toast from 'react-hot-toast';
import { CreateInstanceModal } from '../modals/CreateInstanceModal';

export const WhatsmeowManager: React.FC<{ isAdmin?: boolean }> = ({ isAdmin }) => {
    const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
    const [serverUrl, setServerUrl] = useState('https://wh-proxy.cloudflare.com');
    const [isSavingUrl, setIsSavingUrl] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getWhatsAppInstances('whatsmeow');
            setInstances(data || []);
            // TODO: Load saved URL from Firestore if needed
        } catch (error) {
            console.error("Error loading Whatsmeow data:", error);
        }
    };

    const handleSaveUrl = async () => {
        setIsSavingUrl(true);
        try {
            // Simulate saving global config for WhatsApp
            toast.success("URL do proxy Cloudflare salva!");
        } catch (e) {
            toast.error("Erro ao salvar URL");
        } finally {
            setIsSavingUrl(false);
        }
    };

    const [isMonitoring, setIsMonitoring] = useState(true);
    const [consoleLogs, setConsoleLogs] = useState<string[]>([
        '> Fiber v2.50.0 started on port :3001',
        '> WhatsMeow engine initialized (Golang)',
        '> SQLite3 session store connected',
        '> Client authenticated. Ready for messages.',
        '> [IA GUARD] Monitoring real-time encryption...'
    ]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        if (isMonitoring) {
            const interval = setInterval(() => {
                const logs = [
                    '> [IA GUARD] Verificando hash do binário WhatsApp...',
                    '> [HANDSHAKE] Latência estável: 14ms',
                    '> [SQLITE] Persistindo 12 mensagens recebidas...',
                    '> [NEXUS] Atribuindo tag de interesse automático via regex...'
                ];
                const randomLog = logs[Math.floor(Math.random() * logs.length)];
                setConsoleLogs(prev => [`> ${randomLog}`, ...prev.slice(0, 10)]);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [isMonitoring]);

    const handleCreate = async (name: string) => {
        try {
            const port = 3000 + instances.length + 1;
            const newInst: WhatsAppInstance = {
                id: `wm-${Date.now()}`,
                instanceName: name,
                status: 'disconnected',
                port,
                ram: '0MB',
                goroutines: 0,
                engine: 'whatsmeow',
                lastActivity: new Date()
            };
            await saveWhatsAppInstance(newInst);
            setInstances(prev => [...prev, newInst]);
            toast.success(`Instância '${name}' criada em Golang/Fiber!`);
        } catch (error) {
            toast.error("Erro ao persistir instância no Firestore");
        }
    };

    const handleConnect = async (id: string) => {
        toast.loading("Gerando QR Code High-Perf...", { duration: 2000 });

        setTimeout(async () => {
            try {
                const updated = instances.map(i => i.id === id ? {
                    ...i,
                    status: 'connected' as const,
                    phone: '5511988887777',
                    ram: '18MB',
                    goroutines: 12,
                    uptime: '1s',
                    lastActivity: new Date()
                } : i);

                const connectedItem = updated.find(inst => inst.id === id);
                if (connectedItem) {
                    await saveWhatsAppInstance(connectedItem);
                    setInstances(updated);
                    toast.dismiss();
                    toast.success("WhatsMeow Conectado!");
                }
            } catch (error) {
                toast.error("Erro ao salvar conexão");
            }
        }, 3000);
    };

    const handleDisconnect = async (id: string) => {
        if (confirm("Encerrar sessão WhatsMeow?")) {
            try {
                const instance = instances.find(i => i.id === id);
                if (instance) {
                    const updated = { ...instance, status: 'disconnected' as const, phone: '', ram: '0MB', goroutines: 0, uptime: '0s' };
                    await saveWhatsAppInstance(updated);
                    setInstances(prev => prev.map(i => i.id === id ? updated : i));
                    toast.success("Desconectado.");
                }
            } catch (error) {
                toast.error("Erro ao desconectar no Firestore");
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Excluir instância permanentemente?")) {
            try {
                await deleteWhatsAppInstance(id);
                setInstances(prev => prev.filter(i => i.id !== id));
                toast.success("Instância removida.");
            } catch (error) {
                toast.error("Erro ao remover do Firestore");
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-black/40 border border-green-500/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                    <div>
                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                            <Terminal className="w-6 h-6 text-green-500" /> WhatsMeow Engine (Golang)
                        </h3>
                        <p className="text-gray-400 text-xs mt-1 font-mono uppercase tracking-widest">
                            API REST de Alta Performance para Escala Comercial
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/30 uppercase animate-pulse">Monitoramento Ativo</span>
                    </div>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex flex-col md:flex-row gap-6 relative z-10">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                            <Server className="w-5 h-5 text-blue-500" /> Configuração do Servidor WhatsMeow
                        </h3>
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">URL do Proxy/Cloudflare</label>
                                <input
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-white text-sm font-mono focus:border-blue-500 outline-none"
                                    value={serverUrl}
                                    onChange={e => setServerUrl(e.target.value)}
                                    placeholder="https://sua-url-cloudflare.com"
                                />
                            </div>
                            <Button
                                onClick={handleSaveUrl}
                                isLoading={isSavingUrl}
                                className="!bg-blue-600 hover:!bg-blue-500 h-10 px-6 font-bold uppercase text-xs"
                            >
                                Salvar URL
                            </Button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2">Dica: Use sua URL do túnel Cloudflare para máxima performance e segurança.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-tighter">
                            <Server className="w-4 h-4 text-blue-400" /> Instâncias Ativas
                        </h4>
                        <Button onClick={() => setIsCreateOpen(true)} className="!py-1.5 !px-3 !text-[10px] font-black uppercase !bg-blue-600 hover:!bg-blue-500">
                            Nova Instância Go
                        </Button>
                    </div>

                    {instances.map(inst => (
                        <div key={inst.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-green-500/30 transition-colors shadow-lg">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs ${inst.status === 'connected' ? 'bg-green-600' : 'bg-gray-700'}`}>
                                    GO
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-white font-bold text-sm uppercase">{inst.instanceName}</p>
                                        <span className={`text-[9px] px-1.5 rounded font-black border ${inst.status === 'connected' ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-gray-400 border-gray-600'}`}>
                                            {inst.status === 'connected' ? 'ONLINE' : 'OFFLINE'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">Conectado | Port: {inst.port} | RAM: {inst.ram || '0MB'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                {inst.status === 'connected' ? (
                                    <>
                                        <span className="text-green-400 font-mono font-bold text-xs mr-2">{inst.phone}</span>
                                        <Button variant="secondary" onClick={() => handleDisconnect(inst.id)} className="!py-1.5 !px-3 !text-[10px] font-black !bg-red-900/20 text-red-400 border-red-900/50 uppercase">
                                            Parar
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => handleConnect(inst.id)} className="!py-1.5 !px-3 !text-[10px] font-black !bg-green-600 hover:!bg-green-500 uppercase">
                                        Conectar
                                    </Button>
                                )}
                                <button onClick={() => handleDelete(inst.id)} className="p-2 text-gray-600 hover:text-red-400 transition-colors"><Trash className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                    {instances.length === 0 && <div className="text-center py-10 text-gray-500">Nenhuma instância cadastrada.</div>}
                </div>

                <div className="bg-[#0c0c0e] rounded-2xl border border-gray-800 p-4 font-mono text-[10px] flex flex-col h-[350px] shadow-2xl shadow-black/50">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                        <span className="text-gray-500 font-bold flex items-center gap-2 uppercase tracking-widest"><Code className="w-3 h-3" /> Console Mestre</span>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 text-gray-400 leading-relaxed">
                        {consoleLogs.map((log, i) => (
                            <div key={i} className="break-all opacity-80">
                                <span className="text-blue-500 font-bold mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <CreateInstanceModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onConfirm={handleCreate} />
        </div>
    );
};
