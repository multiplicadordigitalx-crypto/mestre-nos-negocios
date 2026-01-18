
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { X as XIcon, User, ShieldCheck, LockClosed, Eye, EyeOff, Zap, MapPin, CreditCard } from '../../../components/Icons';
import { Influencer, ProducerBankData } from '../../../types';
import { updateInfluencer } from '../../../services/mockFirebase';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';
import { validateDoc, Step0Compliance } from '../../../components/ProductWizardModal';
import { securityService } from '../../../services/securityService';

export const EditProfileModal: React.FC<{ isOpen: boolean; onClose: () => void; influencer: Influencer }> = ({ isOpen, onClose, influencer }) => {
    const { refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    
    // States para senha
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState<ProducerBankData>({
        fullName: influencer.displayName || '',
        cpfCnpj: influencer.producerData?.cpfCnpj || influencer.cpf || '',
        email: influencer.email || '',
        phone: influencer.producerData?.phone || influencer.phone || '',
        birthDate: influencer.producerData?.birthDate || '',
        bank: influencer.producerData?.bank || influencer.bankData?.bankName || '',
        agency: influencer.producerData?.agency || influencer.bankData?.agency || '',
        account: influencer.producerData?.account || influencer.bankData?.accountNumber || '',
        pixKey: influencer.producerData?.pixKey || influencer.bankData?.pixKey || '',
        address: influencer.producerData?.address || {
            zipCode: '',
            street: '',
            number: '',
            district: '',
            city: '',
            state: '',
            complement: ''
        },
        isVerified: influencer.producerData?.isVerified || false
    });

    useEffect(() => {
        if (isOpen && influencer) {
            setFormData({
                fullName: influencer.displayName || '',
                cpfCnpj: influencer.producerData?.cpfCnpj || influencer.cpf || '',
                email: influencer.email || '',
                phone: influencer.producerData?.phone || influencer.phone || '',
                birthDate: influencer.producerData?.birthDate || '',
                bank: influencer.producerData?.bank || influencer.bankData?.bankName || '',
                agency: influencer.producerData?.agency || influencer.bankData?.agency || '',
                account: influencer.producerData?.account || influencer.bankData?.accountNumber || '',
                pixKey: influencer.producerData?.pixKey || influencer.bankData?.pixKey || '',
                address: influencer.producerData?.address || {
                    zipCode: '',
                    street: '',
                    number: '',
                    district: '',
                    city: '',
                    state: '',
                    complement: ''
                },
                isVerified: influencer.producerData?.isVerified || false
            });
            // Resetar campos de senha ao abrir
            setNewPassword('');
            setConfirmPassword('');
        }
    }, [isOpen, influencer]);

    if (!isOpen) return null;

    const handleCepChange = async (val: string) => {
        const cleanCep = val.replace(/\D/g, '').slice(0, 8);
        setFormData(prev => ({...prev, address: { ...prev.address, zipCode: cleanCep }}));
        if (cleanCep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData(prev => ({
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
            } catch (e) { console.error(e); }
        }
    };

    const handleSave = async () => {
        if (newPassword) {
            const validation = securityService.validatePassword(newPassword, {
                email: influencer.email,
                name: influencer.displayName
            });

            if (!validation.isValid) {
                validation.errors.forEach(err => toast.error(err));
                return;
            }

            if (newPassword !== confirmPassword) return toast.error("As senhas não conferem.");
        }

        if (!validateDoc(formData.cpfCnpj)) {
            return toast.error("CPF ou CNPJ matematicamente inválido.");
        }

        if (!formData.pixKey || !formData.bank) {
            return toast.error("Dados bancários são obrigatórios.");
        }

        setLoading(true);
        try {
            const updates: any = {
                producerData: { ...formData, isVerified: true }
            };

            if (newPassword) {
                updates.password = newPassword;
            }

            await updateInfluencer(influencer.uid, updates);
            await refreshUser();
            toast.success("Perfil atualizado com sucesso!");
            setNewPassword('');
            setConfirmPassword('');
            onClose();
        } catch (error) {
            toast.error("Erro ao atualizar perfil.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0f111a] w-full max-w-2xl rounded-[2rem] border border-gray-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                            <User className="w-6 h-6 text-brand-primary"/>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Meu Perfil Estratégico</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Gestão de Dados e Compliance</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><XIcon className="w-6 h-6 text-gray-400"/></button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                             <ShieldCheck className="w-4 h-4 text-brand-primary"/>
                             <h4 className="text-xs font-black text-white uppercase tracking-widest">Dados de Identidade</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="opacity-60 cursor-not-allowed">
                                <Input label="Nome Completo (Bloqueado)" value={formData.fullName} readOnly className="!bg-gray-950 border-gray-800 text-gray-500" />
                            </div>
                            <div className="opacity-60 cursor-not-allowed">
                                <Input label="E-mail de Acesso (Bloqueado)" value={formData.email} readOnly className="!bg-gray-950 border-gray-800 text-gray-500" />
                            </div>
                            <div className="opacity-60 cursor-not-allowed">
                                <Input label="CPF ou CNPJ (Bloqueado)" value={formData.cpfCnpj} readOnly className="!bg-gray-950 border-gray-800 text-gray-500" />
                            </div>
                            <Input label="Telefone WhatsApp*" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            <Input label="Data de Nascimento*" type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                             <MapPin className="w-4 h-4 text-blue-400"/>
                             <h4 className="text-xs font-black text-white uppercase tracking-widest">Endereço Fiscal</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input label="CEP*" value={formData.address.zipCode} onChange={e => handleCepChange(e.target.value)} placeholder="00000-000" />
                            <div className="md:col-span-3"><Input label="Rua / Logradouro*" value={formData.address.street} onChange={e => setFormData({...formData, address: {...formData.address, street: e.target.value}})} /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input label="Número*" value={formData.address.number} onChange={e => setFormData({...formData, address: {...formData.address, number: e.target.value}})} />
                            <div className="md:col-span-2"><Input label="Bairro*" value={formData.address.district} onChange={e => setFormData({...formData, address: {...formData.address, district: e.target.value}})} /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Cidade*" value={formData.address.city} onChange={e => setFormData({...formData, address: {...formData.address, city: e.target.value}})} />
                            <Input label="Estado (UF)*" value={formData.address.state} onChange={e => setFormData({...formData, address: {...formData.address, state: e.target.value}})} maxLength={2} />
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                             <CreditCard className="w-4 h-4 text-green-500"/>
                             <h4 className="text-xs font-black text-white uppercase tracking-widest">Dados para Recebimento</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input label="Banco*" value={formData.bank} onChange={e => setFormData({...formData, bank: e.target.value})} placeholder="Ex: Nubank" />
                            <Input label="Agência*" value={formData.agency} onChange={e => setFormData({...formData, agency: e.target.value})} />
                            <Input label="Conta*" value={formData.account} onChange={e => setFormData({...formData, account: e.target.value})} />
                        </div>
                        <div className="bg-gray-900/80 p-4 rounded-xl border border-brand-primary/20">
                             <Input 
                                label="Chave PIX Principal*" 
                                value={formData.pixKey} 
                                onChange={e => setFormData({...formData, pixKey: e.target.value})} 
                                placeholder="CPF, E-mail ou Telefone" 
                                className="!bg-gray-950 !border-brand-primary/30 focus:!border-brand-primary text-brand-primary font-bold"
                             />
                        </div>
                    </div>

                    {/* SEÇÃO DE SEGURANÇA DA CONTA */}
                    <div className="space-y-4 pt-6 border-t border-gray-800">
                        <div className="bg-purple-900/10 p-5 rounded-2xl border border-purple-500/20">
                            <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <LockClosed className="w-4 h-4" /> Segurança da Conta
                            </h4>
                            <p className="text-xs text-purple-200/60 mb-4 leading-relaxed">
                                Defina ou altere sua senha de acesso. Para primeiro acesso, é obrigatório definir uma senha segura (8+ caracteres, maiúsculas, números e símbolos).
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Input 
                                        label="Nova Senha" 
                                        type={showPassword ? "text" : "password"} 
                                        value={newPassword} 
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Senha Forte (8+ chars)"
                                        className="!bg-gray-900 focus:!border-purple-500"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-9 text-gray-500 hover:text-white p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                    </button>
                                </div>
                                <Input 
                                    label="Confirmar Senha" 
                                    type={showPassword ? "text" : "password"} 
                                    value={confirmPassword} 
                                    onChange={e => setConfirmPassword(e.target.value)} 
                                    className="!bg-gray-900 focus:!border-purple-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-900/80 border-t border-gray-800 flex gap-3">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button onClick={handleSave} isLoading={loading} className="flex-1 !bg-brand-primary text-black font-black uppercase text-xs shadow-lg shadow-brand-primary/10">
                        Atualizar Cadastro Completo
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
