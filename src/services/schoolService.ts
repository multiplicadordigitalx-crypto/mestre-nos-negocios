
import {
    collection, doc, getDoc, setDoc, query, where, getDocs, updateDoc, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import { SchoolConfig, SupportTeamMember } from '../types/School';
import { toast } from 'react-hot-toast';

// --- HELPER: Niche Presets ---
export const getSchoolConfigByNiche = (niche: string): Partial<SchoolConfig> => {
    // Default Generic
    let theme = {
        primaryColor: '#FACC15',
        secondaryColor: '#111827',
        logoUrl: '',
        faviconUrl: ''
    };

    if (niche?.toLowerCase().includes('fitness')) {
        theme = { ...theme, primaryColor: '#22c55e' }; // Green
    } else if (niche?.toLowerCase().includes('law') || niche?.toLowerCase().includes('juridico')) {
        theme = { ...theme, primaryColor: '#1d4ed8' }; // Blue
    } else if (niche?.toLowerCase().includes('marketing')) {
        theme = { ...theme, primaryColor: '#ec4899' }; // Pink
    }

    return {
        theme,
        features: {
            enableMestreIA: true,
            enableNexusPlayer: true,
            enableGamification: true,
            enableStore: true,
            enableCommunity: true,
            enableLiveEvents: true
        },
        menuConfig: [] // Defaults will be handled by UI
    };
};

export const schoolService = {
    // --- WHITE LABEL RESOLUTION ---

    // Get School by Subdomain (e.g. "joao-fitness.mestrenosnegocios.com")
    async getSchoolBySubdomain(subdomain: string): Promise<SchoolConfig | null> {
        try {
            const q = query(collection(db, 'school_configs'), where('subdomain', '==', subdomain));
            const snap = await getDocs(q);
            if (snap.empty) return null;
            return { id: snap.docs[0].id, ...snap.docs[0].data() } as SchoolConfig;
        } catch (error) {
            console.error("Error finding school:", error);
            return null;
        }
    },

    // Get School by Owner ID (Producer Dashboard)
    async getSchoolByOwner(ownerId: string): Promise<SchoolConfig | null> {
        try {
            const q = query(collection(db, 'school_configs'), where('ownerId', '==', ownerId));
            const snap = await getDocs(q);
            if (snap.empty) return null;
            return { id: snap.docs[0].id, ...snap.docs[0].data() } as SchoolConfig;
        } catch (error) {
            console.error("Error getting producer school:", error);
            return null;
        }
    },

    // --- CONFIGURATION MANAGEMENT ---

    async createOrUpdateSchool(config: Partial<SchoolConfig> & { ownerId: string }) {
        if (!config.ownerId) throw new Error("Owner ID required");

        // Check if exists
        const existing = await schoolService.getSchoolByOwner(config.ownerId);
        const schoolId = existing ? existing.id : `school_${config.ownerId}`;
        const ref = doc(db, 'school_configs', schoolId);

        try {
            await setDoc(ref, {
                ...config,
                id: schoolId,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            return schoolId;
        } catch (error) {
            console.error("Error saving school:", error);
            toast.error("Erro ao salvar escola");
            throw error;
        }
    },

    // --- TEAM MANAGEMENT ---

    async inviteTeamMember(schoolId: string, email: string, role: SupportTeamMember['role']) {
        const member: SupportTeamMember = {
            userId: '', // Will be linked when they accept/login
            email,
            name: '', // Pending
            role,
            status: 'pending',
            permissions: {
                canEditContent: role !== 'support',
                canViewFinance: role === 'admin',
                canReplyStudents: true
            }
        };

        const ref = doc(db, 'school_configs', schoolId);
        await updateDoc(ref, {
            supportTeam: arrayUnion(member)
        });
    },

    async removeTeamMember(schoolId: string, email: string) {
        // Firestore arrayRemove requires exact object match, easier to read-modify-write for complex objects
        // For now, using a simplified approach assuming we can match by email in a transaction in real production
        // This is a simplified "read-filter-update" approach:
        const ref = doc(db, 'school_configs', schoolId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const data = snap.data() as SchoolConfig;
            const updatedTeam = data.supportTeam.filter(m => m.email !== email);
            await updateDoc(ref, { supportTeam: updatedTeam });
        }
    }
};
