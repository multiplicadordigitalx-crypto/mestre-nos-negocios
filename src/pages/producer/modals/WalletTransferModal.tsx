import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeftRight, CheckCircle, Wallet, Briefcase, AlertTriangle } from '../../../components/Icons';
import Button from '../../../components/Button';
import { transferCredits, getStudentWalletBalance, getProducerWallet } from '../../../services/mockFirebase';
import { toast } from 'react-hot-toast';

interface WalletTransferModalProps {
    producerId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const WalletTransferModal: React.FC<WalletTransferModalProps> = ({ producerId, onClose, onSuccess }) => {
    const [direction, setDirection] = useState<'student_to_producer' | 'producer_to_student'>('producer_to_student');
    const [amount, setAmount] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    const [balances, setBalances] = useState<{ student: number, producer: number } | null>(null);

    useEffect(() => {
        loadBalances();
    }, []);

    const loadBalances = async () => {
        // In real app, we get student ID from auth context
        const studentId = 'student-01';
        const [studentBal, prodWallet] = await Promise.all([
            getStudentWalletBalance(studentId),
            getProducerWallet()
        ]);
        setBalances({ student: studentBal, producer: prodWallet.balance });
    };

    const handleTransfer = async () => {
        if (amount <= 0) return toast.error("Valor inválido.");
        if (!balances) return;

        const maxBalance = direction === 'student_to_producer' ? balances.student : balances.producer;
        if (amount > maxBalance) return toast.error("Saldo insuficiente na origem.");

        setLoading(true);
        try {
            const from = direction === 'student_to_producer' ? 'student' : 'producer';
            const to = direction === 'student_to_producer' ? 'producer' : 'student';

            const result = await transferCredits(from, to, amount);

            if (result.success) {
                toast.success(result.message);
                onSuccess();
                onClose();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Erro na transferência.");
        } finally {
            setLoading(false);
        }
    };

    const toggleDirection = () => {
        setDirection(prev => prev === 'producer_to_student' ? 'student_to_producer' : 'producer_to_student');
        setAmount(0);
    };

    if (!balances) return null;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ArrowLeftRight className="text-white w-5 h-5" /> Transferir Créditos
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">

                    {/* Visualizer */}
                    <div className="flex items-center justify-between gap-4 mb-8">
                        {/* Student Side */}
                        <div className={`flex-1 p-4 rounded-xl border transition-colors flex flex-col items-center ${direction === 'student_to_producer' ? 'bg-indigo-900/20 border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-gray-800 border-gray-700 opacity-60'}`}>
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mb-2">
                                <Wallet className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-[10px] uppercase font-bold text-gray-400">Origem: Pessoal</span>
                            <span className="text-lg font-bold text-white">{balances.student}</span>
                        </div>

                        {/* Switcher */}
                        <button onClick={toggleDirection} className="p-2 bg-gray-800 border border-gray-600 rounded-full hover:bg-gray-700 transition-transform active:scale-90 z-10">
                            <ArrowRight className={`w-5 h-5 text-gray-300 transition-transform duration-300 ${direction === 'student_to_producer' ? '' : 'rotate-180'}`} />
                        </button>

                        {/* Producer Side */}
                        <div className={`flex-1 p-4 rounded-xl border transition-colors flex flex-col items-center ${direction === 'producer_to_student' ? 'bg-indigo-900/20 border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-gray-800 border-gray-700 opacity-60'}`}>
                            <div className="w-10 h-10 bg-indigo-900 rounded-full flex items-center justify-center mb-2">
                                <Briefcase className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="text-[10px] uppercase font-bold text-indigo-300">Origem: Empresa</span>
                            <span className="text-lg font-bold text-white">{balances.producer}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Valor da Transferência</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(Number(e.target.value))}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-4 text-white text-xl font-bold outline-none focus:border-indigo-500 text-center"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">CRÉDITOS</span>
                            </div>
                            <div className="flex justify-between mt-2">
                                <button onClick={() => setAmount(100)} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 hover:text-white">+100</button>
                                <button onClick={() => setAmount(500)} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 hover:text-white">+500</button>
                                <button onClick={() => setAmount(direction === 'student_to_producer' ? balances.student : balances.producer)} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 hover:text-white">Máximo</button>
                            </div>
                        </div>

                        {amount > (direction === 'student_to_producer' ? balances.student : balances.producer) && (
                            <div className="bg-red-900/20 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span className="text-xs text-red-400">Saldo insuficiente para esta operação.</span>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleTransfer}
                        disabled={loading || amount <= 0 || amount > (direction === 'student_to_producer' ? balances.student : balances.producer)}
                        className="w-full mt-6 py-4 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                        {loading ? 'Transferindo...' : 'Confirmar Transferência'}
                    </Button>

                </div>
            </div>
        </div>
    );
};
