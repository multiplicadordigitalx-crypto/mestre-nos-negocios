import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import { ArrowLeft, LockClosed, CheckCircle } from '../components/Icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import toast from 'react-hot-toast';

interface ForgotPasswordPageProps {
    onBack: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return toast.error("Digite seu e-mail.");

        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email, {
                url: `${window.location.origin}/reset-password`,
                handleCodeInApp: true,
            });
            setIsSuccess(true);
            toast.success("E-mail de recuperação enviado!");
        } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
                toast.error("E-mail não encontrado.");
            } else {
                toast.error(err.message || " ao enviar e-mail.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl p-8 relative z-10"
            >
                {isSuccess ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/50">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Verifique seu E-mail</h2>
                        <p className="text-gray-400 mb-8">
                            Enviamos um link de recuperação para <strong>{email}</strong>. Verifique também sua caixa de spam.
                        </p>
                        <Button onClick={onBack} className="w-full">Voltar para Login</Button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center p-4 bg-gray-900 rounded-full border border-gray-700 shadow-xl mb-4">
                                <LockClosed className="w-8 h-8 text-brand-primary" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Recuperar Senha</h1>
                            <p className="text-gray-400 text-sm mt-2">Digite seu e-mail para receber as instruções.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="E-mail Cadastrado"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                            />

                            <Button
                                type="submit"
                                className="w-full !py-3 text-lg font-bold"
                                isLoading={isLoading}
                            >
                                ENVIAR LINK
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <button onClick={onBack} className="text-gray-500 text-sm hover:text-white flex items-center justify-center gap-2 mx-auto transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Voltar
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
