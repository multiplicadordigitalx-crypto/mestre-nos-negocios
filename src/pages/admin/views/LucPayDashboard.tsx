
import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import {
    CreditCard, Settings, Terminal, ShieldCheck,
    CheckCircle, AlertTriangle, RefreshCw, Key,
    Link as LinkIcon, DollarSign, Activity, FileText,
    Server, Globe, LockClosed
} from '../../../components/Icons';
import { LucPayService, LucPayGatewayProfile, LucPayAccount, LucPayTransaction } from '../../../services/LucPayService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const LucPayDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'config' | 'accounts' | 'transactions' | 'compliance'>('config');
    const [profiles, setProfiles] = useState<LucPayGatewayProfile[]>(LucPayService.getConfigsSync());
    const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || '');
    const [accounts, setAccounts] = useState<LucPayAccount[]>([]);
    const [transactions, setTransactions] = useState<LucPayTransaction[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Derived state for the currently selected profile config
    const selectedProfile = profiles.find(p => p.id === selectedProfileId);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsInitialLoading(true);
        try {
            const [loadedProfiles, accs, txs] = await Promise.all([
                LucPayService.getConfigs(),
                LucPayService.getConnectedAccounts(),
                LucPayService.getTransactions()
            ]);
            setProfiles(loadedProfiles);
            if (!selectedProfileId && loadedProfiles.length > 0) {
                setSelectedProfileId(loadedProfiles[0].id);
            }
            setAccounts(accs);
            setTransactions(txs);
        } catch (e) {
            console.error("LucPay Load Error:", e);
        } finally {
            setIsInitialLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!selectedProfile) return;
        setSaving(true);

        // Safety Fallback: Force clear saving state after 5 seconds if logic hangs
        const safetyTimeout = setTimeout(() => {
            if (saving) {
                setSaving(false);
                toast.error("Tempo limite de salvamento atingido. Tente novamente.");
            }
        }, 5000);

        try {
            await LucPayService.saveConfig(selectedProfile);
            // Reload to ensure sync
            const updated = await LucPayService.getConfigs();
            setProfiles(updated);
            toast.success("Perfil de Gateway salvo com sucesso!");
        } catch (error: any) {
            console.error("LucPay Save Error:", error);
            const errorMsg = error.message || "Erro desconhecido ao salvar.";
            toast.error(`Falha ao salvar: ${errorMsg}`);
        } finally {
            clearTimeout(safetyTimeout);
            setSaving(false);
        }
    };

    const handleCreateProfile = async () => {
        const newProfile: LucPayGatewayProfile = {
            id: `gw_${Date.now()}`,
            label: 'Nova Conta',
            isActive: false,
            provider: 'stripe',
            mode: 'test',
            publishableKey: '',
            secretKey: '',
            webhookSecret: '',
            connectClientId: '',
            createdAt: Date.now()
        };
        await LucPayService.saveConfig(newProfile);
        const updated = await LucPayService.getConfigs();
        setProfiles(updated);
        setSelectedProfileId(newProfile.id);
        toast.success("Novo perfil criado!");
    };

    const handleDeleteProfile = async () => {
        if (!selectedProfile) return;
        if (!window.confirm("Tem certeza que deseja remover este perfil? Chaves serão perdidas.")) return;

        await LucPayService.deleteConfig(selectedProfile.id);
        const updated = await LucPayService.getConfigs();
        setProfiles(updated);
        if (updated.length > 0) setSelectedProfileId(updated[0].id);
        else setSelectedProfileId('');
        toast.success("Perfil removido.");
    };

    const handleToggleActive = async (profileId: string) => {
        setIsInitialLoading(true);
        try {
            await LucPayService.setActiveConfig(profileId);
            const updated = await LucPayService.getConfigs();
            setProfiles(updated);
            toast.success("Perfil Ativo alterado com sucesso!");
        } finally {
            setIsInitialLoading(false);
        }
    };

    const handleUpdateSelected = (field: keyof LucPayGatewayProfile, value: any) => {
        if (!selectedProfile) return;
        const updated = { ...selectedProfile, [field]: value };
        // Optimistically update local state
        setProfiles(prev => prev.map(p => p.id === selectedProfile.id ? updated : p));
    };

    const handleTestConnection = async () => {
        if (!selectedProfile) return;
        setConnectionStatus('idle');
        const result = await LucPayService.testConnection(selectedProfile);
        if (result.success) {
            setConnectionStatus('success');
            toast.success(result.message);
        } else {
            setConnectionStatus('error');
            toast.error(result.message);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const colors: Record<string, string> = {
            enabled: 'bg-green-500/20 text-green-400 border-green-500/30',
            active: 'bg-green-500/20 text-green-400 border-green-500/30',
            restricted: 'bg-red-500/20 text-red-400 border-red-500/30',
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            succeeded: 'bg-green-500/20 text-green-400',
            failed: 'bg-red-500/20 text-red-400',
            refunded: 'bg-purple-500/20 text-purple-400',
        };
        const defaultColor = 'bg-gray-700 text-gray-300';
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${colors[status] || defaultColor}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="bg-indigo-600 p-2 rounded-lg"><CreditCard className="w-6 h-6 text-white" /></span>
                        LucPay Command Center
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Gestão Centralizada de Pagamentos & Split (Stripe Connect)</p>
                </div>
                <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'config' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>Configuração (Multi-Contas)</button>
                    <button onClick={() => setActiveTab('accounts')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'accounts' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>Contas Connect</button>
                    <button onClick={() => setActiveTab('transactions')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'transactions' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>Transações</button>
                    <button onClick={() => setActiveTab('compliance')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'compliance' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>Compliance</button>
                </div>
            </div>

            {/* TAB: CONFIGURATION */}
            {activeTab === 'config' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* LEFT SIDEBAR: PROFILE LIST */}
                    <div className="md:col-span-1 space-y-4">
                        <Card className="p-4 bg-gray-900 border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-white text-sm">Gateways Conectados</h3>
                                <button onClick={handleCreateProfile} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition-colors">+ Novo</button>
                            </div>
                            <div className="space-y-2">
                                {profiles.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => setSelectedProfileId(p.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedProfileId === p.id ? 'bg-indigo-900/30 border-indigo-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-bold text-sm text-gray-200 block">{p.label}</span>
                                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{p.provider === 'pix_external' ? 'PIX PSP' : 'STRIPE CONNECT'}</span>
                                            </div>
                                            {p.isActive && <span className="bg-green-500 text-black text-[10px] px-1.5 rounded font-bold">ATIVO</span>}
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[10px] text-gray-500 font-mono">{p.mode.toUpperCase()}</span>
                                            {!p.isActive && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleActive(p.id); }}
                                                    className="text-[10px] text-gray-400 hover:text-white underline"
                                                >
                                                    Tornar Ativo
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {profiles.length === 0 && <p className="text-gray-500 text-xs text-center py-4">Nenhum perfil encontrado.</p>}
                            </div>
                        </Card>

                        <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl">
                            <h4 className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-2"><Activity className="w-4 h-4" /> Roteamento Inteligente</h4>
                            <p className="text-[10px] text-gray-400">
                                Novas vendas usam a conta <strong>ATIVA</strong>.
                                Reembolsos usam automaticamente a conta original da transação (via <code>configId</code>), mesmo se estiver inativa.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT SIDE: EDITOR */}
                    <div className="md:col-span-2">
                        {selectedProfile ? (
                            <Card className="p-4 border-l-4 border-l-indigo-500">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><Settings className="w-5 h-5" /> Editando: {selectedProfile.label}</h3>
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleDeleteProfile} className="text-red-400 hover:text-red-300 text-xs underline mr-4">Remover Gateway</button>
                                        <div className="flex items-center gap-2 bg-gray-900 rounded-full px-3 py-1 border border-gray-700">
                                            <span className={`w-2 h-2 rounded-full ${selectedProfile.mode === 'live' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500'}`}></span>
                                            <span className="text-xs font-mono font-bold text-gray-300 uppercase">{selectedProfile.mode} MODE</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Nome do Perfil (Interno)</label>
                                            <input
                                                type="text"
                                                value={selectedProfile.label}
                                                onChange={e => handleUpdateSelected('label', e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Tipo de Gateway</label>
                                            <select
                                                value={selectedProfile.provider || 'stripe'}
                                                onChange={e => handleUpdateSelected('provider', e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none appearance-none"
                                            >
                                                <option value="stripe">Stripe Connect (Cartão/Boleto/Pix)</option>
                                                <option value="pix_external">Pix Direto (PSP Externo)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Ambiente</label>
                                            <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700 w-fit">
                                                <button onClick={() => handleUpdateSelected('mode', 'test')} className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${selectedProfile.mode === 'test' ? 'bg-yellow-600 text-white' : 'text-gray-500 hover:text-white'}`}>TEST DATA</button>
                                                <button onClick={() => handleUpdateSelected('mode', 'live')} className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${selectedProfile.mode === 'live' ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-white'}`}>LIVE PROD</button>
                                            </div>
                                        </div>
                                        {selectedProfile.provider === 'pix_external' && (
                                            <div>
                                                <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Provedor PSP</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex: EFI, PagHiper, StarkBank"
                                                    value={selectedProfile.pixProviderName || ''}
                                                    onChange={e => handleUpdateSelected('pixProviderName', e.target.value)}
                                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* STRIPE FORM FIELDS */}
                                    {(selectedProfile.provider === 'stripe' || !selectedProfile.provider) && (
                                        <div className="grid gap-3 pt-2 border-t border-gray-800 mt-2">
                                            <div className="relative group">
                                                <label className="block text-[10px] uppercase text-gray-500 mb-1 font-bold flex gap-2 items-center"><Key className="w-3 h-3" /> Chave Pública (Publishable Key)</label>
                                                <input
                                                    type="text"
                                                    value={selectedProfile.publishableKey || ''}
                                                    onChange={e => handleUpdateSelected('publishableKey', e.target.value)}
                                                    placeholder="pk_test_..."
                                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs font-mono text-green-400 focus:border-indigo-500 outline-none transition-all group-hover:border-gray-600"
                                                />
                                            </div>
                                            <div className="relative group">
                                                <label className="block text-[10px] uppercase text-gray-500 mb-1 font-bold flex gap-2 items-center"><LockClosed className="w-3 h-3" /> Chave Secreta (Secret Key)</label>
                                                <input
                                                    type="password"
                                                    value={selectedProfile.secretKey || ''}
                                                    onChange={e => handleUpdateSelected('secretKey', e.target.value)}
                                                    placeholder="sk_test_..."
                                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs font-mono text-yellow-400 focus:border-indigo-500 outline-none transition-all group-hover:border-gray-600"
                                                />
                                            </div>
                                            <div className="relative group">
                                                <label className="block text-[10px] uppercase text-gray-500 mb-1 font-bold flex gap-2 items-center"><Globe className="w-3 h-3" /> Segredo do Webhook (Webhook Secret)</label>
                                                <input
                                                    type="password"
                                                    value={selectedProfile.webhookSecret || ''}
                                                    onChange={e => handleUpdateSelected('webhookSecret', e.target.value)}
                                                    placeholder="whsec_..."
                                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs font-mono text-purple-400 focus:border-indigo-500 outline-none transition-all group-hover:border-gray-600"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* PIX EXTERNAL FORM FIELDS */}
                                    {selectedProfile.provider === 'pix_external' && (
                                        <div className="grid gap-4 pt-2 border-t border-gray-800 mt-4">
                                            <div className="bg-yellow-900/10 border border-yellow-900/30 p-3 rounded mb-2">
                                                <p className="text-xs text-yellow-500 flex items-center gap-2"><AlertTriangle className="w-3 h-3" /> Este gateway será usado <b>apenas</b> para geração de Pix.</p>
                                            </div>
                                            <div className="relative group">
                                                <label className="block text-xs uppercase text-gray-500 mb-1 font-bold flex gap-2 items-center"><Key className="w-3 h-3" /> Chave Pix (E-mail/CPF/CNPJ/Aleatória)</label>
                                                <input
                                                    type="text"
                                                    value={selectedProfile.pixKey || ''}
                                                    onChange={e => handleUpdateSelected('pixKey', e.target.value)}
                                                    placeholder="sua-chave-pix-aqui"
                                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm font-mono text-white focus:border-indigo-500 outline-none transition-all group-hover:border-gray-600"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative group">
                                                    <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Client ID (API)</label>
                                                    <input
                                                        type="text"
                                                        value={selectedProfile.pixClientId || ''}
                                                        onChange={e => handleUpdateSelected('pixClientId', e.target.value)}
                                                        placeholder="Client_Id_..."
                                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-300 focus:border-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div className="relative group">
                                                    <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Client Secret (API)</label>
                                                    <input
                                                        type="password"
                                                        value={selectedProfile.pixClientSecret || ''}
                                                        onChange={e => handleUpdateSelected('pixClientSecret', e.target.value)}
                                                        placeholder="Client_Secret_..."
                                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-300 focus:border-indigo-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="relative group">
                                                <label className="block text-xs uppercase text-gray-500 mb-1 font-bold flex gap-2 items-center"><FileText className="w-3 h-3" /> Caminho do Certificado (.p12 / .pem)</label>
                                                <input
                                                    type="text"
                                                    value={selectedProfile.pixCertPath || ''}
                                                    onChange={e => handleUpdateSelected('pixCertPath', e.target.value)}
                                                    placeholder="/caminho/para/certificado.p12"
                                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-400 focus:border-indigo-500 outline-none transition-all group-hover:border-gray-600"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 flex gap-3">
                                        <Button onClick={handleSaveProfile} isLoading={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-500">
                                            <CheckCircle className="w-4 h-4 mr-2" /> Salvar Alterações
                                        </Button>
                                        <Button onClick={handleTestConnection} variant="secondary" className=" border-gray-600">
                                            <RefreshCw className="w-4 h-4 mr-2" /> Testar Ping
                                        </Button>
                                    </div>

                                    {connectionStatus === 'success' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg flex items-center gap-3">
                                            <div className="bg-green-500 text-black rounded-full p-1"><CheckCircle className="w-4 h-4" /></div>
                                            <div className="text-sm text-green-400">
                                                <p className="font-bold">Conexão Estabelecida</p>
                                                <p className="text-xs opacity-80">Stripe API v2024 (Latest) • Latência: ~40ms</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </Card>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 bg-gray-900 border border-gray-800 rounded-xl border-dashed">
                                <p>Selecione um perfil de gateway ao lado.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: ACCOUNTS */}
            {activeTab === 'accounts' && (
                <Card className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-gray-700 flex justify-between bg-gray-850">
                        <h3 className="font-bold text-white flex items-center gap-2"><CreditCard className="w-5 h-5 text-gray-400" /> Contas Conectadas (Marketplace)</h3>
                        <Button variant="secondary" className="!py-1 !text-xs"><RefreshCw className="w-3 h-3 mr-2" /> Atualizar</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left bg-gray-900">
                            <thead className="text-xs text-gray-500 uppercase font-bold border-b border-gray-700 bg-gray-800">
                                <tr>
                                    <th className="px-6 py-4">ID Conta</th>
                                    <th className="px-6 py-4">Nome do Negócio</th>
                                    <th className="px-6 py-4">Tipo</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Pendências (KYC)</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {accounts.map(acc => (
                                    <tr key={acc.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-indigo-400">{acc.id}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-white font-medium">{acc.businessName}</p>
                                            <p className="text-xs text-gray-500">{acc.email}</p>
                                        </td>
                                        <td className="px-6 py-4"><span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">{acc.type}</span></td>
                                        <td className="px-6 py-4"><StatusBadge status={acc.status} /></td>
                                        <td className="px-6 py-4 text-xs">
                                            {acc.requirements.currently_due.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {acc.requirements.currently_due.map(r => (
                                                        <span key={r} className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {r}</span>
                                                    ))}
                                                </div>
                                            ) : <span className="text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Regular</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-white underline text-xs">Ver no Stripe</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* TAB: TRANSACTIONS */}
            {activeTab === 'transactions' && (
                <Card className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-gray-700 flex justify-between bg-gray-850">
                        <h3 className="font-bold text-white flex items-center gap-2"><DollarSign className="w-5 h-5 text-gray-400" /> Trilha de Auditoria (Global)</h3>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Buscar ID (pi_...)" className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-xs text-white" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left bg-gray-900">
                            <thead className="text-xs text-gray-500 uppercase font-bold border-b border-gray-700 bg-gray-800">
                                <tr>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4">ID Transação</th>
                                    <th className="px-6 py-4">Descrição</th>
                                    <th className="px-6 py-4">Tipo</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Valor Bruto</th>
                                    <th className="px-6 py-4">Net (Parceiro)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {transactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 text-xs text-gray-400">{new Date(tx.created).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-300">{tx.id}</td>
                                        <td className="px-6 py-4 text-sm text-white">{tx.description}</td>
                                        <td className="px-6 py-4 text-xs text-gray-400 uppercase">{tx.type}</td>
                                        <td className="px-6 py-4"><StatusBadge status={tx.status} /></td>
                                        <td className="px-6 py-4 font-mono text-white">R$ {tx.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4 font-mono text-indigo-400">R$ {tx.net.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* TAB: COMPLIANCE */}
            {activeTab === 'compliance' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 p-6">
                        <h3 className="font-bold text-white mb-4">Integridade da Plataforma (Risk Check)</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                <div className="flex gap-3 items-center">
                                    <div className="bg-green-500/10 p-2 rounded text-green-500"><ShieldCheck className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Taxa de Disputas (Chargeback)</p>
                                        <p className="text-xs text-gray-500">Monitoramento global de risco</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-green-400">0.04%</p>
                                    <p className="text-[10px] text-gray-500">Aceitável {'<'} 0.75%</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                <div className="flex gap-3 items-center">
                                    <div className="bg-blue-500/10 p-2 rounded text-blue-500"><FileText className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Termos de Serviço (Stripe)</p>
                                        <p className="text-xs text-gray-500">Atualizado e vigente</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Vigente v2.4</span>
                            </div>

                            {accounts.some(acc => acc.requirements.currently_due.length > 0) && (
                                <div className="mt-4 p-4 bg-yellow-900/10 border border-yellow-900/30 rounded-lg">
                                    <h4 className="text-yellow-400 font-bold text-sm flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> Alerta de Compliance</h4>
                                    <p className="text-xs text-gray-400">Existem contas conectadas com pendências de KYC. Notifique os parceiros para regularizar.</p>
                                    <Button variant="secondary" className="mt-3 !py-1 !text-xs !bg-yellow-600/20 !text-yellow-400 border-yellow-600/30">Notificar Parceiros</Button>
                                </div>
                            )}
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="font-bold text-white mb-2">Logs Recentes (Webhook)</h3>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                <p className="text-gray-500 text-xs text-center py-8">Nenhum log encontrado para o gateway atual.</p>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LucPayDashboard;
