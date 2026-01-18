
import React from 'react';
import Card from '../../../../../components/Card';
import Button from '../../../../../components/Button';
import Input from '../../../../../components/Input';
import { Settings, Brain } from '../../../../../components/Icons';

export const GeneralRulesTab: React.FC = () => (
    <div className="space-y-6 animate-fade-in">
        <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400"/> Regras Globais de Consumo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Créditos Gratuitos (Recorrência)</label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input type="number" placeholder="0" defaultValue="5" />
                            </div>
                            <select className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm outline-none">
                                <option>Diário</option>
                                <option>Semanal</option>
                                <option>Mensal</option>
                                <option>Único (Cadastro)</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl">
                    <h4 className="text-blue-300 font-bold text-sm mb-2 flex items-center gap-2">
                         <Brain className="w-4 h-4"/> Proteção Financeira (Nexus Guard)
                    </h4>
                    <p className="text-xs text-blue-200 leading-relaxed">
                        O sistema Nexus IA monitora o uso em tempo real. Se o custo da API exceder a margem definida no combo, a ferramenta será temporariamente limitada para evitar prejuízo.
                    </p>
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <Button className="!bg-green-600 hover:!bg-green-500 font-bold">Salvar Regras</Button>
            </div>
        </Card>
    </div>
);
