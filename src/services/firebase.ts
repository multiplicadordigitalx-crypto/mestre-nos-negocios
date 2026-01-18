// Firebase is disabled due to missing dependencies in this environment.
// Using mock implementations instead.

import { Student, User, AppProduct, TrainingModule } from '../types';
import { 
    getAppProducts, 
    getTrainingModules, 
    getSalesTeam, 
    getTeamUsers, 
    getInfluencers,
    mockStudents,
    signInWithGoogle as mockSignIn, 
    createAccountAfterPurchase as mockCreateAccount, 
    signOut as mockSignOut
} from './mockFirebase';

// Dummy exports for missing modules
export const db = {} as any;
export const auth = {} as any;
export const functions = {} as any;
export const storage = {} as any;
export const analytics = {} as any;

export const signInWithGoogle = mockSignIn;
export const signOut = mockSignOut;
export const createAccountAfterPurchase = mockCreateAccount;

// Data Fetching Mocks
export const getStudentsPaginated = async (limitCount: number = 20, startAfterId?: string) => {
    // Basic pagination mock using the mockStudents array
    let startIndex = 0;
    if (startAfterId) {
        const idx = mockStudents.findIndex(s => s.uid === startAfterId);
        if (idx !== -1) startIndex = idx + 1;
    }
    const page = mockStudents.slice(startIndex, startIndex + limitCount);
    const lastId = page.length > 0 ? page[page.length - 1].uid : undefined;
    return { students: page, lastId };
};

export const searchStudents = async (term: string): Promise<Student[]> => {
    const lowerTerm = term.toLowerCase();
    return mockStudents.filter(s => 
        (s.displayName || '').toLowerCase().includes(lowerTerm) ||
        (s.email || '').toLowerCase().includes(lowerTerm) ||
        (s.cpf || '').includes(term)
    );
};

export const getRealAppProducts = async (): Promise<AppProduct[]> => {
    return getAppProducts();
};

export const getRealTrainingModules = async (): Promise<TrainingModule[]> => {
    return getTrainingModules();
};

export const seedDatabase = async (): Promise<{ success: boolean; message: string }> => {
    console.log("Seed database called in mock mode.");
    return { success: true, message: "Mock Database seeded (simulated)." };
};

export const recalculateStudentSlots = async (uid: string) => {
    console.log("Recalculate slots called for", uid);
};

export const uploadFileToStorage = async (file: File, onProgress: (p: number, s: string) => void): Promise<string> => {
    // Simulating upload
    return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            onProgress(progress, 'Uploading...');
            if (progress >= 100) {
                clearInterval(interval);
                resolve(URL.createObjectURL(file));
            }
        }, 200);
    });
};
