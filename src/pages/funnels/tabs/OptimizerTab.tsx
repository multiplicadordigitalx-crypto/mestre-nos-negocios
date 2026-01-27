
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../../../components/Card';
import { Globe, LockClosed, CheckCircle, Pencil, ActivityIcon, Eye } from '../../../components/Icons';
import { Variation } from '../types';
import toast from 'react-hot-toast';
import { LeadModeModal } from '../modals/FunnelsModals';

interface Props {
    variations: Variation[];
    budgetCap: number;
    setBudgetCap: (val: number) => void;
}

export const OptimizerTab: React.FC<Props> = ({ variations, budgetCap, setBudgetCap }) => {
    const [isCleanSubdomains, setIsCleanSubdomains] = useState(true);
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [tempBudget, setTempBudget] = useState(budgetCap.toString());
    const [showLeadMode, setShowLeadMode] = useState(false);

    const handleBudgetSave = () => {
        const val = parseFloat(tempBudget);
        if (isNaN(val) || val <= 0) return toast.error("Valor inválido");
        setBudgetCap(val);
        setIsEditingBudget(false);
        toast.success(`Novo teto de orçamento definido: R$ ${val.toFixed(2)}`);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-5 rounded-xl border border-orange-500/30 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-orange-500" /> Subdomínios Limpos</h3>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={isCleanSubdomains} onChange={e => setIsCleanSubdomains(e.target.checked)} />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400">
                        Cria subdomínio virgem para cada variação (ex: v1-oferta.site.com) usando a API do seu provedor. Evita cookies sujos e bloqueios.
                    </p>
                </div>

                <div className="bg-gray-800 p-5 rounded-xl border border-red-500/30 shadow-lg flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-bold flex items-center gap-2"><LockClosed className="w-5 h-5 text-red-500" /> TETO ORÇAMENTÁRIO</h3>
                        <p className="text-xs text-gray-400 mt-1">Lei do Orçamento Controlado por Variação.</p>
                    </div>
                    <div className="text-right">
                        {isEditingBudget ? (
                            <div className="flex items-center gap-2">
                                <span className="text-white text-sm">R$</span>
                                <input
                                    type="number"
                                    className="w-20 bg-gray-900 border border-red-500/50 rounded px-2 py-1 text-white text-sm font-bold focus:outline-none"
                                    value={tempBudget}
                                    onChange={e => setTempBudget(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleBudgetSave()}
                                    autoFocus
                                />
                                <button onClick={handleBudgetSave} className="bg-green-600 hover:bg-green-500 p-1 rounded text-white"><CheckCircle className="w-4 h-4" /></button>
                            </div>
                        ) : (
                            <div
                                className="bg-red-500/10 border border-red-500/30 px-3 py-1 rounded text-red-400 text-lg font-bold flex items-center gap-2 cursor-pointer hover:bg-red-500/20 transition-colors"
                                onClick={() => { setTempBudget(budgetCap.toString()); setIsEditingBudget(true); }}
                                title="Clique para editar"
                            >
                                R$ {budgetCap.toFixed(2)} <Pencil className="w-3 h-3 opacity-50" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Card className="p-6 bg-gray-800">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <ActivityIcon className="w-5 h-5 text-brand-primary" /> Testes A/B/C em Andamento
                </h3>

                <div className="space-y-4">
                    {variations.map((v) => (
                        <div key={v.id} className={`p-4 rounded-xl border ${v.status === 'active' ? 'bg-green-900/10 border-green-500/30' : v.status === 'killed' ? 'bg-red-900/10 border-red-500/30' : 'bg-gray-900 border-gray-700'}`}>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${v.status === 'active' ? 'bg-green-500 text-black' : v.status === 'killed' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'}`}>
                                        {v.id}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">{v.name}</p>
                                        <p className="text-xs text-gray-500 font-mono">{v.subdomain}</p>
                                    </div>
                                </div>

                                <div className="flex gap-6 text-center">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase">Conversão</p>
                                        <p className={`font-bold ${v.status === 'active' ? 'text-green-400' : 'text-white'}`}>{v.conv}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase">ROAS</p>
                                        <p className={`font-bold ${v.roas > 4 ? 'text-purple-400' : 'text-white'}`}>{v.roas}x</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase">Custo</p>
                                        <p className="text-white font-bold">{v.cost}</p>
                                    </div>
                                </div>

                                <div className="text-right min-w-[100px] flex flex-col gap-1 items-end">
                                    {v.status === 'active' && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30 font-bold">VENCEDOR</span>}
                                    {v.status === 'testing' && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded border border-green-500/30 font-bold">TESTANDO</span>}
                                    {v.status === 'killed' && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30 font-bold">ELIMINADO</span>}
                                    <button onClick={() => setShowLeadMode(true)} className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1"><Eye className="w-3 h-3" /> Ver</button>
                                </div>
                            </div>

                            <div className="mt-3 relative w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${v.status === 'killed' ? 'bg-red-500' : 'bg-brand-primary'}`}
                                    style={{ width: `${(parseFloat(v.cost.replace('R$ ', '').replace(',', '.')) / budgetCap) * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-[9px] text-right text-gray-500 mt-1">Orçamento Gasto / Teto R$ {budgetCap.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </Card>

            <LeadModeModal isOpen={showLeadMode} onClose={() => setShowLeadMode(false)} title="Página Vendas Exemplo" />
        </motion.div>
    );
};
