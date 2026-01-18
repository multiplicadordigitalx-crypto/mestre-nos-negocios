
import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { X as XIcon, Facebook, Google, Instagram, Tiktok, Youtube } from '../../../components/Icons';
import { getAppProducts } from '../../../services/mockFirebase';
import toast from 'react-hot-toast';

interface ConnectAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: (data: any) => void;
}

export const ConnectAccountModal: React.FC<ConnectAccountModalProps> = ({ isOpen, onClose, onConnect }) => {
    const [platform, setPlatform] = useState('Instagram');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [productList, setProductList] = useState<string[]>([]);
    const [isProductListOpen, setIsProductListOpen] = useState(false);

    useEffect(() => {
        if(isOpen) {
             getAppProducts().then(prods => {
                 setProductList(prods.map(p => p.name));
             });
        }
    }, [isOpen]);

    const filteredProducts = productList.filter(p => p.toLowerCase().includes(productSearch.toLowerCase()));

    if (!isOpen) return null;

    const handleConnect = () => {
        if (!username) return toast.error("Digite o usuário");
        if (!productSearch) return toast.error("Vincule a um produto");
        if (!password) return toast.error("Senha da plataforma obrigatória");

        onConnect({ platform, username, product: productSearch, password });
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4">
            <div className="bg-gray-800 w-full max-w-md rounded-xl p-6 border border-gray-700 relative z-[71]">
                <h3 className="font-bold text-white text-lg mb-4">Conectar Nova Conta</h3>
                <div className="space-y-4">
                    
                    {/* 1. PRODUCT SELECTION */}
                    <div className="relative">
                        <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">1. Vincular ao Produto (Obrigatório)</label>
                        <input 
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white outline-none focus:border-brand-primary placeholder-gray-500 text-sm"
                            placeholder="Buscar ou criar produto..."
                            value={productSearch}
                            onChange={e => {
                                setProductSearch(e.target.value);
                                setIsProductListOpen(true);
                            }}
                            onFocus={() => setIsProductListOpen(true)}
                            onBlur={() => setTimeout(() => setIsProductListOpen(false), 200)}
                        />
                        {isProductListOpen && filteredProducts.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-gray-800 border border-gray-600 rounded-lg mt-1 max-h-40 overflow-y-auto custom-scrollbar z-50 shadow-xl">
                                {filteredProducts.map((p, idx) => (
                                    <div 
                                        key={idx} 
                                        className="p-2 hover:bg-gray-700 cursor-pointer text-sm text-gray-300"
                                        onClick={() => setProductSearch(p)}
                                    >
                                        {p}
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-[10px] text-gray-500 mt-1">
                            Se não encontrar na lista, digite o nome para criar um novo.
                        </p>
                    </div>

                    {/* 2. Platform Selection */}
                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">2. Plataforma</label>
                        <select 
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white outline-none"
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                        >
                            <option>Instagram</option>
                            <option>TikTok</option>
                            <option>Kwai</option>
                            <option>YouTube</option>
                            <option>Facebook</option>
                        </select>
                    </div>

                    {/* 3. Username */}
                    <Input label="3. Usuário (@)" value={username} onChange={e => setUsername(e.target.value)} placeholder="@seuusuario" />
                    
                    {/* 4. Password */}
                    <Input label="4. Senha de Login (Plataforma)" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha da conta" />

                    <Button onClick={handleConnect} className="w-full mt-4">Conectar</Button>
                    <Button variant="secondary" onClick={onClose} className="w-full">Cancelar</Button>
                </div>
            </div>
        </div>
    );
};
