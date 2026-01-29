import { db, auth } from './firebase';
import { collection, doc, getDocs, deleteDoc } from 'firebase/firestore';

export interface MarketingAccount {
    id: string;
    platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook';
    username: string;
    password?: string; // Will receive '***SECURE_STORED***' on fetch
    status: 'connected' | 'disconnected' | 'error';
    product: string;
    updatedAt: any;
    profileImage?: string;
    followersCount?: number;
}

// Helper to get Vault Path
const getVaultCollection = (uid: string) => {
    return collection(db, 'integrations', uid, 'providers', 'marketing_account', 'items');
};

export const getMarketingAccounts = async (): Promise<MarketingAccount[]> => {
    const user = auth.currentUser;
    if (!user) return [];

    try {
        const querySnapshot = await getDocs(getVaultCollection(user.uid));
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                password: '***SECURE_STORED***' // Masked for UI
            } as MarketingAccount;
        });
    } catch (error) {
        console.error("Vault Read Error (Marketing):", error);
        return [];
    }
};

export const saveMarketingAccount = async (account: MarketingAccount) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const response = await fetch('/api/vault/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            uid: user.uid,
            type: 'marketing_account', // Must match SENSITIVE_FIELDS key in api/vault/save.ts
            config: account
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Vault Save Failed");
    }

    return await response.json();
};

export const deleteMarketingAccount = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
        await deleteDoc(doc(getVaultCollection(user.uid), id));
    } catch (error) {
        console.error("Error deleting account:", error);
        throw error;
    }
};
