
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, DollarSign, Zap } from '../../../components/Icons';
import ToolGrid from '../../mestre-ia/components/ToolGrid';
import ToolInfoModal from '../../mestre-ia/components/ToolInfoModal';
import TreasureChest from '../../mestre-ia/components/TreasureChest';
import { callMestreIA } from '../../../services/mestreIaService';
import { FLOWS_CONFIG, FLOW_QUESTIONS } from '../../mestre-ia/data/flows';
import { addToTreasureChest } from '../../../services/mockFirebase';
import GuidedForm from '../../../components/GuidedForm';
import LogoGenerator from '../../mestre-ia/components/generators/LogoGenerator';
import StandardGenerator from '../../mestre-ia/components/generators/StandardGenerator';
import toast from 'react-hot-toast';

export const MestreIASection: React.FC<{ user: any; credits: number; setCredits: (v: any) => void }> = ({ user, credits }) => {
    const [selectedTool, setSelectedTool] = useState<string | null>(null);
    const [infoModalFlowId, setInfoModalFlowId] = useState<string | null>(null);
    const [isChestOpen, setIsChestOpen] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFlowSelect = (id: string) => {
        setSelectedTool(id);
        setResult(null);
        setInfoModalFlowId(null);
    };

    const handleFlowComplete = async (answers: Record<string, string>) => {
        if (!selectedTool) return;
        setLoading(true);
        try {
            const response = await callMestreIA(selectedTool, answers);
            setResult(response.output);
            const flowConfig = FLOWS_CONFIG.find(f => f.id === selectedTool);
            await addToTreasureChest({ flowId: selectedTool, flowName: flowConfig?.title || 'Parceiro IA', content: response.output, previewUrl: response.previewImage });
            toast.success("Conteúdo gerado e salvo no Baú!");
        } catch (error) { toast.error("Erro na geração."); } finally { setLoading(false); }
    };

    if (selectedTool) {
        const flowConfig = FLOWS_CONFIG.find(f => f.id === selectedTool);
        if (!flowConfig) return null;
        const questions = FLOW_QUESTIONS[selectedTool] || [{ id: 'context', label: 'Detalhes da solicitação:', type: 'textarea', required: true }];
        if (selectedTool === 'gerador_logomarcas' && result) return <LogoGenerator result={result} onBack={() => setSelectedTool(null)} user={user} onTriggerCost={() => { }} />;
        if (result) return <StandardGenerator result={result} flowConfig={flowConfig} onBack={() => setSelectedTool(null)} onRedo={() => setResult(null)} />;
        return <GuidedForm title={flowConfig.title} emoji={flowConfig.emoji} description={flowConfig.subtitle} questions={questions} onComplete={handleFlowComplete} onBack={() => setSelectedTool(null)} loading={loading} creditCost={5} />;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center pb-8 border-b border-gray-800">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4"><Brain className="w-8 h-8 text-black" /></div>
                <h2 className="text-3xl font-black text-white">Mestre <span className="text-brand-primary">IA</span> para Parceiros</h2>
                <p className="text-gray-400 mt-2">Crie scripts, artes e estratégias virais em segundos.</p>
            </div>
            <ToolGrid onSelect={handleFlowSelect} onInfo={setInfoModalFlowId} />
            <motion.button onClick={() => setIsChestOpen(true)} whileHover={{ scale: 1.1 }} className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg flex items-center justify-center z-50 border-2 border-yellow-200"><DollarSign className="w-8 h-8 text-black" /></motion.button>
            <AnimatePresence>{isChestOpen && <TreasureChest isOpen={isChestOpen} onClose={() => setIsChestOpen(false)} onUseFlow={handleFlowSelect} />}</AnimatePresence>
            <ToolInfoModal flowId={infoModalFlowId} onClose={() => setInfoModalFlowId(null)} onGenerate={handleFlowSelect} />
        </div>
    );
};
