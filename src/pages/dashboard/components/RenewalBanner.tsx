
import React from 'react';
import Button from '../../../components/Button';
import { Clock } from '../../../components/Icons';

interface RenewalBannerProps {
  daysRemaining: number;
  onOpenRenewal: () => void;
}

export const RenewalBanner: React.FC<RenewalBannerProps> = ({ daysRemaining, onOpenRenewal }) => {
  return (
    <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-red-400 animate-pulse" />
            <div>
                <p className="text-white font-bold text-sm">Acesso expira em {daysRemaining} dias</p>
                <p className="text-red-200 text-xs">Renove agora por apenas R$97</p>
            </div>
        </div>
        <Button onClick={onOpenRenewal} className="!bg-red-600 hover:!bg-red-500 !py-2 !px-4 !text-xs w-full sm:w-auto">
            RENOVAR AGORA
        </Button>
    </div>
  );
};
