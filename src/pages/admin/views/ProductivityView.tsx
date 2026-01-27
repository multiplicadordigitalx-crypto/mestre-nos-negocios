
import React, { useState, useMemo } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { ShieldCheck, Download, ActivityIcon, BarChart3, Trophy, X as XIcon, Search, Calendar, Users, Sparkles, Brain, Clock, Zap, FileText } from '../../../components/Icons';
import { motion } from 'framer-motion';
import RankingSection from '../../../components/RankingSection';

const ProductivityView: React.FC = () => {
    // Mock Data for Support Team
    const supportStats = [
        { name: 'Ana Clara', role: 'support', calls: 842, resolved: '92%', logged: '184h 32m', avgTime: '3 min 12s', sat: 4.92, stars: 5 },
        { name: 'Pedro Suporte', role: 'support', calls: 618, resolved: '88%', logged: '176h 10m', avgTime: '4 min 51s', sat: 4.76, stars: 4 },
        { name: 'Mariana', role: 'support', calls: 312, resolved: '85%', logged: '98h 45m', avgTime: '6 min 03s', sat: 4.68, stars: 4 },
        { name: 'Lucas', role: 'support', calls: 75, resolved: '81%', logged: '42h 18m', avgTime: '8 min 27s', sat: 4.55, stars: 4 },
        { name: 'Carlos Vendas', role: 'sales', calls: 450, resolved: '95%', logged: '160h 00m', avgTime: '5 min 00s', sat: 4.80, stars: 5 },
        { name: 'Juliana Vendas', role: 'sales', calls: 300, resolved: '90%', logged: '120h 00m', avgTime: '6 min 00s', sat: 4.50, stars: 4 },
    ];

    const [viewingAgent, setViewingAgent] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('30days'); // 7days, 30days, thisMonth
    const [teamFilter, setTeamFilter] = useState('all'); // all, support, sales

    // --- FILTER LOGIC ---
    const filteredStats = useMemo(() => {
        return supportStats.filter(agent => {
            const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTeam = teamFilter === 'all' || agent.role === teamFilter;
            return matchesSearch && matchesTeam;
        });
    }, [searchTerm, teamFilter]);

    // --- NEXUS AI ANALYTICS (MOCK) ---
    // Deriving some simple "AI" insights from the current data
    const aiInsights = useMemo(() => {
        if (filteredStats.length === 0) return null;

        const topPerformer = filteredStats.reduce((prev, current) => (prev.sat > current.sat ? prev : current));
        const totalCalls = filteredStats.reduce((acc, curr) => acc + curr.calls, 0);
        const avgSat = (filteredStats.reduce((acc, curr) => acc + curr.sat, 0) / filteredStats.length).toFixed(2);

        return {
            highlight: `${topPerformer.name} é o destaque em satisfação (${topPerformer.sat}).`,
            trend: `Volume de chamados ${totalCalls > 1000 ? 'alto' : 'moderado'} para o período selecionado.`,
            suggestion: avgSat > '4.80' ? 'Equipe em alta performance! Considere parabenizar.' : 'Monitore o tempo médio de resposta para melhorar a satisfação.'
        };
    }, [filteredStats]);


    return (
        <div className="space-y-6 animate-fade-in">

            {/* --- HEADER --- */}
            <Card className="p-6 border border-gray-700 bg-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-brand-primary" /> RANKING DE PRODUTIVIDADE
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Métricas detalhadas, filtros e análise da Nexus IA.</p>
                    </div>
                    <Button variant="secondary" className="!py-2 !text-xs flex items-center gap-2">
                        <Download className="w-4 h-4" /> EXPORTAR RELATÓRIO
                    </Button>
                </div>

                {/* --- FILTER BAR --- */}
                <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700 mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar agente..."
                            className="w-full bg-gray-800 border-none rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-brand-primary placeholderable-gray-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <select
                            className="bg-gray-800 border-none rounded-lg py-2 pl-2 pr-8 text-sm text-gray-300 focus:ring-1 focus:ring-brand-primary cursor-pointer w-full"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        >
                            <option value="7days">Últimos 7 dias</option>
                            <option value="30days">Últimos 30 dias</option>
                            <option value="thisMonth">Este Mês</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Users className="w-4 h-4 text-gray-400" />
                        <select
                            className="bg-gray-800 border-none rounded-lg py-2 pl-2 pr-8 text-sm text-gray-300 focus:ring-1 focus:ring-brand-primary cursor-pointer w-full"
                            value={teamFilter}
                            onChange={(e) => setTeamFilter(e.target.value)}
                        >
                            <option value="all">Todas as Equipes</option>
                            <option value="support">Suporte</option>
                            <option value="sales">Vendas</option>
                        </select>
                    </div>
                </div>

                {/* --- NEXUS AI INSIGHTS --- */}
                {aiInsights && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-5 mb-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Brain className="w-32 h-32 text-indigo-400" />
                        </div>

                        <h3 className="text-indigo-300 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <Sparkles className="w-4 h-4 text-indigo-400" /> Insights Nexus IA
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                            <div className="bg-gray-900/60 p-3 rounded-lg border border-indigo-500/20 backdrop-blur-sm">
                                <p className="text-[10px] text-indigo-300 font-bold uppercase mb-1">Destaque</p>
                                <p className="text-sm text-white font-medium">{aiInsights.highlight}</p>
                            </div>
                            <div className="bg-gray-900/60 p-3 rounded-lg border border-indigo-500/20 backdrop-blur-sm">
                                <p className="text-[10px] text-purple-300 font-bold uppercase mb-1">Tendência</p>
                                <p className="text-sm text-white font-medium">{aiInsights.trend}</p>
                            </div>
                            <div className="bg-gray-900/60 p-3 rounded-lg border border-indigo-500/20 backdrop-blur-sm">
                                <p className="text-[10px] text-blue-300 font-bold uppercase mb-1">Sugestão</p>
                                <p className="text-sm text-white font-medium flex items-center gap-2">
                                    <Zap className="w-3 h-3 text-yellow-400" />
                                    {aiInsights.suggestion}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- STATS SUMMARY --- */}
                <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-4 mb-8">
                    <h3 className="text-sm font-bold text-gray-300 uppercase mb-4 flex items-center gap-2">
                        <ActivityIcon className="w-4 h-4" /> Resumo ({filteredStats.length} agentes)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
                        <div className="border-r border-gray-700/50 pr-4 last:border-0">
                            <p className="text-xs text-gray-500 font-bold uppercase">Atendentes listados</p>
                            <p className="text-xl font-black text-white">{filteredStats.length}</p>
                        </div>
                        <div className="border-r border-gray-700/50 pr-4 last:border-0">
                            <p className="text-xs text-gray-500 font-bold uppercase">Chamados exibidos</p>
                            <p className="text-2xl font-bold text-white">{filteredStats.reduce((acc, curr) => acc + curr.calls, 0)}</p>
                        </div>
                        <div className="border-r border-gray-700/50 pr-4 last:border-0">
                            <p className="text-xs text-gray-500 font-bold uppercase">Média Geral Tempo</p>
                            <p className="text-xl font-black text-blue-400">4m 28s</p>
                        </div>
                        <div className="border-r border-gray-700/50 pr-4 last:border-0">
                            <p className="text-xs text-gray-500 font-bold uppercase">Satisfação Média</p>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <p className="text-xl font-black text-yellow-400">{(filteredStats.reduce((acc, curr) => acc + curr.sat, 0) / (filteredStats.length || 1)).toFixed(2)}</p>
                                <span className="text-[10px] text-gray-400">/ 5,00 ★★★★★</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CHARTS --- */}
                <div className="mb-8">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase">
                        <BarChart3 className="w-4 h-4 text-purple-500" /> Gráficos de Desempenho
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 flex flex-col h-48">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-2 text-center">Volume Diário (IA Prediction)</p>
                            <div className="flex-1 flex items-end justify-between gap-1 px-2">
                                {[40, 65, 45, 80, 55, 90, 70].map((h, idx) => (
                                    <div key={idx} className="w-full bg-blue-500/40 hover:bg-blue-500 transition-colors rounded-t cursor-pointer group" style={{ height: `${h}%` }}>
                                        <div className="opacity-0 group-hover:opacity-100 absolute -mt-6 text-[10px] bg-black text-white px-1 rounded transition-opacity">
                                            {h * 2} calls
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1">
                                <span>Seg</span><span>Dom</span>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 flex flex-col h-48 justify-center">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-3 text-center">Tempo Logado (Top 4)</p>
                            <div className="space-y-2 w-full">
                                {filteredStats.slice(0, 4).map((s, i) => (
                                    <div key={i} className="flex items-center text-xs gap-2">
                                        <span className="text-gray-400 w-16 truncate text-right">{s.name.split(' ')[0]}</span>
                                        <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                                            <div className="bg-green-500 h-full" style={{ width: `${(parseInt(s.logged) / 200) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center h-48">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-2">NPS da Equipe</p>
                            <div className="relative w-24 h-24 rounded-full border-8 border-yellow-500 border-t-yellow-200 border-l-yellow-500 flex items-center justify-center shadow-lg">
                                <span className="text-xl font-bold text-white">{(filteredStats.reduce((acc, curr) => acc + curr.sat, 0) / (filteredStats.length || 1)).toFixed(1)}</span>
                            </div>
                            <div className="flex gap-3 mt-3 text-[10px] text-gray-400">
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Promotores</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-200"></div> Neutros</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- TABLE --- */}
                <div className="mb-0 overflow-x-auto">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase">
                        <Trophy className="w-4 h-4 text-yellow-500" /> Tabela de Classificação
                    </h3>
                    {filteredStats.length > 0 ? (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-700 text-gray-300 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">#</th>
                                    <th className="px-4 py-3">Atendente</th>
                                    <th className="px-4 py-3">Função</th>
                                    <th className="px-4 py-3 text-center">Chamados</th>
                                    <th className="px-4 py-3 text-center">Resolvidos</th>
                                    <th className="px-4 py-3 text-center">Tempo Logado</th>
                                    <th className="px-4 py-3 text-center">Méd./Resp</th>
                                    <th className="px-4 py-3 text-center">Satisfação</th>
                                    <th className="px-4 py-3 text-right rounded-tr-lg">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700 bg-gray-900/30">
                                {filteredStats.map((agent, i) => (
                                    <tr key={i} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-4 py-3 font-bold text-white">{i + 1}</td>
                                        <td className="px-4 py-3 text-white font-medium">{agent.name}</td>
                                        <td className="px-4 py-3 text-gray-400 text-xs uppercase">{agent.role === 'sales' ? 'Vendas' : 'Suporte'}</td>
                                        <td className="px-4 py-3 text-center text-gray-300">{agent.calls}</td>
                                        <td className="px-4 py-3 text-center text-green-400 font-bold">{agent.resolved}</td>
                                        <td className="px-4 py-3 text-center text-gray-300">{agent.logged}</td>
                                        <td className="px-4 py-3 text-center text-blue-300">{agent.avgTime}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="font-bold text-white mr-1">{agent.sat}</span>
                                            <span className="text-yellow-400 text-xs">{'★'.repeat(agent.stars)}{'☆'.repeat(5 - agent.stars)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => setViewingAgent(agent)}
                                                className="text-xs font-bold text-brand-primary hover:text-yellow-300 hover:underline"
                                            >
                                                [Ver detalhes]
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            Nenhum agente encontrado com os filtros selecionados.
                        </div>
                    )}
                </div>
            </Card>

            <RankingSection title="Rankings de Produtividade (Tempo Real)" />

            {viewingAgent && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-800 w-full max-w-md rounded-xl border border-gray-700 shadow-2xl p-6"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center font-bold text-xl text-white">
                                    {viewingAgent.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{viewingAgent.name}</h3>
                                    <p className="text-sm text-gray-400 uppercase">{viewingAgent.role === 'sales' ? 'Consultor de Vendas' : 'Agente de Suporte'}</p>
                                </div>
                            </div>
                            <button onClick={() => setViewingAgent(null)}><XIcon className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-500 text-xs font-bold uppercase">Chamados</p>
                                    <p className="text-xl font-bold text-white">{viewingAgent.calls}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs font-bold uppercase">Resolvidos</p>
                                    <p className="text-xl font-bold text-green-400">{viewingAgent.resolved}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs font-bold uppercase">Tempo Logado</p>
                                    <p className="text-white">{viewingAgent.logged}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs font-bold uppercase">Média/Resp</p>
                                    <p className="text-blue-400">{viewingAgent.avgTime}</p>
                                </div>
                            </div>

                            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                <p className="text-gray-500 text-xs font-bold uppercase mb-2">Satisfação (NPS)</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-black text-yellow-400">{viewingAgent.sat}</span>
                                    <div className="flex flex-col">
                                        <span className="text-yellow-400 text-sm flex">{'★'.repeat(viewingAgent.stars)}{'☆'.repeat(5 - viewingAgent.stars)}</span>
                                        <span className="text-gray-500 text-xs">Baseado em avaliações recentes</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/20">
                                <p className="text-indigo-400 text-xs font-bold uppercase mb-2 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Análise Individual Nexus IA</p>
                                <p className="text-gray-300 text-sm italic mb-4">
                                    "{viewingAgent.name} mantém um desempenho {viewingAgent.sat > 4.7 ? 'excepcional' : 'consistente'}.
                                    Recomendamos {viewingAgent.sat > 4.7 ? 'verificar possibilidade de bonificação' : 'monitorar tempo de resposta nos horários de pico'}."
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        className="w-full !text-xs flex items-center justify-center gap-2 !py-2"
                                        onClick={() => {
                                            const toast = require('react-hot-toast').default;
                                            toast.loading("Gerando relatório PDF detalhado...", { duration: 3000 });
                                            setTimeout(() => toast.success("Relatório enviado para seu email!"), 3000);
                                        }}
                                    >
                                        <FileText className="w-3 h-3" /> Relatório PDF
                                    </Button>
                                    <Button
                                        className="w-full !text-xs flex items-center justify-center gap-2 !py-2 !bg-indigo-600 hover:!bg-indigo-500"
                                        onClick={() => {
                                            const toast = require('react-hot-toast').default;
                                            toast.loading("Nexus IA analisando histórico completo...", { duration: 4000 });
                                            setTimeout(() => toast.success("Análise profunda concluída! Verifique o painel."), 4000);
                                        }}
                                    >
                                        <Brain className="w-3 h-3" /> Análise Profunda
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button onClick={() => setViewingAgent(null)} className="w-full">Fechar</Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ProductivityView;
