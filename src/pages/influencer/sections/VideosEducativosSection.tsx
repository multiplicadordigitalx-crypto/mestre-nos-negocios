
import React from 'react';
import Card from '../../../components/Card';
import { PlayCircle, Star } from '../../../components/Icons';

export const VideosEducativosSection: React.FC = () => {
    const videos = [
        { id: 1, title: 'Como Criar um Perfil Viral no TikTok', duration: '12:45', rating: 5, views: '12k' },
        { id: 2, title: 'Estratégia de Venda Direta no Direct', duration: '08:20', rating: 4, views: '8k' },
        { id: 3, title: 'Domine o Tráfego Orgânico em 2026', duration: '15:10', rating: 5, views: '22k' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white">Treinamento para Parceiros</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(vid => (
                    <Card key={vid.id} className="p-0 overflow-hidden bg-gray-800 border-gray-700 group hover:border-brand-primary transition-all">
                        <div className="h-40 bg-black flex items-center justify-center relative cursor-pointer"><div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-brand-primary group-hover:text-black transition-all"><PlayCircle className="w-6 h-6"/></div><div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-mono text-white">{vid.duration}</div></div>
                        <div className="p-4">
                            <h4 className="font-bold text-white text-sm line-clamp-1">{vid.title}</h4>
                            <div className="flex justify-between items-center mt-3 text-[10px] text-gray-500 uppercase font-black"><span>{vid.views} views</span><div className="flex text-yellow-500">{'★'.repeat(vid.rating)}</div></div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
