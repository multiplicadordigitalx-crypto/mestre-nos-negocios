
import React, { useState, useEffect } from 'react';
import { Influencer, ProducerBankData } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProducerData } from '../../services/userService';
import toast from 'react-hot-toast';

// Layout & Components
import { InfluencerSidebar, InfluencerTab } from './components/InfluencerSidebar';
import CampaignBanner from '../../components/CampaignBanner';

// Sections
import { VisaoGeralSection } from './sections/VisaoGeralSection';
import { MeusLinksSection } from './sections/MeusLinksSection';
import { NovosProdutosSection } from './sections/NovosProdutosSection';
import { FinancialSection } from './sections/FinancialSection';
import { MestreIASection } from './sections/MestreIASection';
import { VideosEducativosSection } from './sections/VideosEducativosSection';
import { SupportSection } from './sections/SupportSection';

// Modals
import { EditProfileModal } from './modals/EditProfileModal';
import { WithdrawalModal } from './modals/WithdrawalModal';
import { Step0Compliance, validateDoc } from '../../components/ProductWizardModal';

interface InfluencerDashboardPageProps {
    influencer: Influencer;
    onLogout: () => void;
}

const MandatoryComplianceModal: React.FC<{ user: any; onSuccess: () => void }> = ({ user, onSuccess }) => {
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
            // Sincroniza estado global do useAuth
            await onSuccess();
        } catch (error) { toast.error("Erro ao salvar."); } finally { setIsProcessing(false); }
    };

    return (
        <div className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-900 w-full max-w-2xl rounded-2xl border-2 border-red-500/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 bg-red-900/20 border-b border-red-500/30 text-center">
                    <h3 className="text-xl font-black text-white uppercase tracking-widest mb-1">⚠️ Pendência de Cadastro</h3>
                    <p className="text-sm text-red-200">Complete seu registro de Split Bancário para receber comissões.</p>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <Step0Compliance producerData={producerData} setProducerData={setProducerData} handleCepChange={handleCepChange} handleSaveProducer={handleSave} isProcessing={isProcessing} />
                </div>
            </motion.div>
        </div>
    );
};

const InfluencerDashboardPage: React.FC<InfluencerDashboardPageProps> = ({ influencer: initialInfluencer, onLogout }) => {
    const { user: authUser, refreshUser } = useAuth();

    // Sincronização de estado para garantir reatividade imediata
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

    // Lógica de trava: Verifica se produtorData existe E se está verificado
    const needsCompliance = !user.producerData || !user.producerData.isVerified;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return <VisaoGeralSection influencer={user} setActiveTab={setActiveTab} />;
            case 'links': return <MeusLinksSection influencer={user} setActiveTab={setActiveTab} />;
            case 'marketplace': return <NovosProdutosSection influencer={user} />;
            case 'financial': return <FinancialSection influencer={user} onWithdraw={() => setIsWithdrawModalOpen(true)} />;
            case 'mestre_ia_partner': return <MestreIASection user={user} credits={user.creditBalance || 0} setCredits={() => { }} />;
            case 'videos': return <VideosEducativosSection />;
            case 'support': return <SupportSection influencer={user} />;
            default: return <VisaoGeralSection influencer={user} setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-gray-200 font-sans overflow-hidden">
            {needsCompliance && <MandatoryComplianceModal user={user} onSuccess={refreshUser} />}

            <InfluencerSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={onLogout}
                onEditProfile={() => setIsEditProfileOpen(true)}
                influencerRole={user?.role}
            />

            <main className="flex-1 overflow-y-auto relative scroll-smooth bg-gray-900">
                <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
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
