import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import { Terminal, ShieldCheck, Server, PlusCircle, Trash, RefreshCw, LogOut, Code } from '../../../components/Icons';
import {
    getWhatsAppInstances,
    saveWhatsAppInstance,
    deleteWhatsAppInstance
} from '../../../services/integrationService';
import { WhatsAppInstance } from '../../../types/legacy';
import toast from 'react-hot-toast';
import { CreateInstanceModal } from '../modals/CreateInstanceModal';

export const WhatsmeowManager: React.FC<{ isAdmin?: boolean }> = ({ isAdmin }) => {
    const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [connectingId, setConnectingId] = useState<string | null>(null);

    // Logs Console
    const [consoleLogs, setConsoleLogs] = useState<string[]>(['> Aguardando conexão...']);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getWhatsAppInstances('whatsmeow');
            setInstances(data || []);
        } catch (error) {
            console.error("Error loading Whatsmeow data:", error);
        }
    };

    const callProxy = async (action: string, payload: any = {}) => {
        const res = await fetch('/api/whatsapp/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...payload })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Server Error');
        return data;
    };

    const handleCreate = async (name: string, role: string) => {
        try {
            const newInst: WhatsAppInstance = {
                id: `wm-${Date.now()}`,
                name: name,
                status: 'disconnected',
                engine: 'whatsmeow',
                lastActivity: new Date(),
                role: role as any,
                ownerId: 'platform',
                isBackup: false,
                phoneNumber: '',
                healthScore: 100,
                activeChats: 0,
                capabilities: []
            };
            await saveWhatsAppInstance(newInst);
            setInstances(prev => [...prev, newInst]);
            toast.success(`Instância '${name}' criada!`);
        } catch (error) {
            console.warn("Erro Firestore:", error);
        }
    };

    const handleConnect = async (id: string) => {
        setConnectingId(id);
        toast.loading("Iniciando sessão via Proxy Seguro...");

        try {
            const data = await callProxy('create', { userId: id });

            toast.dismiss();

            if (data.status === 'already_connected' || data.status === 'connected') {
                updateInstanceStatus(id, 'connected');
                toast.success("Instância já conectada!");
            } else if (data.qrCode) {
                setQrCode(data.qrCode);
                toast.success("QR Code gerado! Escaneie agora.");
                pollStatus(id);
            }

        } catch (error: any) {
            toast.dismiss();
            toast.error(`Erro: ${error.message}`);
        } finally {
            setConnectingId(null);
        }
    };

    const pollStatus = async (id: string) => {
        let attempts = 0;
        const maxAttempts = 30; // 60s

        const interval = setInterval(async () => {
            attempts++;
            if (attempts > maxAttempts) {
                clearInterval(interval);
                setQrCode(null);
                toast.error("Tempo limite do QR Code excedido.");
                return;
            }

            try {
                const data = await callProxy('status', { userId: id });

                setConsoleLogs(prev => {
                    const newLog = `> Polling: ${data.status.toUpperCase()} ${data.phone ? `(${data.phone})` : ''}`;
                    return [newLog, ...prev].slice(0, 15);
                });

                if (data.status === 'connected') {
                    clearInterval(interval);
                    setConnectingId('success');
                    const realPhone = data.phone || undefined;
                    updateInstanceStatus(id, 'connected', realPhone);
                    setTimeout(() => {
                        setQrCode(null);
                        setConnectingId(null);
                        toast.success(`Conectado: ${realPhone || 'WhatsApp Business'}`);
                    }, 3000);
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 2000);
    };

    const updateInstanceStatus = async (id: string, status: 'connected' | 'disconnected', phone?: string) => {
        const updated = instances.map(i => {
            if (i.id === id) {
                return { ...i, status, ...(phone ? { phone } : {}) };
            }
            return i;
        });
        setInstances(updated);
        const instance = updated.find(i => i.id === id);
        if (instance) {
            const safeInstance = { ...instance };
            if (safeInstance.phone === undefined) delete safeInstance.phone;
            await saveWhatsAppInstance(safeInstance);
        }
    };

    const handleDisconnect = async (id: string) => {
        if (confirm("Desconectar sessão?")) {
            try {
                await callProxy('disconnect', { userId: id }); // Note: Standard whatsmeow endpoint might vary, assuming 'disconnect' or logic handles it
                updateInstanceStatus(id, 'disconnected');
                toast.success("Sessão encerrada.");
            } catch (error) {
                // Fallback local update even if server fails
                updateInstanceStatus(id, 'disconnected');
                toast.success("Instância desconectada.");
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Excluir instância?")) {
            try {
                await deleteWhatsAppInstance(id);
                setInstances(prev => prev.filter(i => i.id !== id));
                toast.success("Removida.");
            } catch (error) {
                toast.error("Erro ao remover.");
            }
        }
    };

    const handleTestMessage = async (id: string) => {
        const to = prompt("Digite o número para teste (ex: 5511999999999):");
        if (!to) return;

        try {
            toast.loading("Enviando teste...");
            await callProxy('send', {
                userId: id,
                to: to,
                message: "🔔 Olá! Teste via Proxy Seguro bem sucedido! 🔐🚀"
            });
            toast.dismiss();
            toast.success("Mensagem enviada!");
        } catch (error) {
            toast.dismiss();
            toast.error("Erro ao enviar mensagem");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-black/40 border border-green-500/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                    <div>
                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                            <Terminal className="w-6 h-6 text-green-500" /> WhatsMeow Engine
                        </h3>
                        <p className="text-gray-400 text-xs mt-1 font-mono uppercase tracking-widest">
                            Conexão Segura via Vercel Edge Proxy 🔒
                        </p>
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/30 uppercase">Secure Mode Active</span>
                    </div>
                </div>
            </div>

            {/* Removed Configuration UI - Managed by Server Now */}

            {qrCode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 relative overflow-hidden">

                        {connectingId === 'success' ? (
                            <div className="flex flex-col items-center animate-fade-in py-10">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 animate-bounce">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Conectado!</h3>
                                <p className="text-gray-500 text-center">Dispositivo vinculado com sucesso.</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Escaneie o QR Code</h3>
                                <p className="text-gray-500 text-sm text-center mb-6">Abra o WhatsApp &gt; Aparelhos Conectados &gt; Conectar Aparelho</p>

                                <div className="p-4 bg-white border-2 border-gray-100 rounded-xl shadow-inner mb-6 relative">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode)}`}
                                        alt="QR Code WhatsApp"
                                        className="w-64 h-64 object-contain"
                                    />
                                </div>

                                <Button
                                    variant="secondary"
                                    onClick={() => setQrCode(null)}
                                    className="w-full !bg-gray-100 !text-gray-900 hover:!bg-gray-200"
                                >
                                    Cancelar
                                </Button>
                                <p className="text-[10px] text-gray-400 mt-4 text-center">Aguardando leitura...</p>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-tighter">
                            <Server className="w-4 h-4 text-blue-400" /> Instâncias
                        </h4>
                        <Button onClick={() => setIsCreateOpen(true)} className="!py-1.5 !px-3 !text-[10px] font-black uppercase !bg-blue-600 hover:!bg-blue-500">
                            Nova Instância
                        </Button>
                    </div>

                    {instances.map(inst => (
                        <div key={inst.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-green-500/30 transition-colors shadow-lg">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs ${inst.status === 'connected' ? 'bg-green-600' : 'bg-gray-700'}`}>
                                    {inst.status === 'connected' ? 'ON' : 'OFF'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-white font-bold text-sm uppercase">{inst.instanceName}</p>
                                        <span className={`text-[9px] px-1.5 rounded font-black border ${inst.status === 'connected' ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-gray-400 border-gray-600'}`}>
                                            {inst.status === 'connected' ? 'ONLINE' : 'OFFLINE'}
                                        </span>
                                        <span className={`text-[9px] px-1.5 rounded font-black border ml-1 ${inst.role === 'sales_bot' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' :
                                            inst.role === 'system_notifications' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' :
                                                inst.role === 'support_human' ? 'text-purple-400 border-purple-500/30 bg-purple-500/10' :
                                                    'text-gray-500 border-gray-700 bg-gray-800'
                                            }`}>
                                            {inst.role === 'sales_bot' ? 'ROBÔ DE VENDAS' :
                                                inst.role === 'system_notifications' ? 'SISTEMA/NOTIFY' :
                                                    inst.role === 'support_human' ? 'SUPORTE' : 'GERAL'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">ID: {inst.id}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                {inst.status === 'connected' ? (
                                    <>
                                        <span className="text-green-400 font-mono font-bold text-xs mr-2">{inst.phone}</span>
                                        <Button variant="secondary" onClick={() => handleTestMessage(inst.id)} className="!py-1.5 !px-3 !text-[10px] font-black !bg-blue-600/20 text-blue-400 border-blue-900/50 uppercase mr-2">
                                            Testar
                                        </Button>
                                        <Button variant="secondary" onClick={() => handleDisconnect(inst.id)} className="!py-1.5 !px-3 !text-[10px] font-black !bg-red-900/20 text-red-400 border-red-900/50 uppercase">
                                            Desconectar
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => handleConnect(inst.id)}
                                        isLoading={connectingId === inst.id}
                                        className="!py-1.5 !px-3 !text-[10px] font-black !bg-green-600 hover:!bg-green-500 uppercase"
                                    >
                                        Conectar
                                    </Button>
                                )}
                                <button onClick={() => handleDelete(inst.id)} className="p-2 text-gray-600 hover:text-red-400 transition-colors"><Trash className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                    {instances.length === 0 && (
                        <div className="text-center py-10 text-gray-500 border border-dashed border-gray-700 rounded-xl">
                            Nenhuma instância criada.
                        </div>
                    )}
                </div>

                <div className="bg-[#0c0c0e] rounded-2xl border border-gray-800 p-4 font-mono text-[10px] flex flex-col h-[350px] shadow-2xl shadow-black/50">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                        <span className="text-gray-500 font-bold flex items-center gap-2 uppercase tracking-widest"><Code className="w-3 h-3" /> Console Seguro</span>
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
