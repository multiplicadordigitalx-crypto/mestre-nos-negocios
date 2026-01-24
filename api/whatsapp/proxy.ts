import { VercelRequest, VercelResponse } from '@vercel/node';

const WHATSMEOW_SERVER_URL = process.env.WHATSMEOW_SERVER_URL || 'http://localhost:3001';
const WHATSMEOW_API_KEY = process.env.WHATSMEOW_API_KEY;

/**
 * API Proxy para Whatsmeow Server
 * POST /api/whatsapp/proxy
 */
export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!WHATSMEOW_API_KEY) {
        return res.status(500).json({ error: 'Server not configured' });
    }

    try {
        const { userId, action, ...data } = req.body;

        if (!userId || !action) {
            return res.status(400).json({ error: 'Missing userId or action' });
        }

        // Map actions to endpoints
        const endpoints: Record<string, string> = {
            create: '/api/instances/create',
            status: `/api/instances/${userId}/status`,
            send: `/api/instances/${userId}/send`,
            disconnect: `/api/instances/${userId}/disconnect`,
            list: '/api/instances',
        };

        const endpoint = endpoints[action];
        if (!endpoint) {
            return res.status(400).json({ error: 'Invalid action' });
        }

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
