
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import {
    Link as LinkIcon, Smartphone, Brain, Server,
    Share2, Globe, Target, Mail as MailIcon, LockClosed, CreditCard
} from '../components/Icons';
import { useAuth } from '../hooks/useAuth';

// Import Component Views
import { WebhooksView } from './integrations/components/WebhooksView';
import { WhatsAppView } from './integrations/components/WhatsAppView';
import { SocialApisView } from './integrations/components/SocialApisView';
import { AIBrainsView } from './integrations/components/AIBrainsView';
import { TrafficView } from './integrations/components/TrafficView';
import { DomainsView } from './integrations/components/DomainsView';
import { SmtpView } from './integrations/components/SmtpView';
import { PaymentApisView } from './integrations/components/PaymentApisView';

// --- MAIN HUB INTEGRATIONS VIEW ---
const IntegrationsPage: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
    const [activeTab, setActiveTab] = useState<'webhooks' | 'whatsapp' | 'social' | 'ai' | 'traffic' | 'domains' | 'smtp' | 'payments'>('whatsapp');

    // Reset tab if user is not admin and tries to access restricted tabs
    useEffect(() => {
        if (!isAdmin && ['webhooks', 'social', 'ai', 'payments'].includes(activeTab)) {
            setActiveTab('whatsapp');
        }
    }, [isAdmin, activeTab]);

    return (
        <div className="pb-10 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <LinkIcon className="w-10 h-10 text-brand-primary" />
                    Hub de Integrações
                </h1>
                <p className="text-gray-400 mt-2">
                    {isAdmin
                        ? "Configure o sistema nervoso da sua plataforma: Pagamentos, APIs, Redes Sociais e Ferramentas."
                        : "Gerencie suas conexões de mensagens, tráfego e e-mail para automação."
                    }
                </p>
            </div>

            <Card className="bg-gray-800 border-gray-700 overflow-hidden flex flex-col min-h-[600px] shadow-2xl relative">
                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-700 bg-gray-900/50 overflow-x-auto custom-scrollbar">
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`flex-1 min-w-[140px] py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'payments' ? 'text-white border-b-2 border-green-500 bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                        >
                            <CreditCard className="w-4 h-4" /> Pagamentos
                        </button>
                    )}

                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('webhooks')}
                            className={`flex-1 min-w-[140px] py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'webhooks' ? 'text-white border-b-2 border-orange-500 bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                        >
                            <LinkIcon className="w-4 h-4" /> Webhooks
                        </button>
                    )}

                    <button
                        onClick={() => setActiveTab('whatsapp')}
                        className={`flex-1 min-w-[140px] py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'whatsapp' ? 'text-white border-b-2 border-green-500 bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                    >
                        <Smartphone className="w-4 h-4" /> WhatsApp
                    </button>

                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('social')}
                            className={`flex-1 min-w-[140px] py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'social' ? 'text-white border-b-2 border-pink-500 bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                        >
                            <Share2 className="w-4 h-4" /> Redes Sociais
                        </button>
                    )}

                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`flex-1 min-w-[140px] py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'ai' ? 'text-white border-b-2 border-yellow-500 bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                        >
                            <Brain className="w-4 h-4" /> Cérebro I.A.
                        </button>
                    )}

                    <button
                        onClick={() => setActiveTab('traffic')}
                        className={`flex-1 min-w-[140px] py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'traffic' ? 'text-white border-b-2 border-red-500 bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                    >
                        <Target className="w-4 h-4" /> Contas Ads
                    </button>
                    <button
                        onClick={() => setActiveTab('domains')}
                        className={`flex-1 min-w-[140px] py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'domains' ? 'text-white border-b-2 border-blue-500 bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                    >
                        <Globe className="w-4 h-4" /> Domínios
                    </button>
                    <button
                        onClick={() => setActiveTab('smtp')}
                        className={`flex-1 min-w-[140px] py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'smtp' ? 'text-white border-b-2 border-green-400 bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                    >
                        <Server className="w-4 h-4" /> SMTP
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6 flex-1 bg-gray-800">
                    {activeTab === 'payments' && isAdmin && <PaymentApisView />}
                    {activeTab === 'webhooks' && isAdmin && <WebhooksView isAdmin={isAdmin} />}
                    {activeTab === 'whatsapp' && <WhatsAppView isAdmin={isAdmin} />}
                    {activeTab === 'social' && isAdmin && <SocialApisView isAdmin={isAdmin} />}
                    {activeTab === 'ai' && isAdmin && <AIBrainsView isAdmin={isAdmin} />}
                    {activeTab === 'traffic' && <TrafficView />}
                    {activeTab === 'domains' && <DomainsView />}
                    {activeTab === 'smtp' && <SmtpView />}

                    {/* Fallback for restricted access attempt */}
                    {!isAdmin && (activeTab === 'webhooks' || activeTab === 'social' || activeTab === 'ai' || activeTab === 'payments') && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <LockClosed className="w-16 h-16 mb-4 opacity-20" />
                            <p>Acesso restrito a administradores.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default IntegrationsPage;
