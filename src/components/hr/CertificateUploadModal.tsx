import React, { useState } from 'react';
import Button from '../Button';
import { Upload, FileText, CheckCircle, AlertTriangle, Scan, X } from '../Icons';
import { uploadMedicalCertificate } from '../../services/mockFirebase';
import { toast } from 'react-hot-toast';

interface CertificateUploadModalProps {
    userId: string;
    userName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const CertificateUploadModal: React.FC<CertificateUploadModalProps> = ({ userId, userName, onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [step, setStep] = useState<'upload' | 'scanning' | 'confirm'>('upload');
    const [ocrResult, setOcrResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStep('scanning');
            simulateOCR(e.target.files[0]);
        }
    };

    const simulateOCR = async (f: File) => {
        // Mocking the service call directly here for the specific "Scanning" UI effect
        setTimeout(async () => {
            try {
                const result = await uploadMedicalCertificate(f, userId, userName);
                setOcrResult(result);
                setStep('confirm');
            } catch (e) {
                toast.error("Erro ao processar imagem.");
                setStep('upload');
            }
        }, 2500); // 2.5s scanning effect
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-800 w-full max-w-lg rounded-xl p-6 border border-gray-700 shadow-2xl animate-fade-in-up">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        <FileText className="text-brand-primary w-6 h-6" />
                        Enviar Atestado Médico
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                {step === 'upload' && (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-10 hover:border-brand-primary/50 transition-colors bg-gray-900/50">
                        <Upload className="w-12 h-12 text-gray-500 mb-4" />
                        <label className="cursor-pointer">
                            <span className="bg-brand-primary text-black font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-all">
                                Selecionar Arquivo/Foto
                            </span>
                            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                        </label>
                        <p className="text-gray-500 text-xs mt-4 text-center">
                            Formatos suportados: JPG, PNG, PDF.<br />
                            Certifique-se que a imagem está nítida para o Leitor Inteligente (OCR).
                        </p>
                    </div>
                )}

                {step === 'scanning' && (
                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-4 border-gray-700 rounded-lg"></div>
                            <div className="absolute inset-x-0 h-1 bg-brand-primary/80 shadow-[0_0_10px_#00ff00] animate-scan-y top-0"></div>
                            <Scan className="w-full h-full text-gray-500 p-2 opacity-50" />
                        </div>
                        <div>
                            <h4 className="text-brand-primary font-bold animate-pulse">Analisando Documento...</h4>
                            <p className="text-gray-400 text-xs mt-1">Nossa IA está identificando o médico, CRM e dias de afastamento.</p>
                        </div>
                    </div>
                )}

                {step === 'confirm' && ocrResult && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl">
                            <h4 className="text-green-400 font-bold text-sm flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4" /> Leitura Concluída com Sucesso!
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                                    <span className="text-gray-500 block">Médico Identificado</span>
                                    <span className="text-white font-bold">{ocrResult.ocrData.doctorName}</span>
                                </div>
                                <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                                    <span className="text-gray-500 block">CRM</span>
                                    <span className="text-white font-bold">{ocrResult.ocrData.crm}</span>
                                </div>
                                <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                                    <span className="text-gray-500 block">Dias de Afastamento</span>
                                    <span className="text-brand-primary font-bold text-lg">{ocrResult.ocrData.daysOff} dias</span>
                                </div>
                                <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                                    <span className="text-gray-500 block">CID</span>
                                    <span className="text-white font-bold">{ocrResult.ocrData.cid}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-900/10 border border-yellow-500/10 p-3 rounded-lg flex gap-3 items-start">
                            <AlertTriangle className="w-4 h-4 text-yellow-500shrink-0 mt-0.5" />
                            <p className="text-[10px] text-yellow-200/70">
                                As informações acima foram extraídas automaticamente. Ao confirmar, o atestado será enviado para auditoria do setor Financeiro/RH. O arquivo original também será anexado.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="secondary" onClick={() => setStep('upload')} className="flex-1">
                                Tentar Outra Foto
                            </Button>
                            <Button onClick={() => { onSuccess(); onClose(); toast.success("Atestado enviado para aprovação!"); }} className="flex-1 !bg-green-600 hover:!bg-green-500">
                                Confirmar Envio
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
