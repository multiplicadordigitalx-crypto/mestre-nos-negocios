
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRouter } from '../services/apiRouter';
import { getSystemStatus } from '../services/mockFirebase';
import { Brain, RefreshCw, Server, ShieldCheck, Zap } from './Icons';

export const AIApiGate: React.FC = () => {
    const [isWaiting, setIsWaiting] = useState(false);
    const [queueCount, setQueueCount] = useState(0);
    const [lastSync, setLastSync] = useState<number>(Date.now());

    useEffect(() => {
        const interval = setInterval(async () => {
            const status = await getSystemStatus();
            const currentQueue = apiRouter.getQueueCount();
            
            setIsWaiting(!status.apiReady && currentQueue > 0);
            setQueueCount(currentQueue);
            setLastSync(status.lastSync);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if (!isWaiting) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] w-full max-w-md px-4"
            >
                <div className="bg-gray-900/95 backdrop-blur-xl border-2 border-brand-primary/50 rounded-2xl p-5 shadow-[0_0_40px_rgba(250,204,21,0.2)]">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-brand-primary/10 rounded-xl relative">
                            <Brain className="w-8 h-8 text-brand-primary animate-pulse" />
                            <div className="absolute -top-1 -right-1">
                                <span className="flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-primary"></span>
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="text-white font-black uppercase text-xs tracking-widest">Nexus Hub Sync</h4>
                                <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-bold">EM FILA</span>
                            </div>
                            <p className="text-gray-300 text-sm font-medium leading-tight">
                                {queueCount} tarefa{queueCount > 1 ? 's' : ''} de IA aguardando Admin API...
                            </p>
                            <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1 font-mono">
                                <Server className="w-3 h-3"/> Conexão isolada para segurança 50X.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             <RefreshCw className="w-3 h-3 text-brand-primary animate-spin" />
                             <span className="text-[10px] text-gray-400 uppercase font-bold">Tentando Reconectar</span>
                        </div>
                        <div className="text-[9px] text-gray-600 font-mono">
                            LAST_SYNC: {new Date(lastSync).toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
