import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { X as XIcon, Calculator, AlertTriangle } from '../../../components/Icons';

interface AbsenceModalProps {
    employee: any;
    onClose: () => void;
    onApplyDiscount: (discountAmount: number, description: string) => void;
}

export const AbsenceModal: React.FC<AbsenceModalProps> = ({ employee, onClose, onApplyDiscount }) => {
    const [missedDays, setMissedDays] = useState(0);
    const [missedHours, setMissedHours] = useState(0);
    const [dsrDiscount, setDsrDiscount] = useState(true); // Discount Weekly Rest (DSR)
    const [calculatedDiscount, setCalculatedDiscount] = useState(0);

    const hourlyRate = (employee.salary || 0) / 220; // Standard 220h divisor
    const dailyRate = (employee.salary || 0) / 30; // Standard 30 days

    useEffect(() => {
        let total = 0;

        // Days Calculation
        if (missedDays > 0) {
            total += missedDays * dailyRate;
            if (dsrDiscount) {
                // Determine DSR value (simplified: 1 day of DSR per week with fault)
                // If missed all week, maybe more, but let's keep it simple: 1 Fault = Loss of DSR typically
                total += dailyRate;
            }
        }

        // Hours Calculation
        if (missedHours > 0) {
            total += missedHours * hourlyRate;
        }

        setCalculatedDiscount(total);
    }, [missedDays, missedHours, dsrDiscount, dailyRate, hourlyRate]);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-800 w-full max-w-md rounded-xl p-6 border border-gray-700 shadow-2xl animate-fade-in-up">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        <Calculator className="text-red-500 w-6 h-6" />
                        Calcular Faltas: {employee.name}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg transition-colors"><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                        <div className="text-xs text-gray-400">
                            <p>Salário Base: <span className="text-white font-bold">R$ {employee.salary?.toLocaleString('pt-BR')}</span></p>
                            <p>Valor Dia (1/30): <span className="text-white font-bold">R$ {dailyRate.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span></p>
                            <p>Valor Hora (1/220): <span className="text-white font-bold">R$ {hourlyRate.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Faltas (Dias)"
                            type="number"
                            min={0}
                            value={missedDays}
                            onChange={e => setMissedDays(Number(e.target.value))}
                        />
                        <Input
                            label="Atrasos (Horas)"
                            type="number"
                            min={0}
                            value={missedHours}
                            onChange={e => setMissedHours(Number(e.target.value))}
                        />
                    </div>

                    {missedDays > 0 && (
                        <div className="flex items-center gap-2 bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                            <input
                                type="checkbox"
                                id="dsr"
                                checked={dsrDiscount}
                                onChange={e => setDsrDiscount(e.target.checked)}
                                className="w-4 h-4 text-red-500 rounded focus:ring-red-500 bg-gray-700 border-gray-600"
                            />
                            <label htmlFor="dsr" className="text-xs text-red-200 font-bold cursor-pointer select-none">
                                Descontar DSR (Descanso Semanal Remunerado)?
                                <span className="block text-[9px] font-normal opacity-70">Lei 605/49: Perde o DSR se não cumprir jornada integral na semana.</span>
                            </label>
                        </div>
                    )}

                    <div className="bg-gray-700 p-4 rounded-xl flex flex-col items-center">
                        <span className="text-xs text-gray-400 uppercase font-bold">Total a Descontar</span>
                        <span className="text-3xl font-black text-red-400">R$ {calculatedDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <Button
                        onClick={() => onApplyDiscount(calculatedDiscount, `Desconto de Faltas (${missedDays}d, ${missedHours}h)`)}
                        className="w-full !bg-red-600 hover:!bg-red-500 font-bold"
                    >
                        Aplicar Desconto e Pagar Salário
                    </Button>
                </div>
            </div>
        </div>
    );
};
