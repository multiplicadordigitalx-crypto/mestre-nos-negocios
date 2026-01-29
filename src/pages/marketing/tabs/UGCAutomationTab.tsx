
import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { FileText, Camera, Rocket, Smartphone, PlayCircle, CheckCircle, RefreshCw, Box, Film, Brain } from '../../../components/Icons';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { callMestreIA } from '../../../services/mestreIaService';
import toast from 'react-hot-toast';
import { MarketingAccount } from '../../../types';
import { ConnectAccountModal } from '../components/ConnectAccountModal';

interface UGCAutomationTabProps {
    initialScript?: string | null;
    accounts: MarketingAccount[];
    onAddAccount: (acc: MarketingAccount) => void;
    onUpdateAccounts: (accounts: MarketingAccount[]) => void;
}

export const UGCAutomationTab: React.FC<UGCAutomationTabProps> = ({ initialScript, accounts, onAddAccount, onUpdateAccounts }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [scriptResult, setScriptResult] = useState<string | null>(initialScript || null);
    const [videoProgress, setVideoProgress] = useState(0);
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
    const [accountSearchTerm, setAccountSearchTerm] = useState('');
    const [productSearchTerm, setProductSearchTerm] = useState('');

    // Card 13 Inputs (Manual Distribution)
    const [selectedFormat, setSelectedFormat] = useState<'vertical' | 'horizontal'>('vertical');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedDistributionProduct, setSelectedDistributionProduct] = useState<string>('');
    const [isDistributing, setIsDistributing] = useState(false);
    const [product, setProduct] = useState('');

    useEffect(() => {
        if (initialScript) {
            setScriptResult(initialScript);
            setStep(2);
            toast("Script importado da Clonagem Viral!", { icon: '🧬' });
        }
    }, [initialScript]);

    const handleGenerateScript = async () => {
        if (!niche || !product) return toast.error("Preencha todos os campos");
        setLoading(true);
        try {
            const res = await callMestreIA('ugc_viral_scripts', { niche, product });
            setScriptResult(res.output);
            toast.success("Roteiros gerados! Avançando para Estúdio...");
            setTimeout(() => setStep(2), 1500);
        } catch (e) {
            toast.error("Erro ao gerar roteiro.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateVideo = () => {
        setLoading(true);
        setVideoProgress(0);
        const interval = setInterval(() => {
            setVideoProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setLoading(false);
                    return 100;
                }
                return prev + 2;
            });
        }, 50);
    };

    const handleResetVideo = () => {
        setVideoProgress(0);
        setLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleManualDistribution = async () => {
        if (!uploadedFile) return toast.error("Por favor, faça upload de um vídeo ou imagem.");
        if (!selectedDistributionProduct) return toast.error("Selecione um produto para distribuir.");

        setIsDistributing(true);

        // Filter accounts for the selected product
        const targetAccounts = accounts.filter(acc =>
            (acc.product || 'Sem Produto') === selectedDistributionProduct
        );

        if (targetAccounts.length === 0) {
            setIsDistributing(false);
            return toast.error("Nenhuma conta encontrada para este produto.");
        }

        // Set initial status to posting for target accounts
        const newAccountsState = accounts.map(acc => {
            if ((acc.product || 'Sem Produto') === selectedDistributionProduct) {
                return { ...acc, postingStatus: 'posting' as const };
            }
            return acc;
        });
        onUpdateAccounts(newAccountsState);

        toast.success(`Iniciando distribuição para ${targetAccounts.length} contas de ${selectedDistributionProduct}...`);

        // Simulate distribution
        for (const acc of targetAccounts) {
            await new Promise(r => setTimeout(r, 2000)); // Simulate upload/post time

            // Update individual account status to success
            const currentAccounts = [...newAccountsState]; // Note: In real app use functional update from prop if possible or fetch
            // optimizing here for the local ref match

            // We need to call onUpdateAccounts with the LATEST full state. 
            // Since we don't have a functional setter from props, we just simulate the progression 
            // based on our local 'newAccountsState' variable which we mutate or copy.
            // A better way is to update the specific item in the parent. 
            // For now, let's just trigger the callback with the full list updated.

            const accIndex = newAccountsState.findIndex(a => a.id === acc.id);
            if (accIndex !== -1) {
                newAccountsState[accIndex] = { ...newAccountsState[accIndex], postingStatus: 'success' };
                onUpdateAccounts([...newAccountsState]); // Create new ref
            }
        }

        setIsDistributing(false);
        toast.success("Distribuição Completa!");
    };

    const handleConnectAccount = async (data: any) => {
        // Since Modal requires async and now handles saving (or we handle saving here if passed up)
        // Ideally we assume data is already saved OR we save it here if not.
        // But for this refactor, we just update the UI state as the Modal saves via prop if configured,
        // OR the modal sends data here and we add it. Await is crucial for the modal's loading state.

        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate work if needed

        const newAcc: MarketingAccount = {
            id: Date.now().toString(),
            username: data.username,
            platform: data.platform,
            status: 'ONLINE',
            followers: '0 seg',
            responseTime: '5s',
            postingStatus: 'idle',
            product: data.product || 'Sem Produto'
        };
        onAddAccount(newAcc);
        setExpandedProduct(newAcc.product || 'Sem Produto');
        toast.success(`Conta ${data.platform} conectada e vinculada ao produto: ${data.product}!`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700 overflow-x-auto">
                {[
                    { id: 1, label: '1. Roteirista (Card 11)', icon: FileText },
                    { id: 2, label: '2. Estúdio (Card 12)', icon: Camera },
                    { id: 3, label: '3. Distribuição (Card 13)', icon: Rocket }
                ].map(s => (
                    <button
                        key={s.id}
                        onClick={() => setStep(s.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer hover:bg-gray-700 hover:text-white ${step === s.id
                            ? 'bg-brand-primary text-black font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-primary'
                            : 'text-gray-400'
                            }`}
                    >
                        <s.icon className="w-4 h-4" /> {s.label}
                    </button>
                ))}
            </div>

            {/* CARD 11 VIEW */}
            {step === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <Card className="p-6 border-l-4 border-l-yellow-500">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Camera className="w-6 h-6 text-yellow-500" /> Criador de Roteiros UGC Viral
                            </h3>
                            <p className="text-gray-400 text-sm mb-6">
                                Mapeia dores reais e gera roteiros que respondem as 7 perguntas literais. Envia JSON para o Card 12.
                            </p>
                            <div className="space-y-4">
                                <Input label="Nicho de Atuação" placeholder="Ex: Emagrecimento, Renda Extra..." value={niche} onChange={e => setNiche(e.target.value)} />
                                <Input label="Produto (Contexto Oculto)" placeholder="Ex: Método Seca Barriga" value={product} onChange={e => setProduct(e.target.value)} />
                                <Button
                                    onClick={handleGenerateScript}
                                    isLoading={loading}
                                    className="w-full !bg-yellow-500 hover:!bg-yellow-400 text-black font-black uppercase !py-4 shadow-lg shadow-yellow-500/20"
                                >
                                    Gerar Roteiros & Enviar p/ Card 12
                                </Button>
                            </div>
                        </Card>

                        {/* Nexus Memory Section */}
                        <div className="bg-gray-800/50 p-4 rounded-xl border border-purple-500/20">
                            <h4 className="text-purple-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                                <Brain className="w-4 h-4" /> Nexus Memory (Influencers Campeões)
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="bg-gray-900 p-3 rounded flex items-center justify-between border border-gray-700 hover:border-purple-500 transition-colors cursor-pointer" onClick={() => { setNiche('Renda Extra'); setProduct('Mestre nos Negócios'); toast.success("Setup da Ana carregado!"); }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-cover bg-center" style={{ backgroundImage: 'url(https://randomuser.me/api/portraits/women/44.jpg)' }}></div>
                                        <div>
                                            <p className="text-white text-xs font-bold">Ana (Nordeste)</p>
                                            <p className="text-[10px] text-green-400">ROAS 4.2x • R$ 12k Lucro</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] bg-purple-900 text-purple-200 px-2 py-1 rounded">REUTIIZAR</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-xl border border-gray-700 p-4 font-mono text-xs text-gray-400 overflow-y-auto max-h-[500px]">
                        <p className="text-gray-500 mb-2 font-bold flex justify-between">
                            <span>// JSON Output Preview</span>
                            <span className="text-green-500">⚫ LIVE</span>
                        </p>
                        {scriptResult ? scriptResult : <div className="h-full flex flex-col items-center justify-center opacity-30"><FileText className="w-12 h-12 mb-2" /><p>Aguardando prompt...</p></div>}
                    </div>
                </div>
            )}

            {/* CARD 12 VIEW */}
            {step === 2 && (
                <div className="max-w-4xl mx-auto">
                    <Card className="p-8 border border-brand-primary/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-brand-primary text-black text-xs font-bold px-3 py-1 rounded-bl-xl">GEMINI VEO 3 + IMAGEN 3</div>
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <Film className="w-8 h-8 text-brand-primary" /> Gerador de Vídeos Hiper-Realistas
                        </h3>

                        {videoProgress < 100 && !loading && (
                            <div className="text-center py-10">
                                {initialScript && (
                                    <div className="mb-6 bg-green-900/30 border border-green-500/30 p-4 rounded text-left max-w-2xl mx-auto">
                                        <p className="text-green-400 text-xs font-bold mb-2">SCRIPT IMPORTADO:</p>
                                        <p className="text-gray-300 text-sm line-clamp-3">{initialScript}</p>
                                    </div>
                                )}
                                <p className="text-gray-400 mb-6">JSON do Roteiro pronto para renderização.</p>
                                <Button onClick={handleGenerateVideo} className="!py-4 !px-8 text-lg font-bold">
                                    INICIAR RENDERIZAÇÃO (4 MIN)
                                </Button>
                            </div>
                        )}

                        {loading && (
                            <div className="py-12 text-center">
                                <div className="w-24 h-24 border-4 border-gray-700 border-t-brand-primary rounded-full animate-spin mx-auto mb-6"></div>
                                <h4 className="text-xl font-bold text-white mb-2">Renderizando Video {videoProgress}%</h4>
                                <div className="flex justify-center mb-6">
                                    <span className="bg-purple-900/30 text-purple-300 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/30 flex items-center gap-2">
                                        <Smartphone className="w-3 h-3" /> Renderizando em 9:16 (Formato TikTok)
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm">Gerando personagem "Ana do Nordeste" • Sincronizando Lip-Sync • Criando Thumbnail</p>
                            </div>
                        )}

                        {videoProgress === 100 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
                                <div className="bg-black rounded-xl aspect-[9/16] relative overflow-hidden border-4 border-gray-800 shadow-2xl">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <PlayCircle className="w-16 h-16 text-white opacity-80" />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <p className="text-white font-bold text-sm bg-black/50 p-2 rounded">"Eu era diarista... hoje mando limpar a minha 😭"</p>
                                    </div>
                                </div>
                                <div>
                                    <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg mb-6">
                                        <p className="text-green-400 font-bold flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" /> Vídeo Pronto para Postagem
                                        </p>
                                    </div>
                                    <ul className="space-y-3 text-sm text-gray-300 mb-8">
                                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-primary" /> Personagem: Ana do Nordeste</li>
                                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-primary" /> Duração: 58s</li>
                                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-primary" /> Legendas Automáticas</li>
                                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-primary" /> Thumbnail Otimizada</li>
                                    </ul>
                                    <div className="flex gap-3">
                                        <Button variant="secondary" onClick={handleResetVideo} className="flex-1 !py-3 font-bold border-gray-600 text-gray-300">
                                            <RefreshCw className="w-4 h-4 mr-2" /> REFAZER
                                        </Button>
                                        <Button onClick={() => setStep(3)} className="flex-[2] !py-3 font-bold !bg-purple-600 hover:!bg-purple-500">
                                            ENVIAR PARA CARD 13
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* CARD 13 VIEW - MANUAL DISTRIBUTION */}
            {step === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: UPLOAD & CONFIG */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6 bg-gray-800 border border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Rocket className="w-6 h-6 text-purple-500" /> Distribuição Manual
                                </h3>
                                <Button
                                    onClick={() => setIsConnectModalOpen(true)}
                                    className="!py-1.5 !px-3 !text-xs !bg-blue-600 hover:!bg-blue-500"
                                >
                                    + Add Conta
                                </Button>
                            </div>

                            {/* 1. FORMAT SELECTOR */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">1. Escolha o Formato</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setSelectedFormat('vertical')}
                                        className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${selectedFormat === 'vertical' ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-gray-900 border-gray-700 hover:border-gray-600'}`}
                                    >
                                        <Smartphone className={`w-8 h-8 ${selectedFormat === 'vertical' ? 'text-purple-400' : 'text-gray-500'}`} />
                                        <div className="text-center">
                                            <p className={`font-bold ${selectedFormat === 'vertical' ? 'text-white' : 'text-gray-400'}`}>Vertical (9:16)</p>
                                            <p className="text-[10px] text-gray-500">TikTok, Reels, Shorts</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setSelectedFormat('horizontal')}
                                        className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${selectedFormat === 'horizontal' ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-gray-900 border-gray-700 hover:border-gray-600'}`}
                                    >
                                        <Film className={`w-8 h-8 ${selectedFormat === 'horizontal' ? 'text-blue-400' : 'text-gray-500'}`} />
                                        <div className="text-center">
                                            <p className={`font-bold ${selectedFormat === 'horizontal' ? 'text-white' : 'text-gray-400'}`}>Horizontal (16:9)</p>
                                            <p className="text-[10px] text-gray-500">YouTube, Facebook Feed</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* 2. UPLOAD AREA */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">2. Upload do Material</label>
                                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-brand-primary transition-colors bg-gray-900/50 relative">
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {!previewUrl ? (
                                        <div className="pointer-events-none">
                                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                                                {selectedFormat === 'vertical' ? <Smartphone className="w-8 h-8" /> : <Film className="w-8 h-8" />}
                                            </div>
                                            <p className="text-gray-300 font-bold">Arraste e solte ou clique para selecionar</p>
                                            <p className="text-sm text-gray-500 mt-2">Suporta MP4, MOV, JPG, PNG</p>
                                        </div>
                                    ) : (
                                        <div className="relative z-10 pointer-events-none">
                                            <div className="text-green-400 flex flex-col items-center gap-2">
                                                <CheckCircle className="w-10 h-10" />
                                                <p className="font-bold">Arquivo Carregado!</p>
                                                <p className="text-xs text-gray-400 max-w-[200px] truncate">{uploadedFile?.name}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3. PRODUCT SELECTOR & ACTION */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">3. Selecione o Produto para Distribuição</label>
                                <select
                                    value={selectedDistributionProduct}
                                    onChange={(e) => setSelectedDistributionProduct(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="" disabled>Selecione um produto...</option>
                                    {Array.from(new Set(accounts.map(a => a.product || 'Sem Produto'))).map(p => (
                                        <option key={p} value={p}>{p} ({accounts.filter(a => (a.product || 'Sem Produto') === p).length} contas)</option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                onClick={handleManualDistribution}
                                disabled={isDistributing || !uploadedFile || !selectedDistributionProduct}
                                isLoading={isDistributing}
                                className="w-full !py-4 text-lg font-black uppercase !bg-purple-600 hover:!bg-purple-500 shadow-xl shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDistributing ? 'Distribuindo...' : '🚀 Iniciar Distribuição em Massa'}
                            </Button>

                        </Card>
                    </div>

                    {/* RIGHT COLUMN: PREVIEW & STATUS */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Preview Card */}
                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 h-fit">
                            <h4 className="text-gray-400 text-xs font-bold uppercase mb-4 center flex justify-between">
                                <span>Preview</span>
                                <span className="text-purple-400 text-[10px]">{selectedFormat.toUpperCase()}</span>
                            </h4>
                            <div className={`bg-black rounded-lg mx-auto overflow-hidden relative border border-gray-800 shadow-inner flex items-center justify-center ${selectedFormat === 'vertical' ? 'aspect-[9/16] w-[200px]' : 'aspect-[16/9] w-full'}`}>
                                {previewUrl ? (
                                    uploadedFile?.type.startsWith('image') ?
                                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" /> :
                                        <video src={previewUrl} className="w-full h-full object-cover" autoPlay muted loop />
                                ) : (
                                    <div className="text-gray-600 flex flex-col items-center">
                                        <PlayCircle className="w-10 h-10 opacity-20 mb-2" />
                                        <span className="text-[10px]">Aguardando Upload</span>
                                    </div>
                                )}
                            </div>
                            {selectedDistributionProduct && (
                                <div className="mt-4 pt-4 border-t border-gray-800">
                                    <p className="text-xs text-gray-400 text-center">Será postado em:</p>
                                    <p className="text-center font-bold text-white text-sm mt-1">{accounts.filter(a => (a.product || 'Sem Produto') === selectedDistributionProduct).length} Contas vinculadas</p>
                                </div>
                            )}
                        </div>

                        {/* Distribution List */}
                        {selectedDistributionProduct && (
                            <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden max-h-[400px] flex flex-col">
                                <div className="p-3 bg-gray-800/50 border-b border-gray-700">
                                    <p className="text-xs font-bold text-gray-300">Status da Fila</p>
                                </div>
                                <div className="overflow-y-auto p-2 custom-scrollbar space-y-2 flex-1">
                                    {accounts
                                        .filter(acc => (acc.product || 'Sem Produto') === selectedDistributionProduct)
                                        .map(acc => (
                                            <div key={acc.id} className="flex items-center justify-between p-2 bg-gray-800/30 rounded border border-gray-700/50">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0 ${acc.platform === 'TikTok' ? 'bg-black' : 'bg-pink-600'}`}>
                                                        {acc.platform[0]}
                                                    </div>
                                                    <span className="text-[10px] text-gray-300 truncate">{acc.username}</span>
                                                </div>
                                                <div>
                                                    {acc.postingStatus === 'posting' && <LoadingSpinner size="sm" />}
                                                    {acc.postingStatus === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                                    {(!acc.postingStatus || acc.postingStatus === 'idle') && <span className="w-2 h-2 rounded-full bg-gray-600"></span>}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ConnectAccountModal
                isOpen={isConnectModalOpen}
                onClose={() => setIsConnectModalOpen(false)}
                onConnect={handleConnectAccount}
            />
        </div>
    );
};
