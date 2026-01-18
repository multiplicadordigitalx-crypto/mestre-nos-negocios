
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { X as XIcon } from '../../../components/Icons';
import toast from 'react-hot-toast';

interface CreateInstanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string) => void;
}

export const CreateInstanceModal: React.FC<CreateInstanceModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [name, setName] = useState('');
    
    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!name.trim()) return toast.error("Nome obrigatório");
        onConfirm(name);
        setName('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[90] p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-800 w-full max-w-sm rounded-xl p-6 border border-gray-700 shadow-2xl relative z-[100]"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white text-lg">Nova Instância</h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white"/></button>
                </div>
                <Input 
                    label="Nome de Identificação" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Ex: Comercial_01" 
                    autoFocus
                />
                <div className="flex gap-3 mt-6">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button onClick={handleSubmit} className="flex-1 !bg-green-600 hover:!bg-green-500">Criar</Button>
                </div>
            </motion.div>
        </div>
    );
};
