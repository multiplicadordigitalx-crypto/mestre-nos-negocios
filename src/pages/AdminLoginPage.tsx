
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import { Brain, Eye, EyeOff, LockClosed, ArrowLeft } from '../components/Icons';
import { useAuth } from '../hooks/useAuth';
import { supportSignIn, trackPageVisit, mockTeamUsers, mockSupportAgents } from '../services/mockFirebase';
import toast from 'react-hot-toast';

interface AdminLoginPageProps { 
    onSwitchToStudent: () => void;
    onSupportLoginSuccess?: (agent: any) => void; 
    onForgotPassword?: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSwitchToStudent, onSupportLoginSuccess, onForgotPassword }) => {
  const [email, setEmail] = useState('ana@mestredosnegocios.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(5);
  const { signIn, loading } = useAuth();

  useEffect(() => {
      trackPageVisit("Login Admin/Suporte");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check if user is a Support Agent (in mockSupportAgents)
    const isSupportAgent = mockSupportAgents.some(a => a.email === email);

    if (isSupportAgent) {
        try {
            const agent = await supportSignIn(email, password);
            if (agent && onSupportLoginSuccess) {
                toast.success("Login de Suporte realizado com sucesso!");
                onSupportLoginSuccess(agent);
                return;
            }
        } catch (err: any) {
            handleFailedAttempt(err.message || "Falha no login de suporte.");
            return;
        }
    }

    // Check if user is a Team Member (registered in mockTeamUsers) or has Corporate Domain
    const isTeamMember = mockTeamUsers.some(u => u.email === email && u.status === 'active');
    const isCorporateDomain = email.endsWith('@mestredosnegocios.com') || email === 'mestrodonegocio01@gmail.com';

    if (!isTeamMember && !isCorporateDomain) {
        handleFailedAttempt("E-mail não autorizado para área de suporte.");
        return;
    }

    try {
      await signIn(email, password);
    } catch (err: any) {
      handleFailedAttempt(err.message || "E-mail ou senha incorretos.");
    }
  };

  const handleFailedAttempt = (msg: string) => {
      const remaining = attempts - 1;
      setAttempts(remaining);
      if (remaining <= 0) {
          setError("Acesso bloqueado por segurança. Aguarde 15 minutos.");
      } else {
          setError(msg);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="w-full max-w-md z-10"
      >
        {/* Logo / Header */}
        <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 rotate-3 transform hover:rotate-6 transition-transform">
                <Brain className="w-7 h-7 text-black" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wide">Mestre nos Negócios</h1>
            <p className="text-white text-xs font-bold uppercase tracking-wider mt-1">Transformando Vidas</p>
            <div className="flex items-center justify-center gap-2 mt-3">
                <div className="h-1 w-1 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-red-400 text-xs font-bold uppercase tracking-widest">Área Restrita – Equipe de Suporte</p>
            </div>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl p-8 relative">
            {attempts <= 0 && (
                <div className="absolute inset-0 bg-gray-900/95 z-20 flex items-center justify-center rounded-2xl flex-col text-center p-6">
                    <LockClosed className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-white font-bold text-xl">Acesso Bloqueado</h3>
                    <p className="text-gray-400 text-sm mt-2">Muitas tentativas falhas. Por favor, contate o administrador do sistema.</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">E-mail Corporativo</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                        placeholder="nome@mestredosnegocios.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Senha</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder-gray-600 pr-12"
                            placeholder="••••••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm text-center font-medium">{error}</p>
                        <p className="text-red-500/60 text-xs text-center mt-1">Tentativas restantes: {attempts} de 5</p>
                    </div>
                )}

                <div className="flex justify-between items-center text-sm">
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-white transition-colors">Mostrar senha</button>
                     <button type="button" onClick={onForgotPassword} className="text-gray-500 hover:text-white transition-colors">Esqueceu a senha?</button>
                </div>

                <Button 
                    type="submit" 
                    className="w-full !bg-green-600 hover:!bg-green-500 text-white !py-4 font-bold shadow-lg shadow-green-900/20" 
                    isLoading={loading}
                >
                    ENTRAR NA ÁREA DO SUPORTE
                </Button>
            </form>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center space-y-6 w-full max-w-md mx-auto">
            <Button 
                variant="ghost"
                onClick={onSwitchToStudent}
                className="w-full border border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2 group py-3 rounded-xl"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Voltar para Login de Aluno
            </Button>
            
            <p className="text-gray-600 text-[10px] max-w-xs mx-auto leading-relaxed">
                Acesso exclusivo para equipe autorizada.<br/>
                Qualquer tentativa não autorizada será registrada (IP: 192.168.1.X).
            </p>
            <div className="text-[10px] text-gray-600">
                <p>Login Vendas: pedro@comercial.15x.br</p>
                <p>Login Suporte: suporte@15x.br</p>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
