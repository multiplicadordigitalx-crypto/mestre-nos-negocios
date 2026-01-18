
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../components/Card';
import { Globe, Eye, TrendingUp, AlertTriangle, Rocket, PlusCircle, X as XIcon, Link as LinkIcon, ShoppingBag, CheckCircle, RefreshCw, ShieldCheck, Search, Brain } from '../../../components/Icons';
import { PageItem } from '../types';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { LeadModeModal } from '../modals/FunnelsModals';
import { getAppProducts } from '../../../services/mockFirebase';
import { AppProduct } from '../../../types';
import toast from 'react-hot-toast';

interface Props {
    activePages: PageItem[];
    isAdmin?: boolean;
}

export const OverviewTab: React.FC<Props> = ({ activePages: initialPages, isAdmin = false }) => {
    const [pages, setPages] = useState<PageItem[]>(initialPages);
    const [showLeadMode, setShowLeadMode] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form States
    const [products, setProducts] = useState<AppProduct[]>([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [externalUrl, setExternalUrl] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStep, setVerificationStep] = useState<'input' | 'checking' | 'result'>('input');
    const [verificationStatus, setVerificationStatus] = useState<{
        hasPixel: boolean;
        hasDomain: boolean;
        isOptimized: boolean;
    }>({ hasPixel: false, hasDomain: false, isOptimized: false });

    useEffect(() => {
        setPages(initialPages);
        getAppProducts().then(setProducts);
    }, [initialPages]);

    const handleStartVerification = () => {
        if (!selectedProductId || !externalUrl) {
            return toast.error("Selecione o produto e informe a URL.");
        }

        setVerificationStep('checking');
        setIsVerifying(true);

        // Simulando Verificação Profunda do Nexus
        setTimeout(() => {
            const selectedProd = products.find(p => p.id === selectedProductId);
            // Simula detecção: Se for um produto com mais de 10 vendas, assumimos que já tem domínio no sistema
            const hasSystemDomain = (selectedProd?.stats.totalSales || 0) > 10;

            setVerificationStatus({
                hasPixel: Math.random() > 0.3, // 70% chance de ter pixel
                hasDomain: hasSystemDomain,
                isOptimized: Math.random() > 0.5
            });

            setVerificationStep('result');
            setIsVerifying(false);
        }, 2500);
    };

    const handleFinalizeIntegration = () => {
        const urlClean = externalUrl.replace('https://', '').replace('http://', '').split('/')[0];
        const newPage: PageItem = {
            name: `Externo: ${urlClean}`,
            url: urlClean,
            type: 'Site Externo',
            status: 'active'
        };

        setPages([newPage, ...pages]);
        setIsAddModalOpen(false);
        setVerificationStep('input');
        setSelectedProductId('');
        setExternalUrl('');

        toast.success("Site integrado ao Ecossistema Mestre!", { duration: 5000 });
        toast("Otimizador 24h: Iniciando leitura de métricas da nova página...", { icon: '🤖', duration: 6000 });
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gray-800 border-l-4 border-l-purple-500 h-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-500" /> Páginas e Sites Ativos
                    </h3>

                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="!py-1.5 !px-3 !text-[10px] !bg-purple-600 hover:!bg-purple-500 font-bold border border-purple-400/30 shadow-lg"
                    >
                        <PlusCircle className="w-3 h-3 mr-1" /> ADICIONAR EXISTENTE
                    </Button>
                </div>

                <div className="space-y-3">
                    {pages.map((pg, i) => (
                        <div key={i} className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-700 hover:border-purple-500/30 transition-all group">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-white text-sm font-bold">{pg.name}</p>
                                    {pg.type.includes('Externo') && <span className="text-[8px] bg-blue-900/40 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">NEXUS SYNC</span>}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <a href={`https://${pg.url}`} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">{pg.url}</a>
                                    <button onClick={() => setShowLeadMode(true)} className="text-gray-500 hover:text-white" title="Modo Lead"><Eye className="w-3 h-3" /></button>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-400 mb-1 block">{pg.type}</span>
                                <span className={`text-[10px] font-bold ${pg.status === 'active' ? 'text-green-400' : pg.status === 'archived' ? 'text-gray-500' : 'text-yellow-400'}`}>
                                    ● {pg.status === 'archived' ? 'ARQUIVADO' : pg.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="p-6 bg-gray-800 border-l-4 border-l-green-500 h-full">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" /> Performance do Funil</h3>
                <div className="space-y-4">
                    <div className="relative pt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Visitantes (12k)</span>
                            <span>Checkout (2.4k)</span>
                            <span>Venda (890)</span>
                        </div>
                        <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden flex">
                            <div className="bg-blue-500 h-full w-[20%]" title="Visitante -> Checkout"></div>
                            <div className="bg-green-500 h-full w-[37%]" title="Checkout -> Venda"></div>
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-2">Funil de Conversão Global: <span className="text-white font-bold">7.4%</span></p>
                    </div>
                    <div className="bg-gray-900 p-3 rounded border border-gray-700">
                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Alertas do Otimizador</p>
                        <p className="text-sm text-yellow-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Checkout com abandono alto (60%)</p>
                        <p className="text-xs text-gray-500 mt-1">Ação sugerida: A IA criou uma nova página de recuperação.</p>
                    </div>

                    <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30 animate-pulse">
                        <p className="text-xs text-blue-300 uppercase font-bold mb-1 flex items-center gap-1">
                            <Rocket className="w-3 h-3" /> Monitoramento Autônomo Ativo
                        </p>
                        <p className="text-[10px] text-gray-400">Escaneando tráfego externo e interno para otimização de ROAS.</p>
                    </div>
                </div>
            </Card>

            <LeadModeModal isOpen={showLeadMode} onClose={() => setShowLeadMode(false)} title="Página Vendas Exemplo" />

            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150] p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-800 w-full max-w-xl rounded-2xl border border-purple-500/30 shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <LinkIcon className="w-6 h-6 text-purple-400" /> Integrar Site/Página Existente
                                </h3>
                                <button onClick={() => { setIsAddModalOpen(false); setVerificationStep('input'); }}><XIcon className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                            </div>

                            <div className="p-6 flex-1">
                                {verificationStep === 'input' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <p className="text-sm text-gray-400">
                                            O Nexus AI irá assumir a gestão desta página, monitorar a conversão e decidir se deve escalar o tráfego ou eliminar a página se não performar.
                                        </p>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">1. Vincular a qual Produto?</label>
                                            <select
                                                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-purple-500 transition-colors"
                                                value={selectedProductId}
                                                onChange={e => setSelectedProductId(e.target.value)}
                                            >
                                                <option value="">Selecione um produto...</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">2. URL do Site (Domínio Principal)</label>
                                            <div className="flex gap-2">
                                                <div className="bg-gray-700 px-3 py-3 rounded-xl border border-gray-600 text-gray-400 text-sm">https://</div>
                                                <input
                                                    className="flex-1 bg-gray-900 border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-purple-500 transition-colors"
                                                    placeholder="www.seusite.com.br"
                                                    value={externalUrl}
                                                    onChange={e => setExternalUrl(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <Button onClick={handleStartVerification} className="w-full !py-4 font-black uppercase !bg-purple-600 hover:!bg-purple-500 shadow-lg shadow-purple-900/30">
                                            VINCULAR E VALIDAR NO NEXUS
                                        </Button>
                                    </div>
                                )}

                                {verificationStep === 'checking' && (
                                    <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
                                        <RefreshCw className="w-16 h-16 text-purple-500 animate-spin mb-6" />
                                        <h4 className="text-xl font-bold text-white mb-2">Nexus Escaneando Ativos...</h4>
                                        <p className="text-gray-400 text-sm max-w-xs">
                                            Verificando instâncias de Pixel, SSL e redirecionamentos de checkout...
                                        </p>
                                    </div>
                                )}

                                {verificationStep === 'result' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="bg-gray-900 p-5 rounded-2xl border border-gray-700">
                                            <h4 className="text-white font-bold mb-4 border-b border-gray-800 pb-2">Diagnóstico de Integração</h4>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-400">Domínio em Sistema (DNS)</span>
                                                    {verificationStatus.hasDomain ? (
                                                        <span className="text-green-400 text-xs font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> OK</span>
                                                    ) : (
                                                        <span className="text-yellow-400 text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> NÃO ENCONTRADO</span>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-400">Mestre Pixel (Tracking)</span>
                                                    {verificationStatus.hasPixel ? (
                                                        <span className="text-green-400 text-xs font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> INSTALADO</span>
                                                    ) : (
                                                        <span className="text-red-400 text-xs font-bold flex items-center gap-1"><XIcon className="w-4 h-4" /> AUSENTE</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {(!verificationStatus.hasDomain || !verificationStatus.hasPixel) && (
                                            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl">
                                                <h5 className="text-blue-300 font-bold text-sm mb-2 flex items-center gap-2">
                                                    <Brain className="w-4 h-4" /> Orientação do Mestre:
                                                </h5>
                                                <ul className="text-xs text-gray-300 space-y-2">
                                                    {!verificationStatus.hasDomain && (
                                                        <li className="flex gap-2">
                                                            <span className="text-blue-400 font-bold">•</span>
                                                            Acesse "Integrações {'>'} Domínios" e adicione sua Cloudflare/API para que eu possa gerenciar os subdomínios.
                                                        </li>
                                                    )}
                                                    {!verificationStatus.hasPixel && (
                                                        <li className="flex gap-2">
                                                            <span className="text-blue-400 font-bold">•</span>
                                                            Instale o script de rastreio Mestre no <code>&lt;head&gt;</code> do seu site para eu ler as métricas.
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="flex gap-3 pt-4">
                                            <Button variant="secondary" onClick={() => setVerificationStep('input')} className="flex-1">Refazer</Button>
                                            <Button
                                                onClick={handleFinalizeIntegration}
                                                className="flex-[2] !bg-green-600 hover:!bg-green-500 font-bold"
                                                disabled={!verificationStatus.hasPixel}
                                            >
                                                CONCLUIR INTEGRAÇÃO
                                            </Button>
                                        </div>
                                        {!verificationStatus.hasPixel && (
                                            <p className="text-[10px] text-center text-red-400 italic">O Pixel é obrigatório para que a IA possa ler a conversão.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
