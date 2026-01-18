
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { ProducerBankData, TeamUser } from '../../../types';
import { Step0Compliance, validateDoc } from '../../../components/ProductWizardModal';
import { updateUserProducerData } from '../../../services/mockFirebase';
import { ShieldCheck, User, Camera, LockClosed, CheckCircle } from '../../../components/Icons';
import Card from '../../../components/Card';
import toast from 'react-hot-toast';

const AdminProfileView: React.FC = () => {
    const { user, refreshUser, updateProfilePhoto } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [producerData, setProducerData] = useState<ProducerBankData>({
        fullName: user?.displayName || '',
        cpfCnpj: user?.cpf || '', // Here we map user.cpf to cpfCnpj
        email: user?.email || '',
        phone: '',
        birthDate: '',
        bank: '',
        agency: '',
        account: '',
        pixKey: '',
        address: { zipCode: '', street: '', number: '', district: '', city: '', state: '', complement: '' },
        isVerified: false
    });

    useEffect(() => {
        if (user) {
            // Priority to existing producer data, then fallback to user profile data
            setProducerData(prev => ({
                ...prev,
                fullName: user.displayName || prev.fullName,
                cpfCnpj: user.producerData?.cpfCnpj || user.cpf || prev.cpfCnpj,
                email: user.producerData?.email || user.email || prev.email,
                ...(user.producerData || {})
            }));
        }
    }, [user]);

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validação básica de tipo
            if (!file.type.startsWith('image/')) {
                toast.error('Por favor, selecione um arquivo de imagem.');
                return;
            }
            // Validação básica de tamanho (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('A imagem deve ter no máximo 5MB.');
                return;
            }
            updateProfilePhoto(file);
        }
    };

    const handleCepChange = async (val: string) => {
        const cleanCep = val.replace(/\D/g, '').slice(0, 8);
        setProducerData(prev => ({...prev, address: { ...prev.address, zipCode: cleanCep }}));
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
            } catch (e) { toast.error("Erro ao localizar CEP."); }
        }
    };

    const handleSave = async () => {
        if (!validateDoc(producerData.cpfCnpj)) return toast.error("CPF ou CNPJ matematicamente inválido.");
        if (!producerData.fullName || !producerData.pixKey || !producerData.bank) return toast.error("Preencha todos os campos obrigatórios (*).");

        setIsProcessing(true);
        try {
            await updateUserProducerData(user!.uid, { ...producerData, isVerified: true });
            await refreshUser();
            toast.success("Seu perfil administrativo foi atualizado e verificado!", { icon: '👑' });
        } catch (error) {
            toast.error("Erro ao salvar dados.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <User className="w-8 h-8 text-brand-primary"/> Meu Perfil Admin
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Gerencie suas informações reais para compliance e recebimentos.</p>
                </div>
                {producerData.isVerified && (
                    <div className="bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-xl flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Conta Verificada</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lateral: Avatar e Status */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-8 text-center flex flex-col items-center bg-gray-800">
                        <div 
                            className="relative group mb-4 cursor-pointer"
                            onClick={handlePhotoClick}
                        >
                            <img 
                                src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.email}`} 
                                className="w-32 h-32 rounded-full border-4 border-gray-700 object-cover group-hover:border-brand-primary transition-all"
                                alt="Admin"
                            />
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white"/>
                            </div>
                            <input 
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <h2 className="text-xl font-bold text-white">{user?.displayName}</h2>
                        <p className="text-xs text-brand-primary font-black uppercase tracking-widest mt-1">Super Administrador</p>
                        
                        <div className="w-full mt-8 pt-6 border-t border-gray-700 space-y-4 text-left">
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                <LockClosed className="w-4 h-4 text-gray-500"/>
                                <span>Acesso Criptografado</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                <CheckCircle className="w-4 h-4 text-green-500"/>
                                <span>Permissão: Total (Owner)</span>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-[2rem] shadow-xl">
                        <h4 className="text-blue-300 font-bold text-sm uppercase mb-3">Dica de Segurança</h4>
                        <p className="text-xs text-blue-100/70 leading-relaxed italic">
                            "Mantenha seus dados bancários e endereço sempre atualizados. Estes dados são usados para emitir notas fiscais e processar repasses de vendas diretas."
                        </p>
                    </div>
                </div>

                {/* Principal: Formulário de Compliance */}
                <div className="lg:col-span-2">
                    <Card className="p-8 bg-gray-800 border-gray-700 rounded-[2.5rem]">
                        <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8 border-b border-gray-700 pb-4">
                            Dados de Cadastro & Split
                        </h3>
                        <Step0Compliance 
                            producerData={producerData}
                            setProducerData={setProducerData}
                            handleCepChange={handleCepChange}
                            handleSaveProducer={handleSave}
                            isProcessing={isProcessing}
                            readOnlyFields={['fullName', 'email', 'cpfCnpj']}
                            showSecurity={true} // Enable password change for admin
                            onPasswordChange={async (pass) => {
                                // Direct update for simpler integration here, ideally via separate handler
                                const { updateStudent } = await import('../../../services/mockFirebase');
                                await updateStudent(user!.uid, { password: pass });
                                toast.success("Senha de admin atualizada.");
                            }}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminProfileView;
