import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../utils/firebaseAdmin';
import { AI_COSTS } from '../utils/aiCost';
import * as admin from 'firebase-admin';

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
    const apiKey = process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        console.error("Missing Gemini API Key on Server");
        return res.status(500).json({ error: 'Server misconfiguration (Missing API Key)' });
    }

    if (!uid) {
        return res.status(400).json({ error: 'Missing User ID' });
    }

    try {
        // 1. Check Balance Transactions
        const predictedCost = AI_COSTS.gemini.perRequestBase;

        let userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            userRef = db.collection('students').doc(uid);
        }

        await db.runTransaction(async (t) => {
            const doc = await t.get(userRef);
            if (!doc.exists) throw new Error("User not found");

            const data = doc.data();
            const balance = data?.creditBalance || 0;

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

        // 2. Call Gemini API
        // Prioritize 'contents' (multimodal format), fallback to 'messages' (chat format)
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

        // Use gemini-1.5-flash as default efficient model
        const model = req.body.model || 'gemini-1.5-flash';

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
            error: error.message
        });
    }
}
