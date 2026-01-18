
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Eye, EyeOff, LockClosed } from '../../components/Icons';
import { getSchoolBySubdomain } from '../../services/mockFirebase';
import { SchoolSettings } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

// Para simplificar, simulamos que o subdomínio vem de uma query param ?school=nome
// Em produção, isso seria extraído de window.location.hostname
const PortalLoginPage: React.FC = () => {
    const [settings, setSettings] = useState<SchoolSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        // Simulação: Pegar subdomínio da URL (ex: ?school=joao-academy)
        // Se não tiver, usar um padrão de fallback
        const params = new URLSearchParams(window.location.search);
        const schoolSlug = params.get('school');

        if (schoolSlug) {
            getSchoolBySubdomain(schoolSlug).then(s => {
                setSettings(s);
                setLoading(false);
            });
        } else {
            // Demo fallback se acessar direto sem param
            setSettings({
                ownerId: 'demo',
                schoolName: 'Portal do Aluno',
                subdomain: 'demo',
                logoUrl: '', // Fallback to icon
                primaryColor: '#FACC15', // Brand Primary default
                secondaryColor: '#111827',
                welcomeMessage: 'Bem-vindo ao seu portal de estudos.',
                createdAt: Date.now()
            });
            setLoading(false);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        // Simulação de login
        setTimeout(() => {
            setIsLoggingIn(false);
            if (email && password) {
                toast.success(`Bem-vindo à ${settings?.schoolName}!`);
                // Redirecionar para área do curso (mock)
            } else {
                toast.error("Preencha suas credenciais.");
            }
        }, 1500);
    };

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><LoadingSpinner/></div>;
    if (!settings) return <div className="min-h-screen flex items-center justify-center text-white">Escola não encontrada.</div>;

    return (
        <div className="min-h-screen flex flex-col md:flex-row font-sans" style={{ backgroundColor: settings.secondaryColor }}>
            
            {/* Left Side - Branding Area */}
            <div className="md:w-1/2 relative overflow-hidden flex flex-col items-center justify-center p-8 text-center text-white">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ 
                    backgroundImage: `linear-gradient(135deg, ${settings.primaryColor} 0%, transparent 100%)` 
                }}></div>
                <div className="relative z-10">
                    {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt={settings.schoolName} className="h-24 md:h-32 object-contain mb-6 mx-auto drop-shadow-2xl"/>
                    ) : (
                        <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold bg-white/10 mb-6 mx-auto border-2 border-white/20">
                            {settings.schoolName.charAt(0)}
                        </div>
                    )}
                    <h1 className="text-3xl md:text-4xl font-black mb-2">{settings.schoolName}</h1>
                    <p className="text-lg opacity-80 max-w-md mx-auto">{settings.welcomeMessage}</p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="md:w-1/2 bg-white flex items-center justify-center p-8">
                <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold text-gray-900">Acesse sua conta</h2>
                        <p className="text-gray-500 text-sm mt-1">Digite seus dados para continuar seus estudos.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent outline-none transition-all"
                                placeholder="seu@email.com"
                                style={{ '--tw-ring-color': settings.primaryColor } as any}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent outline-none transition-all pr-10"
                                    placeholder="••••••••"
                                    style={{ '--tw-ring-color': settings.primaryColor } as any}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                </button>
                            </div>
                            <div className="flex justify-end mt-2">
                                <a href="#" className="text-sm hover:underline" style={{ color: settings.primaryColor }}>Esqueceu a senha?</a>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            isLoading={isLoggingIn}
                            className="w-full !py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
                            style={{ backgroundColor: settings.primaryColor }}
                        >
                            ENTRAR NA PLATAFORMA
                        </Button>
                    </form>
                    
                    <div className="text-center pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                            <LockClosed className="w-3 h-3"/> Ambiente Seguro • Powered by Mestre
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PortalLoginPage;
