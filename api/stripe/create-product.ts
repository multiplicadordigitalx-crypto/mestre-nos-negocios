import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { db } from '../_utils/firebaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-24.acacia',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { productData } = req.body;

        if (!productData || !productData.name) {
            return res.status(400).json({ error: 'Missing product data' });
        }

        console.log(`🚀 Creating Stripe Product: ${productData.name}`);

        // 1. Create or Update Product in Stripe
        // Note: For simplicity, we create a new product every time. 
        // In a real scenario, we might want to update if stripeProductId exists.
        const stripeProduct = await stripe.products.create({
            name: productData.name,
            description: productData.description || undefined,
            metadata: {
                app_product_id: productData.id || '',
                category: productData.category || '',
                producer_uid: productData.producerId || ''
            },
            // images: productData.coverImage ? [productData.coverImage] : undefined
        });

        const checkoutLinks = [];

        // 2. Create Prices and Payment Links for each Plan
        if (productData.plans && Array.isArray(productData.plans)) {
            for (const plan of productData.plans) {
                console.log(`   👉 Processing Plan: ${plan.name} - R$ ${plan.price}`);

                // Determine recurring interval
                let recurring: Stripe.Price.Recurring.Interval | undefined = undefined;
                let intervalCount = 1;

                if (plan.billingType === 'Mensal') recurring = 'month';
                if (plan.billingType === 'Trimestral') { recurring = 'month'; intervalCount = 3; }
                if (plan.billingType === 'Semestral') { recurring = 'month'; intervalCount = 6; }
                if (plan.billingType === 'Anual') recurring = 'year';

                // Create Price
                const priceData: Stripe.PriceCreateParams = {
                    product: stripeProduct.id,
                    currency: 'brl',
                    unit_amount: Math.round(plan.price * 100), // cents
                    nickname: plan.name,
                    metadata: {
                        plan_id: plan.id,
                        guarantee_days: plan.guaranteeDays ? plan.guaranteeDays.toString() : '7',
                        anchor_price: plan.anchorPrice ? plan.anchorPrice.toString() : ''
                    }
                };

                if (recurring) {
                    priceData.recurring = { interval: recurring, interval_count: intervalCount };
                }

                const stripePrice = await stripe.prices.create(priceData);

                // Create Persistent Payment Link
                // This link allows the producer to sell immediately without coding
                const paymentLink = await stripe.paymentLinks.create({
                    line_items: [
                        {
                            price: stripePrice.id,
                            quantity: 1,
                        },
                    ],
                    after_completion: {
                        type: 'redirect',
                        redirect: {
                            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mestre-nos-negocios.web.app'}/thank-you?session_id={CHECKOUT_SESSION_ID}`
                        }
                    },
                    metadata: {
                        product_id: stripeProduct.id,
                        plan_id: plan.id,
                        producer_uid: productData.producerId || '',
                        is_platform_product: 'true'
                    }
                });

                checkoutLinks.push({
                    id: plan.id,
                    name: plan.name,
                    platform: 'Stripe',
                    url: paymentLink.url,
                    stripePriceId: stripePrice.id,
                    stripePaymentLinkId: paymentLink.id,
                    active: true,
                    price: plan.price
                });
            }
        }

        return res.status(200).json({
            success: true,
            stripeProductId: stripeProduct.id,
            checkoutLinks: checkoutLinks
        });

    } catch (error: any) {
        console.error('❌ Error creating product:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
