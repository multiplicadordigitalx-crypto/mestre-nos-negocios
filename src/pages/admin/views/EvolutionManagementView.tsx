
import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Smartphone, Trash, AlertTriangle } from '../../../components/Icons';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { EvolutionSettings } from '../../../types';
import { getEvolutionSettings, saveEvolutionSettings, connectEvolutionInstance, logoutEvolutionInstance } from '../../../services/mockFirebase';
import toast from 'react-hot-toast';

const EvolutionManagementView: React.FC = () => {
    const [settings, setSettings] = useState<EvolutionSettings>({
        apiUrl: '', apiKey: '', instanceName: '', status: 'disconnected'
    });
    const [loading, setLoading] = useState(true);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [connectionLoading, setConnectionLoading] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const data = await getEvolutionSettings();
        setSettings(data);
        setLoading(false);
    };

    const handleSaveConfig = async () => {
        setLoading(true);
        try {
            await saveEvolutionSettings({ 
                apiUrl: settings.apiUrl, 
                apiKey: settings.apiKey, 
                instanceName: settings.instanceName 
            });
            toast.success("Configurações da API salvas!");
        } catch (e) {
            toast.error("Erro ao salvar configurações.");
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        setConnectionLoading(true);
        try {
            const qr = await connectEvolutionInstance(settings.instanceName);
            setQrCode(qr);
            toast("Aguardando leitura do QR Code...", { icon: '📱' });
            setTimeout(async () => {
                setQrCode(null);
                const newNumber = `5511${Math.floor(Math.random() * 900000000 + 100000000)}`;
                const updated = await saveEvolutionSettings({ 
                    status: 'connected', 
                    connectedNumber: newNumber, 
                    profileName: 'Novo Número Conectado', 
                    batteryLevel: 100 
                });
                setSettings(updated);
                toast.success("WhatsApp Conectado com Sucesso!");
            }, 3000);
        } catch (e) {
            toast.error("Erro ao gerar QR Code.");
        } finally {
            setConnectionLoading(false);
        }
    };

    const handleDisconnect = async () => {
        setConnectionLoading(true);
        try {
            const updatedSettings = await logoutEvolutionInstance(settings.instanceName);
            // Fix: Use functional update to ensure all properties are maintained if partial update is returned
            setSettings(prev => ({ ...prev, ...updatedSettings, status: 'disconnected' as const }));
            setQrCode(null); 
            toast.success("Instância desconectada. Conecte um novo número.");
        } catch (e) {
            toast.error("Erro ao desconectar.");
        } finally {
            setConnectionLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><LoadingSpinner/></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Smartphone className="w-6 h-6 text-green-400"/> Gestão Evolution API
                    </h2>
                    <p className="text-gray-400 text-sm">Gerencie a conexão do WhatsApp da plataforma.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${settings.status === 'connected' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
                        {settings.status === 'connected' ? 'Conectado' : 'Desconectado'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 border-l-4 border-l-green-500 flex flex-col h-full">
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">Status da Instância</h3>
                    
                    {settings.status === 'connected' ? (
                        <div className="space-y-4 flex-1">
                            <div className="bg-gray-800 p-4 rounded-xl border border-green-500/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black">
                                        <Smartphone className="w-6 h-6"/>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Número Conectado</p>
                                        <p className="text-xl font-bold text-white">{settings.connectedNumber}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Bateria</p>
                                    <p className="text-green-400 font-bold">{settings.batteryLevel}%</p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-900 p-3 rounded border border-gray-700">
                                <p className="text-xs text-gray-400">Nome do Perfil: <span className="text-white font-bold">{settings.profileName}</span></p>
                            </div>

                            <div className="mt-auto pt-4">
                                <Button 
                                    onClick={handleDisconnect} 
                                    isLoading={connectionLoading}
                                    className="w-full !bg-red-600 hover:!bg-red-500 text-white"
                                >
                                    <Trash className="w-4 h-4 mr-2"/> Desconectar / Trocar Número
                                </Button>
                                <p className="text-center text-xs text-gray-500 mt-2">Para trocar o número, desconecte o atual primeiro.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                            {!qrCode ? (
                                <>
                                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center border-2 border-dashed border-gray-600">
                                        <Smartphone className="w-8 h-8 text-gray-500"/>
                                    </div>
                                    <div>
                                        <p className="text-gray-300 font-medium">Nenhum WhatsApp conectado.</p>
                                        <p className="text-sm text-gray-500">Clique abaixo para gerar o QR Code.</p>
                                    </div>
                                    <Button onClick={handleConnect} isLoading={connectionLoading} className="!bg-green-600 hover:!bg-green-500">
                                        Conectar WhatsApp
                                    </Button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center animate-fade-in">
                                    <p className="text-white font-bold mb-4">Escaneie o QR Code no seu WhatsApp</p>
                                    <div className="bg-white p-2 rounded-lg">
                                        <img src={qrCode} alt="QR Code" className="w-48 h-48"/>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-4 animate-pulse">Aguardando leitura...</p>
                                    <Button variant="secondary" onClick={() => setQrCode(null)} className="mt-4">Cancelar</Button>
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                <Card className="p-6 h-full">
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">Configurações da API</h3>
                    <div className="space-y-4">
                        <Input 
                            label="URL da API Evolution" 
                            value={settings.apiUrl} 
                            onChange={e => setSettings({...settings, apiUrl: e.target.value})}
                            placeholder="https://api.seudominio.com"
                        />
                        <Input 
                            label="Global API Key" 
                            type="password"
                            value={settings.apiKey} 
                            onChange={e => setSettings({...settings, apiKey: e.target.value})}
                            placeholder="Chave Global"
                        />
                        <Input 
                            label="Nome da Instância" 
                            value={settings.instanceName} 
                            onChange={e => setSettings({...settings, instanceName: e.target.value})}
                            placeholder="Ex: MestreBot"
                        />
                        
                        <div className="bg-blue-900/20 border border-blue-500/20 p-3 rounded text-xs text-blue-300 flex gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0"/>
                            <p>Estas configurações são usadas para conectar o painel à sua instância do Evolution API. Alterar estes dados pode interromper o serviço de chat.</p>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSaveConfig} isLoading={loading}>Salvar Configurações</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default EvolutionManagementView;
