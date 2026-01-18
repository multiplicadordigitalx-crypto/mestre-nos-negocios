
import React from 'react';
import { Student } from '../../../types';

interface ActiveProductsListProps {
  student: Student | null;
  navigateTo: (page: any) => void;
}

export const ActiveProductsList: React.FC<ActiveProductsListProps> = ({ student, navigateTo }) => {
  return (
    <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Meus Produtos Ativos</h3>
        <div className="space-y-2">
            {student?.productStats?.length ? student.productStats.map(p => (
                <div key={p.productId} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${p.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <div>
                            <p className="text-sm font-bold text-white">{p.productName}</p>
                            <p className="text-xs text-gray-500">{p.totalPosts} posts registrados</p>
                        </div>
                    </div>
                    <button className="text-xs text-brand-primary hover:underline" onClick={() => navigateTo('products')}>Ver Link</button>
                </div>
            )) : (
                <p className="text-xs text-gray-500 text-center py-2">Nenhum produto ativo.</p>
            )}
        </div>
    </div>
  );
};
