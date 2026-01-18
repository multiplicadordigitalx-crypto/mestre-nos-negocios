
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X as XIcon, ShieldAlert } from '../../../components/Icons';
import { AttackEvent } from '../types';

export const SecurityDetailModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const [attacks, setAttacks] = useState<AttackEvent[]>([]);
    const [activeTab, setActiveTab] = useState<'map' | 'list' | 'rules'>('map');
    
    // Simulate incoming traffic
    useEffect(() => {
        if (!isOpen) return;
        
        // UPDATED: Slower attack simulation (3s instead of 0.8s)
        const interval = setInterval(() => {
            const types: ('success' | 'blocked' | 'attack')[] = ['success', 'success', 'success', 'blocked', 'attack'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            const newAttack: AttackEvent = {
                id: Date.now(),
                // Random coords constrained roughly to world map visual
                lat: Math.random() * 80 + 10, 
                lng: Math.random() * 90 + 5,
                type,
                ip: `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.X`,
                location: ['São Paulo', 'New York', 'London', 'Moscow', 'Beijing', 'Rio de Janeiro'][Math.floor(Math.random() * 6)],
                timestamp: Date.now()
            };

            setAttacks(prev => [newAttack, ...prev].slice(0, 15)); // Keep last 15
        }, 3000);

        return () => clearInterval(interval);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] p-4">
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-900 w-full max-w-6xl rounded-2xl border border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.1)] flex flex-col h-[85vh] overflow-hidden"
            >
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                            <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse"/>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-wider">Centro de Comando de Segurança</h3>
                            <p className="text-xs text-gray-500 font-mono">WAF ATIVO • MONITORAMENTO GLOBAL • 24/7</p>
                        </div>
                    </div>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-500 hover:text-white"/></button>
                </div>

                <div className="flex border-b border-gray-800">
                    <button onClick={() => setActiveTab('map')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'map' ? 'bg-gray-800 text-white border-b-2 border-red-500' : 'text-gray-500 hover:text-gray-300'}`}>Mapa de Ameaças (Live)</button>
                    <button onClick={() => setActiveTab('list')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'list' ? 'bg-gray-800 text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>Log de Auditoria</button>
                    <button onClick={() => setActiveTab('rules')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'rules' ? 'bg-gray-800 text-white border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-300'}`}>Regras de Firewall</button>
                </div>

                <div className="flex-1 bg-gray-900 relative overflow-hidden">
                    {activeTab === 'map' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-no-repeat bg-center bg-contain opacity-20 grayscale">
                            <div className="absolute top-4 left-4 z-10 space-y-2">
                                <div className="bg-black/50 p-3 rounded-lg border border-gray-700 backdrop-blur-md">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-2">Legenda</p>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-300"><span className="w-2 h-2 rounded-full bg-green-500"></span> Acesso Permitido</div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-300"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Tentativa Falha</div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-300"><span className="w-2 h-2 rounded-full bg-red-500"></span> Ataque Bloqueado</div>
                                </div>
                                <div className="bg-black/50 p-3 rounded-lg border border-gray-700 backdrop-blur-md">
                                    <p className="text-2xl font-black text-white">{attacks.length * 142}</p>
                                    <p className="text-[9px] text-gray-400 uppercase">Eventos hoje</p>
                                </div>
                            </div>

                            {/* Threat Visualizer */}
                            <AnimatePresence>
                                {attacks.map(attack => (
                                    <motion.div
                                        key={attack.id}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 3 }}
                                        transition={{ duration: 0.5 }}
                                        style={{ top: `${attack.lat}%`, left: `${attack.lng}%` }}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                    >
                                        <div className={`w-3 h-3 rounded-full ${
                                            attack.type === 'success' ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 
                                            attack.type === 'blocked' ? 'bg-yellow-500 shadow-[0_0_15px_#eab308]' : 
                                            'bg-red-600 shadow-[0_0_20px_#dc2626]'
                                        }`}></div>
                                        {attack.type !== 'success' && (
                                            <div className="absolute top-4 left-4 bg-black/80 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap border border-red-500/30">
                                                {attack.ip} - {attack.location}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {activeTab === 'list' && (
                        <div className="p-6 overflow-y-auto h-full custom-scrollbar">
                            <table className="w-full text-left text-xs text-gray-400">
                                <thead className="text-gray-500 uppercase font-bold border-b border-gray-800">
                                    <tr>
                                        <th className="py-3">Timestamp</th>
                                        <th className="py-3">IP Address</th>
                                        <th className="py-3">Localização</th>
                                        <th className="py-3">Ação</th>
                                        <th className="py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {attacks.map(attack => (
                                        <tr key={attack.id} className="hover:bg-gray-800/50">
                                            <td className="py-3 font-mono">{new Date(attack.timestamp).toLocaleTimeString()}</td>
                                            <td className="py-3 font-mono text-white">{attack.ip}</td>
                                            <td className="py-3">{attack.location}</td>
                                            <td className="py-3">{attack.type === 'success' ? 'Login' : attack.type === 'blocked' ? 'Senha Incorreta' : 'SQL Injection Attempt'}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                    attack.type === 'success' ? 'bg-green-900/30 text-green-400' : 
                                                    attack.type === 'blocked' ? 'bg-yellow-900/30 text-yellow-400' : 
                                                    'bg-red-900/30 text-red-400'
                                                }`}>
                                                    {attack.type}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'rules' && (
                         <div className="p-6 overflow-y-auto h-full custom-scrollbar space-y-4">
                             <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                 <div>
                                     <h4 className="font-bold text-white text-sm">Bloqueio de Tor Exit Nodes</h4>
                                     <p className="text-xs text-gray-500">Impede conexões anônimas da rede Tor.</p>
                                 </div>
                                 <div className="w-10 h-5 bg-green-600 rounded-full relative cursor-pointer"><div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div></div>
                             </div>
                             <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                 <div>
                                     <h4 className="font-bold text-white text-sm">Rate Limiting (API)</h4>
                                     <p className="text-xs text-gray-500">Limita 100 requisições/min por IP.</p>
                                 </div>
                                 <div className="w-10 h-5 bg-green-600 rounded-full relative cursor-pointer"><div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div></div>
                             </div>
                             <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                 <div>
                                     <h4 className="font-bold text-white text-sm">Geo-Block (Países de Alto Risco)</h4>
                                     <p className="text-xs text-gray-500">Bloqueia tráfego da Rússia, Coreia do Norte e Irã.</p>
                                 </div>
                                 <div className="w-10 h-5 bg-gray-700 rounded-full relative cursor-pointer"><div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1"></div></div>
                             </div>
                         </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
