
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SalesPerson, Lead, WhatsAppMessage, AppProduct } from '@/types';
import { getLeads, getWhatsAppChat, sendEvolutionMessage, claimLead, getAppProducts, uploadFileToStorage, markLeadAsRead } from '@/services/mockFirebase';
import { SalesScriptsModal } from '../modals/SalesScriptsModal';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    MessageSquare, ArrowLeft, FileText, Link as LinkIcon,
    CheckCircle, Send, Mic, ShoppingBag, ExternalLink,
    ClipboardCopy, Zap, Brain, PlusCircle, Paperclip,
    File as FileIcon, Image as ImageIcon, RefreshCw
} from '@/components/Icons';
import Button from '@/components/Button';

export type LeadFilter = 'mine' | 'new' | 'closed';

const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export const LeadsManagementView: React.FC<{ user: SalesPerson }> = ({ user }) => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [products, setProducts] = useState<AppProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<LeadFilter>('new');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [chatMessages, setChatMessages] = useState<WhatsAppMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isScriptsOpen, setIsScriptsOpen] = useState(false);

    // Multimedia states
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        Promise.all([getLeads(), getAppProducts()]).then(([leadsData, productsData]) => {
            setLeads(leadsData);
            setProducts(productsData);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, selectedLead]);

    const activeProduct = useMemo(() => {
        if (!selectedLead || !products.length) return null;
        return products.find(p => p.name === selectedLead.productInterest) || null;
    }, [selectedLead, products]);

    const filteredLeads = leads.filter(lead => {
        // SECURITY: Salespeople CANNOT see leads being nurtured by the bot
        if (lead.status === 'bot_nurturing') return false;

        if (filter === 'mine') return lead.assignedTo === user.uid && lead.status !== 'closed';
        if (filter === 'new') return lead.status === 'new' && !lead.assignedTo;
        // 'new' implies available. If bot is nurturing, it is NOT available.
        if (filter === 'closed') return lead.assignedTo === user.uid && lead.status === 'closed';
        return true;
    });

    const handleSelectLead = async (lead: Lead) => {
        if (!lead.assignedTo && filter === 'new') {
            await claimLead(lead.id, user.uid);
            const updatedLead = { ...lead, assignedTo: user.uid, status: 'in_progress' as const, unreadCount: 0 };
            setLeads(prevLeads => prevLeads.map(l => l.id === lead.id ? updatedLead : l));
            setSelectedLead(updatedLead);
            toast.success("Lead assumido com sucesso!");
        } else {
            setSelectedLead({ ...lead, unreadCount: 0 });
            markLeadAsRead(lead.id);
            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, unreadCount: 0 } : l));
        }
        const msgs = await getWhatsAppChat();
        setChatMessages(msgs as WhatsAppMessage[]);
    };

    const handleSendWhatsApp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!chatInput.trim() || !selectedLead) return;

        await sendEvolutionMessage(selectedLead.phone, chatInput);

        setChatMessages(prev => [...prev, {
            id: 'msg-' + Date.now(),
            text: chatInput,
            sender: 'agent',
            agentName: user.displayName || 'Vendedor',
            timestamp: Date.now(),
            status: 'sent',
            type: 'text'
        }]);
        setChatInput('');
    };

    // --- MULTIMEDIA HANDLERS ---

    const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedLead) return;

        setIsUploading(true);
        const toastId = toast.loading("Enviando arquivo para o WhatsApp...");

        try {
            const url = await uploadFileToStorage(file);
            const type = file.type.startsWith('image/') ? 'image' : 'file';

            await sendEvolutionMessage(selectedLead.phone, `[${type.toUpperCase()}]`);

            setChatMessages(prev => [...prev, {
                id: 'msg-file-' + Date.now(),
                text: type === 'image' ? '' : `📎 ${file.name}`,
                sender: 'agent',
                agentName: user.displayName || 'Vendedor',
                timestamp: Date.now(),
                status: 'sent',
                type: type as any,
                mediaUrl: url
            }]);

            toast.success("Arquivo enviado!", { id: toastId });
        } catch (error) {
            toast.error("Erro no envio do arquivo.", { id: toastId });
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

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const file = new File([audioBlob], `audio_lead_${Date.now()}.webm`, { type: 'audio/webm' });

                setIsUploading(true);
                const toastId = toast.loading("Enviando áudio...");

                try {
                    const url = await uploadFileToStorage(file);
                    if (selectedLead) {
                        await sendEvolutionMessage(selectedLead.phone, "[AUDIO]");
                        setChatMessages(prev => [...prev, {
                            id: 'msg-audio-' + Date.now(),
                            text: '',
                            sender: 'agent',
                            agentName: user.displayName || 'Vendedor',
                            timestamp: Date.now(),
                            status: 'sent',
                            type: 'audio',
                            mediaUrl: url
                        }]);
                    }
                    toast.success("Áudio enviado!", { id: toastId });
                } catch (err) {
                    toast.error("Erro ao enviar áudio.", { id: toastId });
                } finally {
                    setIsUploading(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            toast("Gravando áudio...", { icon: '🎙️', id: 'recording-leads' });
        } catch (err) {
            toast.error("Erro ao acessar microfone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            toast.dismiss('recording-leads');
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const copySmartLink = (type: 'PV' | 'CHECKOUT') => {
        if (!activeProduct) return toast.error("Produto de interesse não identificado.");
        const link = type === 'PV' ? activeProduct.landingPage : activeProduct.baseAffiliateLink;
        navigator.clipboard.writeText(link);
        toast.success(`Link de ${type === 'PV' ? 'Página de Vendas' : 'Checkout'} copiado!`, {
            icon: type === 'PV' ? '📄' : '💰'
        });
    };

    const handleCopyScript = (text: string) => {
        setChatInput(text);
        toast.success("Script copiado para o campo de texto!");
    };

    const handleCloseLead = () => {
        if (!selectedLead) return;
        setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, status: 'closed' } : l));
        setSelectedLead(null);
        toast.success("Atendimento encerrado. Lead movido para Fechados.");
    };

    return (
        <div className="flex h-full bg-[#0c0d12] md:rounded-2xl md:border md:border-gray-800 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Leads List */}
            <div className={`w-full md:w-80 bg-gray-900 border-r border-gray-800 flex flex-col ${selectedLead ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-800 bg-gray-950/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-white flex items-center gap-2 uppercase text-xs tracking-widest">
                            <Zap className="w-4 h-4 text-green-400" /> Leads Ativos
                        </h3>
                        <span className="text-[9px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded font-black border border-blue-500/20">WHATSMEOW</span>
                    </div>
                    <div className="flex gap-2 p-1 bg-gray-800 rounded-xl">
                        {(['new', 'mine', 'closed'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                {f === 'new' ? 'Fila' : f === 'mine' ? 'Meus' : 'Feitos'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading && <div className="p-10 text-center"><LoadingSpinner size="sm" /></div>}
                    {filteredLeads.map(lead => (
                        <div key={lead.id} onClick={() => handleSelectLead(lead)} className={`p-4 border-b border-gray-800/50 cursor-pointer transition-all hover:bg-gray-800/50 relative ${selectedLead?.id === lead.id ? 'bg-gray-800 border-l-4 border-l-blue-600' : ''}`}>
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-white text-sm truncate">{lead.name}</span>
                                <span className="text-[10px] text-gray-500 font-mono">{formatTime(lead.lastInteraction)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-brand-primary uppercase flex items-center gap-1 bg-brand-primary/10 px-1.5 py-0.5 rounded border border-brand-primary/20">
                                        <ShoppingBag className="w-2.5 h-2.5" /> {lead.productInterest}
                                    </span>
                                </div>
                                {lead.unreadCount && lead.unreadCount > 0 ? (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border border-gray-900 shadow-lg">
                                        {lead.unreadCount}
                                    </span>
                                ) : (
                                    lead.status === 'new' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-[#0c0d12] ${!selectedLead ? 'hidden md:flex' : 'flex'}`}>
                {selectedLead ? (
                    <>
                        <div className="h-20 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/50 z-10">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedLead(null)} className="md:hidden text-gray-400 p-2"><ArrowLeft className="w-6 h-6" /></button>
                                <div className="relative">
                                    <div className="w-11 h-11 bg-gray-700 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-inner uppercase">
                                        {selectedLead.name.charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
                                </div>
                                <div>
                                    <h4 className="font-black text-white text-sm uppercase tracking-tight">{selectedLead.name}</h4>
                                    <p className="text-[10px] text-gray-500 font-mono">{selectedLead.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {activeProduct && (
                                    <div className="hidden lg:flex items-center gap-2 bg-gray-800 p-1.5 rounded-xl border border-gray-700">
                                        <button
                                            onClick={() => copySmartLink('PV')}
                                            className="px-3 py-1.5 bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase rounded-lg border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" /> Link PV
                                        </button>
                                        <button
                                            onClick={() => copySmartLink('CHECKOUT')}
                                            className="px-3 py-1.5 bg-green-600/20 text-green-400 text-[10px] font-black uppercase rounded-lg border border-green-500/30 hover:bg-green-600 hover:text-white transition-all flex items-center gap-1.5"
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5" /> Link Checkout
                                        </button>
                                    </div>
                                )}

                                <button onClick={() => setIsScriptsOpen(true)} className="p-2.5 bg-gray-800 hover:bg-yellow-500 hover:text-black text-yellow-400 rounded-xl border border-gray-700" title="Scripts Venda"><FileText className="w-5 h-5" /></button>
                                <button onClick={handleCloseLead} className="p-2.5 bg-gray-800 hover:bg-green-600 text-green-500 hover:text-white rounded-xl border border-gray-700" title="Marcar como Vendido"><CheckCircle className="w-5 h-5" /></button>
                            </div>
                        </div>

                        <div className="bg-blue-600/10 border-b border-blue-500/20 px-6 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-blue-400 animate-pulse" />
                                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">Nexus Interest: <strong className="text-white">{selectedLead.productInterest}</strong></span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/30 custom-scrollbar">
                            {chatMessages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'lead' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[70%] rounded-[1.2rem] p-4 text-sm shadow-xl ${msg.sender === 'lead' ? 'bg-gray-800 text-white rounded-tl-none' : 'bg-green-600 text-white rounded-tr-none border border-green-500'}`}>
                                        {msg.sender !== 'lead' && (
                                            <span className="absolute -top-5 right-0 text-[8px] font-bold uppercase text-gray-500">
                                                {msg.sender === 'bot' ? '🤖 Resposta Bot Alex' : '👨‍💻 Você assumiu'}
                                            </span>
                                        )}
                                        {msg.type === 'link' && <LinkIcon className="w-4 h-4 mb-2 text-yellow-300" />}
                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        <p className="text-[8px] text-right mt-2 font-mono opacity-60 uppercase">{formatTime(msg.timestamp)} {msg.sender === 'human' && '• você'}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendWhatsApp} className="p-4 bg-gray-900 border-t border-gray-800">
                            <div className="flex gap-3 bg-gray-800 rounded-2xl p-2 border border-gray-700 focus-within:border-blue-500 transition-all shadow-inner items-center">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-gray-500 hover:text-blue-400 transition-colors"
                                    title="Anexar Arquivo"
                                >
                                    <Paperclip className="w-6 h-6" />
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileAttach} />

                                <input
                                    className="flex-1 bg-transparent border-none text-white text-sm outline-none placeholder-gray-600"
                                    placeholder={isRecording ? "Gravando áudio..." : "Digite a mensagem para o cliente..."}
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    disabled={isRecording}
                                />

                                <button
                                    type="button"
                                    onMouseDown={startRecording}
                                    onMouseUp={stopRecording}
                                    className={`p-2 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-blue-400'}`}
                                    title="Segure para gravar áudio"
                                >
                                    <Mic className="w-6 h-6" />
                                </button>

                                <Button type="submit" className="!p-3 !rounded-xl !bg-green-600 hover:!bg-green-500" disabled={!chatInput.trim() || isRecording}>
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                            {isUploading && (
                                <div className="mt-2 flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase animate-pulse">
                                    <RefreshCw className="w-3 h-3 animate-spin" /> Enviando para o WhatsApp...
                                </div>
                            )}
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                        <div className="w-20 h-20 bg-gray-900 rounded-3xl flex items-center justify-center mb-6 border border-gray-800 shadow-2xl">
                            <MessageSquare className="w-10 h-10 opacity-20" />
                        </div>
                        <p className="font-black uppercase tracking-widest text-xs">Selecione um lead para vender</p>
                    </div>
                )}
            </div>

            {isScriptsOpen && (
                <SalesScriptsModal
                    onClose={() => setIsScriptsOpen(false)}
                    onCopy={handleCopyScript}
                    lead={selectedLead}
                />
            )}
        </div>
    )
};
