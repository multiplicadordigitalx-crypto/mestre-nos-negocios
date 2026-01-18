import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Briefcase, LoadingSpinner, AlertTriangle, DollarSign, Globe } from '../../../components/Icons'; // Fix imports as needed
import { getTeamUsers } from '../../../services/mockFirebase';
import { AbsenceModal } from '../modals/AbsenceModal';
import { CommissionPaymentModal } from '../modals/AdminModals';

const HRTeamManagementView: React.FC<{ user?: any }> = ({ user }) => {
    const [teamUsers, setTeamUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterManager, setFilterManager] = useState('');

    // Payment/Absence Modal State (Re-used for direct actions)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentInitialData, setPaymentInitialData] = useState<any>(null);
    const [absenceEmployee, setAbsenceEmployee] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const usersData = await getTeamUsers();
        // Deduplicate users just in case
        const uniqueUsers = Array.from(new Map(usersData.map(item => [item.id, item])).values());
        setTeamUsers(uniqueUsers);
        setLoading(false);
    };

    const filteredEmployees = teamUsers.filter(u => u.name.toLowerCase().includes(filterManager.toLowerCase()));
    const totalPayroll = teamUsers.reduce((acc, u) => acc + (u.salary || 0), 0);

    const handleOpenPayment = (data?: any) => {
        setPaymentInitialData(data || null);
        setIsPaymentModalOpen(true);
    };

    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
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
            {/* HR metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-5 bg-gray-800 border-l-4 border-l-blue-500">
                    <p className="text-gray-400 text-xs font-bold uppercase">Total Colaboradores</p>
                    <h3 className="text-2xl font-black text-white mt-1">{filteredEmployees.length}</h3>
                </Card>
                <Card className="p-5 bg-gray-800 border-l-4 border-l-green-500">
                    <p className="text-gray-400 text-xs font-bold uppercase">Folha Estimada (Total)</p>
                    <h3 className="text-2xl font-black text-green-400 mt-1">R$ {totalPayroll.toLocaleString('pt-BR')}</h3>
                </Card>
            </div>

            <div className="flex gap-4 bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div className="flex-1">
                    <Input
                        placeholder="Buscar colaborador..."
                        value={filterManager}
                        onChange={e => setFilterManager(e.target.value)}
                        className="!bg-gray-900"
                    />
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2"><Briefcase className="w-5 h-5 text-brand-primary" /> Quadro de Colaboradores</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm"><thead className="bg-gray-800 text-gray-400 text-xs uppercase"><tr>
                        <th className="px-6 py-3">Nome</th>
                        <th className="px-6 py-3">Cargo/Departamento</th>
                        <th className="px-6 py-3">Contrato (RH)</th>
                        <th className="px-6 py-3">Jornada</th>
                        <th className="px-6 py-3 text-center">NPS</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Ações</th>
                    </tr></thead><tbody className="divide-y divide-gray-700">{loading ? <tr><td colSpan={7} className="p-8 text-center"><LoadingSpinner /></td></tr> :
                        filteredEmployees.map(emp => (
                            <tr key={emp.id} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                                            {emp.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{emp.name}</p>
                                            <p className="text-[10px] text-gray-400">{emp.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <p className="text-gray-300 font-medium capitalize">{emp.role === 'sales' ? 'Vendas' : emp.role === 'support' ? 'Suporte' : emp.role}</p>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="text-xs">
                                        <p className="text-gray-300">Adm: <span className="text-white">{emp.admissionDate ? new Date(emp.admissionDate).toLocaleDateString() : '-'}</span></p>
                                        <p className="text-gray-500">Salário: <span className="text-green-400 font-bold">R$ {(emp.salary || 0).toLocaleString('pt-BR')}</span></p>
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="text-xs text-gray-400">
                                        <p>{emp.dailyHours || 8}h / dia</p>
                                        <p>{emp.workDays || 5} dias / sem</p>
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-center">
                                    {emp.npsScore !== undefined && (
                                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${emp.npsScore >= 75 ? 'bg-green-500 text-black' : emp.npsScore >= 50 ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'}`}>
                                            {emp.npsScore}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${emp.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            onClick={() => setAbsenceEmployee(emp)}
                                            className="!text-xs !py-1 !bg-red-900/40 !text-red-400 hover:!bg-red-900/60 border border-red-500/30"
                                        >
                                            <AlertTriangle className="w-3 h-3 mr-1" /> Faltas
                                        </Button>
                                        <Button
                                            onClick={() => handleOpenPayment({ managerName: emp.name, amount: emp.salary || 0, period: 'Salário Mensal', paymentType: 'salary' })}
                                            className="!text-xs !py-1 !bg-green-600 hover:!bg-green-500"
                                        >
                                            <DollarSign className="w-3 h-3 mr-1" /> Pagar
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}</tbody></table>
                </div>
            </Card>



            {isPaymentModalOpen && <CommissionPaymentModal onClose={handleClosePaymentModal} user={user} onSave={() => { setPaymentInitialData(null); loadData(); }} initialData={paymentInitialData} />}
            {absenceEmployee && <AbsenceModal employee={absenceEmployee} onClose={() => setAbsenceEmployee(null)} onApplyDiscount={handleApplyDiscount} />}
        </div>
    );
};

export default HRTeamManagementView;
