
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../../components/Button';
import { StampLogo, Image, ClipboardCopy, CheckCircle, Download } from '../../../../components/Icons';
import toast from 'react-hot-toast';
import { User } from '../../../../types';

interface LogoGeneratorProps {
    result: string;
    onBack: () => void;
    user: User | null;
    // Added missing onTriggerCost prop
    onTriggerCost?: (cost: number, action: () => void) => void;
}

const MotionDiv = motion.div as any;

const LogoGenerator: React.FC<LogoGeneratorProps> = ({ result, onBack, user, onTriggerCost }) => {
    const [logoStep, setLogoStep] = useState<'selection' | 'download'>('selection');
    const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
    const [downloadingItem, setDownloadingItem] = useState<string | null>(null);

    const handleLogoSelection = () => {
        if (!selectedLogo) {
            toast.error("Por favor, selecione uma das opções.");
            return;
        }
        setLogoStep('download');
        window.scrollTo(0, 0);
    }

    const handleDownloadItem = (cost: number, itemName: string) => {
        const action = () => {
             setDownloadingItem(itemName);
             setTimeout(() => {
                setDownloadingItem(null);
                toast.success("Arquivo gerado com sucesso! Já pode usar agora mesmo.");
             }, 2000);
        };

        // If onTriggerCost is provided, use it to handle credit gate
        if (onTriggerCost) {
            onTriggerCost(cost, action);
        } else {
            // Fallback for user balance check if onTriggerCost is not provided
            if (user && (user.dailyMestreIALimit || 0) < cost) {
                toast.error(`Você precisa de mais ${cost} créditos para baixar este arquivo. Adquira agora.`);
                return;
            }
            action();
        }
    }

    return (
        <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto py-8">
            {logoStep === 'selection' && (
                <>
                    <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2">← Voltar</button>
                    <div className="bg-gray-900 border border-red-600/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center text-2xl">
                                <StampLogo className="w-8 h-8 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Opções de Logomarca Geradas</h2>
                                <p className="text-red-400 text-sm">Baseado na sua identidade visual.</p>
                            </div>
                        </div>

                        <div className="bg-black/50 rounded-xl p-6 border border-gray-700 font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar mb-8">
                            {result}
                        </div>

                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <h3 className="text-white font-bold mb-4 text-center">QUAL LOGO FEZ VOCÊ SE SENTIR MAIS PODEROSO E PRONTO PARA DOMINAR O MERCADO?</h3>
                            <div className="flex flex-col gap-3 mb-6">
                                {['Logo 1', 'Logo 2', 'Logo 3'].map((opt) => (
                                    <label key={opt} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${selectedLogo === opt ? 'bg-red-500/20 border-red-500' : 'bg-gray-700 border-transparent hover:bg-gray-600'}`}>
                                        <input 
                                            type="radio" 
                                            name="logo_choice" 
                                            value={opt} 
                                            checked={selectedLogo === opt} 
                                            onChange={() => setSelectedLogo(opt)}
                                            className="mr-3 text-red-500 focus:ring-red-500 bg-gray-900 border-gray-500 w-5 h-5"
                                        />
                                        <span className="text-white font-bold">{opt}</span>
                                    </label>
                                ))}
                            </div>
                            <Button 
                                onClick={handleLogoSelection} 
                                disabled={!selectedLogo}
                                className="w-full !py-4 !text-lg !bg-red-600 hover:!bg-red-500 font-black shadow-lg shadow-red-900/30"
                            >
                                ESCOLHER ESTA LOGO E IR PARA DOWNLOAD
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {logoStep === 'download' && (
                <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="text-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
                            PARABÉNS! VOCÊ ACABOU DE ESCOLHER A LOGO QUE VAI MUDAR SEU FATURAMENTO PARA SEMPRE.
                        </h1>
                        <p className="text-gray-400">Agora baixe apenas os arquivos que precisar.</p>
                    </div>

                    <div className="grid gap-4">
                        {[
                            { name: 'PNG fundo transparente – 2000px (alta qualidade)', cost: 5 },
                            { name: 'PNG pequeno – 500px (perfeito pra stories e WhatsApp)', cost: 5 },
                            { name: 'JPG fundo branco', cost: 5 },
                            { name: 'JPG fundo preto', cost: 5 },
                            { name: 'SVG vetorizado (editável para sempre)', cost: 5 },
                            { name: 'PDF vetorizado (impressão profissional)', cost: 5 },
                            { name: 'Favicon + Apple Touch Icon (32×32 e 180×180)', cost: 5 },
                            { name: 'Versão da logo SEM o slogan (todos os formatos acima)', cost: 8 }, 
                            { name: 'Paleta de cores oficial + Manual de Uso em PDF', cost: 5 },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-3 text-left w-full">
                                    <div className="bg-gray-700 p-2 rounded text-gray-300">
                                        {item.name.includes('PNG') ? <Image className="w-5 h-5"/> : item.name.includes('PDF') ? <ClipboardCopy className="w-5 h-5"/> : <CheckCircle className="w-5 h-5"/>}
                                    </div>
                                    <span className="text-white font-medium text-sm">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <span className="text-red-400 font-bold whitespace-nowrap text-sm">{item.cost} créditos</span>
                                    <Button 
                                        onClick={() => handleDownloadItem(item.cost, item.name)} 
                                        isLoading={downloadingItem === item.name}
                                        disabled={!!downloadingItem}
                                        className="whitespace-nowrap w-full md:w-auto !py-2 !text-xs !bg-green-600 hover:!bg-green-500"
                                    >
                                        <Download className="w-4 h-4 mr-2"/> BAIXAR
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 text-center">
                        <button onClick={() => { setLogoStep('selection'); window.scrollTo(0,0); }} className="text-gray-500 hover:text-white underline text-sm">
                            Voltar e escolher outra opção
                        </button>
                    </div>
                </MotionDiv>
            )}
        </MotionDiv>
    );
};

export default LogoGenerator;
