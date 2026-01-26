import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : undefined;

        if (process.env.FIREBASE_PROJECT_ID && privateKey && process.env.FIREBASE_CLIENT_EMAIL) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
            });
            console.log('🔥 Firebase Admin Initialized');
        } else {
            console.warn('⚠️ Firebase Admin credentials missing in environment variables.');
        }
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
