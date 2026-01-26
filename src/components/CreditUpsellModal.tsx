import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, ArrowRight, X } from './Icons';
import Card from './Card';
import Button from './Button';

interface UpsellModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTier: string;
    onConfirm: (upgradedTier: string) => void;
}

const UPSELL_STRATEGY = {
    starter: {
        title: "✨ Aproveite: DOBRE seus créditos!",
        current: { tier: 'starter', credits: 50, price: 24.90 },
        upgrade: { tier: 'basic', credits: 100, price: 44.90 },
        savings: "10%",
        message: "Por apenas +R$ 20, você ganha o DOBRO de créditos!",
        highlight: "Mais usado por alunos que concluem cursos completos"
    },
    basic: {
        title: "🔥 Upgrade para o MAIS VENDIDO!",
        current: { tier: 'basic', credits: 100, price: 44.90 },
        upgrade: { tier: 'popular', credits: 200, price: 79.90 },
        savings: "20%",
        message: "O Popular Pack dobra seus créditos por apenas +R$ 35!",
        highlight: "78% dos alunos escolhem este pacote"
    },
    popular: {
        title: "⭐ Ganhe 50% mais créditos!",
        current: { tier: 'popular', credits: 200, price: 79.90 },
        upgrade: { tier: 'elite', credits: 500, price: 164.90 },
        savings: "34%",
        message: "+150% de créditos por apenas +R$ 85!",
        highlight: "Melhor custo por crédito da plataforma"
    },
    pro: {
        title: "🎯 Maximize sua economia!",
        current: { tier: 'pro', credits: 300, price: 109.90 },
        upgrade: { tier: 'elite', credits: 500, price: 164.90 },
        savings: "34%",
        message: "+67% de créditos por apenas +R$ 55!",
        highlight: "Ideal para quem usa a IA diariamente"
    },
    business: {
        title: "👑 Seja um usuário Elite!",
        current: { tier: 'business', credits: 400, price: 139.90 },
        upgrade: { tier: 'elite', credits: 500, price: 164.90 },
        savings: "34%",
        message: "+25% de créditos por apenas +R$ 25!",
        highlight: "Acesso premium com maior desconto"
    }
};

export const CreditUpsellModal: React.FC<UpsellModalProps> = ({
    isOpen,
    onClose,
    selectedTier,
    onConfirm
}) => {
    const upsell = UPSELL_STRATEGY[selectedTier];

    // Não mostrar upsell para Elite e Enterprise (já são os melhores)
    if (!upsell) return null;

    const extraCost = upsell.upgrade.price - upsell.current.price;
    const extraCredits = upsell.upgrade.credits - upsell.current.credits;
    const costPerExtraCredit = extraCost / extraCredits;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full border-2 border-brand-primary/50 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-brand-primary to-purple-600 p-6 relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white/70 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <h2 className="text-2xl font-black text-white mb-2">{upsell.title}</h2>
                            <p className="text-white/90 text-sm">{upsell.message}</p>
                        </div>

                        {/* Comparison */}
                        <div className="p-6 grid grid-cols-2 gap-4">
                            {/* Current Selection */}
                            <Card className="bg-gray-800/50 border-gray-700 p-4">
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 uppercase mb-2">Sua Escolha</p>
                                    <div className="text-5xl font-black text-white mb-1">
                                        {upsell.current.credits}
                                    </div>
                                    <p className="text-sm text-gray-400 mb-4">créditos</p>
                                    <div className="text-2xl font-bold text-brand-primary">
                                        R$ {upsell.current.price.toFixed(2)}
                                    </div>
                                </div>
                            </Card>

                            {/* Upgrade Option */}
                            <Card className="bg-gradient-to-br from-brand-primary/20 to-purple-600/20 border-2 border-brand-primary p-4 relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-black px-3 py-1 rounded-full">
                                        MELHOR VALOR
                                    </span>
                                </div>
                                <div className="text-center mt-2">
                                    <p className="text-xs text-gray-300 uppercase mb-2">Upgrade Agora</p>
                                    <div className="text-5xl font-black text-white mb-1">
                                        {upsell.upgrade.credits}
                                    </div>
                                    <p className="text-sm text-gray-300 mb-4">créditos</p>
                                    <div className="text-2xl font-bold text-green-400">
                                        R$ {upsell.upgrade.price.toFixed(2)}
                                    </div>
                                    <div className="mt-2 bg-green-500/20 border border-green-500/50 rounded-lg p-2">
                                        <p className="text-xs text-green-400 font-bold">
                                            Economia de {upsell.savings}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Benefits */}
                        <div className="px-6 pb-4">
                            <div className="bg-gray-800/30 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                    <p className="text-sm text-gray-300">
                                        +{extraCredits} créditos por apenas <span className="text-brand-primary font-bold">R$ {extraCost.toFixed(2)}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <p className="text-sm text-gray-300">
                                        Cada crédito extra custa apenas <span className="text-green-400 font-bold">R$ {costPerExtraCredit.toFixed(2)}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <ArrowRight className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                    <p className="text-sm text-gray-300 italic">
                                        {upsell.highlight}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 bg-gray-900/50 flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Não, continuar com {upsell.current.credits} créditos
                            </Button>
                            <Button
                                onClick={() => onConfirm(upsell.upgrade.tier)}
                                className="flex-[2] !bg-gradient-to-r from-brand-primary to-purple-600 hover:from-brand-primary/90 hover:to-purple-600/90 font-black text-lg"
                            >
                                SIM, QUERO APROVEITAR! 🚀
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
