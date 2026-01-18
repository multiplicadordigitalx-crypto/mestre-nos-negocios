
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { LockClosed, LogOut, Info } from '@/components/Icons';
import { SalesPerson } from '@/types';
import toast from 'react-hot-toast';
import { updateSalesPerson } from '@/services/mockFirebase';

interface CompletionWizardProps {
    salesPerson: SalesPerson;
    onComplete: (data: Partial<SalesPerson>) => void;
    onLogout: () => void;
}

export const CompletionWizard: React.FC<CompletionWizardProps> = ({ salesPerson, onComplete, onLogout }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        cpf: salesPerson.cpf || '',
        cnpj: salesPerson.cnpj || '',
        phone: salesPerson.phone || '',
        zipCode: salesPerson.zipCode || '',
        address: salesPerson.address || '',
        addressNumber: salesPerson.addressNumber || '',
        district: salesPerson.district || '',
        city: salesPerson.city || '',
        state: salesPerson.state || '',
        bankName: salesPerson.bankName || '',
        bankAgency: salesPerson.bankAgency || '',
        bankAccount: salesPerson.bankAccount || '',
        pixKey: salesPerson.pixKey || '',
        pixKeyType: salesPerson.pixKeyType || 'cpf'
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (step === 1) {
            if (!formData.cpf || !formData.phone) return toast.error("CPF e Telefone são obrigatórios.");
            setStep(2);
        } else if (step === 2) {
            if (!formData.zipCode || !formData.address || !formData.addressNumber || !formData.city) return toast.error("Preencha o endereço completo.");
            setStep(3);
        } else {
            if (!formData.bankName || !formData.bankAgency || !formData.bankAccount || !formData.pixKey) return toast.error("Preencha todos os dados bancários.");
            setLoading(true);
            try {
                await updateSalesPerson(salesPerson.uid, { ...formData, registrationCompleted: true });
                toast.success("Perfil concluído! Sua conta está 100% pronta.");
                onComplete(formData);
            } catch (e) {
                toast.error("Erro ao salvar.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-800 w-full max-w-xl rounded-2xl border border-brand-primary/30 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <LockClosed className="w-5 h-5 text-yellow-500" /> Concluir Cadastro Obrigatório
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Sua responsabilidade: Dados necessários para afiliação em marketplaces.</p>
                    </div>
                    <button onClick={onLogout} className="text-gray-500 hover:text-red-400 flex items-center gap-1 text-xs">
                        <LogOut className="w-4 h-4" /> Sair
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="flex gap-2 mb-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`flex-1 h-1.5 rounded-full ${step >= i ? 'bg-brand-primary' : 'bg-gray-700'}`}></div>
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in">
                            <h4 className="text-white font-bold mb-4">1. Identificação e Contato</h4>
                            <Input label="CPF (Apenas números)*" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} placeholder="000.000.000-00" />
                            <Input label="CNPJ (Opcional)" value={formData.cnpj} onChange={e => setFormData({ ...formData, cnpj: e.target.value })} placeholder="00.000.000/0000-00" />
                            <Input label="WhatsApp Principal*" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="5511999991111" />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-fade-in">
                            <h4 className="text-white font-bold mb-4">2. Endereço Residencial</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="CEP*" value={formData.zipCode} onChange={e => setFormData({ ...formData, zipCode: e.target.value })} />
                                <Input label="Cidade*" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2"><Input label="Rua/Logradouro*" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /></div>
                                <Input label="Número*" value={formData.addressNumber} onChange={e => setFormData({ ...formData, addressNumber: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Bairro*" value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} />
                                <Input label="Estado (UF)*" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} maxLength={2} />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-fade-in">
                            <h4 className="text-white font-bold mb-4">3. Dados Bancários para Recebimento</h4>
                            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/20 flex gap-2 items-start mb-4">
                                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                                <p className="text-[10px] text-blue-200">Estes dados são usados para o Split Automático nas vendas dos produtos que você recuperar.</p>
                            </div>
                            <Input label="Banco*" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} placeholder="Ex: Nubank" />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Agência*" value={formData.bankAgency} onChange={e => setFormData({ ...formData, bankAgency: e.target.value })} />
                                <Input label="Conta*" value={formData.bankAccount} onChange={e => setFormData({ ...formData, bankAccount: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Tipo de Chave PIX*</label>
                                <select className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm outline-none" value={formData.pixKeyType} onChange={e => setFormData({ ...formData, pixKeyType: e.target.value as any })}>
                                    <option value="cpf">CPF</option><option value="email">E-mail</option><option value="phone">Celular</option><option value="random">Aleatória</option>
                                </select>
                            </div>
                            <Input label="Chave PIX*" value={formData.pixKey} onChange={e => setFormData({ ...formData, pixKey: e.target.value })} />
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-700 bg-gray-900/50 flex gap-3">
                    {step > 1 && <Button variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">Voltar</Button>}
                    <Button onClick={handleSave} isLoading={loading} className="flex-1 !bg-green-600 hover:!bg-green-500 font-bold">
                        {step === 3 ? 'CONCLUIR E ATIVAR PAINEL' : 'PRÓXIMO PASSO'}
                    </Button>
                </div>
            </motion.div>
        </div>
    )
};
