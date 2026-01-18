
import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { LevelUpRequest } from '../../../types';
import { getLevelUpQueue, approveLevelUp } from '../../../services/mockFirebase';
import toast from 'react-hot-toast';

const LevelsView: React.FC = () => { 
    const [queue, setQueue] = useState<LevelUpRequest[]>([]); 
    useEffect(() => { getLevelUpQueue().then(setQueue); }, []); 
    const handleAction = async (id: string, approved: boolean) => { await approveLevelUp(id, approved); setQueue(q => q.filter(x => x.id !== id)); toast.success(approved ? "Nível atualizado!" : "Solicitação rejeitada."); }; 
    return ( <div> <h2 className="text-xl font-bold text-white mb-4">Solicitações de Nível</h2> {queue.length === 0 ? <p className="text-gray-500">Nenhuma solicitação.</p> : ( <div className="space-y-4"> {queue.map(req => ( <Card key={req.id} className="p-4 flex justify-between items-center"> <div> <p className="text-white font-bold">{req.studentName}</p> <p className="text-gray-400 text-sm">{req.currentLevel} ➔ <span className="text-yellow-400">{req.nextLevel}</span></p> </div> <div className="flex gap-2"> <Button variant="secondary" onClick={() => handleAction(req.id, false)}>Negar</Button> <Button onClick={() => handleAction(req.id, true)}>Aprovar</Button> </div> </Card> ))} </div> )} </div> ); 
};

export default LevelsView;
