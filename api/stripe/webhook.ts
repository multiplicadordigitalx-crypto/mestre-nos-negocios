import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { sendEmail } from '../../src/services/emailService';
import {
    purchaseReceiptTemplate,
    refundProcessedTemplate
} from '../../src/services/emailTemplates/financial';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Webhook do Stripe para processar eventos
 * POST /api/stripe/webhook
 */
export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle events
    try {
        const eventType = event.type as string;

        switch (eventType) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                break;

            case 'charge.refunded':
                await handleRefund(event.data.object as Stripe.Charge);
                break;

            case 'transfer.paid':
                await handleTransferPaid(event.data.object as unknown as Stripe.Transfer);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentFailed(event.data.object as unknown as Stripe.PaymentIntent);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ error: error.message });
    }
}

// Import db from firebaseAdmin
import { db } from '../utils/firebaseAdmin';

/**
 * Checkout completado - enviar recibo e liberar créditos
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const customerEmail = session.customer_details?.email;
    const userId = session.metadata?.user_uid;
    const creditsToAdd = parseInt(session.metadata?.credits_to_add || '0');

    if (!userId) {
        console.error('❌ Webhook Error: Missing user_uid in metadata');
        return;
    }

    try {
        await db.runTransaction(async (transaction) => {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                throw new Error(`User ${userId} not found`);
            }

            const currentBalance = userDoc.data()?.creditBalance || 0;
            const newBalance = currentBalance + creditsToAdd;

            // 1. Update User Balance
            transaction.update(userRef, {
                creditBalance: newBalance,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // 2. Create Wallet Transaction Record
            const transactionRef = db.collection('wallet_transactions').doc();
            transaction.set(transactionRef, {
                userId,
                type: 'credit_purchase',
                amount: creditsToAdd,
                valueBrl: (session.amount_total || 0) / 100,
                description: 'Compra de Créditos via Stripe',
                stripeSessionId: session.id,
                status: 'completed',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        console.log(`✅ ${creditsToAdd} créditos adicionados para ${userId}`);

        // Send Email Receipt
        if (customerEmail) {
            const order = {
                id: session.id,
                date: new Date(session.created * 1000).toLocaleDateString('pt-BR'),
                productName: `Pacote de ${creditsToAdd} Créditos`,
                amount: (session.amount_total || 0) / 100,
                paymentMethod: 'Cartão/Pix',
                customerName: session.customer_details?.name || 'Cliente',
                customerEmail: customerEmail
            };

            await sendEmail({
                to: customerEmail,
                subject: `✅ Seus Créditos Chegaram! - ${order.productName}`,
                html: purchaseReceiptTemplate(order)
            });
        }

    } catch (error) {
        console.error('❌ Failed to process checkout fulfillment:', error);
        throw error;
    }
}

/**
 * Reembolso processado
 */
async function handleRefund(charge: Stripe.Charge) {
    const customerEmail = charge.billing_details?.email;
    if (!customerEmail) return;

    const amount = charge.amount_refunded / 100;

    await sendEmail({
        to: customerEmail,
        subject: '💰 Reembolso Processado',
        html: refundProcessedTemplate(
            'Cliente',
            amount,
            'Créditos Mestre nos Negócios',
            charge.id
        )
    });

    console.log(`✅ Notificação de reembolso enviada para ${customerEmail}`);

    // TODO: Remover acesso/créditos no Firestore
}

/**
 * Transferência Stripe paga
 */
async function handleTransferPaid(transfer: Stripe.Transfer) {
    // TODO: Buscar email do produtor associado ao transfer.destination
    // const producerEmail = await getProducerEmailByStripeAccount(transfer.destination);

    console.log(`✅ Transferência paga: ${transfer.amount / 100}`);

    // await sendEmail({
    //     to: producerEmail,
    //     subject: '💸 Transferência Recebida',
    //     html: stripeTransferTemplate(...)
    // });
}

/**
 * Pagamento falhou
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    // TODO: Notificar usuário sobre falha
    console.log(`❌ Pagamento falhou: ${paymentIntent.id}`);
}
