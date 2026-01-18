
import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { FileText, Camera, Rocket, Smartphone, PlayCircle, CheckCircle, RefreshCw, Box, Film, Brain } from '../../../components/Icons';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { callMestreIA } from '../../../services/mestreIaService';
import toast from 'react-hot-toast';
import { SharedAccount } from '../../../types';
import { ConnectAccountModal } from '../components/ConnectAccountModal';

interface UGCAutomationTabProps {
    initialScript?: string | null;
    accounts: SharedAccount[];
    onAddAccount: (acc: SharedAccount) => void;
    onUpdateAccounts: (accounts: SharedAccount[]) => void;
}

export const UGCAutomationTab: React.FC<UGCAutomationTabProps> = ({ initialScript, accounts, onAddAccount, onUpdateAccounts }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [scriptResult, setScriptResult] = useState<string | null>(initialScript || null);
    const [videoProgress, setVideoProgress] = useState(0);
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

    // Card 11 Inputs
    const [niche, setNiche] = useState('');
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

    const handlePost = async () => {
        // Explicitly map with correct status literal type
        const postingAccounts: SharedAccount[] = accounts.map(a => ({
            ...a,
            postingStatus: 'posting' as const
        }));

        onUpdateAccounts(postingAccounts);

        for (let i = 0; i < postingAccounts.length; i++) {
            await new Promise(r => setTimeout(r, 1500));
            // Create a new array to avoid mutation issues
            const currentAccounts = [...postingAccounts];
            // Update specific item with new status
            currentAccounts[i] = {
                ...currentAccounts[i],
                postingStatus: 'success' as const
            };
            // Update state (in real app, we would update based on previous state to be safe)
            onUpdateAccounts(currentAccounts);
            // Update local reference for next iteration if needed, though we reconstruct from state usually
            postingAccounts[i] = currentAccounts[i];
        }

        toast.success("Postagem concluída em todas as contas!");
    };

    const handleConnectAccount = (data: any) => {
        const newAcc: SharedAccount = {
            id: Date.now(),
            username: data.username,
            platform: data.platform,
            status: 'ONLINE',
            followers: '0 seg',
            responseTime: '5s',
            postingStatus: 'idle',
            product: data.product
        };
        onAddAccount(newAcc);
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

            {/* CARD 13 VIEW */}
            {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 bg-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Rocket className="w-6 h-6 text-purple-500" /> Distribuição Automática
                            </h3>
                            <Button
                                onClick={() => setIsConnectModalOpen(true)}
                                className="!py-1.5 !px-3 !text-xs !bg-blue-600 hover:!bg-blue-500"
                            >
                                + Add Conta
                            </Button>
                        </div>
                        <p className="text-sm text-gray-400 mb-6">
                            Contas validadas e prontas para postagem. O Card 13 selecionou os melhores horários.
                        </p>

                        <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {accounts.map(acc => (
                                <div key={acc.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${acc.platform === 'TikTok' ? 'bg-black border border-gray-600' :
                                                acc.platform === 'Instagram' ? 'bg-pink-600' :
                                                    acc.platform === 'Kwai' ? 'bg-orange-500' : 'bg-red-600'
                                                }`}>
                                                {acc.platform[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{acc.username}</p>
                                                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                                    {acc.platform} • <span className="text-green-400 font-bold">● {acc.status}</span>
                                                </p>
                                            </div>
                                        </div>
                                        {acc.product && (
                                            <span className="text-[10px] text-brand-primary flex items-center gap-1 mt-1 ml-11">
                                                <Box className="w-3 h-3" /> {acc.product}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        {acc.postingStatus === 'idle' && (
                                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Aguardando</span>
                                        )}
                                        {acc.postingStatus === 'posting' && (
                                            <div className="flex items-center gap-2 text-xs text-blue-400">
                                                <LoadingSpinner size="sm" />
                                                <span>Enviando...</span>
                                            </div>
                                        )}
                                        {acc.postingStatus === 'success' && (
                                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30 font-bold flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Postado
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={handlePost}
                            disabled={accounts.some(a => a.postingStatus === 'posting' || a.postingStatus === 'success')}
                            className="w-full !py-4 font-black !bg-green-600 hover:!bg-green-500 shadow-lg shadow-green-900/20"
                        >
                            CONFIRMAR POSTAGEM EM {accounts.length} CONTAS
                        </Button>
                    </Card>
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                        <h4 className="text-gray-400 text-xs font-bold uppercase mb-4">Preview do Post</h4>
                        <div className="bg-black rounded-lg p-4 font-mono text-xs text-gray-300 relative">
                            <div className="w-full aspect-video bg-gray-800 rounded mb-4 flex items-center justify-center">
                                <PlayCircle className="w-10 h-10 text-gray-600" />
                            </div>
                            <p className="mb-2">Eu limpava casa dos outros... hoje quem limpa a minha sou eu ✨</p>
                            <p className="mb-2">Print real do que caiu hoje enquanto eu tava no banho 🙌</p>
                            <p className="text-blue-400 mb-4">Link na bio antes que acabe!</p>
                            <p className="text-gray-500">#MestreDosNegocios #TransformacaoReal #RendaExtra #MaesQueEmpreendem</p>
                        </div>
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
