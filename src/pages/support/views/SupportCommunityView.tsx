import React, { useState, useEffect, useRef } from 'react';
import { SupportAgent, ChatChannel, ChatMessage } from '../../../types/legacy';
import { getChannels, listenToMessages, deleteMessage, sendMessage } from '../../../services/mockFirebase';
import { MessageSquare, Users, Shield, Trash2, Hash, Send, Paperclip } from '../../../components/Icons';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import toast from 'react-hot-toast';

interface SupportCommunityViewProps {
    agent: SupportAgent;
}

export const SupportCommunityView: React.FC<SupportCommunityViewProps> = ({ agent }) => {
    const [channels, setChannels] = useState<ChatChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadChannels();
    }, []);

    useEffect(() => {
        if (!selectedChannel) return;

        const unsub = listenToMessages(selectedChannel.id, (msgs) => {
            setMessages(msgs);
        });

        return () => unsub();
    }, [selectedChannel]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadChannels = async () => {
        setLoading(true);
        try {
            const allChannels = await getChannels();
            // Filter channels where agent is moderator
            const moderated = allChannels.filter(c => c.moderators?.includes(agent.uid));
            setChannels(moderated);
        } catch (error) {
            toast.error("Erro ao carregar canais.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMessage = async (msgId: string) => {
        if (!selectedChannel) return;
        if (confirm("Deseja realmente excluir esta mensagem?")) {
            await deleteMessage(selectedChannel.id, msgId);
            toast.success("Mensagem excluída.");
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedChannel) return;
        await sendMessage(inputText, agent as any, selectedChannel.id);
        setInputText('');
    };

    if (loading) return <div className="flex justify-center p-20"><LoadingSpinner /></div>;

    return (
        <div className="flex h-full bg-gray-900 overflow-hidden shadow-2xl">
            {/* Sidebar: Channels */}
            <div className="w-80 border-r border-gray-700 bg-gray-800/50 flex flex-col">
                <div className="p-6 border-b border-gray-700 bg-gray-800/30">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400" /> Moderar
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Canais Atribuídos</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {channels.length > 0 ? (
                        channels.map(channel => (
                            <button
                                key={channel.id}
                                onClick={() => setSelectedChannel(channel)}
                                className={`w-full p-4 rounded-xl flex items-start gap-3 transition-all ${selectedChannel?.id === channel.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${selectedChannel?.id === channel.id ? 'bg-white/20' : 'bg-gray-700'}`}>
                                    <Hash className="w-4 h-4" />
                                </div>
                                <div className="text-left min-w-0">
                                    <p className="font-bold truncate">{channel.name}</p>
                                    <p className={`text-[10px] truncate ${selectedChannel?.id === channel.id ? 'text-white/70' : 'text-gray-500'}`}>
                                        {channel.description}
                                    </p>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="p-8 text-center">
                            <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                            <p className="text-xs text-gray-500 italic">Nenhum canal para moderar.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main: Chat Moderation */}
            <div className="flex-1 flex flex-col bg-gray-950/50">
                {selectedChannel ? (
                    <>
                        <div className="p-4 bg-gray-800/30 border-b border-gray-700 flex justify-between items-center backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center border border-gray-700 shadow-inner">
                                    <Hash className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">#{selectedChannel.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Modo Moderador Ativo</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-mod-grid">
                            {messages.length > 0 ? (
                                messages.map(msg => (
                                    <div key={msg.id} className="group flex items-start gap-4 animate-in fade-in slide-in-from-left-2 transition-all">
                                        <img src={msg.user.avatar} className="w-10 h-10 rounded-full border border-gray-700 object-cover shadow-lg" alt="" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className={`font-black text-sm ${msg.user.role === 'support_agent' ? 'text-emerald-400' : 'text-indigo-300'}`}>
                                                    {msg.user.name}
                                                </span>
                                                <span className="text-[9px] text-gray-600 font-bold">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {msg.user.role === 'student' && (
                                                    <span className="text-[9px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded border border-gray-700 uppercase font-black">ALUNO</span>
                                                )}
                                            </div>
                                            <div className="bg-gray-800/40 p-3 rounded-2xl rounded-tl-none border border-gray-700/50 text-gray-200 text-sm shadow-sm hover:bg-gray-800/60 transition-colors relative">
                                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                                                {/* Mod Actions Overlay */}
                                                <div className="absolute top-2 -right-12 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-1">
                                                    <button
                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all shadow-lg"
                                                        title="Excluir Mensagem"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                                    <MessageSquare className="w-16 h-16 mb-4 text-gray-600" />
                                    <p className="text-gray-500 font-bold uppercase tracking-widest italic">Aguardando mensagens...</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-6 bg-gray-900 border-t border-gray-800 backdrop-blur-xl">
                            <div className="flex gap-4 items-center bg-gray-800/50 p-3 rounded-[1.5rem] border border-gray-700 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-inner">
                                <button type="button" className="p-3 text-gray-500 hover:text-white transition-colors"><Paperclip className="w-5 h-5" /></button>
                                <input
                                    className="flex-1 bg-transparent border-none text-white text-sm outline-none placeholder-gray-600"
                                    placeholder={`Falar como moderador em #${selectedChannel.name}...`}
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                />
                                <Button
                                    type="submit"
                                    className="!rounded-2xl !p-3 !bg-indigo-600 hover:!bg-indigo-500 shadow-lg shadow-indigo-600/20"
                                    disabled={!inputText.trim()}
                                >
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-600 text-center p-12">
                        <div className="w-24 h-24 bg-gray-800 rounded-[2.5rem] flex items-center justify-center mb-6 border border-gray-700 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Shield className="w-12 h-12 text-gray-700 group-hover:text-indigo-400 transition-colors z-10" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Painel de Moderação</h3>
                        <p className="text-gray-500 max-w-sm">
                            Selecione um canal à esquerda para acompanhar e moderar as interações da comunidade.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
