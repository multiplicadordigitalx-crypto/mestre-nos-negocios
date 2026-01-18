
import React from 'react';
import { RefundRequest } from '../../../types';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { DollarSign, User, AlertTriangle, Calendar } from '../../../components/Icons';

export const RefundsTriageView: React.FC<{ requests: RefundRequest[], onAnalyze: (r: RefundRequest) => void }> = ({ requests, onAnalyze }) => {
    const pending = requests.filter(r => r.status === 'pending_support');
    return (
        <div className="p-6 overflow-y-auto h-full custom-scrollbar">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><DollarSign className="w-6 h-6 text-red-400"/> Triagem de Reembolsos</h2>
            {pending.length === 0 ? <div className="text-center py-20 text-gray-500 bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-700"><p>Sem pedidos para triagem.</p></div> : (
                <div className="space-y-4">
                    {pending.map(req => (
                        <Card key={req.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-800 border-gray-700 shadow-xl group hover:border-red-500/50 transition-all">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center border border-red-500/20 text-red-400"><DollarSign className="w-6 h-6"/></div>
                                <div>
                                    <p className="text-white font-bold">{req.studentName} <span className="text-gray-400 font-normal text-sm">({req.studentEmail})</span></p>
                                    <p className="text-sm text-gray-400 mt-0.5 italic line-clamp-1">Motivo: {req.reason}</p>
                                    <div className="flex gap-3 mt-1 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> Compra: {new Date(req.purchaseDate).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1 text-green-400"><DollarSign className="w-3 h-3"/> Valor: R$ {req.amount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={() => onAnalyze(req)} className="!bg-red-600 hover:!bg-red-500 font-black uppercase text-xs !py-3 !px-8 mt-4 md:mt-0 shadow-lg shadow-red-900/20">Analisar</Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
