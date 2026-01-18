import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { getTeamProductivity } from '../../../services/mockFirebase';
import { WorkerProductivity } from '../../../types/legacy'; // Ensure path is correct or just use any if strictly needed
import { Brain, Clock, Zap, AlertTriangle, CheckCircle, BarChart2, Star, Users, Download, Calendar, FileText, ChevronDown } from '../../../components/Icons';

const HRProductivityView: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const res = await getTeamProductivity();
        setData(res);
        setLoading(false);
    };

    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    // Stakeholder Statistics Categories
    const stakeholders = [
        { key: 'students', label: 'Alunos', mockScore: 92, count: 1250 },
        { key: 'influencers', label: 'Influencers', mockScore: 88, count: 45 },
        { key: 'affiliates', label: 'Afiliados', mockScore: 78, count: 320 },
        { key: 'coproducers', label: 'Co-produtores', mockScore: 85, count: 12 },
        { key: 'producers', label: 'Produtores', mockScore: 95, count: 5 }
    ];



    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" /> Produtividade da Equipe
                    </h3>
                    <p className="text-gray-400 text-sm">Análise de tempo, eficiência e qualidade por setor.</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-gray-800 px-3 py-1 rounded text-xs text-gray-400 border border-gray-700">Hoje</span>
                </div>
            </div>

            {/* Quality & NPS Overview Card */}
            <Card className="p-6 bg-gray-800 border-l-4 border-l-purple-500">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-400" /> Qualidade & NPS (Net Promoter Score)
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                        Avaliações feitas por alunos, produtores, parceiros e influencers. Identifique setores que precisam de atenção.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {stakeholders.map(stakeholder => {
                        let colorClass = 'text-gray-400';
                        let bgClass = 'bg-gray-700';
                        if (stakeholder.mockScore >= 75) { colorClass = 'text-green-400'; bgClass = 'bg-green-500/10 border-green-500/30'; }
                        else if (stakeholder.mockScore >= 50) { colorClass = 'text-yellow-400'; bgClass = 'bg-yellow-500/10 border-yellow-500/30'; }
                        else { colorClass = 'text-red-400'; bgClass = 'bg-red-500/10 border-red-500/30'; }

                        return (
                            <div key={stakeholder.key} className={`p-4 rounded-xl border ${bgClass} transition-all`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-gray-300 font-bold uppercase text-[10px] md:text-xs truncate" title={stakeholder.label}>{stakeholder.label}</span>
                                    <Users className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className={`text-2xl md:text-3xl font-black ${colorClass}`}>{stakeholder.mockScore}</span>
                                </div>
                                <div className="mt-2 text-[10px] text-gray-400">
                                    {stakeholder.count} avaliações
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {loading ? <LoadingSpinner /> : (
                <div className="grid grid-cols-1 gap-6">
                    {data.map((worker, idx) => (
                        <Card key={idx} className="p-0 overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors">
                            <div className="p-6 bg-gray-800 flex flex-col gap-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-black border-4 border-gray-700 shadow-lg ${worker.efficiencyScore > 70 ? 'bg-green-500' : worker.efficiencyScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                            <div className="text-center leading-none">
                                                <span className="text-[10px] block mb-0.5 opacity-80 uppercase font-black">Score</span>
                                                <span className="text-2xl font-black">{worker.efficiencyScore}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-xl md:text-2xl">{worker.userName}</h4>
                                            <p className="text-sm text-gray-400 uppercase tracking-wide font-bold flex items-center gap-2 mt-1">
                                                {worker.role === 'support' ? 'Suporte' : (worker.role === 'sales' ? 'Vendas' : worker.role)}
                                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                <span className={`${worker.npsScore >= 75 ? 'text-green-400' : worker.npsScore >= 50 ? 'text-yellow-400' : 'text-red-400'} flex items-center gap-1`}>
                                                    <Star className="w-3 h-3" fill="currentColor" /> NPS: {worker.npsScore || '-'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">Atendimentos Hoje</span>
                                            <span className="text-3xl font-black text-white">
                                                {worker.tasksCompleted}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Grid - LARGER and CLEARER */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700/80 flex flex-col justify-center items-center">
                                        <span className="text-xs text-blue-400 uppercase font-bold mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Tempo Logado</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl md:text-3xl font-mono font-black text-white">{formatTime(worker.timeLoggedInMinutes)}</span>
                                            <span className="text-sm font-bold text-blue-500">({Math.round((worker.timeLoggedInMinutes / 480) * 100)}%)</span>
                                        </div>
                                        <div className="w-full h-1 bg-gray-700 mt-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${Math.min((worker.timeLoggedInMinutes / 480) * 100, 100)}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700/80 flex flex-col justify-center items-center">
                                        <span className="text-xs text-yellow-400 uppercase font-bold mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Tempo Ativo</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-2xl md:text-3xl font-mono font-black ${worker.efficiencyScore < 50 ? 'text-red-400' : 'text-green-400'}`}>{formatTime(worker.timeActiveMinutes)}</span>
                                            <span className={`text-sm font-bold ${worker.efficiencyScore < 50 ? 'text-red-400' : 'text-green-400'}`}>({Math.round((worker.timeActiveMinutes / worker.timeLoggedInMinutes) * 100)}%)</span>
                                        </div>
                                        <div className="w-full h-1 bg-gray-700 mt-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-yellow-500" style={{ width: `${(worker.timeActiveMinutes / worker.timeLoggedInMinutes) * 100}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700/80 flex flex-col justify-center items-center">
                                        <span className="text-xs text-purple-400 uppercase font-bold mb-1 flex items-center gap-1"><Star className="w-3 h-3" /> Avaliação Geral</span>
                                        <span className={`text-2xl md:text-3xl font-black ${!worker.npsScore ? 'text-gray-500' : worker.npsScore >= 75 ? 'text-green-400' : worker.npsScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {worker.npsScore || 'N/A'}
                                        </span>
                                        <span className="text-[10px] text-gray-500 mt-1">NPS Individual</span>
                                    </div>
                                </div>

                                {/* AI Analysis Box - Highlighted */}
                                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/20 border border-purple-500/30 rounded-xl p-4 flex gap-4 items-start shadow-inner">
                                    <div className="bg-purple-500/20 p-2 rounded-lg shrink-0 border border-purple-500/30">
                                        <Brain className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-purple-300 font-bold uppercase tracking-widest mb-1">Nexus AI Insight</p>
                                        <p className="text-base text-gray-200 leading-relaxed font-medium">"{worker.aiAnalysis}"</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}


        </div>
    );
};

export default HRProductivityView;
