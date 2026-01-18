
import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../../components/Card';
import { ShoppingBag, ClipboardCopy, CheckCircle, Users, Link as LinkIcon } from '../../../components/Icons';
import { Influencer } from '../../../types';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

export const MeusLinksSection: React.FC<{ influencer: Influencer; setActiveTab: (tab: any) => void }> = ({ influencer, setActiveTab }) => {
    if (!influencer) return <div className="p-10 text-center"><LoadingSpinner /></div>;

    const myProducts = Array.isArray(influencer?.products) ? influencer.products : [];

    const handleCopy = (text: string) => {
        if (!text) return toast.error("Link indisponível");
        navigator.clipboard.writeText(text);
        toast.success("Copiado!");
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Meus Ativos de Venda</h2>
            </div>

            {myProducts.length === 0 ? (
                <Card className="p-12 text-center bg-gray-800 border-gray-700">
                    <ShoppingBag className="w-16 h-16 text-gray-700 mx-auto mb-4 opacity-30"/>
                    <p className="text-gray-400 mb-6">Você ainda não possui produtos vinculados.</p>
                    <button onClick={() => setActiveTab('marketplace')} className="bg-brand-primary text-black font-black px-8 py-3 rounded-xl hover:bg-yellow-400">Ver Marketplace</button>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {myProducts.map((prod, idx) => (
                        <Card key={idx} className={`bg-gray-800 border-gray-700 p-6 flex flex-col md:flex-row justify-between gap-6 border-l-4 ${prod.partnershipType === 'Co-produtor' ? 'border-l-purple-500' : 'border-l-blue-500'}`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">{prod.productName}</h3>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border flex items-center gap-1 ${prod.partnershipType === 'Co-produtor' ? 'bg-purple-900/40 text-purple-300 border-purple-500/30' : 'bg-blue-900/40 text-blue-300 border-blue-500/30'}`}>
                                        {prod.partnershipType === 'Co-produtor' ? <Users className="w-3 h-3"/> : <CheckCircle className="w-3 h-3"/>}
                                        {prod.partnershipType || 'Afiliado'}
                                    </span>
                                </div>
                                <div className="flex gap-4 mb-6">
                                    <span className="text-xs text-gray-500 font-bold uppercase">Sua Parte: <span className="text-white">{prod.customCommission}%</span></span>
                                    <span className="text-xs text-gray-500 font-bold uppercase">Ganhos: <span className="text-green-400">R$ {prod.earnings.toLocaleString()}</span></span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 group hover:border-brand-primary/50 transition-all">
                                        <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Link de Checkout</p>
                                        <div className="flex items-center justify-between">
                                            <code className="text-blue-400 text-xs truncate mr-2">{prod.link}</code>
                                            <button onClick={() => handleCopy(prod.link)} className="text-gray-400 hover:text-white transition-colors"><ClipboardCopy className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 group hover:border-brand-primary/50 transition-all">
                                        <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Página de Vendas</p>
                                        <div className="flex items-center justify-between">
                                            <code className="text-gray-400 text-xs truncate mr-2">{prod.salesPageLink || 'https://mestre15x.com/oferta'}</code>
                                            <button onClick={() => handleCopy(prod.salesPageLink || '')} className="text-gray-400 hover:text-white transition-colors"><ClipboardCopy className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
