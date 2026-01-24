import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Inicializa Firebase Admin (se ainda não foi inicializado)
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = getFirestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Apenas POST permitido
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'];

    // Support multiple webhook secrets (Stripe creates separate webhooks for account events vs connected accounts)
    const webhookSecrets = [
        process.env.STRIPE_WEBHOOK_SECRET,
        process.env.STRIPE_WEBHOOK_SECRET_CONNECT,
    ].filter(Boolean) as string[];

    if (!sig || webhookSecrets.length === 0) {
        return res.status(400).json({ error: 'Missing signature or webhook secret' });
    }

    let event: Stripe.Event | null = null;
    let lastError: Error | null = null;

    // Try each webhook secret until one works
    for (const webhookSecret of webhookSecrets) {
        try {
            const rawBody = JSON.stringify(req.body);
            event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
            console.log(`✅ Webhook verified with secret: ${webhookSecret.substring(0, 10)}...`);
            break; // Success!
        } catch (err: any) {
            lastError = err;
            console.log(`⚠️ Failed with secret ${webhookSecret.substring(0, 10)}...: ${err.message}`);
        }
    }

    if (!event) {
        console.error('⚠️ Webhook verification failed with all secrets:', lastError?.message);
        return res.status(400).json({ error: `Webhook Error: ${lastError?.message}` });
    }

    // Processar evento
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleSuccessfulCheckout(session);
                break;
            }
            case 'charge.refunded': {
                const charge = event.data.object as Stripe.Charge;
                await handleRefund(charge);
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return res.status(200).json({ received: true });
    } catch (err: any) {
        console.error(`Error processing webhook event ${event.type}:`, err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleSuccessfulCheckout(session: Stripe.Checkout.Session) {
    const metadata = session.metadata;
    const userUid = metadata?.user_uid;
    const productId = metadata?.product_id;
    const creditsToAdd = parseInt(metadata?.credits_to_add || '0');
    const operationalCostBRL = parseFloat(metadata?.operational_cost_brl || '0');

    const affiliateUid = metadata?.affiliate_uid;
    const coProducerUid = metadata?.co_producer_uid;
    const affiliatePercent = parseFloat(metadata?.affiliate_percent || '0');
    const coProducerPercent = parseFloat(metadata?.co_producer_percent || '0');

    if (!userUid) {
        console.error('Missing user UID in session metadata');
        return;
    }

    const amount = (session.amount_total || 0) / 100;
    const platformFee = (amount * 0.059) + 1.0; // LucPay 5.9% + R$ 1,00

    // Cálculos de split
    const netAfterFees = amount - platformFee - operationalCostBRL;
    const affiliateAmount = affiliateUid ? (netAfterFees * (affiliatePercent / 100)) : 0;
    const coProducerAmount = coProducerUid ? ((netAfterFees - affiliateAmount) * (coProducerPercent / 100)) : 0;
    const producerNet = netAfterFees - affiliateAmount - coProducerAmount;

    // Salvar transação
    await db.collection('transactions').doc(session.id).set({
        id: session.id,
        amount,
        currency: session.currency || 'brl',
        status: 'approved',
        type: creditsToAdd > 0 ? 'recharge' : 'sale',
        userUid,
        productId,
        creditsAdded: creditsToAdd,
        operationalCost: operationalCostBRL,
        platformFee,
        splits: {
            affiliate: { uid: affiliateUid, amount: affiliateAmount, percent: affiliatePercent },
            coProducer: { uid: coProducerUid, amount: coProducerAmount, percent: coProducerPercent },
            producer: { amount: producerNet > 0 ? producerNet : 0 },
        },
        netAmount: producerNet > 0 ? producerNet : 0,
        createdAt: FieldValue.serverTimestamp(),
        paymentMethod: 'stripe_checkout',
    });

    // Atualizar créditos do usuário
    if (creditsToAdd > 0) {
        await db.collection('students').doc(userUid).set({
            creditBalance: FieldValue.increment(creditsToAdd),
            lastPaymentDate: FieldValue.serverTimestamp(),
            status: 'active',
        }, { merge: true });
    }

    // Distribuir splits (se houver)
    if (creditsToAdd === 0 && productId !== 'credits') {
        await distributeSplits(session.id, {
            amount,
            currency: session.currency || 'brl',
            splits: {
                affiliate: affiliateUid ? { uid: affiliateUid, amount: affiliateAmount } : null,
                coProducer: coProducerUid ? { uid: coProducerUid, amount: coProducerAmount } : null,
                producer: { uid: 'MAIN_PRODUCER', amount: producerNet },
            },
        });
    }

    console.log(`✅ Checkout completed for user ${userUid}. Credits: ${creditsToAdd}`);
}

async function handleRefund(charge: Stripe.Charge) {
    console.log('Refund processed:', charge.id);
    // Implementar lógica de estorno
}

async function distributeSplits(sessionId: string, data: any) {
    // Implementar lógica de distribuição via Stripe Transfers
    console.log('Distributing splits for session:', sessionId);
}

// Configuração para raw body (necessário para webhook)
export const config = {
    api: {
        bodyParser: false,
    },
};
