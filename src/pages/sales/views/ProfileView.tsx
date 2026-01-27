
import React, { useState, useEffect } from 'react';
import { SalesPerson, ProducerBankData } from '@/types';
import { User, ShieldCheck, Save, MapPin, CreditCard, LockClosed, RefreshCw, ActivityIcon, Eye, EyeOff } from '@/components/Icons';
import { motion } from 'framer-motion';
import { Step0Compliance, validateDoc } from '@/components/ProductWizardModal';
import { updateSalesPerson } from '@/services/mockFirebase';
import { securityService } from '@/services/securityService';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';

export const ProfileView: React.FC<{ salesPerson: SalesPerson }> = ({ salesPerson }) => {
    const { refreshUser } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    // Estado do formulário de compliance preenchido com dados do vendedor
    const [producerData, setProducerData] = useState<ProducerBankData>({
        fullName: salesPerson.displayName || '',
        cpfCnpj: salesPerson.cpf || '',
        email: salesPerson.email || '',
        phone: salesPerson.phone || '',
        birthDate: salesPerson.birthDate || '',
        bank: salesPerson.bankName || '',
        agency: salesPerson.bankAgency || '',
        account: salesPerson.bankAccount || '',
        pixKey: salesPerson.pixKey || '',
        address: {
            zipCode: salesPerson.zipCode || '',
            street: salesPerson.address || '',
            number: salesPerson.addressNumber || '',
            district: salesPerson.district || '',
            city: salesPerson.city || '',
            state: salesPerson.state || '',
            complement: salesPerson.complement || ''
        },
        isVerified: salesPerson.registrationCompleted
    });

    // Estado para alteração de senha
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Sincroniza se o objeto salesPerson mudar (ex: após refresh)
    useEffect(() => {
        if (salesPerson) {
            setProducerData({
                fullName: salesPerson.displayName || '',
                cpfCnpj: salesPerson.cpf || '',
                email: salesPerson.email || '',
                phone: salesPerson.phone || '',
                birthDate: salesPerson.birthDate || '',
                bank: salesPerson.bankName || '',
                agency: salesPerson.bankAgency || '',
                account: salesPerson.bankAccount || '',
                pixKey: salesPerson.pixKey || '',
                address: {
                    zipCode: salesPerson.zipCode || '',
                    street: salesPerson.address || '',
                    number: salesPerson.addressNumber || '',
                    district: salesPerson.district || '',
                    city: salesPerson.city || '',
                    state: salesPerson.state || '',
                    complement: salesPerson.complement || ''
                },
                isVerified: salesPerson.registrationCompleted
            });
        }
    }, [salesPerson]);

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
                    toast.success("Endereço localizado!");
                }
            } catch (e) { console.error("CEP Error", e); }
        }
    };

    const handleSave = async () => {
        if (!validateDoc(producerData.cpfCnpj)) return toast.error("Documento inválido.");
        if (!producerData.pixKey || !producerData.bank) return toast.error("Dados bancários obrigatórios para recebimento.");

        setIsProcessing(true);
        try {
            const updates = {
                phone: producerData.phone,
                birthDate: producerData.birthDate,
                bankName: producerData.bank,
                bankAgency: producerData.agency,
                bankAccount: producerData.account,
                pixKey: producerData.pixKey,
                zipCode: producerData.address.zipCode,
                address: producerData.address.street,
                addressNumber: producerData.address.number,
                district: producerData.address.district,
                city: producerData.address.city,
                state: producerData.address.state,
                complement: producerData.address.complement,
                registrationCompleted: true
            };

            await updateSalesPerson(salesPerson.uid, updates);
            await refreshUser();
            toast.success("Dados de recebimento atualizados com sucesso!");
        } catch (error) {
            toast.error("Erro ao salvar dados.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!newPassword) return toast.error("Digite a nova senha.");

        // 8-Digit Security Logic Integration
        const validation = securityService.validatePassword(newPassword, {
            email: salesPerson.email,
            name: salesPerson.displayName
        });

        if (!validation.isValid) {
            validation.errors.forEach(err => toast.error(err));
            return;
        }

        if (newPassword !== confirmPassword) return toast.error("As senhas não conferem.");

        setIsProcessing(true);
        try {
            await updateSalesPerson(salesPerson.uid, { password: newPassword });
            toast.success("Senha atualizada com sucesso!");
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            toast.error("Erro ao atualizar senha.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto pb-24 space-y-6 animate-fade-in pr-2">
                {/* Header de Meus Dados */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                            <User className="w-8 h-8 text-blue-500" /> Meus Dados & Compliance
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Gerencie suas informações para recebimento de comissões e identificação comercial.</p>
                    </div>
                    {producerData.isVerified && (
                        <div className="bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-xl flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                            <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Cadastro Verificado</span>
                        </div>
                    )}
                </div>

                {/* Banner de Aviso de Campos Bloqueados */}
                <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-2xl flex gap-4 items-start shadow-inner">
                    <LockClosed className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-blue-200 font-bold uppercase tracking-tight">Segurança de Identidade</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Por normas de compliance, os campos de <strong>Nome, E-mail e CPF</strong> são fixos. Caso precise alterar esses dados fundamentais, entre em contato com o administrador do sistema.
                        </p>
                    </div>
                </div>

                {/* Formulário Principal */}
                <Card className="p-8 bg-gray-800 border-gray-700 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10">
                        <Step0Compliance
                            producerData={producerData}
                            setProducerData={setProducerData}
                            handleCepChange={handleCepChange}
                            handleSaveProducer={handleSave}
                            isProcessing={isProcessing}
                            readOnlyFields={['fullName', 'email', 'cpfCnpj']}
                        />
                    </div>
                </Card>

                {/* Card de Segurança da Conta */}
                <Card className="p-8 bg-gray-800 border-gray-700 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <LockClosed className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-widest">Segurança da Conta</h3>
                            <p className="text-xs text-gray-400">Senha forte (8+ dígitos, Maiúsculas, Números e Símbolos).</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Input
                                    label="Nova Senha"
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Mínimo 8 caracteres + Símbolos"
                                    className="!bg-gray-900 border-gray-600 focus:!border-yellow-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-9 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <Input
                                label="Confirmar Nova Senha"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repita a senha"
                                className="!bg-gray-900 border-gray-600 focus:!border-yellow-500"
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={handlePasswordUpdate}
                                isLoading={isProcessing}
                                disabled={!newPassword || newPassword !== confirmPassword}
                                className="!bg-yellow-600 hover:!bg-yellow-500 text-black font-black uppercase text-xs w-full md:w-auto"
                            >
                                ATUALIZAR SENHA DE ACESSO
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Informações Auxiliares */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Card className="p-5 bg-gray-800/50 border-gray-700">
                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-green-400" /> Status de Saque
                        </h4>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-300">Regra de Liquidação:</span>
                            <span className="text-sm font-bold text-white uppercase">D+1 Útil (Nativo)</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-300">Taxa de Saque:</span>
                            <span className="text-sm font-bold text-green-400 uppercase">Isento</span>
                        </div>
                    </Card>

                    <Card className="p-5 bg-gray-800/50 border-gray-700">
                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ActivityIcon className="w-4 h-4 text-blue-400" /> Auditoria de Acesso
                        </h4>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-300">Sua conta é monitorada:</span>
                            <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold">LOGS ATIVOS</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-300">Último Login:</span>
                            <span className="text-xs text-white font-mono">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
