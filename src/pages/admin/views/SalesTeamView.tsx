
import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { FileText, MessageSquare } from '../../../components/Icons';
import { SalesPerson } from '../../../types';
import { getSalesTeam } from '../../../services/mockFirebase';
import { SalesPersonModal, SalesScriptModal } from '../modals/AdminModals';

const SalesTeamView: React.FC<{ onViewMonitoring?: () => void }> = ({ onViewMonitoring }) => { 
    const [team, setTeam] = useState<SalesPerson[]>([]); 
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [isScriptModalOpen, setIsScriptModalOpen] = useState(false); 
    const [editingUser, setEditingUser] = useState<SalesPerson | null>(null); 
    
    const refreshTeam = () => { getSalesTeam().then(setTeam); }; 
    useEffect(() => { refreshTeam(); }, []); 
    
    const handleEdit = (person: SalesPerson) => { setEditingUser(person); setIsModalOpen(true); }; 
    const handleAdd = () => { setEditingUser(null); setIsModalOpen(true); }; 
    
    return ( 
        <div className="space-y-6"> 
            <div className="flex justify-between items-center"> 
                <h3 className="text-2xl font-bold text-white">Equipe Comercial (Evolution API)</h3> 
                <div className="flex gap-2"> 
                    <Button variant="secondary" onClick={() => setIsScriptModalOpen(true)} className="flex items-center gap-2"><FileText className="w-4 h-4"/> Scripts de Vendas</Button> 
                    <Button onClick={handleAdd}>+ Adicionar Vendedor</Button> 
                </div> 
            </div> 
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> 
                {team.map(person => ( 
                    <Card key={person.uid} className="p-6 relative overflow-hidden"> 
                        {person.status === 'online' && <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/20 rounded-bl-full -mr-10 -mt-10"></div>} 
                        <div className="flex items-center gap-4 mb-6 relative z-10"> 
                            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-xl font-bold text-white border-2 border-gray-600">{person.displayName?.charAt(0)}</div> 
                            <div><h4 className="font-bold text-white text-lg">{person.displayName}</h4><div className="flex items-center gap-2 text-xs"><span className={`w-2 h-2 rounded-full ${person.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></span><span className="text-gray-400 uppercase">{person.status}</span></div>{person.role === 'sales_manager' && <span className="text-[10px] bg-blue-900/50 text-blue-200 px-2 py-0.5 rounded mt-1 inline-block border border-blue-900">Gerente</span>}</div> 
                        </div> 
                        <div className="space-y-4"> 
                            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg border border-gray-700"><span className="text-gray-400 text-sm">Meta Diária</span><span className="text-white font-bold">{person.salesToday} <span className="text-gray-500 font-normal">/ {person.dailyGoal}</span></span></div> 
                            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg border border-gray-700"><span className="text-gray-400 text-sm">Faturamento</span><span className="text-green-400 font-bold">R$ {person.revenueToday.toLocaleString('pt-BR')}</span></div> 
                            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg border border-gray-700"><span className="text-gray-400 text-sm">Tempo Médio Resp.</span><span className="text-blue-400 font-bold">{Math.floor(person.averageResponseTime / 60)}m {person.averageResponseTime % 60}s</span></div> 
                        </div> 
                        <div className="flex gap-2 mt-6"><Button variant="secondary" className="flex-1 !text-xs" onClick={() => handleEdit(person)}>Editar</Button><Button variant="secondary" className="flex-1 !text-xs text-red-400">Bloquear</Button></div> 
                    </Card> 
                ))} 
            </div> 
            <Card className="mt-8"><div className="p-4 bg-gray-800 border-b border-gray-700"><h4 className="font-bold text-white">Monitoramento de Conversas Ativas</h4></div><div className="p-8 text-center text-gray-500"><MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20"/><p>Visualize todas as conversas do WhatsApp em tempo real aqui.</p><Button variant="secondary" className="mt-4" onClick={onViewMonitoring}>Abrir Monitor Evolution</Button></div></Card> 
            {isModalOpen && <SalesPersonModal initialData={editingUser} onClose={() => setIsModalOpen(false)} onSaved={refreshTeam} />} 
            {isScriptModalOpen && <SalesScriptModal onClose={() => setIsScriptModalOpen(false)} />} 
        </div> 
    ); 
};

export default SalesTeamView;
