import React from 'react';
import TrainingPage from '../../TrainingPage';
import { StudentPage } from '../../../types';

interface TreinamentosSectionProps {
    navigateTo: (page: StudentPage) => void;
}

export const TreinamentosSection: React.FC<TreinamentosSectionProps> = ({ navigateTo }) => {
    return (
        <div className="w-full">
            <TrainingPage navigateTo={navigateTo} />
        </div>
    );
};