
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Pencil, ShieldAlert, Users, UserCog, Robot, Film, FileText, Image, TrendingUp } from '../../../components/Icons';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import toast from 'react-hot-toast';
import { getUsageLimit, updateUsageLimit, toggleEmergencyStop, resetCurrentUsage } from '../../../services/mockFirebase';
import { UsageLimit } from '../../../types';
import { DetailedModal } from '../components/DetailedModal';

export const AiCostWidget: React.FC = () => {
    const [usageLimit, setUsageLimit] = useState<UsageLimit | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempBudget, setTempBudget] = useState('');
    const [expandedDetail, setExpandedDetail] = useState<'students' | 'team' | 'auto' | null>(null);
    const [activeModal, setActiveModal] = useState<'top100' | 'toolsReport' | null>(null);

    // Chart State initialized with data
    const [selectedToolMetric, setSelectedToolMetric] = useState<'total' | 'video' | 'pages' | 'images' | 'copy' | 'email' | 'seo'>('total');
    const [chartData, setChartData] = useState<number[]>(Array.from({length: 24}, () => Math.floor(Math.random() * 40 + 30)));

    const topStudents = Array.from({length: 20}, (_, i) => ({
        id: i,
        name: `Aluno ${['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira'][i%5]} ${i+1}`,
        spent: (Math.random() * 400 + 100).toFixed(2),
        plan: ['Elite', 'Pro', 'Básico'][i%3],
        favoriteTool: ['Kwai Viral', 'Copy Ads', 'Logo Gen'][i%3]
    })).sort((a,b) => parseFloat(b.spent) - parseFloat(a.spent));

    useEffect(() => {
        const fetchLimit = async () => {
            const limit = await getUsageLimit();
            setUsageLimit(limit);
            if (!isEditing) setTempBudget(limit.monthly_limit.toString());
        };
        fetchLimit();
        const interval = setInterval(fetchLimit, 3000); 
        return () => clearInterval(interval);
    }, [isEditing]);

    useEffect(() => {
        const generateData = () => Array.from({length: 24}, () => Math.floor(Math.random() * 50 + 20));
        setChartData(generateData());
    }, [selectedToolMetric]);

    useEffect(() => {
        const interval = setInterval(() => {
             setChartData(prev => {
                 if (prev.length === 0) return Array.from({length: 24}, () => 30);
                 return prev.map(val => {
                     const direction = Math.random() > 0.5 ? 1 : -1;
                     const amount = Math.floor(Math.random() * 8);
                     let newValue = val + (direction * amount);
                     return Math.min(95, Math.max(10, newValue));
                 });
             })
        }, 800); 
        return () => clearInterval(interval);
    }, []);

    if (!usageLimit) return <div className="p-6 bg-gray-800 rounded-xl animate-pulse h-64"></div>;

    const percentage = Math.min(100, (usageLimit.current_usage / usageLimit.monthly_limit) * 100);
    const isBlocked = usageLimit.current_usage >= usageLimit.monthly_limit || usageLimit.emergency_stop;
    const isWarning = percentage >= 95;

    const getStatusColor = () => {
        if (usageLimit.emergency_stop) return 'bg-red-600';
        if (percentage >= 100) return 'bg-red-600';
        if (percentage >= 95) return 'bg-yellow-500';
        return 'bg-brand-primary';
    };

    const handleSaveBudget = async () => {
        const val = parseFloat(tempBudget);
        if (isNaN(val) || val <= 0) return toast.error("Valor inválido");
        await updateUsageLimit(val);
        setIsEditing(false);
        toast.success("Teto de gastos atualizado!");
    };

    const handleEmergencyStop = async () => {
        if (usageLimit.emergency_stop) {
             if(confirm("Deseja reativar o sistema de IA? As cobranças voltarão a ocorrer.")) {
                await toggleEmergencyStop(false);
                toast.success("Sistema reativado.");
             }
        } else {
            if(confirm("PARAR TODAS AS IAs AGORA? Isso bloqueará imediatamente o uso para todos os alunos.")) {
                await toggleEmergencyStop(true);
                toast.error("SISTEMA BLOQUEADO MANUALMENTE.");
            }
        }
    };

    const handleReset = async () => {
        if(confirm("Zerar contador de uso do mês? Certifique-se que o ciclo de faturamento virou.")) {
            await resetCurrentUsage();
            toast.success("Ciclo resetado.");
        }
    };

    const getChartColor = () => {
        switch(selectedToolMetric) {
            case 'video': return 'bg-red-500';
            case 'pages': return 'bg-purple-500';
            case 'images': return 'bg-pink-500';
            case 'copy': return 'bg-blue-500';
            case 'email': return 'bg-yellow-500';
            case 'seo': return 'bg-green-500';
            default: return 'bg-brand-primary';
        }
    };

    const getChartLabel = () => {
        switch(selectedToolMetric) {
            case 'video': return 'Geração de Vídeo';
            case 'pages': return 'Construtor de Páginas';
            case 'images': return 'Geração de Imagens';
            case 'copy': return 'Copywriting & Texto';
            case 'email': return 'E-mail Marketing';
            case 'seo': return 'Otimizador SEO';
            default: return 'Consumo Global';
        }
    };

    return (
        <>
            <Card className={`p-6 border ${isBlocked ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-gray-700'} bg-gray-800 relative overflow-hidden shadow-2xl transition-all duration-300`}>
                 <div className="absolute top-0 right-0 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                 {isBlocked && <div className="absolute inset-0 bg-red-900/10 pointer-events-none z-0"></div>}

                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10">
                     <div className="flex items-center gap-3">
                         <div className={`p-2.5 rounded-xl border transition-colors ${isBlocked ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'}`}>
                             <Coins className="w-6 h-6"/>
                         </div>
                         <div>
                             <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                 Custo & Consumo IA Total
                                 {usageLimit.emergency_stop && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded animate-pulse">PARADA DE EMERGÊNCIA</span>}
                             </h3>
                             <p className="text-gray-400 text-xs">Monitoramento Financeiro em Tempo Real</p>
                         </div>
                     </div>
                     
                     <div className="flex items-center gap-3 mt-4 md:mt-0">
                         <div className="flex items-center gap-2 bg-gray-900 p-2 rounded-lg border border-gray-700">
                            <span className="text-xs text-gray-400 uppercase font-bold">Teto Mensal:</span>
                            {isEditing ? (
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-500 text-xs">R$</span>
                                    <input 
                                        className="w-20 bg-gray-800 border border-gray-600 rounded px-1 text-white text-xs font-bold outline-none"
                                        value={tempBudget}
                                        onChange={e => setTempBudget(e.target.value)}
                                        autoFocus
                                        onBlur={handleSaveBudget}
                                        onKeyDown={e => e.key === 'Enter' && handleSaveBudget()}
                                    />
                                </div>
                            ) : (
                                <div 
                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 px-2 rounded transition-colors group"
                                    onClick={() => { setTempBudget(usageLimit.monthly_limit.toString()); setIsEditing(true); }}
                                >
                                    <span className="text-white font-bold font-mono">R$ {usageLimit.monthly_limit.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                    <Pencil className="w-3 h-3 text-gray-500 group-hover:text-white"/>
                                </div>
                            )}
                         </div>
                         
                         <button 
                            onClick={handleEmergencyStop}
                            className={`h-10 px-4 rounded-lg font-bold text-xs uppercase shadow-lg transition-all transform active:scale-95 border flex items-center gap-2 ${usageLimit.emergency_stop ? 'bg-green-600 border-green-500 hover:bg-green-500 text-white' : 'bg-red-600 border-red-500 hover:bg-red-500 text-white animate-pulse-slow'}`}
                            title="Botão de Segurança"
                         >
                             <ShieldAlert className="w-4 h-4"/>
                             {usageLimit.emergency_stop ? 'REATIVAR SISTEMA' : 'PARAR TUDO'}
                         </button>
                     </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                     <div className="lg:col-span-1 flex flex-col justify-center">
                         <div className="flex justify-between items-end mb-2">
                             <span className="text-gray-400 text-xs font-bold uppercase">Consumo Atual</span>
                             <span className={`text-xs font-bold ${isBlocked ? 'text-red-500' : isWarning ? 'text-yellow-500 animate-pulse' : 'text-green-500'}`}>
                                 {percentage.toFixed(1)}% do Teto
                             </span>
                         </div>
                         <div className={`text-4xl font-black mb-4 tracking-tight transition-colors ${isBlocked ? 'text-red-500' : 'text-white'}`}>
                             R$ {usageLimit.current_usage.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                         </div>
                         <div className="w-full bg-gray-900 h-4 rounded-full overflow-hidden border border-gray-700 relative">
                             <motion.div 
                                className={`h-full ${getStatusColor()} relative`}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1 }}
                             >
                                 <div className="absolute top-0 right-0 h-full w-1 bg-white/50 shadow-[0_0_10px_white]"></div>
                             </motion.div>
                         </div>
                         <div className="mt-3 flex justify-between text-[10px] text-gray-500 font-mono">
                             <button onClick={handleReset} className="hover:text-white underline">Resetar Ciclo</button>
                             <span>{isBlocked ? 'BLOQUEADO' : 'Operacional'}</span>
                         </div>
                         {isWarning && !isBlocked && <div className="mt-2 text-center text-xs text-yellow-500 font-bold bg-yellow-500/10 p-2 rounded border border-yellow-500/20">⚠️ Atenção: 95% do crédito consumido.</div>}
                         {isBlocked && !usageLimit.emergency_stop && <div className="mt-2 text-center text-xs text-red-500 font-bold bg-red-500/10 p-2 rounded border border-red-500/20">⛔ Limite atingido. IAs bloqueadas.</div>}
                     </div>

                     <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <div 
                            className={`bg-gray-900/50 p-3 rounded-xl border border-gray-700 hover:border-blue-500/50 cursor-pointer transition-all ${expandedDetail === 'students' ? 'ring-2 ring-blue-500' : ''}`}
                            onClick={() => setExpandedDetail(expandedDetail === 'students' ? null : 'students')}
                         >
                             <div className="flex justify-between items-start mb-2">
                                 <p className="text-xs text-blue-400 font-bold uppercase flex items-center gap-1"><Users className="w-3 h-3"/> Alunos</p>
                                 <span className="text-[10px] text-gray-500">~60%</span>
                             </div>
                             <p className="text-lg font-bold text-white">R$ {(usageLimit.current_usage * 0.6).toFixed(2)}</p>
                             <AnimatePresence>
                                 {expandedDetail === 'students' && (
                                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 pt-3 border-t border-gray-700 text-[10px] space-y-1">
                                         <div className="flex justify-between text-gray-300"><span>João Silva</span><span>R$ 12,00</span></div>
                                         <div className="flex justify-between text-gray-300"><span>Maria Oliveira</span><span>R$ 8,50</span></div>
                                         <div className="flex justify-between text-gray-300"><span>Carlos Tech</span><span>R$ 7,20</span></div>
                                         <button onClick={(e) => { e.stopPropagation(); setActiveModal('top100'); }} className="text-blue-400 hover:text-white hover:underline w-full text-left mt-2 font-bold flex items-center gap-1">Ver Top 100 →</button>
                                     </motion.div>
                                 )}
                             </AnimatePresence>
                         </div>

                         <div 
                            className={`bg-gray-900/50 p-3 rounded-xl border border-gray-700 hover:border-purple-500/50 cursor-pointer transition-all ${expandedDetail === 'team' ? 'ring-2 ring-purple-500' : ''}`}
                            onClick={() => setExpandedDetail(expandedDetail === 'team' ? null : 'team')}
                         >
                             <div className="flex justify-between items-start mb-2">
                                 <p className="text-xs text-purple-400 font-bold uppercase flex items-center gap-1"><UserCog className="w-3 h-3"/> Equipe</p>
                                 <span className="text-[10px] text-gray-500">~15%</span>
                             </div>
                             <p className="text-lg font-bold text-white">R$ {(usageLimit.current_usage * 0.15).toFixed(2)}</p>
                             <AnimatePresence>
                                 {expandedDetail === 'team' && (
                                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 pt-3 border-t border-gray-700 text-[10px] space-y-1">
                                         <div className="flex justify-between text-gray-300"><span>Suporte</span><span>R$ 4,20</span></div>
                                         <div className="flex justify-between text-gray-300"><span>Vendas</span><span>R$ 3,00</span></div>
                                         <div className="flex justify-between text-gray-300"><span>Admin</span><span>R$ 3,20</span></div>
                                     </motion.div>
                                 )}
                             </AnimatePresence>
                         </div>

                         <div 
                            className={`bg-gray-900/50 p-3 rounded-xl border border-gray-700 hover:border-green-500/50 cursor-pointer transition-all ${expandedDetail === 'auto' ? 'ring-2 ring-green-500' : ''}`}
                            onClick={() => setExpandedDetail(expandedDetail === 'auto' ? null : 'auto')}
                         >
                             <div className="flex justify-between items-start mb-2">
                                 <p className="text-xs text-green-400 font-bold uppercase flex items-center gap-1"><Robot className="w-3 h-3"/> Autônomo</p>
                                 <span className="text-[10px] text-gray-500">~25%</span>
                             </div>
                             <p className="text-lg font-bold text-white">R$ {(usageLimit.current_usage * 0.25).toFixed(2)}</p>
                             <AnimatePresence>
                                 {expandedDetail === 'auto' && (
                                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 pt-3 border-t border-gray-700 text-[10px] space-y-1.5">
                                         <div className="flex justify-between items-center text-gray-300"><span className="flex items-center gap-1.5 truncate"><Film className="w-3 h-3 text-red-500"/> Vídeos</span><span className="font-mono text-white">R$ 1.2k</span></div>
                                         <div className="flex justify-between items-center text-gray-300"><span className="flex items-center gap-1.5 truncate"><FileText className="w-3 h-3 text-blue-400"/> Copy</span><span className="font-mono text-white">R$ 450</span></div>
                                         <div className="flex justify-between items-center text-gray-300"><span className="flex items-center gap-1.5 truncate"><Image className="w-3 h-3 text-pink-500"/> Img</span><span className="font-mono text-white">R$ 680</span></div>
                                         <button onClick={(e) => { e.stopPropagation(); setActiveModal('toolsReport'); }} className="text-green-400 hover:text-white hover:underline w-full text-left mt-2 font-bold flex items-center gap-1">Relatório Completo →</button>
                                     </motion.div>
                                 )}
                             </AnimatePresence>
                         </div>
                     </div>
                 </div>
            </Card>

            <DetailedModal isOpen={activeModal === 'top100'} onClose={() => setActiveModal(null)} title="Top 100 Alunos - Maior Consumo IA">
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-700">
                        <div>
                            <p className="text-gray-400 text-xs uppercase font-bold">Custo Total (Top 100)</p>
                            <p className="text-2xl font-black text-white">R$ 3.840,20</p>
                        </div>
                        <Button variant="secondary" className="!text-xs">Exportar CSV</Button>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-700 text-gray-300 uppercase text-xs font-bold">
                            <tr><th className="px-4 py-3">Pos</th><th className="px-4 py-3">Aluno</th><th className="px-4 py-3">Plano</th><th className="px-4 py-3">Gasto</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {topStudents.map((s, idx) => (
                                <tr key={s.id} className="hover:bg-gray-700/30">
                                    <td className="px-4 py-3">{idx+1}º</td><td className="px-4 py-3 font-bold text-white">{s.name}</td><td className="px-4 py-3 text-xs">{s.plan}</td><td className="px-4 py-3 font-mono text-white">R$ {s.spent}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </DetailedModal>

            <DetailedModal isOpen={activeModal === 'toolsReport'} onClose={() => { setActiveModal(null); setSelectedToolMetric('total'); }} title="Consumo Detalhado por Ferramenta">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className={`bg-gray-900 p-5 rounded-xl border cursor-pointer transition-all ${selectedToolMetric === 'video' ? 'border-red-500 bg-red-900/10' : 'border-gray-700'}`} onClick={() => setSelectedToolMetric('video')}>
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Film className="w-5 h-5 text-red-500"/> Vídeo</h4>
                        <div className="flex justify-between text-sm border-t border-gray-700 pt-2"><span className="text-gray-300 font-bold">Custo</span><span className="text-red-400 font-black">R$ 1.2k</span></div>
                    </div>
                    {/* Add other tool cards similarly if needed */}
                </div>
                
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 relative">
                     {selectedToolMetric !== 'total' && (
                         <div className="absolute top-4 right-4 z-10">
                             <Button onClick={() => setSelectedToolMetric('total')} className="!py-1 !px-2 !text-[10px] !bg-gray-700 hover:!bg-gray-600">Ver Visão Geral</Button>
                         </div>
                     )}
                     <h4 className="text-white font-bold mb-4 flex items-center gap-2"><TrendingUp className={`w-5 h-5 ${selectedToolMetric === 'total' ? 'text-brand-primary' : 'text-white'}`}/> Tendência: {getChartLabel()}</h4>
                     <div key={selectedToolMetric} className="h-48 flex items-end gap-2 px-2 mt-6 bg-gray-900/50 rounded-lg border border-gray-700 p-4 relative">
                         {chartData.map((val, i) => (
                             <div key={i} className="flex-1 h-full bg-gray-800/30 rounded-t relative group overflow-hidden hover:bg-gray-800/50 transition-colors">
                                 <motion.div 
                                    className={`absolute bottom-0 w-full rounded-t ${getChartColor()} opacity-90`}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${val}%` }}
                                    transition={{ type: "spring", bounce: 0, duration: 0.8, delay: i * 0.02 }}
                                 ></motion.div>
                             </div>
                         ))}
                     </div>
                </div>
            </DetailedModal>
        </>
    );
};
