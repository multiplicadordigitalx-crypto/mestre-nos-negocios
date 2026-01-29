import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    console.log("[DebugEnv] Request received");
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', "true");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY || '';

        res.status(200).json({
            status: 'ok',
            env: {
                FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
                FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
                FIREBASE_PRIVATE_KEY: !!privateKey,
                PRIVATE_KEY_LENGTH: privateKey.length,
                IS_KEY_VALID_FORMAT: privateKey.includes('-----BEGIN PRIVATE KEY-----'),
                VITE_GEMINI_API_KEY: !!process.env.VITE_GEMINI_API_KEY,
                GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
                VITE_ELEVENLABS_API_KEY: !!process.env.VITE_ELEVENLABS_API_KEY,
                ELEVENLABS_API_KEY: !!process.env.ELEVENLABS_API_KEY
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
