
import React from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { Link as LinkIcon, CheckCircle, User as UserIcon, Monitor, Eye } from '../../../components/Icons';
import { LinkRequest } from '../../../types';

interface RequestsViewProps {
    requests: LinkRequest[];
    onAnalyze: (r: LinkRequest) => void;
}

const RequestsView: React.FC<RequestsViewProps> = ({ requests, onAnalyze }) => { 
    const pending = requests.filter(r => r.status === 'pending'); 
    return ( 
        <div> 
            <div className="flex justify-between items-center mb-6"> 
                <h2 className="text-xl font-bold text-white flex items-center gap-2"> <LinkIcon className="w-6 h-6 text-brand-primary"/> Solicitações de Afiliação </h2> 
                <span className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">{pending.length} pendentes</span> 
            </div> 
            {pending.length === 0 ? ( 
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-10 text-center"> 
                    <CheckCircle className="w-12 h-12 text-gray-600 mx-auto mb-4"/> 
                    <p className="text-gray-400">Nenhuma solicitação pendente no momento.</p> 
                </div> 
            ) : ( 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                    {pending.map(req => ( 
                        <Card key={req.id} className="p-5 border-l-4 border-l-brand-primary hover:border-gray-500 transition-all"> 
                            <div className="flex justify-between items-start mb-3"> 
                                <div> 
                                    <p className="text-brand-primary text-xs font-bold uppercase mb-1">Produto Solicitado</p> 
                                    <p className="text-white font-bold text-lg">{req.productName}</p> 
                                </div> 
                                <div className="text-right"> 
                                    <p className="text-gray-500 text-xs">{new Date(req.requestDate).toLocaleDateString()}</p> 
                                    <p className="text-gray-500 text-xs">{new Date(req.requestDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p> 
                                </div> 
                            </div> 
                            <div className="bg-gray-900/50 p-3 rounded-lg mb-4"> 
                                <div className="flex items-center gap-2 mb-1"> 
                                    <UserIcon className="w-4 h-4 text-gray-400"/> 
                                    <span className="text-white text-sm font-medium">{req.studentName}</span> 
                                </div> 
                                <div className="flex items-center gap-2"> 
                                    <Monitor className="w-4 h-4 text-gray-400"/> 
                                    <span className="text-gray-400 text-xs truncate">{Object.keys(req.socialLinks).filter(k => req.socialLinks[k as keyof typeof req.socialLinks]).length} redes informadas</span> 
                                </div> 
                            </div> 
                            <Button onClick={() => onAnalyze(req)} className="w-full flex items-center justify-center gap-2 !bg-blue-600 hover:!bg-blue-500"> 
                                <Eye className="w-4 h-4"/> Verificar Dados 
                            </Button> 
                        </Card> 
                    ))} 
                </div> 
            )} 
        </div> 
    ); 
};

export default RequestsView;
