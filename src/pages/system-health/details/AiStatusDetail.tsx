
import React from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { Brain, Image, Film, Mic } from '../../../components/Icons';

interface AiIntegration {
    id: string;
    name: string;
    status: string;
    latency: string;
    uptime: string;
    type: string[];
    api: string;
}

export const AiStatusDetail: React.FC<{ metrics: any[], aiIntegrations: AiIntegration[] }> = ({ metrics, aiIntegrations }) => {
    return (
        <div className="space-y-6">
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {metrics.map((m, idx) => (
                    <div key={idx} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                        <span className="text-gray-400 text-xs font-bold uppercase">{m.label}</span>
                        <div className="flex justify-between items-center mt-1">
                            <span className={`text-2xl font-black ${m.status === 'warning' ? 'text-yellow-400' : 'text-white'}`}>{m.value}{m.unit}</span>
                            <StatusBadge status={m.status} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Comprehensive List of Integrated AIs */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4 bg-gray-900/50 border-b border-gray-700">
                    <h4 className="text-white font-bold flex items-center gap-2">
                        <Brain className="w-5 h-5 text-brand-primary"/> Provedores Conectados (Hub de IA)
                    </h4>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aiIntegrations.map((ai) => (
                        <div key={ai.id} className="bg-gray-900 p-4 rounded-lg border border-gray-600 hover:border-brand-primary/50 transition-colors group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-800 rounded-lg border border-gray-700 group-hover:bg-brand-primary/10 transition-colors">
                                        {ai.type.includes('image') ? <Image className="w-5 h-5 text-pink-400"/> :
                                         ai.type.includes('video') ? <Film className="w-5 h-5 text-green-400"/> :
                                         ai.type.includes('audio') ? <Mic className="w-5 h-5 text-blue-400"/> :
                                         <Brain className="w-5 h-5 text-brand-primary"/>}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{ai.name}</p>
                                        <p className="text-[10px] text-gray-500">{ai.api}</p>
                                    </div>
                                </div>
                                <span className={`w-2 h-2 rounded-full ${ai.status === 'online' ? 'bg-green-500 animate-pulse' : ai.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                            </div>
                            
                            <div className="space-y-2 border-t border-gray-800 pt-2 mt-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Latência</span>
                                    <span className="text-white font-mono">{ai.latency}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Uptime (24h)</span>
                                    <span className={`font-bold ${parseFloat(ai.uptime) > 99 ? 'text-green-400' : 'text-yellow-400'}`}>{ai.uptime}</span>
                                </div>
                                <div className="flex gap-1 mt-1">
                                    {ai.type.map((t: string) => (
                                        <span key={t} className="text-[9px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded border border-gray-700 uppercase">{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
