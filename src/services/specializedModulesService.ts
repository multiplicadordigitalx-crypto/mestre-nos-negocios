
import {
    collection, addDoc, query, where, orderBy, getDocs, limit, serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { HealthLogEntry, PracticeSession } from '../types/school';

export const specializedService = {
    // --- HEALTH & MIND LOGS ---

    async logHealthEntry(studentId: string, entry: Partial<HealthLogEntry>) {
        try {
            const ref = collection(db, `health_logs/${studentId}/dailyEntries`);
            await addDoc(ref, {
                ...entry,
                createdAt: serverTimestamp(),
                date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
            });
            return true;
        } catch (error) {
            console.error("Error logging health entry:", error);
            return false;
        }
    },

    async getDailyHealthLog(studentId: string, date: string): Promise<HealthLogEntry | null> {
        try {
            const ref = collection(db, `health_logs/${studentId}/dailyEntries`);
            const q = query(ref, where('date', '==', date), limit(1));
            const snap = await getDocs(q);

            if (snap.empty) return null;
            return { id: snap.docs[0].id, ...snap.docs[0].data() } as HealthLogEntry;
        } catch (error) {
            console.error("Error fetching health log:", error);
            return null;
        }
    },

    // --- KNOWLEDGE LOGS (JURISTA/POLIGLOTA) ---

    async savePracticeSession(studentId: string, session: Partial<PracticeSession>) {
        try {
            const ref = collection(db, `knowledge_logs/${studentId}/practiceSessions`);
            await addDoc(ref, {
                ...session,
                createdAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error saving practice session:", error);
            return false;
        }
    },

    async getRecentSessions(studentId: string, moduleType: 'jurista' | 'poliglota', limitCount = 5) {
        try {
            const ref = collection(db, `knowledge_logs/${studentId}/practiceSessions`);
            const q = query(
                ref,
                where('moduleType', '==', moduleType),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as PracticeSession));
        } catch (error) {
            console.error("Error fetching sessions:", error);
            return [];
        }
    }
};
