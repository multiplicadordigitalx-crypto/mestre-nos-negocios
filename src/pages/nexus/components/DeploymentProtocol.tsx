
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle } from '../../../components/Icons';
import Card from '../../../components/Card';

interface DeploymentStage {
    id: string;
    name: string;
    status: 'idle' | 'running' | 'success' | 'failed';
    progress: number;
    details: string;
}

const DeploymentProtocol: React.FC = () => {
    const [stages, setStages] = useState<DeploymentStage[]>([
        { id: 'sandbox', name: 'Ambiente Seguro (Sandbox)', status: 'success', progress: 100, details: 'Código isolado validado.' },
        { id: 'security', name: 'Varredura de Segurança', status: 'running', progress: 65, details: 'Verificando vulnerabilidades...' },
        { id: 'integration', name: 'Teste de Integração', status: 'idle', progress: 0, details: 'Aguardando aprovação de segurança.' },
        { id: 'production', name: 'Deploy em Produção', status: 'idle', progress: 0, details: 'Bloqueado.' },
    ]);

    useEffect(() => {
        // Simulation of the protocol running
        const interval = setInterval(() => {
            setStages(prev => {
                const newStages = [...prev];
                const runningIdx = newStages.findIndex(s => s.status === 'running');
                if (runningIdx !== -1) {
                    if (newStages[runningIdx].progress < 100) {
                        newStages[runningIdx].progress += 5;
                    } else {
                        newStages[runningIdx].status = 'success';
                        if (runningIdx + 1 < newStages.length) {
                            newStages[runningIdx + 1].status = 'running';
                        }
                    }
                }
                return newStages;
            });
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="bg-gray-900 border border-brand-primary/30 p-6 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-6 h-6 text-brand-primary" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Protocolo de Segurança & Implementação</h3>
            </div>
            
            <div className="space-y-6 relative z-10">
                {stages.map((stage, idx) => (
                    <div key={stage.id} className="relative">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold ${
                                    stage.status === 'success' ? 'border-green-500 bg-green-500/20 text-green-500' :
                                    stage.status === 'running' ? 'border-brand-primary bg-brand-primary/20 text-brand-primary' :
                                    stage.status === 'failed' ? 'border-red-500 bg-red-500/20 text-red-500' :
                                    'border-gray-700 bg-gray-800 text-gray-500'
                                }`}>
                                    {stage.status === 'success' ? <CheckCircle className="w-3 h-3"/> : idx + 1}
                                </div>
                                <span className={`text-sm font-bold ${stage.status === 'idle' ? 'text-gray-500' : 'text-white'}`}>
                                    {stage.name}
                                </span>
                            </div>
                            <span className="text-xs text-gray-400 font-mono">{stage.details}</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden ml-9 w-[calc(100%-2.25rem)]">
                            <motion.div 
                                className={`h-full ${stage.status === 'success' ? 'bg-green-500' : 'bg-brand-primary'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${stage.progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        {idx < stages.length - 1 && (
                            <div className={`absolute left-3 top-8 w-0.5 h-6 ${stages[idx+1].status !== 'idle' ? 'bg-brand-primary/50' : 'bg-gray-800'}`}></div>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        </Card>
    );
};

export default DeploymentProtocol;
