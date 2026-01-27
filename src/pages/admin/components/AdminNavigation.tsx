
import React from 'react';
import {
    ShieldCheck, FileText, Link as LinkIcon,
    ShoppingBag, Briefcase,
    TrendingUp, MessageSquare, DollarSign, BarChart3, Wallet, ActivityIcon,
    Unlock, Smartphone, Settings, CreditCard, Users
} from '../../../components/Icons';

// Helper components needed for icons
import { CheckCircle, Trophy } from '../../../components/Icons';

export type AdminView = 'dashboard' | 'app_products' | 'requests' | 'influencers' | 'sales_team' | 'verification' | 'levels' | 'chat' | 'community' | 'refunds' | 'access_recovery' | 'financial' | 'team' | 'productivity' | 'audit' | 'evolution' | 'settings' | 'commissions' | 'withdrawals' | 'lucpay_center';

interface AdminNavigationProps {
    currentView: AdminView;
    setCurrentView: (view: AdminView) => void;
    pendingCount: number;
    isSuperAdmin: boolean;
    canViewAudit?: boolean;
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ currentView, setCurrentView, pendingCount, isSuperAdmin, canViewAudit }) => {

    const NavButton = ({ view, label, icon, badge }: { view: AdminView, label: string, icon: React.ReactNode, badge?: number | string }) => (
        <button
            onClick={() => setCurrentView(view)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${currentView === view ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
        >
            {icon}
            {label}
            {badge ? (
                <span className={`ml-1 text-[10px] px-1.5 rounded-full font-bold ${typeof badge === 'number' ? 'bg-brand-primary text-black' : 'bg-indigo-500 text-white'}`}>
                    {badge}
                </span>
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
            <NavButton view="community" label="Comunidade" icon={<Users className="w-4 h-4 text-indigo-400" />} />
            <NavButton view="refunds" label="Reembolsos" icon={<DollarSign className="w-4 h-4 text-red-400" />} />
            <NavButton view="financial" label="Financeiro" icon={<BarChart3 className="w-4 h-4" />} />
            <NavButton view="withdrawals" label="Saques" icon={<DollarSign className="w-4 h-4 text-green-400" />} />
            <NavButton view="commissions" label="Comissões" icon={<Wallet className="w-4 h-4 text-green-400" />} />
            <NavButton view="lucpay_center" label="LucPay (Stripe)" icon={<CreditCard className="w-4 h-4 text-indigo-400" />} badge="NOVO" />
            <NavButton view="productivity" label="Produtividade" icon={<ActivityIcon className="w-4 h-4" />} />
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
