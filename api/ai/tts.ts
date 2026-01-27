import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_utils/firebaseAdmin';
import { AI_COSTS } from '../_utils/aiCost';
import * as admin from 'firebase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
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

    const { text, voiceId = '21m00Tcm4TlvDq8ikWAM', uid } = req.body;
    const apiKey = process.env.VITE_ELEVENLABS_API_KEY;

    if (!apiKey) {
        console.error("Missing ElevenLabs API Key");
        return res.status(500).json({ error: 'Server misconfiguration (Missing Key)' });
    }

    if (!uid || !text) {
        return res.status(400).json({ error: 'Missing User ID or Text' });
    }

    try {
        // 1. Calculate Cost (Per Character)
        const charCount = text.length;
        const predictedCost = (charCount * AI_COSTS.elevenlabs.perCharacter);

        // 2. Validate Balance
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

            // Debit
            t.update(userRef, {
                creditBalance: balance - predictedCost
            });

            // Log
            const txRef = db.collection('wallet_transactions').doc();
            t.set(txRef, {
                uid,
                type: 'usage',
                toolId: 'elevenlabs_tts',
                amount: -predictedCost,
                description: `Áudio Gerado (${charCount} chars)`,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        // 3. Call ElevenLabs API (Streaming)
        // https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail?.message || 'ElevenLabs API Error');
        }

        // Pipe audio stream to response
        // Note: For streaming in Vercel Serverless, we might need to be careful with timeouts,
        // but for short audio it is usually fine.
        res.setHeader('Content-Type', 'audio/mpeg');
        const arrayBuffer = await response.arrayBuffer();
        res.status(200).send(Buffer.from(arrayBuffer));

    } catch (error: any) {
        console.error("ElevenLabs Proxy Error:", error);
        return res.status(error.message === 'Insufficient Funds' ? 403 : 500).json({
            error: error.message
        });
    }
}
