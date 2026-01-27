
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ActivityIcon, PieChart, DollarSign, Zap, X as XIcon, Users, ChevronLeft, ChevronRight, RefreshCw, ShieldCheck, AlertTriangle } from '../../../components/Icons';
import Button from '../../../components/Button';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { SupportTicket, Student, Influencer } from '../../../types';
import { sendRefundReversalLink } from '../../../services/mockFirebase';

interface FinancialIntelligenceSidebarProps {
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

export const FinancialIntelligenceSidebar: React.FC<FinancialIntelligenceSidebarProps> = ({
    selectedTicket, onClose, onCallNexus, onShowResults,
    onShowFinance, onAddCredit, isAnalyzing, nexusAdvice,
    students, partnerRequests, mockInfluencers, getGuaranteeStatus
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSendingLink, setIsSendingLink] = useState(false);

    const student = students.find(x => x.uid === selectedTicket.studentId);
    const partner = !student ? partnerRequests.find(x => x.uid === selectedTicket.studentId) || mockInfluencers.find(x => x.uid === selectedTicket.studentId) : null;

    const isRefundTicket = selectedTicket.subject.toUpperCase().includes('REEMBOLSO') || selectedTicket.messages.some(m => m.text.toUpperCase().includes('REEMBOLSO'));
    const isGuaranteeExpired = student && getGuaranteeStatus(student).day && getGuaranteeStatus(student).day! > 7;

    const handleSendReversal = async () => {
        if (!student) return;
        setIsSendingLink(true);
        await sendRefundReversalLink(student.uid);
        setIsSendingLink(false);
    };

    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`bg-[#050505] border-l border-gray-800 flex flex-col shadow-2xl transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-full md:w-[300px] lg:w-[320px]'} h-full overflow-hidden absolute md:relative right-0 top-0 z-20 md:z-auto`}
        >
            {/* Header */}
            <div className="h-14 md:h-16 border-b border-gray-800 flex items-center justify-between px-4 bg-[#0a0a0a]">
                {!isCollapsed && <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider"><Brain className="w-5 h-5 text-brand-primary" /> Inteligência</h3>}
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors">
                        {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {!isCollapsed && onClose && <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white"><XIcon className="w-5 h-5" /></button>}
                </div>

                {isCollapsed && (
                    <button onClick={onCallNexus} className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary hover:bg-brand-primary hover:text-black transition-all" title="Análise Nexus">
                        <Brain className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className={`flex-1 overflow-y-auto custom-scrollbar bg-gray-900/95 md:bg-transparent ${isCollapsed ? 'hidden' : 'p-2.5 space-y-5'}`}>
                {!isCollapsed && (
                    <div className="space-y-4">
                        {/* Action Buttons Header */}
                        <div className="flex gap-2 mb-2">
                            <button onClick={onCallNexus} className="flex-1 p-3 bg-brand-primary/10 rounded-xl text-brand-primary hover:bg-brand-primary hover:text-black transition-all flex flex-col items-center justify-center gap-1 border border-brand-primary/20">
                                <Brain className="w-5 h-5" />
                                <span className="text-[9px] font-black uppercase">Análise Nexus</span>
                            </button>
                            {isRefundTicket && (
                                <button onClick={handleSendReversal} disabled={isSendingLink} className={`flex-1 p-3 bg-yellow-500/10 rounded-xl text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all flex flex-col items-center justify-center gap-1 border border-yellow-500/20 ${isSendingLink ? 'animate-pulse' : ''}`}>
                                    <RefreshCw className={`w-5 h-5 ${isSendingLink ? 'animate-spin' : ''}`} />
                                    <span className="text-[9px] font-black uppercase">Tentar Reverter</span>
                                </button>
                            )}
                        </div>

                        {/* Compliance Checklist */}
                        <div className="p-3 bg-gray-900 border border-gray-700 rounded-xl space-y-2">
                            <h5 className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-green-500" /> Compliance Check
                            </h5>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[10px] text-gray-300">
                                    <div className={`w-2 h-2 rounded-full ${isGuaranteeExpired ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                    {isGuaranteeExpired ? 'Garantia Expirada' : 'Dentro da Garantia'}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-300">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    LGPD Status: Seguro
                                </div>
                            </div>
                        </div>

                        {/* User Actions */}
                        <div className="space-y-2.5">
                            {student ? (
                                <>
                                    <div className="bg-gray-900 p-2.5 rounded-xl border border-gray-700">
                                        <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Aluno</p>
                                        <p className="text-white font-bold text-sm">{student.displayName}</p>
                                    </div>
                                    <Button onClick={onShowResults} variant="secondary" className="w-full !py-3 text-xs uppercase font-bold text-white bg-gray-800 hover:bg-gray-700 border border-gray-600 transition-colors">
                                        <ActivityIcon className="w-4 h-4 mr-2 text-brand-primary" /> Ver Progresso
                                    </Button>
                                    <Button onClick={() => onShowFinance(student)} variant="secondary" className="w-full !py-3 text-xs uppercase font-bold text-white !bg-blue-600 hover:!bg-blue-500 border-none transition-colors shadow-lg shadow-blue-900/20">
                                        <PieChart className="w-4 h-4 mr-2" /> Extrato Financeiro
                                    </Button>
                                    <Button onClick={() => onAddCredit(student)} className="w-full !py-3 text-xs uppercase font-bold !bg-green-600 text-white hover:!bg-green-500 border-none transition-colors shadow-lg shadow-green-900/20">
                                        <DollarSign className="w-4 h-4 mr-2" /> Add Créditos
                                    </Button>
                                </>
                            ) : <p className="text-xs text-gray-500">Selecione um usuário para ver ações.</p>}
                        </div>

                        {/* Nexus Advice */}
                        <div className="border-t border-gray-700 pt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-brand-primary rounded-lg text-black">
                                    <Brain className="w-4 h-4" />
                                </div>
                                <h5 className="text-xs font-black text-white uppercase">Nexus Compliance AI</h5>
                            </div>
                            {isAnalyzing ? (
                                <div className="text-center py-6"><LoadingSpinner size="sm" /></div>
                            ) : nexusAdvice ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                                        <p className="text-[10px] text-yellow-200 font-medium">"{nexusAdvice.diagnosis}"</p>
                                    </div>
                                    {nexusAdvice.advice.map((a: string, i: number) => (
                                        <div key={i} className="flex gap-2 items-start bg-gray-900 p-2 rounded border border-gray-700">
                                            <AlertTriangle className="w-3 h-3 text-orange-500 shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-gray-300">{a}</p>
                                        </div>
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="text-center py-6 border border-dashed border-gray-700 rounded-xl">
                                    <p className="text-[10px] text-gray-500 px-4">Clique no cérebro para análise de risco e conformidade.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
