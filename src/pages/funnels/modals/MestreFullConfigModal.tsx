
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import { Sliders, X as XIcon, TrendingUp, ActivityIcon, ShieldCheck } from '../../../components/Icons';
import { MestreFullConfig } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    config: MestreFullConfig;
    onSave: (cfg: MestreFullConfig) => void;
}

export const MestreFullConfigModal: React.FC<Props> = ({ isOpen, onClose, config, onSave }) => {
    const [localConfig, setLocalConfig] = useState<MestreFullConfig>(config);

    useEffect(() => { setLocalConfig(config); }, [config]);

    if (!isOpen) return null;

    const handleChange = (field: keyof MestreFullConfig, value: string) => {
        setLocalConfig(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[110] p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-800 w-full max-w-2xl rounded-2xl border border-yellow-500/30 shadow-2xl p-6 relative overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sliders className="w-6 h-6 text-yellow-500" /> Parâmetros do Modo Mestre Full
                    </h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-green-400 uppercase mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Avaliação Exata para Liberar Escala
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">ROAS Real Mínimo (x)</label>
                                <input className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" type="number" step="0.1" value={localConfig.scaleRoasThreshold} onChange={e => handleChange('scaleRoasThreshold', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Taxa Conversão Página Mínima (%)</label>
                                <input className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" type="number" step="0.1" value={localConfig.scaleConversionThreshold} onChange={e => handleChange('scaleConversionThreshold', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Taxa Novos Alunos Reais (%)</label>
                                <input className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" type="number" step="0.1" value={localConfig.scaleNewStudentsThreshold} onChange={e => handleChange('scaleNewStudentsThreshold', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-red-400 uppercase mb-3 flex items-center gap-2">
                            <ActivityIcon className="w-4 h-4" /> Sensores de Desgaste e Regras Implacáveis
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Queda Retenção em 6h (%)</label>
                                <input className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" type="number" step="1" value={localConfig.wearRetentionDrop} onChange={e => handleChange('wearRetentionDrop', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Queda Conversão Página em 6h/8h (%)</label>
                                <input className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" type="number" step="1" value={localConfig.conversionDropThreshold} onChange={e => handleChange('conversionDropThreshold', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Pausa Automática se ROAS menor que</label>
                                <input className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" type="number" step="0.1" value={localConfig.pauseRoasThreshold} onChange={e => handleChange('pauseRoasThreshold', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Limite Conversão para Escalar (%)</label>
                                <input className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" type="number" step="0.1" value={localConfig.minConversionScale} onChange={e => handleChange('minConversionScale', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-blue-400 uppercase mb-3 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Gestão de Risco e Orçamento
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Máx. Orçamento em Única Página (%)</label>
                                <input className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" type="number" step="1" value={localConfig.maxBudgetConcentration} onChange={e => handleChange('maxBudgetConcentration', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Máx. Orçamento em Única Campanha (%)</label>
                                <input className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" type="number" step="1" value={localConfig.diversificationCap} onChange={e => handleChange('diversificationCap', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Notificar Faturamento Acima de (R$)</label>
                                <input className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" type="number" step="100" value={localConfig.revenueNotification} onChange={e => handleChange('revenueNotification', e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8 pt-4 border-t border-gray-700">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button onClick={() => { onSave(localConfig); onClose(); }} className="flex-1 !bg-yellow-500 hover:!bg-yellow-400 text-black font-bold">
                        Salvar Parâmetros
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
