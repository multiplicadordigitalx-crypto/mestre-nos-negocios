import { VercelRequest, VercelResponse } from '@vercel/node';
import * as _admin from 'firebase-admin';
// Fix for ESM/CJS interop in Vercel
const admin = (_admin as any).default || _admin;

// --- INLINED CONSTANTS ---
const AI_COSTS = {
    gemini: {
        perRequestBase: 2 // custo fixo por requisição
    }
};

// --- INLINED FIREBASE INIT ---
if (!admin.apps?.length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : undefined;

        console.log(`[ChatHandler] Init Firebase. Proj=${!!process.env.FIREBASE_PROJECT_ID} Email=${!!process.env.FIREBASE_CLIENT_EMAIL} Key=${!!privateKey}`);

        if (process.env.FIREBASE_PROJECT_ID && privateKey && process.env.FIREBASE_CLIENT_EMAIL) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
            });
            console.log('🔥 [ChatHandler] Firebase Admin Initialized');
        } else {
            console.warn('⚠️ [ChatHandler] Firebase Admin missing vars. Trying default init...');
            admin.initializeApp();
        }
    } catch (error) {
        console.error('❌ [ChatHandler] Firebase admin initialization error:', error);
    }
}

const db = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', "true");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages, contents: directContents, uid, toolId } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    console.log(`[ChatHandler] Request received. UID=${uid}, Tool=${toolId}`);

    if (!apiKey) {
        console.error("Missing Gemini API Key on Server");
        return res.status(500).json({ error: 'Server misconfiguration (Missing API Key)' });
    }

    // DEBUG: Log key details (safe)
    console.log(`[ChatHandler] Using API Key: ${apiKey.substring(0, 5)}... (Length: ${apiKey.length})`);
    console.log(`[ChatHandler] Target Model: ${req.body.model || 'gemini-1.5-flash'}`);

    if (!uid) {
        return res.status(400).json({ error: 'Missing User ID' });
    }

    try {
        // 1. Check Balance Transactions
        console.log('[ChatHandler] Checking Firestore Balance...'); // LOG ADDED
        const predictedCost = AI_COSTS.gemini.perRequestBase;

        let userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        console.log(`[ChatHandler] User Doc exists: ${userDoc.exists}`); // LOG ADDED

        if (!userDoc.exists) {
            userRef = db.collection('students').doc(uid);
        }

        await db.runTransaction(async (t) => {
            const doc = await t.get(userRef);
            if (!doc.exists) throw new Error("User not found");

            const data = doc.data();
            const balance = data?.creditBalance || 0;
            console.log(`[ChatHandler] Current Balance: ${balance}`); // LOG ADDED

            if (balance < predictedCost && !data?.hasMestreIA) {
                throw new Error("Insufficient Funds");
            }

            t.update(userRef, {
                creditBalance: balance - predictedCost
            });

            const txRef = db.collection('wallet_transactions').doc();
            t.set(txRef, {
                uid,
                type: 'usage',
                toolId: toolId || 'chat_gemini',
                amount: -predictedCost,
                description: 'Geração de Resposta IA (Gemini)',
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        console.log('[ChatHandler] Balance deducted. Calling Gemini...'); // LOG ADDED

        // 2. Call Gemini API
        let finalContents = directContents;

        if (!finalContents && messages) {
            finalContents = messages.map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            }));
        }

        if (!finalContents) {
            return res.status(400).json({ error: 'No content provided' });
        }

        const model = req.body.model || 'gemini-flash-latest';

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: finalContents })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Gemini API Error');
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        return res.status(200).json({
            text,
            cost: predictedCost
        });

    } catch (error: any) {
        console.error("Gemini Proxy Error:", error);
        return res.status(error.message === 'Insufficient Funds' ? 403 : 500).json({
            // Ensure error is JSON
            error: error.message || "Unknown error"
        });
    }
}
