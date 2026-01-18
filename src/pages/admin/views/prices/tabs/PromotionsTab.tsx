
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../../../components/Card';
import Button from '../../../../../components/Button';
import Input from '../../../../../components/Input';
import { 
    PlusCircle, Trash, Copy, Calendar, Tag, 
    ShoppingBag, X as XIcon 
} from '../../../../../components/Icons';
import toast from 'react-hot-toast';
import { Coupon } from '../types';

export const PromotionsTab: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([
        { id: '1', code: 'MESTRE10', discount: 10, type: 'percentage', product: 'Todos', uses: 142, limit: null, expiration: '2025-12-31', status: 'active' },
        { id: '2', code: 'BLACKFRIDAY', discount: 50, type: 'percentage', product: 'Mestre 15X', uses: 500, limit: 500, expiration: '2023-11-30', status: 'expired' }
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({ code: '', discount: 10, type: 'percentage', product: 'Todos', limit: 100, expiration: '' });

    const handleSave = () => {
        if (!newCoupon.code || !newCoupon.discount || !newCoupon.expiration) return toast.error("Preencha campos obrigatórios.");
        setCoupons(prev => [{ ...newCoupon, id: `cp-${Date.now()}`, uses: 0, status: 'active' } as Coupon, ...prev]);
        setIsModalOpen(false);
        toast.success("Cupom criado!");
    };

    const handleDelete = (id: string) => {
        if(confirm("Excluir cupom?")) {
            setCoupons(prev => prev.filter(c => c.id !== id));
            toast.success("Cupom excluído.");
        }
    }

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Código copiado!");
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Cupons de Desconto</h3>
                <Button onClick={() => setIsModalOpen(true)} className="!bg-pink-600 hover:!bg-pink-500"><PlusCircle className="w-4 h-4 mr-2"/> Criar Cupom</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map(coupon => (
                    <Card key={coupon.id} className={`p-0 overflow-hidden border ${coupon.status === 'active' ? 'border-pink-500/30' : 'border-gray-700 opacity-70'} relative group`}>
                        <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-1 flex items-center gap-2 cursor-pointer hover:border-pink-500 transition-colors" onClick={() => copyCode(coupon.code)}>
                                    <span className="text-lg font-mono font-black text-white tracking-widest">{coupon.code}</span>
                                    <Copy className="w-3 h-3 text-gray-500"/>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${coupon.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{coupon.status}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-4xl font-black text-pink-500">{coupon.discount}%</span>
                                <div className="flex flex-col"><span className="text-xs font-bold text-white uppercase">OFF</span><span className="text-[10px] text-gray-500">Desconto</span></div>
                            </div>
                            <div className="space-y-2 text-xs text-gray-400 border-t border-gray-700/50 pt-4 border-dashed">
                                <div className="flex justify-between"><span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3"/> Produto:</span><span className="text-white font-medium">{coupon.product}</span></div>
                                <div className="flex justify-between"><span className="flex items-center gap-1"><Tag className="w-3 h-3"/> Usos:</span><span className="text-white font-medium">{coupon.uses} / {coupon.limit === null ? '∞' : coupon.limit}</span></div>
                                <div className="flex justify-between"><span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> Expira em:</span><span className="text-white font-medium">{new Date(coupon.expiration).toLocaleDateString()}</span></div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-end">
                                <button onClick={() => handleDelete(coupon.id)} className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-900/10 transition-colors"><Trash className="w-4 h-4"/></button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
                    <div className="bg-gray-800 w-full max-w-lg rounded-2xl border border-pink-500/30 shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><PlusCircle className="w-6 h-6 text-pink-500"/> Criar Cupom</h3>
                            <button onClick={() => setIsModalOpen(false)}><XIcon className="w-5 h-5 text-gray-400 hover:text-white"/></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Código" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} className="!uppercase font-mono" />
                                <Input label="Desconto (%)" type="number" value={newCoupon.discount} onChange={e => setNewCoupon({...newCoupon, discount: Number(e.target.value)})} />
                            </div>
                            <Input label="Expiração" type="date" value={newCoupon.expiration} onChange={e => setNewCoupon({...newCoupon, expiration: e.target.value})} />
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Limite</label><input type="number" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none" value={newCoupon.limit || ''} onChange={e => setNewCoupon({...newCoupon, limit: e.target.value ? Number(e.target.value) : null})} placeholder="Vazio = Ilimitado"/></div>
                                <div><label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Produto</label><select className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none" value={newCoupon.product} onChange={e => setNewCoupon({...newCoupon, product: e.target.value})}><option>Todos</option><option>Mestre 15X</option></select></div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8 pt-4 border-t border-gray-700">
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button>
                            <Button onClick={handleSave} className="flex-1 !bg-pink-600 hover:!bg-pink-500 font-bold">Salvar Cupom</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
