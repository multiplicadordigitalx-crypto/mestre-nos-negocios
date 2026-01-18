
import React, { useState, useEffect } from 'react';
import { X as XIcon, FileText, ClipboardCopy } from '../../../components/Icons';
import { SalesScript, Lead } from '../../../types';
import { getSalesScripts, getFormattedScript } from '../../../services/mockFirebase';
import toast from 'react-hot-toast';

interface SalesScriptsModalProps {
    onClose: () => void;
    onCopy: (text: string) => void;
    lead: Lead | null;
}

export const SalesScriptsModal: React.FC<SalesScriptsModalProps> = ({ onClose, onCopy, lead }) => {
    const [scripts, setScripts] = useState<SalesScript[]>([]);
    const [category, setCategory] = useState<string>('all');

    useEffect(() => {
        getSalesScripts().then(setScripts);
    }, []);

    const categories = [
        { id: 'all', label: 'Todos' },
        { id: 'greeting', label: 'Abordagem' },
        { id: 'objection', label: 'Objeções' },
        { id: 'closing', label: 'Fechamento' },
        { id: 'followup', label: 'Follow-up' },
        { id: 'social_proof', label: 'Prova Social' },
        { id: 'scarcity', label: 'Escassez' },
        { id: 'warranty', label: 'Garantia' },
        { id: 'referral', label: 'Indicação' },
        { id: 'recovery', label: 'Recuperação' },
        { id: 'post_sale', label: 'Pós-venda' },
    ];

    const filteredScripts = category === 'all' ? scripts : scripts.filter(s => s.category === category);

    const handleCopy = (content: string) => {
        const formatted = getFormattedScript(content, lead?.productInterest || '', lead?.name || 'Cliente');
        onCopy(formatted);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
            <div className="bg-gray-800 w-full max-w-lg rounded-xl border border-gray-700 shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-xl flex-shrink-0">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-yellow-400"/> Scripts de Vendas
                    </h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white"/></button>
                </div>
                
                <div className="bg-blue-900/20 p-2 border-b border-gray-700 text-center flex-shrink-0">
                    <p className="text-xs text-blue-300">
                        {lead ? `Valores adaptados para: ${lead.productInterest}` : 'Selecione um lead para ver os valores corretos.'}
                    </p>
                </div>
                
                <div className="flex-shrink-0 w-full p-4 border-b border-gray-700 flex gap-2 overflow-x-auto custom-scrollbar bg-gray-800 z-10 relative">
                    {categories.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${category === cat.id ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300 hover:text-white'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {filteredScripts.length === 0 && (
                        <p className="text-gray-500 text-center text-sm py-4">Nenhum script encontrado.</p>
                    )}
                    {filteredScripts.map(script => {
                        const previewText = getFormattedScript(script.content, lead?.productInterest || '', lead?.name || '[Nome]');
                        return (
                            <div 
                                key={script.id} 
                                onClick={() => handleCopy(script.content)}
                                className="bg-gray-700/50 border border-gray-600 hover:border-yellow-500 p-3 rounded-lg cursor-pointer transition-all group"
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-white text-sm">{script.title}</span>
                                    <ClipboardCopy className="w-4 h-4 text-gray-500 group-hover:text-yellow-400"/>
                                </div>
                                <p className="text-xs text-gray-400 whitespace-pre-wrap">{previewText}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};
