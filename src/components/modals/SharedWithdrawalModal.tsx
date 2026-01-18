
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, X, CheckCircle, ShieldCheck, Clock, Users } from '../Icons';
import Button from '../Button';
import toast from 'react-hot-toast';
import { requestWithdrawal } from '../../services/mockFirebase';

interface SharedWithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    balance: number;
    producerId: string;
    producerName: string;
    pixKey?: string;
    bankInfo?: string;
    sourceType: 'manual_sales' | 'auto_commission';
    onSuccess: () => void;
}

export const SharedWithdrawalModal: React.FC<SharedWithdrawalModalProps> = ({
    isOpen, onClose, balance, producerId, producerName, pixKey, bankInfo, sourceType, onSuccess
}) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (balance < 50) return toast.error("Mínimo de R$ 50,00 para saque.");

        setLoading(true);
        try {
            // Call the shared mock service
            const response = await requestWithdrawal(producerId, balance, sourceType);

            if (response.success) {
                setStep(2);
                onSuccess(); // Refresh parent data
                toast.success(response.message);
            } else {
                toast.error(response.message);
                onClose();
            }
        } catch (error) {
            toast.error("Erro ao solicitar saque.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-800 w-full max-w-md rounded-2xl border border-green-500/30 shadow-2xl overflow-hidden relative"
            >
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center border border-green-500/30">
                            <DollarSign className="w-5 h-5 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Solicitar Saque</h3>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                <div className="p-6">
                    {step === 1 ? (
                        <>
                            <div className="text-center mb-8">
                                <p className="text-gray-400 text-sm mb-1 uppercase font-bold tracking-widest">Valor Disponível</p>
                                <h2 className="text-5xl font-black text-white">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-green-400 bg-green-500/10 py-2 rounded-lg border border-green-500/20">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Processamento Seguro (Lote Diário)</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                    <p className="text-[10px] text-gray-500 uppercase font-black mb-3">Conta de Destino</p>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white border border-gray-600 shrink-0 mt-1">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-bold truncate uppercase">{producerName}</p>
                                            <div className="space-y-1 mt-2">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                    CHAVE PIX: <span className="text-green-400 font-mono">{pixKey || 'Não cadastrada'}</span>
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                    DADOS: <span className="text-white font-mono">{bankInfo || '---'}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-900/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
                                    <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-blue-200 leading-relaxed">
                                        <strong>Agendamento Automático:</strong> Solicitações feitas até às 10h são processadas no mesmo dia. Após esse horário, entram no lote das 16h ou do dia seguinte.
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={handleConfirm}
                                isLoading={loading}
                                disabled={balance < 50}
                                className={`w-full !py-4 font-black text-lg shadow-lg ${balance < 50 ? 'bg-gray-600 cursor-not-allowed' : '!bg-green-600 hover:!bg-green-500 shadow-green-900/30'} text-white`}
                            >
                                {balance < 50 ? 'Mínimo R$ 50,00' : 'CONFIRMAR SAQUE'}
                            </Button>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                                <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Solicitação Enviada!</h3>
                            <p className="text-gray-300 text-sm mb-6 max-w-xs mx-auto">
                                Seu saque entrou na fila de processamento. Você será notificado assim que o lote for pago.
                            </p>
                            <Button onClick={onClose} className="w-full">Voltar ao Painel</Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
