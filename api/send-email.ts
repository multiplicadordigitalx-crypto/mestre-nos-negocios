import { VercelRequest, VercelResponse } from '@vercel/node';
import { sendEmail, sendBulkEmail } from '../src/services/emailService';

/**
 * API para envio de emails via SendGrid
 * POST /api/send-email
 */
export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { to, subject, html, bulk, from, replyTo } = req.body;

        // Validação
        if (!to || !subject || !html) {
            return res.status(400).json({
                error: 'Missing required fields: to, subject, html'
            });
        }

        // Envio em lote ou individual
        let result;
        if (bulk && Array.isArray(to)) {
            result = await sendBulkEmail(to, subject, html);
        } else {
            result = await sendEmail({ to, subject, html, from, replyTo });
        }

        if (result.success) {
            return res.status(200).json({
                success: true,
                messageId: result.messageId,
                count: result.count
            });
        } else {
            return res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error: any) {
        console.error('API Send Email Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
