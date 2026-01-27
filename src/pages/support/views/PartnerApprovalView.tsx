
import React, { useState } from 'react';
import { Influencer } from '../../../types';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
// Add missing icon imports 'MessageSquare' and 'ActivityIcon'
import { Users, Instagram, Tiktok, Youtube, Check, X as XIcon, Globe, ShieldCheck, AlertTriangle, Info, Facebook, MessageSquare, ActivityIcon } from '../../../components/Icons';

interface PartnerApprovalViewProps {
    requests: Influencer[];
    onAction: (uid: string, action: 'active' | 'blocked') => void;
}

export const PartnerApprovalView: React.FC<PartnerApprovalViewProps> = ({ requests, onAction }) => {
    const [showGuide, setShowGuide] = useState(true);

    const getSocialIcon = (network: string) => {
        switch (network.toLowerCase()) {
            case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
            case 'tiktok': return <Tiktok className="w-4 h-4 text-white" />;
            case 'youtube': return <Youtube className="w-4 h-4 text-red-500" />;
            case 'facebook': return <Facebook className="w-4 h-4 text-blue-500" />;
            case 'kwai': return <span className="w-4 h-4 font-black text-orange-500 bg-white rounded-full flex items-center justify-center text-[10px]">K</span>;
            default: return <Globe className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="p-4 md:p-6 overflow-y-auto h-full custom-scrollbar space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-brand-primary" /> Triagem de Novos Parceiros
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Verificação manual rigorosa para manter a qualidade do ecossistema.</p>
                </div>
                <div className="bg-gray-800 text-gray-400 text-[10px] px-3 py-1 rounded-full border border-gray-700 font-bold uppercase tracking-wider">
                    {requests.length} Solicitações Pendentes
                </div>
            </div>

            {/* GUIA DO AGENTE DE SUPORTE */}
            {showGuide && (
                <div className="bg-blue-900/20 border border-blue-500/30 p-5 rounded-2xl relative shadow-inner">
                    <button onClick={() => setShowGuide(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                        <XIcon className="w-4 h-4" />
                    </button>
                    <h4 className="text-blue-300 font-black text-xs uppercase mb-3 flex items-center gap-2 tracking-widest">
                        <Info className="w-4 h-4" /> Manual de Triagem do Agente
                    </h4>
                    <ul className="text-[11px] text-gray-300 space-y-2 list-disc pl-4 leading-relaxed font-medium">
                        <li><strong>Verificação de Link:</strong> Clique no link do perfil. Verifique se a conta existe, se tem foto de perfil e se o @ bate com o informado.</li>
                        <li><strong>Engajamento Real:</strong> Olhe os últimos posts. Se tiver muitos likes e 0 comentários, ou comentários genéricos demais, pode ser bot.</li>
                        <li><strong>Análise de Fit:</strong> Leia o resumo do parceiro. O nicho dele faz sentido para divulgar nossos produtos?</li>
                        <li><strong>Filtro Anti-Fraude:</strong> Descarte perfis criados na última semana, sem foto de rosto ou que pareçam "fantasmas".</li>
                        <li><strong>Decisão:</strong> Se tiver dúvida, rejeite. Buscamos parceiros com presença real e autoridade.</li>
                    </ul>
                </div>
            )}

            {requests.length === 0 ? (
                <div className="text-center py-24 text-gray-500 bg-gray-800/30 rounded-3xl border-2 border-dashed border-gray-700 flex flex-col items-center">
                    <Users className="w-16 h-16 opacity-10 mb-4" />
                    <p className="text-lg font-bold">Fila Vazia</p>
                    <p className="text-sm">Não há novos parceiros aguardando aprovação no momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {requests.map(req => (
                        <Card key={req.uid} className="bg-gray-800 border-gray-700 shadow-2xl flex flex-col relative overflow-hidden group">
                            {/* Partner Type Badge */}
                            <div className="absolute top-0 right-0">
                                <div className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-bl-xl shadow-lg border-l border-b border-white/5 ${req.partnershipType === 'Influenciador'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-blue-600 text-white'
                                    }`}>
                                    {req.partnershipType || 'Afiliado'}
                                </div>
                            </div>

                            <div className="p-6 flex-1 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-700 flex items-center justify-center text-3xl font-black text-white border-2 border-gray-600 shadow-inner shrink-0">
                                        {req.displayName?.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-white text-lg leading-tight truncate">{req.displayName}</h3>
                                        <p className="text-xs text-gray-400 truncate">{req.email}</p>
                                        <p className="text-[10px] text-gray-500 font-mono mt-1 bg-gray-900 px-2 py-0.5 rounded w-fit border border-gray-700">CPF: {req.cpf}</p>
                                    </div>
                                </div>

                                {/* RESUMO DA CONTA - NOVO */}
                                <div className="bg-black/30 p-4 rounded-xl border border-gray-700 shadow-inner">
                                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                                        <MessageSquare className="w-3 h-3" /> Declaração de Presença Digital
                                    </p>
                                    <p className="text-xs text-gray-300 italic leading-relaxed">
                                        "{req.accountDescription || 'O parceiro não forneceu uma descrição detalhada.'}"
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-gray-700 pb-2 flex items-center gap-2">
                                        <ActivityIcon className="w-3 h-3" /> Redes Sociais e Alcance
                                    </h4>

                                    <div className="grid grid-cols-1 gap-2">
                                        {Object.entries(req.socialLinks || {}).filter(([_, url]) => !!url).map(([network, url]) => {
                                            const followerKey = `${network}Followers` as keyof typeof req.followers;
                                            const followersCount = req.followers ? req.followers[followerKey] : '-';

                                            return (
                                                <div key={network} className="flex flex-col bg-gray-900/80 rounded-xl border border-gray-700 p-3 hover:border-brand-primary/30 transition-colors">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="flex items-center gap-2">
                                                            {getSocialIcon(network)}
                                                            <span className="text-xs text-white font-bold capitalize">{network}</span>
                                                        </div>
                                                        {followersCount && followersCount !== '-' && (
                                                            <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full font-black border border-brand-primary/20 shadow-sm">
                                                                ~{followersCount} SEGUIDORES
                                                            </span>
                                                        )}
                                                    </div>
                                                    <a href={url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 underline truncate flex items-center gap-1.5 mt-1.5 font-mono">
                                                        <Globe className="w-3 h-3" /> {url}
                                                    </a>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => onAction(req.uid, 'blocked')}
                                    className="flex-1 !py-3 !text-[10px] font-black uppercase text-red-400 border-red-900/40 hover:border-red-500 hover:bg-red-900/20 transition-all"
                                >
                                    <XIcon className="w-4 h-4 mr-1.5" /> Rejeitar
                                </Button>
                                <Button
                                    onClick={() => onAction(req.uid, 'active')}
                                    className="flex-1 !py-3 !text-[10px] font-black uppercase !bg-green-600 hover:!bg-green-500 text-white shadow-xl shadow-green-900/20 transition-all"
                                >
                                    <Check className="w-4 h-4 mr-1.5" /> Aprovar Parceiro
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
