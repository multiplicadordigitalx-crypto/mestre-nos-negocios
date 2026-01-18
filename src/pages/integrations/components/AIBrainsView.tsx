
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../components/Button';
import { Brain, Eye, EyeOff, PlusCircle, Trash, ShieldCheck, Camera, Film, Mic } from '../../../components/Icons';
import { getAdminIntegrations, saveAdminIntegration, deleteAdminIntegration } from '../../../services/mockFirebase';
import toast from 'react-hot-toast';

export const AIBrainsView: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
    const [aiConfigs, setAiConfigs] = useState<any[]>([]);
    const [showSecrets, setShowSecrets] = useState(false);

    useEffect(() => {
        if(isAdmin) {
            getAdminIntegrations('ai').then(setAiConfigs);
        }
    }, [isAdmin]);

    const handleAddAi = async () => {
        const newId = `custom-${Date.now()}`;
        const newItem = { id: newId, name: 'Google Gemini Pro', status: 'connected', key: 'AIza...', capabilities: ['text', 'vision'] };
        await saveAdminIntegration('ai', newItem);
        setAiConfigs(prev => [...prev, newItem]);
        toast.success("Nova IA Adicionada ao Sistema!");
    };

    const handleRemoveAi = async (id: string) => {
        if(confirm("Tem certeza que deseja remover esta IA?")) {
            await deleteAdminIntegration('ai', id);
            setAiConfigs(prev => prev.filter(ai => ai.id !== id));
            toast.success("IA removida.");
        }
    };

    const handleUpdateAi = (id: string, field: string, value: string) => {
        setAiConfigs(prev => {
            const updated = prev.map(ai => {
                if (ai.id === id) {
                    const newAi = { ...ai, [field]: value };
                    if (field === 'key') { newAi.status = value.trim().length > 5 ? 'connected' : 'missing'; }
                    saveAdminIntegration('ai', newAi);
                    return newAi;
                }
                return ai;
            });
            return updated;
        });
    };

    const handleToggleCapability = (id: string, capability: string) => {
        setAiConfigs(prev => {
            const updated = prev.map(ai => {
                if (ai.id === id) {
                    const capabilities = ai.capabilities.includes(capability) ? ai.capabilities.filter((c: string) => c !== capability) : [...ai.capabilities, capability];
                    const newAi = { ...ai, capabilities };
                    saveAdminIntegration('ai', newAi);
                    return newAi;
                }
                return ai;
            });
            return updated;
        });
    };

    const getAiStatus = (index: number, capability: string) => {
        const previousWithSame = aiConfigs.slice(0, index).filter(ai => ai.capabilities.includes(capability));
        if (previousWithSame.length === 0) return { label: 'Primário', color: 'text-green-400' };
        return { label: 'Backup Automático', color: 'text-yellow-400' };
    };

    if (!isAdmin) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center"><h3 className="text-lg font-bold text-white">Chaves de Inteligência Artificial</h3><div className="flex gap-2"><Button onClick={() => setShowSecrets(!showSecrets)} className="!py-1.5 !px-3 !text-xs !bg-gray-700 hover:text-white flex items-center gap-2">{showSecrets ? <EyeOff className="w-3 h-3"/> : <Eye className="w-3 h-3"/>}{showSecrets ? 'Ocultar Chaves' : 'Ver Chaves'}</Button><Button onClick={handleAddAi} className="!py-1.5 !px-3 !text-xs !bg-yellow-600 hover:text-yellow-500 text-black"><PlusCircle className="w-3 h-3 mr-1"/> Adicionar Nova IA</Button></div></div>
            <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30 flex gap-4 items-start"><ShieldCheck className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1"/><div><h4 className="text-blue-200 font-bold text-sm">Arquitetura de Alta Disponibilidade</h4><p className="text-gray-400 text-xs mt-1 leading-relaxed">O sistema opera em modo Cascata. Se uma IA falhar, o backup assume automaticamente.</p></div></div>
            <div className="space-y-4">
                <AnimatePresence>
                    {aiConfigs.map((ai, index) => (
                        <motion.div key={ai.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-col relative group">
                            <div className="flex flex-col md:flex-row items-center gap-4 w-full"><div className="p-3 bg-gray-800 rounded-lg border border-gray-600 flex gap-1">{ai.capabilities.includes('text') && <Brain className="w-4 h-4 text-brand-primary"/>}{ai.capabilities.includes('image') && <Camera className="w-4 h-4 text-pink-500"/>}{ai.capabilities.includes('video') && <Film className="w-4 h-4 text-green-500"/>}{ai.capabilities.includes('audio') && <Mic className="w-4 h-4 text-blue-500"/>}</div><div className="flex-1 w-full text-center md:text-left"><input className="bg-transparent font-bold text-white text-sm border-b border-gray-700 focus:border-brand-primary outline-none w-full mb-1" value={ai.name} onChange={(e) => handleUpdateAi(ai.id, 'name', e.target.value)} placeholder="Nome da IA" /><p className={`text-xs font-bold ${ai.status === 'connected' ? 'text-green-400' : 'text-red-400'}`}>{ai.status === 'connected' ? '● CONECTADO' : '● AUSENTE'}</p></div><div className="w-full md:w-1/3 relative"><input type={showSecrets ? "text" : "password"} className="w-full bg-black/30 border border-gray-600 rounded p-2 text-white text-sm font-mono focus:border-brand-primary outline-none transition-colors" placeholder="API Key..." value={ai.key} onChange={(e) => handleUpdateAi(ai.id, 'key', e.target.value)} /></div><button onClick={() => handleRemoveAi(ai.id)} className="text-gray-600 hover:text-red-400 p-2"><Trash className="w-4 h-4"/></button></div>
                            <div className="mt-4 pt-3 border-t border-gray-800 flex flex-wrap gap-2">{['text', 'image', 'video', 'audio'].map(cap => { const isActive = ai.capabilities.includes(cap); const status = getAiStatus(index, cap); return (<div key={cap} className="flex flex-col items-center"><button onClick={() => handleToggleCapability(ai.id, cap)} className={`px-3 py-1 rounded-full text-xs font-bold border transition-all capitalize ${isActive ? 'bg-gray-800 text-white border-brand-primary' : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600'}`}>{cap}</button>{isActive && <span className={`text-[8px] mt-1 font-bold ${status.color}`}>{status.label}</span>}</div>); })}</div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
