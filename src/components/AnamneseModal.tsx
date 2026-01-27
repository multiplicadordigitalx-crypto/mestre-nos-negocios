
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import Input from './Input';
import { X as XIcon, HeartPulse, ShieldCheck, ActivityIcon, Brain } from './Icons';
import { Student, AnamneseData } from '../types';
import { updateStudent } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface AnamneseModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    courseNiche?: string; // Terapia, Fitness, etc.
}

export const AnamneseModal: React.FC<AnamneseModalProps> = ({ isOpen, onClose, student, courseNiche = 'Terapia' }) => {
    const { refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState<AnamneseData>({
        filled: false,
        weight: '',
        height: '',
        goals: [],
        restrictions: '',
        emergencyContact: '',
        medicalHistory: ''
    });

    if (!isOpen) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateStudent(student.uid, {
                anamnese: { ...formData, filled: true, updatedAt: new Date().toISOString() }
            });
            await refreshUser();
            toast.success("Perfil de saúde atualizado!");
            onClose();
        } catch (error) {
            toast.error("Erro ao salvar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-900 w-full max-w-lg rounded-2xl border border-pink-500/50 shadow-2xl p-0 overflow-hidden relative"
            >
                <div className="p-6 bg-gradient-to-r from-pink-900/40 to-gray-900 border-b border-pink-500/30">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <HeartPulse className="w-6 h-6 text-pink-500" /> Ficha de Anamnese
                        </h3>
                    </div>
                    <p className="text-sm text-pink-200/80">
                        Para personalizar sua jornada no curso de <strong>{courseNiche}</strong>, precisamos conhecer você melhor.
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {step === 1 && (
                        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                            <h4 className="text-white font-bold text-sm uppercase flex items-center gap-2 border-b border-gray-800 pb-2">
                                <ActivityIcon className="w-4 h-4 text-blue-400" /> Dados Biométricos & Físicos
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Peso Atual (kg)" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} placeholder="Ex: 70kg" />
                                <Input label="Altura (cm)" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} placeholder="Ex: 175cm" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Histórico Médico Relevante</label>
                                <textarea
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm focus:border-pink-500 outline-none h-20 resize-none"
                                    placeholder="Ex: Cirurgias, lesões, diabetes, hipertensão..."
                                    value={formData.medicalHistory}
                                    onChange={e => setFormData({ ...formData, medicalHistory: e.target.value })}
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                            <h4 className="text-white font-bold text-sm uppercase flex items-center gap-2 border-b border-gray-800 pb-2">
                                <Brain className="w-4 h-4 text-purple-400" /> Objetivos & Segurança
                            </h4>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Contato de Emergência</label>
                                <Input
                                    value={formData.emergencyContact}
                                    onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                                    placeholder="Nome e Telefone (Opcional)"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Restrições (Alimentares/Físicas)</label>
                                <textarea
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm focus:border-pink-500 outline-none h-20 resize-none"
                                    placeholder="Ex: Vegano, alergia a glúten, não posso correr..."
                                    value={formData.restrictions}
                                    onChange={e => setFormData({ ...formData, restrictions: e.target.value })}
                                />
                            </div>
                            <div className="bg-pink-900/20 border border-pink-500/20 p-3 rounded-lg text-xs text-pink-200 flex gap-2">
                                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>Seus dados são confidenciais e usados apenas para adaptar o conteúdo do curso e IA.</p>
                            </div>
                        </motion.div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-gray-800">
                        {step === 2 ? (
                            <>
                                <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Voltar</Button>
                                <Button onClick={handleSave} isLoading={loading} className="flex-[2] !bg-pink-600 hover:!bg-pink-500">CONCLUIR ANAMNESE</Button>
                            </>
                        ) : (
                            <Button onClick={() => setStep(2)} className="w-full !bg-pink-600 hover:!bg-pink-500">PRÓXIMO PASSO</Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
