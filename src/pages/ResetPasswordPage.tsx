import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { LockClosed, CheckCircle, Eye, EyeOff } from '../components/Icons';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../services/firebase';
import toast from 'react-hot-toast';

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [oobCode, setOobCode] = useState<string | null>(null);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const code = searchParams.get('oobCode');
        if (!code) {
            toast.error('Link inválido ou expirado.');
            navigate('/login');
            return;
        }

        setOobCode(code);
        verifyCode(code);
    }, [searchParams, navigate]);

    const verifyCode = async (code: string) => {
        try {
            const userEmail = await verifyPasswordResetCode(auth, code);
            setEmail(userEmail);
            setIsValid(true);
        } catch (error: any) {
            toast.error('Link de recuperação inválido ou expirado.');
            setTimeout(() => navigate('/login'), 2000);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            return toast.error('A senha deve ter no mínimo 6 caracteres.');
        }

        if (password !== confirmPassword) {
            return toast.error('As senhas não coincidem.');
        }

        if (!oobCode) return;

        setIsLoading(true);
        try {
            await confirmPasswordReset(auth, oobCode, password);
            setIsSuccess(true);
            toast.success('Senha alterada com sucesso!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error: any) {
            if (error.code === 'auth/weak-password') {
                toast.error('Senha muito fraca. Use letras, números e símbolos.');
            } else {
                toast.error('Erro ao alterar senha. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                    <p className="text-gray-400">Verificando link...</p>
                </div>
            </div>
        );
    }

    if (!isValid) {
        return null;
    }

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
                        <h2 className="text-2xl font-bold text-white mb-2">Senha Alterada!</h2>
                        <p className="text-gray-400 mb-8">
                            Sua senha foi alterada com sucesso. Redirecionando para o login...
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center p-4 bg-gray-900 rounded-full border border-gray-700 shadow-xl mb-4">
                                <LockClosed className="w-8 h-8 text-brand-primary" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Nova Senha</h1>
                            <p className="text-gray-400 text-sm mt-2">
                                Redefinindo senha para: <strong>{email}</strong>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Input
                                    label="Nova Senha"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    icon={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    }
                                />
                            </div>

                            <div>
                                <Input
                                    label="Confirmar Senha"
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Digite novamente"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full !py-3 text-lg font-bold"
                                isLoading={isLoading}
                            >
                                ALTERAR SENHA
                            </Button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
