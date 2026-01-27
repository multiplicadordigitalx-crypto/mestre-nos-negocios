
import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { RotateCcw, Settings, Clock, Trash, Brain, ActivityIcon, CheckCircle, X as XIcon } from '../../../components/Icons';
import toast from 'react-hot-toast';

interface RecoveryRule {
    id: string;
    hours: number;
    script: string;
}

interface RecoveryLead {
    id: string;
    phone: string;
    status: 'waiting' | 'attempt_1' | 'attempt_2' | 'attempt_3' | 'recovered' | 'failed';
    tag: string;
    timestamp: number;
    nextAttempt: number;
}

export const SalesRecoveryWidget: React.FC = () => {
    const [rules, setRules] = useState<RecoveryRule[]>([
        { id: '1', hours: 3, script: "Oi [Nome], vi que você gerou o checkout mas não finalizou. Aconteceu algo? Segura sua vaga aqui: [Link]" },
    ]);
    const [newRule, setNewRule] = useState({ hours: 3, script: '' });
    const [isAddingRule, setIsAddingRule] = useState(false);

    const [recoveryLeads, setRecoveryLeads] = useState<RecoveryLead[]>([
        { id: '1', phone: '(11) 99999-1111', status: 'waiting', tag: 'Link Checkout', timestamp: Date.now() - 7200000, nextAttempt: Date.now() + 3600000 },
        { id: '2', phone: '(21) 98888-2222', status: 'attempt_1', tag: 'Link Sales Page', timestamp: Date.now() - 86400000, nextAttempt: Date.now() + 100000 },
        { id: '3', phone: '(31) 97777-3333', status: 'recovered', tag: 'Link Checkout', timestamp: Date.now() - 10000000, nextAttempt: 0 },
    ]);

    const recoveredCount = recoveryLeads.filter(l => l.status === 'recovered').length;
    const failedCount = recoveryLeads.filter(l => l.status === 'failed').length;
    const activeCount = recoveryLeads.filter(l => l.status !== 'recovered' && l.status !== 'failed').length;

    useEffect(() => {
        const interval = setInterval(() => {
            setRecoveryLeads(current => current.map(lead => {
                if (lead.status === 'recovered' || lead.status === 'failed') return lead;
                if (Math.random() > 0.98) {
                    toast.success(`Venda recuperada! Lead ${lead.phone} comprou.`, { icon: '💰' });
                    return { ...lead, status: 'recovered' };
                }
                if (Date.now() > lead.nextAttempt) {
                    if (lead.status === 'waiting') {
                        toast(`Bot Alex: Enviando recuperação para ${lead.phone}`, { icon: '🤖' });
                        return { ...lead, status: 'attempt_1', nextAttempt: Date.now() + (24 * 60 * 60 * 1000) };
                    }
                    if (lead.status === 'attempt_1') {
                        return { ...lead, status: 'attempt_2', nextAttempt: Date.now() + (36 * 60 * 60 * 1000) };
                    }
                    if (lead.status === 'attempt_2') {
                        return { ...lead, status: 'failed', nextAttempt: 0 };
                    }
                }
                return lead;
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleAddRule = () => {
        if (!newRule.script.trim()) return toast.error("Script obrigatório");
        setRules([...rules, { id: Date.now().toString(), ...newRule }]);
        setNewRule({ hours: 3, script: '' });
        setIsAddingRule(false);
        toast.success("Regra de recuperação adicionada!");
    };

    const handleDeleteRule = (id: string) => {
        setRules(prev => prev.filter(r => r.id !== id));
    };

    return (
        <Card className="p-6 bg-gray-800 border-gray-700 shadow-xl border-l-4 border-l-orange-500 mt-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                        <RotateCcw className="w-6 h-6 text-orange-500" /> Recuperação de Vendas Automática 💰
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">O Bot Alex monitora leads pendentes e recupera vendas perdidas.</p>
                </div>
                <div className="flex gap-4 text-xs font-bold bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                    <span className="text-orange-400">Em Recuperação: {activeCount}</span>
                    <span className="text-green-400">Recuperados: {recoveredCount}</span>
                    <span className="text-red-400">Perdidos: {failedCount}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                <div className="space-y-6">
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2"><Settings className="w-4 h-4 text-gray-400" /> Regras de Disparo</h4>
                            <button onClick={() => setIsAddingRule(!isAddingRule)} className="text-xs text-brand-primary hover:underline">+ Nova Regra</button>
                        </div>

                        {isAddingRule && (
                            <div className="mb-4 bg-gray-800 p-3 rounded border border-gray-600 animate-fade-in">
                                <div className="mb-2">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold">Aguardar (Horas)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-xs outline-none focus:border-orange-500"
                                        value={newRule.hours}
                                        onChange={e => setNewRule({ ...newRule, hours: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold">Script de Mensagem</label>
                                    <textarea
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-xs outline-none focus:border-orange-500 h-20 resize-none"
                                        placeholder="Olá [Nome], vi que..."
                                        value={newRule.script}
                                        onChange={e => setNewRule({ ...newRule, script: e.target.value })}
                                    />
                                </div>
                                <Button onClick={handleAddRule} className="w-full !py-1 !text-xs !bg-orange-600 hover:!bg-orange-500">Salvar Regra</Button>
                            </div>
                        )}

                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {rules.map(rule => (
                                <div key={rule.id} className="bg-gray-800 p-3 rounded border border-gray-700 relative group">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-3 h-3 text-orange-400" />
                                        <span className="text-white text-xs font-bold">Aguardar {rule.hours}h</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 italic line-clamp-2">"{rule.script}"</p>
                                    <button onClick={() => handleDeleteRule(rule.id)} className="absolute top-2 right-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg text-xs text-blue-200">
                        <p className="font-bold mb-1 flex items-center gap-1"><Brain className="w-3 h-3" /> Inteligência Alex:</p>
                        <p>O bot lê o histórico da conversa antes de enviar a recuperação. Se o cliente já tiver comprado (Verificado via Nexus), a tag "Venda Concluída" é aplicada e o disparo cancelado.</p>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-700 flex flex-col h-[400px]">
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50 rounded-t-xl">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2"><ActivityIcon className="w-4 h-4 text-green-500" /> Fila de Processamento em Tempo Real</h4>
                        <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-1 rounded border border-gray-600">Atualizado: Agora</span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-800 text-gray-400 sticky top-0 font-bold uppercase">
                                <tr>
                                    <th className="p-3">Lead / Telefone</th>
                                    <th className="p-3">Tag de Origem</th>
                                    <th className="p-3">Entrada</th>
                                    <th className="p-3">Status / Próx. Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {recoveryLeads.map(lead => (
                                    <tr key={lead.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="p-3 font-mono text-white">{lead.phone}</td>
                                        <td className="p-3">
                                            <span className="bg-gray-800 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 font-bold text-[10px]">
                                                {lead.tag}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-400">{new Date(lead.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="p-3">
                                            {lead.status === 'recovered' ? (
                                                <span className="text-green-400 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Venda Concluída</span>
                                            ) : lead.status === 'failed' ? (
                                                <span className="text-red-400 font-bold flex items-center gap-1"><XIcon className="w-3 h-3" /> Falha (3 tentativas)</span>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-orange-400 font-bold uppercase">{lead.status.replace('_', ' ')}</span>
                                                    {lead.nextAttempt > 0 && <span className="text-[9px] text-gray-500">Próx: {new Date(lead.nextAttempt).toLocaleTimeString()}</span>}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Card>
    );
};
