
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAvailableAffiliationProducts, requestAffiliation } from '../../../services/mockFirebase';
import { AppProduct, Influencer } from '../../../types';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { ShoppingBag, ExternalLink } from '../../../components/Icons';
import toast from 'react-hot-toast';
// Fix: Import missing LoadingSpinner component
import { LoadingSpinner } from '../../../components/LoadingSpinner';

export const NovosProdutosSection: React.FC<{ influencer: Influencer }> = ({ influencer }) => {
    const [marketplaceProducts, setMarketplaceProducts] = useState<AppProduct[]>([]);
    const [isLoadingMarket, setIsLoadingMarket] = useState(false);

    useEffect(() => {
        if (!influencer) return;
        setIsLoadingMarket(true);
        getAvailableAffiliationProducts(influencer).then(products => {
            setMarketplaceProducts(products);
            setIsLoadingMarket(false);
        });
    }, [influencer]);

    const handleRequestAffiliation = async (product: AppProduct) => {
        if (!confirm(`Deseja solicitar afiliação para "${product.name}"?`)) return;
        try {
            await requestAffiliation(influencer, product);
            toast.success("Solicitação enviada com sucesso!");
            setMarketplaceProducts(prev => prev.filter(p => p.id !== product.id));
        } catch (error: any) { toast.error(error.message || "Erro ao solicitar."); }
    };

    if (!influencer) return <div className="p-10 text-center"><LoadingSpinner /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-2">Marketplace de Afiliados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingMarket ? <div className="col-span-full text-center py-20"><LoadingSpinner/></div> : marketplaceProducts.length === 0 ? <p className="col-span-full text-center text-gray-500 py-10">Nenhum produto novo disponível agora.</p> : marketplaceProducts.map(prod => (
                    <Card key={prod.id} className="p-0 overflow-hidden bg-gray-800 border-gray-700 flex flex-col h-full hover:border-brand-primary transition-all">
                        <div className="h-48 bg-gray-700 relative">{prod.coverUrl && <img src={prod.coverUrl} className="w-full h-full object-cover" alt={prod.name} />}<div className="absolute top-2 right-2 flex gap-1"><span className="bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded font-bold uppercase border border-white/10">{prod.category || 'Geral'}</span></div></div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-white text-lg line-clamp-1">{prod.name}</h3>
                            <p className="text-gray-400 text-xs mt-2 line-clamp-2">{prod.description}</p>
                            <div className="grid grid-cols-2 gap-2 my-4 bg-gray-900/50 p-3 rounded-lg border border-gray-700"><div><p className="text-[9px] text-gray-500 uppercase font-black">Preço</p><p className="text-white font-bold">R$ {prod.price?.toFixed(2)}</p></div><div><p className="text-[9px] text-gray-500 uppercase font-black">Comissão</p><p className="text-green-400 font-bold">{prod.commission}%</p></div></div>
                            <div className="mt-auto flex gap-2"><Button variant="secondary" onClick={() => window.open(prod.landingPage, '_blank')} className="flex-1 !py-2 !text-[10px] uppercase font-black"><ExternalLink className="w-3 h-3 mr-1"/> Ver Pág.</Button><Button onClick={() => handleRequestAffiliation(prod)} className="flex-[2] !py-2 !text-[10px] uppercase font-black">Solicitar</Button></div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
