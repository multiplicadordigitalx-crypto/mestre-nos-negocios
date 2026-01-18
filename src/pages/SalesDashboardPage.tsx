import React, { useState, useEffect } from 'react';
import { getAppProducts, updateSalesPerson } from '@/services/mockFirebase';
import { toast } from 'react-hot-toast';
import { SalesPerson, AppProduct } from '@/types';
import {
    Home, MessageSquare, DollarSign, User, LogOut, TrendingUp, Menu, Users,
    Wallet, Link as LinkIcon, ShieldCheck
} from '@/components/Icons';
import { AnimatePresence } from 'framer-motion';
import { CompletionWizard } from './sales/modals/CompletionWizard';

// Modular Views
import { PerformanceView } from './sales/views/PerformanceView';
import { FinancialView } from './sales/views/FinancialView';
import { LinksView } from './sales/views/LinksView';
import { ProfileView } from './sales/views/ProfileView';
import { LeadsManagementView } from './sales/views/LeadsManagementView';
import { SalesInternalChat } from './sales/components/SalesInternalChat';

export type ViewState = 'dashboard' | 'chat' | 'financial' | 'links' | 'profile' | 'internal_chat';

export interface SalesDashboardPageProps {
    salesPerson: SalesPerson;
    onLogout: () => void;
}
// --- LEGAL SHIELDING: TERMS MODAL ---
const TermsAcceptanceModal: React.FC<{ user: SalesPerson, onAccept: () => void }> = ({ user, onAccept }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Intro, 2: Camera, 3: Sign
    const [photo, setPhoto] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    const startCamera = () => setStep(2);

    const takePhoto = () => {
        // Simulate Camera Capture
        setPhoto("https://thispersondoesnotexist.com/image"); // Mock image
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            setStep(3);
            toast.success("Identidade Verificada com Sucesso!");
        }, 2000);
    };

    const handleConfirm = async () => {
        if (!accepted) return;
        setLoading(true);
        try {
            await updateSalesPerson(user.uid, {
                termsAcceptedAt: new Date().toISOString(),
                biometricProofUrl: 'mock-biometric-proof-url-secure-storage'
            });
            toast.success("Parceria Confirmada & Documentada! Bem-vindo(a).");
            onAccept();
        } catch (error) {
            toast.error("Erro ao salvar aceite.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl p-8 relative overflow-hidden flex flex-col items-center">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>

                {/* HEADER */}
                <div className="flex flex-col items-center mb-6 text-center">
                    <div className="p-4 bg-gray-800 rounded-full mb-4 border border-gray-700">
                        {step === 2 ? <div className="w-12 h-12 flex items-center justify-center animate-pulse"><div className="w-full h-full bg-red-500 rounded-full opacity-50"></div></div> : <ShieldCheck className="w-12 h-12 text-blue-500" />}
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                        {step === 1 && "Blindagem Jurídica & Parceria"}
                        {step === 2 && "Validação de Identidade (Liveness)"}
                        {step === 3 && "Assinatura Digital de Contrato"}
                    </h2>
                    <p className="text-gray-400 mt-2 text-sm max-w-md">
                        {step === 1 && "Para sua segurança jurídica e da plataforma, precisamos validar que você é você."}
                        {step === 2 && "Posicione seu rosto na moldura. Nossa IA detectará vivacidade para evitar fraudes."}
                        {step === 3 && "Sua identidade foi validada. Por favor, leia e aceite os termos finais."}
                    </p>
                </div>

                {/* CONTENT AREA */}
                <div className="w-full mb-6">
                    {step === 1 && (
                        <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-xl text-center space-y-4">
                            <h3 className="text-blue-200 font-bold uppercase text-sm tracking-widest">Protocolo de Segurança</h3>
                            <p className="text-gray-300 text-sm">Em conformidade com a Lei Geral de Proteção de Dados (LGPD) e Compliance Financeiro, o Mestre nos Negócios exige:</p>
                            <ul className="text-left text-sm text-gray-400 space-y-2 list-disc pl-8">
                                <li>Validação Biométrica (Foto em Tempo Real)</li>
                                <li>Aceite dos Termos de Autonomia (Non-CLT)</li>
                                <li>Registro de IP e Dispositivo</li>
                            </ul>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="relative w-full h-64 bg-black rounded-xl overflow-hidden border-2 border-gray-700 flex items-center justify-center">
                            {analyzing ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-blue-400 text-xs font-mono animate-pulse">ANALISANDO BIOMETRIA...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1597223506889-79a951b21910?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFjZSUyMGZlYXR1cmVzfGVufDB8fDB8fHww')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                                    <div className="w-40 h-40 border-2 border-dashed border-blue-500/50 rounded-full flex items-center justify-center relative z-10">
                                        <div className="text-gray-500 text-[10px] uppercase">Aguardando Rosto</div>
                                    </div>
                                    <div className="absolute bottom-4 z-20">
                                        <button onClick={takePhoto} className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div> Capturar Foto
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 max-h-48 overflow-y-auto custom-scrollbar text-sm text-gray-300 space-y-4">
                                <p><strong className="text-white">1. NATUREZA DA RELAÇÃO:</strong> Declaro que atuo como Parceiro Comercial Autônomo, não havendo vínculo empregatício, subordinação jurídica ou cumprimento de horário fixo com a plataforma Mestre nos Negócios.</p>
                                <p><strong className="text-white">2. REMUNERAÇÃO:</strong> Estou ciente de que meus ganhos são 100% variáveis (comissões), dependendo exclusivamente do êxito de minhas vendas realizadas através dos links de afiliado.</p>
                                <p><strong className="text-white">3. AUTONOMIA:</strong> Tenho total liberdade para definir minhas estratégias de divulgação, horários de atuação e ferramentas, respeitando as políticas de publicidade da marca.</p>
                            </div>

                            <div className="flex items-center gap-4 bg-green-900/20 p-3 rounded-lg border border-green-500/30">
                                <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-600 overflow-hidden shrink-0">
                                    <img src={photo!} alt="Biometria" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-green-400 text-xs font-bold uppercase flex items-center gap-1">✅ Biometria Validada</p>
                                    <p className="text-gray-500 text-[10px]">Token: BIO-{Date.now().toString().slice(-6)}</p>
                                </div>
                            </div>

                            <label className="flex items-start gap-3 p-4 bg-blue-900/10 border border-blue-500/20 rounded-lg cursor-pointer hover:bg-blue-900/20 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={accepted}
                                    onChange={e => setAccepted(e.target.checked)}
                                    className="mt-1 w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-900"
                                />
                                <div className="flex-1">
                                    <span className="text-white font-bold text-sm block">Li e Aceito os Termos de Parceria</span>
                                    <span className="text-xs text-blue-200">Confirmo juridicamente minha autonomia e autoria desta ação.</span>
                                </div>
                            </label>
                        </div>
                    )}
                </div>

                {/* FOOTER ACTIONS */}
                <div className="w-full">
                    {step === 1 && (
                        <button onClick={startCamera} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white uppercase tracking-widest transition-all">
                            Iniciar Validação Biométrica
                        </button>
                    )}
                    {step === 3 && (
                        <button
                            onClick={handleConfirm}
                            disabled={!accepted || loading}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${accepted ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/25 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        >
                            {loading ? 'Processando Contrato...' : 'Assinar e Acessar Painel'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const SalesDashboardPage: React.FC<SalesDashboardPageProps> = ({ salesPerson: initialSalesPerson, onLogout }) => {
    const [salesPerson, setSalesPerson] = useState<SalesPerson>(initialSalesPerson);
    const [view, setView] = useState<ViewState>('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [products, setProducts] = useState<AppProduct[]>([]);

    useEffect(() => {
        getAppProducts().then(setProducts);
    }, []);

    const isRegistrationIncomplete = !salesPerson.registrationCompleted;
    // Check if terms are accepted. If user is old and field is missing, we force acceptance.
    const hasAcceptedTerms = !!salesPerson.termsAcceptedAt;

    const handleWizardComplete = (data: Partial<SalesPerson>) => {
        setSalesPerson(prev => ({ ...prev, ...data, registrationCompleted: true }));
    };

    const NavButton = ({ id, icon, label, badge }: { id: ViewState, icon: React.ReactNode, label: string, badge?: number }) => (
        <button
            onClick={() => { setView(id); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-start px-4 py-3 rounded-xl transition-all relative group ${view === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-bold' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
        >
            <div className={`${view === id ? 'text-white' : 'text-gray-400 group-hover:text-blue-400'}`}>
                {icon}
            </div>
            <span className="ml-3 text-sm">{label}</span>
            {badge && <span className="absolute top-2 right-4 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900">{badge}</span>}
        </button>
    );

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200 font-sans overflow-hidden">
            {/* Legal Shielding Modal */}
            {!hasAcceptedTerms && (
                <TermsAcceptanceModal
                    user={salesPerson}
                    onAccept={() => setSalesPerson(p => ({ ...p, termsAcceptedAt: new Date().toISOString() }))}
                />
            )}

            {hasAcceptedTerms && isRegistrationIncomplete && (
                <CompletionWizard salesPerson={salesPerson} onComplete={handleWizardComplete} onLogout={onLogout} />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0c0d12] border-r border-gray-800 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="font-black text-white leading-tight uppercase text-sm tracking-tighter">Comercial 50X</h2>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Painel do Parceiro</p>
                    </div>
                </div>

                <div className="space-y-1 w-full px-3 py-6 flex-1 overflow-y-auto custom-scrollbar">
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] px-4 mb-3">Principal</p>
                    <NavButton id="dashboard" icon={<Home className="w-5 h-5" />} label="Performance" />
                    <NavButton id="chat" icon={<MessageSquare className="w-5 h-5" />} label="Leads WhatsApp" />

                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] px-4 mb-3 mt-6">Financeiro</p>
                    <NavButton id="financial" icon={<Wallet className="w-5 h-5" />} label="Extrato de Parceria" />
                    <NavButton id="links" icon={<LinkIcon className="w-5 h-5" />} label="Meus Links" />

                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] px-4 mb-3 mt-6">Equipe</p>
                    <NavButton id="internal_chat" icon={<Users className="w-5 h-5" />} label="Chat Interno" />

                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] px-4 mb-3 mt-6">Sua Conta</p>
                    <NavButton id="profile" icon={<User className="w-5 h-5" />} label="Perfil do Parceiro" />
                </div>

                {/* Legal Footer */}
                <div className="px-6 py-2">
                    <p className="text-[9px] text-gray-600 text-center leading-tight">
                        Plataforma de gestão para parceiros autônomos. Ganhos 100% variáveis por performance.
                    </p>
                </div>

                <div className="p-4 border-t border-gray-800 bg-black/20">
                    <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 p-3 text-red-400 hover:bg-red-900/10 hover:text-red-300 rounded-xl transition-colors font-black uppercase text-xs tracking-widest">
                        <LogOut className="w-4 h-4" /> Sair
                    </button>
                </div>
            </aside>

            {isMobileMenuOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <div className="md:hidden h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 z-20 shrink-0">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-blue-500" />
                        <span className="font-black text-white uppercase tracking-tighter text-sm">Comercial</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2 hover:bg-gray-700 rounded-lg"><Menu className="w-6 h-6" /></button>
                </div>

                <main className={`flex-1 overflow-hidden bg-gray-950 relative ${view === 'chat' ? 'p-0' : 'p-4 md:p-8'}`}>
                    <AnimatePresence mode="wait">
                        {view === 'dashboard' && <PerformanceView salesPerson={salesPerson} />}
                        {view === 'chat' && <LeadsManagementView user={salesPerson} />}
                        {view === 'financial' && <FinancialView />}
                        {view === 'links' && <LinksView products={products} salesPerson={salesPerson} />}
                        {view === 'internal_chat' && (
                            <div className="h-full flex flex-col">
                                <h2 className="text-2xl font-black text-white mb-4 px-2 uppercase tracking-tighter">Chat da Equipe</h2>
                                <div className="flex-1 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                                    <SalesInternalChat user={salesPerson} />
                                </div>
                            </div>
                        )}
                        {view === 'profile' && <ProfileView salesPerson={salesPerson} />}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default SalesDashboardPage;