
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import { CheckCircle, LockClosed, Users, AlertTriangle, ArrowRight, DollarSign, Wallet } from '../components/Icons';
import { registerAffiliateViaInvite, getAppProducts } from '../services/mockFirebase';
import { securityService } from '../services/securityService';
import toast from 'react-hot-toast';
import { AppProduct } from '../types';

interface AffiliateInvitePageProps {
    onSuccess: (email: string) => void;
}

const AffiliateInvitePage: React.FC<AffiliateInvitePageProps> = ({ onSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState<AppProduct | null>(null);
    const [commission, setCommission] = useState(0);

    // Form State
    const [formData, setFormData] = useState({
        name: '', email: '', cpf: '', phone: '', password: '', confirmPassword: '',
        bankName: '', agency: '', account: '', accType: 'corrente', pixKey: ''
    });

    useEffect(() => {
        // Parse URL params to get product info
        const params = new URLSearchParams(window.location.search);
        const prodId = params.get('p');
        const comm = params.get('c');

        if (prodId) {
            getAppProducts().then(prods => {
                const found = prods.find(p => p.id === prodId);
                if (found) setProduct(found);
            });
        }
        if (comm) setCommission(parseInt(comm));
    }, []);

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.cpf || !formData.pixKey) return toast.error("Preencha os campos obrigatórios.");
        
        // Security Check
        const validation = securityService.validatePassword(formData.password, {
            email: formData.email,
            name: formData.name
        });

        if (!validation.isValid) {
            validation.errors.forEach(err => toast.error(err));
            return;
        }

        if (formData.password !== formData.confirmPassword) return toast.error("Senhas não conferem.");
        
        setLoading(true);
        try {
            await registerAffiliateViaInvite({
                productId: product?.id,
                commissionRate: commission,
                ...formData,
                bankData: {
                    bankName: formData.bankName,
                    agency: formData.agency,
                    accountNumber: formData.account,
                    accountType: formData.accType,
                    holderName: formData.name,
                    holderCpf: formData.cpf,
                    pixKey: formData.pixKey,
                    pixKeyType: 'cpf' // Defaulting for simplicity in this view
                }
            });
            toast.success("Conta criada com sucesso! Você já é um afiliado.");
            onSuccess(formData.email); // Redirect to login
        } catch (e: any) {
            toast.error(e.message || "Erro ao criar conta.");
        } finally {
            setLoading(false);
        }
    };

    if (!product) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div></div>;

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="w-full max-w-2xl bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl overflow-hidden relative z-10"
            >
                {/* Header with Product Info */}
                <div className="bg-gray-900 p-8 border-b border-gray-700 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-brand-primary/10 rounded-full mb-4 border border-brand-primary/20">
                        <Users className="w-8 h-8 text-brand-primary" />
                    </div>
                    <h1 className="text-2xl font-black text-white mb-2">Convite Oficial de Parceria</h1>
                    <p className="text-gray-400">Você foi convidado para ser afiliado do produto:</p>
                    <div className="mt-4 bg-gray-800 border border-gray-600 rounded-xl p-4 inline-block min-w-[300px]">
                        <p className="text-lg font-bold text-white">{product.name}</p>
                        <div className="flex justify-center items-center gap-2 mt-2">
                            <span className="text-sm text-gray-400">Sua Comissão:</span>
                            <span className="text-green-400 font-bold text-xl">{commission}%</span>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="text-lg font-bold text-white border-l-4 border-brand-primary pl-3 mb-4">1. Dados Pessoais de Acesso</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Nome Completo*" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                <Input label="CPF*" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} placeholder="000.000.000-00" />
                            </div>
                            <Input label="E-mail (Será seu login)*" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            <Input label="WhatsApp*" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input 
                                    label="Senha*" 
                                    type="password" 
                                    value={formData.password} 
                                    onChange={e => setFormData({...formData, password: e.target.value})} 
                                    placeholder="8+ chars, Maiús, Núm, Símbolo"
                                />
                                <Input 
                                    label="Confirmar Senha*" 
                                    type="password" 
                                    value={formData.confirmPassword} 
                                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                                />
                            </div>

                            <Button onClick={() => setStep(2)} className="w-full mt-4 !py-3 font-bold">Continuar <ArrowRight className="w-4 h-4 ml-2"/></Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="text-lg font-bold text-white border-l-4 border-green-500 pl-3 mb-4 flex items-center gap-2">
                                2. Dados de Recebimento <LockClosed className="w-4 h-4 text-gray-500"/>
                            </h3>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded mb-4 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-200">
                                    Os dados bancários são obrigatórios para processamento de pagamentos automáticos (Split de pagamento). A conta deve ser do mesmo titular do CPF.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <Input label="Banco (Cód)" placeholder="Ex: 260" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} />
                                </div>
                                <Input label="Agência" value={formData.agency} onChange={e => setFormData({...formData, agency: e.target.value})} />
                                <Input label="Conta" value={formData.account} onChange={e => setFormData({...formData, account: e.target.value})} />
                            </div>
                            
                            <div className="bg-gray-800 p-4 rounded border border-gray-600">
                                <label className="text-sm font-bold text-gray-300 block mb-2 flex items-center gap-2"><Wallet className="w-4 h-4 text-brand-primary"/> Chave PIX (Principal)</label>
                                <input 
                                    className="w-full bg-gray-900 border border-gray-500 rounded p-3 text-white focus:border-brand-primary outline-none"
                                    placeholder="CPF, Email ou Aleatória"
                                    value={formData.pixKey}
                                    onChange={e => setFormData({...formData, pixKey: e.target.value})}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Voltar</Button>
                                <Button onClick={handleSubmit} isLoading={loading} className="flex-[2] !bg-green-600 hover:!bg-green-500 font-bold shadow-lg shadow-green-900/20">
                                    FINALIZAR CADASTRO
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="bg-gray-900/50 p-4 text-center text-xs text-gray-500 border-t border-gray-700">
                    <p>Ambiente seguro. Seus dados estão protegidos.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default AffiliateInvitePage;
