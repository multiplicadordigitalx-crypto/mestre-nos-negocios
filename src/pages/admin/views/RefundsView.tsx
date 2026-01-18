
import React from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { CheckCircle } from '../../../components/Icons';
import { RefundRequest } from '../../../types';

interface RefundsViewProps {
    requests: RefundRequest[];
    onOpenTriage: (r: RefundRequest) => void;
    onOpenApproval: (r: RefundRequest) => void;
    currentUserRole: string;
}

const RefundsView: React.FC<RefundsViewProps> = ({ requests, onOpenTriage, onOpenApproval, currentUserRole }) => { 
    const list = requests.filter(r => { if (currentUserRole === 'super_admin') { return r.status === 'pending_admin' || r.status === 'pending_support'; } return r.status === 'pending_support'; }); 
    const calculateGuaranteeStatus = (purchaseDateStr: string) => { const purchaseDate = new Date(purchaseDateStr); const deadline = new Date(purchaseDate); deadline.setDate(deadline.getDate() + 7); deadline.setHours(23, 59, 59, 999); return new Date() <= deadline; }; 
    return ( <div> <h2 className="text-xl font-bold text-white mb-4">Gestão de Reembolsos ({currentUserRole === 'super_admin' ? 'Visão Geral' : 'Triagem'})</h2> {list.length === 0 ? <p className="text-gray-500">Nenhum pedido na fila.</p> : ( <div className="space-y-4"> {list.map(req => { const isGuarantee = calculateGuaranteeStatus(req.purchaseDate); const canAct = (currentUserRole === 'super_admin' && req.status === 'pending_admin') || (currentUserRole !== 'super_admin' && req.status === 'pending_support'); return ( <Card key={req.id} className={`p-4 flex justify-between items-center ${!canAct ? 'opacity-60' : ''}`}> <div> <div className="flex items-center gap-2 mb-1"> <p className="text-white font-bold">{req.studentName}</p> {isGuarantee && ( <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded font-bold border border-green-500/30"> Garantia (7 Dias) </span> )} <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${req.status === 'pending_admin' ? 'text-yellow-400 border-yellow-500/30' : 'text-blue-400 border-blue-500/30'}`}> {req.status === 'pending_admin' ? 'Aguardando Admin' : 'Aguardando Suporte'} </span> </div> <p className="text-gray-400 text-sm">R$ {req.amount} • {req.reason}</p> {req.status === 'pending_admin' && req.processedBy && ( <p className="text-xs text-blue-300 mt-1 flex items-center gap-1"> <CheckCircle className="w-3 h-3"/> Triagem por: {req.processedBy} </p> )} <p className="text-xs text-gray-500">{new Date(req.requestDate).toLocaleDateString()}</p> </div> <Button onClick={() => { if (req.status === 'pending_admin') onOpenApproval(req); else onOpenTriage(req); }} disabled={!canAct} className={req.status === 'pending_admin' ? '!bg-red-600 hover:!bg-red-500' : ''} > {req.status === 'pending_admin' ? 'Decisão Final' : (!canAct && currentUserRole === 'super_admin') ? 'Aguardando Triagem' : 'Analisar'} </Button> </Card> ); })} </div> )} </div> ); 
};

export default RefundsView;
