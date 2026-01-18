
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import { X as XIcon, Wallet, CheckCircle, LockClosed, DollarSign, ShieldCheck, Clock } from '../../../components/Icons';
import toast from 'react-hot-toast';
import { Influencer } from '../../../types';

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableBalance: number;
    influencerName: string;
    influencer?: Influencer; // Dados completos para pegar o PIX
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

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, availableBalance, influencerName, influencer }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleWithdraw = () => {
        if (availableBalance <= 0) {
            return toast.error("Você não possui saldo disponível para saque no momento.");
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(2);
            toast.success(`Solicitação de saque de R$ ${availableBalance.toFixed(2)} enviada!`, { icon: '💸' });
        }, 2000);
    };

    const handleClose = () => {
        setStep(1);
        onClose();
    };

    // Pega dados de compliance se existirem
    const producerData = influencer?.producerData;
    const pixKey = producerData?.pixKey || influencer?.bankData?.pixKey || 'Não cadastrada';
    const bankInfo = producerData ? `${producerData.bank} - Ag: ${producerData.agency} / Cc: ${producerData.account}` : 'Aguardando sincronização';

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0c0d12] w-full max-w-md rounded-[2rem] border border-gray-800 shadow-2xl overflow-hidden relative">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <div className="flex items-center gap-3">
                         <LucPayLogo size="sm" />
                        <h3 className="text-xl font-bold text-white">Central de Saque</h3>
                    </div>
                    <button onClick={handleClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white"/></button>
                </div>

                <div className="p-6">
                    {step === 1 ? (
                        <>
                            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 mb-6 text-center">
                                <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Saldo Disponível</p>
                                <h2 className="text-4xl font-black text-white">R$ {availableBalance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h2>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                    <p className="text-[10px] text-gray-500 uppercase font-black mb-3">Destino do Pagamento</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500 font-bold uppercase">
                                            {influencerName.charAt(0)}
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className="text-white font-black text-sm uppercase truncate">{influencerName}</p>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest truncate">
                                                PIX: <span className="text-green-400 font-mono">{pixKey}</span>
                                            </p>
                                            <p className="text-[9px] text-gray-600 mt-0.5 truncate">{bankInfo}</p>
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
                                         <span className="text-[9px] text-green-200 uppercase font-bold leading-tight">Taxa Saque: Grátis</span>
                                     </div>
                                </div>
                            </div>

                            <Button 
                                onClick={handleWithdraw} 
                                isLoading={loading} 
                                className="w-full !py-4 font-black uppercase text-sm !bg-green-600 hover:!bg-green-500 text-white shadow-xl shadow-green-900/30"
                                disabled={availableBalance <= 0}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <DollarSign className="w-5 h-5"/>
                                    Confirmar Saque Imediato
                                </div>
                            </Button>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                                <CheckCircle className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase mb-2">Sucesso!</h3>
                            <p className="text-gray-400 text-sm mb-6 max-w-[280px] mx-auto leading-relaxed">
                                Sua solicitação foi enviada para o **LucPay**. O valor cairá na sua conta em até <strong className="text-white">24h úteis</strong>.
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
