import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_utils/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { uid, amount, description, toolId } = req.body;

    if (!uid || !amount) {
        return res.status(400).json({ error: 'Missing required fields: uid, amount' });
    }

    try {
        const userRef = db.collection('users').doc(uid);
        const transactionRef = db.collection('wallet_transactions').doc();

        await db.runTransaction(async (t) => {
            const userDoc = await t.get(userRef);

            if (!userDoc.exists) {
                throw new Error('User not found');
            }

            const userData = userDoc.data();
            const currentBalance = userData?.creditBalance || 0;

            if (currentBalance < amount) {
                throw new Error('Saldo insuficiente');
            }

            // 1. Deduct Balance
            t.update(userRef, {
                creditBalance: currentBalance - amount,
                updatedAt: new Date().toISOString()
            });

            // 2. Register Transaction Log
            t.set(transactionRef, {
                uid,
                amount: -amount, // Negative for consumption
                type: 'usage',
                description: description || 'Consumo de Créditos',
                toolId: toolId || 'system',
                timestamp: new Date().toISOString(),
                balanceAfter: currentBalance - amount
            });
        });

        return res.status(200).json({
            success: true,
            message: 'Credits consumed successfully',
            consumed: amount
        });

    } catch (error: any) {
        console.error('❌ Error consuming credits:', error);

        if (error.message === 'Saldo insuficiente') {
            return res.status(403).json({ error: 'Saldo insuficiente para realizar esta operação.' });
        }

        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
