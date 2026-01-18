import React, { useState } from 'react';
import CertificateApprovalQueue from './CertificateApprovalQueue';
import HRProductivityView from './HRProductivityView';
import HRTeamManagementView from './HRTeamManagementView';
import Button from '../../../components/Button';
import { FileText, Zap, Users } from '../../../components/Icons';
import { useAuth } from '@/hooks/useAuth';

const HRManagerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'approvals' | 'productivity' | 'team'>('team');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-brand-primary" /> Gestão de Pessoas (RH)
                    </h2>
                    <p className="text-gray-400 text-sm">Central unificada de RH, Produtividade e Aprovações.</p>
                </div>
            </div>

            <div className="flex gap-2 border-b border-gray-700 pb-1 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('team')}
                    className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'team' ? 'border-brand-primary text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    <Users className="w-4 h-4" /> Colaboradores & NPS
                </button>
                <button
                    onClick={() => setActiveTab('productivity')}
                    className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'productivity' ? 'border-brand-primary text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    <Zap className="w-4 h-4" /> Produtividade Diária (IA)
                </button>
                <button
                    onClick={() => setActiveTab('approvals')}
                    className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'approvals' ? 'border-brand-primary text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    <FileText className="w-4 h-4" /> Atestados & Solicitações
                </button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'team' && <HRTeamManagementView user={user} />}
                {activeTab === 'approvals' && <CertificateApprovalQueue />}
                {activeTab === 'productivity' && <HRProductivityView />}
            </div>
        </div>
    );
};

export default HRManagerDashboard;
