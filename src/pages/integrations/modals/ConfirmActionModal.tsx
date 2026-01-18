
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import { AlertTriangle } from '../../../components/Icons';

interface ConfirmActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    isDestructive?: boolean;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({ isOpen, onClose, onConfirm, title, description, confirmText = 'Confirmar', isDestructive = false }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[90] p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-800 w-full max-w-sm rounded-xl p-6 border border-gray-700 shadow-2xl text-center relative z-[100]"
            >
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className={`w-6 h-6 ${isDestructive ? 'text-red-500' : 'text-yellow-500'}`} />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm mb-6">{description}</p>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button 
                        onClick={() => { onConfirm(); onClose(); }} 
                        className={`flex-1 ${isDestructive ? '!bg-red-600 hover:!bg-red-500' : '!bg-green-600 hover:!bg-green-500'}`}
                    >
                        {confirmText}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
