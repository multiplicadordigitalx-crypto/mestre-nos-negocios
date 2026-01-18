
import React, { useState } from 'react';
import Card from '../../../components/Card';
import { Activity, Filter, LogOut, MousePointer } from '../../../components/Icons';

export const AnalyticsTab: React.FC = () => {
    const [heatmapView, setHeatmapView] = useState<'clicks' | 'scroll'>('clicks');

    const metrics = {
        bounceRate: { 
            mobile: { val: '65%', status: 'warning' }, 
            desktop: { val: '42%', status: 'good' }, 
            source: 'Ads' 
        },
        avgTime: '4m 12s',
        microConversions: [
            { label: 'Clicou em "Garantia"', count: 1420 },
            { label: 'Expandiu FAQ', count: 890 },
            { label: 'Assistiu Vídeo (Play)', count: 3200 },
            { label: 'Copiou Pix', count: 450 }
        ],
        exitRates: [
            { section: 'Headline', rate: '12%' },
            { section: 'VSL (Vídeo)', rate: '8%' },
            { section: 'Preço (Oferta)', rate: '45%' },
            { section: 'Checkout', rate: '22%' }
        ]
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 border-l-4 border-l-blue-500 bg-gray-800">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Tempo Médio na Página</p>
                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                        {metrics.avgTime} <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-normal">+12%</span>
                    </h3>
                </Card>
                <Card className="p-4 border-l-4 border-l-red-500 bg-gray-800">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Bounce Rate (Mobile)</p>
                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                        {metrics.bounceRate.mobile.val} <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-normal font-sans">Alto</span>
                    </h3>
                </Card>
                <Card className="p-4 border-l-4 border-l-green-500 bg-gray-800">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Bounce Rate (Desktop)</p>
                    <h3 className="text-2xl font-black text-white">{metrics.bounceRate.desktop.val}</h3>
                </Card>
                <Card className="p-4 border-l-4 border-l-purple-500 bg-gray-800">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Scroll Depth (75%)</p>
                    <h3 className="text-2xl font-black text-white">42% <span className="text-xs font-normal text-gray-500">dos users</span></h3>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="p-6 bg-gray-800 h-full border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-orange-500"/> Heatmaps & Comportamento
                            </h3>
                            <div className="flex bg-gray-900 rounded p-1">
                                <button 
                                    onClick={() => setHeatmapView('clicks')}
                                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${heatmapView === 'clicks' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Cliques
                                </button>
                                <button 
                                    onClick={() => setHeatmapView('scroll')}
                                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${heatmapView === 'scroll' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Scroll
                                </button>
                            </div>
                        </div>

                        <div className="relative bg-gray-900 border border-gray-700 rounded-xl overflow-hidden aspect-[16/9] flex">
                            <div className="flex-1 p-4 flex flex-col gap-4 relative">
                                <div className="h-12 bg-gray-800 rounded w-full opacity-50"></div>
                                <div className="h-8 bg-gray-800 rounded w-3/4 mx-auto opacity-70"></div>
                                <div className="aspect-video bg-gray-800 rounded w-2/3 mx-auto opacity-60 relative group">
                                    {heatmapView === 'clicks' && (
                                        <div className="absolute inset-0 bg-red-500/20 blur-xl group-hover:bg-red-500/30 transition-all flex items-center justify-center">
                                            <span className="bg-red-600 text-white text-[10px] px-1 rounded font-bold">1200 cliques</span>
                                        </div>
                                    )}
                                </div>
                                <div className="h-10 bg-green-900 rounded w-1/3 mx-auto opacity-80 relative">
                                    {heatmapView === 'clicks' && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full blur-md"></div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-800 rounded w-full opacity-30"></div>
                                    <div className="h-3 bg-gray-800 rounded w-5/6 opacity-30"></div>
                                    <div className="h-3 bg-gray-800 rounded w-full opacity-30"></div>
                                </div>

                                {heatmapView === 'scroll' && (
                                    <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-yellow-500/10 to-blue-500/30 pointer-events-none">
                                        <div className="absolute top-1/4 right-2 text-[10px] text-red-400 font-bold">75% users</div>
                                        <div className="absolute top-1/2 right-2 text-[10px] text-yellow-400 font-bold">50% users</div>
                                        <div className="absolute bottom-10 right-2 text-[10px] text-blue-400 font-bold">20% users</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="p-6 bg-gray-800 border-gray-700">
                        <h3 className="text-sm font-bold text-white mb-4 uppercase flex items-center gap-2">
                            <Filter className="w-4 h-4 text-brand-primary"/> Funil de Conversão Real
                        </h3>
                        <div className="space-y-1 relative">
                            <div className="absolute left-3 top-2 bottom-6 w-0.5 bg-gray-700"></div>
                            
                            <div className="relative pl-8">
                                <div className="absolute left-1.5 top-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-gray-800 z-10"></div>
                                <p className="text-xs text-gray-400">Visualizações (Page View)</p>
                                <p className="text-lg font-bold text-white">12.500</p>
                            </div>
                            
                            <div className="relative pl-8 pt-4">
                                <div className="absolute left-1.5 top-5 w-3 h-3 bg-purple-500 rounded-full border-2 border-gray-800 z-10"></div>
                                <p className="text-xs text-gray-400">Leads (Checkout Iniciado)</p>
                                <p className="text-lg font-bold text-white">3.200 <span className="text-xs text-gray-500 font-normal">(25.6%)</span></p>
                            </div>

                            <div className="relative pl-8 pt-4">
                                <div className="absolute left-1.5 top-5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800 z-10"></div>
                                <p className="text-xs text-gray-400">Vendas Pagas (Purchase)</p>
                                <p className="text-lg font-bold text-green-400">480 <span className="text-xs text-gray-500 font-normal text-white">(15% do Checkout)</span></p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-gray-800 border-gray-700">
                        <h3 className="text-sm font-bold text-white mb-4 uppercase flex items-center gap-2">
                            <LogOut className="w-4 h-4 text-red-400"/> Taxa de Saída (Fuga)
                        </h3>
                        <div className="space-y-3">
                            {metrics.exitRates.map((exit, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <span className="text-xs text-gray-300">{exit.section}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${parseInt(exit.rate) > 40 ? 'bg-red-500' : 'bg-yellow-500'}`} 
                                                style={{width: exit.rate}}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-bold text-white w-8 text-right">{exit.rate}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            <Card className="p-6 bg-gray-800 border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MousePointer className="w-5 h-5 text-blue-400"/> Micro-Conversões & Eventos
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-900 text-gray-400 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3 rounded-l-lg">Evento</th>
                                <th className="px-6 py-3 text-right">Ocorrências</th>
                                <th className="px-6 py-3 text-right rounded-r-lg">Impacto na Venda</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {metrics.microConversions.map((mc, idx) => (
                                <tr key={idx} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-3 font-medium text-white">{mc.label}</td>
                                    <td className="px-6 py-3 text-right text-gray-300">{mc.count}</td>
                                    <td className="px-6 py-3 text-right">
                                        <span className={`text-xs px-2 py-1 rounded font-bold ${idx === 2 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {idx === 2 ? 'Alto' : 'Médio'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
