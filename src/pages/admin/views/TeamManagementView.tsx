
import React, { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { ShieldCheck, PlusCircle, Smartphone, Pencil, Star, Whatsapp, Users, LockClosed, Trash } from '@/components/Icons';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TeamUser } from '@/types';
import { getTeamUsers, updateTeamUser, createTeamUser } from '@/services/mockFirebase';
import { TeamMemberModal } from '../modals/AdminModals';
import toast from 'react-hot-toast';

const TeamManagementView: React.FC = () => {
    const [users, setUsers] = useState<TeamUser[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchTeam = async () => {
        setLoading(true);
        const data = await getTeamUsers();
        // Filter out Sales Agents if they are mixed, though getTeamUsers usually returns internal staff
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => { fetchTeam(); }, []);

    const handleEdit = (user: TeamUser) => { setEditingUser(user); setIsModalOpen(true); };
    const handleAdd = () => { setEditingUser(null); setIsModalOpen(true); };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja remover este membro da equipe? O acesso será revogado imediatamente.')) {
            // In a real app, delete or soft delete
            await updateTeamUser(id, { status: 'inactive' });
            fetchTeam();
            toast.success('Membro removido.');
        }
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'super_admin': return <span className="bg-red-500/20 text-red-400 text-[10px] uppercase px-2 py-1 rounded font-bold border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">Super Admin</span>;
            case 'support': return <span className="bg-blue-500/20 text-blue-400 text-[10px] uppercase px-2 py-1 rounded font-bold border border-blue-500/30">Suporte</span>;
            case 'finance': return <span className="bg-green-500/20 text-green-400 text-[10px] uppercase px-2 py-1 rounded font-bold border border-green-500/30">Financeiro</span>;
            default: return <span className="bg-gray-700 text-gray-400 text-[10px] uppercase px-2 py-1 rounded font-bold">Staff</span>;
        }
    };

    return (
        <div className="animate-fade-in space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
                        <Users className="w-8 h-8 text-brand-primary" /> Equipe Interna
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Gerencie acessos administrativos, suporte e financeiro.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleAdd} className="flex items-center gap-2 !bg-brand-primary text-black hover:!bg-yellow-400 font-bold shadow-lg shadow-brand-primary/20">
                        <PlusCircle className="w-5 h-5" /> Novo Membro
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><LoadingSpinner size="lg" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {users.map(user => (
                        <Card key={user.id} className={`p-6 border-l-4 transition-all group hover:scale-[1.01] ${user.status === 'active' ? 'border-l-green-500 bg-gray-800' : 'border-l-red-500 bg-gray-800/60 opacity-75'}`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold border-2 border-gray-600 text-xl shadow-inner">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight">{user.name}</h3>
                                        <p className="text-xs text-gray-400">{user.email}</p>
                                        {user.phone && <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><Smartphone className="w-3 h-3" /> {user.phone}</p>}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {getRoleBadge(user.role)}
                                </div>
                            </div>

                            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Acessos & Permissões</p>
                                    <span className={`text-[9px] font-bold uppercase flex items-center gap-1 ${user.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                                        {user.status === 'active' ? <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> : <LockClosed className="w-3 h-3" />}
                                        {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(user.permissions).filter(([_, v]) => v).length === 8 ? (
                                        <span className="text-xs text-yellow-400 font-bold flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 w-full justify-center"><Star className="w-3 h-3 fill-current" /> Super Admin (Acesso Total)</span>
                                    ) : (
                                        Object.entries(user.permissions).filter(([_, v]) => v).slice(0, 5).map(([k, _]) => (
                                            <span key={k} className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-[9px] border border-gray-600 font-medium"> {k.replace(/([A-Z])/g, ' $1').trim()} </span>
                                        ))
                                    )}
                                    {Object.entries(user.permissions).filter(([_, v]) => v).length > 5 && Object.entries(user.permissions).filter(([_, v]) => v).length < 8 && (<span className="text-[9px] text-gray-500 self-center pl-1">+{Object.entries(user.permissions).filter(([_, v]) => v).length - 5}</span>)}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                                <p className="text-[10px] text-gray-500">Último login: <span className="text-gray-300">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}</span></p>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(user)} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors" title="Editar Permissões"> <Pencil className="w-4 h-4" /> </button>
                                    <button onClick={() => handleDelete(user.id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20 transition-colors" title="Remover Acesso"> <Trash className="w-4 h-4" /> </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {users.length === 0 && (
                        <div className="col-span-full text-center py-12 border-2 border-dashed border-gray-700 rounded-2xl">
                            <Users className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500">Nenhum membro da equipe encontrado.</p>
                            <Button variant="ghost" onClick={handleAdd} className="mt-2 text-brand-primary">Adicionar Primeiro Membro</Button>
                        </div>
                    )}
                </div>
            )}
            {isModalOpen && (<TeamMemberModal initialData={editingUser} onClose={() => setIsModalOpen(false)} onSaved={fetchTeam} />)}
        </div>
    );
};

export default TeamManagementView;
