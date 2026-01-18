import React from 'react';
import SupportPage from '../../SupportPage';

export const SupportSection: React.FC<{ influencer: any }> = ({ influencer }) => {
    return (
        <div className="h-full">
            <SupportPage userOverride={influencer} />
        </div>
    );
};