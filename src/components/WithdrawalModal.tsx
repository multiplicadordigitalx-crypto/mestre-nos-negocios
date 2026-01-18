
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { X as XIcon, Wallet, CheckCircle, LockClosed, DollarSign, ShieldCheck, Clock, CreditCard } from './Icons';
import toast from 'react-hot-toast';

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    balance: number;
    beneficiaryName: string; // Nome genérico para reuso (era influencerName)
    cpf?: string; // Mantido para compatibilidade
    pixKey?: string; // Nova prop para chave específica
    bankInfo?: string; // Nova prop para dados bancários formatados
}

const LucPayLogo = ({ size = "sm" }: { size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = {
        sm: "w-10 h-10 text-[10px]",
        md: "w-14 h-14 text-sm",
        lg: "w-16 h-16 text-base"
    };
    
    return (
        <div className={`${sizeClasses[size]} bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-200 shrink-0 select-none`}>
            <span className="text-black font-sans tracking-tighter leading-none">
                <strong className="font-black">Luc</strong><span className="font-normal">Pay</span>
            </span>
        </div>
    );
};

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ 
    isOpen, 
    onClose, 
    balance, 
    beneficiaryName, 
    cpf, 
    pixKey, 
    bankInfo 
}) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleWithdraw = async () => {
        if (balance <= 0) {
            return toast.error("Você não possui saldo disponível liberado para saque.");
        }
        
        setLoading(true);
        // Simulação de chamada para Stripe Connect API / LucPay
        setTimeout(() => {
            setLoading(false);
            setStep(2);
            toast.success(`Solicitação de saque de R$ ${balance.toFixed(2)} enviada com sucesso ao LucPay!`, {
                icon: '💸',
                duration: 5000
            });
        }, 2000);
    };

    const handleClose = () => {
        setStep(1);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="bg-[#0c0d12] w-full max-w-md rounded-[2rem] border border-gray-800 shadow-2xl relative overflow-hidden"
            >
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <div className="flex items-center gap-3">
                         <LucPayLogo size="sm" />
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Central de Saque</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Gateway Nativo Mestre 50X</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                        <XIcon className="w-5 h-5"/>
                    </button>
                </div>

                <div className="p-6">
                    {step === 1 ? (
                        <>
                            <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 mb-6 text-center">
                                <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Saldo Disponível (Livre de Garantia)</p>
                                <h2 className="text-5xl font-black text-white tracking-tight">
                                    R$ {balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </h2>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                    <p className="text-[10px] text-gray-500 uppercase font-black mb-3">Destino do Pagamento</p>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500 font-bold uppercase shrink-0">
                                            {beneficiaryName.charAt(0)}
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className="text-white font-black text-sm uppercase truncate mb-1">{beneficiaryName}</p>
                                            
                                            {/* Exibe PIX específico ou CPF genérico */}
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                    PIX: <span className="text-green-400 font-mono text-[10px]">{pixKey || cpf || '***.***.***-**'}</span>
                                                </span>
                                                
                                                {/* Exibe Dados Bancários se disponíveis */}
                                                {bankInfo && (
                                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                                        <CreditCard className="w-3 h-3 text-gray-600"/>
                                                        CONTA: <span className="text-gray-300 font-mono text-[10px]">{bankInfo}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                     <div className="p-3 bg-blue-900/10 border border-blue-500/20 rounded-xl flex items-center gap-2">
                                         <div className="p-1 bg-blue-500/20 rounded">
                                             <Clock className="w-4 h-4 text-blue-400"/>
                                         </div>
                                         <span className="text-[9px] text-blue-200 uppercase font-bold leading-tight">Liquidação: D+1 Útil</span>
                                     </div>
                                     <div className="p-3 bg-green-900/10 border border-green-500/20 rounded-xl flex items-center gap-2">
                                         <div className="p-1 bg-green-500/20 rounded">
                                             <ShieldCheck className="w-4 h-4 text-green-400"/>
                                         </div>
                                         <span className="text-[9px] text-green-200 uppercase font-bold leading-tight">Taxa Saque: R$ 0,00</span>
                                     </div>
                                </div>
                            </div>

                            <Button 
                                onClick={handleWithdraw}
                                isLoading={loading}
                                disabled={balance <= 0}
                                className="w-full !py-5 text-sm font-black uppercase !bg-green-600 text-white hover:!bg-green-500 shadow-xl shadow-green-900/20 transition-all active:scale-[0.98] border-none"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <DollarSign className="w-6 h-6"/>
                                    SOLICITAR SAQUE AGORA
                                </div>
                            </Button>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <motion.div 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                            >
                                <CheckCircle className="w-12 h-12 text-white"/>
                            </motion.div>
                            <h3 className="text-2xl font-black text-white uppercase mb-2">Sucesso!</h3>
                            <p className="text-gray-400 text-sm mb-6 max-w-[280px] mx-auto leading-relaxed">
                                Seu pedido de saque foi registrado pelo **LucPay**. O valor será transferido para sua conta cadastrada em até <strong className="text-white">24 horas úteis</strong>.
                            </p>
                            <Button onClick={handleClose} className="w-full !py-4 font-black uppercase">Voltar ao Painel</Button>
                        </div>
                    )}
                </div>
                
                <div className="p-4 bg-gray-900/50 border-t border-gray-800 text-center">
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                        <LockClosed className="w-3 h-3"/> Ambiente de Pagamento Seguro LucPay
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
