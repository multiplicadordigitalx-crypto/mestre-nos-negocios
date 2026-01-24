import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
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
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                break;

            case 'charge.refunded':
                await handleRefund(event.data.object as Stripe.Charge);
                break;

            case 'transfer.paid':
                await handleTransferPaid(event.data.object as Stripe.Transfer);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
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

/**
 * Checkout completado - enviar recibo
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const customerEmail = session.customer_details?.email;
    if (!customerEmail) return;

    const order = {
        id: session.id,
        date: new Date(session.created * 1000).toLocaleDateString('pt-BR'),
        productName: 'Créditos Mestre nos Negócios',
        amount: (session.amount_total || 0) / 100,
        paymentMethod: 'Cartão de Crédito',
        customerName: session.customer_details?.name || 'Cliente',
        customerEmail: customerEmail
    };

    await sendEmail({
        to: customerEmail,
        subject: `✅ Recibo de Compra - ${order.productName}`,
        html: purchaseReceiptTemplate(order)
    });

    console.log(`✅ Recibo enviado para ${customerEmail}`);

    // TODO: Atualizar saldo de créditos no Firestore
    // await updateUserCredits(session.client_reference_id, credits);
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
