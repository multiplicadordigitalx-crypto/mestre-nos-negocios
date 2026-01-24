import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Inicializa Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

// Interface para o body da requisição
interface CheckoutRequestBody {
    amount: number;
    currency: string;
    productId: string;
    credits?: number;
    operationalCostBRL?: number;
    affiliateUid?: string;
    affiliatePercent?: number;
    coProducerUid?: string;
    coProducerPercent?: number;
    userUid: string;
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only POST allowed
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            amount,
            currency,
            productId,
            credits = 0,
            operationalCostBRL = 0,
            affiliateUid,
            affiliatePercent = 0,
            coProducerUid,
            coProducerPercent = 0,
            userUid
        } = req.body as CheckoutRequestBody;

        // Validação
        if (!amount || !currency || !productId || !userUid) {
            return res.status(400).json({
                error: 'Missing required fields: amount, currency, productId, userUid'
            });
        }

        // Criar sessão de checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'pix', 'boleto'],
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: productId === 'credits'
                                ? `Recarga de ${credits} Créditos`
                                : `Mestre IA - ${productId}`,
                        },
                        unit_amount: Math.round(amount * 100), // Converte para centavos
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mestre-nos-negocios.web.app'}/dashboard?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mestre-nos-negocios.web.app'}/dashboard?payment=cancel`,
            metadata: {
                user_uid: userUid,
                product_id: productId,
                credits_to_add: credits.toString(),
                operational_cost_brl: operationalCostBRL.toString(),
                affiliate_uid: affiliateUid || '',
                affiliate_percent: affiliatePercent.toString(),
                co_producer_uid: coProducerUid || '',
                co_producer_percent: coProducerPercent.toString(),
            },
        });

        return res.status(200).json({
            success: true,
            paymentUrl: session.url,
            sessionId: session.id
        });

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
