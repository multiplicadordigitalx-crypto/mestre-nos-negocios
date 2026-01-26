import React, { useState, useEffect } from 'react';
import { Influencer, ProducerBankData } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { updateInfluencer } from '@/services/mockFirebase';
import { updateUserProducerData } from '@/services/userService';
import toast from 'react-hot-toast';

// Layout & Components
import { InfluencerSidebar, InfluencerTab } from './influencer/components/InfluencerSidebar';
import CampaignBanner from '@/components/CampaignBanner';
import { ChevronDown } from '@/components/Icons';
import { PartnerHeader } from '@/components/PartnerHeader';

// Sections
import { VisaoGeralSection } from './influencer/sections/VisaoGeralSection';
import { MeusLinksSection } from './influencer/sections/MeusLinksSection';
import { NovosProdutosSection } from './influencer/sections/NovosProdutosSection';
import { FinancialSection } from './influencer/sections/FinancialSection';
import { MestreIASection } from './influencer/sections/MestreIASection';
import { VideosEducativosSection } from './influencer/sections/VideosEducativosSection';
import { SupportSection } from './influencer/sections/SupportSection';
import { RechargeSection } from './painel/sections/RechargeSection';

// Modals
import { EditProfileModal } from './influencer/modals/EditProfileModal';
import { WithdrawalModal } from './influencer/modals/WithdrawalModal';
import { Step0Compliance, validateDoc } from '@/components/ProductWizardModal';

interface InfluencerDashboardPageProps {
    influencer: Influencer;
    onLogout: () => void;
}

// Modal unificado de Compliance
const MandatoryComplianceModal: React.FC<{ user: any; onSuccess: () => void; onForceUpdate: () => void }> = ({ user, onSuccess, onForceUpdate }) => {

    const isFirstAccess = !user.password || user.password === '123456';

    const [producerData, setProducerData] = useState<ProducerBankData>({
        fullName: user?.displayName || '',
        cpfCnpj: user?.cpf || '',
        email: user?.email || '',
        phone: user?.phone || '',
        birthDate: '',
        bank: '', agency: '', account: '', pixKey: '',
        address: { zipCode: '', street: '', number: '', district: '', city: '', state: '', complement: '' },
        isVerified: false
    });
    const [isProcessing, setIsProcessing] = useState(false);

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

    const handleSave = async () => {
        if (!validateDoc(producerData.cpfCnpj)) return toast.error("CPF/CNPJ inválido.");
        if (!producerData.pixKey || !producerData.bank) return toast.error("Dados bancários incompletos.");

        setIsProcessing(true);
        try {
            await updateUserProducerData(user.uid, { ...producerData, isVerified: true });
            toast.success("Cadastro validado!");
            await onSuccess();
            onForceUpdate();
        } catch (error) { toast.error("Erro ao salvar."); } finally { setIsProcessing(false); }
    };

    const handlePasswordChange = async (newPass: string) => {
        if (newPass) {
            await updateInfluencer(user.uid, { password: newPass });
        }
    };

    return (
        <div className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-900 w-full max-w-2xl rounded-2xl border-2 border-red-500/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 bg-red-900/20 border-b border-red-500/30 text-center">
                    <h3 className="text-xl font-black text-white uppercase tracking-widest mb-1">⚠️ Pendência de Cadastro</h3>
                    <p className="text-sm text-red-200">
                        {isFirstAccess ? "Defina sua senha e complete" : "Complete"} seu registro de Split Bancário para receber comissões.
                    </p>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <Step0Compliance
                        producerData={producerData}
                        setProducerData={setProducerData}
                        handleCepChange={handleCepChange}
                        handleSaveProducer={handleSave}
                        isProcessing={isProcessing}
                        showSecurity={isFirstAccess}
                        onPasswordChange={handlePasswordChange}
                    />
                </div>
            </motion.div>
        </div>
    );
};

const InfluencerDashboardPage: React.FC<InfluencerDashboardPageProps> = ({ influencer: initialInfluencer, onLogout }) => {
    const { user: authUser, refreshUser } = useAuth();

    const [userState, setUserState] = useState<Influencer>(initialInfluencer);

    useEffect(() => {
        if (authUser && authUser.uid === userState.uid) {
            setUserState(authUser as unknown as Influencer);
        }
    }, [authUser]);

    const user = userState;
    const [activeTab, setActiveTab] = useState<InfluencerTab>('overview');
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const needsCompliance = !user.producerData || !user.producerData.isVerified;

    const handleLocalComplianceUpdate = () => {
        setUserState(prev => ({
            ...prev,
            producerData: {
                ...prev.producerData!,
                isVerified: true
            }
        }));
    };

    const getPartnerRoleLabel = () => {
        if (user.role === 'coproducer') return "Parceiro Co-Produtor";
        if (user.role === 'affiliate') return "Afiliado 50X";
        return "Parceiro Influencer";
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return <VisaoGeralSection influencer={user} setActiveTab={setActiveTab} />;
            case 'links': return <MeusLinksSection influencer={user} setActiveTab={setActiveTab} />;
            case 'marketplace': return <NovosProdutosSection influencer={user} />;
            case 'financial': return <FinancialSection influencer={user} onWithdraw={() => setIsWithdrawModalOpen(true)} />;
            case 'mestre_ia_partner': return <MestreIASection user={user} credits={user.creditBalance || 0} setCredits={() => { }} />;
            case 'videos': return <VideosEducativosSection />;
            case 'support': return <SupportSection influencer={user} />;
            case 'recharge': return <RechargeSection navigateTo={(page: any) => toast('Navegação: ' + page, { icon: 'ℹ️' })} />;
            default: return <VisaoGeralSection influencer={user} setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200 font-sans overflow-hidden">
            {needsCompliance && (
                <MandatoryComplianceModal
                    user={user}
                    onSuccess={refreshUser}
                    onForceUpdate={handleLocalComplianceUpdate}
                />
            )}

            <InfluencerSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={onLogout}
                onEditProfile={() => setIsEditProfileOpen(true)}
                influencerRole={user?.role}
            />

            <main className="flex-1 overflow-y-auto relative scroll-smooth bg-gray-900">
                {/* Header Completo para Parceiros - Responsivo */}
                <PartnerHeader
                    canGoBack={false}
                    onNavigateToFinancial={() => setActiveTab('financial')}
                    onNavigateToSupport={() => setActiveTab('support')}
                    onNavigateToProfile={() => setIsEditProfileOpen(true)}
                    onRecharge={() => setActiveTab('recharge')}
                />

                <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
                    <div className="hidden md:block mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700 font-bold uppercase tracking-widest">
                                {getPartnerRoleLabel()}
                            </span>
                        </div>
                    </div>

                    {user && <CampaignBanner user={user} />}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderTabContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                influencer={user}
            />

            <WithdrawalModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                availableBalance={user?.availableBalance || 0}
                influencerName={user?.displayName || ''}
                influencer={user}
            />
        </div>
    );
};

export default InfluencerDashboardPage;