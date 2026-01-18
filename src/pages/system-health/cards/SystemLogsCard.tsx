
import React from 'react';
import Card from '../../../components/Card';
import { Terminal } from '../../../components/Icons';

export const SystemLogsCard: React.FC = () => {
    return (
        <Card className="lg:col-span-2 p-6 bg-gray-800 border-gray-700 h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-gray-400"/> Logs do Sistema
                </h3>
                <div className="flex gap-2">
                    <span className="text-xs bg-black/30 px-2 py-1 rounded text-gray-400">Filtrar: Todos</span>
                </div>
            </div>
            <div className="flex-1 bg-black/50 rounded-xl p-4 overflow-y-auto custom-scrollbar font-mono text-xs space-y-1.5 border border-gray-700/50">
                <div className="text-gray-500">[10:42:15] <span className="text-blue-400">INFO</span> Auto-scaling initiated for worker-pool-2</div>
                <div className="text-gray-500">[10:42:12] <span className="text-green-400">SUCCESS</span> Webhook processed: Hotmart ID #9821</div>
                <div className="text-gray-500">[10:41:55] <span className="text-blue-400">INFO</span> Gemini API Latency Spike detected (1200ms)</div>
                <div className="text-gray-500">[10:41:30] <span className="text-yellow-400">WARN</span> Storage usage nearing 80% capacity on bucket-assets</div>
                <div className="text-gray-500">[10:40:10] <span className="text-green-400">SUCCESS</span> Email batch sent (500 recipients)</div>
                <div className="text-gray-500">[10:38:45] <span className="text-blue-400">INFO</span> User login: admin@mestre.com from IP 192.168.1.1</div>
                <div className="text-gray-500">[10:35:22] <span className="text-red-400">ERROR</span> Failed to sync Kwai API (Timeout) - Retrying...</div>
                {[...Array(10)].map((_,i) => (
                    <div key={i} className="text-gray-600 opacity-50">[10:{30-i}:00] <span className="text-gray-500">DEBUG</span> Heartbeat check OK</div>
                ))}
            </div>
        </Card>
    );
};
