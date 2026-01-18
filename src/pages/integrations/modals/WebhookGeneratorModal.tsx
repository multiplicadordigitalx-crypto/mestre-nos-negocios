
import React, { useState } from 'react';
import Button from '../../../components/Button';
import { X as XIcon, Terminal, Code, Server } from '../../../components/Icons';
import { callMestreIA } from '../../../services/mestreIaService';
import toast from 'react-hot-toast';

interface WebhookGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WebhookGeneratorModal: React.FC<WebhookGeneratorModalProps> = ({ isOpen, onClose }) => {
    const [docs, setDocs] = useState('');
    const [codeResult, setCodeResult] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!docs.trim()) return toast.error("Cole a documentação primeiro.");
        setLoading(true);
        try {
            const res = await callMestreIA('dev_integrator', { docs });
            const cleanCode = res.output.replace(/```typescript/g, '').replace(/```javascript/g, '').replace(/```/g, '').trim();
            setCodeResult(cleanCode);
            toast.success("Código gerado com sucesso! Segurança garantida.");
        } catch (error) {
            toast.error("Erro ao gerar código.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[80] p-4">
            <div className="bg-gray-900 w-full max-w-4xl rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Terminal className="w-6 h-6 text-brand-primary"/> Assistente de Integração (Backend IA)
                    </h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-400 hover:text-white"/></button>
                </div>
                
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    <div className="flex-1 p-6 border-r border-gray-700 overflow-y-auto custom-scrollbar">
                        <p className="text-sm text-gray-400 mb-4">
                            Cole aqui a <strong>documentação</strong> ou o <strong>JSON de exemplo</strong> que o fornecedor te enviou. A IA vai escrever o código seguro para você.
                        </p>
                        <textarea 
                            className="w-full h-96 bg-black/50 border border-gray-600 rounded-xl p-4 text-white font-mono text-xs focus:border-brand-primary outline-none resize-none leading-relaxed"
                            placeholder={`Exemplo de JSON:\n{\n  "event": "PURCHASE_APPROVED",\n  "data": { "email": "cliente@email.com", "price": 97.00 }\n}`}
                            value={docs}
                            onChange={e => setDocs(e.target.value)}
                        />
                        <Button onClick={handleGenerate} isLoading={loading} className="w-full mt-4 !bg-brand-primary text-black hover:!bg-yellow-400 font-bold">
                            {loading ? 'Analisando Segurança & Gerando...' : 'GERAR CÓDIGO SEGURO'}
                        </Button>
                    </div>

                    <div className="flex-1 p-6 bg-[#1e1e1e] overflow-y-auto custom-scrollbar relative">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-blue-400 uppercase flex items-center gap-2">
                                <Code className="w-4 h-4"/> Código Gerado (Node.js)
                            </span>
                            {codeResult && (
                                <button onClick={() => { navigator.clipboard.writeText(codeResult); toast.success("Código copiado!"); }} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors">
                                    Copiar
                                </button>
                            )}
                        </div>
                        {codeResult ? (
                            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">{codeResult}</pre>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                                <Server className="w-12 h-12 mb-2"/>
                                <p className="text-xs text-center">O código gerado aparecerá aqui.<br/>Pronto para copiar e colar no seu backend.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
