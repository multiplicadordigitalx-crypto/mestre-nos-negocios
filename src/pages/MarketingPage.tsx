
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, BarChart3, Film, Camera, Robot, Phone } from '../components/Icons';
import { DashboardTab } from './marketing/tabs/DashboardTab';
import { ViralCreativesTab } from './marketing/tabs/ViralCreativesTab';
import { UGCAutomationTab } from './marketing/tabs/UGCAutomationTab';
import { BotAutomationTab } from './marketing/tabs/BotAutomationTab';
import { WhatsAppEvolutionTab } from './marketing/tabs/WhatsAppEvolutionTab';
import { NexusStudioTab } from './marketing/tabs/NexusStudioTab';
import { SharedAccount } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { MestreFullModal } from './funnels/modals/FunnelsModals';

type MarketingTab = 'dashboard' | 'ugc_automation' | 'bot_automation' | 'viral_creatives' | 'whatsapp' | 'nexus_studio';

const ALL_TABS: { id: MarketingTab; label: string; description: string; icon: any; color: string; bgColor: string }[] = [
    { id: 'dashboard', label: 'Dashboard', description: 'Visão em tempo real', icon: BarChart3, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { id: 'viral_creatives', label: 'Criativos Virais', description: 'Detectar & Clonar', icon: Film, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    { id: 'nexus_studio', label: 'Nexus Studio', description: 'Vídeos Longos & Reais', icon: Camera, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { id: 'ugc_automation', label: 'Máquina UGC', description: 'Fábrica de Vídeos', icon: Camera, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
    { id: 'bot_automation', label: 'Bot de Vendas', description: 'Monitoramento & Resposta', icon: Robot, color: 'text-green-400', bgColor: 'bg-green-500/10' },
    { id: 'whatsapp', label: 'WhatsApp Evo', description: 'Vendedor Implacável', icon: Phone, color: 'text-green-500', bgColor: 'bg-green-500/10' },
];

const MarketingPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<MarketingTab>('dashboard');
    const [isMestreFullMode, setIsMestreFullMode] = useState(false);
    const [showFullModeModal, setShowFullModeModal] = useState(false);
    const [ugcTransferData, setUgcTransferData] = useState<string | null>(null);

    const [sharedAccounts, setSharedAccounts] = useState<SharedAccount[]>([
        { id: 1, username: '@ana.nordeste', platform: 'TikTok', status: 'ONLINE', followers: '1.4M seg', responseTime: '6s', postingStatus: 'idle', product: 'Mestre 15X' },
        { id: 2, username: '@marcos.sp', platform: 'Instagram', status: 'ONLINE', followers: '890k seg', responseTime: '7s', postingStatus: 'idle', product: 'Mentoria Elite' },
    ]);

    const handleAddAccount = (acc: SharedAccount) => { setSharedAccounts(prev => [...prev, acc]); };
    const handleUpdateAccounts = (newAccounts: SharedAccount[]) => { setSharedAccounts(newAccounts); };
    const handleTransferToUGC = (script: string) => { setUgcTransferData(script); setActiveTab('ugc_automation'); };

    const handleRemoveAccount = (id: number) => { setSharedAccounts(prev => prev.filter(acc => acc.id !== id)); };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 md:p-8 animate-fade-in">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Megaphone className="w-8 h-8 text-brand-primary" />
                        Marketing 360º <span className="text-brand-primary">AI</span>
                    </h1>
                    <p className="text-gray-400 mt-2">Central de comando de marketing automatizado.</p>
                </div>

                <div className={`flex items-center gap-4 p-3 rounded-xl border shadow-inner ${isMestreFullMode ? 'bg-gray-800 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-black border-gray-800'}`}>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Modo Mestre Full</p>
                        <p className={`text-xs font-bold ${isMestreFullMode ? 'text-yellow-400 animate-pulse' : 'text-gray-500'}`}>
                            {isMestreFullMode ? 'LIGADO (AUTO)' : 'DESLIGADO'}
                        </p>
                    </div>
                    <button
                        onClick={() => !isMestreFullMode ? setShowFullModeModal(true) : setIsMestreFullMode(false)}
                        className={`w-14 h-8 rounded-full relative transition-all duration-300 ease-in-out shadow-inner border-2 ${isMestreFullMode ? 'bg-yellow-500 border-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-gray-800 border-gray-600'}`}
                    >
                        <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-md ${isMestreFullMode ? 'left-6' : 'left-0.5'}`}></div>
                    </button>
                </div>
            </div>

            <div className="flex overflow-x-auto gap-4 mb-8 pb-4 custom-scrollbar">
                {ALL_TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all whitespace-nowrap min-w-[200px] ${activeTab === tab.id ? `bg-gray-800 border-brand-primary` : 'bg-gray-800/50 border-gray-700'}`}>
                            <div className={`p-2 rounded-lg ${tab.bgColor}`}><Icon className={`w-5 h-5 ${tab.color}`} /></div>
                            <div className="text-left"><p className={`text-sm font-bold ${activeTab === tab.id ? 'text-white' : 'text-gray-300'}`}>{tab.label}</p></div>
                        </button>
                    )
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    {activeTab === 'dashboard' && <DashboardTab />}
                    {activeTab === 'viral_creatives' && <ViralCreativesTab onTransferToUGC={handleTransferToUGC} accounts={sharedAccounts} />}
                    {activeTab === 'ugc_automation' && <UGCAutomationTab initialScript={ugcTransferData} accounts={sharedAccounts} onAddAccount={handleAddAccount} onUpdateAccounts={handleUpdateAccounts} />}
                    {activeTab === 'bot_automation' && <BotAutomationTab accounts={sharedAccounts} onAddAccount={handleAddAccount} onRemoveAccount={handleRemoveAccount} />}
                    {activeTab === 'nexus_studio' && <NexusStudioTab />}
                    {activeTab === 'whatsapp' && <WhatsAppEvolutionTab />}
                </motion.div>
            </AnimatePresence>
            <MestreFullModal
                isOpen={showFullModeModal}
                onClose={() => setShowFullModeModal(false)}
                currentBalance={user?.creditBalance || 0}
                estimatedDailyCost={25}
                onConfirm={() => {
                    if ((user?.creditBalance || 0) < 10) {
                        toast.error("Saldo insuficiente para iniciar o Mestre Full. Recarregue seus créditos.", { icon: '🚫' });
                        return;
                    }
                    setIsMestreFullMode(true);
                    setShowFullModeModal(false);
                    toast.success("MODO MESTRE FULL ATIVADO! A MÁQUINA ESTÁ VIVA.", { icon: '⚡' });
                }}
            />
        </div >
    );
};

export default MarketingPage;
