
import React, { useState } from 'react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { PlusCircle } from '../../../components/Icons';
import { LoginAttemptLog } from '../../../types';
import { getUserLoginHistory, performRecoveryAction } from '../../../services/mockFirebase';
import { RegisterStudentModal } from '../modals/AdminModals';
import toast from 'react-hot-toast';

const AccessRecoveryView: React.FC<{ adminName: string }> = ({ adminName }) => { 
    const [userId, setUserId] = useState(''); 
    const [logs, setLogs] = useState<LoginAttemptLog[]>([]); 
    const [loading, setLoading] = useState(false); 
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false); 
    
    const handleSearch = async () => { if(!userId) return; setLoading(true); const history = await getUserLoginHistory(userId); setLogs(history); setLoading(false); }; 
    const handleAction = async (action: string) => { if(!userId) return; await performRecoveryAction(userId, [action], adminName); toast.success(`Ação ${action} executada com sucesso.`); }; 
    
    return ( <div> <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">Recuperação de Acesso</h2> <Button onClick={() => setIsRegisterModalOpen(true)} className="!py-2 !text-xs !bg-blue-600 hover:!bg-blue-500"><PlusCircle className="w-4 h-4 mr-2"/> Cadastrar Aluno</Button></div><div className="flex gap-4 mb-6"> <div className="flex-1"> <Input label="ID ou Email do Usuário" value={userId} onChange={e => setUserId(e.target.value)} /> </div> <Button onClick={handleSearch} isLoading={loading} className="self-end mb-1">Buscar Logs</Button> </div> {logs.length > 0 && ( <div className="mb-6"> <h3 className="font-bold text-white mb-2">Histórico de Tentativas</h3> <div className="space-y-2"> {logs.map(log => ( <div key={log.id} className="bg-gray-800 p-3 rounded flex justify-between text-sm border border-gray-700"> <span>{new Date(log.date).toLocaleString()}</span> <span>{log.ip} ({log.device})</span> <span className={log.status === 'success' ? 'text-green-400' : 'text-red-400'}>{log.status}</span> </div> ))} </div> </div> )} <div className="grid grid-cols-2 gap-4"> <Button onClick={() => handleAction('Resetar Senha')} variant="secondary">Enviar Reset de Senha</Button> <Button onClick={() => handleAction('Desbloquear Conta')} className="!bg-green-600 hover:!bg-green-500">Desbloquear Conta</Button> </div> {isRegisterModalOpen && <RegisterStudentModal onClose={() => setIsRegisterModalOpen(false)} />} </div> ); 
};

export default AccessRecoveryView;
