
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { mockTeamUsers } from '../services/mockFirebase';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Lazy Load Pages (Auth & Standalone)
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const AdminLoginPage = React.lazy(() => import('../pages/AdminLoginPage'));
const InfluencerLoginPage = React.lazy(() => import('../pages/InfluencerLoginPage'));
const InfluencerDashboardPage = React.lazy(() => import('../pages/InfluencerDashboardPage'));
const SalesLoginPage = React.lazy(() => import('../pages/SalesLoginPage'));
const SalesDashboardPage = React.lazy(() => import('../pages/SalesDashboardPage'));
const FinanceDashboardPage = React.lazy(() => import('../pages/FinanceDashboardPage'));
const SupportAgentDashboardPage = React.lazy(() => import('../pages/SupportAgentDashboardPage'));
const ForgotPasswordPage = React.lazy(() => import('../pages/ForgotPasswordPage'));
const AffiliateInvitePage = React.lazy(() => import('../pages/AffiliateInvitePage'));
const BonusSchoolsPreview = React.lazy(() => import('../pages/BonusSchoolsPreview').then(m => ({ default: m.BonusSchoolsPreview })));
const StripeConnectCallback = React.lazy(() => import('../pages/StripeConnectCallback').then(m => ({ default: m.StripeConnectCallback })));

// Lazy Load Layouts
const StudentLayout = React.lazy(() => import('../layouts/StudentLayout').then(m => ({ default: m.StudentLayout })));
const AdminLayout = React.lazy(() => import('../layouts/AdminLayout').then(m => ({ default: m.AdminLayout })));
const ProducerDashboardLayout = React.lazy(() => import('../layouts/ProducerDashboardLayout').then(m => ({ default: m.ProducerDashboardLayout })));

// Import Types
import { Influencer, SalesPerson, SupportAgent } from '../types';

const ADMIN_EMAIL = 'mestrodonegocio01@gmail.com';

export function AppRoutes() {
    const location = useLocation();
    const [isLoggingInAsAdmin, setIsLoggingInAsAdmin] = useState(true);
    const { user, signOut, isImpersonating, loading, loginStandalone } = useAuth();

    // Routing States for Pre-Auth Flows
    const [viewMode, setViewMode] = useState<'student' | 'admin' | 'influencer' | 'sales' | 'support_agent' | 'affiliate_invite'>('student');
    const [isInfluencerLoginOpen, setIsInfluencerLoginOpen] = useState(false);
    const [isSalesLoginOpen, setIsSalesLoginOpen] = useState(false);
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

    // Standalone User States
    const [influencerUser, setInfluencerUser] = useState<Influencer | null>(null);
    const [salesUser, setSalesUser] = useState<SalesPerson | null>(null);
    const [supportUser, setSupportUser] = useState<SupportAgent | null>(null);

    // Check for Invite URL on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('invite') === 'true') {
            setViewMode('affiliate_invite');
        }
    }, []);

    // --- Handlers for Standalone Logins ---
    const handleInfluencerLogin = (inf: Influencer) => {
        loginStandalone(inf);
        setInfluencerUser(inf);
        setIsInfluencerLoginOpen(false);
        setViewMode('influencer');
    }

    const handleSalesLogin = (sp: SalesPerson) => {
        loginStandalone(sp);
        setSalesUser(sp);
        setIsSalesLoginOpen(false);
        setViewMode('sales');
    }

    const handleSupportLogin = (agent: SupportAgent) => {
        loginStandalone(agent);
        setSupportUser(agent);
        setIsLoggingInAsAdmin(false);
        setViewMode('support_agent');
    }

    const handleGenericLogout = () => {
        setInfluencerUser(null);
        setSalesUser(null);
        setSupportUser(null);
        setViewMode('student');
        if (user) signOut();
    }

    // --- PRE-AUTH & SPECIALIZED ROUTES ---

    return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
            {(() => {
                if (location.pathname === '/bonus-schools-preview') {
                    return <BonusSchoolsPreview />;
                }

                if (location.pathname === '/connect/callback') {
                    return <StripeConnectCallback />;
                }

                if (viewMode === 'affiliate_invite') {
                    return <AffiliateInvitePage onSuccess={() => {
                        window.history.pushState({}, '', '/');
                        setIsInfluencerLoginOpen(true);
                        setViewMode('student');
                        toast("Cadastro realizado! Faça login para continuar.", { icon: '👏' });
                    }} />;
                }

                if (viewMode === 'influencer' && influencerUser) {
                    return <InfluencerDashboardPage influencer={influencerUser} onLogout={handleGenericLogout} />;
                }

                if (viewMode === 'sales' && salesUser) {
                    return <SalesDashboardPage salesPerson={salesUser} onLogout={handleGenericLogout} />;
                }

                if (viewMode === 'support_agent' && supportUser && !isImpersonating) {
                    return <SupportAgentDashboardPage agent={supportUser} onLogout={handleGenericLogout} />;
                }

                // Login Modals
                if (isInfluencerLoginOpen) return <InfluencerLoginPage onLoginSuccess={handleInfluencerLogin} onBack={() => setIsInfluencerLoginOpen(false)} />;
                if (isSalesLoginOpen) return <SalesLoginPage onLoginSuccess={handleSalesLogin} onBack={() => setIsSalesLoginOpen(false)} />;
                if (isForgotPasswordOpen) return <ForgotPasswordPage onBack={() => setIsForgotPasswordOpen(false)} />;

                // Wait for initial auth check
                if (loading) {
                    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
                }

                // Main Authentication Check
                if (!user) {
                    if (isLoggingInAsAdmin) {
                        return <AdminLoginPage
                            onSwitchToStudent={() => setIsLoggingInAsAdmin(false)}
                            onSupportLoginSuccess={handleSupportLogin}
                            onForgotPassword={() => setIsForgotPasswordOpen(true)}
                        />;
                    }
                    return <LoginPage
                        onSwitchToAdmin={() => setIsLoggingInAsAdmin(true)}
                        onSwitchToInfluencer={() => setIsInfluencerLoginOpen(true)}
                        onSwitchToSales={() => setIsSalesLoginOpen(true)}
                        onForgotPassword={() => setIsForgotPasswordOpen(true)}
                    />;
                }

                // --- AUTHENTICATED ROUTING (MAIN APP) ---

                if ((user.role === 'support' || user.role === 'support_agent') && !isImpersonating) {
                    return <SupportAgentDashboardPage agent={user as unknown as SupportAgent} onLogout={signOut} />;
                }

                if ((user.role === 'sales_agent' || user.role === 'sales_manager') && !isImpersonating) {
                    return <SalesDashboardPage salesPerson={user as unknown as SalesPerson} onLogout={signOut} />;
                }

                if (user.role === 'finance' && !isImpersonating) {
                    return <FinanceDashboardPage />;
                }

                const isAdminUser = (
                    user.email === ADMIN_EMAIL ||
                    user.email?.endsWith('@mestredosnegocios.com') ||
                    user.email === 'ana@mestredosnegocios.com' ||
                    mockTeamUsers.some(u => u.email === user.email)
                );

                // Check for Producer Route
                const isProducerRoute = window.location.pathname.startsWith('/producer');
                if (isProducerRoute && !isImpersonating) {
                    return <ProducerDashboardLayout />;
                }

                if (isAdminUser && !isImpersonating) {
                    return <AdminLayout />;
                }

                return <StudentLayout />;
            })()}
        </React.Suspense>
    );
}
