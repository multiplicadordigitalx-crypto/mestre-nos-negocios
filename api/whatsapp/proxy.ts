
import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../utils/firebaseAdmin';
import { security } from '../utils/security';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { userId, action, ...data } = req.body;

        // In the real system, 'userId' usually comes from the Auth Token (req.headers.authorization)
        // For this hybrid setup, we assume the frontend sends the 'ownerId' of the instance, 
        // OR we use a fixed admin ID if it's the main system. 
        // Let's assume we pass the OWNER's UID in the body as 'ownerUid' or we lookup the instance to find the owner.

        // Strategy: 
        // 1. If 'userId' (instanceId) is provided, lookup instance in Firestore to find 'ownerId'.
        // 2. Fetch 'integrations/{ownerId}/providers/whatsapp' to get credentials.

        if (!userId) return res.status(400).json({ error: 'Missing Instance ID' });

        // 1. Find Instance Owner
        // Note: For 'create' action, we might need the owner passed explicitly if instance doesn't exist yet.
        // For simplicity, let's look for a hardcoded 'admin' config first or pass 'uid' from frontend.

        // QUICK FIX: The frontend calls proxy with 'userId' as the instance ID.
        // We will try to get the config from the "Admin" or the passed UID.
        // Let's assume the body has 'uid' (the user who is operating).
        const operatorUid = req.body.uid || 'admin_or_fixed_context';

        // Fetch Config from Vault
        // Try getting the specific user config, if not found, maybe fallback (optional)
        const configRef = db.collection('integrations').doc(operatorUid).collection('providers').doc('whatsapp');
        const configDoc = await configRef.get();

        let WHATSMEOW_SERVER_URL = process.env.WHATSMEOW_SERVER_URL;
        let WHATSMEOW_API_KEY = process.env.WHATSMEOW_API_KEY;

        if (configDoc.exists) {
            const vault = configDoc.data();
            if (vault?.apiKey && vault?.serverUrl) {
                console.log(`🔐 Using Vault Credentials for User: ${operatorUid}`);
                WHATSMEOW_API_KEY = security.decrypt(vault.apiKey);
                WHATSMEOW_SERVER_URL = vault.serverUrl;
            }
        }

        if (!WHATSMEOW_API_KEY || !WHATSMEOW_SERVER_URL) {
            return res.status(500).json({ error: 'WhatsApp Server not configured for this user.' });
        }

        // ... rest of the proxy logic ...

        // Map actions to endpoints
        const endpoints: Record<string, string> = {
            create: '/api/instances/create',
            status: `/api/instances/${userId}/status`,
            send: `/api/instances/${userId}/send`,
            disconnect: `/api/instances/${userId}/logout`, // Fixed logout path
            list: '/api/instances',
        };

        const endpoint = endpoints[action];
        if (!endpoint) return res.status(400).json({ error: 'Invalid action' });

        const method = action === 'status' || action === 'list' ? 'GET' : 'POST';
        const url = `${WHATSMEOW_SERVER_URL}${endpoint}`;

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${WHATSMEOW_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: method === 'POST' ? JSON.stringify({ userId, ...data }) : undefined,
        });

        const result = await response.json();
        return res.status(response.status).json(result);

    } catch (error: any) {
        console.error('Whatsmeow proxy error:', error);
        return res.status(500).json({ error: error.message });
    }
}

