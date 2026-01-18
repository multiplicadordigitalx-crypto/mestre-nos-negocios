import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { FileText, CheckCircle, XCircle, Mail, AlertTriangle, Eye, BarChart2, Download, Calendar, DollarSign, Search } from '../../../components/Icons';
import { getMedicalCertificates, updateMedicalCertificateStatus, getTeamUsers } from '../../../services/mockFirebase';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

const CertificateApprovalQueue: React.FC = () => {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState<any[]>([]);
    const [teamUsers, setTeamUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Nexus Consultancy State
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [dateRange, setDateRange] = useState('30d');
    const [nexusData, setNexusData] = useState<any>(null);
    const [statementData, setStatementData] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedEmployeeId) {
            generateNexusAnalysis();
        }
    }, [selectedEmployeeId, dateRange]);

    const loadData = async () => {
        setLoading(true);
        const [certs, users] = await Promise.all([getMedicalCertificates(), getTeamUsers()]);
        setCertificates(certs);
        setTeamUsers(users);
        setLoading(false);
    };

    const handleApprove = async (cert: any) => {
        if (!confirm(`Aprovar atestado de ${cert.userName}? Isso enviará um e-mail para a contabilidade.`)) return;

        setProcessingId(cert.id);
        const success = await updateMedicalCertificateStatus(cert.id, 'approved', { accountingEmail: 'contabilidade@empresa.com' });

        if (success) {
            toast.success("Atestado Aprovado! E-mail disparado para contabilidade.", { icon: '📧' });
            setTimeout(() => {
                console.log("Email sent to accounting");
            }, 500);
            loadData();
        } else {
            toast.error("Erro ao aprovar.");
        }
        setProcessingId(null);
    };

    const handleReject = async (cert: any) => {
        const reason = prompt("Motivo da recusa:");
        if (!reason) return;

        setProcessingId(cert.id);
        const success = await updateMedicalCertificateStatus(cert.id, 'rejected', { reason });

        if (success) {
            toast.success("Atestado Recusado.");
            loadData();
        }
        setProcessingId(null);
    };

    // --- Nexus Consultancy Logic ---
    const generateNexusAnalysis = () => {
        // Mock Consultancy Data
        setNexusData({
            vacation: { acquired: 30, taken: 12, deadline: '15/12/2026' },
            absences: { total: 4, justified: 3, unjustified: 1 },
            financial: { pending: 450.00, lastPayment: '18/09/2025' },
            status: 'Regular'
        });

        // Mock Statement Data
        const daysMap: Record<string, number> = { '7d': 7, '15d': 15, '30d': 30, '3m': 90, '6m': 180, '12m': 365 };
        const days = daysMap[dateRange] || 30;
        const mockData = [];
        const today = new Date();

        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            if (isWeekend) continue;

            const timeLoggedIn = 460 + Math.floor(Math.random() * 40);
            const timeActive = Math.floor(timeLoggedIn * (0.7 + Math.random() * 0.2));
            const nps = Math.random() > 0.9 ? 100 : Math.random() > 0.6 ? 75 : 50;

            mockData.push({
                date: date.toLocaleDateString('pt-BR'),
                timeLoggedIn,
                timeActive,
                nps,
                status: 'Presente'
            });
        }
        setStatementData(mockData);
    };

    const handleDownloadReport = () => {
        if (user?.role !== 'admin' && user?.role !== 'super_admin') {
            toast.error("Apenas administradores podem baixar este relatório.");
            return;
        }
        toast.success("Relatório Nexus (CLT/Financeiro) baixado com sucesso!");
    };

    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const pendingCerts = certificates.filter(c => c.status === 'pending');
    const historyCerts = certificates.filter(c => c.status !== 'pending');

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" /> Fila de Aprovação (Atestados)
                    </h3>
                    <p className="text-gray-400 text-sm">{pendingCerts.length} documentos pendentes de auditoria.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? <LoadingSpinner /> : pendingCerts.length === 0 ? (
                    <Card className="p-8 text-center bg-gray-800 border-dashed border-2 border-gray-700">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2 opacity-50" />
                        <p className="text-gray-400">Nenhum atestado pendente de análise.</p>
                    </Card>
                ) : (
                    pendingCerts.map(cert => (
                        <Card key={cert.id} className="p-0 overflow-hidden border-l-4 border-l-yellow-500">
                            <div className="p-4 bg-gray-800 flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-6 h-6 text-brand-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{cert.userName}</h4>
                                        <p className="text-sm text-gray-400">Enviado em: {new Date(cert.date).toLocaleDateString()}</p>

                                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-3 text-sm">
                                            <div className="flex gap-2">
                                                <span className="text-gray-500">Médico:</span>
                                                <span className="text-gray-300 font-bold">{cert.ocrData?.doctorName}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-gray-500">CRM:</span>
                                                <span className="text-gray-300 font-bold">{cert.ocrData?.crm}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-gray-500">Período:</span>
                                                <span className="text-brand-primary font-bold">{cert.ocrData?.daysOff} dias (CID: {cert.ocrData?.cid})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 justify-center min-w-[200px]">
                                    <Button
                                        onClick={() => handleApprove(cert)}
                                        isLoading={processingId === cert.id}
                                        className="!bg-green-600 hover:!bg-green-500 w-full justify-center"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" /> Aprovar & Enviar
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleReject(cert)}
                                        isLoading={processingId === cert.id}
                                        className="w-full justify-center border-red-500/30 text-red-400 hover:bg-red-900/30"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" /> Contestar / Recusar
                                    </Button>
                                    <button className="text-xs text-gray-500 hover:text-white underline text-center mt-1">
                                        Ver Comprovante Original
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {historyCerts.length > 0 && (
                <div className="opacity-60">
                    <h4 className="font-bold text-gray-400 mb-4 text-sm uppercase">Histórico Recente</h4>
                    <Card className="overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-800 text-gray-500 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-2">Colaborador</th>
                                    <th className="px-4 py-2">Data</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Obs</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {historyCerts.slice(0, 5).map(c => (
                                    <tr key={c.id}>
                                        <td className="px-4 py-2 text-white">{c.userName}</td>
                                        <td className="px-4 py-2 text-gray-400">{new Date(c.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-2">
                                            {c.status === 'approved' ? <span className="text-green-500 font-bold text-xs uppercase">Aprovado</span> : <span className="text-red-500 font-bold text-xs uppercase">Recusado</span>}
                                        </td>
                                        <td className="px-4 py-2 text-gray-500 text-xs">{c.rejectionReason || 'Enviado Contabilidade'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>
            )}

            {/* Nexus Consultancy & Statement Section */}
            <Card className="bg-gray-800 border border-gray-700 shadow-xl">
                <div className="p-6 border-b border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/50">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <BarChart2 className="w-6 h-6 text-brand-primary" /> Consultoria Nexus
                        </h3>
                        <p className="text-gray-400 text-sm">Análise completa do colaborador (CLT, Férias e Produtividade) para tomada de decisão.</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Employee Selector */}
                    <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-900 p-4 rounded-xl border border-gray-800">
                        <Search className="w-5 h-5 text-gray-500" />
                        <select
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg p-3 flex-1 focus:ring-brand-primary focus:border-brand-primary"
                        >
                            <option value="">Selecione um colaborador para análise...</option>
                            {teamUsers.map(u => (
                                <option key={u.id || u.userName} value={u.id || u.userName}>{u.userName} ({u.role})</option>
                            ))}
                        </select>
                        {(user?.role === 'admin' || user?.role === 'super_admin') && (
                            <button
                                onClick={handleDownloadReport}
                                disabled={!selectedEmployeeId}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-colors ${!selectedEmployeeId ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-brand-primary hover:bg-brand-secondary text-black'}`}
                            >
                                <Download className="w-4 h-4" /> Baixar Relatório Nexus
                            </button>
                        )}
                    </div>

                    {selectedEmployeeId && nexusData && (
                        <div className="animate-fade-in space-y-6">
                            {/* Financial / HR Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-900/80 p-5 rounded-xl border-l-4 border-l-blue-500">
                                    <p className="text-gray-400 text-xs font-bold uppercase flex items-center gap-2 mb-2"><Calendar className="w-4 h-4" /> Controle de Férias</p>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-2xl font-black text-white">{nexusData.vacation.acquired} Dias</p>
                                            <p className="text-xs text-green-400 font-bold">Adquiridos</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-gray-400">{nexusData.vacation.taken} Dias</p>
                                            <p className="text-xs text-gray-500">Utilizados</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div className="bg-blue-500 h-full" style={{ width: `${(nexusData.vacation.taken / 30) * 100}%` }}></div>
                                    </div>
                                </div>

                                <div className="bg-gray-900/80 p-5 rounded-xl border-l-4 border-l-red-500">
                                    <p className="text-gray-400 text-xs font-bold uppercase flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> Absenteísmo (Ano)</p>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-2xl font-black text-white">{nexusData.absences.total}</p>
                                            <p className="text-xs text-red-400 font-bold">Faltas Totais</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-gray-400">{nexusData.absences.justified}</p>
                                            <p className="text-xs text-green-500">Justificadas</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-900/80 p-5 rounded-xl border-l-4 border-l-green-500">
                                    <p className="text-gray-400 text-xs font-bold uppercase flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4" /> Financeiro</p>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-2xl font-black text-white">R$ {nexusData.financial.pending.toFixed(2)}</p>
                                            <p className="text-xs text-yellow-400 font-bold">Pendências</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Último Pagamento</p>
                                            <p className="text-sm font-bold text-white">{nexusData.financial.lastPayment}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Statement Table */}
                            <div>
                                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                    {['7d', '15d', '30d', '3m', '6m', '12m'].map(range => (
                                        <button
                                            key={range}
                                            onClick={() => setDateRange(range)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${dateRange === range
                                                    ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/20'
                                                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                                }`}
                                        >
                                            {range === '7d' ? '7 Dias' : range === '15d' ? '15 Dias' : range === '30d' ? '30 Dias' : range === '3m' ? '3 Meses' : range === '6m' ? '6 Meses' : '1 Ano'}
                                        </button>
                                    ))}
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900/30">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-900 text-gray-400 text-xs uppercase">
                                            <tr>
                                                <th className="px-6 py-4">Data</th>
                                                <th className="px-6 py-4">Tempo Logado</th>
                                                <th className="px-6 py-4">Produtividade</th>
                                                <th className="px-6 py-4 text-center">NPS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {statementData.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-gray-300">{row.date}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white font-bold">{formatTime(row.timeLoggedIn)}</span>
                                                            <span className="text-xs text-gray-500">({Math.round((row.timeLoggedIn / 480) * 100)}%)</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-bold ${row.timeActive / row.timeLoggedIn < 0.5 ? 'text-red-400' : 'text-green-400'}`}>
                                                                {Math.round((row.timeActive / row.timeLoggedIn) * 100)}%
                                                            </span>
                                                            <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                                                                <div className={`h-full ${row.timeActive / row.timeLoggedIn < 0.5 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${(row.timeActive / row.timeLoggedIn) * 100}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${row.nps >= 75 ? 'bg-green-500/20 text-green-400' : row.nps >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                                            {row.nps}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {statementData.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-8 text-center text-gray-500">Nenhum dado encontrado para este período.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default CertificateApprovalQueue;
