
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { Activity, TrendingUp, BarChart3, Instagram, Tiktok, Youtube, Zap, Brain, Trophy, DollarSign, Eye, PlayCircle } from '@/components/Icons';
import { Influencer } from '@/types';
import { ConnectSocialModal } from '../modals/ConnectSocialModal';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export const VisaoGeralSection: React.FC<{ influencer: Influencer; setActiveTab: (tab: any) => void }> = ({ influencer, setActiveTab }) => {
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

    if (!influencer) return <div className="p-10 text-center"><LoadingSpinner /></div>;

    const myProducts = Array.isArray(influencer?.products) ? influencer.products : [];
    const totalClicks = myProducts.reduce((acc, p) => acc + (p.clicks || 0), 0);
    const totalSales = myProducts.reduce((acc, p) => acc + (p.sales || 0), 0);
    const totalCommissions = influencer?.totalEarnings || 0;

    const topPosts = [
        { id: 1, title: "Faturando com IAs em 2026", views: "245k", sales: 42, platform: 'TikTok', color: 'bg-black' },
        { id: 2, title: "Como mudei de vida este mês", views: "128k", sales: 25, platform: 'Instagram', color: 'bg-pink-900' },
        { id: 3, title: "Review Mestre 50X", views: "85k", sales: 12, platform: 'YouTube', color: 'bg-red-900' },
    ];

    const handleOnConnect = (accData: any) => {
        // No futuro, isso enviaria para o backend real
        console.log("Nova conta conectada:", accData);
        // O modal já exibe o toast de sucesso
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900/40 to-gray-900 border border-blue-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-600/20 rounded-full text-blue-400 border border-blue-500/30">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg uppercase tracking-tight">Análise Nexus Pro Ativa</h3>
                        <p className="text-sm text-gray-300 max-w-lg mt-1">Conecte suas redes para rastrear cliques e receber sugestões de hooks virais personalizados para sua audiência.</p>
                    </div>
                </div>
                <Button
                    onClick={() => setIsConnectModalOpen(true)}
                    className="!bg-blue-600 hover:!bg-blue-500 font-bold shadow-lg shadow-blue-900/20 whitespace-nowrap"
                >
                    + Conectar Rede Social
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 border-l-4 border-l-green-500 bg-gray-800"><p className="text-gray-400 text-[10px] font-bold uppercase">Comissões Recebidas</p><h3 className="text-2xl font-black text-white mt-1">R$ {totalCommissions.toLocaleString('pt-BR')}</h3></Card>
                <Card className="p-5 border-l-4 border-l-blue-500 bg-gray-800"><p className="text-gray-400 text-[10px] font-bold uppercase">Vendas Realizadas</p><h3 className="text-2xl font-black text-white mt-1">{totalSales}</h3></Card>
                <Card className="p-5 border-l-4 border-l-yellow-500 bg-gray-800"><p className="text-gray-400 text-[10px] font-bold uppercase">Cliques Rastreados</p><h3 className="text-2xl font-black text-white mt-1">{totalClicks}</h3></Card>
                <Card className="p-5 border-l-4 border-l-purple-500 bg-gray-800"><p className="text-gray-400 text-[10px] font-bold uppercase">Rank Global</p><h3 className="text-2xl font-black text-white mt-1">#42</h3></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 bg-gray-800 border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-brand-primary" /> Performance dos seus Top Posts</h3>
                    <div className="space-y-4">
                        {topPosts.map(post => (
                            <div key={post.id} className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex justify-between items-center group hover:border-brand-primary transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-16 ${post.color} rounded-lg flex items-center justify-center`}><PlayCircle className="w-6 h-6 text-white/50" /></div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{post.title}</p>
                                        <p className="text-[10px] text-gray-500 uppercase">{post.platform} • {post.views} views</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-green-400 font-black text-sm">{post.sales} Vendas</p>
                                    <span className="text-[9px] text-gray-500 font-bold">ROI: 12.4x</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-brand-primary/10 to-purple-900/20 border border-brand-primary/30 p-6 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20"><Brain className="w-16 h-16 text-brand-primary" /></div>
                        <h3 className="text-brand-primary font-bold flex items-center gap-2 mb-2"><Zap className="w-4 h-4" /> Insight Nexus IA</h3>
                        <p className="text-xs text-gray-300 leading-relaxed italic">"Detectamos que vídeos com depoimento pessoal geram 40% mais conversão no seu TikTok. Use o 'Gerador de Roteiros UGC' para escalar."</p>
                        <Button onClick={() => setActiveTab('mestre_ia_partner')} className="w-full mt-4 !py-2 !text-[10px] font-black uppercase">Otimizar Agora</Button>
                    </div>
                    <Card className="p-5 bg-gray-800 border-gray-700 text-center">
                        <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                        <p className="text-white font-bold text-sm">Nível: Mestre</p>
                        <p className="text-[10px] text-gray-500 uppercase">Próximo Nível: Lenda (2.5k vendas)</p>
                        <div className="w-full bg-gray-900 h-1.5 rounded-full mt-3 overflow-hidden"><div className="bg-yellow-500 h-full w-[45%]"></div></div>
                    </Card>
                </div>
            </div>

            <ConnectSocialModal
                isOpen={isConnectModalOpen}
                onClose={() => setIsConnectModalOpen(false)}
                onConnect={handleOnConnect}
            />
        </div>
    );
};
