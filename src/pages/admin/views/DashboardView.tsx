import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
// Fix: Added X as XIcon to the imports from Icons component
import { Users, TrendingUp, DollarSign, Link as LinkIcon, Search, X as XIcon } from '../../../components/Icons';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { Student } from '../../../types';
import { searchStudents, getStudentsPaginated } from '../../../services/mockFirebase';
import { AdminView } from '../components/AdminNavigation';

interface DashboardViewProps {
    onOpenStudent: (student: Student) => void;
    onNavigateTo: (view: AdminView) => void;
    refundCount: number;
    requestCount: number;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onOpenStudent, onNavigateTo, refundCount, requestCount }) => {
    const [studentsList, setStudentsList] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastStudentId, setLastStudentId] = useState<string | undefined>();
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.length > 2) {
                setIsSearching(true);
                const results = await searchStudents(searchTerm);
                setStudentsList(results);
                setIsSearching(false);
            } else if (searchTerm.length === 0) {
                loadInitialStudents(); 
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadInitialStudents = async () => {
        setIsSearching(true);
        const { students, lastId } = await getStudentsPaginated(10);
        setStudentsList(students);
        setLastStudentId(lastId);
        setIsSearching(false);
    }

    const loadMoreStudents = async () => {
        if (!lastStudentId) return;
        const { students, lastId } = await getStudentsPaginated(10, lastStudentId);
        setStudentsList(prev => [...prev, ...students]);
        setLastStudentId(lastId);
    }

    useEffect(() => {
        loadInitialStudents();
    }, []);

    const StatsCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, color: string, onClick?: () => void }> = ({ title, value, icon, color, onClick }) => (
        <div onClick={onClick} className={`bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-brand-primary/50 transition-all cursor-pointer shadow-lg relative overflow-hidden group`}>
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-white">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg bg-gray-700/50 ${color}`}>
                    {icon}
                </div>
            </div>
            {onClick && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>}
        </div>
    );

    return (
        <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <StatsCard title="Alunos Ativos" value={studentsList.length} icon={<Users className="w-6 h-6 text-white"/>} color="bg-blue-500"/>
                <StatsCard title="Vendas Hoje" value="R$ 1.250" icon={<TrendingUp className="w-6 h-6 text-white"/>} color="bg-green-500"/>
                <StatsCard title="Reembolsos Pendentes" value={refundCount} icon={<DollarSign className="w-6 h-6 text-white"/>} color="bg-red-500" onClick={() => onNavigateTo('refunds')}/>
                <StatsCard title="Solicitações Afiliação" value={requestCount} icon={<LinkIcon className="w-6 h-6 text-white"/>} color="bg-purple-500" onClick={() => onNavigateTo('requests')}/>
            </div>
            
            <div className="mt-6">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Alunos Recentes</h3>
                    <div className="flex gap-2 relative w-full md:w-auto">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500"/>
                        <input 
                            className="bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white w-full md:w-64 focus:border-brand-primary outline-none" 
                            placeholder="Buscar nome, email ou CPF..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    {isSearching ? <div className="text-center py-10"><LoadingSpinner/></div> : studentsList.map(student => (
                        <div key={student.uid} onClick={() => onOpenStudent(student)} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex justify-between items-center cursor-pointer hover:border-brand-primary transition-colors">
                            <div className="flex items-center gap-4">
                                <img src={student.photoURL || `https://i.pravatar.cc/150?u=${student.email}`} className="w-10 h-10 rounded-full" alt="avatar"/>
                                {student.financial?.status === 'refunded' && <div className="absolute w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center"><XIcon className="w-6 h-6 text-red-500"/></div>}
                                <div>
                                    <p className="font-bold text-white">{student.displayName}</p>
                                    <p className="text-xs text-gray-400">{student.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${student.financial?.status === 'approved' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>{student.financial?.status || 'Aprovado'}</span>
                                <p className="text-xs text-gray-500 mt-1">{new Date(student.purchaseDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                    {!isSearching && studentsList.length === 0 && <p className="text-center text-gray-500 py-4">Nenhum aluno encontrado.</p>}
                    {!isSearching && searchTerm.length === 0 && lastStudentId && (
                        <div className="text-center mt-4">
                            <Button variant="secondary" onClick={loadMoreStudents}>Carregar Mais</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardView;