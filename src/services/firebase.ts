import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";
import { Student, User, AppProduct, TrainingModule } from '../types';
import {
    getAppProducts,
    getTrainingModules,
    mockStudents,
    signInWithGoogle as mockSignIn,
    createAccountAfterPurchase as mockCreateAccount,
    signOut as mockSignOut
} from './mockFirebase';

// Firebase production configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);

// Services
import { httpsCallable } from "firebase/functions";
import { doc, setDoc, collection } from "firebase/firestore";

export const publishProduct = async (product: AppProduct) => {
    // 1. Logic for Stripe Automation
    const syncStripe = httpsCallable(functions, 'syncProductToStripe');

    try {
        const stripeResult: any = await syncStripe({ productData: product });

        if (stripeResult.data.success) {
            // Update product with Stripe data
            const updatedProduct = {
                ...product,
                stripeProductId: stripeResult.data.stripeProductId,
                checkoutLinks: stripeResult.data.plans.map((p: any) => ({
                    id: p.planId,
                    platform: 'Stripe',
                    url: p.checkoutUrl,
                    active: true
                }))
            };

            // 2. Save to Firestore
            const productRef = doc(collection(db, 'products'), updatedProduct.id);
            await setDoc(productRef, updatedProduct);

            return updatedProduct;
        }
        throw new Error("Stripe sync failed");
    } catch (error: any) {
        console.error("Publishing error:", error);
        throw error;
    }
};

export const signInWithGoogle = mockSignIn; // Keep mocks for logic flow during transition if needed
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
