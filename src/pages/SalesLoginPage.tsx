
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import { TrendingUp, LockClosed, ArrowLeft } from '../components/Icons';
import { salesSignIn, trackPageVisit } from '../services/mockFirebase';
import toast from 'react-hot-toast';
import { SalesPerson } from '../types';

interface SalesLoginPageProps {
    onLoginSuccess: (salesPerson: SalesPerson) => void;
    onBack: () => void;
}

const SalesLoginPage: React.FC<SalesLoginPageProps> = ({ onLoginSuccess, onBack }) => {
    const [email, setEmail] = useState('pedro@comercial.15x.br');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        trackPageVisit("Login Vendedor");
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const user = await salesSignIn(email, password);
            if (user) {
                toast.success(`Bem-vindo(a) ao Painel Comercial, ${user.displayName}!`);
                onLoginSuccess(user);
            } else {
                toast.error("Credenciais inválidas ou acesso não autorizado.");
            }
        } catch (e: any) {
            toast.error(e.message || "Erro ao conectar.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
             {/* Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-blue-900/20 to-transparent"></div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="w-full max-w-md z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-gray-800 rounded-full border border-gray-700 shadow-xl mb-4">
                        <TrendingUp className="w-10 h-10 text-blue-500" />
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-wide">Área Comercial 15X</h1>
                    <p className="text-gray-400 text-sm mt-2">Acesso Exclusivo para Vendedores</p>
                </div>

                <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl p-8 relative">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input label="E-mail Comercial" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nome@comercial.15x.br" />
                        <Input label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                        
                        <Button type="submit" className="w-full !py-4 text-lg font-bold !bg-blue-600 hover:!bg-blue-500 text-white shadow-lg shadow-blue-900/30" isLoading={isLoading}>
                            ENTRAR NO PAINEL
                        </Button>
                    </form>
                </div>

                <div className="mt-8 text-center space-y-4">
                     <button onClick={onBack} className="text-gray-500 text-xs hover:text-white flex items-center justify-center gap-1 mx-auto">
                         <ArrowLeft className="w-3 h-3"/> Voltar
                     </button>
                     <p className="text-gray-600 text-[10px] flex items-center justify-center gap-1">
                        <LockClosed className="w-3 h-3" /> Acesso monitorado. IP registrado.
                     </p>
                </div>
            </motion.div>
        </div>
    );
};

export default SalesLoginPage;
