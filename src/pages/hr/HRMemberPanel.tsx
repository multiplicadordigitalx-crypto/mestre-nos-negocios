import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { FileText, PlusCircle, CheckCircle, Clock, XCircle, AlertTriangle } from '../../components/Icons';
import { getMedicalCertificates } from '../../services/mockFirebase';
import { CertificateUploadModal } from '../../components/hr/CertificateUploadModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface HRMemberPanelProps {
    user: any;
}

const HRMemberPanel: React.FC<HRMemberPanelProps> = ({ user }) => {
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [user.id]);

    const loadData = async () => {
        setLoading(true);
        const allCerts = await getMedicalCertificates();
        // Filter only this users certs
        setCertificates(allCerts.filter((c: any) => c.userId === user.id));
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-brand-primary" /> Meus Atestados e Justificativas
                    </h3>
                    <p className="text-gray-400 text-sm">Envie atestados para justificar faltas. Todos os documentos passam por auditoria.</p>
                </div>
                <Button onClick={() => setIsUploadOpen(true)} className="!bg-brand-primary text-black font-bold">
                    <PlusCircle className="w-4 h-4 mr-2" /> Enviar Novo Atestado
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Summary Cards */}
                <Card className="p-4 bg-gray-800 border-l-4 border-l-green-500">
                    <p className="text-gray-400 text-xs font-bold uppercase">Atestados Aprovados</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{certificates.filter(c => c.status === 'approved').length}</h3>
                </Card>
                <Card className="p-4 bg-gray-800 border-l-4 border-l-yellow-500">
                    <p className="text-gray-400 text-xs font-bold uppercase">Em Análise</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{certificates.filter(c => c.status === 'pending').length}</h3>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3">Data Envio</th>
                                <th className="px-6 py-3">Médico / CRM</th>
                                <th className="px-6 py-3">Dias</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Observações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? <tr><td colSpan={5} className="p-8 text-center"><LoadingSpinner /></td></tr> :
                                certificates.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhum atestado enviado.</td></tr> :
                                    certificates.map(cert => (
                                        <tr key={cert.id} className="hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-3 text-gray-300">{new Date(cert.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-3">
                                                <p className="text-white font-medium">{cert.ocrData?.doctorName}</p>
                                                <p className="text-[10px] text-gray-500">CRM: {cert.ocrData?.crm}</p>
                                            </td>
                                            <td className="px-6 py-3 text-white font-bold">{cert.ocrData?.daysOff} dias</td>
                                            <td className="px-6 py-3">
                                                {cert.status === 'approved' && <span className="flex items-center gap-1 text-green-400 text-xs font-bold uppercase"><CheckCircle className="w-3 h-3" /> Aprovado</span>}
                                                {cert.status === 'pending' && <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold uppercase"><Clock className="w-3 h-3" /> Em Análise</span>}
                                                {cert.status === 'rejected' && <span className="flex items-center gap-1 text-red-400 text-xs font-bold uppercase"><XCircle className="w-3 h-3" /> Recusado</span>}
                                            </td>
                                            <td className="px-6 py-3 text-gray-400 text-xs italic">
                                                {cert.status === 'rejected' ? cert.rejectionReason : cert.status === 'approved' ? 'Enviado para Contabilidade' : '-'}
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isUploadOpen && (
                <CertificateUploadModal
                    userId={user.id}
                    userName={user.name}
                    onClose={() => setIsUploadOpen(false)}
                    onSuccess={loadData}
                />
            )}
        </div>
    );
};

export default HRMemberPanel;
