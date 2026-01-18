
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { X as XIcon, Download, Award, CheckCircle } from './Icons';
import { Student } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

interface CertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
}

const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, student }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleDownload = async () => {
        setIsGenerating(true);
        const element = document.getElementById('certificate-view');
        if (element) {
            try {
                // Capture the certificate div
                const canvas = await html2canvas(element, { 
                    scale: 2, // Higher scale for better resolution
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });
                
                const imgData = canvas.toDataURL('image/png');
                
                // Initialize PDF in landscape A4
                const pdf = new jsPDF('l', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                // Add image to PDF
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                
                // Save
                pdf.save(`Certificado_MD15X_${student.displayName?.replace(/\s+/g, '_')}.pdf`);
                toast.success("Certificado baixado com sucesso!");
            } catch (error) {
                console.error("Error generating PDF:", error);
                toast.error("Erro ao gerar o PDF. Tente novamente.");
            }
        }
        setIsGenerating(false);
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[70] p-4 overflow-y-auto">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="bg-gray-900 w-full max-w-5xl rounded-2xl border border-gray-700 relative shadow-2xl flex flex-col overflow-hidden"
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                >
                    <XIcon className="w-6 h-6" />
                </button>

                <div className="p-8 flex flex-col items-center text-center">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.5 }}
                        className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-yellow-500"
                    >
                        <Award className="w-10 h-10 text-yellow-500" />
                    </motion.div>

                    <h2 className="text-3xl font-bold text-white mb-2">Parabéns, {student.displayName?.split(' ')[0]}! 🎉</h2>
                    <p className="text-gray-400 mb-8">Você concluiu oficialmente o treinamento Multiplicador Digital 15X.</p>

                    {/* Certificate Preview Container - ID used for capture */}
                    <div className="relative mb-8 w-full max-w-4xl mx-auto shadow-2xl overflow-hidden rounded-xl">
                        <div id="certificate-view" className="bg-white text-black p-12 relative border-[12px] border-double border-gray-300 w-full aspect-[1.414/1]">
                            {/* Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                                <Award className="w-[500px] h-[500px]" />
                            </div>

                            <div className="relative z-10 h-full flex flex-col justify-between border-4 border-yellow-500/30 p-8">
                                <div className="text-center space-y-8">
                                    <div>
                                        <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 uppercase tracking-wider mb-2">Certificado</h1>
                                        <p className="text-2xl italic text-gray-600 font-serif">de Conclusão</p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <p className="text-gray-600 text-lg uppercase tracking-widest">Certificamos que</p>
                                        <h2 className="text-4xl md:text-5xl font-bold text-brand-secondary border-b-2 border-gray-300 pb-4 inline-block px-12 min-w-[50%]">
                                            {student.displayName?.toUpperCase()}
                                        </h2>
                                        <p className="text-gray-500 text-sm mt-2">CPF: {student.cpf || '***.***.***-**'}</p>
                                    </div>
                                    
                                    <p className="text-gray-700 text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                                        Concluiu com êxito o treinamento completo <br/>
                                        <strong className="text-black text-2xl">"Multiplicador Digital 15X"</strong>
                                        <br/><span className="text-base mt-2 block text-gray-600">Com aproveitamento de 100% nas aulas práticas e teóricas.</span>
                                    </p>
                                </div>

                                <div className="flex justify-between items-end w-full pt-12 px-8">
                                    <div className="text-center w-1/3">
                                        <p className="text-base font-bold text-gray-800">{new Date().toLocaleDateString()}</p>
                                        <div className="h-px w-full bg-gray-400 mt-2"></div>
                                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Data de Emissão</p>
                                    </div>
                                    
                                    <div className="w-1/3 flex justify-center -mb-4">
                                         {/* Seal */}
                                         <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white flex flex-col items-center justify-center border-4 border-yellow-700 shadow-xl relative">
                                             <div className="absolute inset-1 border border-white/50 rounded-full"></div>
                                             <Award className="w-12 h-12 mb-1" />
                                             <span className="text-[10px] font-bold tracking-widest uppercase">Certificado</span>
                                             <span className="text-sm font-black">OFICIAL</span>
                                         </div>
                                    </div>

                                    <div className="text-center w-1/3">
                                        <p className="font-signature text-3xl text-gray-900 transform -rotate-2 mb-[-10px]">Mestre dos Negócios</p>
                                        <div className="h-px w-full bg-gray-400 mt-4"></div>
                                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Diretor Acadêmico</p>
                                    </div>
                                </div>
                                
                                <div className="absolute bottom-2 left-0 w-full text-center">
                                     <p className="text-[10px] text-gray-400 font-mono">
                                         Autenticidade: MD15X-{student.uid.substring(0,8).toUpperCase()}-{Date.now().toString().substring(6)}
                                     </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
                        <Button 
                            onClick={handleDownload} 
                            disabled={isGenerating}
                            className="flex-1 !py-4 !text-base !bg-yellow-500 hover:!bg-yellow-400 text-black font-bold shadow-lg shadow-yellow-500/20"
                        >
                            {isGenerating ? (
                                <span className="flex items-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div> Gerando PDF...</span>
                            ) : (
                                <span className="flex items-center"><Download className="w-5 h-5 mr-2" /> BAIXAR PDF ORIGINAL</span>
                            )}
                        </Button>
                        <Button variant="secondary" onClick={onClose} className="flex-1 !py-4">
                            Fechar
                        </Button>
                    </div>
                </div>
            </motion.div>
            
            {/* CSS for Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
                .font-signature { font-family: 'Great Vibes', cursive; }
                .font-serif { font-family: 'Playfair Display', serif; }
            `}</style>
        </div>
    );
};

export default CertificateModal;
