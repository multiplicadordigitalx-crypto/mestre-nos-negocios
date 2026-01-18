
import React, { useState } from 'react';
import { X as XIcon, DollarSign, Calendar, Tag, FileText, Camera, RefreshCw, AlertCircle } from '@/components/Icons';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { toast } from 'react-hot-toast';
import { createPayable, simulateOCRProcessing, auditPayment, createAuditTicket } from '@/services/mockFirebase';

export const PayableModal: React.FC<{ onClose: () => void, onSave: () => void }> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({ description: '', amount: '', dueDate: '', category: 'Infraestrutura', type: 'fixed' as const });
    const [loading, setLoading] = useState(false);
    const [ocrFile, setOcrFile] = useState<File | null>(null);
    const [ocrProcessing, setOcrProcessing] = useState(false);
    const [ocrResult, setOcrResult] = useState<any>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setOcrFile(file);
        setOcrProcessing(true);
        try {
            const result = await simulateOCRProcessing(file);
            setOcrResult(result);
            setFormData(prev => ({
                ...prev,
                amount: result.extractedAmount.toString(),
                description: prev.description || result.extractedBeneficiary
            }));
            toast.success("Recibo processado via OCR!");
        } catch (error) {
            toast.error("Erro no processamento OCR");
        } finally {
            setOcrProcessing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const amountNum = parseFloat(formData.amount);
            const data = { ...formData, amount: amountNum, attachmentUrl: '#' };

            const newPayable = await createPayable(data);

            // If OCR was used, check for inconsistencies and create audit ticket if necessary
            if (ocrResult) {
                const auditStatus = auditPayment({ amount: amountNum }, ocrResult);
                if (auditStatus === 'inconsistent') {
                    await createAuditTicket({
                        paymentId: newPayable.id,
                        paymentType: 'payable',
                        agentId: 'current-user', // In real app, from auth
                        agentName: 'Agente Logado',
                        issueDescription: `Divergência OCR detectada: Valor Informado (R$ ${amountNum}) vs Extraído (R$ ${ocrResult.extractedAmount}). Inconsistências: ${ocrResult.inconsistencies?.join(', ')}`
                    });
                    toast.error("Alerta: Inconsistência detectada! Ticket de auditoria aberto.", { duration: 5000 });
                }
            }

            toast.success("Conta a pagar lançada!");
            onSave();
        } catch (error) {
            toast.error("Erro ao salvar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-gray-800 w-full max-w-md rounded-xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-white text-lg">Novo Lançamento (Contas a Pagar)</h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                <div className="mb-6">
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-2">Escaneamento OCR (Recibo)</label>
                    <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all text-center ${ocrFile ? 'border-green-500/50 bg-green-500/5' : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'}`}>
                        {ocrProcessing ? (
                            <div className="py-4 space-y-2">
                                <RefreshCw className="w-8 h-8 text-brand-primary animate-spin mx-auto" />
                                <p className="text-xs text-gray-400 font-mono animate-pulse">EXTRAINDO DADOS VIA IA...</p>
                            </div>
                        ) : (
                            <>
                                <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="space-y-1">
                                    <Camera className="w-6 h-6 text-gray-500 mx-auto" />
                                    <p className="text-xs text-gray-300 font-medium">{ocrFile ? ocrFile.name : 'Clique ou arraste o recibo'}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-tighter">PDF, JPG ou PNG</p>
                                </div>
                            </>
                        )}
                        {ocrResult && !ocrProcessing && (
                            <div className="mt-2 pt-2 border-t border-gray-700 flex items-center justify-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${ocrResult.auditStatus === 'consistent' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">OCR: R$ {ocrResult.extractedAmount}</p>
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Descrição" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                    <Input label="Valor (R$)" type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Vencimento" type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} required />
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Categoria</label>
                            <select
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm"
                                value={formData.category}
                                onChange={e => setFormData({ ...prev => ({ ...prev, category: e.target.value }) } as any)}
                            >
                                <option value="Infraestrutura">Infraestrutura</option>
                                <option value="Tecnologia">Tecnologia</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Recursos Humanos">Equipe</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
                        <label className="flex-1 flex items-center gap-2 cursor-pointer">
                            <input type="radio" checked={formData.type === 'fixed'} onChange={() => setFormData({ ...formData, type: 'fixed' })} className="text-brand-primary" />
                            <span className="text-sm text-gray-300">Custo Fixo</span>
                        </label>
                        <label className="flex-1 flex items-center gap-2 cursor-pointer">
                            <input type="radio" checked={formData.type === 'variable'} onChange={() => setFormData({ ...formData, type: 'variable' })} className="text-brand-primary" />
                            <span className="text-sm text-gray-300">Custo Variável</span>
                        </label>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                        <Button type="submit" isLoading={loading} className="flex-1 !bg-green-600 hover:!bg-green-500">
                            Confirmar Lançamento
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
