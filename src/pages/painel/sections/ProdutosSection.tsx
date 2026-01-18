
import React from 'react';
import ProductsPage from '../../ProductsPage';
import { StudentPage } from '../../../types';

interface ProdutosSectionProps {
    navigateTo: (page: StudentPage) => void;
}

export const ProdutosSection: React.FC<ProdutosSectionProps> = ({ navigateTo }) => {
    return (
        <div className="w-full h-full">
            <ProductsPage navigateTo={navigateTo} />
        </div>
    );
};
