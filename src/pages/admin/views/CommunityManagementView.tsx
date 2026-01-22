import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Users, MessageSquare, Trash2, Edit2,
    Shield, UserPlus, X, Check, BarChart3, Activity,
    Lock, Unlock, Globe, Hash
} from '../../../components/Icons';
import {
    getChannels, saveChannel, deleteChannel,
    getAllUsersFlat, addModeratorToChannel, removeModeratorFromChannel
} from '../../../services/mockFirebase';
import { ChatChannel, Student } from '../../../types/legacy';
import Button from '../../../components/Button';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const CommunityManagementView: React.FC = () => {
    const [channels, setChannels] = useState<ChatChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingChannel, setEditingChannel] = useState<ChatChannel | null>(null);
    const [newChannel, setNewChannel] = useState<Partial<ChatChannel>>({
        name: '',
        description: '',
        isLocked: false,
        icon: 'Hash'
    });

    // Moderator Management State
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [selectedChannelForMod, setSelectedChannelForMod] = useState<ChatChannel | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [channelsData, usersData] = await Promise.all([
                getChannels(),
                getAllUsersFlat()
            ]);
            setChannels(channelsData);
            setAllUsers(usersData);
        } catch (error) {
            toast.error("Erro ao carregar dados da comunidade.");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleCreateChannel = async () => {
        if (!newChannel.name) {
            toast.error("Nome do canal é obrigatório.");
            return;
        }

        try {
            const channelToSave = {
                id: editingChannel?.id || `channel-${Date.now()}`,
                name: newChannel.name,
                description: newChannel.description || '',
                isLocked: newChannel.isLocked || false,
                icon: newChannel.icon || 'Hash',
                unreadCount: editingChannel?.unreadCount || 0,
                moderators: editingChannel?.moderators || []
            };

            await saveChannel(channelToSave);
            toast.success(editingChannel ? "Canal atualizado!" : "Canal criado!");
            setIsCreateModalOpen(false);
            setEditingChannel(null);
            setNewChannel({ name: '', description: '', isLocked: false, icon: 'Hash' });
            loadData(true);
        } catch (error) {
            toast.error("Erro ao salvar canal.");
        }
    };

    const handleDeleteChannel = async (id: string) => {
        console.log("Attempting to delete channel:", id);
        if (window.confirm("Tem certeza que deseja excluir este canal? Todas as mensagens serão perdidas.")) {
            // Optimistic update: remove from local state immediately
            const previousChannels = [...channels];
            // Use String() comparison for safety
            setChannels(prev => prev.filter(c => String(c.id) !== String(id)));

            try {
                await deleteChannel(id);
                toast.success("Canal excluído.");
                console.log("Channel deleted successfully:", id);
                // Update in background to ensure local state is synced correctly
                loadData(true);
            } catch (error) {
                console.error("Failed to delete channel:", error);
                // Rollback if failed
                setChannels(previousChannels);
                toast.error("Erro ao excluir canal.");
            }
        }
    };

    const toggleModerator = async (channelId: string, userId: string, isMod: boolean) => {
        try {
            if (isMod) {
                await removeModeratorFromChannel(channelId, userId);
                toast.success("Moderador removido.");
            } else {
                await addModeratorToChannel(channelId, userId);
                toast.success("Moderador adicionado!");
            }
            loadData(true);
        } catch (error) {
            toast.error("Erro ao atualizar moderador.");
        }
    };

    const filteredChannels = channels.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = allUsers.filter(u =>
        (u.displayName || u.name || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(userSearchTerm.toLowerCase())
    ).slice(0, 5);

    if (loading) return <div className="flex justify-center p-20"><LoadingSpinner /></div>;

    return (
        <div className="space-y-8">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm">Canais Ativos</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{channels.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <MessageSquare className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm">Engajamento</p>
                            <h3 className="text-3xl font-bold text-emerald-400 mt-1">Alta</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Activity className="w-6 h-6 text-emerald-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm">Total de Usuários</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{allUsers.length}</h3>
                        </div>
                        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <Users className="w-6 h-6 text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Channels List */}
                <div className="xl:col-span-2 bg-gray-900/40 rounded-2xl border border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-700 bg-gray-800/30 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-white">Canais da Comunidade</h2>
                            <p className="text-sm text-gray-400">Gerencie os espaços de conversa dos alunos.</p>
                        </div>
                        <Button
                            onClick={() => {
                                setEditingChannel(null);
                                setNewChannel({ name: '', description: '', isLocked: false, icon: 'Hash' });
                                setIsCreateModalOpen(true);
                            }}
                            className="!bg-indigo-600 hover:!bg-indigo-500 !flex !items-center !gap-2"
                        >
                            <Plus className="w-4 h-4" /> Novo Canal
                        </Button>
                    </div>

                    <div className="p-4 bg-gray-800/20 border-b border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Buscar canais..."
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="divide-y divide-gray-700">
                        {filteredChannels.length > 0 ? (
                            filteredChannels.map(channel => (
                                <div key={channel.id} className="p-4 hover:bg-gray-800/40 transition-colors group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center border border-gray-600">
                                                <Hash className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-white">{channel.name}</h3>
                                                    {channel.isLocked && <Lock className="w-3 h-3 text-red-400" />}
                                                </div>
                                                <p className="text-xs text-gray-400 line-clamp-1">{channel.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedChannelForMod(channel);
                                                }}
                                                className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all"
                                                title="Gerenciar Moderadores"
                                            >
                                                <Shield className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingChannel(channel);
                                                    setNewChannel(channel);
                                                    setIsCreateModalOpen(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteChannel(channel.id);
                                                }}
                                                className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center text-gray-500 italic">Nenhum canal encontrado.</div>
                        )}
                    </div>
                </div>

                {/* Moderators Quick Panel */}
                <div className="bg-gray-900/40 rounded-2xl border border-gray-700 flex flex-col h-full">
                    <div className="p-6 border-b border-gray-700 bg-gray-800/30">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-400" /> Moderadores
                        </h2>
                        <p className="text-sm text-gray-400">Atribua permissões a alunos ou suporte.</p>
                    </div>

                    {selectedChannelForMod ? (
                        <div className="p-6 space-y-6 flex-1">
                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl relative">
                                <button
                                    onClick={() => setSelectedChannelForMod(null)}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Editando Canal</p>
                                <p className="text-white font-bold">{selectedChannelForMod.name}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Buscar usuário..."
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    {userSearchTerm && filteredUsers.map(user => {
                                        const isMod = selectedChannelForMod.moderators?.includes(user.uid || user.id);
                                        return (
                                            <div key={user.uid || user.id} className="flex items-center justify-between p-3 bg-gray-800/40 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                                                        {(user.displayName || user.name || '?').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white">{user.displayName || user.name}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase">{user.role}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleModerator(selectedChannelForMod.id, user.uid || user.id, !!isMod)}
                                                    className={`p-1.5 rounded-lg transition-all ${isMod ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400'}`}
                                                >
                                                    {isMod ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-700">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Moderadores Atuais</h4>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                    {selectedChannelForMod.moderators && selectedChannelForMod.moderators.length > 0 ? (
                                        selectedChannelForMod.moderators.map(modId => {
                                            const u = allUsers.find(x => (x.uid || x.id) === modId);
                                            return (
                                                <div key={modId} className="flex items-center justify-between p-2 bg-gray-800/20 rounded-lg">
                                                    <span className="text-xs text-white">{u?.displayName || u?.name || modId}</span>
                                                    <button
                                                        onClick={() => toggleModerator(selectedChannelForMod.id, modId, true)}
                                                        className="text-gray-500 hover:text-red-400"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-[10px] text-gray-500 italic">Nenhum moderador atribuído.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-10 flex-1 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4 border border-gray-700">
                                <Shield className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-gray-400 text-sm">Selecione um canal para<br />gerenciar moderadores.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                                <h3 className="text-lg font-bold text-white">
                                    {editingChannel ? 'Editar Canal' : 'Criar Novo Canal'}
                                </h3>
                                <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Nome do Canal</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                                        placeholder="ex: # suporte-premium"
                                        value={newChannel.name}
                                        onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Descrição</label>
                                    <textarea
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 h-24 resize-none"
                                        placeholder="Sobre o que é este canal?"
                                        value={newChannel.description}
                                        onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                                    <div>
                                        <p className="text-sm font-bold text-white">Canal Privado</p>
                                        <p className="text-[10px] text-gray-500">Apenas moderadores e alunos autorizados.</p>
                                    </div>
                                    <button
                                        onClick={() => setNewChannel({ ...newChannel, isLocked: !newChannel.isLocked })}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${newChannel.isLocked ? 'bg-indigo-600' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${newChannel.isLocked ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-800/50 border-t border-gray-700 flex gap-3">
                                <Button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 !bg-gray-700 hover:!bg-gray-600 !text-white"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleCreateChannel}
                                    className="flex-2 !bg-indigo-600 hover:!bg-indigo-500"
                                >
                                    {editingChannel ? 'Salvar Alterações' : 'Criar Canal'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CommunityManagementView;
