import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Activity, PieChart, DollarSign, Zap, X as XIcon, Users, ChevronLeft, ChevronRight, RefreshCw } from '../../../components/Icons';
import Button from '../../../components/Button';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { SupportTicket, Student, Influencer } from '../../../types';
import { sendRefundReversalLink } from '../../../services/mockFirebase';

interface StudentIntelligenceSidebarProps {
    selectedTicket: SupportTicket;
    onClose?: () => void;
    onCallNexus: () => void;
    onShowResults: () => void;
    onShowFinance: (user: Student | Influencer) => void;
    onAddCredit: (student: Student) => void;
    isAnalyzing: boolean;
    nexusAdvice: any;
    students: Student[];
    partnerRequests: Influencer[];
    mockInfluencers: Influencer[];
    getGuaranteeStatus: (student: Student) => { label: string, color: string, day?: number };
}

export const StudentIntelligenceSidebar: React.FC<StudentIntelligenceSidebarProps> = ({
    selectedTicket, onClose, onCallNexus, onShowResults,
    onShowFinance, onAddCredit, isAnalyzing, nexusAdvice,
    students, partnerRequests, mockInfluencers, getGuaranteeStatus
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSendingLink, setIsSendingLink] = useState(false);

    const student = students.find(x => x.uid === selectedTicket.studentId);
    const partner = !student ? partnerRequests.find(x => x.uid === selectedTicket.studentId) || mockInfluencers.find(x => x.uid === selectedTicket.studentId) : null;

    const isRefundTicket = selectedTicket.subject.toUpperCase().includes('REEMBOLSO') || selectedTicket.messages.some(m => m.text.toUpperCase().includes('REEMBOLSO'));

    const handleSendReversal = async () => {
        if (!student) return;
        setIsSendingLink(true);
        await sendRefundReversalLink(student.uid);
        setIsSendingLink(false);
    };

    return (
        <motion.div
            initial={{ x: 350, opacity: 0 }}
            animate={{
                x: 0,
                opacity: 1
            }}
            exit={{ x: 350, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`bg-gray-800 border-l border-gray-700 flex flex-col h-full overflow-hidden absolute md:relative right-0 top-0 z-20 md:z-auto ${isCollapsed ? 'md:w-[64px]' : 'w-full md:w-[350px] lg:w-[400px]'}`}
        >
            <div className={`p-3 border-b border-gray-700 bg-gray-900/50 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed && <h4 className="text-[10px] font-black text-white uppercase tracking-tighter truncate">Inteligência Aluno</h4>}
                <div className={`flex gap-1.5 ${isCollapsed ? 'flex-col items-center' : ''}`}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                        title={isCollapsed ? "Expandir" : "Recolher"}
                    >
                        {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                    {!isCollapsed && (
                        <>
                            <button onClick={onCallNexus} className="p-1 bg-brand-primary/10 rounded-lg text-brand-primary hover:bg-brand-primary hover:text-black transition-all">
                                <Brain className="w-3.5 h-3.5" />
                            </button>
                            {onClose && (
                                <button className="md:hidden text-gray-400" onClick={onClose}>
                                    <XIcon className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className={`flex-1 overflow-y-auto p-2.5 space-y-5 custom-scrollbar bg-gray-900/95 md:bg-transparent ${isCollapsed ? 'overflow-x-hidden p-2' : ''}`}>
                {isCollapsed ? (
                    <div className="flex flex-col items-center gap-6 pt-4">
                        <button onClick={onCallNexus} className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary hover:bg-brand-primary hover:text-black transition-all group relative">
                            <Brain className="w-6 h-6" />
                            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Análise Nexus</span>
                        </button>

                        {(student || partner) && (
                            <>
                                <button onClick={onShowResults} className="p-3 bg-gray-700 rounded-xl text-gray-300 hover:text-white hover:bg-gray-600 transition-all group relative">
                                    <Activity className="w-6 h-6" />
                                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Auditoria</span>
                                </button>
                                <button onClick={() => onShowFinance(student || (partner as Influencer))} className="p-3 bg-blue-600/10 rounded-xl text-blue-400 hover:bg-blue-600/20 transition-all group relative">
                                    <PieChart className="w-6 h-6" />
                                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Financeiro</span>
                                </button>
                                {student && (
                                    <>
                                        <button onClick={() => onAddCredit(student)} className="p-3 bg-green-600/10 rounded-xl text-green-400 hover:bg-green-600/20 transition-all group relative">
                                            <DollarSign className="w-6 h-6" />
                                            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Créditos</span>
                                        </button>
                                        {isRefundTicket && (
                                            <button onClick={handleSendReversal} disabled={isSendingLink} className={`p-3 bg-yellow-600/10 rounded-xl text-yellow-400 hover:bg-yellow-600/20 transition-all group relative ${isSendingLink ? 'animate-pulse' : ''}`}>
                                                <RefreshCw className={`w-6 h-6 ${isSendingLink ? 'animate-spin' : ''}`} />
                                                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Tentar Reverter</span>
                                            </button>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-4">
                            {!student && !partner ? (
                                <p className="text-[10px] text-gray-500 italic">Usuário não identificado.</p>
                            ) : student ? (
                                <div className="space-y-2.5">
                                    <div className="bg-gray-900 p-2.5 rounded-xl border border-gray-700">
                                        <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Garantia</p>
                                        <p className={`text-[11px] font-bold ${getGuaranteeStatus(student).color}`}>{getGuaranteeStatus(student).label}</p>
                                    </div>
                                    <div className="bg-gray-900 p-2.5 rounded-xl border border-gray-700">
                                        <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Nível</p>
                                        <span className="text-white font-black text-xs">{student.gamification?.level}</span>
                                    </div>
                                    <Button onClick={onShowResults} variant="secondary" className="w-full !py-1.5 !text-[9px] uppercase font-black">
                                        <Activity className="w-3 h-3 mr-1.5" /> Resultados
                                    </Button>
                                    <Button onClick={() => onShowFinance(student)} variant="secondary" className="w-full !py-1.5 !text-[9px] uppercase font-black !bg-blue-600/10 text-blue-400 border border-blue-600/20">
                                        <PieChart className="w-3 h-3 mr-1.5" /> Financeiro
                                    </Button>
                                    <Button onClick={() => onAddCredit(student)} className="w-full !py-1.5 !text-[9px] uppercase font-black !bg-green-600/10 text-green-400 border border-green-500/10">
                                        <DollarSign className="w-3 h-3 mr-1.5" /> Créditos
                                    </Button>
                                    {isRefundTicket && (
                                        <Button onClick={handleSendReversal} isLoading={isSendingLink} className="w-full !py-1.5 !text-[9px] uppercase font-black !bg-yellow-600/20 text-yellow-400 border border-yellow-500/20 hover:!bg-yellow-600/30">
                                            <RefreshCw className="w-3 h-3 mr-1.5" /> Tentar Reverter
                                        </Button>
                                    )}
                                </div>
                            ) : partner ? (
                                <div className="space-y-2.5">
                                    <div className="bg-gray-900 p-2.5 rounded-xl border border-gray-700">
                                        <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Tipo</p>
                                        <div className="flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5 text-purple-400" />
                                            <span className="text-white font-black text-xs capitalize truncate">{partner.role}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-900 p-2.5 rounded-xl border border-gray-700">
                                        <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Faturamento</p>
                                        <p className="text-white font-black text-xs">R$ {partner.totalEarnings?.toLocaleString('pt-BR') || '0'}</p>
                                    </div>
                                    <Button onClick={() => onShowFinance(partner)} variant="secondary" className="w-full !py-1.5 !text-[9px] uppercase font-black !bg-purple-600/10 text-purple-400 border border-purple-600/20">
                                        <PieChart className="w-3 h-3 mr-1.5" /> Financeiro
                                    </Button>
                                </div>
                            ) : null}
                        </div>

                        <div className="border-t border-gray-700 pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-purple-600 rounded-lg shadow-lg">
                                    <Brain className="w-4 h-4 text-white" />
                                </div>
                                <h5 className="text-xs font-black text-white uppercase">Nexus Advice</h5>
                            </div>

                            {isAnalyzing ? (
                                <div className="text-center py-8">
                                    <LoadingSpinner size="sm" />
                                </div>
                            ) : nexusAdvice ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                    <div className="bg-purple-900/10 border border-purple-500/20 p-3 rounded-xl">
                                        <p className="text-xs text-gray-300 italic">"{nexusAdvice.diagnosis}"</p>
                                    </div>
                                    <div className="space-y-2">
                                        {nexusAdvice.advice.map((a: string, i: number) => (
                                            <div key={i} className="flex gap-2 items-start bg-gray-900 p-2 rounded-lg border border-gray-700">
                                                <Zap className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />
                                                <p className="text-[10px] text-gray-200">{a}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="text-center py-6 border border-dashed border-gray-700 rounded-xl">
                                    <p className="text-[10px] text-gray-500 px-4">Clique no cérebro para análise IA.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
