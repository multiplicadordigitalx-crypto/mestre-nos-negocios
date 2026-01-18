
import React from 'react';
import { LinkRequest } from '../../../types';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { Link as LinkIcon, ShoppingBag, Calendar, User } from '../../../components/Icons';

export const LinksApprovalView: React.FC<{ requests: LinkRequest[], onAnalyze: (r: LinkRequest) => void }> = ({ requests, onAnalyze }) => {
    const pending = requests.filter(r => r.status === 'pending');
    return (
        <div className="p-6 overflow-y-auto h-full custom-scrollbar">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><LinkIcon className="w-6 h-6 text-brand-primary"/> Solicitações de Afiliação</h2>
            {pending.length === 0 ? <div className="text-center py-20 text-gray-500 bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-700"><p>Nenhuma solicitação pendente.</p></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pending.map(req => (
                        <Card key={req.id} className="p-5 border-l-4 border-l-yellow-500 bg-gray-800 shadow-xl flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-white text-lg">{req.studentName}</h3>
                                <span className="text-[10px] text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(req.requestDate).toLocaleDateString()}</span>
                            </div>
                            <div className="space-y-2 mb-6 flex-1">
                                <p className="text-sm text-gray-400 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-brand-primary"/> Produto: <strong className="text-white">{req.productName}</strong></p>
                                <p className="text-xs text-gray-500 flex items-center gap-2"><User className="w-4 h-4"/> E-mail: {req.studentEmail}</p>
                            </div>
                            <Button onClick={() => onAnalyze(req)} className="w-full !py-2 !text-xs !bg-blue-600 hover:!bg-blue-500 font-black uppercase tracking-widest">Analisar & Aprovar</Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
