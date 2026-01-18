
import React from 'react';
import { Activity, RefreshCw } from '../../../components/Icons';
import Button from '../../../components/Button';
import { SankeyFunilMestreNegocios } from '../components/SankeyFunilMestreNegocios';
import NexusStrategyOrchestrator from '../components/NexusStrategyOrchestrator';

export const StrategiesTab: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <SankeyFunilMestreNegocios />
            
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg flex flex-col md:flex-row justify-between gap-6">
                 <div className="flex-1">
                     <h3 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-brand-primary"/> Análise de Fluxo (Autônoma)
                     </h3>
                     <p className="text-gray-400 text-sm">
                         O sistema está monitorando o diagrama acima em tempo real. 
                         <br/>Diagnóstico Atual: <span className="text-green-400 font-bold">Fluxo Saudável</span>. Retenção acima da média em todas as etapas.
                         <br/>Ação do Nexus: Buscando micro-otimizações para aumentar o ROAS com menor custo possível.
                     </p>
                 </div>
                 <div className="flex items-center gap-3">
                     <Button className="!bg-blue-600 hover:!bg-blue-500 !text-xs">
                         <RefreshCw className="w-3 h-3 mr-2"/> Atualizar Dados
                     </Button>
                 </div>
            </div>

            <NexusStrategyOrchestrator />
        </div>
    );
};
