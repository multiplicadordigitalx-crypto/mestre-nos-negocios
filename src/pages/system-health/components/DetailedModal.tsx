
import React from 'react';
import { motion } from 'framer-motion';
import { ActivityIcon, X as XIcon } from '../../../components/Icons';

interface DetailedModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const DetailedModal: React.FC<DetailedModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-800 w-full max-w-5xl rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ActivityIcon className="w-6 h-6 text-brand-primary" /> {title}
                    </h3>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-900/30">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};
