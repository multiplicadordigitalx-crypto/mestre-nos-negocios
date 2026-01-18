
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Server, Database, LockClosed } from '../../../../components/Icons';
import toast from 'react-hot-toast';

export const GuardianMonitor: React.FC = () => {
    const [status, setStatus] = useState<'secure' | 'scanning' | 'alert'>('scanning');
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        const cycle = () => {
            setStatus('scanning');
            setTimeout(() => {
                const random = Math.random();
                if (random > 0.95) {
                    setStatus('alert');
                    setAlertMessage('Anomalia detectada: Pico de latência API');
                    toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-red-900/90 border border-red-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3`}>
                            <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse"/>
                            <div>
                                <p className="font-bold text-sm">ALERTA GUARDIÃO</p>
                                <p className="text-xs">Falha detectada. Verificando...</p>
                            </div>
                        </div>
                    ));
                } else {
                    setStatus('secure');
                }
            }, 2000);
        };
        cycle();
        const interval = setInterval(cycle, 30000); 
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`w-full py-1.5 px-4 flex justify-between items-center text-xs font-bold uppercase tracking-widest border-b transition-colors duration-500 ${
            status === 'scanning' ? 'bg-blue-900/20 border-blue-500/30 text-blue-400' :
            status === 'alert' ? 'bg-red-900/30 border-red-500/50 text-red-400 animate-pulse' :
            'bg-green-900/10 border-green-500/20 text-green-500'
        }`}>
            <div className="flex items-center gap-2">
                <ShieldAlert className={`w-4 h-4 ${status === 'scanning' ? 'animate-spin-slow' : ''}`} />
                <span>GUARDIÃO IMPLACÁVEL: {status === 'scanning' ? 'ESCANEANDO SISTEMA...' : status === 'alert' ? alertMessage : 'SISTEMA SEGURO E BLINDADO'}</span>
            </div>
            <div className="hidden md:flex items-center gap-4">
                <span className="flex items-center gap-1"><Server className="w-3 h-3"/> API: OK</span>
                <span className="flex items-center gap-1"><Database className="w-3 h-3"/> DB: OK</span>
                <span className="flex items-center gap-1"><LockClosed className="w-3 h-3"/> SEC: OK</span>
                <span>{new Date().toLocaleTimeString()}</span>
            </div>
        </div>
    );
};
