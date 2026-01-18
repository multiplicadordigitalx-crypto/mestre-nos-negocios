
import React from 'react';
import { TrendingUp, Globe } from '../../../components/Icons';
import Card from '../../../components/Card';

const NexusFinancialAlignment: React.FC = () => {
    // Mock Data for "Ciclo Virtuoso" Visualization
    const metrics = {
        totalStudentIncome: 452000,
        activeStudents: 1683,
        upsellRevenue: 89000,
        retentionRate: 94
    };

    return (
        <Card className="bg-gray-800 border-l-4 border-l-green-500 p-6 relative overflow-hidden mt-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                        <TrendingUp className="w-6 h-6 text-green-500"/> Nexus Financial Core (Etapa 4)
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">
                        Monitoramento de receita validada dos alunos (APIs Marketplace).
                    </p>
                </div>
                <div className="bg-green-900/30 px-3 py-1 rounded-full border border-green-500/30 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-green-400 text-xs font-bold">DADOS VALIDADOS</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {/* Metric 1: Renda Validada */}
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center group hover:border-green-500/50 transition-colors">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Renda Total Validada (APIs)</p>
                    <p className="text-3xl font-black text-white group-hover:text-green-400 transition-colors">R$ {metrics.totalStudentIncome.toLocaleString()}</p>
                    <p className="text-[10px] text-green-500 mt-1 bg-green-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                        <Globe className="w-3 h-3"/> Fontes: Hotmart, Kiwify, Etc.
                    </p>
                </div>

                {/* Metric 2: Upsell Conversion */}
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center group hover:border-blue-500/50 transition-colors">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Investimento em Upsell (Retorno)</p>
                    <p className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors">R$ {metrics.upsellRevenue.toLocaleString()}</p>
                    <p className="text-[10px] text-blue-400 mt-1 bg-blue-500/10 px-2 py-0.5 rounded">
                        Alunos satisfeitos compram mais.
                    </p>
                </div>

                {/* Metric 3: Retention */}
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center group hover:border-purple-500/50 transition-colors">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Taxa de Retenção</p>
                    <div className="relative w-16 h-16 mb-1">
                         <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-700" />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="175" strokeDashoffset={175 - (175 * 0.94)} className="text-purple-500" strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">94%</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Ciclo Virtuoso Confirmado</p>
                </div>
            </div>
        </Card>
    );
};

export default NexusFinancialAlignment;
