
import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_utils/firebaseAdmin';
import { security } from '../_utils/security';
import * as admin from 'firebase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { uid, type, config } = req.body;

        if (!uid || !type || !config) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Encrypt sensitive fields based on type
        const encryptedConfig: any = { ...config };

        // Define which fields are sensitive for each type
        const sensitiveFields = ['apiKey', 'apiSecret', 'token', 'password'];

        for (const key of Object.keys(encryptedConfig)) {
            if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                encryptedConfig[key] = security.encrypt(encryptedConfig[key]);
            }
        }

        // Save to Firestore under 'integrations' collection
        // Structure: integrations/{uid}/providers/{type} (Singleton)
        // OR: integrations/{uid}/providers/{type}/items/{id} (Collection)

        const providerRef = db.collection('integrations').doc(uid).collection('providers').doc(type);

        if (config.id) {
            // It's a list item (SMTP, Traffic, AI)
            await providerRef.collection('items').doc(config.id).set({
                ...encryptedConfig,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } else {
            // It's a singleton (WhatsApp Server Config)
            await providerRef.set({
                ...encryptedConfig,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }

        return res.status(200).json({ success: true, message: 'Configuration saved securely' });

    } catch (error: any) {
        console.error('Vault Save Error:', error);
        return res.status(500).json({ error: 'Failed to save configuration' });
    }
}
