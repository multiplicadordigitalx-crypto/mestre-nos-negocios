
import React from 'react';
import ProfilePage from '../../ProfilePage';

interface PerfilSectionProps {
    onOpenRenewal: () => void;
}

export const PerfilSection: React.FC<PerfilSectionProps> = ({ onOpenRenewal }) => {
    return (
        <div className="w-full">
            <ProfilePage onOpenRenewal={onOpenRenewal} />
        </div>
    );
};
