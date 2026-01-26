import { db } from './firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, ProducerBankData } from '../types';
import { toast } from 'react-hot-toast';

export const userService = {
    /**
     * Get user profile by UID
     */
    async getUserProfile(uid: string): Promise<User | null> {
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data() as User;
            }
            return null;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    },

    /**
     * Update generic user profile data
     */
    async updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
        try {
            const docRef = doc(db, 'users', uid);
            await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    },

    /**
     * Update Producer Compliance Data
     */
    async updateUserProducerData(uid: string, producerData: ProducerBankData): Promise<void> {
        try {
            const docRef = doc(db, 'users', uid);
            await updateDoc(docRef, {
                producerData: {
                    ...producerData,
                    updatedAt: new Date().toISOString() // Store as ISO string for consistency with front-end types often
                },
                updatedAt: serverTimestamp()
            });
            console.log("Producer data updated for", uid);
        } catch (error) {
            console.error("Error updating producer data:", error);
            throw error;
        }
    }
};

// Backwards compatibility / Migration helpers
// These replicate the mockFirebase signatures but use the real DB

export const updateStudent = async (uid: string, data: Partial<User>) => {
    return userService.updateUserProfile(uid, data);
};

export const updateUserProducerData = async (uid: string, data: ProducerBankData) => {
    return userService.updateUserProducerData(uid, data);
};
