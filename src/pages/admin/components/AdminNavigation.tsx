
import React from 'react';
import {
    ShieldCheck, FileText, Link as LinkIcon,
    ShoppingBag, Briefcase,
    TrendingUp, MessageSquare, DollarSign, BarChart3, Wallet, Activity,
    Unlock, Smartphone, Settings
} from '../../../components/Icons';

// Helper components needed for icons
import { CheckCircle, Trophy } from '../../../components/Icons';

export type AdminView = 'dashboard' | 'app_products' | 'requests' | 'influencers' | 'sales_team' | 'verification' | 'levels' | 'chat' | 'refunds' | 'access_recovery' | 'financial' | 'team' | 'productivity' | 'audit' | 'evolution' | 'settings' | 'commissions' | 'withdrawals';

interface AdminNavigationProps {
    currentView: AdminView;
    setCurrentView: (view: AdminView) => void;
    pendingCount: number;
    isSuperAdmin: boolean;
    canViewAudit?: boolean;
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ currentView, setCurrentView, pendingCount, isSuperAdmin, canViewAudit }) => {

    const NavButton = ({ view, label, icon, badge }: { view: AdminView, label: string, icon: React.ReactNode, badge?: number }) => (
        <button
            onClick={() => setCurrentView(view)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${currentView === view ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
        >
            {icon}
            {label}
            {typeof badge === 'number' && badge > 0 ? (
                <span className="ml-1 bg-brand-primary text-black text-xs px-1.5 rounded-full">{badge}</span>
            ) : null}
        </button>
    );

    return (
        <div className="flex flex-wrap gap-2 bg-gray-800 p-1 rounded-lg overflow-x-auto max-w-full custom-scrollbar mb-6 border border-gray-700">
            <NavButton view="dashboard" label="Dashboard" icon={<ShieldCheck className="w-4 h-4" />} />
            <NavButton view="app_products" label="Produtos" icon={<ShoppingBag className="w-4 h-4 text-green-400" />} />
            <NavButton view="requests" label="Pedidos" icon={<LinkIcon className="w-4 h-4" />} badge={pendingCount} />
            <NavButton view="influencers" label="Influencers" icon={<Briefcase className="w-4 h-4" />} />
            <NavButton view="sales_team" label="Vendas" icon={<TrendingUp className="w-4 h-4 text-blue-400" />} />
            <NavButton view="verification" label="Verificação" icon={<CheckCircle className="w-4 h-4 text-blue-400" />} />
            <NavButton view="levels" label="Níveis" icon={<Trophy className="w-4 h-4 text-yellow-400" />} />
            <NavButton view="chat" label="Chat" icon={<MessageSquare className="w-4 h-4" />} />
            <NavButton view="refunds" label="Reembolsos" icon={<DollarSign className="w-4 h-4 text-red-400" />} />
            <NavButton view="financial" label="Financeiro" icon={<BarChart3 className="w-4 h-4" />} />
            <NavButton view="withdrawals" label="Saques" icon={<DollarSign className="w-4 h-4 text-green-400" />} />
            <NavButton view="commissions" label="Comissões" icon={<Wallet className="w-4 h-4 text-green-400" />} />
            <NavButton view="productivity" label="Produtividade" icon={<Activity className="w-4 h-4" />} />
            <NavButton view="access_recovery" label="Acesso" icon={<Unlock className="w-4 h-4" />} />

            {isSuperAdmin && (
                <>
                    <div className="w-px bg-gray-600 mx-2"></div>
                    <NavButton view="team" label="Equipe" icon={<ShieldCheck className="w-4 h-4" />} />
                </>
            )}

            {(isSuperAdmin || canViewAudit) && (
                <NavButton view="audit" label="Auditoria" icon={<FileText className="w-4 h-4" />} />
            )}

            {isSuperAdmin && (
                <>
                    <NavButton view="settings" label="Configs" icon={<Settings className="w-4 h-4" />} />
                </>
            )}
        </div>
    );
};

export default AdminNavigation;
