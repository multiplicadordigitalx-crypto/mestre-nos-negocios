
import React, { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { Zap, CreditCard, CheckCircle, ArrowRight, ShieldCheck, History } from '@/components/Icons';
import { motion } from 'framer-motion';
import { createCreditRechargeSession } from '@/services/stripeService';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

const RECHARGE_PACKS = [
    { id: 'start', name: 'Starter Pack', credits: 50, price: 49.90, popular: false, description: 'Ideal para experimentação e pequenos ajustes.' },
    { id: 'pro', name: 'Pro Accelerator', credits: 250, price: 197.00, popular: true, description: 'O melhor custo-benefício para produtores ativos.' },
    { id: 'master', name: 'Master Scaler', credits: 1000, price: 697.00, popular: false, description: 'Escala total. Uso ilimitado das orquestrações Nexus.' },
];

const RechargeView: React.FC = () => {
    const { user } = useAuth();
    const [loadingPack, setLoadingPack] = useState<string | null>(null);

    const handleRecharge = async (pack: typeof RECHARGE_PACKS[0]) => {
        setLoadingPack(pack.id);
        try {
            const checkoutUrl = await createCreditRechargeSession(pack.price, pack.credits);
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            }
        } catch (error: any) {
            toast.error(error.message || "Erro ao iniciar compra. Tente novamente.");
        } finally {
            setLoadingPack(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="text-center md:text-left">
                <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3 justify-center md:justify-start">
                    <Zap className="w-10 h-10 text-brand-primary" fill="currentColor" /> Recarregar Créditos
                </h1>
                <p className="text-gray-400 max-w-2xl text-lg">
                    Adquira créditos para usar as inteligências artificiais e automações do Mestre IA.
                    Seus créditos nunca expiram e podem ser usados em qualquer ferramenta da plataforma.
                </p>
            </div>

            {/* Credit Balance Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-brand-primary/20 to-transparent border-brand-primary/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-brand-primary/20 group-hover:text-brand-primary/40 transition-colors">
                        <Zap className="w-20 h-20" />
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Saldo Atual</p>
                    <h2 className="text-5xl font-black text-white mb-2">
                        {user?.creditBalance || 0} <span className="text-xl font-normal text-gray-500">Créditos</span>
                    </h2>
                    <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                        <CheckCircle className="w-4 h-4" /> CONTA ATIVA & PRONTA PARA USO
                    </div>
                </Card>

                <div className="md:col-span-2 bg-gray-900/50 rounded-2xl border border-gray-800 p-6 flex flex-col justify-center">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">Pagamento 100% Seguro</h3>
                            <p className="text-gray-400 text-sm">
                                Utilizamos a infraestrutura do Stripe para processar seus pagamentos.
                                Aceitamos Cartão de Crédito, Pix e Boleto com liberação imediata para Pix e Cartão.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Packs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {RECHARGE_PACKS.map((pack) => (
                    <motion.div
                        key={pack.id}
                        whileHover={{ y: -8 }}
                        className={`relative rounded-3xl p-8 border-2 transition-all ${pack.popular
                                ? 'bg-gray-800 border-brand-primary shadow-[0_0_40px_rgba(var(--brand-primary-rgb),0.15)] ring-1 ring-brand-primary/50'
                                : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                            }`}
                    >
                        {pack.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-black text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg">
                                Mais Popular
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-xl font-black text-white mb-2">{pack.name}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{pack.description}</p>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white">{pack.credits}</span>
                                <span className="text-gray-400 font-bold">Créditos</span>
                            </div>
                            <div className="text-brand-primary font-black text-lg mt-2">
                                R$ {pack.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">
                                Apenas R$ {(pack.price / pack.credits).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por crédito
                            </div>
                        </div>

                        <Button
                            onClick={() => handleRecharge(pack)}
                            isLoading={loadingPack === pack.id}
                            className={`w-full !py-4 font-black text-lg flex items-center justify-center gap-3 ${pack.popular
                                    ? '!bg-brand-primary !text-black hover:scale-105 transition-transform'
                                    : '!bg-gray-800 !text-white hover:!bg-gray-700'
                                }`}
                        >
                            COMPRAR AGORA <ArrowRight className="w-5 h-5" />
                        </Button>

                        <ul className="mt-8 space-y-3">
                            <li className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                <CheckCircle className="w-4 h-4 text-green-500" /> Liberação Imediata
                            </li>
                            <li className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                <CheckCircle className="w-4 h-4 text-green-500" /> Suporte VIP Priority
                            </li>
                            <li className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                <CheckCircle className="w-4 h-4 text-green-500" /> Créditos sem validade
                            </li>
                        </ul>
                    </motion.div>
                ))}
            </div>

            {/* Footer Note */}
            <div className="text-center p-8 bg-gray-900/20 rounded-2xl border border-gray-800/50 border-dashed">
                <div className="flex items-center justify-center gap-3 text-gray-500">
                    <History className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">Dúvidas sobre o consumo?</span>
                    <button className="text-brand-primary hover:underline text-sm font-black">Ver Extrato Detalhado</button>
                    <span className="text-gray-700">|</span>
                    <button className="text-gray-400 hover:text-white text-sm font-black">Falar com Suporte</button>
                </div>
            </div>
        </div>
    );
};

export default RechargeView;
