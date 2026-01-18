
import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import { ShieldCheck, Search, Info, AlertTriangle, CheckCircle, XCircle, Lock, Eye } from '../../../components/Icons';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { ActivityLog, LoginAttemptLog } from '../../../types';
import { getAuditLogs, getLoginLogs } from '../../../services/mockFirebase';
import { motion, AnimatePresence } from 'framer-motion';

const AuditView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'logins' | 'sensitive'>('general');

    // Data State
    const [auditLogs, setAuditLogs] = useState<ActivityLog[]>([]);
    const [loginLogs, setLoginLogs] = useState<LoginAttemptLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filter, setFilter] = useState<'all' | 'team' | 'sales' | 'students'>('all');
    const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
    const [search, setSearch] = useState('');

    // Modal / Details State
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [aLogs, lLogs] = await Promise.all([getAuditLogs(), getLoginLogs()]);
        setAuditLogs(aLogs);
        setLoginLogs(lLogs);
        setLoading(false);
    };

    // --- UTILS ---
    const getSeverityBadge = (s?: string) => {
        switch (s) {
            case 'critical': return <span className="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider animate-pulse">CRÍTICO</span>;
            case 'high': return <span className="bg-orange-500/20 text-orange-500 border border-orange-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">ALTO</span>;
            case 'medium': return <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">MÉDIO</span>;
            case 'low': return <span className="bg-gray-500/20 text-gray-400 border border-gray-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">BAIXO</span>;
            default: return null;
        }
    };

    const getActionColor = (action: string) => {
        if (action.includes('BLOCK') || action.includes('REJECTED')) return 'bg-red-500/10 text-red-400 border-red-500/20';
        if (action.includes('REFUND')) return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        if (action.includes('APPROVE') || action.includes('SUCCESS')) return 'bg-green-500/10 text-green-400 border-green-500/20';
        if (action.includes('LOGIN')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        return 'bg-gray-700 text-gray-300 border-gray-600';
    };

    // --- FILTERING ---
    const getFilteredAuditLogs = () => {
        let result = auditLogs;

        // Tab Specific Filtering
        if (activeTab === 'sensitive') {
            result = result.filter(l => ['high', 'critical'].includes(l.severity || ''));
        }

        // Role Filter
        if (filter === 'team') result = result.filter(l => ['super_admin', 'support', 'finance', 'system'].includes(l.userRole || ''));
        else if (filter === 'sales') result = result.filter(l => l.userRole === 'sales_agent' || l.userRole === 'sales_manager');
        else if (filter === 'students') result = result.filter(l => l.userRole === 'student');

        // Severity Filter
        if (severityFilter !== 'all') result = result.filter(l => l.severity === severityFilter);

        // Search
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(l =>
                l.userName.toLowerCase().includes(lower) ||
                l.action.toLowerCase().includes(lower) ||
                l.target.toLowerCase().includes(lower) ||
                (l.details && l.details.toLowerCase().includes(lower))
            );
        }

        return result;
    };

    const filteredLogs = getFilteredAuditLogs();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-brand-primary" /> Auditoria & Segurança
                    </h2>
                    <p className="text-gray-400 text-sm">Monitoramento 360º de todas as ações da plataforma.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar IP, user, ação..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-brand-primary outline-none transition-colors"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-700 w-fit">
                {[
                    { id: 'general', label: 'Atividade Geral', icon: <Info className="w-4 h-4" /> },
                    { id: 'logins', label: 'Monitor de Acessos', icon: <Lock className="w-4 h-4" /> },
                    { id: 'sensitive', label: 'Financeiro & Sensível', icon: <AlertTriangle className="w-4 h-4" /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <Card className="overflow-hidden min-h-[500px] border-gray-700 bg-gray-800/50">
                {loading ? (
                    <div className="flex justify-center items-center h-full py-20"><LoadingSpinner /></div>
                ) : (
                    <>
                        {/* Toolbar for Audit Logs (General & Sensitive) */}
                        {activeTab !== 'logins' && (
                            <div className="p-4 border-b border-gray-700 flex flex-wrap gap-4 items-center bg-gray-800/80">
                                <div className="flex items-center gap-2 text-xs text-gray-400 font-mono uppercase tracking-widest border-r border-gray-700 pr-4">
                                    <FilterIcon className="w-4 h-4" /> Filtros
                                </div>
                                <div className="flex gap-2">
                                    {[{ id: 'all', label: 'Todos' }, { id: 'team', label: 'Equipe' }, { id: 'sales', label: 'Vendas' }, { id: 'students', label: 'Alunos' }].map(f => (
                                        <button key={f.id} onClick={() => setFilter(f.id as any)} className={`px-3 py-1 text-xs rounded-md border transition-colors ${filter === f.id ? 'bg-gray-700 border-gray-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>{f.label}</button>
                                    ))}
                                </div>
                                <div className="h-4 w-px bg-gray-700 mx-2" />
                                <div className="flex gap-2">
                                    {[{ id: 'all', label: 'Qualquer Nível' }, { id: 'critical', label: 'Crítico' }, { id: 'high', label: 'Alto' }].map(s => (
                                        <button key={s.id} onClick={() => setSeverityFilter(s.id as any)} className={`px-3 py-1 text-xs rounded-md border transition-colors ${severityFilter === s.id ? 'bg-gray-700 border-gray-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>{s.label}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TABLE: Audit Logs */}
                        {activeTab !== 'logins' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-900/50 text-gray-400 text-xs uppercase font-bold sticky top-0">
                                        <tr>
                                            <th className="px-6 py-4">Severidade</th>
                                            <th className="px-6 py-4">Ação</th>
                                            <th className="px-6 py-4">Agente</th>
                                            <th className="px-6 py-4">Detalhes</th>
                                            <th className="px-6 py-4 text-right">Data</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {filteredLogs.length === 0 ? (
                                            <tr><td colSpan={6} className="p-8 text-center text-gray-500 italic">Nenhum registro encontrado para os filtros atuais.</td></tr>
                                        ) : filteredLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-gray-700/30 transition-colors group">
                                                <td className="px-6 py-4">{getSeverityBadge(log.severity)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getActionColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white border border-gray-600">
                                                            {log.userName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium text-xs truncate max-w-[120px]">{log.userName}</p>
                                                            <p className="text-[10px] text-gray-500 uppercase">{log.userRole}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300 text-xs font-mono max-w-xs truncate" title={log.target}>
                                                    {log.target}
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-400 text-xs font-mono">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedLog(log)}
                                                        className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline text-xs font-bold"
                                                    >
                                                        + DETALHES
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TABLE: Login Logs */}
                        {activeTab === 'logins' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-900/50 text-gray-400 text-xs uppercase font-bold sticky top-0">
                                        <tr>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Usuário/Email</th>
                                            <th className="px-6 py-4">IP / Dispositivo</th>
                                            <th className="px-6 py-4 text-right">Data</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {loginLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    {log.status === 'success' && <div className="flex items-center gap-2 text-green-400 text-xs font-bold bg-green-500/10 px-2 py-1 rounded w-fit"><CheckCircle className="w-3 h-3" /> SUCESSO</div>}
                                                    {log.status === 'failed' && <div className="flex items-center gap-2 text-orange-400 text-xs font-bold bg-orange-500/10 px-2 py-1 rounded w-fit"><XCircle className="w-3 h-3" /> FALHA</div>}
                                                    {log.status === 'blocked' && <div className="flex items-center gap-2 text-red-400 text-xs font-bold bg-red-500/10 px-2 py-1 rounded w-fit"><Lock className="w-3 h-3" /> BLOQUEIO</div>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-white text-xs font-bold">{log.email}</p>
                                                    <p className="text-gray-500 text-[10px] font-mono">{log.userId !== 'unknown' ? `UID: ${log.userId}` : 'Não Identificado'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-gray-300 text-xs font-mono">{log.ip}</p>
                                                    <p className="text-gray-500 text-[10px]">{log.device}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right text-xs text-gray-400 font-mono">
                                                    {new Date(log.date).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* JSON Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedLog(null)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-brand-primary" /> Detalhes do Registro
                                </h3>
                                <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-white">✕</button>
                            </div>
                            <div className="p-6 overflow-y-auto space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-800 rounded-lg">
                                        <p className="text-[10px] uppercase text-gray-500 font-bold">ID do Evento</p>
                                        <p className="text-xs text-white font-mono">{selectedLog.id}</p>
                                    </div>
                                    <div className="p-3 bg-gray-800 rounded-lg">
                                        <p className="text-[10px] uppercase text-gray-500 font-bold">Severidade</p>
                                        <div className="mt-1">{getSeverityBadge(selectedLog.severity)}</div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Payload Completo (Metadata)</p>
                                    <pre className="bg-black/50 p-4 rounded-lg text-xs text-green-400 font-mono overflow-auto border border-gray-700/50">
                                        {selectedLog.details}
                                        {/* If details is just text properly handling it above in map, but assuming JSON here */}
                                    </pre>
                                </div>
                            </div>
                            <div className="p-4 border-t border-gray-700 bg-gray-800 flex justify-end">
                                <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs font-bold transition-colors">Fechar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FilterIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);

export default AuditView;
