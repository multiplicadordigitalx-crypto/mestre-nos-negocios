
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Card from '../../../components/Card';
import { Clock, PlayCircle, Eye, Film, Search, Cpu, CheckCircle, Copy, Rocket } from '../../../components/Icons';
import { callMestreIA } from '../../../services/mestreIaService';
import toast from 'react-hot-toast';
import { SharedAccount } from '../../../types';

interface ViralCreativesTabProps {
    onTransferToUGC: (script: string) => void;
    accounts: SharedAccount[];
}

export const ViralCreativesTab: React.FC<ViralCreativesTabProps> = ({ onTransferToUGC, accounts }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [videoUrl, setVideoUrl] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [cloning, setCloning] = useState(false);
    const [clonedScript, setClonedScript] = useState<string | null>(null);

    // Filter logic: Only show radar item IF the user has a linked account for that platform
    const platformStatus = useMemo(() => {
        return {
            TikTok: accounts.some(a => a.platform === 'TikTok'),
            Instagram: accounts.some(a => a.platform === 'Instagram'),
            YouTube: accounts.some(a => a.platform === 'YouTube'),
            Kwai: accounts.some(a => a.platform === 'Kwai'),
        };
    }, [accounts]);

    const viralRadarFeed = useMemo(() => {
        const fullFeed = [
            { id: 101, thumbnailColor: 'bg-indigo-900', platform: 'TikTok', hook: "Pare de vender assim...", views: "2.4M", engagement: "Alta", safetyCheck: "Safe", sentiment: "Educational", analysis: { originalHook: "Se você vende no X1, pare agora. Você está perdendo tempo.", originalScript: "A maioria tenta convencer um por um. O segredo dos milionários é a escala. Use funis automáticos.", visualPattern: "Câmera na mão andando, legenda dinâmica amarela, corte seco.", metrics: { views: "2.4M", shares: "15k" } } },
            { id: 102, thumbnailColor: 'bg-rose-900', platform: 'Instagram', hook: "O segredo que ninguém conta...", views: "1.8M", engagement: "Viral", safetyCheck: "Safe", sentiment: "Curiosity", analysis: { originalHook: "Eles não querem que você saiba disso.", originalScript: "Existe um método simples de validar oferta sem gastar nada. Passo 1...", visualPattern: "Fundo preto, texto branco rápido, música de suspense.", metrics: { views: "1.8M", shares: "8k" } } },
            { id: 103, thumbnailColor: 'bg-orange-900', platform: 'Kwai', hook: "Dancinha que paga boleto...", views: "5.1M", engagement: "Explosivo", safetyCheck: "Safe", sentiment: "Humor", analysis: { originalHook: "Quem disse que dancinha não dá dinheiro?", originalScript: "...", visualPattern: "...", metrics: { views: "5.1M", shares: "20k" } } },
        ];

        // Filter: Keep only items where platform is linked
        return fullFeed.filter(item => platformStatus[item.platform as keyof typeof platformStatus]);
    }, [platformStatus]);

    const hasAnyConnection = Object.values(platformStatus).some(Boolean);

    const handleAnalyze = () => {
        if (!videoUrl) return toast.error("Insira uma URL válida.");
        setAnalyzing(true);
        setTimeout(() => {
            setAnalysisData({
                originalHook: "Você sabia que está perdendo dinheiro todo dia fazendo isso?",
                originalScript: "A maioria das pessoas guarda dinheiro na poupança. Mas os bancos lucram com isso. Se você mudar para este investimento simples, seu retorno triplica.",
                visualPattern: "Corte rápido a cada 2s, legenda amarela grande, fundo com gráfico subindo.",
                metrics: { views: "Varredura Manual", shares: "-" }
            });
            setAnalyzing(false);
            setStep(2);
            toast.success("Vídeo analisado! Estrutura extraída.");
        }, 2000);
    };

    const handleSelectChampion = (video: any) => {
        setVideoUrl(`https://social.com/video/${video.id}`);
        setAnalysisData(video.analysis);
        setStep(2);
        toast.success("Vídeo campeão selecionado! Análise carregada.", { icon: '🏆' });
        window.scrollTo(0, 0);
    };

    const handleClone = async () => {
        setCloning(true);
        try {
            const res = await callMestreIA('viral_clone_adapter', {
                originalHook: analysisData.originalHook,
                originalScript: analysisData.originalScript
            });
            let formattedScript = res.output;
            try {
                const cleanJson = res.output.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleanJson);
                formattedScript = `GANCHO: ${parsed.hook_adaptado}\n\nROTEIRO:\n${parsed.roteiro_adaptado}\n\nVISUAL: ${parsed.elementos_visuais}\n\nCTA: ${parsed.cta_final}`;
            } catch (e) { }
            setClonedScript(formattedScript);
            setStep(3);
            toast.success("Estrutura clonada e adaptada para Mestre nos Negócios!");
        } catch (e) {
            toast.error("Erro ao clonar.");
        } finally {
            setCloning(false);
        }
    };

    const lastUpdate = useMemo(() => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), []);

    return (
        <div className="space-y-6">
            {/* Radar Section */}
            {step === 1 && (
                <div className="mb-8 border-b border-gray-800 pb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-black text-white uppercase flex items-center gap-3"><span className="relative flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span></span> Radar de Tendências (Viral)</h4>
                        <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700 flex items-center gap-2">
                            <Clock className="w-3 h-3 text-gray-500" /> Atualizado às <span className="text-white font-mono font-bold">{lastUpdate}</span>
                        </span>
                    </div>

                    {/* Active Radar Feed */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {viralRadarFeed.map(video => (
                            <div key={video.id} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-red-500 transition-all duration-300 group shadow-lg hover:shadow-red-900/20 relative flex flex-col">
                                <div className={`aspect-[9/16] w-full ${video.thumbnailColor} relative bg-cover bg-center group-hover:scale-105 transition-transform duration-700`}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-300">
                                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20"><PlayCircle className="w-8 h-8 text-white" /></div>
                                    </div>

                                    {/* Platform Badge */}
                                    <div className="absolute top-3 left-3 flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 border border-white/10 backdrop-blur-md ${video.platform === 'TikTok' ? 'bg-black text-white' :
                                            video.platform === 'Instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                                                'bg-red-600 text-white'
                                            }`}>
                                            {video.platform}
                                        </span>
                                        {/* Linked Account Indicator */}
                                        <span className="bg-green-500/20 border border-green-500/30 text-green-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Conectado
                                        </span>
                                    </div>

                                    {/* Engagement Badge */}
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg animate-pulse">🔥 {video.engagement}</span>
                                    </div>



                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                        <div className="flex items-center gap-2 text-gray-300 text-xs mb-2"><Eye className="w-4 h-4" /> {video.views} visualizações</div>
                                        <p className="text-white font-bold text-lg leading-tight mb-4 drop-shadow-md line-clamp-2">"{video.hook}"</p>
                                        <Button onClick={() => handleSelectChampion(video)} className="w-full !py-3 !text-xs !bg-yellow-500 hover:!bg-yellow-400 text-black uppercase font-black tracking-wide shadow-xl flex items-center justify-center gap-2">
                                            <Cpu className="w-4 h-4" /> CLONAR ESTRUTURA
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 bg-red-900/10 p-6 rounded-xl border border-red-500/20">
                <div className="p-3 bg-red-500 rounded-lg shadow-lg shadow-red-500/20">
                    <Film className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white uppercase">Detector & Clonador Viral</h2>
                    <p className="text-red-300 text-sm">Espione concorrentes, extraia a estrutura validada e clone para o seu produto.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 border-l-4 border-l-red-500 bg-gray-800 relative overflow-hidden">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5 text-red-500" /> Passo 1: Detectar
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <label className="block text-xs font-bold text-gray-400 uppercase">Cole a URL Manualmente</label>
                            <div className="flex gap-2">
                                <input className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-red-500 outline-none text-sm" placeholder="https://tiktok.com/@..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
                            </div>
                            <Button onClick={handleAnalyze} isLoading={analyzing} className="w-full !bg-red-600 hover:!bg-red-500 font-bold" disabled={step > 1}>{analyzing ? 'Hackeando Algoritmo...' : 'ANALISAR ESTRUTURA'}</Button>
                        </div>
                    </Card>
                    {step >= 2 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className="p-6 border-l-4 border-l-yellow-500 bg-gray-800">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Cpu className="w-5 h-5 text-yellow-500" /> Passo 2: Clonar</h3>
                                <p className="text-gray-400 text-sm mb-4">A IA vai manter a estrutura viral mas reescrever tudo para vender o <strong>Mestre nos Negócios</strong>.</p>
                                <Button onClick={handleClone} isLoading={cloning} className="w-full !bg-yellow-500 hover:!bg-yellow-400 text-black font-black uppercase">CLONAR PARA MEU PRODUTO</Button>
                            </Card>
                        </motion.div>
                    )}
                </div>
                <div className="lg:col-span-2 space-y-6">
                    {step === 1 && !analyzing && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-xl p-10 bg-gray-900/30">
                            <Film className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-center font-medium">Cole uma URL ou selecione um vídeo do <span className="text-red-500 font-bold">Radar</span> acima.</p>
                        </div>
                    )}
                    {step >= 2 && analysisData && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <Card className="p-6 bg-gray-800 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">VÍDEO DETECTADO</div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-gray-900 p-3 rounded border border-gray-700"><p className="text-xs text-gray-500 uppercase font-bold">Views Estimados</p><p className="text-xl font-black text-white">{analysisData.metrics.views}</p></div>
                                    <div className="bg-gray-900 p-3 rounded border border-gray-700"><p className="text-xs text-gray-500 uppercase font-bold">Padrão Visual</p><p className="text-xs text-white">{analysisData.visualPattern}</p></div>
                                </div>
                                <div className="space-y-3">
                                    <div className="p-3 bg-red-900/10 border border-red-500/20 rounded-lg"><span className="text-red-400 font-bold text-xs">HOOK ORIGINAL:</span><p className="text-white text-sm mt-1 italic">"{analysisData.originalHook}"</p></div>
                                    <div className="p-3 bg-gray-900 border border-gray-700 rounded-lg"><span className="text-gray-500 font-bold text-xs">ROTEIRO RESUMIDO:</span><p className="text-gray-300 text-sm mt-1">{analysisData.originalScript}</p></div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                    {step === 3 && clonedScript && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className="p-6 bg-gray-800 border border-green-500/30 shadow-2xl shadow-green-900/20">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><CheckCircle className="w-6 h-6 text-green-500" /> Clone Bem-Sucedido!</h3>
                                <div className="bg-black/40 p-4 rounded-xl border border-green-500/20 font-mono text-sm text-green-300 mb-6 whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">{clonedScript}</div>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <Button onClick={() => { navigator.clipboard.writeText(clonedScript); toast.success("Copiado!"); }} variant="secondary" className="flex-1"><Copy className="w-4 h-4 mr-2" /> Copiar Texto</Button>
                                    <Button onClick={() => onTransferToUGC(clonedScript)} className="flex-[2] !bg-purple-600 hover:!bg-purple-500 font-bold uppercase shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"><Rocket className="w-5 h-5" /> Enviar para Máquina UGC (Produzir Agora)</Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};
