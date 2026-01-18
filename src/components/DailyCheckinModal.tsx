import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { X as XIcon, Instagram, Tiktok, Youtube, CheckCircle, Trophy, Facebook, ShoppingBag } from './Icons';
import toast from 'react-hot-toast';

interface DailyCheckinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (count: number, product: string) => void;
}

const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [selectedProduct, setSelectedProduct] = useState('');
    const [counts, setCounts] = useState({
        instagram: 0,
        tiktok: 0,
        kwai: 0,
        youtube: 0,
        facebook: 0
    });
    const [step, setStep] = useState<'form' | 'success'>('form');

    // Mock products for selection (in real app, passed via props)
    const products = ["Formação Mestre do Tráfego", "Ganhar Dinheiro no Kwai", "Emagrecimento Definitivo"];

    const total = useMemo(() => (Object.values(counts) as number[]).reduce((a, b) => a + b, 0), [counts]);
    const isGreat = total >= 25; // Changed to 25 based on new rules

    const handleChange = (network: keyof typeof counts, value: string) => {
        const num = parseInt(value) || 0;
        setCounts(prev => ({ ...prev, [network]: num }));
    };

    const handleSubmit = () => {
        if (!selectedProduct) {
            toast.error("Selecione um produto primeiro!");
            return;
        }
        if (total === 0) {
            toast.error("Informe pelo menos uma postagem.");
            return;
        }

        setStep('success');
        onSubmit(total, selectedProduct);
        
        setTimeout(() => {
            onClose();
            setStep('form');
            setCounts({ instagram: 0, tiktok: 0, kwai: 0, youtube: 0, facebook: 0 });
            setSelectedProduct('');
        }, 2500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ duration: 0.3 }}
                className="bg-gray-800 w-full max-w-md rounded-2xl border border-gray-700 relative shadow-2xl p-6"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <XIcon className="w-6 h-6" />
                </button>

                {step === 'form' ? (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Check-in de Produção 🚀</h2>
                            <p className="text-gray-400 text-sm mt-1">Regra: 1 registro por dia por produto</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-300 mb-2">Selecione o Produto</label>
                            <div className="relative">
                                <ShoppingBag className="absolute left-3 top-3 w-5 h-5 text-gray-500"/>
                                <select 
                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-brand-primary outline-none appearance-none"
                                    value={selectedProduct}
                                    onChange={e => setSelectedProduct(e.target.value)}
                                >
                                    <option value="">-- Escolha o produto --</option>
                                    {products.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Quantidade de posts HOJE:</p>
                            
                            <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded-lg border border-gray-600">
                                <div className="flex items-center gap-3">
                                    <Instagram className="w-5 h-5 text-pink-500" />
                                    <span className="text-white text-sm font-medium">Instagram</span>
                                </div>
                                <input type="number" min="0" value={counts.instagram || ''} onChange={e => handleChange('instagram', e.target.value)} className="w-16 bg-gray-900 border border-gray-600 rounded p-1 text-center text-white outline-none focus:border-brand-primary text-sm" placeholder="0" />
                            </div>
                            <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded-lg border border-gray-600">
                                <div className="flex items-center gap-3">
                                    <Tiktok className="w-5 h-5 text-white" />
                                    <span className="text-white text-sm font-medium">TikTok</span>
                                </div>
                                <input type="number" min="0" value={counts.tiktok || ''} onChange={e => handleChange('tiktok', e.target.value)} className="w-16 bg-gray-900 border border-gray-600 rounded p-1 text-center text-white outline-none focus:border-brand-primary text-sm" placeholder="0" />
                            </div>
                            <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded-lg border border-gray-600">
                                <div className="flex items-center gap-3">
                                    <span className="w-5 h-5 flex items-center justify-center font-black text-orange-500 bg-white rounded-full text-[10px]">K</span>
                                    <span className="text-white text-sm font-medium">Kwai</span>
                                </div>
                                <input type="number" min="0" value={counts.kwai || ''} onChange={e => handleChange('kwai', e.target.value)} className="w-16 bg-gray-900 border border-gray-600 rounded p-1 text-center text-white outline-none focus:border-brand-primary text-sm" placeholder="0" />
                            </div>
                             <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded-lg border border-gray-600">
                                <div className="flex items-center gap-3">
                                    <Youtube className="w-5 h-5 text-red-500" />
                                    <span className="text-white text-sm font-medium">YouTube</span>
                                </div>
                                <input type="number" min="0" value={counts.youtube || ''} onChange={e => handleChange('youtube', e.target.value)} className="w-16 bg-gray-900 border border-gray-600 rounded p-1 text-center text-white outline-none focus:border-brand-primary text-sm" placeholder="0" />
                            </div>
                            <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded-lg border border-gray-600">
                                <div className="flex items-center gap-3">
                                    <Facebook className="w-5 h-5 text-blue-500" />
                                    <span className="text-white text-sm font-medium">Facebook</span>
                                </div>
                                <input type="number" min="0" value={counts.facebook || ''} onChange={e => handleChange('facebook', e.target.value)} className="w-16 bg-gray-900 border border-gray-600 rounded p-1 text-center text-white outline-none focus:border-brand-primary text-sm" placeholder="0" />
                            </div>
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded-xl mb-6 text-center">
                            <p className="text-gray-400 text-xs uppercase mb-1">Total Hoje</p>
                            <p className={`text-3xl font-black ${isGreat ? 'text-green-400' : total > 0 ? 'text-brand-primary' : 'text-gray-600'}`}>
                                {total}
                            </p>
                            {isGreat && <p className="text-xs text-green-400 mt-1 font-bold">META BATIDA! 🔥</p>}
                        </div>

                        <div className="flex items-center gap-2 mb-4 px-2">
                            <input type="checkbox" id="declare" className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-brand-primary" required />
                            <label htmlFor="declare" className="text-xs text-gray-400">Declaro que as postagens são reais e exclusivas deste produto.</label>
                        </div>

                        <Button onClick={handleSubmit} className="w-full !py-3 text-lg" disabled={total === 0}>
                            REGISTRAR PRODUÇÃO
                        </Button>
                    </>
                ) : (
                    <div className="text-center py-10">
                        <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            transition={{ type: 'spring' }}
                            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle className="w-12 h-12 text-white" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-2">Registrado!</h3>
                        <p className="text-gray-300 mb-4">Produto: <span className="text-white font-bold">{selectedProduct}</span></p>
                        <p className="text-gray-400 text-sm">Seus dados foram salvos e somados para a verificação de nível.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default DailyCheckinModal;