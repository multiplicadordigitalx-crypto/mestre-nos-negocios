import React, { useState, useEffect, useRef } from 'react';
import Button from '../../../components/Button';
import { Send, Users, Search, MessageSquare } from '../../../components/Icons';
import { User, ChatMessage } from '../../../types';
import { getAllStaff, listenToTeamChat, sendTeamMessage } from '../../../services/mockFirebase';

const AdvancedChatView: React.FC<{ adminUser: User }> = ({ adminUser }) => { 
    const [contacts, setContacts] = useState<any[]>([]); 
    const [activeChatId, setActiveChatId] = useState<string | null>(null); 
    const [messages, setMessages] = useState<ChatMessage[]>([]); 
    const [inputText, setInputText] = useState(''); 
    const messagesEndRef = useRef<HTMLDivElement>(null); 
    const [searchTerm, setSearchTerm] = useState(''); 
    
    useEffect(() => { 
        // Filtra a si mesmo da lista de contatos
        getAllStaff().then(staff => setContacts(staff.filter(s => s.id !== adminUser.uid))); 
    }, [adminUser.uid]); 
    
    useEffect(() => { 
        if (!activeChatId) return; 
        const unsub = listenToTeamChat(adminUser.uid, activeChatId, (msgs: ChatMessage[]) => { setMessages(msgs); }); 
        return () => unsub(); 
    }, [activeChatId, adminUser.uid]); 
    
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]); 
    
    const handleSendMessage = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        if (!inputText.trim() || !activeChatId) return; 
        await sendTeamMessage(inputText, adminUser, activeChatId); 
        setInputText(''); 
    }; 
    
    const filteredContacts = contacts.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())); 
    const activeContact = contacts.find(c => c.id === activeChatId); 
    
    return ( 
        <div className="h-[600px] bg-gray-900 rounded-xl flex border border-gray-700 overflow-hidden shadow-2xl"> 
            <div className="w-80 border-r border-gray-700 flex flex-col bg-gray-800"> 
                <div className="p-4 border-b border-gray-700"> 
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2"> 
                        <Users className="w-5 h-5 text-brand-primary"/> Equipe Interna 
                    </h3> 
                    <div className="relative"> 
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500"/> 
                        <input type="text" placeholder="Buscar membro..." className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-brand-primary outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /> 
                    </div> 
                </div> 
                <div className="flex-1 overflow-y-auto custom-scrollbar"> 
                    {filteredContacts.map(contact => ( 
                        <div key={contact.id} onClick={() => setActiveChatId(contact.id)} className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-700 transition-colors border-b border-gray-700/50 ${activeChatId === contact.id ? 'bg-gray-700 border-l-4 border-l-brand-primary' : ''}`} > 
                            <div className="relative"> 
                                <img src={contact.photoURL || `https://i.pravatar.cc/150?u=${contact.email}`} className="w-10 h-10 rounded-full border border-gray-700 object-cover" alt="Avatar"/> 
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${contact.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div> 
                            </div> 
                            <div className="flex-1 min-w-0"> 
                                <p className="text-sm font-bold text-white truncate">{contact.name}</p> 
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">{contact.role}</p> 
                            </div> 
                        </div> 
                    ))} 
                </div> 
            </div> 
            <div className="flex-1 flex flex-col bg-gray-900"> 
                {activeChatId ? ( 
                    <> 
                        <div className="h-16 border-b border-gray-700 flex items-center justify-between px-6 bg-gray-800"> 
                            <div className="flex items-center gap-3"> 
                                <div className="relative"> 
                                    <img src={activeContact?.photoURL || `https://i.pravatar.cc/150?u=${activeContact?.email}`} className="w-10 h-10 rounded-full object-cover" alt="Avatar"/> 
                                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-gray-800 ${activeContact?.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div> 
                                </div> 
                                <div> 
                                    <h4 className="font-bold text-white text-sm">{activeContact?.name}</h4> 
                                    <span className="text-[10px] text-gray-500 uppercase font-bold">{activeContact?.role}</span> 
                                </div> 
                            </div> 
                        </div> 
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-900"> 
                            {messages.length === 0 && ( 
                                <div className="text-center text-gray-500 mt-10"> 
                                    <p>Inicie a conversa com {activeContact?.name?.split(' ')[0]}.</p> 
                                </div> 
                            )} 
                            {messages.map(msg => { 
                                const isMe = msg.user.uid === adminUser.uid; 
                                return ( 
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}> 
                                        <div className={`max-w-[70%] rounded-xl p-3 text-sm ${isMe ? 'bg-brand-primary text-gray-900 rounded-tr-none' : 'bg-purple-600 text-white rounded-tl-none'}`}> 
                                            <p>{msg.text}</p> 
                                            <p className={`text-[9px] text-right mt-1 ${isMe ? 'text-black/60' : 'text-gray-300'}`}> 
                                                {new Date(msg.createdAt).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})} 
                                            </p> 
                                        </div> 
                                    </div> 
                                ) 
                            })} 
                            <div ref={messagesEndRef} /> 
                        </div> 
                        <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700"> 
                            <div className="flex gap-3"> 
                                <input className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-brand-primary outline-none" placeholder="Digite sua mensagem..." value={inputText} onChange={e => setInputText(e.target.value)} /> 
                                <Button type="submit" className="!rounded-lg !px-4" disabled={!inputText.trim()}> 
                                    <Send className="w-5 h-5"/> 
                                </Button> 
                            </div> 
                        </form> 
                    </> 
                ) : ( 
                    <div className="flex-1 flex items-center justify-center flex-col text-gray-500"> 
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20"/> 
                        <p>Selecione um membro da equipe para conversar.</p> 
                    </div> 
                )} 
            </div> 
        </div> 
    ); 
};

export default AdvancedChatView;