
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useCreditGuard } from '../hooks/useCreditGuard';
import { callMestreIA } from '../services/mestreIaService';
import { addToTreasureChest, getSystemSettings, consumeCredits } from '../services/mockFirebase';
import GuidedForm from '../components/GuidedForm';
import { Brain, LockClosed, AlertTriangle, DollarSign, X as XIcon, Zap } from '../components/Icons';
import toast from 'react-hot-toast';

import { FLOWS_CONFIG, FLOW_QUESTIONS } from './mestre-ia/data/flows';
import ToolGrid from './mestre-ia/components/ToolGrid';
import TreasureChest from './mestre-ia/components/TreasureChest';
import ToolInfoModal from './mestre-ia/components/ToolInfoModal';
import LogoGenerator from './mestre-ia/components/generators/LogoGenerator';
import StandardGenerator from './mestre-ia/components/generators/StandardGenerator';
import { AICreditGate } from '../components/AICreditGate';
import { CreditBalanceWidget } from '../components/CreditBalanceWidget';
import { StudentPage } from '../types';

interface MestreIAPageProps {
  navigateTo?: (page: StudentPage) => void;
}

const MestreIAPage: React.FC<MestreIAPageProps> = ({ navigateTo }) => {
  const { user, refreshUser } = useAuth();
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isChestOpen, setIsChestOpen] = useState(false);
  const [infoModalFlowId, setInfoModalFlowId] = useState<string | null>(null);

  const { checkAndConsume } = useCreditGuard();

  // Verificação de Admin robusta

  // Verificação de Admin robusta
  const isAdmin = user?.role === 'super_admin' ||
    user?.role === 'admin' ||
    user?.role === 'influencer' || // Unblock for Partners
    user?.role === 'coproducer' || // Unblock for Partners
    user?.email?.endsWith('@mestredosnegocios.com');

  const hasAccess = user?.hasMestreIA || isAdmin;

  useEffect(() => {
    getSystemSettings().then(s => setIsMaintenance(!!s.mestreIAMaintenance));
  }, []);

  const handleFlowSelect = (id: string) => {
    setActiveFlowId(id);
    setResult(null);
    setInfoModalFlowId(null);
  };

  const triggerCostAction = async (toolId: string, cost: number, actionName: string) => {
    if (!user) return;
    await consumeCredits(user.uid, toolId, cost, actionName);
    toast.success(`Investimento de ${cost} créditos realizado.`);
  };



  const handleFlowComplete = async (answers: Record<string, string>) => {
    if (!activeFlowId) return;

    // Use centralized credit guard
    // Note: checkAndConsume handles the debit and toast.
    const proceed = await checkAndConsume(activeFlowId, `Mestre IA: ${activeFlowId}`);
    if (!proceed) return;

    setLoading(true);
    try {
      const response = await callMestreIA(activeFlowId, answers);
      setResult(response.output);
      const flowConfig = FLOWS_CONFIG.find(f => f.id === activeFlowId);
      await addToTreasureChest({ flowId: activeFlowId, flowName: flowConfig?.title || 'Conteúdo Gerado', content: response.output, previewUrl: response.previewImage });
      toast.success("Estratégia gerada e salva no Baú!");
    } catch (error) {
      toast.error("Erro ao gerar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (isMaintenance && !isAdmin) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-gray-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-500/20 animate-pulse"><LockClosed className="w-10 h-10 text-red-500" /></div>
            <h1 className="text-2xl font-black text-white mb-4">Sistema em Manutenção</h1>
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6"><p className="text-gray-300 text-sm leading-relaxed">Estamos atualizando os servidores de IA.</p></div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-gray-900 border border-gray-700 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-700"><LockClosed className="w-8 h-8 text-gray-500" /></div>
            <h1 className="text-2xl font-black text-white mb-2">Mestre IA Bloqueado</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">Desbloqueie o poder da IA para escalar seu negócio.</p>
            <button className="w-full bg-brand-primary text-black font-black text-lg py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-lg">DESBLOQUEAR AGORA</button>
          </div>
        </div>
      </div>
    );
  }

  if (activeFlowId) {
    const flowConfig = FLOWS_CONFIG.find(f => f.id === activeFlowId);
    if (!flowConfig) return null;
    const questions = FLOW_QUESTIONS[activeFlowId] || [{ id: 'context', label: 'Descreva o que você precisa:', type: 'textarea', required: true }];

    if (activeFlowId === 'gerador_logomarcas' && result) return <LogoGenerator result={result} onBack={() => setActiveFlowId(null)} user={user} onTriggerCost={(cost, action) => triggerCostAction('logo_download', cost, action)} />;
    if (result) return <StandardGenerator result={result} flowConfig={flowConfig} onBack={() => setActiveFlowId(null)} onRedo={() => setResult(null)} />;

    return <GuidedForm title={flowConfig.title} emoji={flowConfig.emoji} description={flowConfig.subtitle} videoUrl={activeFlowId === 'vendas_hoje' ? "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" : undefined} questions={questions} onComplete={handleFlowComplete} onBack={() => setActiveFlowId(null)} loading={loading} creditCost={5} />;
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in relative">
      {/* Credit Balance Widget - Mobile Priority */}
      <div className="flex justify-end mb-4">
        <CreditBalanceWidget onRecharge={() => navigateTo ? navigateTo('recharge') : null} />
      </div>
      <header className="text-center mb-12">
        <div className="flex justify-center mb-6"><div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-brand-primary/20 rotate-3 transform hover:rotate-6 transition-transform"><Brain className="w-10 h-10 text-black" /></div></div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">Mestre <span className="text-brand-primary">IA</span></h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">Selecione uma das {FLOWS_CONFIG.length} ferramentas otimizadas para escala 50X.</p>
      </header>
      <ToolGrid onSelect={handleFlowSelect} onInfo={setInfoModalFlowId} />
      <motion.button onClick={() => setIsChestOpen(true)} initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} className="fixed bottom-6 right-6 w-[70px] h-[70px] bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)] flex items-center justify-center z-50 cursor-pointer group border-4 border-yellow-200" title="Baú do Tesouro $"><DollarSign className="w-8 h-8 text-black" /></motion.button>
      <AnimatePresence>{isChestOpen && <TreasureChest isOpen={isChestOpen} onClose={() => setIsChestOpen(false)} onUseFlow={handleFlowSelect} />}</AnimatePresence>
      <ToolInfoModal flowId={infoModalFlowId} onClose={() => setInfoModalFlowId(null)} onGenerate={(id) => { setInfoModalFlowId(null); handleFlowSelect(id); }} />

    </div>
  );
};

export default MestreIAPage;
