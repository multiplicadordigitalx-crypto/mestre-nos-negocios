
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Film, User, PlayCircle, Download, Wand2, RefreshCw, Trash2, Rocket, Share2 } from '../../../components/Icons'; // Assuming icons exist
import { StudioService } from '../../../services/StudioService';
import { transactionService } from '../../../services/transactionMockService';
import toast from 'react-hot-toast';

export const NexusStudioTab: React.FC = () => {
    const navigate = useNavigate();
    // Actors State initialized from Service
    const [actors, setActors] = useState(StudioService.getAvailableActors());
    const [selectedActor, setSelectedActor] = useState(actors[0]?.id);
    const [productName, setProductName] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [availableProducts, setAvailableProducts] = useState<{ name: string, targetAudience: string }[]>([]);
    const [videoFormat, setVideoFormat] = useState<'9:16' | '16:9'>('9:16');
    const [videoDuration, setVideoDuration] = useState<'short_reel' | 'long_testimonial'>('short_reel');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedVideo, setGeneratedVideo] = useState<any>(null); // Replace any with VideoResult type
    const [scriptPreview, setScriptPreview] = useState('');

    useEffect(() => {
        setAvailableProducts(transactionService.getAvailableProducts());
    }, []);

    const handleGenerate = async () => {
        if (!productName || !targetAudience) return toast.error("Preencha os detalhes do produto");

        setIsGenerating(true);
        try {
            const result = await StudioService.generateUGCVideo({
                scriptTopic: 'Testimonial',
                productName,
                targetAudience,
                durationContext: videoDuration,
                format: videoFormat,
                actorType: actors.find(a => a.id === selectedActor)?.gender as any || 'any'
            });

            setGeneratedVideo(result);
            setScriptPreview(result.script);
            toast.success("Vídeo gerado com sucesso! (Simulação)");
        } catch (error) {
            toast.error("Erro ao gerar vídeo.");
        } finally {
            setIsGenerating(false);
        }
    }


    const handleDeleteActor = (e: React.MouseEvent, actorId: string) => {
        e.stopPropagation();
        // Removed confirm for reliability in this environment
        const updatedList = actors.filter(a => a.id !== actorId);
        setActors(updatedList);

        StudioService.removeCustomActor(actorId);

        if (selectedActor === actorId) {
            setSelectedActor(updatedList[0]?.id || '');
        }
        toast.success('Ator excluído.');
    };

    const handleCreatePage = () => {
        toast.loading("Redirecionando para o Construtor IA...", { duration: 1500 });
        setTimeout(() => {
            navigate(`/tools/funnels?tab=builder&product=${encodeURIComponent(productName)}`);
        }, 1500);
    };

    const handleDistribute = () => {
        toast.success(`Distribuição agendada para: ${productName} (Simulação)`);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            {/* LEFT: Configuration */}
            <div className="col-span-1 lg:col-span-5 space-y-8">
                <Card className="p-6 border-l-4 border-l-brand-primary">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Film className="w-6 h-6 text-brand-primary" /> Nexus Studio
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs text-gray-400 font-bold uppercase block">1. Escolha o Apresentador (Base Actor)</label>
                                <label className="text-xs bg-brand-primary/20 text-brand-primary px-2 py-1 rounded cursor-pointer hover:bg-brand-primary/30 transition-colors">
                                    + Upload Base
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const url = URL.createObjectURL(file);
                                                const newActor = {
                                                    id: `custom_${Date.now()}`,
                                                    name: file.name.split('.')[0],
                                                    style: 'Custom Upload',
                                                    gender: 'any',
                                                    image: 'https://via.placeholder.com/150/000000/FFFFFF?text=VIDEO', // Placeholder for now
                                                    format: '9:16',
                                                    videoUrl: url
                                                };
                                                StudioService.addCustomActor(newActor);
                                                // Update State
                                                const updated = StudioService.getAvailableActors();
                                                setActors([...updated]);
                                                setSelectedActor(newActor.id);
                                                toast.success('Ator adicionado com sucesso!');
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {actors.map(actor => (
                                    <div
                                        key={actor.id}
                                        onClick={() => setSelectedActor(actor.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 relative group ${selectedActor === actor.id ? 'bg-brand-primary/10 border-brand-primary' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-800 bg-cover bg-center border border-gray-600" style={{ backgroundImage: `url(https://i.pravatar.cc/150?u=${actor.id})` }}></div>
                                        <button
                                            type="button"
                                            onClick={(e) => handleDeleteActor(e, actor.id)}
                                            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:bg-black/50 rounded-full z-20 transition-all opacity-0 group-hover:opacity-100"
                                            title="Excluir Ator"
                                        >
                                            <Trash2 className="w-4 h-4 pointer-events-none" />
                                        </button>
                                        <div>
                                            <p className={`text-sm font-bold ${selectedActor === actor.id ? 'text-white' : 'text-gray-300'}`}>{actor.name}</p>
                                            <p className="text-[10px] text-gray-500">{actor.style}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-800">
                            <label className="text-xs text-gray-400 font-bold uppercase mb-3 block">2. Contexto do Vídeo</label>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Produto / Oferta</label>
                                    <select
                                        value={productName}
                                        onChange={e => {
                                            const selected = availableProducts.find(p => p.name === e.target.value);
                                            setProductName(e.target.value);
                                            if (selected) setTargetAudience(selected.targetAudience);
                                        }}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-primary outline-none"
                                    >
                                        <option value="">Selecione um Produto...</option>
                                        {availableProducts.map(p => (
                                            <option key={p.name} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <Input label="Público Alvo" placeholder="Ex: Executivos que viajam" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} />

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Formato</label>
                                        <select
                                            value={videoFormat}
                                            onChange={e => setVideoFormat(e.target.value as any)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white outline-none"
                                        >
                                            <option value="9:16">Vertical (9:16)</option>
                                            <option value="16:9">Horizontal (16:9)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Duração</label>
                                        <select
                                            value={videoDuration}
                                            onChange={e => setVideoDuration(e.target.value as any)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white outline-none"
                                        >
                                            <option value="short_reel">30-45s (Reels)</option>
                                            <option value="long_testimonial">60s+ (Depoimento)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        isLoading={isGenerating}
                        className="w-full !py-4 text-base font-black uppercase tracking-wider !bg-brand-primary hover:!bg-brand-primary/90 text-black shadow-lg shadow-brand-primary/20"
                    >
                        <Wand2 className="w-4 h-4 mr-2" /> Gerar Vídeo 60s
                    </Button>
                </Card>
            </div>

            {/* RIGHT: Preview & Result */}
            <div className="col-span-1 lg:col-span-7">
                {
                    generatedVideo ? (
                        <Card className="p-0 overflow-hidden border border-gray-700 h-full flex flex-col md:flex-row bg-black relative" >
                            {/* Video Player Area */}
                            < div className="flex-1 bg-black relative flex items-center justify-center min-h-[400px]" >
                                {/* In a real app, this would be a <video> tag with the generated URL */}
                                < div className="absolute inset-0 bg-cover bg-center opacity-50 blur-sm" style={{
                                    backgroundImage: `url(${generatedVideo.thumbnail
                                        })`
                                }}></div>
                                <video
                                    src={generatedVideo.url}
                                    controls
                                    className="relative z-10 max-h-[500px] w-auto shadow-2xl rounded-lg border border-white/10"
                                    poster={generatedVideo.thumbnail}
                                />

                                <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur px-3 py-1 rounded text-xs text-white border border-white/10 font-bold">
                                    {generatedVideo.duration}s • HD
                                </div>
                            </div>

                            {/* Details Side */}
                            <div className="w-full md:w-80 bg-gray-900 p-6 border-l border-gray-800 flex flex-col">
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2"><CheckCircleIcon className="text-green-500" /> Renderizado</h4>

                                <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Script Gerado (Gemini)</p>
                                    <p className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">{scriptPreview}</p>
                                </div>

                                <div className="mt-auto space-y-3">
                                    <Button variant="secondary" className="w-full !bg-gray-800 text-white border-gray-600 hover:!bg-gray-700">
                                        <RefreshCw className="w-4 h-4 mr-2" /> Gerar Variação
                                    </Button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button onClick={handleCreatePage} className="w-full !bg-purple-600 hover:!bg-purple-500 text-white font-bold text-xs">
                                            <Rocket className="w-3 h-3 mr-2" /> Criar Página
                                        </Button>
                                        <Button onClick={handleDistribute} className="w-full !bg-blue-600 hover:!bg-blue-500 text-white font-bold text-xs">
                                            <Share2 className="w-3 h-3 mr-2" /> Distribuir
                                        </Button>
                                    </div>
                                    <Button className="w-full !bg-green-600 hover:!bg-green-500 text-white font-bold">
                                        <Download className="w-4 h-4 mr-2" /> Baixar MP4
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="h-full rounded-2xl border-2 border-dashed border-gray-800 bg-gray-900/30 flex flex-col items-center justify-center text-gray-500 gap-4 min-h-[400px]">
                            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center animate-pulse">
                                <Film className="w-10 h-10 text-gray-600" />
                            </div>
                            <p className="font-medium">Configure os parâmetros à esquerda para iniciar o Nexus Studio.</p>
                            <p className="text-xs text-gray-600 max-w-sm text-center">Nossa tecnologia "Base Actor + LipSync" permite criar vídeos de longa duração (até 5min) sem perda de consistência facial.</p>
                        </div>
                    )}
            </div>
        </div>
    );
};

const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg className={`w - 5 h - 5 ${className} `} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);
