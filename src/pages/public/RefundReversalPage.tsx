import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, AlertTriangle } from '../../components/Icons';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { toast } from 'react-hot-toast';

export const RefundReversalPage: React.FC = () => {
    const [step, setStep] = useState<'confirm' | 'success'>('confirm');
    const [justification, setJustification] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!justification.trim()) {
            toast.error("Por favor, nos diga o motivo da sua decisão.");
            return;
        }

        setLoading(true);
        // Simulate API call to cancel refund
        setTimeout(() => {
            setLoading(false);
            setStep('success');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary to-green-400" />

                {step === 'confirm' ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-primary">
                            <ShieldCheck className="w-8 h-8" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">Manter meu Acesso</h1>
                        <p className="text-gray-400 mb-8">
                            Ficamos felizes que decidiu continuar sua jornada! Para cancelar seu pedido de reembolso e manter seu acesso imediato, confirme abaixo.
                        </p>

                        <div className="text-left mb-6">
                            <label className="text-sm font-bold text-gray-300 mb-2 block">
                                O que te fez mudar de ideia? <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className="w-full bg-gray-800 border-gray-700 rounded-xl p-4 text-white focus:border-brand-primary outline-none min-h-[120px]"
                                placeholder="Ex: O suporte me ajudou com a dúvida que eu tinha..."
                                value={justification}
                                onChange={e => setJustification(e.target.value)}
                            />
                        </div>

                        <Button
                            onClick={handleConfirm}
                            isLoading={loading}
                            className="w-full !bg-green-600 hover:!bg-green-500 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-green-900/20"
                        >
                            Confirmar Permanência
                        </Button>

                        <p className="mt-4 text-xs text-gray-500">
                            Ao clicar, seu pedido de reembolso será cancelado automaticamente.
                        </p>
                    </div>
                ) : (
                    <div className="text-center animate-fade-in-up">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Confirmado!</h1>
                        <p className="text-gray-400 text-lg mb-8">
                            Seu acesso continua ativo e o pedido de reembolso foi cancelado.
                        </p>
                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-8">
                            <p className="text-sm text-gray-400">Bons estudos!</p>
                        </div>
                    </div>
                )}
            </div>

            <p className="mt-8 text-gray-600 text-sm">
                Plataforma Segura Mestre nos Negócios
            </p>
        </div>
    );
};
