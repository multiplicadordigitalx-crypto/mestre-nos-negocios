
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ClipboardCopy } from '../../../../components/Icons';
import toast from 'react-hot-toast';

interface StandardGeneratorProps {
    result: string;
    flowConfig: any;
    onBack: () => void;
    onRedo: () => void;
}

const StandardGenerator: React.FC<StandardGeneratorProps> = ({ result, flowConfig, onBack, onRedo }) => {
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        toast.success("Copiado!", { icon: '📋' });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto py-8">
            <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2">← Voltar ao Menu</button>
            
            <div className="bg-gray-900 border border-green-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-2xl">
                        {(flowConfig as any).icon ? (flowConfig as any).icon : flowConfig.emoji}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Resultado Gerado</h2>
                        <p className="text-green-400 text-sm">Pronto para usar!</p>
                    </div>
                </div>

                <div className="bg-black/50 rounded-xl p-6 border border-gray-700 font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {result}
                </div>

                <div className="mt-8 flex gap-4">
                    <button onClick={copyToClipboard} className="flex-1 bg-brand-primary text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition flex items-center justify-center gap-2">
                        <ClipboardCopy className="w-5 h-5"/> Copiar Tudo
                    </button>
                    <button onClick={onRedo} className="flex-1 bg-gray-800 text-white font-bold py-4 rounded-xl hover:bg-gray-700 transition border border-gray-600">
                        Refazer
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default StandardGenerator;
