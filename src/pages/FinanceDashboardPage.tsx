import React, { useState } from 'react';
import { FinanceLayout } from '@/layouts/FinanceLayout';
import FinancialView from './admin/views/FinancialView';
import { FinancialSupportView } from './admin/views/FinancialSupportView'; // Verified Import
import CommissionsView from './admin/views/CommissionsView';
import AccountsPayableView from './finance/views/AccountsPayableView';
import FinancialAuditView from './finance/views/FinancialAuditView';
import { useAuth } from '@/hooks/useAuth';
import { FinanceProfileView } from './admin/views/FinanceProfileView';
import HRManagerDashboard from './admin/views/HRManagerDashboard';
import FinanceRequestQueue from '@/components/FinanceRequestQueue';
import { TeamChatView } from './admin/views/TeamChatView';
import { WithdrawalsManagerView } from './finance/views/WithdrawalsManagerView';

const FinanceDashboardPage: React.FC = () => {
    const { user, permissions } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'team-chat' | 'commissions' | 'payables' | 'audit' | 'requests' | 'profile' | 'hr-approvals' | 'withdrawals'>('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <FinancialView user={user} permissions={permissions} />;
            case 'chat':
                return <FinancialSupportView user={user} />;
            case 'team-chat':
                return <TeamChatView user={user} />;
            case 'commissions':
                return <CommissionsView user={user} permissions={permissions} />;
            case 'payables':
                return <AccountsPayableView />;
            case 'requests':
                return <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4">Solicitações de Crédito Pendentes</h2>
                        <FinanceRequestQueue />
                    </div>
                </div>;
            case 'audit':
                return <FinancialAuditView user={user} />;
            case 'profile':
                return <FinanceProfileView user={user} />;
            case 'hr-approvals':
                return <HRManagerDashboard />;
            case 'withdrawals':
                return <WithdrawalsManagerView />;
            default:
                return <FinancialView user={user} permissions={permissions} />;
        }
    };

    return (
        <FinanceLayout
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as any)}
            user={user}
        >
            {/* Header Content - Hidden in Layout but we can add page-specific top content here if needed, 
                 but Layout handles the main header. We just render the main view. */}
            <div className={`transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${(activeTab === 'chat' || activeTab === 'team-chat') ? 'h-full flex flex-col min-h-0' : 'min-h-[600px]'}`}>
                {renderContent()}
            </div>
        </FinanceLayout>
    );
};

export default FinanceDashboardPage;
