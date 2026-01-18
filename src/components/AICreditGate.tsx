
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { Zap, LockClosed, ShoppingBag, ShieldCheck } from './Icons';
import { LoadingSpinner } from './LoadingSpinner';
import { getToolCosts } from '../services/mockFirebase';

interface AICreditGateProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onOpenShop: () => void;
    toolId?: string;       
    cost?: number;         
    balance: number;
    title?: string;
    description?: string;
}

const MotionDiv = motion.div as any;

export const AICreditGate: React.FC<AICreditGateProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    onOpenShop, 
    toolId, 
    cost: explicitCost,
    balance,
    title = "Autorizar Nexus IA",
    description = "Esta operação utilizará inteligência artificial de ponta para gerar seu conteúdo exclusivo."
}) => {
    const [finalCost, setFinalCost] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            const fetchCost = async () => {
                if (explicitCost !== undefined) {
                    setFinalCost(explicitCost);
                } 
                else if (toolId) {
                    try {
                        const tools = await getToolCosts();
                        const tool = tools.find(t => t.toolId === toolId);
                        setFinalCost(tool ? tool.costPerTask : 5);
                    } catch (e) {
                        setFinalCost(5);
                    }
                } else {
                    setFinalCost(5);
                }
                setLoading(false);
            };
            fetchCost();
        }
    }, [isOpen, toolId, explicitCost]);

    if (!isOpen) return null;

    const hasBalance = balance >= finalCost;
    const remainingBalance = Math.max(0, balance - finalCost);

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[250] p-4 backdrop-blur-md">
            <MotionDiv 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-gradient-to-b from-gray-900 to-[#0f0f12] w-full max-w-sm rounded-[2rem] border border-purple-500/50 p-0 shadow-[0_0_60px_rgba(168,85,247,0.15)] relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 shadow-[0_0_20px_rgba(168,85,247,0.8)]"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                <div className="p-8 text-center relative z-10">
                    {loading ? (
                        <div className="py-12"><LoadingSpinner size="lg" /></div>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-gray-800/80 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-purple-500/30 shadow-lg relative group">
                                <Zap className="w-10 h-10 text-purple-400 animate-pulse drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
                                <div className="absolute inset-0 rounded-full border border-purple-500/50 animate-ping opacity-20"></div>
                            </div>
                            
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 leading-none">{title}</h3>
                            <p className="text-gray-400 text-xs leading-relaxed mb-6 px-2 font-medium">{description}</p>
                            
                            <div className="bg-black/40 rounded-xl p-4 mb-6 border border-gray-700/50 shadow-inner">
                                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-700/50">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Custo da Operação</span>
                                    <span className="text-white font-mono font-bold text-lg">-{finalCost.toFixed(2)} <span className="text-xs text-gray-500">cr</span></span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Seu Saldo Final</span>
                                    <span className={`font-mono font-bold text-sm ${hasBalance ? 'text-green-400' : 'text-red-400'}`}>
                                        {remainingBalance.toFixed(2)} créditos
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {hasBalance ? (
                                    <Button 
                                        onClick={onConfirm} 
                                        className="w-full !py-4 font-black uppercase tracking-widest text-xs !bg-green-600 hover:!bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] rounded-xl border-none"
                                    >
                                        <Zap className="w-4 h-4 mr-2 fill-current"/> CONFIRMAR E GERAR
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={onOpenShop} 
                                        className="w-full !py-4 !bg-yellow-500 hover:!bg-yellow-400 font-black uppercase tracking-widest text-xs text-black shadow-[0_0_20px_rgba(234,179,8,0.3)] rounded-xl border-none flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBag className="w-4 h-4 mb-0.5"/> SALDO INSUFICIENTE • RECARREGAR
                                    </Button>
                                )}
                                <button 
                                    onClick={onClose} 
                                    className="w-full py-3 text-[10px] text-gray-500 hover:text-white font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                >
                                    <LockClosed className="w-3 h-3"/> Cancelar Operação
                                </button>
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-2 opacity-40">
                                <ShieldCheck className="w-3 h-3 text-gray-400" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Paridade: 1 Crédito = R$ 1,00</span>
                            </div>
                        </>
                    )}
                </div>
            </MotionDiv>
        </div>
    );
};
