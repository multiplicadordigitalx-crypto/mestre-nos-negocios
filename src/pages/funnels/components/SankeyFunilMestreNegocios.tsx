
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from '../../../components/Icons';

export const SankeyFunilMestreNegocios = () => {
    // Data definition matches the visual requirement
    const nodes = [
        { name: 'Site Visit (Tráfego)', value: 30439, color: '#FACC15', x: 50, y: 70 },
        { name: 'Conteúdo Viral', value: 4692, color: '#4ADE80', x: 300, y: 140 },
        { name: 'Lead Capturado', value: 1661, color: '#38BDF8', x: 550, y: 210 },
        { name: 'Checkout Iniciado', value: 450, color: '#A78BFA', x: 800, y: 280 },
        { name: 'Venda Confirmada', value: 115, color: '#F87171', x: 1050, y: 350 },
    ];

    const links = [
        { source: 0, target: 1, startY: 70, endY: 140, value: 80, percent: '15.4%' },
        { source: 1, target: 2, startY: 140, endY: 210, value: 40, percent: '35.4%' },
        { source: 2, target: 3, startY: 210, endY: 280, value: 20, percent: '27.0%' },
        { source: 3, target: 4, startY: 280, endY: 350, value: 10, percent: '25.5%' },
    ];

    // Helper to draw cubic bezier curves for Sankey links
    const getPath = (x1: number, y1: number, x2: number, y2: number) => {
        const controlPointOffset = (x2 - x1) / 2;
        return `M ${x1} ${y1} C ${x1 + controlPointOffset} ${y1}, ${x2 - controlPointOffset} ${y2}, ${x2} ${y2}`;
    };

    return (
        <div className="w-full bg-gray-900 rounded-2xl border border-yellow-500/30 p-6 shadow-2xl relative overflow-hidden h-[550px] flex flex-col">
             <div className="flex justify-between items-center mb-4 z-10 relative">
                 <h2 className="text-yellow-400 text-xl font-black uppercase tracking-wider flex items-center gap-3">
                     <TrendingUp className="w-6 h-6"/> Funil Sanky ao Vivo – Mestre Elite
                 </h2>
                 <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30 font-bold animate-pulse">
                     ● LIVE DATA
                 </span>
             </div>

             <div className="flex-1 relative w-full overflow-x-auto overflow-y-hidden custom-scrollbar flex items-center">
                 <svg width="100%" height="100%" viewBox="0 0 1200 400" className="min-w-[1000px] mx-auto block" preserveAspectRatio="xMidYMid meet">
                     {/* Gradients */}
                     <defs>
                        {links.map((link, i) => (
                            <linearGradient key={`grad-${i}`} id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={nodes[link.source].color} stopOpacity="0.4" />
                                <stop offset="100%" stopColor={nodes[link.target].color} stopOpacity="0.4" />
                            </linearGradient>
                        ))}
                     </defs>

                     {/* Links (Paths) */}
                     {links.map((link, i) => (
                         <g key={`link-${i}`}>
                             <motion.path 
                                 d={getPath(nodes[link.source].x + 20, link.startY + 25, nodes[link.target].x, link.endY + 25)}
                                 fill="none"
                                 stroke={`url(#gradient-${i})`}
                                 strokeWidth={link.value}
                                 strokeLinecap="round"
                                 initial={{ pathLength: 0, opacity: 0 }}
                                 animate={{ pathLength: 1, opacity: 1 }}
                                 transition={{ duration: 1.5, delay: i * 0.3, ease: "easeInOut" }}
                             />
                             {/* Percentage Label on Path */}
                             <motion.foreignObject 
                                x={(nodes[link.source].x + nodes[link.target].x) / 2 - 25} 
                                y={(link.startY + link.endY) / 2 + 10} 
                                width="50" 
                                height="30"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 + i * 0.3 }}
                             >
                                 <div className="bg-black/80 text-white text-[10px] px-1 py-0.5 rounded border border-gray-700 text-center font-bold">
                                     {link.percent}
                                 </div>
                             </motion.foreignObject>
                         </g>
                     ))}

                     {/* Nodes */}
                     {nodes.map((node, i) => (
                         <g key={`node-${i}`}>
                             <motion.rect 
                                 x={node.x} 
                                 y={node.y} 
                                 width="20" 
                                 height="50" 
                                 fill={node.color} 
                                 rx="4"
                                 initial={{ scaleY: 0 }}
                                 animate={{ scaleY: 1 }}
                                 transition={{ duration: 0.5, delay: i * 0.2 }}
                             />
                             {/* Node Label Card */}
                             <foreignObject x={node.x - 60} y={node.y - 65} width="140" height="60">
                                 <motion.div 
                                    className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-center shadow-lg"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.2 }}
                                 >
                                     <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{node.name}</p>
                                     <p className="text-sm font-black text-white" style={{ color: node.color }}>{node.value.toLocaleString()}</p>
                                 </motion.div>
                             </foreignObject>
                         </g>
                     ))}
                 </svg>
             </div>

             <div className="mt-4 flex justify-center gap-8 text-center border-t border-gray-800 pt-4 z-10 relative">
                 <div>
                     <p className="text-gray-500 text-xs uppercase font-bold">ROAS Atual</p>
                     <p className="text-xl font-black text-yellow-400">31.7x</p>
                 </div>
                 <div>
                     <p className="text-gray-500 text-xs uppercase font-bold">Custo por Aluno</p>
                     <p className="text-xl font-black text-white">R$ 187</p>
                 </div>
                 <div>
                     <p className="text-gray-500 text-xs uppercase font-bold">Ticket Médio</p>
                     <p className="text-xl font-black text-green-400">R$ 5.997</p>
                 </div>
             </div>

             {/* Background Grid */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none z-0"></div>
        </div>
    );
};
