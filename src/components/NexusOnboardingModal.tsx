
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { CheckCircle, Brain, Globe, Target, Share2, Zap, Clock } from './Icons';
import { generateProductDNA, updateProductDNA, saveAppProduct } from '../services/mockFirebase';
import { AppProduct } from '../types';
import toast from 'react-hot-toast';

interface NexusOnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    // Props opcionais para funcionamento completo
    product?: AppProduct | null;
    onUpdate?: (updatedProduct: AppProduct) => void;
}

export const NexusOnboardingModal: React.FC<NexusOnboardingModalProps> = ({ 
    isOpen, onClose, productName, product, onUpdate 
}) => {
    const [isActivating, setIsActivating] = useState(false);

    if (!isOpen) return null;

    const handleActivateNexus = async () => {
        setIsActivating(true);
        const toastId = toast.loading("Nexus IA: Iniciando varredura de infraestrutura...");

        try {
            // Se tivermos o objeto produto, podemos realmente atualizá-lo
            if (product) {
                // 1. Simular delay de verificação de infraestrutura
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // 2. Gerar DNA real
                const dna = await generateProductDNA(product.name, product.description || "Produto digital de alta performance.");
                
                // 3. Atualizar o produto com DNA e forçar STATUS PENDENTE
                // O Nexus só liberará para 'active' após verificar pixel/domínio em background (simulado)
                const updatedProductData: AppProduct = {
                    ...product,
                    dna: dna,
                    status: 'pending' // Mudança solicitada: Status Pendente até validação
                };

                await saveAppProduct(updatedProductData);
                
                // 4. Atualizar estado local da página pai
                if (onUpdate) {
                    onUpdate(updatedProductData);
                }
                
                toast.success("Status Pendente: Aguardando validação de Pixel e Domínio pelo Nexus.", { id: toastId, duration: 5000 });
            } else {
                // Fallback apenas visual se não tiver props completas
                await new Promise(resolve => setTimeout(resolve, 2000));
                toast.success("Solicitação enviada para análise!", { id: toastId });
            }
            
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao comunicar com Nexus.", { id: toastId });
        } finally {
            setIsActivating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-900 w-full max-w-lg rounded-2xl border border-brand-primary/50 shadow-[0_0_50px_rgba(250,204,21,0.2)] p-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Produto Criado!</h2>
                    <p className="text-gray-400 text-sm mt-2">"{productName}" foi salvo no sistema.</p>
                </div>

                <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700 mb-8">
                    <h3 className="text-brand-primary font-bold text-sm uppercase flex items-center gap-2 mb-4">
                        <Brain className="w-4 h-4"/> Nexus IA: Validação Obrigatória
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">
                        Para garantir a performance das campanhas, o produto ficará com <strong>Status Pendente</strong> até que o Nexus identifique a conexão dos seguintes ativos:
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="p-1 bg-blue-500/20 rounded"><Globe className="w-4 h-4 text-blue-400"/></div>
                            <span>Domínio Próprio Conectado</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="p-1 bg-red-500/20 rounded"><Target className="w-4 h-4 text-red-500"/></div>
                            <span>Pixel de Rastreamento Ativo</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="p-1 bg-purple-500/20 rounded"><Share2 className="w-4 h-4 text-purple-400"/></div>
                            <span>Redes Sociais Vinculadas</span>
                        </li>
                    </ul>
                </div>

                <Button 
                    onClick={handleActivateNexus} 
                    isLoading={isActivating}
                    className="w-full !py-4 text-lg font-black uppercase !bg-yellow-600 hover:!bg-yellow-500 text-white shadow-lg flex items-center justify-center gap-2"
                >
                    <Clock className="w-5 h-5 fill-current"/> ESTOU CIENTE & STATUS PENDENTE
                </Button>
                
                <p className="text-[10px] text-gray-500 text-center mt-3">
                    A validação ocorre automaticamente em até 5 minutos após a configuração.
                </p>
            </motion.div>
        </div>
    );
};
