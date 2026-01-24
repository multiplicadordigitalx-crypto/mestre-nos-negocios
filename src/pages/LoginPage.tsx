
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../hooks/useAuth';
import { Brain, Briefcase, TrendingUp, ShieldCheck } from '../components/Icons';
/* Fix: Importing trackPageVisit which is now correctly exported in mockFirebase.ts */
import { trackPageVisit, getSystemSettings } from '../services/mockFirebase';
import { SystemSettings } from '../types';

interface LoginPageProps {
    onSwitchToAdmin?: () => void;
    onSwitchToInfluencer?: () => void;
    onSwitchToSales?: () => void;
    onForgotPassword?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToAdmin, onSwitchToInfluencer, onSwitchToSales, onForgotPassword }) => {
    const [emailOrCpf, setEmailOrCpf] = useState('aluno@teste.com');
    const [password, setPassword] = useState('123456');
    const { signIn, resetPassword, loading } = useAuth();
    const [settings, setSettings] = useState<SystemSettings | null>(null);

    useEffect(() => {
        trackPageVisit("Login Aluno 50X");
        getSystemSettings().then(setSettings);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        signIn(emailOrCpf, password);
    };

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();

        // If there's an external link, prioritize it
        if (settings?.forgotPasswordLink) {
            window.open(settings.forgotPasswordLink, '_blank');
            return;
        }

        // Basic validation: must be an email
        if (!emailOrCpf || !emailOrCpf.includes('@')) {
            const email = prompt("Por favor, digite seu e-mail para receber o link de recuperação:");
            if (email && email.includes('@')) {
                resetPassword(email);
            } else if (email) {
                alert("Por favor, insira um e-mail válido.");
            }
        } else {
            if (confirm(`Deseja enviar um link de recuperação para ${emailOrCpf}?`)) {
                resetPassword(emailOrCpf);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-grid-pattern p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="w-full max-w-md p-8 space-y-8 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl text-center relative overflow-hidden"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-50"></div>

                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20 rotate-3 transform hover:rotate-6 transition-transform">
                        <Brain className="w-8 h-8 text-black" />
                    </div>
                </div>

                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight leading-tight uppercase">Mestre nos Negócios</h1>
                    <p className="text-brand-primary text-xs font-bold uppercase tracking-wider mb-3">Transformando Vidas</p>
                    <p className="text-gray-400 text-sm">Acesse sua área de membros exclusiva</p>
                </div>

                <div className="space-y-5">
                    <form className="space-y-5 text-left" onSubmit={handleSubmit}>
                        <Input
                            id="emailOrCpf"
                            type="text"
                            value={emailOrCpf}
                            onChange={(e) => setEmailOrCpf(e.target.value)}
                            required
                            label="E-mail ou CPF"
                            className="!bg-gray-900/50 !border-gray-600 focus:!border-brand-primary/50"
                            placeholder="E-mail ou CPF de compra"
                        />
                        <div className="relative">
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                label="Senha"
                                className="!bg-gray-900/50 !border-gray-600 focus:!border-brand-primary/50"
                                placeholder="Sua senha de acesso"
                            />
                            <button type="button" onClick={handleForgotPassword} className="absolute top-0 right-0 text-[10px] uppercase font-black text-brand-primary hover:text-yellow-300 hover:underline">Esqueceu?</button>
                        </div>

                        <Button type="submit" className="w-full !py-4 text-base font-black shadow-brand-primary/20 shadow-lg uppercase" isLoading={loading}>
                            ENTRAR NO ECOSSISTEMA
                        </Button>
                    </form>
                </div>

                <div className="text-xs text-gray-400">
                    Não tem acesso ainda? <a href={settings?.purchaseLink || "https://mestredosnegocios.com.br"} target="_blank" rel="noopener noreferrer" className="font-black text-white hover:text-brand-primary hover:underline transition-colors uppercase">Clique aqui para comprar</a>
                </div>

                {onSwitchToInfluencer && (
                    <button
                        onClick={onSwitchToInfluencer}
                        className="w-full mt-4 relative group overflow-hidden rounded-xl p-[1px]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-70 group-hover:opacity-100 transition-opacity animate-gradient-x"></div>
                        <div className="relative bg-gray-900 rounded-xl py-3 flex items-center justify-center gap-2 group-hover:bg-gray-900/90 transition-colors">
                            <Briefcase className="w-5 h-5 text-pink-400" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 font-bold group-hover:text-white transition-colors">
                                Sou Influencer / Afiliado
                            </span>
                        </div>
                    </button>
                )}

                <div className="pt-4 mt-2 flex justify-center gap-6 border-t border-gray-700/30 opacity-60 hover:opacity-100 transition-opacity">
                    {onSwitchToSales && (
                        <button onClick={onSwitchToSales} className="text-[10px] font-bold uppercase text-gray-400 hover:text-blue-400 flex items-center gap-1 transition-colors">
                            <TrendingUp className="w-3 h-3" /> Área Comercial
                        </button>
                    )}
                    {onSwitchToAdmin && (
                        <button onClick={onSwitchToAdmin} className="text-[10px] font-bold uppercase text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                            <ShieldCheck className="w-3 h-3" /> Suporte
                        </button>
                    )}
                </div>
            </motion.div>

            <style>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, rgba(200, 200, 200, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(200, 200, 200, 0.03) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 3s ease infinite;
        }
      `}</style>
        </div>
    );
};

export default LoginPage;
