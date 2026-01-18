import React, { useState, useEffect } from 'react';
import { SupportAgent, ProducerBankData } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { Step0Compliance, validateDoc } from '../../../components/ProductWizardModal';
import { updateSupportAgent } from '../../../services/mockFirebase';
import { User, ShieldCheck, Key, FileText, LockClosed } from '../../../components/Icons';
import Card from '../../../components/Card';
import toast from 'react-hot-toast';
import HRMemberPanel from '../../hr/HRMemberPanel';

interface FinanceProfileViewProps {
    user: any;
}

export const FinanceProfileView: React.FC<FinanceProfileViewProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'hr'>('details');

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-800 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <User className="w-8 h-8 text-brand-primary" /> Meu Perfil
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Gerencie seus dados e acesse seu RH.</p>
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`pb-2 px-4 text-sm font-bold transition-colors relative ${activeTab === 'details' ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Dados & Segurança
                        {activeTab === 'details' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('hr')}
                        className={`pb-2 px-4 text-sm font-bold transition-colors relative ${activeTab === 'hr' ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Meu RH
                        {activeTab === 'hr' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-full" />}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="max-w-5xl mx-auto">
                    {activeTab === 'details' ? (
                        <FinanceDetailsTab user={user} />
                    ) : (
                        <HRMemberPanel user={user} />
                    )}
                </div>
            </div>
        </div>
    );
};

const FinanceDetailsTab: React.FC<{ user: any }> = ({ user }) => {
    const { refreshUser } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    // Determine initial state safely
    const [producerData, setProducerData] = useState<ProducerBankData>({
        fullName: user.displayName || '',
        cpfCnpj: user.cpf || '',
        email: user.email || '',
        phone: user.phone || '',
        birthDate: user.birthDate || '',
        bank: user.bankName || '',
        agency: user.bankAgency || '',
        account: user.bankAccount || '',
        pixKey: user.pixKey || '',
        address: {
            zipCode: user.zipCode || '',
            street: user.address || '',
            number: user.addressNumber || '',
            district: user.district || '',
            city: user.city || '',
            state: user.state || '',
            complement: user.complement || ''
        },
        isVerified: !!user.producerData?.isVerified
    });

    useEffect(() => {
        if (user.producerData) {
            setProducerData(prev => ({ ...prev, ...user.producerData }));
        }
    }, [user]);

    const handleCepChange = async (val: string) => {
        const cleanCep = val.replace(/\D/g, '').slice(0, 8);
        setProducerData(prev => ({ ...prev, address: { ...prev.address, zipCode: cleanCep } }));
        if (cleanCep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setProducerData(prev => ({
                        ...prev,
                        address: {
                            ...prev.address,
                            street: data.logradouro,
                            district: data.bairro,
                            city: data.localidade,
                            state: data.uf
                        }
                    }));
                }
            } catch (e) { }
        }
    };

    const handleSave = async () => {
        if (!validateDoc(producerData.cpfCnpj)) {
            return toast.error("Documento (CPF/CNPJ) inválido.");
        }

        setIsProcessing(true);
        try {
            await updateSupportAgent(user.uid, {
                producerData: { ...producerData, isVerified: true }
            });
            await refreshUser();
            toast.success("Dados atualizados com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar dados.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 rounded-xl">
                    <p className="text-yellow-400 text-sm flex items-center gap-2">
                        <LockClosed className="w-4 h-4" />
                        Seus dados são protegidos por criptografia de ponta a ponta.
                    </p>
                </div>
                {producerData.isVerified && (
                    <div className="bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-xl flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Verificado</span>
                    </div>
                )}
            </div>

            <Card className="p-8 bg-gray-800 border-gray-700 rounded-[2rem]">
                <Step0Compliance
                    producerData={producerData}
                    setProducerData={setProducerData}
                    handleCepChange={handleCepChange}
                    handleSaveProducer={handleSave}
                    isProcessing={isProcessing}
                    readOnlyFields={['fullName', 'email', 'cpfCnpj']}
                />
            </Card>

            <SecurityCard />
        </div>
    );
};

const SecurityCard: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            return toast.error("Preencha todos os campos.");
        }
        if (newPassword !== confirmPassword) {
            return toast.error("A nova senha e a confirmação não coincidem.");
        }
        if (newPassword.length < 6) {
            return toast.error("A nova senha deve ter pelo menos 6 caracteres.");
        }

        setLoading(true);
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success("Senha alterada com sucesso!");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setLoading(false);
    };

    return (
        <Card className="p-8 bg-gray-800 border-gray-700 rounded-[2rem]">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Key className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Segurança da Conta</h3>
                    <p className="text-xs text-gray-400">Atualize sua senha de acesso.</p>
                </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Senha Atual</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-brand-primary outline-none transition-all placeholder-gray-600"
                        placeholder="••••••••"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nova Senha</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-brand-primary outline-none transition-all placeholder-gray-600"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Confirmar Nova Senha</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-brand-primary outline-none transition-all placeholder-gray-600"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all w-full md:w-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Atualizando...' : 'Atualizar Senha'}
                    </button>
                </div>
            </form>
        </Card>
    );
};
