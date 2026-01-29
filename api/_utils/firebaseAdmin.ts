import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : undefined;

        console.log(`[Init] Checking Creds: ProjectID=${!!process.env.FIREBASE_PROJECT_ID}, Email=${!!process.env.FIREBASE_CLIENT_EMAIL}, Key=${!!privateKey}`);

        if (process.env.FIREBASE_PROJECT_ID && privateKey && process.env.FIREBASE_CLIENT_EMAIL) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
            });
            console.log('🔥 Firebase Admin Initialized with CERT');
        } else {
            console.warn('⚠️ Firebase Admin missing vars. Trying default init...');
            // Fallback for some local environments or if using GOOGLE_APPLICATION_CREDENTIALS
            admin.initializeApp();
        }
    } catch (error) {
        console.error('❌ Firebase admin initialization error:', error);
    }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
