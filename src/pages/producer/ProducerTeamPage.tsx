import React, { useState, useEffect } from 'react';
import { Users, Plus, Filter, Search, Shield, MoreVertical, Edit, Trash2, Mail, Whatsapp } from '../../components/Icons';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAuth } from '../../hooks/useAuth';
import { TeamUser } from '../../types';
import { mockTeamUsers, loadJSON } from '../../services/mockFirebase';
import { ProducerTeamMemberModal } from './modals/ProducerTeamMemberModal';

export const ProducerTeamPage: React.FC = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState<TeamUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = () => {
        setIsLoading(true);
        // Simulate fetching only members for this producer
        // For debugging/demo purposes, we might filter by producerId if we had it, 
        // or just show a subset of mockTeamUsers that are "yours"
        const allUsers = loadJSON('mockTeamUsers', mockTeamUsers) as TeamUser[];

        // Filter logic: In a real app, backend filters. Here we mock filtering by producerId
        // If producerId is not set on mocks yet, we might see nothing unless we mock some with it.
        // For now, let's assume 'mock-producer-uid' matches the current user or show all for demo if current user is admin-like.
        const myTeam = allUsers.filter(u => u.producerId === user?.uid || !u.producerId /* fallback for demo */);

        setMembers(myTeam);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const handleEdit = (member: TeamUser) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMember(null);
    };

    const handleSaved = () => {
        loadData();
    };

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                        <Users className="text-brand-primary w-8 h-8" /> Minha Equipe
                    </h1>
                    <p className="text-gray-400 mt-1">Gerencie o acesso de sócios e colaboradores aos seus produtos.</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="!bg-brand-primary text-black font-bold px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all"
                >
                    <Plus className="w-5 h-5 mr-2" /> Novo Membro
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <Input
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nome ou email..."
                        className="pl-10 !bg-gray-800 border-gray-700"
                    />
                </div>
                <Button variant="secondary" className="!bg-gray-800 border-gray-700 text-gray-400">
                    <Filter className="w-4 h-4 mr-2" /> Filtros
                </Button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMembers.map(member => (
                        <div key={member.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-brand-primary/50 transition-colors group relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 flex items-center justify-center text-xl font-bold text-gray-300">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-base">{member.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${member.role === 'support' ? 'bg-blue-900/40 text-blue-400 border-blue-900' :
                                                member.role === 'finance' ? 'bg-green-900/40 text-green-400 border-green-900' :
                                                    'bg-purple-900/40 text-purple-400 border-purple-900'
                                                }`}>
                                                {member.role === 'sales' ? 'Vendas' : member.role === 'support' ? 'Suporte' : 'Financeiro'}
                                            </span>
                                            <span className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} title={member.status} />
                                        </div>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-gray-900 rounded-lg border border-gray-700 shadow-xl">
                                    <button onClick={() => handleEdit(member)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><Edit className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-sm text-gray-400 flex items-center gap-2 truncate">
                                    <Mail className="w-4 h-4 opacity-50" /> {member.email}
                                </p>
                                <p className="text-sm text-gray-400 flex items-center gap-2 truncate">
                                    <Whatsapp className="w-4 h-4 opacity-50" /> {member.phone || 'N/A'}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-gray-700/50 flex gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                                <span>Acessos:</span>
                                {member.permissions.chatSupport && <span className="text-blue-400" title="Chat">CHAT</span>}
                                {member.permissions.viewFinance && <span className="text-green-400" title="Financeiro">FIN</span>}
                                {member.permissions.approveLinks && <span className="text-purple-400" title="Aprovações">APR</span>}
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {filteredMembers.length === 0 && !isLoading && (
                        <div className="col-span-full py-20 text-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
                            <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-bold">Nenhum membro encontrado</p>
                            <p className="text-sm">Convide alguém para começar a delegar tarefas.</p>
                            <Button variant="secondary" onClick={() => setIsModalOpen(true)} className="mt-4">
                                Convidar Agora
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <ProducerTeamMemberModal
                    producerId={user?.uid || 'temp-pid'}
                    initialData={selectedMember}
                    onClose={handleCloseModal}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
};
