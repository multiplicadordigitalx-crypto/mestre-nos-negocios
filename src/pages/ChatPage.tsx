
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import { Send, Hash, LockClosed, MessageSquare, Users, ShieldCheck, Trophy, Search } from '../components/Icons';
import { useAuth } from '../hooks/useAuth';
import { ChatMessage, ChatChannel } from '../types';
import { listenToMessages, sendMessage, getChannels, markChannelAsRead } from '../services/mockFirebase';
import { LoadingSpinner } from '../components/LoadingSpinner';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile

  useEffect(() => {
    // Load Channels
    const load = async () => {
        const data = await getChannels();
        setChannels(data);
        if (data.length > 0) {
            setActiveChannel(data[0]);
            markChannelAsRead(data[0].id);
        }
        setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!activeChannel) return;
    
    setLoading(true);
    const unsubscribe = listenToMessages(activeChannel.id, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [activeChannel]);

  useEffect(() => {
    if (messages.length > 0) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleChannelSelect = (channel: ChatChannel) => {
      setActiveChannel(channel);
      setIsSidebarOpen(false);
      markChannelAsRead(channel.id);
      // Atualiza localmente o contador para feedback imediato
      setChannels(prev => prev.map(c => c.id === channel.id ? { ...c, unreadCount: 0 } : c));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user || !activeChannel) return;

    sendMessage(newMessage.trim(), user, activeChannel.id);
    setNewMessage('');
  };

  const formatDate = (timestamp: number) => {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) return "Hoje";
      if (date.toDateString() === yesterday.toDateString()) return "Ontem";
      return date.toLocaleDateString();
  };

  // Group messages by date - Optimized with useMemo
  const groupedMessages = useMemo(() => {
      return messages.reduce((groups, msg) => {
          const date = formatDate(msg.createdAt);
          if (!groups[date]) groups[date] = [];
          groups[date].push(msg);
          return groups;
      }, {} as Record<string, ChatMessage[]>);
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-2xl">
        
        {/* Sidebar - Channels */}
        <div className={`
            absolute md:relative z-20 w-64 h-full bg-gray-800 border-r border-gray-700 flex flex-col transition-transform duration-300
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
            <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-900/50">
                <h2 className="font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-primary"/> Comunidade
                </h2>
                <button className="md:hidden text-gray-400" onClick={() => setIsSidebarOpen(false)}>✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {loading && channels.length === 0 && <div className="p-4"><LoadingSpinner size="sm"/></div>}
                
                <p className="px-3 pt-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Canais de Texto</p>
                
                {channels.map(channel => (
                    <button
                        key={channel.id}
                        onClick={() => handleChannelSelect(channel)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative ${
                            activeChannel?.id === channel.id 
                                ? 'bg-gray-700 text-white font-medium' 
                                : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                        }`}
                    >
                        <span className="text-lg opacity-70 group-hover:opacity-100">{channel.icon || <Hash className="w-5 h-5"/>}</span>
                        <span>{channel.name}</span>
                        {channel.unreadCount && channel.unreadCount > 0 && (
                            <span className="absolute right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-800 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                        )}
                        {channel.isLocked && <LockClosed className="w-3 h-3 ml-auto text-gray-600"/>}
                    </button>
                ))}

                <div className="mt-auto p-4">
                    <div className="bg-brand-primary/10 rounded-lg p-3 border border-brand-primary/20">
                        <p className="text-xs text-brand-primary font-bold mb-1">Dica Mestre:</p>
                        <p className="text-xs text-gray-400">Participe no canal <span className="text-white">#Resultados</span> para ganhar destaque!</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
            <div className="absolute inset-0 bg-black/50 z-10 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-900 relative">
            
            {/* Channel Header */}
            <div className="h-16 border-b border-gray-700 flex items-center justify-between px-4 bg-gray-800/30 backdrop-blur-sm shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <button className="md:hidden text-gray-300" onClick={() => setIsSidebarOpen(true)}>☰</button>
                    <div className="flex items-center gap-2 text-xl font-bold text-white">
                        <span className="text-gray-500 text-2xl">{activeChannel?.icon || '#'}</span>
                        {activeChannel?.name || 'Carregando...'}
                    </div>
                    <span className="hidden md:inline-block h-4 w-px bg-gray-600 mx-2"></span>
                    <span className="hidden md:inline-block text-sm text-gray-400 truncate max-w-xs">
                        {activeChannel?.description}
                    </span>
                </div>
                <div className="flex gap-3 text-gray-400">
                    <Search className="w-5 h-5 cursor-pointer hover:text-white"/>
                    <Users className="w-5 h-5 cursor-pointer hover:text-white"/>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-chat-pattern">
                {loading ? (
                    <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>
                ) : (
                    Object.entries(groupedMessages).map(([date, msgs]: [string, ChatMessage[]]) => (
                        <div key={date}>
                            <div className="flex items-center justify-center mb-6">
                                <span className="bg-gray-800 text-gray-400 text-xs font-bold px-3 py-1 rounded-full border border-gray-700">
                                    {date}
                                </span>
                            </div>
                            <div className="space-y-4">
                                {msgs.map((msg) => {
                                    const isMe = msg.user.uid === user?.uid;
                                    const isAdmin = msg.user.role === 'admin' || msg.user.role === 'support';
                                    
                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}
                                        >
                                            {/* Avatar */}
                                            <div className="flex-shrink-0">
                                                <img 
                                                    src={msg.user.avatar} 
                                                    alt={msg.user.name} 
                                                    className={`w-10 h-10 rounded-full border-2 ${isAdmin ? 'border-brand-primary' : 'border-gray-700'}`} 
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className={`flex flex-col max-w-[80%] md:max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`font-bold text-sm ${isAdmin ? 'text-brand-primary' : 'text-white'}`}>
                                                        {msg.user.name}
                                                    </span>
                                                    {isAdmin && (
                                                        <span className="bg-brand-primary text-black text-[10px] font-bold px-1.5 rounded flex items-center gap-1">
                                                            <ShieldCheck className="w-3 h-3"/> STAFF
                                                        </span>
                                                    )}
                                                    {msg.user.level && !isAdmin && (
                                                        <span className={`text-[10px] font-bold px-1.5 rounded border ${
                                                            msg.user.level === 'Ouro' ? 'text-yellow-400 border-yellow-400' : 
                                                            msg.user.level === 'Prata' ? 'text-gray-300 border-gray-300' : 
                                                            'text-orange-400 border-orange-400'
                                                        }`}>
                                                            {msg.user.level}
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-gray-500">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                                                    isMe 
                                                        ? 'bg-brand-primary text-gray-900 rounded-tr-none' 
                                                        : 'bg-purple-600 text-white rounded-tl-none'
                                                }`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
                <div className="flex items-center gap-3 bg-gray-700/50 p-2 rounded-xl border border-gray-600 focus-within:border-brand-primary transition-colors">
                    <button type="button" className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-600 transition-colors">
                        <div className="w-5 h-5 border-2 border-current rounded-full flex items-center justify-center text-xs font-bold">+</div>
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Conversar em #${activeChannel?.name || 'chat'}...`}
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400"
                        disabled={activeChannel?.isLocked}
                    />
                    <Button 
                        type="submit" 
                        className={`!p-2 !rounded-lg transition-all ${newMessage.trim() ? 'opacity-100' : 'opacity-50'}`}
                        disabled={!newMessage.trim() || activeChannel?.isLocked}
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
                {activeChannel?.isLocked && (
                    <p className="text-xs text-red-400 mt-2 text-center">🔒 Apenas administradores podem enviar mensagens neste canal.</p>
                )}
            </form>
        </div>

        <style>{`
            .bg-chat-pattern {
                background-color: #111827;
                background-image: radial-gradient(#1f2937 1px, transparent 1px);
                background-size: 20px 20px;
            }
        `}</style>
    </div>
  );
};

export default ChatPage;
