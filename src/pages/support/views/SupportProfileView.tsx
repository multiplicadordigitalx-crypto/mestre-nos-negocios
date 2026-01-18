
import React, { useState, useEffect } from 'react';
import { SupportAgent, ProducerBankData } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { Step0Compliance, validateDoc } from '../../../components/ProductWizardModal';
import { updateSupportAgent } from '../../../services/mockFirebase';
import { User, ShieldCheck, Key } from '../../../components/Icons';
import Card from '../../../components/Card';
import toast from 'react-hot-toast';

export const SupportProfileView: React.FC<{ agent: SupportAgent }> = ({ agent }) => {
    const { refreshUser } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    // Estado inicial mapeando dados do agente para o formulário de compliance
    const [producerData, setProducerData] = useState<ProducerBankData>({
        fullName: agent.displayName || '',
        cpfCnpj: (agent as any).cpf || '',
        email: agent.email || '',
        phone: (agent as any).phone || '',
        birthDate: (agent as any).birthDate || '',
        bank: (agent as any).bankName || '',
        agency: (agent as any).bankAgency || '',
        account: (agent as any).bankAccount || '',
        pixKey: (agent as any).pixKey || '',
        address: {
            zipCode: (agent as any).zipCode || '',
            street: (agent as any).address || '',
            number: (agent as any).addressNumber || '',
            district: (agent as any).district || '',
            city: (agent as any).city || '',
            state: (agent as any).state || '',
            complement: (agent as any).complement || ''
        },
        isVerified: !!agent.producerData?.isVerified
    });

    useEffect(() => {
        if (agent.producerData) {
            setProducerData(prev => ({ ...prev, ...agent.producerData }));
        }
    }, [agent]);

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
            await updateSupportAgent(agent.uid, {
                producerData: { ...producerData, isVerified: true }
            });
            await refreshUser();
            toast.success("Seus dados de perfil foram atualizados!");
        } catch (error) {
            toast.error("Erro ao salvar dados.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="p-6 overflow-y-auto h-full custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <User className="w-8 h-8 text-brand-primary" /> Meu Perfil de Suporte
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Gerencie suas informações de acesso e dados para recebimento.</p>
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

