
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../components/Button';
import { X as XIcon } from '../../../components/Icons';
import { FLOWS_CONFIG } from '../data/flows';

interface ToolInfoModalProps {
    flowId: string | null;
    onClose: () => void;
    onGenerate: (id: string) => void;
}

const ToolInfoModal: React.FC<ToolInfoModalProps> = ({ flowId, onClose, onGenerate }) => {
    if (!flowId) return null;
    const flow = FLOWS_CONFIG.find(f => f.id === flowId);
    if (!flow) return null;

    return (
        <AnimatePresence>
             <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gray-900 w-full max-w-[480px] rounded-2xl border border-gray-700 shadow-2xl relative overflow-hidden"
                >
                    <div className="p-6 md:p-8">
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <XIcon className="w-6 h-6" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-white mb-2 leading-tight">
                                {flow.title}
                            </h2>
                            <div className="text-gray-300 text-lg md:text-xl leading-relaxed whitespace-pre-wrap">
                                <span className="text-brand-primary font-bold mr-1">→</span>
                                {flow.modalText}
                            </div>
                        </div>

                        <Button 
                            onClick={() => onGenerate(flow.id)}
                            className="w-full !bg-green-600 hover:!bg-green-500 text-white font-black uppercase !py-3 text-sm rounded-xl shadow-lg shadow-green-900/30"
                        >
                            GERAR AGORA
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ToolInfoModal;
