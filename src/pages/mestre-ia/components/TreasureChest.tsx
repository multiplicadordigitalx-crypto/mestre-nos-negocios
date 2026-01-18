
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import { DollarSign, X as XIcon, Download, Save } from '../../../components/Icons';
import { getTreasureChest, createProduct } from '../../../services/mockFirebase';
import { TreasureItem } from '../../../types';
import toast from 'react-hot-toast';
import { FLOWS_CONFIG } from '../data/flows';
import { useAuth } from '../../../hooks/useAuth';

interface TreasureChestProps {
    isOpen: boolean;
    onClose: () => void;
    onUseFlow: (id: string) => void;
}

const TreasureChest: React.FC<TreasureChestProps> = ({ isOpen, onClose, onUseFlow }) => {
    const { user } = useAuth();
    const [items, setItems] = useState<TreasureItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            getTreasureChest().then(data => {
                setItems(data);
                setLoading(false);
            });
        }
    }, [isOpen]);

    const handleFinishMachine = () => {
        // Mock logic: pick the first available flow
        const nextFlowId = 'vendas_hoje'; 
        onUseFlow(nextFlowId);
        onClose();
    };

    const handleDownload = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success("Conteúdo copiado para a área de transferência!");
    };
    
    const handleSaveToDev = async (item: TreasureItem) => {
        if (!user) return;
        const toastId = toast.loading("Salvando em Desenvolvimento...");
        try {
            await createProduct({
                name: `${item.flowName} - ${new Date().toLocaleDateString()}`,
                description: item.content, 
                price: 0,
                commission: 0,
                platform: 'Hotmart',
                type: 'Único',
                status: 'active',
                ownerId: user.uid,
                stats: { totalSales: 0, activeStudents: 0, conversionRate: 0, revenue: 0, mestreCommission: 0 },
                integrations: [],
                affiliates: [],
                externalId: '',
                landingPage: '',
                baseAffiliateLink: ''
            });
            toast.success("Salvo em Meus Produtos!", { id: toastId });
        } catch (error) {
            toast.error("Erro ao salvar.", { id: toastId });
        }
    };

    const uniqueFlowsUsed = new Set(items.map(i => i.flowId)).size;
    const totalFlows = FLOWS_CONFIG.length;
    const progress = Math.round((uniqueFlowsUsed / totalFlows) * 100);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <motion.div 
                initial={{ x: '100%' }} 
                animate={{ x: 0 }} 
                exit={{ x: '100%' }}
                className="absolute top-0 right-0 h-full w-full md:w-[480px] bg-gray-900 border-l border-brand-primary/30 shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 bg-gradient-to-b from-yellow-900/40 to-gray-900 border-b border-gray-700 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><XIcon className="w-6 h-6"/></button>
                    
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg border border-yellow-200">
                            <DollarSign className="w-8 h-8 text-black" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wide">Baú do Tesouro $</h2>
                            <p className="text-[10px] text-yellow-400 font-bold uppercase">Acesso Garantido por 15 dias</p>
                        </div>
                    </div>
                    
                    <div className="mt-4 bg-black/40 rounded-lg p-3 border border-yellow-500/20">
                        <div className="flex justify-between text-xs text-gray-300 mb-1">
                            <span>Sua máquina de vendas</span>
                            <span className="text-brand-primary font-bold">{progress}% completa</span>
                        </div>
                        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-brand-primary h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 text-center">Você já usou {uniqueFlowsUsed} de {totalFlows} cards</p>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-900">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Carregando tesouros...</div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-10 flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 opacity-50">
                                <DollarSign className="w-8 h-8 text-gray-500"/>
                            </div>
                            <p className="text-gray-400 text-sm">Seu baú está vazio.</p>
                            <p className="text-xs text-gray-500 mt-1">Gere seu primeiro conteúdo agora!</p>
                        </div>
                    ) : (
                        items.map(item => {
                            const daysLeft = 15 - Math.floor((Date.now() - item.createdAt) / (1000 * 60 * 60 * 24));
                            const config = FLOWS_CONFIG.find(f => f.id === item.flowId);
                            const icon = (config as any)?.icon || config?.emoji || '📄';

                            return (
                                <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-brand-primary/50 transition-colors group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">{icon}</div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm line-clamp-1">{item.flowName}</h4>
                                                <p className="text-[10px] text-gray-500">{new Date(item.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${daysLeft <= 3 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                                            Expira em {daysLeft} dias
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => handleDownload(item.content)}
                                            className="w-full !py-2 !text-xs !bg-green-600 hover:!bg-green-500 flex items-center justify-center gap-2 rounded font-bold text-white"
                                        >
                                            <Download className="w-3 h-3"/> COPIAR
                                        </button>
                                        <button 
                                            onClick={() => handleSaveToDev(item)}
                                            className="w-full !py-2 !text-xs !bg-purple-600 hover:!bg-purple-500 flex items-center justify-center gap-2 rounded font-bold text-white"
                                        >
                                            <Save className="w-3 h-3"/> SALVAR
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-800 border-t border-gray-700 text-center relative z-10">
                    <p className="text-[10px] text-gray-500 mb-3">
                        Tudo fica salvo aqui por 15 dias. Depois some pra sempre.<br/>Quer guardar pra sempre? Baixe agora.
                    </p>
                    <Button 
                        onClick={handleFinishMachine}
                        className="w-full !bg-brand-primary hover:!bg-yellow-400 text-black font-black uppercase shadow-lg shadow-brand-primary/20"
                    >
                        Quero terminar minha máquina 100%
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default TreasureChest;
