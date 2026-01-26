
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { X as XIcon } from '../../../components/Icons';
import toast from 'react-hot-toast';

interface CreateInstanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string, role: string) => void;
}

export const CreateInstanceModal: React.FC<CreateInstanceModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('general');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!name.trim()) return toast.error("Nome obrigatório");
        onConfirm(name, role);
        setName('');
        setRole('general');
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
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>
                <Input
                    label="Nome de Identificação"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Comercial_01"
                    autoFocus
                />
                <div className="mt-4">
                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Finalidade (Role)</label>
                    <select
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white text-sm outline-none focus:border-green-500"
                        value={role}
                        onChange={e => setRole(e.target.value as any)}
                    >
                        <option value="general">📱 Geral (Padrão)</option>
                        <option value="sales_bot">🤖 Robô de Vendas (Alex)</option>
                        <option value="system_notifications">🔒 Sistema / Notificações</option>
                        <option value="support_human">🛡️ Suporte Humano</option>
                    </select>
                </div>
                <div className="flex gap-3 mt-6">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button onClick={handleSubmit} className="flex-1 !bg-green-600 hover:!bg-green-500">Criar Instância</Button>
                </div>
            </motion.div>
        </div>
    );
};
