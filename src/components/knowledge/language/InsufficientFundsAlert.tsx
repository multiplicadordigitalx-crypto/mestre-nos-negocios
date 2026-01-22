import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from '../../Icons';
import Button from '../../Button';

interface InsufficientFundsAlertProps {
    isOpen: boolean;
    onClose: () => void;
    onRecharge: () => void;
    title?: string;
    description?: string;
}

export const InsufficientFundsAlert: React.FC<InsufficientFundsAlertProps> = ({
    isOpen,
    onClose,
    onRecharge,
    title = "Saldo Insuficiente",
    description = "Você não possui créditos suficientes para iniciar esta atividade. Deseja recarregar seu saldo agora?"
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[70] p-4 backdrop-blur-md">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-gray-900 border border-red-500/50 w-full max-w-md rounded-2xl shadow-2xl p-8 text-center"
                    >
                        <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            {description}
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={onRecharge}
                                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold w-full py-4 text-lg"
                            >
                                Recarregar Agora
                            </Button>
                            <Button
                                onClick={onClose}
                                className="bg-transparent border border-gray-700 hover:bg-gray-800 text-gray-400 w-full py-3"
                            >
                                Fechar
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
