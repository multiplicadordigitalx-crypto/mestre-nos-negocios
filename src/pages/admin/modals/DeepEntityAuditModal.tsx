
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, DollarSign, TrendingUp, BarChart3, CreditCard, PieChart, User, Package, Layers, Activity } from '../../../components/Icons';
import Button from '../../../components/Button';
import { getStudentDeepAudit, getProductDeepAudit } from '../../../services/mockFirebase';

interface DeepEntityAuditModalProps {
    type: 'student' | 'product';
    entityId: string;
    onClose: () => void;
}

export const DeepEntityAuditModal: React.FC<DeepEntityAuditModalProps> = ({ type, entityId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const auditData = type === 'student'
                ? await getStudentDeepAudit(entityId)
                : await getProductDeepAudit(entityId);
            setData(auditData);
            setLoading(false);
        };
        load();
    }, [type, entityId]);

    const renderStudentAudit = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Total LTV (Life Time Value)</p>
                    <h3 className="text-xl font-black text-white">R$ {data.ltv.toLocaleString()}</h3>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Custo Total APIs (Gasto Real)</p>
                    <h3 className="text-xl font-black text-red-400">R$ {data.apiCosts.toLocaleString()}</h3>
                </div>
                <div className="bg-green-900/20 p-4 rounded-xl border border-green-500/30">
                    <p className="text-green-400 text-[10px] font-bold uppercase mb-1">Lucro Líquido Real</p>
                    <h3 className="text-xl font-black text-green-400">R$ {data.netProfit.toLocaleString()}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-brand-primary" /> Histórico de Recargas
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        {data.creditHistory.map((h: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-gray-900 border border-gray-700 rounded-lg text-sm">
                                <div>
                                    <p className="text-white font-bold">{h.amount} Créditos</p>
                                    <p className="text-[10px] text-gray-500">{new Date(h.date).toLocaleDateString()}</p>
                                </div>
                                <span className="text-brand-primary font-bold">R$ {h.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-400" /> Uso de Inteligência Artificial
                    </h4>
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-4">
                        {Object.entries(data.apiUsageMetrics).map(([key, val]: any, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400 uppercase font-bold">{key}</span>
                                    <span className="text-white">{val} reqs</span>
                                </div>
                                <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full" style={{ width: `${(val / 150) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-500/20 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Package className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">Participação no Ecossistema</p>
                        <p className="text-xs text-gray-400">Possui {data.productsPublishedCount} produto publicado e {data.purchasedCoursesCount} cursos comprados.</p>
                    </div>
                </div>
                <Button variant="secondary" className="!py-1 !px-3 !text-xs">Ver Perfil Completo</Button>
            </div>
        </div>
    );

    const renderProductAudit = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 md:col-span-1">
                    <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Produtor</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-black font-bold text-xs uppercase">
                            {data.producerName.substring(0, 1)}
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">{data.producerName}</p>
                            <p className="text-[10px] text-gray-500 font-mono">#{data.producerId}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Faturamento Vitalício</p>
                    <h3 className="text-xl font-black text-white">R$ {data.lifetimeVolume.toLocaleString()}</h3>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Taxa de Reembolso</p>
                    <h3 className={`text-xl font-black ${data.refundRate > 5 ? 'text-red-400' : 'text-green-400'}`}>{data.refundRate}%</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-orange-400" /> Distribuição de Margem
                    </h4>
                    <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Produtor</span>
                                    <span className="text-white font-bold">{data.netMarginDistribution.producer}%</span>
                                </div>
                                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div className="bg-brand-primary h-full" style={{ width: `${data.netMarginDistribution.producer}%` }}></div>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Plataforma (Taxa)</span>
                                    <span className="text-white font-bold">{data.netMarginDistribution.platform}%</span>
                                </div>
                                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full" style={{ width: `${data.netMarginDistribution.platform}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col h-full justify-between">
                    <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" /> Histórico Recente (3 meses)
                    </h4>
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex-1 flex flex-col justify-around">
                        {data.monthlySalesHistory.map((m: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-bold">{m.month}</span>
                                <div className="flex-1 mx-4 h-2 bg-gray-700 rounded-full overflow-hidden max-w-[120px]">
                                    <div className="bg-green-500 h-full" style={{ width: `${(m.volume / 15000) * 100}%` }}></div>
                                </div>
                                <span className="text-white font-bold">R$ {m.volume.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[210] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-gray-900 w-full max-w-4xl rounded-[2.5rem] border border-brand-primary/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 border-b border-gray-800 bg-[#0a0a0a] flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-primary/20 rounded-2xl border border-brand-primary/30 shadow-lg shadow-brand-primary/10">
                            {type === 'student' ? <User className="w-6 h-6 text-brand-primary" /> : <Package className="w-6 h-6 text-brand-primary" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                                Auditoria de Inteligência Financeira
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-gray-700 uppercase tracking-widest">Nexus Deep Intel</span>
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">Análise aprofundada de resultados e custos para {type === 'student' ? 'usuário' : 'produto'} <span className="text-brand-primary font-mono ml-1">#{entityId}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-2xl text-gray-400 hover:text-white transition-all active:scale-90">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin shadow-lg shadow-brand-primary/20"></div>
                            <p className="text-brand-primary font-bold animate-pulse uppercase tracking-widest text-xs">Consultando Redes Nexus Intelligence...</p>
                        </div>
                    ) : (
                        type === 'student' ? renderStudentAudit() : renderProductAudit()
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-gray-800 bg-[#0a0a0a] flex justify-between items-center">
                    <p className="text-[10px] text-gray-500 max-w-xs leading-relaxed italic">
                        *Estes dados são baseados em logs reais de gateway, consumo de servidor e métricas de engajamento vitalício. Use-os para tomar decisões estratégicas de bonificação ou retenção.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={onClose}>Fechar Auditoria</Button>
                        <Button className="!bg-brand-primary text-black font-bold">Exportar Relatório Estratégico</Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
