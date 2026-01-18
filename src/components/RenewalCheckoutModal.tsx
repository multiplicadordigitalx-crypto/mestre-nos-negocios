
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { CheckCircle, LockClosed, ShieldCheck, CreditCard, X as XIcon } from './Icons';

interface RenewalCheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    daysRemaining: number;
    expirationDate: Date;
}

const RenewalCheckoutModal: React.FC<RenewalCheckoutModalProps> = ({ isOpen, onClose, onConfirm, daysRemaining, expirationDate }) => {
    const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix'>('credit');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = async () => {
        setIsProcessing(true);
        await onConfirm();
        setIsProcessing(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4 overflow-y-auto">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-700 relative shadow-2xl flex flex-col md:flex-row overflow-hidden"
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 md:hidden"
                >
                    <XIcon className="w-6 h-6" />
                </button>

                {/* Left Side: Offer Details */}
                <div className="p-6 md:p-8 bg-gradient-to-br from-gray-800 to-gray-900 md:w-1/2 flex flex-col">
                     <div className="mb-6">
                         <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold mb-4 border border-green-500/20">
                             <ShieldCheck className="w-3 h-3" /> RENOVAÇÃO EXCLUSIVA
                         </div>
                         <h2 className="text-2xl font-bold text-white leading-tight mb-2">
                             Mantenha seu acesso <span className="text-brand-primary">Multiplicador 15X</span>
                         </h2>
                         <p className="text-gray-400 text-sm">
                             Seu acesso vence em <span className="text-red-400 font-semibold">{expirationDate.toLocaleDateString()}</span>.
                         </p>
                     </div>

                     <div className="space-y-4 mb-8 flex-1">
                         <h3 className="text-sm font-bold text-white uppercase tracking-wider">O que está incluso:</h3>
                         <ul className="space-y-3">
                             <li className="flex items-start gap-3 text-sm text-gray-300">
                                 <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                 <span>+12 meses de acesso completo</span>
                             </li>
                             <li className="flex items-start gap-3 text-sm text-gray-300">
                                 <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                 <span>Acesso a todos os novos produtos</span>
                             </li>
                             <li className="flex items-start gap-3 text-sm text-gray-300">
                                 <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                 <span>Suporte prioritário continuado</span>
                             </li>
                             <li className="flex items-start gap-3 text-sm text-gray-300">
                                 <CheckCircle className="w-5 h-5 text-brand-primary flex-shrink-0" />
                                 <span className="font-bold text-brand-primary">BÔNUS: Template de 100 Títulos Virais</span>
                             </li>
                         </ul>
                     </div>

                     <div className="mt-auto pt-6 border-t border-gray-700">
                         <p className="text-gray-400 text-xs mb-1">Valor normal: <span className="line-through">R$ 197,00</span></p>
                         <div className="flex items-baseline gap-2">
                             <span className="text-3xl font-black text-white">R$ 97</span>
                             <span className="text-sm text-green-400 font-bold">50% OFF</span>
                         </div>
                     </div>
                </div>

                {/* Right Side: Checkout */}
                <div className="p-6 md:p-8 bg-gray-800 md:w-1/2 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-white">Pagamento Seguro</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-white hidden md:block"><XIcon className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div 
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'credit' ? 'bg-brand-primary/10 border-brand-primary' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'}`}
                            onClick={() => setPaymentMethod('credit')}
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard className={`w-5 h-5 ${paymentMethod === 'credit' ? 'text-brand-primary' : 'text-gray-400'}`} />
                                <span className={`font-medium ${paymentMethod === 'credit' ? 'text-white' : 'text-gray-300'}`}>Cartão de Crédito</span>
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'credit' ? 'border-brand-primary' : 'border-gray-500'}`}>
                                {paymentMethod === 'credit' && <div className="w-2 h-2 rounded-full bg-brand-primary" />}
                            </div>
                        </div>

                        <div 
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'pix' ? 'bg-brand-primary/10 border-brand-primary' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'}`}
                            onClick={() => setPaymentMethod('pix')}
                        >
                             <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 flex items-center justify-center font-black text-xs rounded ${paymentMethod === 'pix' ? 'text-brand-primary border border-brand-primary' : 'text-gray-400 border border-gray-500'}`}>P</div>
                                <span className={`font-medium ${paymentMethod === 'pix' ? 'text-white' : 'text-gray-300'}`}>PIX (Aprovação Imediata)</span>
                            </div>
                             <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'pix' ? 'border-brand-primary' : 'border-gray-500'}`}>
                                {paymentMethod === 'pix' && <div className="w-2 h-2 rounded-full bg-brand-primary" />}
                            </div>
                        </div>
                    </div>

                    {paymentMethod === 'credit' && (
                         <div className="space-y-3 mb-6 animate-fade-in">
                             <input type="text" placeholder="Número do Cartão" className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-brand-primary outline-none" />
                             <div className="flex gap-3">
                                 <input type="text" placeholder="MM/AA" className="w-1/2 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-brand-primary outline-none" />
                                 <input type="text" placeholder="CVV" className="w-1/2 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-brand-primary outline-none" />
                             </div>
                             <input type="text" placeholder="Nome no Cartão" className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-brand-primary outline-none" />
                         </div>
                    )}

                    <Button 
                        className="w-full !py-4 text-lg !bg-green-600 hover:!bg-green-500 shadow-lg shadow-green-900/30 mt-auto"
                        onClick={handleConfirm}
                        isLoading={isProcessing}
                    >
                        PAGAR R$ 97,00 E RENOVAR
                    </Button>
                    
                    <div className="text-center mt-4 flex items-center justify-center gap-2 text-gray-500 text-xs">
                        <LockClosed className="w-3 h-3" />
                        <span>Ambiente 100% Seguro</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RenewalCheckoutModal;
