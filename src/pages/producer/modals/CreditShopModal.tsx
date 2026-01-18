import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, Zap, ShieldCheck } from '../../../components/Icons';
import Button from '../../../components/Button';
import { buyCredits } from '../../../services/mockFirebase';
import { toast } from 'react-hot-toast';

interface CreditShopModalProps {
    target: 'student' | 'producer';
    onClose: () => void;
    onSuccess: () => void;
}

const CREDIT_PACKAGES = [
    { id: 'pack-100', credits: 100, price: 97.00, label: 'Básico', popular: false },
    { id: 'pack-500', credits: 500, price: 447.00, label: 'Pro', popular: true },
    { id: 'pack-1000', credits: 1000, price: 847.00, label: 'Enterprise', popular: false },
    { id: 'pack-5000', credits: 5000, price: 3997.00, label: 'Unicórnio', popular: false },
];

export const CreditShopModal: React.FC<CreditShopModalProps> = ({ target, onClose, onSuccess }) => {
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');

    const handlePurchase = async () => {
        if (!selectedPackage) return;
        const pack = CREDIT_PACKAGES.find(p => p.id === selectedPackage);
        if (!pack) return;

        setLoading(true);
        try {
            const success = await buyCredits(target, pack.credits, paymentMethod, pack.price);
            if (success) {
                toast.success(`Compra realizada! +${pack.credits} créditos adicionados.`);
                onSuccess();
                onClose();
            } else {
                toast.error("Erro ao processar compra.");
            }
        } catch (error) {
            toast.error("Falha na transação.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 via-gray-900 to-indigo-900/20 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Zap className="text-yellow-400 w-6 h-6" /> Loja de Créditos
                        </h2>
                        <p className="text-sm text-gray-400">Adicione créditos à sua conta {target === 'producer' ? 'Corporativa' : 'Pessoal'}.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                    {/* Packages Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {CREDIT_PACKAGES.map(pack => (
                            <div
                                key={pack.id}
                                onClick={() => setSelectedPackage(pack.id)}
                                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${selectedPackage === pack.id ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}
                            >
                                {pack.popular && (
                                    <span className="absolute -top-3 right-4 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                        Mais Vendido
                                    </span>
                                )}
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-bold uppercase tracking-wider ${selectedPackage === pack.id ? 'text-indigo-400' : 'text-gray-500'}`}>
                                        {pack.label}
                                    </span>
                                    <div className="text-right">
                                        <span className="block text-2xl font-bold text-white">{pack.credits}</span>
                                        <span className="text-[10px] text-gray-400 uppercase">Créditos</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center">
                                    <span className="text-xl font-bold text-white">R$ {pack.price.toFixed(2)}</span>
                                    {selectedPackage === pack.id && <CheckCircle className="w-6 h-6 text-indigo-500" />}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Payment Method */}
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6">
                        <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Forma de Pagamento Segura
                        </h3>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPaymentMethod('pix')}
                                className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 font-bold text-sm transition-colors ${paymentMethod === 'pix' ? 'border-green-500 bg-green-900/20 text-green-400' : 'border-gray-600 bg-gray-700 text-gray-400'}`}
                            >
                                <Zap className="w-4 h-4" /> PIX (Imediato)
                            </button>
                            <button
                                onClick={() => setPaymentMethod('card')}
                                className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 font-bold text-sm transition-colors ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-900/20 text-blue-400' : 'border-gray-600 bg-gray-700 text-gray-400'}`}
                            >
                                <CreditCard className="w-4 h-4" /> Cartão de Crédito
                            </button>
                        </div>
                    </div>

                    <div className="text-center text-xs text-gray-500 mb-4">
                        Ao continuar, você concorda com nossos termos de compra. Os créditos não expiram.
                    </div>

                    <Button
                        onClick={handlePurchase}
                        disabled={!selectedPackage || loading}
                        className="w-full py-4 text-lg font-bold shadow-lg shadow-indigo-900/20"
                    >
                        {loading ? 'Processando...' : 'Confirmar Compra'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
