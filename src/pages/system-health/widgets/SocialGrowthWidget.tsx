
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Tiktok, Instagram, Facebook, Youtube } from '../../../components/Icons';
import Card from '../../../components/Card';
import { getAppProducts } from '../../../services/mockFirebase';
import { AppProduct } from '../../../types';

export const SocialGrowthWidget: React.FC = () => {
    const [selectedProduct, setSelectedProduct] = useState('');
    const [timeframe, setTimeframe] = useState<'1w' | '1m' | '3m' | '6m' | '1y'>('1m');
    const [products, setProducts] = useState<AppProduct[]>([]);
    
    useEffect(() => {
        getAppProducts().then(prods => {
            setProducts(prods);
            if (prods.length > 0 && !selectedProduct) {
                setSelectedProduct(prods[0].name);
            }
        });
    }, []);

    // Mock Data Generator based on Timeframe and Product
    const socialData = useMemo(() => {
        // Multiplier based on timeframe
        let mul = 1;
        switch(timeframe) {
            case '1w': mul = 0.25; break;
            case '1m': mul = 1; break;
            case '3m': mul = 3; break;
            case '6m': mul = 6; break;
            case '1y': mul = 12; break;
        }

        // Generate username based on product to simulate API fetching connected accounts
        const safeProductName = selectedProduct.toLowerCase().replace(/\s+/g, '.');
        const usernameBase = safeProductName ? `@${safeProductName}` : '@conta.exemplo';

        return [
            { 
                platform: 'TikTok', 
                icon: <Tiktok className="w-5 h-5 text-white"/>, 
                color: 'bg-black border-gray-600',
                username: usernameBase + '.oficial', 
                followers: `+${Math.floor(127 * mul)}k`, 
                metric: `+${(1.8 * mul).toFixed(1)}M views`,
                growth: 12
            },
            { 
                platform: 'Instagram', 
                icon: <Instagram className="w-5 h-5 text-pink-500"/>, 
                color: 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 border-pink-500/50',
                username: usernameBase, 
                followers: `+${Math.floor(89 * mul)}k`, 
                metric: `+${Math.floor(890 * mul)}k alcance`,
                growth: 8
            },
            { 
                platform: 'Facebook', 
                icon: <Facebook className="w-5 h-5 text-blue-500"/>, 
                color: 'bg-blue-900/30 border-blue-500',
                username: usernameBase + '.fb', 
                followers: `+${Math.floor(81 * mul)}k`, 
                metric: `+${Math.floor(810 * mul)}k alcance`,
                growth: 7
            },
            { 
                platform: 'YouTube', 
                icon: <Youtube className="w-5 h-5 text-red-500"/>, 
                color: 'bg-red-900/30 border-red-500',
                username: 'Canal ' + selectedProduct, 
                followers: `+${Math.floor(41 * mul)}k`, 
                metric: `+${(2.1 * mul).toFixed(1)}M horas`,
                growth: 15
            },
            { 
                platform: 'Kwai', 
                icon: <span className="w-5 h-5 flex items-center justify-center font-black text-orange-500 bg-white rounded-full text-xs">K</span>, 
                color: 'bg-orange-900/30 border-orange-500',
                username: usernameBase + '.kwai', 
                followers: `+${Math.floor(68 * mul)}k`, 
                metric: `+${(1.4 * mul).toFixed(1)}M views`,
                growth: 22
            }
        ];
    }, [timeframe, selectedProduct]);

    return (
        <Card className="p-6 border border-brand-primary/50 bg-gray-800 shadow-2xl relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-primary/20 rounded-xl border border-brand-primary/30">
                        <TrendingUp className="w-6 h-6 text-brand-primary"/>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Crescimento das Redes Sociais</h3>
                        <p className="text-gray-400 text-xs">API Conectada: Recuperando métricas em tempo real das plataformas.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-end">
                    
                    {/* Explicit Product Selector */}
                    <div className="flex flex-col w-full sm:w-auto">
                        <label className="text-[10px] font-black text-brand-primary uppercase mb-1 ml-1 tracking-wider">
                            Selecionar Produto
                        </label>
                        <div className="relative min-w-[240px]">
                            <ShoppingBag className="w-4 h-4 text-brand-primary absolute left-3 top-3"/>
                            <select 
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm font-bold uppercase focus:border-brand-primary outline-none appearance-none cursor-pointer hover:bg-gray-800 transition-colors shadow-lg"
                                value={selectedProduct}
                                onChange={e => setSelectedProduct(e.target.value)}
                            >
                                <option value="" disabled>Escolha um produto...</option>
                                {products.length === 0 && <option>Carregando produtos...</option>}
                                {products.map(p => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Timeframe Selector */}
                    <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700 h-[42px] items-center">
                        {[
                            {id: '1w', label: 'Semana'},
                            {id: '1m', label: 'Mês'},
                            {id: '3m', label: '3 Meses'},
                            {id: '6m', label: '6 Meses'},
                            {id: '1y', label: '1 Ano'},
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTimeframe(t.id as any)}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${timeframe === t.id ? 'bg-brand-primary text-black shadow' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-gray-700 mb-6"></div>

            {/* Social Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 relative z-10">
                {socialData.map((social, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-brand-primary/30 transition-all group relative overflow-hidden"
                    >
                        {/* Connection status indicator */}
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]"></div>

                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2 rounded-lg border ${social.platform === 'Instagram' ? 'bg-gradient-to-tr from-yellow-900/20 via-pink-900/20 to-purple-900/20 border-pink-500/30' : social.color.includes('bg-') ? social.color.replace('bg-', 'bg-').replace('border-', 'border-').split(' ')[0]+'/20 '+social.color.split(' ')[1]+'/30' : 'bg-gray-800 border-gray-600'}`}>
                                {social.icon}
                            </div>
                            <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 mr-2">
                                +{social.growth}%
                            </span>
                        </div>
                        
                        <div className="mb-2">
                            <p className="text-gray-500 text-[10px] uppercase font-bold">{social.platform}</p>
                            <p className="text-white font-bold text-sm truncate" title={social.username}>{social.username}</p>
                        </div>

                        <div className="space-y-1 pt-2 border-t border-gray-700/50">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400">Seguidores</span>
                                <span className="text-white font-bold">{social.followers}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400">Engajamento</span>
                                <span className="text-brand-primary font-bold">{social.metric}</span>
                            </div>
                        </div>
                        
                        {/* Mini Chart Mock */}
                        <div className="mt-3 flex items-end gap-1 h-6 opacity-30 group-hover:opacity-100 transition-opacity">
                            {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                                <div key={i} className="flex-1 bg-brand-primary rounded-t-sm" style={{height: `${h}%`}}></div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </Card>
    );
};
