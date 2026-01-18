
import React, { useState, useRef, useEffect } from 'react';
import { SupportTicket, SupportAgent } from '../../../types';
import Button from '../../../components/Button';
import { MessageSquare, CheckCircle, TrendingUp, User, Send, Paperclip, Mic, File, RefreshCw, Star, Clock, ArrowLeft, LockClosed as Lock, Brain, AlertCircle } from '../../../components/Icons';
import { uploadFileToStorage, sendTicketMessage } from '../../../services/mockFirebase';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface TicketsViewProps {
    tickets: SupportTicket[];
    selectedTicket: SupportTicket | null;
    setSelectedTicket: (t: SupportTicket | null) => void;
    onSendMessage: (e: React.FormEvent, isInternal?: boolean) => void;
    newMessage: string;
    setNewMessage: (m: string) => void;
    handleResolve: (id: string) => void;
    handleEscalate: (id: string, reason?: string, target?: 'finance' | 'admin') => void;
    handleViewStudent: (id: string) => void;
    agent: SupportAgent;
    markAsRead: (id: string) => void;
}

export const TicketsView: React.FC<TicketsViewProps> = ({
    tickets, selectedTicket, setSelectedTicket, onSendMessage,
    newMessage, setNewMessage, handleResolve, handleEscalate,
    handleViewStudent, agent, markAsRead
}) => {
    const [activeTab, setActiveTab] = useState<'queue' | 'active' | 'resolved'>('active');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [isEscalating, setIsEscalating] = useState(false);
    const [escalationReason, setEscalationReason] = useState('');

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedTicket?.messages]);

    const counts = {
        queue: tickets.filter(t => t.status === 'open' || t.status === 'pending_finance' || t.status === 'pending_admin').length,
        active: tickets.filter(t => t.status === 'in_progress' || t.status === 'pending_closure').length,
        resolved: tickets.filter(t => t.status === 'resolved').length
    };

    const filteredTickets = tickets.filter(t => {
        if (activeTab === 'queue') return t.status === 'open' || t.status === 'pending_finance' || t.status === 'pending_admin';
        if (activeTab === 'active') return t.status === 'in_progress' || t.status === 'pending_closure';
        if (activeTab === 'resolved') return t.status === 'resolved';
        return false;
    }).sort((a, b) => {
        if (a.isEscalated && !b.isEscalated) return -1;
        if (!a.isEscalated && b.isEscalated) return 1;
        return b.lastMessageAt - a.lastMessageAt;
    });

    const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedTicket) return;
        setIsUploading(true);
        const toastId = toast.loading("Enviando arquivo...");
        try {
            const url = await uploadFileToStorage(file);
            const type = file.type.startsWith('image/') ? 'image' : 'file';
            await sendTicketMessage(selectedTicket.id, `📎 Anexo: ${file.name}`, agent, url, type);
            toast.success("Enviado!", { id: toastId });
        } catch (error) {
            toast.error("Erro no envio.", { id: toastId });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const file = new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
                setIsUploading(true);
                const tid = toast.loading("Enviando áudio...");
                try {
                    const url = await uploadFileToStorage(file);
                    if (selectedTicket) await sendTicketMessage(selectedTicket.id, "🎤 Mensagem de áudio", agent, url, 'file');
                    toast.success("Áudio enviado!", { id: tid });
                } catch (err) { toast.error("Erro no áudio.", { id: tid }); } finally { setIsUploading(false); }
            };
            mediaRecorder.start();
            setIsRecording(true);
            toast("Gravando...", { icon: '🎙️', id: 'recording-support' });
        } catch (err) { toast.error("Erro no microfone."); }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            toast.dismiss('recording-support');
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const [isInternal, setIsInternal] = useState(false);
    const [nexusSuggestion, setNexusSuggestion] = useState<'finance' | 'admin' | null>(null);

    useEffect(() => {
        // AI Logic: Detect keywords for routing suggestions
        if (selectedTicket && selectedTicket.messages.length > 0) {
            const firstMsg = selectedTicket.messages[0].text.toLowerCase();
            const financeKeywords = ['reembolso', 'estorno', 'pix', 'pagamento', 'compra', 'cartão', 'comissão', 'financeiro'];
            if (financeKeywords.some(k => firstMsg.includes(k)) && selectedTicket.status === 'open') {
                setNexusSuggestion('finance');
            } else {
                setNexusSuggestion(null);
            }
        } else {
            setNexusSuggestion(null);
        }
    }, [selectedTicket?.id]);

    const onConfirmEscalate = (reason: string, targetContent: 'finance' | 'admin') => {
        if (selectedTicket && reason.trim()) {
            handleEscalate(selectedTicket.id, reason, targetContent);
            setIsEscalating(false);
            setEscalationReason('');
        } else {
            toast.error("Por favor, informe o motivo.");
        }
    };

    return (
        <div className="flex-1 w-full h-full flex flex-col md:flex-row min-h-0 relative">
            {/* Escalation Modal */}
            {isEscalating && (
                <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm rounded-xl">
                    <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl animate-fade-in-up">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <TrendingUp className="text-red-500 w-6 h-6" /> Confirmar Escalonamento
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Este ticket será enviado para o nível superior (Produtor). Descreva o motivo para manter o contexto.
                        </p>
                        <textarea
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white text-sm outline-none focus:border-red-500 transition-colors mb-4 resize-none h-32"
                            placeholder="Ex: Erro técnico persistente, solicitação de reembolso complexa, cliente VIP..."
                            value={escalationReason}
                            onChange={(e) => setEscalationReason(e.target.value)}
                            autoFocus
                        />
                        <div className="flex gap-3 justify-end">
                            <Button variant="secondary" onClick={() => setIsEscalating(false)}>Cancelar</Button>
                            <Button onClick={onConfirmEscalate} className="!bg-red-600 hover:!bg-red-500">Confirmar e Escalar</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ticket List Column - Hidden on mobile if ticket is selected */}
            <div className={`w-full md:w-[350px] bg-gray-800 border-r border-gray-700 flex-col overflow-hidden shadow-lg shrink-0 h-full ${selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                <div className="flex border-b border-gray-700 bg-gray-900/50 overflow-x-auto no-scrollbar">
                    <button onClick={() => setActiveTab('queue')} className={`flex-1 py-4 px-2 text-[10px] font-bold uppercase transition-all whitespace-nowrap border-b-2 ${activeTab === 'queue' ? 'bg-gray-800 text-orange-500 border-orange-500' : 'bg-transparent text-gray-400 border-transparent hover:bg-gray-800 hover:text-white'}`}>
                        Espera {counts.queue > 0 && <span className="bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full ml-1 border border-orange-500/20">{counts.queue}</span>}
                    </button>
                    <button onClick={() => setActiveTab('active')} className={`flex-1 py-4 px-2 text-[10px] font-bold uppercase transition-all whitespace-nowrap border-b-2 ${activeTab === 'active' ? 'bg-gray-800 text-blue-500 border-blue-500' : 'bg-transparent text-gray-400 border-transparent hover:bg-gray-800 hover:text-white'}`}>
                        Abertos {counts.active > 0 && <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full ml-1 border border-blue-500/20">{counts.active}</span>}
                    </button>
                    <button onClick={() => setActiveTab('resolved')} className={`flex-1 py-4 px-2 text-[10px] font-bold uppercase transition-all whitespace-nowrap border-b-2 ${activeTab === 'resolved' ? 'bg-gray-800 text-green-500 border-green-500' : 'bg-transparent text-gray-400 border-transparent hover:bg-gray-800 hover:text-white'}`}>
                        Fechados
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredTickets.map(ticket => (
                        <div key={ticket.id} onClick={() => { setSelectedTicket(ticket); markAsRead(ticket.id); }} className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${selectedTicket?.id === ticket.id ? 'bg-gray-700 border-l-4 border-l-brand-primary' : 'bg-gray-800 hover:bg-gray-750'}`}>
                            <div className="flex justify-between items-start mb-1">
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-white truncate flex items-center gap-2">
                                        {ticket.studentName}
                                        {ticket.status === 'pending_finance' && <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Financeiro</span>}
                                        {ticket.status === 'pending_admin' && <span className="bg-orange-600 text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Admin</span>}
                                    </p>
                                </div>
                                {ticket.unreadCount && ticket.unreadCount > 0 && <span className="bg-red-500 w-2 h-2 rounded-full"></span>}
                            </div>
                            <p className="text-xs text-gray-400 truncate mb-2">{ticket.messages[ticket.messages.length - 1]?.text || 'Anexo recebido'}</p>
                            <div className="flex justify-between items-center text-[10px] text-gray-500">
                                <span className={`px-1.5 py-0.5 rounded border uppercase ${ticket.status === 'open' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : ticket.status === 'pending_closure' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : ticket.status === 'pending_finance' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ticket.status === 'pending_admin' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                                    {ticket.status === 'pending_closure' ? 'Aguardando' : ticket.status === 'pending_finance' ? 'Financeiro' : ticket.status === 'pending_admin' ? 'Admin' : ticket.status}
                                </span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(ticket.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    ))}
                    {filteredTickets.length === 0 && <div className="p-10 text-center text-gray-500 text-sm">Nenhum chamado nesta lista.</div>}
                </div>
            </div>

            {/* Chat Column - Full width on mobile when selected, flex-1 on desktop */}
            <div className={`flex-1 bg-gray-800 border-l border-gray-700 flex-col overflow-hidden relative h-full min-h-0 ${!selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                {selectedTicket ? (
                    <>
                        <div className="min-h-16 h-auto py-2 border-b border-gray-700 flex flex-wrap md:flex-nowrap items-center justify-between px-3 md:px-6 bg-gray-900/50 gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <button className="md:hidden text-gray-400 p-1 shrink-0" onClick={() => setSelectedTicket(null)} aria-label="Voltar para lista">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-white text-sm md:text-lg flex items-center gap-1 md:gap-2 truncate">
                                        <span className="truncate">{selectedTicket.studentName}</span>
                                        <button onClick={() => handleViewStudent(selectedTicket.studentId)} className="text-gray-400 hover:text-blue-400 ml-1 shrink-0 transition-colors"><User className="w-4 h-4 md:w-5 md:h-5" /></button>
                                        {selectedTicket.status === 'pending_finance' && <span className="bg-blue-600/20 text-blue-400 text-[9px] px-1.5 py-0.5 rounded border border-blue-500/30 uppercase font-bold tracking-tighter">Financeiro</span>}
                                        {selectedTicket.status === 'pending_admin' && <span className="bg-orange-600/20 text-orange-400 text-[9px] px-1.5 py-0.5 rounded border border-orange-500/30 uppercase font-bold tracking-tighter">Admin</span>}
                                    </h3>
                                    <p className="text-[10px] md:text-xs text-gray-400 truncate">ID: {selectedTicket.studentId} • {selectedTicket.subject}</p>
                                </div>
                            </div>
                            {selectedTicket.status !== 'resolved' && (
                                <div className="flex gap-2 shrink-0">
                                    <Button variant="secondary" className="!text-[10px] md:!text-xs !py-1 px-2" onClick={() => setIsEscalating(true)}><TrendingUp className="w-3 h-3 md:mr-1" /> <span className="hidden md:inline">Escalar</span></Button>
                                    <Button onClick={() => handleResolve(selectedTicket.id)} className="!text-[10px] md:!text-xs !py-1 !bg-green-600 hover:!bg-green-500 px-2">Resolver</Button>
                                </div>
                            )}
                        </div>

                        {/* Nexus Suggestion Banner */}
                        <AnimatePresence>
                            {nexusSuggestion && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-blue-600/10 border-b border-blue-500/30 overflow-hidden"
                                >
                                    <div className="p-3 px-6 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-600 p-2 rounded-lg">
                                                <Brain className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white">Nexus Intelligence: Sugestão de Encaminhamento</p>
                                                <p className="text-[10px] text-gray-400">Palavras como "estorno" detectadas. Deseja mover para o Financeiro?</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setNexusSuggestion(null)}
                                                className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors"
                                            >IGNORAR</button>
                                            <button
                                                onClick={() => setIsEscalating(true)}
                                                className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                                            >ESCALAR PARA FINANCEIRO</button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-950 custom-scrollbar">
                            {selectedTicket.messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.user.uid === agent.uid ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] md:max-w-[75%] rounded-xl p-3 text-sm relative group ${msg.isInternal
                                        ? 'bg-amber-900/40 text-amber-100 border border-amber-500/30'
                                        : msg.user.uid === agent.uid
                                            ? 'bg-blue-600 text-white rounded-tr-none shadow-lg'
                                            : 'bg-gray-800 text-white rounded-tl-none border border-gray-750'
                                        }`}>
                                        {msg.isInternal && (
                                            <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 p-1.5 px-2 rounded-lg border border-amber-500/20 w-fit">
                                                <Lock className="w-3 h-3" /> Nota Privada
                                            </div>
                                        )}
                                        <p className="font-bold text-[10px] mb-1 opacity-70 uppercase tracking-widest flex items-center justify-between">
                                            {msg.user.name}
                                            {msg.user.role && <span className="text-[8px] bg-black/20 px-1 rounded ml-2">{msg.user.role}</span>}
                                        </p>
                                        {msg.messageType === 'image' && msg.attachmentUrl && (
                                            <div className="mb-2 rounded-lg overflow-hidden border border-black/10">
                                                <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer"><img src={msg.attachmentUrl} alt="Anexo" className="max-w-full h-auto" /></a>
                                            </div>
                                        )}
                                        {msg.messageType === 'file' && msg.attachmentUrl && (
                                            <div className="mb-2 flex items-center gap-2 bg-black/10 p-2 rounded-lg">
                                                <File className="w-4 h-4 text-blue-300" />
                                                {msg.attachmentUrl.includes('.webm') || msg.attachmentUrl.includes('.mp3') ? <audio controls src={msg.attachmentUrl} className="w-full h-8" /> : <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="underline truncate max-w-[150px]">Baixar Arquivo</a>}
                                            </div>
                                        )}
                                        {msg.text && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                                        <p className="text-[9px] text-right mt-1 opacity-70">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        {selectedTicket.status !== 'resolved' ? (
                            <form onSubmit={(e) => onSendMessage(e, isInternal)} className="p-4 bg-gray-800 border-t border-gray-700">
                                <div className="flex items-center gap-4 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsInternal(!isInternal)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${isInternal
                                            ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/40'
                                            : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <Lock className={`w-3 h-3 ${isInternal ? 'animate-bounce' : ''}`} />
                                        {isInternal ? 'Modo: Nota Privada' : 'Modo: Resposta Aluno'}
                                    </button>
                                    {isInternal && (
                                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-amber-500 font-medium italic flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> O aluno não verá esta mensagem.
                                        </motion.span>
                                    )}
                                </div>
                                <div className={`flex gap-2 md:gap-3 p-2 rounded-xl border transition-all shadow-inner ${isInternal ? 'bg-amber-900/10 border-amber-500/50 focus-within:border-amber-500' : 'bg-gray-900 border-gray-700 focus-within:border-brand-primary'}`}>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-blue-400" title="Anexar"><Paperclip className="w-5 h-5" /></button>
                                    <input type="file" value="" ref={fileInputRef} className="hidden" onChange={handleFileAttach} />
                                    <input className="flex-1 bg-transparent border-none text-white text-sm outline-none px-2 min-w-0" placeholder={isRecording ? "Gravando..." : isInternal ? "Digite uma nota interna..." : "Digite uma resposta..."} value={newMessage} onChange={e => setNewMessage(e.target.value)} disabled={isRecording} />
                                    <button type="button" onMouseDown={startRecording} onMouseUp={stopRecording} className={`p-2 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-blue-500'}`} title="Segure para gravar"><Mic className="w-5 h-5" /></button>
                                    <Button type="submit" className={`!rounded-lg !px-3 md:!px-4 !py-2 font-bold ${isInternal ? '!bg-amber-600 !text-white' : '!bg-brand-primary !text-black hover:!bg-yellow-400'}`} disabled={!newMessage.trim() && !isRecording}><Send className="w-5 h-5" /></Button>
                                </div>
                                {isUploading && <div className="mt-2 text-[10px] text-brand-primary font-bold uppercase animate-pulse flex items-center gap-2"><RefreshCw className="w-3 h-3 animate-spin" /> Enviando arquivo...</div>}
                            </form>
                        ) : (
                            <div className="p-4 bg-gray-800 border-t border-gray-700 text-center text-gray-500 text-sm">
                                Este chamado foi encerrado. {selectedTicket.nps && <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded inline-block"><p className="text-yellow-400 font-bold flex items-center justify-center gap-2"><Star className="w-4 h-4 fill-current" /> Avaliação: {selectedTicket.nps.score}</p></div>}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <p>Selecione um atendimento para começar.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
