import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail as firebaseSendPasswordResetEmail, confirmPasswordReset as firebaseConfirmPasswordReset } from "firebase/auth";
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

// Verificar se as credenciais do Firebase estão configuradas
const hasFirebaseCredentials = !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
);

// Firebase production configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// Log de aviso se estiver usando modo mock
if (!hasFirebaseCredentials) {
    console.warn("⚠️ Credenciais do Firebase não configuradas. Usando modo MOCK para desenvolvimento.");
    console.warn("📝 Para usar Firebase real, crie um arquivo .env com as credenciais do Firebase.");
}

// Initialize Firebase (não inicializa se estiver em modo mock)
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let functions: any = null;
let analytics: any = null;

if (hasFirebaseCredentials) {
    try {
        app = initializeApp(firebaseConfig);
        analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        functions = getFunctions(app);
    } catch (error) {
        console.error("Erro ao inicializar Firebase:", error);
    }
}

export { auth, db, storage, functions, analytics };

// Services
import { httpsCallable } from "firebase/functions";
import { doc, setDoc, collection } from "firebase/firestore";

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const publishProduct = async (product: AppProduct) => {
    try {
        console.log("🚀 Publishing product via Vercel API:", product.name);

        // 1. Call Vercel API to create Stripe Resources
        const response = await fetch(`${API_URL}/stripe/create-product`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productData: product })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create product in Stripe');
        }

        const stripeResult = await response.json();

        // 2. Update local object with data from Stripe
        const updatedProduct: AppProduct = {
            ...product,
            stripeProductId: stripeResult.stripeProductId,
            checkoutLinks: stripeResult.checkoutLinks,
            status: 'active',
            updatedAt: new Date().toISOString() // Ensure date is updated
        };

        // 3. Save to Firestore
        const productRef = doc(collection(db, 'products'), updatedProduct.id);
        await setDoc(productRef, updatedProduct);

        return updatedProduct;
    } catch (error: any) {
        console.error("Publishing error:", error);
        throw error;
    }
};

// Auth Functions
export const signInWithGoogle = async () => {
    if (hasFirebaseCredentials && auth) {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return result.user;
    }
    return mockSignIn();
};

export const signInWithEmail = async (email: string, pass: string) => {
    if (hasFirebaseCredentials && auth) {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        return result.user;
    }
    throw new Error("MOCK_ONLY: Real email auth requires configuration.");
};

export const signOut = async () => {
    if (hasFirebaseCredentials && auth) {
        await firebaseSignOut(auth);
    } else {
        await mockSignOut();
    }
};

export const createAccountAfterPurchase = mockCreateAccount;

export const resetPassword = async (email: string) => {
    if (hasFirebaseCredentials && auth) {
        await firebaseSendPasswordResetEmail(auth, email);
        return;
    }
    // Mock reset
    console.log("Mock password reset email sent to", email);
    await new Promise(resolve => setTimeout(resolve, 800));
};

export const sendPasswordReset = resetPassword;
export const sendPasswordResetEmail = resetPassword;

export const confirmPasswordReset = async (oobCode: string, newPassword: string) => {
    if (hasFirebaseCredentials && auth) {
        await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
        return;
    }
    // Mock confirm
    console.log("Mock password reset confirmed");
    await new Promise(resolve => setTimeout(resolve, 800));
};



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
