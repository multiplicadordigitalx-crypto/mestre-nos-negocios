
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import { Users, Instagram, Youtube, Tiktok, Facebook, CreditCard, CheckCircle, ArrowLeft, LockClosed, Trash, PlusCircle, AlertTriangle, Wallet, Clock, TrendingUp, Info } from '../components/Icons';
import { createInfluencerRequest, influencerSignIn, trackPageVisit } from '../services/mockFirebase';
import toast from 'react-hot-toast';
import { Influencer } from '../types';

interface InfluencerLoginPageProps {
    onLoginSuccess: (influencer: Influencer) => void;
    onBack: () => void;
}

const InfluencerLoginPage: React.FC<InfluencerLoginPageProps> = ({ onLoginSuccess, onBack }) => {
    const [view, setView] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('influencer@teste.com');
    const [password, setPassword] = useState('123456');
    const [isLoading, setIsLoading] = useState(false);
    const [pendingMessage, setPendingMessage] = useState<string | null>(null);

    // Signup State
    const [signupStep, setSignupStep] = useState(1);
    
    // Networks management
    const [visibleNetworks, setVisibleNetworks] = useState<string[]>(['instagram', 'tiktok', 'youtube']);
    
    // Responsibility Check
    const [isResponsible, setIsResponsible] = useState(false);

    const [formData, setFormData] = useState({
        name: '', cpf: '', email: '', phone: '',
        partnershipType: 'Afiliado 50X', // Padrão
        instagram: '', instagramFollowers: '',
        tiktok: '', tiktokFollowers: '',
        kwai: '', kwaiFollowers: '',
        youtube: '', youtubeFollowers: '',
        facebook: '', facebookFollowers: '',
        accountDescription: '' // Novo campo para descrição do parceiro
    });

    useEffect(() => {
        trackPageVisit("Login Influencer");
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setPendingMessage(null);
        try {
            const influencer = await influencerSignIn(email, password);
            if (influencer) {
                toast.success(`Bem-vindo(a) parceiro(a), ${influencer.displayName}!`);
                onLoginSuccess(influencer);
            } else {
                toast.error("Parceiro não encontrado.");
            }
        } catch (e: any) {
            if (e.message === 'STATUS_PENDING') {
                setPendingMessage("Seu cadastro foi recebido e está em análise pelo nosso time. Você receberá um e-mail assim que aprovado.");
            } else if (e.message === 'STATUS_BLOCKED') {
                toast.error("Acesso bloqueado. Contate o suporte.");
            } else if (e.message === 'Senha incorreta') {
                toast.error("Senha incorreta.");
            } else {
                toast.error("Erro ao entrar. Verifique seus dados.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextStep = () => {
        if (signupStep === 1) {
            if (!formData.name || !formData.cpf || !formData.email || !formData.phone) {
                toast.error("Todos os campos de dados pessoais são obrigatórios.");
                return;
            }
            setSignupStep(2);
        }
    };

    const handleSignupSubmit = async () => {
        // Validação da Etapa 2
        const hasSocialLink = formData.instagram || formData.tiktok || formData.kwai || formData.youtube || formData.facebook;
        if (!hasSocialLink) {
             toast.error("É obrigatório informar pelo menos uma rede social para análise.");
             return;
        }

        if (!formData.accountDescription || formData.accountDescription.length < 15) {
            toast.error("Por favor, preencha a descrição sobre sua conta com mais detalhes.");
            return;
        }

        if (!isResponsible) {
            toast.error("Você deve aceitar o termo de responsabilidade.");
            return;
        }

        setIsLoading(true);
        try {
            await createInfluencerRequest({
                name: formData.name,
                email: formData.email,
                cpf: formData.cpf,
                phone: formData.phone,
                partnershipType: formData.partnershipType,
                accountDescription: formData.accountDescription,
                socialLinks: {
                    instagram: formData.instagram, tiktok: formData.tiktok, kwai: formData.kwai, youtube: formData.youtube, facebook: formData.facebook
                },
                followers: {
                    instagram: formData.instagramFollowers, tiktok: formData.tiktokFollowers, kwai: formData.kwaiFollowers, youtube: formData.youtubeFollowers, facebook: formData.facebookFollowers
                },
                // Dados bancários removidos daqui, pois serão preenchidos pós-aprovação no primeiro login
                bankData: null 
            });
            toast.success("Solicitação enviada com sucesso!");
            setView('login');
            setPendingMessage("Cadastro realizado! O time de suporte fará a triagem das suas redes sociais e liberará seu acesso em até 24h via WhatsApp.");
            setSignupStep(1);
            setIsResponsible(false);
            setFormData({
                name: '', cpf: '', email: '', phone: '',
                partnershipType: 'Afiliado 50X',
                instagram: '', instagramFollowers: '',
                tiktok: '', tiktokFollowers: '',
                kwai: '', kwaiFollowers: '',
                youtube: '', youtubeFollowers: '',
                facebook: '', facebookFollowers: '',
                accountDescription: ''
            });
        } catch (e) {
            toast.error("Erro ao enviar solicitação.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleNetwork = (networkId: string, show: boolean) => {
        if (show) {
            setVisibleNetworks(prev => [...prev, networkId]);
        } else {
            setVisibleNetworks(prev => prev.filter(id => id !== networkId));
            const linkKey = networkId as keyof typeof formData;
            const followerKey = `${networkId}Followers` as keyof typeof formData;
            setFormData(prev => ({ ...prev, [linkKey]: '', [followerKey]: '' }));
        }
    };

    const networksConfig = [
        { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500', linkKey: 'instagram', followerKey: 'instagramFollowers' },
        { id: 'tiktok', label: 'TikTok', icon: Tiktok, color: 'text-white', linkKey: 'tiktok', followerKey: 'tiktokFollowers' },
        { id: 'kwai', label: 'Kwai', icon: () => <span className="w-5 h-5 font-black text-orange-500 bg-white rounded-full flex items-center justify-center text-xs">K</span>, color: 'text-orange-500', linkKey: 'kwai', followerKey: 'kwaiFollowers' },
        { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-500', linkKey: 'youtube', followerKey: 'youtubeFollowers' },
        { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-500', linkKey: 'facebook', followerKey: 'facebookFollowers' },
    ];

    const renderSignupStep = () => {
        switch(signupStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white mb-2">1. Dados e Perfil</h3>
                        
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Qual seu perfil de atuação?*</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Afiliado 50X', 'Influenciador'].map(type => (
                                    <button 
                                        key={type}
                                        onClick={() => setFormData({...formData, partnershipType: type})}
                                        className={`py-3 rounded-xl border-2 transition-all font-bold text-xs ${formData.partnershipType === type ? 'border-brand-primary bg-brand-primary/10 text-white' : 'border-gray-700 bg-gray-900 text-gray-500'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Input label="Nome Completo*" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        <Input label="CPF*" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} required />
                        <Input label="E-mail de Trabalho*" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        <Input label="WhatsApp*" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                        <Button className="w-full mt-4" onClick={handleNextStep}>Próximo: Redes Sociais →</Button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                         <div>
                            <h3 className="text-lg font-bold text-white mb-1">2. Presença Digital</h3>
                            <p className="text-xs text-gray-400">Nossa equipe verificará o perfil manualmente antes da aprovação.</p>
                         </div>
                         
                         <AnimatePresence>
                             {visibleNetworks.map(netId => {
                                 const config = networksConfig.find(n => n.id === netId);
                                 if (!config) return null;
                                 const Icon = config.icon;
                                 return (
                                     <motion.div key={netId} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                         <div className="flex justify-between items-center mb-4">
                                             <div className="flex items-center gap-2"><Icon className={`w-6 h-6 ${config.color}`}/><span className="font-bold text-white text-sm">{config.label}</span></div>
                                             <button onClick={() => toggleNetwork(netId, false)} className="text-gray-500 hover:text-red-400 p-1"><Trash className="w-4 h-4"/></button>
                                         </div>
                                         <div className="space-y-3">
                                             <Input placeholder={`Link ou @ no ${config.label}`} value={formData[config.linkKey as keyof typeof formData]} onChange={e => setFormData({...formData, [config.linkKey]: e.target.value})} />
                                             <Input placeholder="Estimativa de Seguidores (ex: 10k)" type="text" value={formData[config.followerKey as keyof typeof formData]} onChange={e => setFormData({...formData, [config.followerKey]: e.target.value})} />
                                         </div>
                                     </motion.div>
                                 )
                             })}
                         </AnimatePresence>

                         {visibleNetworks.length < networksConfig.length && (
                             <div className="flex flex-wrap gap-2">
                                 {networksConfig.filter(n => !visibleNetworks.includes(n.id)).map(net => (
                                     <button key={net.id} onClick={() => toggleNetwork(net.id, true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-600 text-gray-400 text-xs hover:text-white transition-all">+ {net.label}</button>
                                 ))}
                             </div>
                         )}

                         <div className="pt-4 border-t border-gray-700">
                             <div className="flex items-center gap-2 mb-2 text-gray-300 text-xs font-bold uppercase">
                                 <Info className="w-4 h-4 text-blue-400"/> Conte-nos sobre seu perfil (Obrigatório)
                             </div>
                             <textarea 
                                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-white text-sm focus:border-brand-primary outline-none h-32 resize-none leading-relaxed"
                                placeholder="Descreva sua presença: Uso pessoal ou profissional? Já é afiliado em outros projetos? Quais nichos você domina ou pretende publicar? (Ex: 'Perfil focado em tecnologia e reviews, já vendo infoprodutos e tenho audiência ativa no TikTok')."
                                value={formData.accountDescription}
                                onChange={(e) => setFormData({...formData, accountDescription: e.target.value})}
                             />
                             <p className="text-[10px] text-gray-500 mt-2">Dica: Quanto mais detalhes você fornecer, mais rápido nosso time aprova seu acesso.</p>
                         </div>

                         <div className="mt-4 bg-gray-900 p-4 rounded border border-gray-600">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 mt-0.5 rounded bg-gray-700 border-gray-500 text-brand-primary" checked={isResponsible} onChange={(e) => setIsResponsible(e.target.checked)} />
                                <span className="text-xs text-gray-300 leading-relaxed">
                                    Declaro que os perfis informados são meus e assumo responsabilidade sobre os conteúdos publicados. Cadastros falsos serão banidos sem aviso prévio.
                                </span>
                            </label>
                        </div>

                         <div className="flex gap-2 mt-6">
                             <Button variant="secondary" onClick={() => setSignupStep(1)} className="flex-1">Voltar</Button>
                             <Button onClick={handleSignupSubmit} isLoading={isLoading} className="flex-[2] !bg-green-600 font-bold uppercase text-xs tracking-widest shadow-lg shadow-green-900/20">ENVIAR SOLICITAÇÃO</Button>
                         </div>
                    </div>
                );
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-gray-800 rounded-full border border-gray-700 shadow-xl mb-4"><Users className="w-10 h-10 text-brand-primary" /></div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-wide">Ecossistema de Parceiros</h1>
                    <p className="text-gray-400 text-sm mt-2">Área exclusiva para Influencers e Afiliados 50X</p>
                </div>

                <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl p-8 relative">
                    {view === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            {pendingMessage && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-300 text-xs leading-relaxed">{pendingMessage}</p>
                                </div>
                            )}
                            <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                            <Input label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                            <Button type="submit" className="w-full !py-4 text-lg font-bold !bg-brand-primary text-black" isLoading={isLoading}>ENTRAR NO PAINEL</Button>
                            <div className="text-center pt-4 border-t border-gray-700">
                                <p className="text-gray-400 text-sm mb-2">Ainda não é parceiro?</p>
                                <Button variant="secondary" onClick={() => setView('signup')} className="w-full border border-gray-600">CADASTRE-SE PARA VENDER</Button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <button onClick={() => setView('login')} className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5"/></button>
                                <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Novo Cadastro</h2>
                            </div>
                            {renderSignupStep()}
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                     <button onClick={onBack} className="text-gray-500 text-xs hover:text-white flex items-center justify-center gap-1 mx-auto"><ArrowLeft className="w-3 h-3"/> Voltar para Login de Aluno</button>
                </div>
            </motion.div>
        </div>
    );
};

export default InfluencerLoginPage;
