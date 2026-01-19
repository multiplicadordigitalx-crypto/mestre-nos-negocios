
import React, { useRef } from 'react';
import { Student } from '../types';
import Card from './Card';
import Button from './Button';
import {
    Trophy, CheckCircle, Clock, AlertTriangle, MapPin, Smartphone,
    Monitor, Calendar, Download, MessageSquare, Ban, DollarSign,
    Activity, Eye, Pencil, Camera, PlusCircle, ShieldCheck, LockClosed, Globe, Server,
    Key, CreditCard, ExternalLink
} from './Icons';
import { useAuth } from '../hooks/useAuth';
import { getStudentWalletHistory } from '../services/mockFirebase';
import { WalletTransaction } from '../types';
import toast from 'react-hot-toast';

interface StudentProfileViewProps {
    student: Student;
    viewer: 'student' | 'admin' | 'support';
    onClose?: () => void;
    permissions?: any;
    onAction?: (action: string, payload?: any) => void;
}

const StudentProfileView: React.FC<StudentProfileViewProps> = ({ student, viewer, onClose, permissions, onAction }) => {
    const { updateProfilePhoto } = useAuth();
    const isAdmin = viewer === 'admin' || viewer === 'support';
    const canViewFullSensitive = viewer === 'admin' || (viewer === 'support' && permissions?.viewSensitiveData);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [walletHistory, setWalletHistory] = React.useState<WalletTransaction[]>([]);

    React.useEffect(() => {
        if (isAdmin && student.uid) {
            getStudentWalletHistory(student.uid).then(setWalletHistory);
        }
    }, [isAdmin, student.uid]);

    const maskCPF = (cpf: string) => {
        if (!cpf) return 'Não cadastrado';
        if (canViewFullSensitive) return cpf;
        return `***.***.${cpf.slice(-5)}`;
    };

    const isVerified = student.producerData?.isVerified;

    const handlePhotoClick = () => {
        if (viewer === 'student' && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Por favor, selecione um arquivo de imagem.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('A imagem deve ter no máximo 5MB.');
                return;
            }
            updateProfilePhoto(file);
        }
    };

    return (
        <div className="bg-gray-900 text-gray-200 rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 border-b border-gray-700 flex flex-col sm:flex-row items-center gap-6">
                <div
                    className={`relative group ${viewer === 'student' ? 'cursor-pointer' : ''}`}
                    onClick={handlePhotoClick}
                >
                    <img
                        src={student.photoURL || `https://i.pravatar.cc/150?u=${student.email}`}
                        alt="Avatar"
                        className={`w-24 h-24 rounded-full border-4 ${isVerified ? 'border-green-500' : 'border-brand-primary'} shadow-lg object-cover transition-opacity ${viewer === 'student' ? 'group-hover:opacity-50' : ''}`}
                    />

                    {viewer === 'student' && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white drop-shadow-md" />
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {isVerified && (
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg border-2 border-gray-900 pointer-events-none">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                    )}
                </div>

                <div className="text-center sm:text-left flex-1">
                    <h2 className="text-2xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                        {student.displayName}
                        {isVerified && <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold">VERIFICADO</span>}
                    </h2>
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-2">
                        <span className="px-3 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-2 border border-gray-600">
                            <Trophy className="w-4 h-4 text-brand-primary" />
                            {student.gamification?.level || 'Iniciante'}
                        </span>
                        <span className="text-sm text-gray-400">ID: {student.internalId || '#---'}</span>
                    </div>
                </div>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-5">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-brand-primary rounded-full"></div> Dados Pessoais
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Nome Completo</span>
                                <span className="text-white font-medium">{student.displayName}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">E-mail</span>
                                <span className="text-white font-medium">{student.email}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">CPF/CNPJ</span>
                                <span className="text-white font-medium">{maskCPF(student.producerData?.cpfCnpj || student.cpf)}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Telefone</span>
                                <span className="text-white font-medium">{student.producerData?.phone || student.phone || '(xx) xxxxx-xxxx'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Localização</span>
                                <span className="text-white font-medium flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-gray-500" /> {student.producerData?.address?.city || student.city || 'N/A'} / {student.producerData?.address?.state || student.state || '--'}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-5">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-blue-500 rounded-full"></div> Auditoria de Segurança
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Cadastro</span>
                                <span className="text-white font-medium">{student.purchaseDate ? new Date(student.purchaseDate).toLocaleDateString() : '-'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400 flex items-center gap-1"><Server className="w-3 h-3" /> Último IP</span>
                                <span className="text-white font-mono">{student.lastLoginIp || '127.0.0.1'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 flex items-center gap-1"><Smartphone className="w-3 h-3" /> Dispositivo</span>
                                <span className="text-white font-medium truncate max-w-[150px]" title={student.deviceInfo}>{student.deviceInfo || 'Desktop (Chrome)'}</span>
                            </div>
                            {isAdmin && (
                                <div className="mt-4 pt-3 border-t border-gray-700">
                                    <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 p-2 rounded-lg text-[10px] font-bold uppercase">
                                        <LockClosed className="w-3 h-3" /> Registro de Logs Ativado
                                    </div>
                                </div>
                            )}
                        </div>

                    </Card>
                </div>

                {
                    isAdmin && (
                        <Card className="p-5">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <div className="w-1 h-6 bg-green-500 rounded-full"></div> Histórico Financeiro & Gateway
                            </h3>
                            {walletHistory.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-700 text-gray-400 font-bold text-xs uppercase">
                                                <th className="pb-2">Data</th>
                                                <th className="pb-2">Descrição</th>
                                                <th className="pb-2">Gateway Ref</th>
                                                <th className="pb-2 text-right">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {walletHistory.map(tx => (
                                                <tr key={tx.id} className="group hover:bg-gray-800/50 transition-colors">
                                                    <td className="py-2 text-gray-500 text-xs">{new Date(tx.timestamp).toLocaleDateString()}</td>
                                                    <td className="py-2 text-white font-medium">{tx.description}</td>
                                                    <td className="py-2">
                                                        {tx.gatewayId ? (
                                                            <span className="text-[10px] font-mono text-xs bg-black/30 px-1.5 py-0.5 rounded text-gray-400 border border-gray-700 flex items-center w-fit gap-1">
                                                                {tx.gatewayId} <ExternalLink className="w-3 h-3 opacity-50" />
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-gray-600 italic">--</span>
                                                        )}
                                                    </td>
                                                    <td className={`py-2 text-right font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                                        {tx.type === 'credit' ? '+' : '-'} {tx.amount}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm italic py-4 text-center">Nenhuma transação registrada.</p>
                            )}
                        </Card>
                    )
                }

                <Card className="p-6 bg-gradient-to-br from-gray-800 to-gray-900/50">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-400" /> Status de Performance & Nível
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 text-center">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Nível Atual</p>
                            <p className="text-2xl font-black text-brand-primary">{student.gamification?.level}</p>
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 text-center">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Produção Validada</p>
                            <p className="text-2xl font-black text-white">{student.gamification?.totalVerifiedPosts}</p>
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 text-center">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Saldo Créditos</p>
                            <p className="text-2xl font-black text-green-400">{student.creditBalance || 0} cr</p>
                        </div>
                    </div>
                </Card>
            </div >

            {isAdmin && onAction && (
                <div className="p-6 border-t border-gray-700 bg-gray-900/80 flex flex-wrap gap-3 shrink-0">
                    <Button variant="secondary" onClick={() => onAction('impersonate')} className="!py-2 !text-xs bg-indigo-900/30 text-indigo-400 border-indigo-500/30">
                        <Eye className="w-4 h-4 mr-2" /> Espelhar Dashboard
                    </Button>
                    <Button variant="secondary" onClick={() => onAction('reset_password')} className="!py-2 !text-xs">
                        <Key className="w-4 h-4 mr-2" /> Resetar Senha
                    </Button>
                    <Button variant="secondary" onClick={() => onAction('block')} className="!py-2 !text-xs !bg-red-900/20 text-red-400 border-red-900/50">
                        <Ban className="w-4 h-4 mr-2" /> Bloquear Aluno
                    </Button>
                </div>
            )}
        </div >
    );
};

export default StudentProfileView;
