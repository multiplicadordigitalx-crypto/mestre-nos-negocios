
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { 
    X as XIcon, Smartphone, LockClosed, Instagram, 
    Tiktok, Youtube, Facebook, Eye, EyeOff, ShieldCheck, Zap 
} from '../../../components/Icons';
import toast from 'react-hot-toast';

interface ConnectSocialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: (acc: any) => void;
}

const MotionDiv = motion.div as any;

export const ConnectSocialModal: React.FC<ConnectSocialModalProps> = ({ isOpen, onClose, onConnect }) => {
    const [platform, setPlatform] = useState('Instagram');
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConnect = () => {
        if (!user || !password) {
            toast.error("Por favor, preencha todos os campos para prosseguir.");
            return;
        }

        setLoading(true);
        // Simulação de autenticação e verificação de conta
        setTimeout(() => {
            onConnect({ 
                platform, 
                username: user.startsWith('@') ? user : `@${user}`,
                status: 'CONNECTED' 
            });
            setLoading(false);
            toast.success(`${platform} conectado com sucesso ao ecossistema!`, {
                icon: '🚀',
                duration: 4000
            });
            resetForm();
            onClose();
        }, 2000);
    };

    const resetForm = () => {
        setUser('');
        setPassword('');
        setPlatform('Instagram');
    };

    const platforms = [
        { id: 'Instagram', icon: Instagram, color: 'text-pink-500' },
        { id: 'TikTok', icon: Tiktok, color: 'text-white' },
        { id: 'Kwai', icon: () => <span className="font-black text-orange-500">K</span>, color: 'text-orange-500' },
        { id: 'Facebook', icon: Facebook, color: 'text-blue-500' },
        { id: 'YouTube', icon: Youtube, color: 'text-red-500' }
    ];

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
            <MotionDiv 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#0f111a] w-full max-w-md rounded-[2.5rem] border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden relative"
            >
                {/* Header Decorator */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary via-blue-500 to-purple-600"></div>

                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-brand-primary/10 rounded-2xl border border-brand-primary/20">
                                <Smartphone className="w-6 h-6 text-brand-primary"/>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Conectar Ativo</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Integração Direta Nexus</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                            <XIcon className="w-6 h-6 text-gray-400"/>
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Platform Selector */}
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase mb-3 block tracking-[0.2em]">1. Escolha a Plataforma</label>
                            <div className="grid grid-cols-5 gap-2">
                                {platforms.map(p => (
                                    <button 
                                        key={p.id} 
                                        onClick={() => setPlatform(p.id)} 
                                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                                            platform === p.id 
                                            ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_15px_rgba(250,204,21,0.1)]' 
                                            : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700'
                                        }`}
                                    >
                                        <div className={`text-xl ${platform === p.id ? 'scale-110' : ''} transition-transform`}>
                                            <p.icon className={`w-5 h-5 ${platform === p.id ? 'text-brand-primary' : ''}`} />
                                        </div>
                                        <span className={`text-[8px] font-black uppercase ${platform === p.id ? 'text-white' : ''}`}>{p.id}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* User Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">2. Usuário da Conta</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary font-bold">@</div>
                                <input 
                                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 pl-10 pr-4 text-white font-bold focus:border-brand-primary outline-none transition-all placeholder-gray-700"
                                    placeholder="seu.usuario"
                                    value={user}
                                    onChange={e => setUser(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">3. Senha de Acesso</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    <LockClosed className="w-4 h-4"/>
                                </div>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 pl-11 pr-12 text-white font-mono focus:border-brand-primary outline-none transition-all placeholder-gray-700"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>

                        {/* Safety Warning */}
                        <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-2xl flex gap-3">
                            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5"/>
                            <p className="text-[9px] text-blue-200 leading-relaxed font-medium uppercase tracking-wider">
                                Conexão Blindada: Seus dados são criptografados de ponta a ponta e usados apenas para automação de rastreio de cliques e vendas.
                            </p>
                        </div>

                        <Button 
                            onClick={handleConnect} 
                            isLoading={loading}
                            className="w-full !py-5 !bg-brand-primary text-black font-black uppercase text-sm tracking-widest shadow-2xl shadow-yellow-900/20 mt-4 hover:scale-[1.02] transition-transform"
                        >
                            <Zap className="w-4 h-4 mr-2 fill-current"/> Autorizar Conexão Agora
                        </Button>
                    </div>
                </div>

                <div className="p-4 bg-black/40 text-center border-t border-gray-800">
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em]">Tecnologia Nexus v6.0 © 2026</p>
                </div>
            </MotionDiv>
        </div>
    );
};
