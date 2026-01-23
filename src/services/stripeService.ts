/**
 * LucPay Stripe Integration Service
 * Manages automation for:
 * 1. Product & Price creation
 * 2. Connect Account (Sync for Commissions)
 * 3. Checkout Link generation
 */

const STRIPE_API_URL = 'https://api.stripe.com/v1';
const SECRET_KEY = import.meta.env.STRIPE_SECRET_KEY || 'sk_test_...'; // Fallback for dev
const CONNECT_CLIENT_ID = import.meta.env.VITE_STRIPE_CONNECT_CLIENT_ID || 'ca_Tq9wn6x2AnFUT4qybXnpEWStfgJAIaof';

const headers = {
    'Authorization': `Bearer ${SECRET_KEY}`,
    'Content-Type': 'application/x-www-form-urlencoded'
};

/**
 * Generates the Stripe Connect OAuth URL for LucPay partners.
 * This links their bank account to the platform for automatic splits.
 */
export const generateConnectAuthUrl = (userUid: string) => {
    const baseUrl = "https://connect.stripe.com/express/oauth/authorize";
    const redirectUri = window.location.origin + "/connect/callback";

    const params = new URLSearchParams({
        client_id: CONNECT_CLIENT_ID,
        state: userUid,
        'suggested_capabilities[]': 'transfers',
        redirect_uri: redirectUri
    });

    return `${baseUrl}?${params.toString()}`;
};

/**
 * Creates a product on Stripe and a corresponding price.
 * Maps to the "Lançar Novo Ativo" wizard.
 */
export const createStripeProduct = async (productData: any) => {
    try {
        // 1. Create Product
        const productResponse = await fetch(`${STRIPE_API_URL}/products`, {
            method: 'POST',
            headers,
            body: new URLSearchParams({
                name: productData.name,
                description: productData.description,
                'metadata[mestre_product_id]': productData.id,
                'metadata[warranty_days]': productData.guaranteeDays.toString(),
                'metadata[anchor_price]': productData.anchorPrice.toString()
            })
        });

        const product = await productResponse.json();
        if (product.error) throw new Error(product.error.message);

        // 2. Create Price for the Product
        const priceResponse = await fetch(`${STRIPE_API_URL}/prices`, {
            method: 'POST',
            headers,
            body: new URLSearchParams({
                product: product.id,
                unit_amount: (productData.price * 100).toString(), // Stripe uses cents
                currency: 'brl',
                ...(productData.validity !== 'Vitalício' && {
                    'recurring[interval]': mapValidityToInterval(productData.validity)
                })
            })
        });

        const price = await priceResponse.json();
        return { stripeProductId: product.id, stripePriceId: price.id };
    } catch (error) {
        console.error("Stripe Product Creation Error:", error);
        throw error;
    }
};

/**
 * Syncs a user to Stripe (LucPay Ecosystem)
 * Creates a Customer or Connect Account.
 */
export const syncUserToLucPay = async (userData: any) => {
    // Logic for Stripe Connect (Express/Custom) will go here
    // for commission split management
    console.log("Syncing user to LucPay:", userData.email);
};

const mapValidityToInterval = (validity: string) => {
    switch (validity) {
        case 'Mensal (Assinatura)': return 'month';
        case 'Trimestral': return 'month'; // Logic for 3 months would be added in recurring config
        case 'Semestral': return 'month';
        case 'Anual (Renovação Auto)': return 'year';
        default: return 'month';
    }
};
