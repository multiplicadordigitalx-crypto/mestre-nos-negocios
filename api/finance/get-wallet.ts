import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../utils/firebaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { uid } = req.query;

    if (!uid) {
        return res.status(400).json({ error: 'Missing uid' });
    }

    try {
        const userId = Array.isArray(uid) ? uid[0] : uid;
        console.log(`💰 Fetching Wallet for ${userId}`);

        // 1. Fetch User Data (Current Balance)
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userData = userDoc.data();
        const currentBalance = userData?.creditBalance || 0;

        // 2. Fetch Transactions (Last 50)
        // We look for docs where uid == userId OR producerId == userId (historical reasons)
        const transactionsSnapshot = await db.collection('wallet_transactions')
            .where('uid', '==', userId) // Assuming we standardized on 'uid' in consume.ts
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();

        const transactions = transactionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // 3. Fallback: If no transactions found with 'uid', try 'producerId' (legacy mock data format)
        if (transactions.length === 0) {
            const legacySnapshot = await db.collection('wallet_transactions')
                .where('producerId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();

            legacySnapshot.docs.forEach(doc => {
                transactions.push({ id: doc.id, ...doc.data() });
            });
        }

        return res.status(200).json({
            producerId: userId,
            balance: currentBalance,
            transactions: transactions,
            // Future: Pending balance calculation from Stripe Connect
        });

    } catch (error: any) {
        console.error('❌ Error fetching wallet:', error);
        return res.status(500).json({ error: error.message });
    }
}
