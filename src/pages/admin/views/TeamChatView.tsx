import React, { useState, useEffect, useRef } from 'react';
import { User, Image, Send, Paperclip, MoreVertical, Edit2, Search, Trash2, Camera, MessageSquare } from '../../../components/Icons';
import Button from '../../../components/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeamUsers, updateTeamUser } from '../../../services/mockFirebase';
import { TeamUser, ChatMessage } from '../../../types/legacy';
import toast from 'react-hot-toast';

export const TeamChatView: React.FC<{ user: any }> = ({ user }) => {
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [teamMembers, setTeamMembers] = useState<TeamUser[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const users = await getTeamUsers();
            setTeamMembers(users);
            // Simulate loading initial messages for a chat
            setMessages([]);
        } catch (error) {
            console.error("Error loading chat data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (!message.trim() || !selectedChat) return;

        const newMessage = {
            id: Date.now(),
            text: message,
            sender: user.displayName || 'Eu',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
            avatar: user?.photoURL
        };

        setMessages(prev => [...prev, newMessage]);
        setMessage('');
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            try {
                const member = teamMembers.find(m => m.email === user.email);
                if (member) {
                    await updateTeamUser(member.id, { photoURL: base64 });
                    toast.success("Foto de perfil atualizada!");
                    loadData();
                    setIsProfileModalOpen(false);
                } else {
                    toast.error("Não foi possível atualizar: Usuário não encontrado na equipe.");
                }
            } catch (err) {
                toast.error("Erro ao atualizar foto.");
            }
        };
        reader.readAsDataURL(file);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'EU';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'blocked': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const selectedMember = teamMembers.find(m => m.id === selectedChat);

    return (
        <div className="flex-1 w-full h-full flex flex-col md:flex-row min-h-0 overflow-hidden bg-gray-900 text-white">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-full shrink-0">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <User className="w-5 h-5 text-brand-primary" /> Equipe Nexus
                    </h2>
                    <div className="relative mt-4">
                        <input
                            type="text"
                            placeholder="Buscar membro..."
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-300 focus:border-brand-primary outline-none transition-all focus:ring-1 focus:ring-brand-primary/50"
                        />
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {/* Team Members */}
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 px-2">Membros ({teamMembers.length})</h3>
                    <div className="space-y-1">
                        {teamMembers.map(member => (
                            <button
                                key={member.id}
                                onClick={() => {
                                    setSelectedChat(member.id);
                                    // Reset messages or load specific chat history here
                                    setMessages([]);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-colors hover:bg-gray-700/50 group ${selectedChat === member.id ? 'bg-gray-700/50' : ''}`}
                            >
                                <div className="relative w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden border border-gray-600">
                                    {member.photoURL ? (
                                        <img src={member.photoURL} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-xs text-gray-300">{getInitials(member.name)}</span>
                                    )}
                                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-800 ${getStatusColor(member.status)}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`truncate font-medium transition-colors ${selectedChat === member.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{member.name}</p>
                                    <p className="text-[10px] text-gray-500 truncate capitalize">{member.role.replace('_', ' ')}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* User Profile (Bottom) */}
                <div className="p-3 border-t border-gray-700 bg-gray-800/50">
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors group" onClick={() => setIsProfileModalOpen(true)}>
                        <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-black font-bold relative overflow-hidden">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Me" className="w-full h-full object-cover" />
                            ) : (
                                <span>{getInitials(user?.displayName)}</span>
                            )}
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit2 className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.displayName || 'Meu Perfil'}</p>
                            <p className="text-xs text-gray-400">Online</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-900 h-full relative">
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#0a0a0a]/50 backdrop-blur-sm sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700">
                                    {selectedMember?.photoURL ? (
                                        <img src={selectedMember.photoURL} alt={selectedMember.name} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <User className="w-4 h-4" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">
                                        {selectedMember?.name || 'Usuário'}
                                    </h3>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {selectedMember?.role.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                                    <Search className="w-5 h-5" />
                                </button>
                                <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                                    <MessageSquare className="w-16 h-16 mb-4" />
                                    <p>Inicie uma conversa com {selectedMember?.name}</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id} className={`flex gap-4 ${msg.isMe ? 'flex-row-reverse' : ''} group`}>
                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden border border-gray-600 shadow-sm">
                                            {msg.avatar ? (
                                                <img src={msg.avatar} alt={msg.sender} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-xs text-gray-300">{getInitials(msg.sender)}</span>
                                            )}
                                        </div>
                                        <div className={`max-w-[70%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-sm font-bold text-white">{msg.sender}</span>
                                                <span className="text-[10px] text-gray-500">{msg.time}</span>
                                            </div>
                                            <div className={`p-4 rounded-2xl shadow-md ${msg.isMe ? 'bg-brand-primary text-black rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'}`}>
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-800 bg-[#0a0a0a]">
                            <div className="bg-gray-800 rounded-xl border border-gray-700 flex items-end p-2 gap-2 focus-within:ring-1 focus-within:ring-brand-primary transition-all shadow-lg">
                                <button className="p-3 text-gray-400 hover:text-white transition-colors hover:bg-gray-700 rounded-lg">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={`Mensagem para ${selectedMember?.name}...`}
                                    className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-gray-500 py-3 min-h-[44px] max-h-32 resize-none custom-scrollbar"
                                    rows={1}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className={`p-3 rounded-lg transition-all duration-200 ${message.trim() ? 'bg-brand-primary text-black hover:bg-brand-secondary shadow-lg shadow-brand-primary/20' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                                    disabled={!message.trim()}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-gray-700">
                            <User className="w-10 h-10 text-brand-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Selecione um membro</h3>
                        <p className="text-sm text-gray-500 max-w-xs text-center">
                            Escolha alguém da equipe ao lado para iniciar uma conversa privada.
                        </p>
                    </div>
                )}
            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isProfileModalOpen && (
                    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0a0a0a]">
                                <h3 className="text-xl font-bold text-white">Editar Perfil no Chat</h3>
                                <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-colors">
                                    <Trash2 className="w-5 h-5 rotate-45" />
                                </button>
                            </div>
                            <div className="p-8 flex flex-col items-center gap-8">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-32 h-32 rounded-full bg-gray-800 border-4 border-gray-700 flex items-center justify-center overflow-hidden shadow-2xl">
                                        {user?.photoURL ? (
                                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl font-bold text-gray-500">{getInitials(user?.displayName)}</span>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-brand-primary p-2 rounded-full border-4 border-gray-900 text-black shadow-lg">
                                        <Edit2 className="w-4 h-4" />
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />

                                <div className="text-center space-y-1">
                                    <h4 className="text-2xl font-black text-white">{user?.displayName}</h4>
                                    <p className="text-sm text-gray-400 font-mono bg-gray-800 px-3 py-1 rounded-full">{user?.email}</p>
                                </div>

                                <div className="w-full space-y-3">
                                    <Button onClick={() => fileInputRef.current?.click()} className="w-full justify-center gap-2 !py-3 font-bold">
                                        <Image className="w-4 h-4" /> Carregar Nova Foto
                                    </Button>
                                    <Button variant="secondary" className="w-full justify-center !py-3" onClick={() => setIsProfileModalOpen(false)}>
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
