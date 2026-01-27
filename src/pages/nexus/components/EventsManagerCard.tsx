
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActivityIcon, AlertTriangle, CheckCircle, MessageCircle, Mail, ShieldCheck } from '../../../components/Icons';
import Card from '../../../components/Card';

const EventsManagerCard: React.FC = () => {
    // Mock State for Events
    const [events, setEvents] = useState([
        { id: 1, platform: 'Hotmart', type: 'PURCHASE_APPROVED', product: 'Mestre 15X', customer: 'João Silva', time: 'Há 2 min', status: 'success', action: 'Bot: Boas-vindas' },
        { id: 2, platform: 'Kiwify', type: 'PAYMENT_DENIED', product: 'Mentoria Elite', customer: 'Maria Oliveira', time: 'Há 5 min', status: 'warning', action: 'Bot: Recuperação' },
        { id: 3, platform: 'Kioto', type: 'CART_ABANDONED', product: 'Ebook Viral', customer: 'Carlos Tech', time: 'Há 12 min', status: 'warning', action: 'Email: Lista Recuperação' },
        { id: 4, platform: 'Hotmart', type: 'PURCHASE_APPROVED', product: 'Mestre 15X', customer: 'Ana Clara', time: 'Há 45 min', status: 'success', action: 'Bot: Boas-vindas' },
    ]);

    const [stats, setStats] = useState({
        processed: 1240,
        actions: 850,
        recovered: 15400
    });

    // Simulate Live Events
    useEffect(() => {
        const interval = setInterval(() => {
            const platforms = ['Hotmart', 'Kiwify', 'Kioto', 'Eduzz'];
            const types = [
                { type: 'PURCHASE_APPROVED', action: 'Bot: Boas-vindas', status: 'success' },
                { type: 'PAYMENT_DENIED', action: 'Bot: Recuperação + Email', status: 'warning' },
                { type: 'CART_ABANDONED', action: 'Email: Lista Recuperação', status: 'warning' },
                { type: 'SUBSCRIPTION_CANCELED', action: 'Nexus: Alerta Admin', status: 'critical' }
            ];

            const randomType = types[Math.floor(Math.random() * types.length)];
            const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
            const newEvent = {
                id: Date.now(),
                platform: randomPlatform,
                type: randomType.type,
                product: 'Mestre 15X',
                customer: `Cliente ${Math.floor(Math.random() * 1000)}`,
                time: 'Agora',
                status: randomType.status,
                action: randomType.action
            };

            setEvents(prev => [newEvent, ...prev].slice(0, 8)); // Keep last 8
            setStats(prev => ({
                processed: prev.processed + 1,
                actions: prev.actions + 1,
                recovered: randomType.type === 'PURCHASE_APPROVED' ? prev.recovered + 197 : prev.recovered
            }));

        }, 5000); // New event every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="bg-gray-900 border border-brand-primary/30 p-0 overflow-hidden relative shadow-lg">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/90 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <ActivityIcon className="w-5 h-5 text-purple-500 animate-pulse" /> Gerenciador de Eventos
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1">Nexus IA: Monitorando Webhooks (Hotmart, Kiwify, Kioto...)</p>
                </div>
                <span className="text-[10px] bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30 font-bold flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div> LISTENING
                </span>
            </div>

            <div className="p-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Eventos Proc.</p>
                        <p className="text-lg font-black text-white">{stats.processed}</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Ações Nexus</p>
                        <p className="text-lg font-black text-blue-400">{stats.actions}</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Recuperado</p>
                        <p className="text-lg font-black text-green-400">R$ {stats.recovered.toLocaleString()}</p>
                    </div>
                </div>

                {/* Live Feed */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                    <AnimatePresence initial={false}>
                        {events.map((evt) => (
                            <motion.div
                                key={evt.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center group hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg border ${evt.status === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-500' :
                                            evt.status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' :
                                                'bg-red-500/10 border-red-500/30 text-red-500'
                                        }`}>
                                        {evt.status === 'success' ? <CheckCircle className="w-4 h-4" /> :
                                            evt.status === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                                                <AlertTriangle className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-white">{evt.type}</span>
                                            <span className="text-[9px] bg-gray-900 px-1.5 py-0.5 rounded text-gray-400 border border-gray-700 uppercase">{evt.platform}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500">{evt.customer} • {evt.product}</p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-[10px] text-brand-primary font-bold flex items-center justify-end gap-1">
                                        {evt.action.includes('Bot') ? <MessageCircle className="w-3 h-3" /> :
                                            evt.action.includes('Email') ? <Mail className="w-3 h-3" /> :
                                                <ShieldCheck className="w-3 h-3" />}
                                        {evt.action}
                                    </div>
                                    <p className="text-[9px] text-gray-600">{evt.time}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </Card>
    );
};

export default EventsManagerCard;
