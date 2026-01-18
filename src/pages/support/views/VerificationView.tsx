
import React from 'react';
import { VerificationRequest } from '../../../types';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { CheckCircle, Trophy, ExternalLink, Activity } from '../../../components/Icons';

export const VerificationView: React.FC<{ queue: VerificationRequest[], onVerify: (id: string, ok: boolean) => void }> = ({ queue, onVerify }) => {
    return (
        <div className="p-6 overflow-y-auto h-full custom-scrollbar">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><CheckCircle className="w-6 h-6 text-blue-400"/> Fila de Verificação (Gamificação)</h2>
            {queue.length === 0 ? <div className="text-center py-20 text-gray-500 bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-700"><p>Nenhuma verificação pendente.</p></div> : (
                <div className="space-y-4">
                    {queue.map(req => (
                        <Card key={req.id} className="p-6 bg-gray-800 border-gray-700 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5"><Trophy className="w-24 h-24 text-white"/></div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <p className="text-white font-black text-lg uppercase tracking-tight">{req.studentName}</p>
                                    <p className="text-sm text-gray-400">Produto: <strong className="text-brand-primary">{req.productName}</strong></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase font-black">Posts Declarados</p>
                                    <p className="text-3xl font-black text-green-400">{req.totalPosts}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                                {req.socialProfiles.map((p, i) => (
                                    <a key={i} href={p.url} target="_blank" rel="noreferrer" className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-lg text-xs text-blue-300 hover:text-white hover:border-blue-500 transition-all flex items-center gap-2">
                                        <span className="font-bold uppercase opacity-60">{p.network}:</span> Ver Perfil <ExternalLink className="w-3 h-3"/>
                                    </a>
                                ))}
                            </div>
                            <div className="flex gap-3 relative z-10">
                                <Button variant="secondary" onClick={() => onVerify(req.id, false)} className="flex-1 !py-3 !text-xs font-black uppercase text-red-400 border-red-900/50 hover:border-red-500">Rejeitar Dados</Button>
                                <Button onClick={() => onVerify(req.id, true)} className="flex-1 !py-3 !text-xs font-black uppercase !bg-green-600 hover:!bg-green-500">Confirmar Postagens</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
