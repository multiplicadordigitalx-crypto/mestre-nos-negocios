
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from '../../../components/Icons';
import Card from '../../../components/Card';

export const AiRoiWidget: React.FC = () => {
    // Generate mock data for the last 14 days
    const data = useMemo(() => {
        return Array.from({ length: 14 }).map((_, i) => {
            const cost = Math.floor(Math.random() * 500) + 200; // Custo entre 200 e 700
            const revenue = cost * (Math.random() * 5 + 8); // Retorno entre 8x e 13x o custo
            return {
                day: `Dia ${i + 1}`,
                cost,
                revenue: Math.floor(revenue)
            };
        });
    }, []);

    const totalCost = data.reduce((acc, item) => acc + item.cost, 0);
    const totalRevenue = data.reduce((acc, item) => acc + item.revenue, 0);
    const multiplier = (totalRevenue / totalCost).toFixed(2);
    const maxVal = Math.max(...data.map(d => d.revenue));

    return (
        <Card className="p-6 border border-gray-700 bg-gray-800 relative overflow-hidden shadow-xl mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-500/10 rounded-xl border border-green-500/20">
                        <TrendingUp className="w-6 h-6 text-green-500"/>
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">ROI da Inteligência Artificial</h3>
                        <p className="text-gray-400 text-xs">Faturamento Gerado vs. Custo Operacional (Últimos 14 dias)</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Investimento (Custo IA)</p>
                        <p className="text-red-400 font-bold font-mono">R$ {totalCost.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="h-8 w-px bg-gray-700"></div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Faturamento (Atribuído)</p>
                        <p className="text-green-400 font-bold font-mono">R$ {totalRevenue.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="h-8 w-px bg-gray-700"></div>
                    <div className="bg-green-500/20 px-3 py-1 rounded-lg border border-green-500/30 text-center">
                        <p className="text-[10px] text-green-300 uppercase font-bold">ROI</p>
                        <p className="text-xl font-black text-green-400">{multiplier}x</p>
                    </div>
                </div>
            </div>

            {/* CHART AREA */}
            <div className="relative h-64 w-full bg-gray-900/50 rounded-xl border border-gray-700 p-4 flex items-end justify-between gap-2">
                {/* Y-Axis Grid Lines (Visual only) */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                    <div className="w-full border-t border-gray-500 dashed"></div>
                    <div className="w-full border-t border-gray-500 dashed"></div>
                    <div className="w-full border-t border-gray-500 dashed"></div>
                    <div className="w-full border-t border-gray-500 dashed"></div>
                </div>

                {data.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col justify-end items-center group h-full relative z-10">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-gray-600 p-2 rounded text-[10px] z-20 pointer-events-none whitespace-nowrap shadow-xl">
                            <p className="text-gray-400 mb-1">{item.day}</p>
                            <p className="text-green-400 font-bold">Fat: R$ {item.revenue}</p>
                            <p className="text-red-400 font-bold">Custo: R$ {item.cost}</p>
                            <p className="text-white mt-1 border-t border-gray-700 pt-1">Lucro: R$ {item.revenue - item.cost}</p>
                        </div>

                        {/* Revenue Bar */}
                        <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${(item.revenue / maxVal) * 100}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.05 }}
                            className="w-full max-w-[30px] bg-gradient-to-t from-green-900 to-green-500 rounded-t-sm relative hover:from-green-800 hover:to-green-400 transition-colors cursor-pointer"
                        >
                            {/* Cost Bar (Overlay or Nested) - Showing cost as a portion of the bar but visually distinct */}
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(item.cost / item.revenue) * 100}%` }}
                                className="absolute bottom-0 w-full bg-red-500/80 rounded-b-sm border-t border-red-400/50"
                            ></motion.div>
                        </motion.div>

                        {/* Label */}
                        <span className="text-[9px] text-gray-500 mt-2 rotate-0 hidden md:block">{item.day}</span>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 flex items-center justify-between text-xs">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                        <span className="text-gray-400">Faturamento</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500/80 rounded-sm"></div>
                        <span className="text-gray-400">Custo API</span>
                    </div>
                </div>
                <div className="text-gray-500 italic">
                    Para cada R$ 1,00 investido em IA, o retorno médio é de <span className="text-white font-bold">R$ {multiplier}</span>.
                </div>
            </div>
        </Card>
    );
};
