
import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { Pencil, Trash } from '../../../components/Icons';
import { Influencer } from '../../../types';
import { getInfluencers } from '../../../services/mockFirebase';
import { InfluencerModal } from '../modals/AdminModals';

const InfluencersView: React.FC = () => { 
    const [list, setList] = useState<Influencer[]>([]); 
    const [editingId, setEditingId] = useState<string | null>(null); 
    const load = () => getInfluencers().then(setList); 
    useEffect(() => { load(); }, []); 
    const editingInfluencer = list.find(i => i.uid === editingId); 
    return ( 
        <div> 
            <h2 className="text-xl font-bold text-white mb-4">Influenciadores Parceiros</h2> 
            <div className="space-y-4"> 
                {list.map(inf => {
                    const products = Array.isArray(inf.products) ? inf.products : [];
                    const totalSales = products.reduce((acc, p) => acc + (p.sales || 0), 0);
                    const totalClicks = products.reduce((acc, p) => acc + (p.clicks || 0), 0);

                    return ( 
                    <Card key={inf.uid} className="p-4"> 
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"> 
                            <div className="flex items-center gap-4"> 
                                <img src={inf.photoURL} className="w-12 h-12 rounded-full border border-gray-600" alt="Avatar"/> 
                                <div> 
                                    <div className="flex items-center gap-2"> 
                                        <p className="font-bold text-white">{inf.displayName}</p> 
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${inf.status === 'active' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>{inf.status}</span> 
                                    </div> 
                                    <p className="text-xs text-gray-400">{inf.email} • go.15x.br/{inf.slug}</p> 
                                </div> 
                            </div> 
                            <div className="flex items-center gap-6 text-sm"> 
                                <div className="text-center"> 
                                    <p className="text-gray-500 text-[10px] uppercase">Vendas</p> 
                                    <p className="text-white font-bold">{totalSales}</p> 
                                </div> 
                                <div className="text-center border-l border-gray-700 pl-6"> 
                                    <p className="text-gray-500 text-[10px] uppercase">Cliques</p> 
                                    <p className="text-white font-bold">{totalClicks}</p> 
                                </div> 
                                <div className="text-center border-l border-gray-700 pl-6"> 
                                    <p className="text-gray-500 text-[10px] uppercase">Faturamento</p> 
                                    <p className="text-green-400 font-bold">R$ {inf.totalEarnings.toLocaleString('pt-BR')}</p> 
                                </div> 
                            </div> 
                            <Button variant="secondary" className="!py-1.5 !text-xs" onClick={() => setEditingId(inf.uid)}> <Pencil className="w-3 h-3 mr-1"/> Editar </Button> 
                        </div> 
                    </Card> 
                )})} 
            </div> 
            {editingInfluencer && ( <InfluencerModal initialData={editingInfluencer} onClose={() => setEditingId(null)} onSaved={load} /> )} 
        </div> 
    ); 
};

export default InfluencersView;
