
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, TrendingUp, DollarSign, ActivityIcon, Database, Brain, ShieldCheck, RefreshCw, BarChart3, Target, Users, Trophy } from '../components/Icons';
import NexusDataCollector from './nexus/components/NexusDataCollector';
import NexusActionGenerator from './nexus/components/NexusActionGenerator';
import NexusFinancialAlignment from './nexus/components/NexusFinancialAlignment';
import NexusToolOptimizer from './nexus/components/NexusToolOptimizer';
import NexusEvolutionLoop from './nexus/components/NexusEvolutionLoop';
import NexusChat from './nexus/components/NexusChat';
import DeploymentProtocol from './nexus/components/DeploymentProtocol';
import EventsManagerCard from './nexus/components/EventsManagerCard';
import Card from '../components/Card';
import Button from '../components/Button';

const NexusCfoAdvisor: React.FC = () => {
    return (
        <Card className="bg-gray-800 border-l-4 border-l-brand-primary p-6 relative overflow-hidden mt-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                        <DollarSign className="w-6 h-6 text-brand-primary" /> Nexus CFO Strategy (Etapa 5)
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">
                        Otimização de lucro global. A IA analisa margem líquida e sugere ajustes de preço e bônus.
                    </p>
                </div>
                <div className="bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/30 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                    <span className="text-brand-primary text-xs font-bold">ANÁLISE DE MARGEM</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">LTV Médio Base</p>
                    <p className="text-xl font-black text-white">R$ 542,00</p>
                    <span className="text-[9px] text-green-400">+5% vs mês anterior</span>
                </div>
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">CAC Médio IA</p>
                    <p className="text-xl font-black text-white">R$ 12,40</p>
                    <span className="text-[9px] text-green-400">Eficiência Máxima</span>
                </div>
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Margem Líquida</p>
                    <p className="text-xl font-black text-green-400">82.4%</p>
                    <span className="text-[9px] text-gray-400">Dedução de impostos inclusa</span>
                </div>
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">VPL Projetado</p>
                    <p className="text-xl font-black text-blue-400">R$ 2.1M</p>
                    <span className="text-[9px] text-blue-400">Ciclo de 12 meses</span>
                </div>
            </div>

            <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl flex gap-4 items-center">
                <Brain className="w-8 h-8 text-purple-400 shrink-0" />
                <div>
                    <h4 className="text-sm font-bold text-white uppercase">Veredito CFO IA</h4>
                    <p className="text-xs text-gray-400 italic">"A saúde financeira da plataforma é excepcional. Recomendamos aumentar o limite de créditos do plano 'Pro' para atrair mais usuários para a camada de retenção, onde o custo marginal da IA é menor."</p>
                </div>
            </div>
        </Card>
    );
}

const NexusAIPage: React.FC = () => {
    return (
        <div className="p-6 animate-fade-in space-y-6 pb-20">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-green-400 rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
                    <Cpu className="w-6 h-6 text-black" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                        Nexus <span className="text-brand-primary">AI</span>
                    </h1>
                    <p className="text-gray-400 text-sm">Central de Inteligência do Admin • Monitoramento Global</p>
                </div>
            </div>

            <NexusDataCollector />
            <NexusActionGenerator />
            <NexusFinancialAlignment />
            <NexusCfoAdvisor />
            <NexusToolOptimizer />
            <NexusEvolutionLoop />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <NexusChat />
                </div>
                <div className="space-y-6">
                    <DeploymentProtocol />
                    <EventsManagerCard />
                </div>
            </div>
        </div>
    );
};

export default NexusAIPage;
