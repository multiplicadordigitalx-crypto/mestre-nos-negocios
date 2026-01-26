import { db } from './firebase'; // Client SDK
import { collection, query, where, orderBy, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { WalletTransaction } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const paymentService = {
    /**
     * Inicia uma sessão de checkout no Stripe
     */
    async createCheckoutSession(params: {
        priceId?: string; // Para produtos recorrentes/fixos do Stripe
        productId?: string; // Mestre IA, Credits, etc.
        amount: number; // Valor em reais
        credits?: number; // Quantidade de créditos a adicionar
        userUid: string;
        userEmail?: string;
    }): Promise<{ sessionId: string, url: string }> {
        const response = await fetch(`${API_URL}/stripe/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: params.amount,
                currency: 'BRL',
                productId: params.productId || params.priceId || 'generic',
                credits: params.credits || 0,
                userUid: params.userUid,
                // Opcional: enviar email para pré-preencher no Stripe
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao iniciar pagamento');
        }

        return response.json();
    },

    /**
     * Busca o histórico de transações da carteira
     */
    async getWalletHistory(uid: string): Promise<WalletTransaction[]> {
        try {
            const historyRef = collection(db, 'wallet_transactions');
            const q = query(
                historyRef,
                where('userId', '==', uid),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as WalletTransaction));
        } catch (error) {
            console.error("Error fetching wallet history:", error);
            // Fallback gracefully or rethrow
            return [];
        }
    },

    /**
     * Ouve atualizações de saldo em tempo real (Wrapper conveniente)
     * Pode ser usado diretamente no componente ou via useAuth
     */
    subscribeToBalance(uid: string, callback: (balance: number) => void) {
        const userRef = doc(db, 'users', uid);
        return onSnapshot(userRef, (doc) => {
            const data = doc.data();
            callback(data?.creditBalance || 0);
        });
    }
};
