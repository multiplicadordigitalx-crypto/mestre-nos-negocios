import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const CreditBalanceWidget: React.FC<{ onRecharge?: () => void }> = ({ onRecharge }) => {
    const { user } = useAuth();

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-1.5 pr-3 flex items-center gap-3 shadow-sm">
            <div className="flex flex-col items-end px-2 border-r border-gray-800">
                <span className="text-sm font-bold text-white leading-none">{user?.creditBalance || 0}</span>
                <span className="text-[8px] text-gray-500 uppercase font-medium">Créditos</span>
            </div>
            <button
                onClick={() => onRecharge ? onRecharge() : window.location.href = '/painel/credits'}
                className="text-[10px] font-bold text-brand-primary hover:text-white uppercase transition-colors"
                title="Comprar mais créditos"
            >
                Recarregar
            </button>
        </div>
    );
};
