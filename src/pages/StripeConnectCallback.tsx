import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { CheckCircle, AlertTriangle } from '../components/Icons';

export const StripeConnectCallback: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const error = params.get('error');

        if (error) {
            setStatus('error');
            toast.error("Integração cancelada ou falhou.");
            return;
        }

        if (code) {
            handleCompleteConnect(code);
        } else {
            setStatus('error');
        }
    }, [location]);

    const handleCompleteConnect = async (code: string) => {
        try {
            const { LucPayService } = await import('../services/LucPayService');
            const result = await LucPayService.completeConnect(code);

            if (result.success) {
                setStatus('success');
                toast.success("Conta bancária vinculada com sucesso!");

                // Redireciona de volta para o Dashboard do Produtor após 3 segundos
                setTimeout(() => {
                    navigate('/producer');
                }, 3000);
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            toast.error("Erro ao finalizar vinculação.");
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl max-w-md w-full text-center space-y-6 shadow-2xl">
                {status === 'loading' && (
                    <>
                        <LoadingSpinner size="lg" />
                        <div>
                            <h2 className="text-white font-black text-xl uppercase mb-2">Finalizando Conexão</h2>
                            <p className="text-gray-400 text-sm">Estamos vinculando sua conta da Stripe à LucPay...</p>
                        </div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-2xl uppercase mb-2">Sucesso!</h2>
                            <p className="text-gray-400 text-sm mb-6">Sua conta foi conectada com segurança. Você será redirecionado para o painel agora.</p>
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border border-red-500/50">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-2xl uppercase mb-2">Ops! Algo deu errado</h2>
                            <p className="text-gray-400 text-sm mb-6">Não conseguimos completar a conexão. Verifique se você finalizou o cadastro na Stripe.</p>
                            <button
                                onClick={() => navigate('/producer')}
                                className="w-full bg-brand-primary text-black font-black py-3 rounded-xl hover:bg-yellow-400 transition-all"
                            >
                                VOLTAR AO PAINEL
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
