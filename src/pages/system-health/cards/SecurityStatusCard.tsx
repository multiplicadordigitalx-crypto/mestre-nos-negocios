
import React from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { ShieldCheck, LockClosed } from '../../../components/Icons';

export const SecurityStatusCard: React.FC<{ onOpenMap: () => void }> = ({ onOpenMap }) => {
    return (
        <Card className="p-6 bg-gray-800 border-gray-700 h-[400px] flex flex-col">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-400"/> Segurança & Acesso
            </h3>
            
            <div className="space-y-6 flex-1">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-400 text-xs uppercase font-bold">WAF Status</span>
                        <span className="text-green-400 text-xs font-bold">ATIVO</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full w-full animate-pulse"></div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">0 Ameaças detectadas hoje</p>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-400 text-xs uppercase font-bold">Auth Failures</span>
                        <span className="text-yellow-400 text-xs font-bold">12 (Última hora)</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-yellow-500 h-full w-[15%]"></div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">Tentativas de força bruta bloqueadas</p>
                </div>

                <div className="mt-auto">
                    <Button onClick={onOpenMap} variant="secondary" className="w-full !text-xs !bg-red-900/20 text-red-300 border border-red-900/50 hover:!bg-red-900/40">
                        <LockClosed className="w-3 h-3 mr-2"/> Visualizar Mapa de Ameaças
                    </Button>
                </div>
            </div>
        </Card>
    );
};
