
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Hooks & Types
import { useAuth } from '../../hooks/useAuth';
import { StudentPage, Student } from '../../types';
import { AlertTriangle, Eye, LockClosed, CheckCircle, HeartPulse } from '../../components/Icons';
import Button from '../../components/Button';
import { StudentHeader } from '../../components/StudentHeader';
import RenewalCheckoutModal from '../../components/RenewalCheckoutModal';
import { StudentSidebar } from '../../components/layout/StudentSidebar';
import { LoadingSpinner } from '../../components/LoadingSpinner';

// Lazy Load Sub-Pages
const MestreIAPage = React.lazy(() => import('../MestreIAPage'));
const MarketingPage = React.lazy(() => import('../MarketingPage'));
const IntegrationsPage = React.lazy(() => import('../IntegrationsPage'));
const FunnelsPage = React.lazy(() => import('../FunnelsPage'));
const EmailPage = React.lazy(() => import('../EmailPage'));
const CoachPage = React.lazy(() => import('../CoachPage'));
const ChatPage = React.lazy(() => import('../ChatPage'));
const CommunityPage = React.lazy(() => import('../community/CommunityPage'));
const ProfilePage = React.lazy(() => import('../ProfilePage'));
const SupportPage = React.lazy(() => import('../SupportPage'));
const FinancialPage = React.lazy(() => import('../FinancialPage'));
const NexusAdsPage = React.lazy(() => import('../NexusAdsPage'));
const HealthMindDiaryPage = React.lazy(() => import('../HealthMindDiaryPage'));
const KnowledgePracticePage = React.lazy(() => import('../KnowledgePracticePage'));
const StudentCourseCreatorView = React.lazy(() => import('./views/StudentCourseCreatorView'));
const RechargeView = React.lazy(() => import('./views/RechargeView'));
const StudentPlayerView = React.lazy(() => import('./views/StudentPlayerView').then(m => ({ default: m.StudentPlayerView })));

// Local Sections
import { InicioSection } from './sections/InicioSection';
import { TreinamentosSection } from './sections/TreinamentosSection';
import { ProdutosSection } from './sections/ProdutosSection';
import { MeusResultados } from './sections/MeusResultados';
import { WalletSection } from './sections/WalletSection';
import { NexusAdsSection } from './sections/NexusAdsSection';

interface PainelDoAlunoProps {
    activePage: StudentPage;
    navigateTo: (page: StudentPage) => void;
    onOpenRenewal?: () => void;
}

export const PainelDoAluno: React.FC<PainelDoAlunoProps> = ({ activePage, navigateTo, onOpenRenewal }) => {
    const { user, renewAccess, isImpersonating, stopImpersonation } = useAuth();
    const student = user as Student;

    // Internal state for renewal modal if not handled by parent (optional)
    const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);

    // Subscription Logic
    const subscriptionStatus = useMemo(() => {
        if (!user?.purchaseDate) return { daysRemaining: 365, isRenewPeriod: false, isExpired: false, isRefunded: false };

        const purchaseDate = new Date(user.purchaseDate);
        const now = new Date();
        const diffTime = now.getTime() - purchaseDate.getTime();
        const daysSincePurchase = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const validityDays = 365;
        const daysRemaining = validityDays - daysSincePurchase;
        const isExpired = daysRemaining < 0;
        const isRenewPeriod = daysRemaining <= 30 && !isExpired;
        const isRefunded = student?.financial?.status === 'refunded';

        return {
            daysRemaining,
            isExpired,
            isRenewPeriod,
            isRefunded,
            expirationDate: new Date(purchaseDate.getTime() + (365 * 24 * 60 * 60 * 1000))
        };
    }, [user, student]);

    const handleOpenRenewal = () => {
        if (onOpenRenewal) onOpenRenewal();
        else setIsRenewalModalOpen(true);
    };

    const goBack = () => {
        // Logic handled by parent history usually, but if needed here:
        // navigateTo('dashboard'); 
    };

    // State for Test Player
    const [isTestPlayerOpen, setIsTestPlayerOpen] = useState(false);

    // Blocked Screen (Expired/Refunded)
    if (subscriptionStatus.isExpired || subscriptionStatus.isRefunded) {
        // ... existing blocked logic ...
    }

    if (isTestPlayerOpen) {
        return <StudentPlayerView
            onBack={() => setIsTestPlayerOpen(false)}
            lesson={{
                id: 'demo-lesson',
                title: 'Aula Exemplo: Negócios Exponenciais',
                moduleId: 'demo-module',
                duration: 600,
                videoUrl: 'https://actions.google.com/sounds/v1/science_fiction/hum_in_a_spaceship.ogg',
                completed: false,
                locked: false
            } as any}
            course={{
                id: 'demo-course',
                title: 'Mestre dos Negócios 2.0',
                category: 'business_master', // or 'tech', 'marketing'
                description: 'Curso de demonstração',
                totalLessons: 10,
                completedLessons: 0,
                modules: [],
                aiConfig: { monthlyCreditAllowance: 50 },
                progress: 0
            } as any}
            onNavigate={(page) => {
                setIsTestPlayerOpen(false);
                navigateTo(page as StudentPage);
            }}
        />;
    }

    // Render Logic - Mapping Pages to Components
    const renderContent = () => {
        switch (activePage) {
            case 'dashboard': return (
                <>
                    <InicioSection navigateTo={navigateTo} />
                    {/* TEST PLAYER FLOATING BUTTON */}
                    <div className="fixed bottom-4 right-4 z-50">
                        <button
                            onClick={() => setIsTestPlayerOpen(true)}
                            className="bg-brand-primary text-black font-black uppercase text-xs px-4 py-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 border-2 border-white animate-bounce"
                        >
                            <span className="text-xl">🚀</span> Testar Nexus Player
                        </button>
                    </div>

                </>
            );
            case 'my_results': return <MeusResultados onBack={() => navigateTo('dashboard')} />;
            case 'training': return <TreinamentosSection navigateTo={navigateTo} />;
            case 'produtos': return <ProdutosSection navigateTo={navigateTo} />; // Note: Case might be 'products' or 'produtos', check existing
            case 'products': return <ProdutosSection navigateTo={navigateTo} />;
            case 'financial': return <FinancialPage navigateTo={navigateTo} />;
            case 'mestre_ia': return <MestreIAPage />;
            case 'coach': return <CoachPage />;
            case 'marketing': return <MarketingPage />;
            case 'nexus_ads': return <NexusAdsSection />;
            case 'integrations': return <IntegrationsPage />;
            case 'funnels': return <FunnelsPage />;
            case 'email_marketing': return <EmailPage />;
            case 'support': return <SupportPage />;
            case 'community': return <CommunityPage />;
            case 'profile': return <ProfilePage onOpenRefund={() => setShowRefundModal(true)} onOpenRenewal={handleOpenRenewal} />;
            case 'create_course': return <StudentCourseCreatorView navigateTo={navigateTo} />;
            case 'wallet': return <WalletSection navigateTo={navigateTo} />;
            case 'recharge': return <RechargeView />;
            case 'health_diary': return <HealthMindDiaryPage navigateTo={navigateTo} />;
            case 'diario_alimentar': return <HealthMindDiaryPage navigateTo={navigateTo} />;
            case 'knowledge_practice': return <KnowledgePracticePage navigateTo={navigateTo} />;
            case 'nexus_poliglota': return <KnowledgePracticePage initialLanguageMode={true} navigateTo={navigateTo} />;
            default: return <InicioSection navigateTo={navigateTo} />;
        }
    };

    // Blocked Screen (Expired/Refunded)
    if (subscriptionStatus.isExpired || subscriptionStatus.isRefunded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gray-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-gray-700 relative z-10"
                >
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LockClosed className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {subscriptionStatus.isRefunded ? "Acesso Revogado" : "Acesso Expirado"}
                    </h1>
                    <p className="text-gray-400 mb-6">
                        {subscriptionStatus.isRefunded
                            ? "Seu reembolso foi aprovado e o acesso à plataforma foi encerrado."
                            : <>Seu acesso Multiplicador Digital 15X expirou em <span className="text-white font-semibold">{subscriptionStatus.expirationDate.toLocaleDateString()}</span>.</>}
                    </p>

                    {!subscriptionStatus.isRefunded && (
                        <>
                            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 mb-8 text-left">
                                <p className="text-sm text-gray-300 mb-2 font-bold">Renove agora e receba:</p>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> +12 meses de acesso completo</li>
                                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Acesso a novos produtos</li>
                                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Suporte prioritário</li>
                                </ul>
                            </div>

                            <Button
                                className="w-full !py-4 text-lg !bg-green-600 hover:!bg-green-500 shadow-lg shadow-green-900/30 animate-pulse"
                                onClick={handleOpenRenewal}
                            >
                                RENOVAR POR R$97
                            </Button>
                        </>
                    )}
                    <p className="text-xs text-gray-500 mt-4">Dúvidas? suporte@mestredosnegocios.com</p>
                </motion.div>
                <RenewalCheckoutModal
                    isOpen={isRenewalModalOpen}
                    onClose={() => setIsRenewalModalOpen(false)}
                    onConfirm={renewAccess}
                    daysRemaining={subscriptionStatus.daysRemaining}
                    expirationDate={subscriptionStatus.expirationDate}
                />
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mt-6"
            >
                {/* Temporary FAB for Testing Niche Pages */}
                <div className="fixed bottom-24 right-8 z-[100] md:bottom-8 flex flex-col gap-3 items-end">
                    <button
                        onClick={() => navigateTo('knowledge_practice')}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase text-[10px] px-4 py-3 rounded-full shadow-2xl shadow-blue-600/40 hover:scale-110 active:scale-95 transition-all border-2 border-white/20"
                        title="Teste: Sabedoria & Prática"
                    >
                        <span className="text-xl">🦉</span>
                        <span className="hidden lg:block">Nova Area: Mentor Jurídico</span>
                    </button>

                    <button
                        onClick={() => navigateTo('nexus_poliglota')}
                        className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black uppercase text-[10px] px-4 py-3 rounded-full shadow-2xl shadow-cyan-500/40 hover:scale-110 active:scale-95 transition-all border-2 border-white/20"
                        title="Teste: Nexus Poliglota"
                    >
                        <span className="text-xl">🌍</span>
                        <span className="hidden lg:block">Nexus Poliglota</span>
                    </button>

                    <button
                        onClick={() => navigateTo('health_diary')}
                        className="flex items-center gap-2 bg-gradient-to-r from-brand-primary to-purple-600 text-black font-black uppercase text-[10px] px-4 py-3 rounded-full shadow-2xl shadow-brand-primary/40 hover:scale-110 active:scale-95 transition-all border-2 border-white/20"
                        title="Teste: Diário Health & Mind"
                    >
                        <HeartPulse className="w-4 h-4" />
                        <span className="hidden lg:block">Testar Diário (Saúde)</span>
                    </button>
                </div>

                <React.Suspense fallback={<div className="flex items-center justify-center p-12"><LoadingSpinner size="lg" /></div>}>
                    {renderContent()}
                </React.Suspense>
                <RenewalCheckoutModal
                    isOpen={isRenewalModalOpen}
                    onClose={() => setIsRenewalModalOpen(false)}
                    onConfirm={renewAccess}
                    daysRemaining={subscriptionStatus.daysRemaining}
                    expirationDate={subscriptionStatus.expirationDate}
                />
            </motion.div>
        </AnimatePresence>
    );
};
