
import React, { useState, useEffect } from 'react';
import {
    ActivityIcon, Server, Database, Globe, CheckCircle, RefreshCw,
    Brain, ShieldAlert, ShieldCheck
} from '../components/Icons';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { HealthMetric } from './system-health/types';
import { nexusCore } from '../services/NexusCore';

// Components
import { MetricCard } from './system-health/components/MetricCard';
import { DetailedModal } from './system-health/components/DetailedModal';
import { SocialGrowthWidget } from './system-health/widgets/SocialGrowthWidget';
import { AiRoiWidget } from './system-health/widgets/AiRoiWidget';
import { AiCostWidget } from './system-health/widgets/AiCostWidget';
import { SystemLogsCard } from './system-health/cards/SystemLogsCard';
import { SecurityStatusCard } from './system-health/cards/SecurityStatusCard';
import { SecurityDetailModal } from './system-health/modals/SecurityDetailModal';

// Details
import { InfrastructureDetail } from './system-health/details/InfrastructureDetail';
import { DatabaseDetail } from './system-health/details/DatabaseDetail';
import { AiStatusDetail } from './system-health/details/AiStatusDetail';

// --- GUARDIAN MONITOR COMPONENT (Embedded) ---
const GuardianMonitor: React.FC = () => {
    const [status, setStatus] = useState<any>(nexusCore.getStatus());

    useEffect(() => {
        const interval = setInterval(() => {
            setStatus(nexusCore.getStatus());
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = () => {
        if (status.health > 80) return 'text-green-500';
        if (status.health > 40) return 'text-yellow-500';
        return 'text-red-500';
    }

    return (
        <div className={`w-full py-1.5 px-4 flex justify-between items-center text-xs font-bold uppercase tracking-widest border-b transition-colors duration-500 ${status.health > 80 ? 'bg-green-900/10 border-green-500/20 text-green-500' :
                'bg-red-900/30 border-red-500/50 text-red-400 animate-pulse'
            }`}>
            <div className="flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${status.isProcessing ? 'animate-spin-slow' : ''}`} />
                <span>NEXUS CORE: {status.mode.toUpperCase()} MODE • SAÚDE {status.health}%</span>
            </div>
            <div className="hidden md:flex items-center gap-4">
                <span className="flex items-center gap-1"><Server className="w-3 h-3" /> FILA: {status.queueSize}</span>
                <span className="flex items-center gap-1"><Database className="w-3 h-3" /> LEARNING: ON</span>
            </div>
        </div>
    );
};

const SystemHealthPage: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<'infra' | 'db' | 'ai' | 'biz' | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [aiIntegrations, setAiIntegrations] = useState<any[]>([]);
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

    // Mock Metrics Data (Simplified for display)
    const serverMetrics: HealthMetric[] = [
        { id: 'cpu', label: 'CPU Load', value: 32, unit: '%', status: 'good' },
        { id: 'ram', label: 'Memory', value: 4.2, unit: 'GB', status: 'good' },
        { id: 'disk', label: 'Disk', value: 68, unit: '%', status: 'warning' },
    ];

    const dbMetrics: HealthMetric[] = [
        { id: 'reads', label: 'Reads/s', value: 450, unit: '', status: 'good' },
        { id: 'writes', label: 'Writes/s', value: 120, unit: '', status: 'good' },
        { id: 'latency', label: 'Latency', value: 45, unit: 'ms', status: 'good' },
    ];

    const aiMetrics: HealthMetric[] = [
        { id: 'reqs', label: 'Requests/min', value: 85, unit: '', status: 'good' },
        { id: 'errors', label: 'Error Rate', value: 0.2, unit: '%', status: 'good' },
        { id: 'cost', label: 'Cost/Hr', value: 4.50, unit: 'R$', status: 'warning' },
    ];

    const bizMetrics: HealthMetric[] = [
        { id: 'active', label: 'Active Users', value: 1240, unit: '', status: 'good' },
        { id: 'sales', label: 'Sales (1h)', value: 12, unit: '', status: 'good' },
        { id: 'tickets', label: 'Open Tickets', value: 5, unit: '', status: 'good' },
    ];

    useEffect(() => {
        const mockAIs = [
            { id: '1', name: 'Google Gemini 2.5', status: 'online', latency: '120ms', uptime: '99.9%', type: ['text', 'vision'], api: 'Google Cloud' },
            { id: '2', name: 'OpenAI GPT-4o', status: 'online', latency: '240ms', uptime: '99.8%', type: ['text'], api: 'OpenAI API' },
            { id: '3', name: 'Anthropic Claude 3.5', status: 'online', latency: '180ms', uptime: '99.9%', type: ['text', 'code'], api: 'Anthropic API' },
            { id: '4', name: 'Flux Pro (Image)', status: 'online', latency: '2.5s', uptime: '99.5%', type: ['image'], api: 'Replicate' },
            { id: '5', name: 'Google Veo (Video)', status: 'warning', latency: '8.0s', uptime: '92.0%', type: ['video'], api: 'Google Cloud' },
            { id: '6', name: 'ElevenLabs', status: 'online', latency: '450ms', uptime: '99.9%', type: ['audio'], api: 'ElevenLabs API' },
        ];
        setAiIntegrations(mockAIs);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            toast.success("Métricas atualizadas.");
        }, 1000);
    };

    const lastUpdate = new Date();

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200">
            <GuardianMonitor />

            <div className="p-4 md:p-8 animate-fade-in space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-white flex items-center gap-3">
                            <ActivityIcon className="w-8 h-8 text-brand-primary" />
                            Mission Control Center
                        </h1>
                        <p className="text-gray-400 mt-1 flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Monitoramento em Tempo Real • {lastUpdate.toLocaleTimeString()}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 flex flex-col items-end">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Status Global</span>
                            <span className="text-green-400 font-bold text-sm flex items-center gap-1"><CheckCircle className="w-3 h-3" /> OPERACIONAL</span>
                        </div>
                        <Button onClick={handleRefresh} variant="secondary" className="!p-3">
                            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                {/* Social Growth Widget */}
                <SocialGrowthWidget />

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <MetricCard
                        title="Infraestrutura (Server)"
                        icon={<Server className="w-5 h-5 text-blue-400" />}
                        metrics={serverMetrics}
                        color="text-blue-400"
                        onClick={() => setSelectedSection('infra')}
                    />
                    <MetricCard
                        title="Banco de Dados"
                        icon={<Database className="w-5 h-5 text-purple-400" />}
                        metrics={dbMetrics}
                        color="text-purple-400"
                        onClick={() => setSelectedSection('db')}
                    />
                    <MetricCard
                        title="Inteligência Artificial"
                        icon={<Brain className="w-5 h-5 text-yellow-400" />}
                        metrics={aiMetrics}
                        color="text-yellow-400"
                        onClick={() => setSelectedSection('ai')}
                    />
                    <MetricCard
                        title="Operação & Negócio"
                        icon={<Globe className="w-5 h-5 text-green-400" />}
                        metrics={bizMetrics}
                        color="text-green-400"
                        onClick={() => setSelectedSection('biz')}
                    />
                </div>

                {/* AI ROI WIDGET */}
                <div className="animate-fade-in">
                    <AiRoiWidget />
                </div>

                {/* AI COST WIDGET */}
                <div className="animate-fade-in">
                    <AiCostWidget />
                </div>

                {/* Logs & Alerts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <SystemLogsCard />
                    <SecurityStatusCard onOpenMap={() => setIsSecurityModalOpen(true)} />
                </div>

                {/* --- DETAILED MODALS --- */}

                <DetailedModal isOpen={selectedSection === 'infra'} onClose={() => setSelectedSection(null)} title="Detalhes de Infraestrutura">
                    <InfrastructureDetail />
                </DetailedModal>

                <DetailedModal isOpen={selectedSection === 'db'} onClose={() => setSelectedSection(null)} title="Saúde do Banco de Dados (Firestore)">
                    <DatabaseDetail />
                </DetailedModal>

                <DetailedModal isOpen={selectedSection === 'ai'} onClose={() => setSelectedSection(null)} title="Status da Inteligência Artificial">
                    <AiStatusDetail metrics={aiMetrics} aiIntegrations={aiIntegrations} />
                </DetailedModal>

                <SecurityDetailModal isOpen={isSecurityModalOpen} onClose={() => setIsSecurityModalOpen(false)} />
            </div>
        </div>
    );
};

export default SystemHealthPage;
