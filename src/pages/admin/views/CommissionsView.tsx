import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Wallet, PlusCircle, Users, Globe, DollarSign, Briefcase, User, AlertTriangle } from '../../../components/Icons';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { CommissionPayment } from '../../../types';
import { getCommissionPayments, getTeamRankings, getTeamUsers } from '../../../services/mockFirebase';
import { CommissionPaymentModal } from '../modals/AdminModals';
import { AbsenceModal } from '../modals/AbsenceModal';
import RankingSection from '../../../components/RankingSection';

const CommissionsView: React.FC<{ user: any, permissions: any }> = ({ user, permissions }) => {
    const [activeTab, setActiveTab] = useState<'payments' | 'employees'>('payments');
    const [payments, setPayments] = useState<CommissionPayment[]>([]);
    const [teamUsers, setTeamUsers] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentInitialData, setPaymentInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filterManager, setFilterManager] = useState('');

    // Absence Modal State
    const [absenceEmployee, setAbsenceEmployee] = useState<any>(null);

    const [teamRevenue, setTeamRevenue] = useState(0);
    const [platformRevenue, setPlatformRevenue] = useState(0);

    const loadData = async () => {
        setLoading(true);
        const [payData, teamData, usersData] = await Promise.all([
            getCommissionPayments(),
            getTeamRankings(),
            getTeamUsers()
        ]);

        setPayments(payData);
        setTeamUsers(usersData);

        const totalTeam = teamData.generalRanking.reduce((acc, curr) => acc + curr.revenueToday, 0);
        setTeamRevenue(totalTeam);
        setPlatformRevenue(totalTeam + 125000);

        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const filteredPayments = filterManager ? payments.filter(p => p.managerName.toLowerCase().includes(filterManager.toLowerCase())) : payments;
    const totalPaid = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

    const filteredEmployees = teamUsers.filter(u => u.name.toLowerCase().includes(filterManager.toLowerCase()));
    const totalPayroll = teamUsers.reduce((acc, u) => acc + (u.salary || 0), 0);

    const handleOpenPayment = (data?: any) => {
        setPaymentInitialData(data || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setPaymentInitialData(null);
    };

    const handleApplyDiscount = (discount: number, desc: string) => {
        if (!absenceEmployee) return;
        const netSalary = Math.max(0, (absenceEmployee.salary || 0) - discount);
        setAbsenceEmployee(null);
        handleOpenPayment({
            managerName: absenceEmployee.name,
            amount: netSalary,
            period: `Salário Mensal - ${desc} (-R$ ${discount.toFixed(2)})`,
            paymentType: 'salary'
        });
    };
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-green-400" /> Gestão de Pagamentos
                    </h2>
                    <p className="text-gray-400 text-sm">Controle de comissões, bônus e pagamentos diversos.</p>
                </div>
                <Button onClick={() => handleOpenPayment()} className="!bg-green-600 hover:!bg-green-500">
                    <PlusCircle className="w-4 h-4 mr-2" /> Lançar Pagamento
                </Button>
            </div>

            {permissions?.viewFinance && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-5 border-l-4 border-l-blue-500 bg-gray-800">
                        <p className="text-gray-400 text-xs font-bold uppercase flex items-center gap-2">
                            Faturamento Equipes (Recuperação)
                        </p>
                        <h3 className="text-3xl font-black text-blue-400 mt-2">R$ {teamRevenue.toLocaleString('pt-BR')}</h3>
                    </Card>

                    {/* Platform Revenue - Restricted to Admin Only */}
                    {user?.role === 'admin' && (
                        <Card className="p-5 border-l-4 border-l-purple-500 bg-gray-800">
                            <p className="text-gray-400 text-xs font-bold uppercase flex items-center gap-2">
                                <Globe className="w-4 h-4" /> Faturamento Total Plataforma
                            </p>
                            <h3 className="text-3xl font-black text-purple-400 mt-2">R$ {platformRevenue.toLocaleString('pt-BR')}</h3>
                        </Card>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 border-l-4 border-l-green-500 bg-gray-800">
                    <p className="text-gray-400 text-xs font-bold uppercase">Total Pago em Comissões (Histórico)</p>
                    <h3 className="text-2xl font-bold text-white mt-1">R$ {totalPaid.toLocaleString('pt-BR')}</h3>
                </Card>
                <Card className="p-4 border-l-4 border-l-yellow-500 bg-gray-800">
                    <p className="text-gray-400 text-xs font-bold uppercase">Pagamentos Realizados</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{filteredPayments.length}</h3>
                </Card>
            </div>

            <div className="flex gap-4 bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div className="flex-1">
                    <Input
                        placeholder="Filtrar por nome do colaborador..."
                        value={filterManager}
                        onChange={e => setFilterManager(e.target.value)}
                        className="!bg-gray-900"
                    />
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3">Data Pagto</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3">Beneficiário</th>
                                <th className="px-6 py-3">Período/Desc</th>
                                <th className="px-6 py-3">Resp. Lançamento</th>
                                <th className="px-6 py-3 text-right">Valor Pago</th>
                                <th className="px-6 py-3 text-center">Comp.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? <tr><td colSpan={7} className="p-8 text-center"><LoadingSpinner /></td></tr> :
                                filteredPayments.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-gray-500">Nenhum pagamento registrado.</td></tr> :
                                    filteredPayments.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-3 text-gray-300">{new Date(p.paymentDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${p.paymentType === 'advance' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                    p.paymentType === 'bonus' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        p.paymentType === 'reimbursement' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                            p.paymentType === 'salary' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                                                                p.paymentType === 'thirteenth' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                                    p.paymentType === 'vacation' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                                        p.paymentType === 'termination' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                            (!p.paymentType || p.paymentType === 'commission') ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                                                'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                    }`}>
                                                    {p.paymentType === 'advance' && 'VALE'}
                                                    {p.paymentType === 'bonus' && 'BÔNUS'}
                                                    {p.paymentType === 'reimbursement' && 'REEMBOLSO'}
                                                    {p.paymentType === 'salary' && 'SALÁRIO'}
                                                    {p.paymentType === 'thirteenth' && '13º SALÁRIO'}
                                                    {p.paymentType === 'vacation' && 'FÉRIAS'}
                                                    {p.paymentType === 'termination' && 'RESCISÃO'}
                                                    {(!p.paymentType || p.paymentType === 'commission') && 'COMISSÃO'}
                                                    {p.paymentType === 'other' && 'OUTROS'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-white font-medium">{p.managerName}</td>
                                            <td className="px-6 py-3 text-gray-400 text-xs">{p.period || p.description || '-'}</td>
                                            <td className="px-6 py-3 text-gray-400 text-xs">{p.responsibleName}</td>
                                            <td className="px-6 py-3 text-right font-bold text-green-400">R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-3 text-center">
                                                {p.proofUrl && <a href={p.proofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-white text-xs underline font-bold bg-blue-900/30 px-2 py-1 rounded">Ver</a>}
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <RankingSection title="Rankings de Performance" className="mb-8" />

            {isModalOpen && <CommissionPaymentModal onClose={handleCloseModal} user={user} onSave={() => { setPaymentInitialData(null); loadData(); }} initialData={paymentInitialData} />}
        </div>
    );
};

export default CommissionsView;
