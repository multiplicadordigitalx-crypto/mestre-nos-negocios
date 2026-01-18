
import { useAuth } from './useAuth';
import { Student } from '../types';
import { useMemo } from 'react';

export const useAlunoData = () => {
    const { user, renewAccess, loading, refreshUser, isImpersonating, stopImpersonation } = useAuth();
    
    // Casting seguro. Nota: Se o usuário for equipe, ele não terá campos de Student.
    const student = user as Student;

    const subscriptionStatus = useMemo(() => {
        // Se não houver data de compra (usuário de equipe ou admin), retornamos um estado "eterno" seguro.
        if (!user?.purchaseDate) {
            return { 
                daysRemaining: 9999, 
                isRenewPeriod: false, 
                isExpired: false, 
                isRefunded: false,
                expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10),
                daysSincePurchase: 0
            };
        }
        
        const purchaseDate = new Date(user.purchaseDate);
        const now = new Date();
        const diffTime = now.getTime() - purchaseDate.getTime();
        const daysSincePurchase = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const validityDays = 365;
        const daysRemaining = validityDays - daysSincePurchase;
        const isExpired = daysRemaining < 0;
        const isRenewPeriod = daysRemaining <= 30 && !isExpired;
        const isRefunded = student?.financial?.status === 'refunded';
        
        return {
            daysSincePurchase,
            daysRemaining,
            isExpired,
            isRenewPeriod,
            isRefunded,
            expirationDate: new Date(purchaseDate.getTime() + (365 * 24 * 60 * 60 * 1000))
        };
    }, [user, student]);

    return {
        student,
        loading,
        subscriptionStatus,
        actions: {
            renewAccess,
            refreshUser,
            stopImpersonation
        },
        isImpersonating
    };
};
