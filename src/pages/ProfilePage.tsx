
import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import StudentProfileView from '../components/StudentProfileView';
import { Student, ProducerBankData } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import { ShieldCheck, Clock, RotateCcw, CheckCircle, AlertTriangle, Calendar, Pencil, X as XIcon, Wallet, LockClosed, Eye, EyeOff } from '../components/Icons';
import { Step0Compliance, validateDoc } from '../components/ProductWizardModal';
import { updateUserProducerData, updateStudent } from '../services/userService';
import { securityService } from '../services/securityService';
import toast from 'react-hot-toast';
import Input from '../components/Input';

interface ProfilePageProps {
    onOpenRefund?: () => void;
    onOpenRenewal?: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenRefund, onOpenRenewal }) => {
    const { user, refreshUser } = useAuth();
    const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Estado para alteração de senha
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Estado do formulário de compliance
    const [producerData, setProducerData] = useState<ProducerBankData>({
        fullName: user?.displayName || '',
        cpfCnpj: user?.producerData?.cpfCnpj || '',
        email: user?.producerData?.email || user?.email || '',
        phone: user?.producerData?.phone || '',
        birthDate: user?.producerData?.birthDate || '',
        bank: user?.producerData?.bank || '',
        agency: user?.producerData?.agency || '',
        account: user?.producerData?.account || '',
        pixKey: user?.producerData?.pixKey || '',
        address: user?.producerData?.address || {
            zipCode: '',
            street: '',
            number: '',
            district: '',
            city: '',
            state: '',
            complement: ''
        },
        isVerified: user?.producerData?.isVerified || false
    });

    useEffect(() => {
        if (user?.producerData) {
            setProducerData(user.producerData);
        }
    }, [user]);

    const { daysSincePurchase, isEligibleForRefund, isRenewPeriod, daysRemaining, expirationDate } = useMemo(() => {
        const purchaseDate = user?.purchaseDate ? new Date(user.purchaseDate) : new Date();
        const now = new Date();

        const refundDeadline = new Date(purchaseDate);
        refundDeadline.setDate(refundDeadline.getDate() + 7);
        refundDeadline.setHours(23, 59, 59, 999);

        const isEligibleForRefund = now <= refundDeadline;
        const diffTime = now.getTime() - purchaseDate.getTime();
        const daysSincePurchase = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const validityDays = 365;
        const daysRemainingCalc = validityDays - daysSincePurchase;
        const isRenewPeriod = daysRemainingCalc <= 30;
        const expirationDate = new Date(purchaseDate.getTime() + (365 * 24 * 60 * 60 * 1000));

        return {
            daysSincePurchase,
            isEligibleForRefund,
            isRenewPeriod,
            daysRemaining: daysRemainingCalc,
            expirationDate
        };
    }, [user]);

    if (!user) return null;

    const student = user as Student;
    const isRefundRequested = student.financial?.refundRequested;

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
            } catch (e) { console.error(e); }
        }
    };

    const handleSaveCompliance = async () => {
        if (!validateDoc(producerData.cpfCnpj)) return toast.error("CPF ou CNPJ inválido.");
        if (!producerData.pixKey || !producerData.bank) return toast.error("Dados bancários são obrigatórios.");

        setIsProcessing(true);
        try {
            await updateUserProducerData(user.uid, { ...producerData, isVerified: true });
            await refreshUser();
            toast.success("Dados de compliance atualizados!");
            setIsComplianceModalOpen(false);
        } catch (error) {
            toast.error("Erro ao salvar dados.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!newPassword) return toast.error("Digite a nova senha.");

        // Validação de Segurança
        const validation = securityService.validatePassword(newPassword, {
            email: user.email || undefined,
            name: user.displayName || undefined
        });

        if (!validation.isValid) {
            validation.errors.forEach(err => toast.error(err));
            return;
        }

        if (newPassword !== confirmPassword) return toast.error("As senhas não conferem.");

        setIsProcessing(true);
        try {
            await updateStudent(user.uid, { password: newPassword });
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto pb-10 space-y-6"
        >
            <h1 className="text-3xl font-bold text-white">Meu Perfil</h1>

            <div className="bg-gray-800/30 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden backdrop-blur-sm">
                <StudentProfileView student={student} viewer="student" />
            </div>

            {/* SEÇÃO DE COMPLIANCE / DADOS DE PRODUTOR */}
            <Card className={`p-6 border-l-4 ${producerData.isVerified ? 'border-l-green-500' : 'border-l-yellow-500'} bg-gray-800`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShieldCheck className={`w-6 h-6 ${producerData.isVerified ? 'text-green-500' : 'text-yellow-500'}`} />
                            Dados de Produtor (Split & Recebimento)
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                            {producerData.isVerified
                                ? "Seus dados de recebimento estão validados e ativos."
                                : "Complete seu cadastro para habilitar a criação de produtos e recebimento de comissões."}
                        </p>
                    </div>
                    <Button onClick={() => setIsComplianceModalOpen(true)} className="!py-2 !px-4 text-xs font-bold flex items-center justify-center gap-2 w-full md:w-auto">
                        <Pencil className="w-4 h-4" />
                        {producerData.isVerified ? 'Editar Dados' : 'Completar Cadastro'}
                    </Button>
                </div>

                {producerData.isVerified && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                            <p className="text-[10px] text-gray-500 uppercase font-black">Documento</p>
                            <p className="text-sm text-gray-200 font-mono">{producerData.cpfCnpj}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                            <p className="text-[10px] text-gray-500 uppercase font-black">Chave PIX Ativa</p>
                            <p className="text-sm text-brand-primary font-bold">{producerData.pixKey}</p>
                        </div>
                    </div>
                )}
            </Card>

            {/* SEÇÃO DE SEGURANÇA DA CONTA */}
            <Card className="p-8 bg-gray-800 border-gray-700 rounded-2xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <LockClosed className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-widest">Segurança da Conta</h3>
                        <p className="text-xs text-gray-400">Defina sua senha para primeiro acesso ou atualização.</p>
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
                                placeholder="Mínimo 8 caracteres (Maiúscula, Número, Símbolo)"
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

            <Card className="p-6 border-l-4 border-l-brand-primary">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-brand-primary" /> Assinatura e Garantia
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                            <p className="text-gray-400 text-xs uppercase font-bold mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Validade do Acesso
                            </p>
                            <div className="flex justify-between items-end">
                                <span className="text-white font-medium">Expira em:</span>
                                <span className={`font-bold ${isRenewPeriod ? 'text-red-400' : 'text-green-400'}`}>
                                    {expirationDate.toLocaleDateString()} ({daysRemaining} dias)
                                </span>
                            </div>
                            <div className="w-full bg-gray-700 h-2 rounded-full mt-3 overflow-hidden">
                                <div
                                    className={`h-full ${isRenewPeriod ? 'bg-red-500' : 'bg-green-500'}`}
                                    style={{ width: `${Math.max(0, Math.min(100, (daysRemaining / 365) * 100))}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                            <p className="text-gray-400 text-xs uppercase font-bold mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Status da Garantia (7 Dias)
                            </p>
                            {isEligibleForRefund ? (
                                <div className="flex items-center gap-2 text-green-400 font-bold">
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Dentro do Prazo (Dia {daysSincePurchase} de 7)</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Clock className="w-5 h-5" />
                                    <span>Prazo de garantia expirado</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col justify-center space-y-4 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                        {isRefundRequested ? (
                            <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2 animate-pulse" />
                                <h4 className="text-white font-bold">Solicitação em Análise</h4>
                                <p className="text-xs text-yellow-200 mt-1">Seu pedido de reembolso foi enviado e está sendo processado pela equipe.</p>
                            </div>
                        ) : isEligibleForRefund ? (
                            <>
                                <p className="text-sm text-gray-300 text-center mb-2">
                                    Você ainda está no período de garantia incondicional. Se não estiver satisfeito, pode solicitar o reembolso abaixo.
                                </p>
                                <Button
                                    onClick={onOpenRefund}
                                    className="w-full !bg-red-900/30 hover:!bg-red-900/50 text-red-200 border border-red-800"
                                >
                                    <ShieldCheck className="w-4 h-4 mr-2" /> Solicitar Reembolso
                                </Button>
                            </>
                        ) : isRenewPeriod ? (
                            <>
                                <div className="flex items-center gap-2 text-yellow-400 mb-2 justify-center">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="font-bold">Renovação Disponível</span>
                                </div>
                                <p className="text-sm text-gray-300 text-center mb-4">
                                    Garanta mais 12 meses de acesso com desconto exclusivo.
                                </p>
                                <Button
                                    onClick={onOpenRenewal}
                                    className="w-full !bg-green-600 hover:!bg-green-500 text-white shadow-lg shadow-green-900/20"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" /> RENOVAR AGORA
                                </Button>
                            </>
                        ) : (
                            <div className="text-center text-gray-500">
                                <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Sua assinatura está ativa e operante.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* MODAL DE COMPLIANCE */}
            <AnimatePresence>
                {isComplianceModalOpen && (
                    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[150] p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-800 w-full max-w-2xl rounded-3xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <ShieldCheck className="w-6 h-6 text-brand-primary" /> Dados de Recebimento & Compliance
                                </h3>
                                <button onClick={() => setIsComplianceModalOpen(false)} className="p-2 hover:bg-gray-700 rounded-full text-gray-400 transition-colors">
                                    <XIcon className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                                <Step0Compliance
                                    producerData={producerData}
                                    setProducerData={setProducerData}
                                    handleCepChange={handleCepChange}
                                    handleSaveProducer={handleSaveCompliance}
                                    isProcessing={isProcessing}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProfilePage;
