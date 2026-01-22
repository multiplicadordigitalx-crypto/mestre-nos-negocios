import React, { useState, useRef } from 'react';
import { FileText, CheckCircle, AlertCircle, ChevronLeft, Zap, Award, Mic, Upload, XCircle } from '../../Icons';
import Button from '../../Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { consumeCredits } from '../../../services/mockFirebase';
import { InsufficientFundsAlert } from '../language/InsufficientFundsAlert';
import { StudentPage } from '../../../types';

interface EssayCorrectorProps {
    onBack: () => void;
    navigateTo?: (page: StudentPage) => void;
}

export const EssayCorrector: React.FC<EssayCorrectorProps> = ({ onBack, navigateTo }) => {
    const { user, refreshUser } = useAuth();
    const [text, setText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);

    // Modal & Credit States
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);
    const COST_PER_ESSAY = 5;

    const [result, setResult] = useState<null | {
        score: number;
        feedback: string;
        checklist: { item: string; pass: boolean }[];
    }>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFile(e.target.files[0]);
            setText(prev => prev || "[Arquivo anexado para análise]");
            toast.success("Arquivo recebido!");
        }
    };

    const handleCorrecao = () => {
        if ((!text || text.length < 50) && !uploadedFile && !linkUrl) {
            toast.error("Insira o texto, um arquivo ou link para correção.");
            return;
        }

        if (user && (user.creditBalance || 0) < COST_PER_ESSAY) {
            setShowInsufficientModal(true);
            return;
        }

        setIsAnalyzing(true);
        // Execute Debit
        const startDebit = async () => {
            if (!user) return;
            const result = await consumeCredits(user.uid, 'essay_correction', COST_PER_ESSAY, 'Corretor de Peças: Análise Jurídica');
            if (!result.success) {
                toast.error(result.message || "Erro ao debitar créditos.");
                setIsAnalyzing(false);
                return;
            }
            refreshUser?.();

            // Simulate AI Analysis
            setTimeout(() => {
                setIsAnalyzing(false);
                setResult({
                    score: 8.5,
                    feedback: "Boa estrutura argumentativa. A fundamentação no Art. 300 do CPC está correta, mas faltou explorar mais a jurisprudência recente do STJ sobre o tema. O fechamento foi conciso e objetivo.",
                    checklist: [
                        { item: "Endereçamento Correto", pass: true },
                        { item: "Qualificação das Partes", pass: true },
                        { item: "Fundamentação Legal (Artigos)", pass: true },
                        { item: "Citação de Jurisprudência", pass: false },
                        { item: "Pedidos Claros", pass: true },
                        { item: "Valor da Causa", pass: true },
                    ]
                });
                toast.success("Correção finalizada!");
            }, 3000);
        };

        startDebit();
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden flex flex-col relative h-auto">
            {/* Header */}
            <div className="bg-gray-950/80 p-6 border-b border-gray-800 flex items-center justify-center relative backdrop-blur-md sticky top-0 z-20">
                <div className="absolute left-6">
                    <Button onClick={onBack} className="!p-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </div>
                <div className="text-center flex flex-col items-center justify-center">
                    <h2 className="text-xl md:text-2xl font-black text-white flex items-center justify-center gap-2 tracking-tight">
                        Corretor de Peças
                        <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded uppercase border border-red-500/30">OAB</span>
                    </h2>
                    <p className="text-xs text-gray-400 font-medium">Padrão FGV/OAB 2ª Fase</p>
                </div>
            </div>

            <div className="flex-1 p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Area */}
                <div className="flex flex-col gap-4">
                    <label className="text-sm font-bold text-gray-400 uppercase">Sua Peça / Redação</label>
                    <div className="relative flex-1 flex flex-col gap-3">
                        {/* Textarea Wrapper */}
                        <div className="relative">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl p-4 pb-8 text-sm text-gray-200 outline-none focus:border-red-500 resize-none min-h-[300px]"
                                placeholder="Digite ou cole sua peça aqui..."
                            />
                            {/* Char Counter inside */}
                            <div className="absolute bottom-3 right-4 text-[10px] text-gray-500 font-mono pointer-events-none">
                                {text.length} caracteres
                            </div>
                        </div>

                        {/* File/Link Actions */}
                        <div className="flex gap-2 justify-center">
                            {/* Upload Button */}
                            <div className="relative">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileUpload}
                                    accept=".pdf,.doc,.docx,.png,.jpg"
                                />
                                <Button className="!bg-gray-800 border border-gray-700 hover:!bg-gray-700 text-gray-200 hover:text-white text-xs px-3 py-2 flex items-center gap-2">
                                    <Upload className="w-4 h-4" /> {uploadedFile ? 'Arquivo Anexado' : 'Carregar Arquivo'}
                                </Button>
                            </div>

                            {/* Link Toggle */}
                            {!showLinkInput ? (
                                <Button onClick={() => setShowLinkInput(true)} className="!bg-gray-800 border border-gray-700 hover:!bg-gray-700 text-gray-200 hover:text-white text-xs px-3 py-2 flex items-center gap-2">
                                    <span className="text-blue-400">🔗</span> Link
                                </Button>
                            ) : (
                                <div className="flex-1 flex gap-2 animate-fade-in">
                                    <input
                                        type="text"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        placeholder="Cole o link..."
                                        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1 text-xs text-white w-full focus:border-blue-500 outline-none"
                                    />
                                    <button onClick={() => setShowLinkInput(false)} className="text-gray-500 hover:text-white"><XCircle className="w-4 h-4" /></button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-2 pb-8 md:pb-0">
                        <Button
                            onClick={handleCorrecao}
                            disabled={isAnalyzing}
                            className={`w-full !bg-red-600 hover:!bg-red-500 !py-4 shadow-lg shadow-red-500/20 font-bold text-lg ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isAnalyzing ? 'Analisando Critérios...' : 'Corrigir Agora'}
                        </Button>
                    </div>
                </div>

                {/* Result Area */}
                <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 relative min-h-[300px]">
                    {!result ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 opacity-50 p-6 text-center">
                            <FileText className="w-16 h-16 mb-4" />
                            <p className="text-sm">Aguardando sua peça/redação para receber uma análise detalhada baseada nos critérios da banca.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Resultado da Análise</h3>
                                <div className="text-3xl font-black text-yellow-500 flex items-center gap-2">
                                    <Award className="w-8 h-8" />
                                    {result.score} <span className="text-sm text-gray-600 font-normal">/ 10</span>
                                </div>
                            </div>

                            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                                <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Feedback da IA</h4>
                                <p className="text-sm text-gray-300 leading-relaxed">{result.feedback}</p>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase text-gray-500">Checklist de Itens Obrigatórios</h4>
                                {result.checklist.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-800/50">
                                        <span className="text-sm text-gray-300">{item.item}</span>
                                        {item.pass ? (
                                            <span className="text-green-500 flex items-center gap-1 text-xs font-bold"><CheckCircle className="w-4 h-4" /> OK</span>
                                        ) : (
                                            <span className="text-red-500 flex items-center gap-1 text-xs font-bold"><AlertCircle className="w-4 h-4" /> Faltou</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Footer Note */}
            <div className="p-4 border-t border-gray-800 bg-gray-950/50 flex items-center justify-center gap-2 text-center">
                <AlertCircle className="w-4 h-4 text-gray-600" />
                <p className="text-[10px] text-gray-500 max-w-lg">
                    <strong>Nota:</strong> Ferramenta baseada em IA. As respostas servem de auxílio e aprendizado, não substituem consultoria legal oficial.
                </p>
            </div>

            {/* Global Modals */}
            <InsufficientFundsAlert
                isOpen={showInsufficientModal}
                onClose={() => setShowInsufficientModal(false)}
                onRecharge={() => {
                    setShowInsufficientModal(false);
                    if (navigateTo) navigateTo('recharge');
                    else toast.error("Navegação indisponível");
                }}
                requiredCredits={COST_PER_ESSAY}
                currentCredits={user?.creditBalance || 0}
            />
        </div>
    );
};
