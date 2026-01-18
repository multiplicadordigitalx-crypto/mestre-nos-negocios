
import React, { useState, useEffect, useRef } from 'react';
import { SupportAgent, ChatMessage } from '../../../types';
import { getAllStaff, listenToTeamChat, sendTeamMessage, uploadFileToStorage, markTeamChatAsRead } from '../../../services/mockFirebase';
import Button from '../../../components/Button';
import { Send, Users, Paperclip, Mic, File, RefreshCw, Camera, User } from '../../../components/Icons';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';

export const TeamChatView: React.FC<{ agent: SupportAgent }> = ({ agent }) => {
    const { user, updateProfilePhoto } = useAuth();
    const [contacts, setContacts] = useState<any[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const profileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        getAllStaff().then(staff => setContacts(staff.filter(s => s.id !== agent.uid)));
    }, [agent]);

    useEffect(() => {
        if (!activeChatId) return;
        const unsub = listenToTeamChat(agent.uid, activeChatId, (msgs: ChatMessage[]) => setMessages(msgs));
        markTeamChatAsRead(agent.uid, activeChatId);
        return () => unsub();
    }, [activeChatId, agent.uid]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeChatId) return;
        await sendTeamMessage(inputText, agent as any, activeChatId);
        setInputText('');
    };

    const handleContactSelect = (contactId: string) => {
        setActiveChatId(contactId);
        markTeamChatAsRead(agent.uid, contactId);
        setContacts(prev => prev.map(c => c.id === contactId ? { ...c, unreadCount: 0 } : c));
    };

    const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeChatId) return;
        setIsUploading(true);
        const tid = toast.loading("Enviando...");
        try {
            const url = await uploadFileToStorage(file);
            const type = file.type.startsWith('image/') ? 'image' : 'file';
            await sendTeamMessage(`📎 Anexo: ${file.name}`, agent, activeChatId, url, type);
            toast.success("Enviado!", { id: tid });
        } catch (error) { toast.error("Erro."); } finally { setIsUploading(false); }
    };

    const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Por favor, selecione um arquivo de imagem.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('A imagem deve ter no máximo 5MB.');
                return;
            }
            updateProfilePhoto(file);
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
                const file = new File([audioBlob], `audio_team_${Date.now()}.webm`, { type: 'audio/webm' });
                setIsUploading(true);
                const tid = toast.loading("Enviando...");
                try {
                    const url = await uploadFileToStorage(file);
                    if (activeChatId) await sendTeamMessage("🎤 Mensagem de áudio", agent, activeChatId, url, 'file');
                    toast.success("Enviado!", { id: tid });
                } catch (err) { toast.error("Erro."); } finally { setIsUploading(false); }
            };
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) { toast.error("Erro de microfone."); }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    return (
        <div className="flex h-full bg-gray-800 overflow-hidden shadow-xl">
             <div className="w-72 border-r border-gray-700 flex flex-col bg-gray-900/50">
                 <div className="p-4 border-b border-gray-700 font-bold text-white flex items-center gap-2">
                     <Users className="w-5 h-5 text-blue-500"/> Equipe
                 </div>

                 {/* SEÇÃO: MEU PERFIL (ALTERAR FOTO) */}
                 <div className="p-4 bg-gray-800/40 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="relative group cursor-pointer" onClick={() => profileInputRef.current?.click()}>
                            <img 
                                src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.email}`} 
                                className="w-12 h-12 rounded-full border-2 border-green-500/50 object-cover group-hover:opacity-60 transition-opacity" 
                                alt="Eu"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                            <input 
                                type="file" 
                                ref={profileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleProfilePhotoChange}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.displayName || 'Minha Conta'}</p>
                            <button 
                                onClick={() => profileInputRef.current?.click()}
                                className="text-[10px] text-brand-primary font-black uppercase hover:underline flex items-center gap-1"
                            >
                                Alterar Foto
                            </button>
                        </div>
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                     {contacts.map(c => (
                         <div 
                            key={c.id} 
                            onClick={() => handleContactSelect(c.id)} 
                            className={`p-4 cursor-pointer hover:bg-gray-700 transition-colors border-b border-gray-700/50 relative ${activeChatId === c.id ? 'bg-gray-700 border-l-4 border-l-blue-500' : ''}`}
                         >
                             <div className="flex items-center gap-3">
                                 <img src={c.photoURL || c.avatar || `https://i.pravatar.cc/150?u=${c.email}`} className="w-8 h-8 rounded-full border border-gray-700 object-cover" alt="" />
                                 <div className="flex-1 min-w-0">
                                     <div className="flex justify-between items-center">
                                         <p className="text-sm font-bold text-white truncate">{c.name || c.displayName}</p>
                                         {c.unreadCount > 0 && (
                                             <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border border-gray-900 shadow-lg">
                                                 {c.unreadCount}
                                             </span>
                                         )}
                                     </div>
                                     <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter truncate">{c.role}</p>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>

             <div className="flex-1 flex flex-col bg-gray-900">
                 {activeChatId ? (
                     <>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {messages.map(msg => {
                                const isMe = msg.user.uid === agent.uid;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-xl p-3 text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-700 text-white rounded-tl-none'}`}>
                                            {msg.messageType === 'image' && msg.attachmentUrl && <div className="mb-2 rounded-lg overflow-hidden"><img src={msg.attachmentUrl} className="max-w-full h-auto" alt="Anexo" /></div>}
                                            {msg.messageType === 'file' && msg.attachmentUrl && (
                                                <div className="mb-2 flex items-center gap-2 bg-black/10 p-2 rounded-lg">
                                                    <File className="w-4 h-4 text-blue-300"/>
                                                    {msg.attachmentUrl.includes('.webm') ? <audio controls src={msg.attachmentUrl} className="w-full h-8" /> : <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="underline truncate">Baixar</a>}
                                                </div>
                                            )}
                                            <p>{msg.text}</p>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
                            <div className="flex gap-3 items-center bg-gray-900 p-2 rounded-xl border border-gray-600 focus-within:border-blue-500 transition-all">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white" title="Anexar"><Paperclip className="w-5 h-5"/></button>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileAttach} />
                                <input className="flex-1 bg-transparent border-none text-white text-sm outline-none placeholder-gray-500" placeholder={isRecording ? "Gravando..." : "Mensagem interna..."} value={inputText} onChange={e => setInputText(e.target.value)} disabled={isRecording} />
                                <button type="button" onMouseDown={startRecording} onMouseUp={stopRecording} className={`p-2 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-blue-500'}`}><Mic className="w-5 h-5"/></button>
                                <Button type="submit" className="!rounded-lg !p-2 !bg-blue-600 hover:!bg-blue-500" disabled={!inputText.trim() && !isRecording}><Send className="w-5 h-5"/></Button>
                            </div>
                        </form>
                     </>
                 ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-gray-500"><Users className="w-16 h-16 mb-4 opacity-10"/><p>Selecione um colega para conversar.</p></div>
                 )}
             </div>
        </div>
    );
};
