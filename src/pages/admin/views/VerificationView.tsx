
import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { VerificationRequest } from '../../../types';
import { getVerificationQueue, verifyProductStats } from '../../../services/mockFirebase';
import toast from 'react-hot-toast';

const VerificationView: React.FC = () => { 
    const [queue, setQueue] = useState<VerificationRequest[]>([]); 
    useEffect(() => { getVerificationQueue().then(setQueue); }, []); 
    const handleAction = async (id: string, approved: boolean) => { await verifyProductStats(id, approved); setQueue(q => q.filter(x => x.id !== id)); toast.success(approved ? "Verificado" : "Rejeitado"); }; 
    return ( <div> <h2 className="text-xl font-bold text-white mb-4">Fila de Verificação de Postagens</h2> <div className="space-y-4"> {queue.map(req => ( <Card key={req.id} className="p-4"> <div className="flex justify-between items-start mb-4"> <div> <p className="font-bold text-white">{req.studentName}</p> <p className="text-sm text-gray-400">{req.productName}</p> </div> <div className="text-right"> <p className="text-xs text-gray-500">Posts Declarados</p> <p className="font-bold text-white text-lg">{req.totalPosts}</p> </div> </div> <div className="flex flex-wrap gap-2 mb-4"> {req.socialProfiles.map((p, i) => ( <a key={i} href={p.url} target="_blank" rel="noreferrer" className="text-xs bg-gray-700 px-2 py-1 rounded text-blue-300 hover:text-white border border-gray-600"> {p.network}: {p.url} </a> ))} </div> <div className="flex gap-2"> <Button variant="secondary" onClick={() => handleAction(req.id, false)} className="flex-1 !py-1 text-red-400">Rejeitar</Button> <Button onClick={() => handleAction(req.id, true)} className="flex-1 !py-1 !bg-green-600 hover:!bg-green-500">Validar</Button> </div> </Card> ))} {queue.length === 0 && <p className="text-gray-500 text-center py-8">Nenhuma verificação pendente.</p>} </div> </div> ); 
};

export default VerificationView;
