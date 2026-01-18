
import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { X as XIcon, Whatsapp, Mail, CheckCircle, ShieldCheck, Monitor, Briefcase, AlertTriangle } from '../../../components/Icons';
import { TeamUser, ProducerWallet, ToolCost } from '../../../types';
import { toast } from 'react-hot-toast';
import { createTeamUser, updateTeamUser, sendPlatformInvite, getProducerWallet, debitWallet, getToolCosts } from '../../../services/mockFirebase';

interface ProducerTeamMemberModalProps {
    producerId: string;
    initialData?: TeamUser | null;
    onClose: () => void;
    onSaved: () => void;
}

const defaultMemberCost = 100;

export const ProducerTeamMemberModal: React.FC<ProducerTeamMemberModalProps> = ({ producerId, initialData, onClose, onSaved }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        cpf: initialData?.cpf || '',
        phone: initialData?.phone || '',
        role: initialData?.role || 'support',
        status: initialData?.status || 'active',
        // Default permissions for producer team
        permissions: initialData?.permissions || {
            approveLinks: false,
            chatSupport: true,
            viewFinance: false,
            sendNotifications: false,
            blockStudents: false,
            manageTeam: false,
            viewSensitiveData: false,
            recoverAccess: false
        } as any,
        // Sales Specific
        isSalesManager: initialData?.isSalesManager || false,
        commissionRate: initialData?.commissionRate || 0,
        commissionOverrideRate: initialData?.commissionOverrideRate || 0,
        managerId: initialData?.managerId || '',
        // HR Specific
        admissionDate: initialData?.admissionDate || '',
        salary: initialData?.salary || 0,
        dailyHours: initialData?.dailyHours || 8,
        workDays: initialData?.workDays || 5
    });
    const [loading, setLoading] = useState(false);
    const [customPermissions, setCustomPermissions] = useState(false);
    const [wallet, setWallet] = useState<ProducerWallet | null>(null);
    const [cost, setCost] = useState(defaultMemberCost);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [w, tools] = await Promise.all([getProducerWallet(), getToolCosts()]);
        setWallet(w);
        const fetchedCost = tools.find(t => t.toolId === 'team_member_seat')?.costPerTask || defaultMemberCost;
        setCost(fetchedCost);
    };

    // Filter relevant permissions based on role selection
    const permissionLabels: Record<string, string> = {
        chatSupport: 'Atender no Chat (Suporte)',
        viewFinance: 'Visualizar Financeiro',
        manageTeam: 'Gerenciar Equipe (Admin)',
        // blockStudents: 'Bloquear Alunos' -> EXCLUSIVE TO PRODUCER
        sendNotifications: 'Enviar Notificações',
        approveLinks: 'Aprovar Links'
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) return toast.error("Nome e Email são obrigatórios.");
        if (!formData.admissionDate || !formData.salary || !formData.dailyHours || !formData.workDays) return toast.error("Dados de RH Completos são obrigatórios (Admissão, Salário, Horários).");

        setLoading(true);
        try {
            if (initialData) {
                // Editing existing member - No Cost
                await updateTeamUser(initialData.id, formData);
                toast.success("Membro atualizado!");
            } else {
                // Adding new member
                if (!wallet) return toast.error("Erro ao carregar carteira.");

                if (wallet.balance < cost) {
                    toast.error(`Saldo insuficiente! Custo: ${cost} créditos.`);
                    setLoading(false);
                    return;
                }

                const confirmPurchase = confirm(`Adicionar um membro custa ${cost} créditos. Seu saldo atual é ${wallet.balance}. Deseja continuar?`);
                if (!confirmPurchase) {
                    setLoading(false);
                    return;
                }

                const paid = await debitWallet(cost, `Taxa de Setup: Membro de Equipe (${formData.name})`, 'service_usage');
                if (!paid) {
                    toast.error("Falha no pagamento. Tente novamente.");
                    setLoading(false);
                    return;
                }

                // Generate a unique invite link
                const inviteLink = `https://mestre15x.com/team-invite?token=${Math.random().toString(36).substring(7)}`;
                const productName = "Sua Equipe";

                // Create User Linked to Producer
                const newUser = {
                    ...formData,
                    producerId, // Link to this producer
                    id: `team-${Date.now()}`,
                    lastLogin: 0,
                    unreadCount: 0
                };

                await createTeamUser(newUser as any);

                // 1. Send WhatsApp Invite (Via Platform)
                if (formData.phone) {
                    await sendPlatformInvite('whatsapp', formData.phone, formData.name, productName, inviteLink);
                    toast.success("Convite enviado via WhatsApp (Canal da Plataforma)!", { icon: '📲' });
                }

                // 2. Send Email Invite (Via Platform)
                await sendPlatformInvite('email', formData.email, formData.name, productName, inviteLink);
                toast.success("Convite enviado via Email (Canal da Plataforma)!", { icon: '📧' });
            }

            onSaved();
            onClose();
        } catch (e) {
            console.error(e);
            toast.error("Erro ao salvar membro.");
        } finally {
            setLoading(false);
        }
    };

    // Auto-set permissions based on role
    const handleRoleChange = (role: string) => {
        let newPermissions = { ...formData.permissions };
        if (role === 'support') {
            newPermissions = { ...newPermissions, chatSupport: true, viewFinance: false, manageTeam: false };
        } else if (role === 'finance') {
            newPermissions = { ...newPermissions, chatSupport: false, viewFinance: true, manageTeam: false };
        } else if (role === 'sales') {
            newPermissions = { ...newPermissions, chatSupport: true, viewFinance: true, manageTeam: false }; // Sales often needs both
        }
        setFormData({ ...formData, role: role as any, permissions: newPermissions });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-800 w-full max-w-lg rounded-xl p-6 border border-gray-700 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        <ShieldCheck className="text-brand-primary w-6 h-6" />
                        {initialData ? 'Editar Membro' : 'Novo Membro da Equipe'}
                    </h3>
                    <div className="flex items-center gap-2">
                        {!initialData && wallet && (
                            <span className="text-xs bg-gray-900 border border-gray-700 px-2 py-1 rounded text-gray-400">
                                Saldo: <span className={wallet.balance >= cost ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{wallet.balance}</span>
                            </span>
                        )}
                        <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg transition-colors"><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-full">
                            <Input label="Nome Completo *" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: João da Silva" />
                        </div>
                        <div className="col-span-full">
                            <Input label="E-mail Corporativo *" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="joao@equipe.com" />
                        </div>
                        <Input label="CPF" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} placeholder="000.000.000-00" />
                        <Input label="WhatsApp (com DDD)" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="5511999999999" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                        <div className="col-span-2 text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Informações Contratuais (RH)
                        </div>
                        <Input
                            label="Data de Admissão *"
                            type="date"
                            value={formData.admissionDate}
                            onChange={e => setFormData({ ...formData, admissionDate: e.target.value })}
                        />
                        <Input
                            label="Salário Mensal (R$) *"
                            type="number"
                            value={formData.salary}
                            onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })}
                            placeholder="0.00"
                        />
                        <Input
                            label="Horas por Dia *"
                            type="number"
                            max={24}
                            value={formData.dailyHours || ''}
                            onChange={e => setFormData({ ...formData, dailyHours: Number(e.target.value) })}
                            placeholder="Ex: 8"
                        />
                        <Input
                            label="Dias por Semana *"
                            type="number"
                            max={7}
                            value={formData.workDays || ''}
                            onChange={e => setFormData({ ...formData, workDays: Number(e.target.value) })}
                            placeholder="Ex: 5"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Função</label>
                            <select
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-white text-sm focus:border-brand-primary outline-none transition-colors"
                                value={formData.role}
                                onChange={e => handleRoleChange(e.target.value)}
                            >
                                <option value="support">Suporte / Atendimento</option>
                                <option value="finance">Financeiro</option>
                                <option value="sales">Vendas / Comercial</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Status</label>
                            <select
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-white text-sm focus:border-brand-primary outline-none transition-colors"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                            >
                                <option value="active">Ativo</option>
                                <option value="blocked">Bloqueado</option>
                                <option value="inactive">Inativo</option>
                            </select>
                        </div>
                    </div>

                    {/* SALES CONFIGURATION */}
                    {
                        formData.role === 'sales' && (
                            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl space-y-4 animate-fade-in-up">
                                <h4 className="font-bold text-blue-400 text-sm flex items-center gap-2">
                                    <Monitor className="w-4 h-4" /> Configuração de Vendas
                                </h4>

                                <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                                    <div>
                                        <span className="text-sm font-bold text-white block">É Gerente de Equipe?</span>
                                        <span className="text-xs text-gray-400">Pode ganhar comissão sobre outros vendedores.</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.isSalesManager || false}
                                            onChange={e => setFormData({ ...formData, isSalesManager: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-gray-700/50 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Comissão Própria (%)"
                                        type="number"
                                        placeholder="Ex: 10"
                                        value={formData.commissionRate || ''}
                                        onChange={e => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                                    />
                                    {formData.isSalesManager ? (
                                        <Input
                                            label="Comissão da Equipe (%)"
                                            type="number"
                                            placeholder="Ex: 2"
                                            value={formData.commissionOverrideRate || ''}
                                            onChange={e => setFormData({ ...formData, commissionOverrideRate: Number(e.target.value) })}
                                        />
                                    ) : (
                                        <div>
                                            <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Gerente Responsável</label>
                                            <select
                                                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-brand-primary outline-none"
                                                value={formData.managerId || ''}
                                                onChange={e => setFormData({ ...formData, managerId: e.target.value })}
                                            >
                                                <option value="">-- Sem Gerente --</option>
                                                {/* In real app, map users filter by role='sales' & isManager=true */}
                                                <option value="manager-01">Ana (Gerente Teste)</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {(initialData?.id || formData.role === 'sales') && (
                                    <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex flex-col gap-1">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Link de Afiliado (Automático)</span>
                                        <code className="text-xs text-green-400 font-mono break-all">{`https://mestre15x.com/ref/${initialData?.id || 'novo-vendedor'}`}</code>
                                    </div>
                                )}
                            </div>
                        )
                    }

                    {/* ADVANCED PERMISSIONS */}
                    <div className="border-t border-gray-700 pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-gray-400 uppercase">Permissões do Cargo</span>
                            <button
                                type="button"
                                onClick={() => setCustomPermissions(!customPermissions)}
                                className="text-xs text-brand-primary hover:underline font-bold"
                            >
                                {customPermissions ? 'Usar Padrão do Cargo' : 'Configurar Manualmente (Avançado)'}
                            </button>
                        </div>

                        {customPermissions && (
                            <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
                                {Object.entries(permissionLabels).map(([key, label]) => (
                                    <label key={key} className="flex items-center gap-2 p-2 bg-gray-900/30 rounded-lg border border-gray-700/50 cursor-pointer hover:bg-gray-800 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-600 bg-gray-700 text-brand-primary focus:ring-brand-primary"
                                            checked={(formData.permissions as any)[key]}
                                            onChange={e => setFormData({
                                                ...formData,
                                                permissions: { ...formData.permissions, [key]: e.target.checked }
                                            })}
                                        />
                                        <span className="text-xs text-gray-300">{label}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {!customPermissions && (
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(formData.permissions)
                                    .filter(([_, value]) => value)
                                    .map(([key]) => (
                                        <span key={key} className="text-[10px] bg-gray-800 border border-gray-600 text-gray-300 px-2 py-1 rounded-full uppercase font-bold">
                                            {permissionLabels[key] || key}
                                        </span>
                                    ))
                                }
                            </div>
                        )}
                    </div>

                    {
                        !initialData && (
                            <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl flex flex-col gap-2 mt-4">
                                <p className="text-xs font-bold text-green-400 uppercase flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> Convites Automáticos
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-300">
                                    <span className="flex items-center gap-1"><Whatsapp className="w-3 h-3 text-green-500" /> WhatsApp</span>
                                    <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-blue-400" /> E-mail</span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                                    Um link de acesso seguro será enviado automaticamente para os canais informados. O membro definirá a senha no primeiro acesso.
                                </p>
                            </div>
                        )
                    }

                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
                        <Button variant="secondary" type="button" onClick={onClose} className="flex-1">Cancelar</Button>
                        <Button type="submit" isLoading={loading} className="flex-1 !bg-brand-primary text-black font-bold hover:brightness-110 flex flex-col items-center justify-center leading-tight">
                            <span>{initialData ? 'Atualizar Dados' : 'Salvar e Convidar'}</span>
                            {!initialData && <span className="text-[10px] font-normal opacity-80">(custo: {cost} créditos)</span>}
                        </Button>
                    </div>
                </form >
            </div >
        </div >
    );
};

