
import React from 'react';

export const InfrastructureDetail: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <h4 className="text-gray-400 text-xs font-bold uppercase mb-2">CPU Utilization</h4>
                    <div className="h-32 flex items-end gap-1">
                        {[30, 45, 32, 60, 75, 40, 35, 50, 45, 30].map((h, i) => (
                            <div key={i} className="flex-1 bg-blue-500/20 rounded-t overflow-hidden relative group">
                                <div className="absolute bottom-0 w-full bg-blue-500 transition-all duration-500" style={{height: `${h}%`}}></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <h4 className="text-gray-400 text-xs font-bold uppercase mb-2">Memory Usage</h4>
                    <div className="h-32 flex items-center justify-center relative">
                        <div className="w-24 h-24 rounded-full border-4 border-gray-700 border-t-purple-500 flex items-center justify-center">
                            <span className="text-xl font-bold text-white">42%</span>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <h4 className="text-gray-400 text-xs font-bold uppercase mb-2">Network I/O</h4>
                    <p className="text-2xl font-black text-white mb-1">1.2 GB/s</p>
                    <p className="text-xs text-green-400">Peak: 2.4 GB/s</p>
                </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <h4 className="text-white font-bold mb-4">Serviços Conectados</h4>
                <table className="w-full text-left text-xs">
                    <thead className="text-gray-500 bg-gray-900/50">
                        <tr>
                            <th className="p-3">Serviço</th>
                            <th className="p-3">Região</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Latência</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        <tr>
                            <td className="p-3">App Server (Node)</td>
                            <td className="p-3">us-central1</td>
                            <td className="p-3 text-green-400">Healthy</td>
                            <td className="p-3">24ms</td>
                        </tr>
                        <tr>
                            <td className="p-3">Worker Queue</td>
                            <td className="p-3">us-central1</td>
                            <td className="p-3 text-green-400">Processing</td>
                            <td className="p-3">-</td>
                        </tr>
                        <tr>
                            <td className="p-3">CDN (Assets)</td>
                            <td className="p-3">Global</td>
                            <td className="p-3 text-green-400">Cached</td>
                            <td className="p-3">12ms</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};
