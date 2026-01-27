
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import { Target, RefreshCw, Facebook, Google, Server, ActivityIcon } from '../../../components/Icons';
import toast from 'react-hot-toast';
import { BuyerPersona } from '../types';

export const PersonaTab: React.FC = () => {
    const [personas, setPersonas] = useState<BuyerPersona[]>([]);
    const [syncLog, setSyncLog] = useState<string[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [autoSync, setAutoSync] = useState(true);

    useEffect(() => {
        setPersonas([
            {
                id: 'p1',
                campaignName: 'Mestre 15X - Escala',
                adAccountName: 'Conta Principal FB',
                platform: 'Meta Ads',
                demographics: 'Mulheres, 25-34, Sudeste/Sul',
                topInterests: ['Empreendedorismo', 'Marketing Digital', 'Renda Extra', 'Hotmart'],
                behavior: 'Compradores Engajados (30d)',
                ltv: 297.00,
                syncStatus: 'synced',
                lastSync: 'Há 10 min'
            },
            {
                id: 'p2',
                campaignName: 'Captura Lead Magnet - Google',
                adAccountName: 'Google Search 01',
                platform: 'Google Ads',
                demographics: 'Homens/Mulheres, 18-45, Brasil',
                topInterests: ['Como ganhar dinheiro online', 'Curso marketing', 'Trabalhar em casa'],
                behavior: 'Pesquisa Alta Intenção',
                ltv: 0,
                syncStatus: 'learning',
                lastSync: 'Há 1h'
            }
        ]);
    }, []);

    useEffect(() => {
        let interval: any;
        if (autoSync) {
            const runAutoSync = async () => {
                if (isSyncing) return;
                await handleSync(true);
            };
            runAutoSync();
            interval = setInterval(runAutoSync, 15000);
        }
        return () => clearInterval(interval);
    }, [autoSync, isSyncing]);

    const handleSync = async (isAuto = false) => {
        setIsSyncing(true);
        setSyncLog([]);

        const logs = [
            `> [${isAuto ? 'AUTO' : 'MANUAL'}] Conectando ao Nexus Autônomo...`,
            `> Identificando campanhas ativas em contas conectadas...`,
            `> Extraindo dados de conversão (Purchase/Lead) das últimas 24h...`,
            `> Analisando padrões de Persona (Clusterização IA)...`,
            `> Encontrado padrão: Mulheres 25-34 com interesse em "Renda Extra" convertendo 3x mais.`,
            `> Enviando evento Offline Conversions para Google Ads (GCLID match)...`,
            `> Enviando CAPI Payload para Meta Ads (fbc/fbp match)...`,
            `> Atualizando Lookalike Audiences...`,
            `> Otimização concluída. ROAS projetado: +15%.`
        ];

        for (let i = 0; i < logs.length; i++) {
            await new Promise(r => setTimeout(r, 800));
            setSyncLog(prev => [logs[i], ...prev]);
        }

        setIsSyncing(false);
        if (!isAuto) toast.success("Sincronização com Ads concluída!");
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Target className="w-6 h-6 text-brand-primary" /> Personas & Integração de Anúncios
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Alimente o algoritmo do Facebook e Google com quem realmente compra.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-2 mr-2 bg-gray-800 p-1.5 rounded-lg border border-gray-700">
                        <span className={`text-xs font-bold uppercase ${autoSync ? 'text-green-400' : 'text-gray-500'}`}>Nexus Autônomo:</span>
                        <button
                            onClick={() => setAutoSync(!autoSync)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${autoSync ? 'bg-green-600' : 'bg-gray-600'}`}
                        >
                            <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${autoSync ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    <Button onClick={() => handleSync(false)} isLoading={isSyncing} disabled={isSyncing} className="!bg-green-600 hover:!bg-green-500 !py-2 !text-xs">
                        <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} /> {isSyncing ? 'Sincronizando...' : 'Forçar Sync'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {personas.map(persona => (
                        <Card key={persona.id} className="p-5 bg-gray-800 border-gray-700 relative overflow-hidden group hover:border-brand-primary transition-colors">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none"></div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${persona.platform === 'Meta Ads' ? 'bg-blue-900/20 text-blue-400' : 'bg-red-900/20 text-red-400'}`}>
                                        {persona.platform === 'Meta Ads' ? <Facebook className="w-5 h-5" /> : <Google className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{persona.campaignName}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1"><Server className="w-3 h-3" /> {persona.adAccountName}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${persona.syncStatus === 'synced' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'}`}>
                                    ● {persona.syncStatus}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm relative z-10">
                                <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
                                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Perfil Demográfico</p>
                                    <p className="text-white">{persona.demographics}</p>
                                </div>
                                <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
                                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Comportamento</p>
                                    <p className="text-white">{persona.behavior}</p>
                                </div>
                            </div>

                            <div className="mt-4 relative z-10">
                                <p className="text-gray-500 text-xs font-bold uppercase mb-2">Interesses Principais (Cluster)</p>
                                <div className="flex flex-wrap gap-2">
                                    {persona.topInterests.map((int, i) => (
                                        <span key={i} className="text-xs bg-gray-900 px-2 py-1 rounded text-gray-300 border border-gray-700">{int}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center text-xs text-gray-500 relative z-10">
                                <span>LTV Médio: <strong className="text-green-400">R$ {persona.ltv.toFixed(2)}</strong></span>
                                <span>Última Sincronização: {autoSync ? 'Agora mesmo (Auto)' : persona.lastSync}</span>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="bg-black/80 rounded-xl border border-gray-700 p-4 font-mono text-xs flex flex-col h-[500px] shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 animate-pulse"></div>
                    <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                        <span className="text-green-400 font-bold flex items-center gap-2">
                            <ActivityIcon className={`w-3 h-3 ${autoSync ? 'animate-pulse' : ''}`} />
                            NEXUS AUTÔNOMO {autoSync ? '[ON]' : '[OFF]'}
                        </span>
                        <span className="text-gray-600">v4.2.1</span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                        {syncLog.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                                <Server className="w-8 h-8 mb-2" />
                                <p>{autoSync ? 'Aguardando ciclo de sincronização...' : 'Aguardando comando manual...'}</p>
                            </div>
                        ) : (
                            syncLog.map((log, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-gray-300 break-words">
                                    <span className="text-blue-500">[{new Date().toLocaleTimeString()}]</span> {log}
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
