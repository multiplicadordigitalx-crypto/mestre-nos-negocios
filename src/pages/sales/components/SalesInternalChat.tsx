
import React, { useState, useEffect, useRef } from 'react';
import Button from '@/components/Button';
// Added RefreshCw to the imports
import { Users, Send, MessageSquare, Camera, Mic, Paperclip, File, Image as ImageIcon, RefreshCw } from '@/components/Icons';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SalesPerson, ChatMessage } from '@/types';
import { getSalesTeam, listenToTeamChat, sendTeamMessage, uploadFileToStorage, markTeamChatAsRead } from '@/services/mockFirebase';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export const SalesInternalChat: React.FC<{ user: SalesPerson }> = ({ user }) => {
    const { updateProfilePhoto } = useAuth();
    const [contacts, setContacts] = useState<SalesPerson[]>([]);
    const [activeChatUser, setActiveChatUser] = useState<SalesPerson | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);

    // Multimedia states
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const profilePhotoRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        const loadTeamContacts = async () => {
            setLoading(true);
            try {
                const allSales = await getSalesTeam();

                let teamContacts: SalesPerson[] = [];

                if (user.role === 'sales_manager') {
                    // Gerente vê todos os seus agentes
                    teamContacts = allSales.filter(s => s.managerId === user.uid);
                } else {
                    // Vendedor vê seu gerente E seus colegas de mesma equipe
                    teamContacts = allSales.filter(s =>
                        (s.uid === user.managerId) || // O Gerente
                        (s.managerId === user.managerId && s.uid !== user.uid) // Colegas (mesmo gerente)
                    );
                }

                setContacts(teamContacts);

                // Seleciona automaticamente o primeiro contato se houver apenas um (ex: gerente)
                if (teamContacts.length === 1 && !activeChatUser) {
                    setActiveChatUser(teamContacts[0]);
                }
            } catch (e) {
                console.error("Erro ao carregar contatos da equipe", e);
            } finally {
                setLoading(false);
            }
        };
        loadTeamContacts();
    }, [user]);

    useEffect(() => {
        if (!activeChatUser) return;

        // Inicia escuta de mensagens entre o usuário logado e o contato selecionado
        const unsub = listenToTeamChat(user.uid, activeChatUser.uid, (msgs: ChatMessage[]) => {
            setMessages(msgs);
        });
        markTeamChatAsRead(user.uid, activeChatUser.uid);
        return () => unsub();
    }, [activeChatUser, user.uid]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputText.trim() || !activeChatUser) return;

        try {
            await sendTeamMessage(inputText, user, activeChatUser.uid);
            setInputText('');
        } catch (e) {
            toast.error("Falha ao enviar mensagem.");
        }
    };

    const handleContactSelect = (contact: SalesPerson) => {
        setActiveChatUser(contact);
        markTeamChatAsRead(user.uid, contact.uid);
        setContacts(prev => prev.map(c => c.uid === contact.uid ? { ...c, unreadCount: 0 } : c));
    };

    // --- PHOTO CHANGE ---
    const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            updateProfilePhoto(file);
            toast.success("Foto atualizada!");
        }
    };

    // --- FILE UPLOAD ---
    const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeChatUser) return;

        setIsUploading(true);
        const toastId = toast.loading("Enviando arquivo...");

        try {
            const url = await uploadFileToStorage(file);
            const type = file.type.startsWith('image/') ? 'image' : 'file';
            await sendTeamMessage(`📎 Anexo: ${file.name}`, user, activeChatUser.uid, url, type);
            toast.success("Enviado!", { id: toastId });
        } catch (error) {
            toast.error("Erro no envio.", { id: toastId });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // --- AUDIO RECORDING ---
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
                const file = new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });

                setIsUploading(true);
                const toastId = toast.loading("Enviando áudio...");
                try {
                    const url = await uploadFileToStorage(file);
                    if (activeChatUser) {
                        await sendTeamMessage("🎤 Mensagem de áudio", user, activeChatUser.uid, url, 'file'); // Usamos file para audio renderizado
                    }
                    toast.success("Áudio enviado!", { id: toastId });
                } catch (err) {
                    toast.error("Erro no áudio.", { id: toastId });
                } finally {
                    setIsUploading(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            toast("Gravando...", { icon: '🎙️', id: 'recording-toast' });
        } catch (err) {
            toast.error("Erro ao acessar microfone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            toast.dismiss('recording-toast');
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    return (
        <div className="flex h-full bg-gray-900 rounded-xl overflow-hidden">
            {/* Lista de Contatos da Equipe */}
            <div className="w-72 border-r border-gray-800 flex flex-col bg-gray-800/50">
                {/* Header do Usuário Logado */}
                <div className="p-4 border-b border-gray-700 bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="relative group cursor-pointer" onClick={() => profilePhotoRef.current?.click()}>
                            <img
                                src={user.photoURL || `https://i.pravatar.cc/150?u=${user.email}`}
                                className="w-12 h-12 rounded-xl border-2 border-blue-500 object-cover"
                                alt="Eu"
                            />
                            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-4 h-4 text-white" />
                            </div>
                            <input type="file" ref={profilePhotoRef} className="hidden" accept="image/*" onChange={handleProfilePhotoChange} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-white truncate">{user.displayName}</p>
                            <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest">Vendedor Afiliado</p>
                        </div>
                    </div>
                </div>

                <div className="p-3 border-b border-gray-700 bg-gray-900/30">
                    <h3 className="font-black text-gray-500 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                        <Users className="w-3 h-3" /> Equipe Comercial
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-10 flex justify-center"><LoadingSpinner size="sm" /></div>
                    ) : (
                        contacts.map(contact => (
                            <div
                                key={contact.uid}
                                onClick={() => handleContactSelect(contact)}
                                className={`p-4 flex items-center gap-3 cursor-pointer transition-all border-b border-gray-700/30 relative ${activeChatUser?.uid === contact.uid ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : 'hover:bg-gray-700/30'}`}
                            >
                                <div className="relative">
                                    <img src={contact.photoURL || `https://i.pravatar.cc/150?u=${contact.email}`} className="w-10 h-10 rounded-xl object-cover border border-gray-600" alt="Avatar" />
                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${contact.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-bold text-white truncate">{contact.displayName}</p>
                                        {contact.unreadCount && contact.unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border border-gray-900 shadow-lg">
                                                {contact.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">
                                        {contact.role === 'sales_manager' ? 'Gerente' : 'Vendedor'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Área de Chat */}
            <div className="flex-1 flex flex-col bg-gray-950/20">
                {activeChatUser ? (
                    <>
                        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-800/40 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <img src={activeChatUser.photoURL || `https://i.pravatar.cc/150?u=${activeChatUser.email}`} className="w-10 h-10 rounded-xl object-cover border border-gray-600" alt="Avatar" />
                                <div>
                                    <h4 className="font-bold text-white text-sm">{activeChatUser.displayName}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${activeChatUser.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{activeChatUser.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/10">
                            {messages.map(msg => {
                                const isMe = msg.user.uid === user.uid;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-lg ${isMe ? 'bg-blue-600 text-white rounded-tr-none border border-blue-500' : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'}`}>

                                            {/* Multimedia Rendering */}
                                            {msg.messageType === 'image' && msg.attachmentUrl && (
                                                <div className="mb-2 rounded-lg overflow-hidden border border-black/20">
                                                    <img src={msg.attachmentUrl} className="max-w-full h-auto" alt="Anexo" />
                                                </div>
                                            )}

                                            {msg.messageType === 'file' && msg.attachmentUrl && (
                                                <div className="mb-2">
                                                    {msg.attachmentUrl.includes('.webm') || msg.attachmentUrl.includes('.mp3') ? (
                                                        <audio controls src={msg.attachmentUrl} className="w-full h-8 opacity-80" />
                                                    ) : (
                                                        <div className="bg-black/20 p-2 rounded flex items-center gap-2">
                                                            <File className="w-4 h-4 text-blue-400" />
                                                            <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs underline truncate">{msg.text.replace('📎 Anexo: ', '')}</a>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <p className="leading-relaxed">{msg.text}</p>
                                            <p className={`text-[9px] text-right mt-1 font-mono ${isMe ? 'text-blue-200' : 'text-gray-500'}`}>
                                                {formatTime(msg.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 bg-gray-900/50 border-t border-gray-800">
                            <div className="flex gap-3 bg-gray-800 rounded-xl p-2 border border-gray-700 focus-within:border-blue-500 transition-all shadow-inner items-center">

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-gray-500 hover:text-blue-400 transition-colors"
                                    title="Anexar Arquivo"
                                >
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileAttach} />

                                <input
                                    className="flex-1 bg-transparent border-none text-white text-sm outline-none px-2 py-1 placeholder-gray-600"
                                    placeholder={isRecording ? "Gravando áudio..." : "Digite sua mensagem..."}
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    disabled={isRecording}
                                />

                                <button
                                    type="button"
                                    onMouseDown={startRecording}
                                    onMouseUp={stopRecording}
                                    className={`p-2 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-blue-400'}`}
                                    title="Segure para gravar áudio"
                                >
                                    <Mic className="w-5 h-5" />
                                </button>

                                <Button type="submit" className="!p-2.5 !rounded-lg !bg-blue-600 hover:!bg-blue-500" disabled={!inputText.trim() || isRecording}>
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                            {isUploading && (
                                <div className="mt-2 flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase animate-pulse">
                                    <RefreshCw className="w-3 h-3 animate-spin" /> Enviando arquivo...
                                </div>
                            )}
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                        <Users className="w-16 h-16 mb-4 opacity-10" />
                        <p className="text-xs uppercase font-black tracking-[0.2em]">Selecione um membro para conversar</p>
                    </div>
                )}
            </div>
        </div>
    );
};
