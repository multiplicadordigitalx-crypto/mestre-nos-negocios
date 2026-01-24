/**
 * LucPay Stripe Integration Service
 * Manages automation for:
 * 1. Product & Price creation
 * 2. Connect Account (Sync for Commissions)
 * 3. Checkout Link generation
 */

const CONNECT_CLIENT_ID = import.meta.env.VITE_STRIPE_CONNECT_CLIENT_ID || 'ca_Tq9wn6x2AnFUT4qybXnpEWStfgJAIaof';

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
        const { functions } = await import('./firebase');
        const { httpsCallable } = await import('firebase/functions');

        const syncFn = httpsCallable(functions, 'syncProductToStripe');
        const result: any = await syncFn({ productData });

        if (!result.data.success) {
            throw new Error(result.data.message || "Falha ao sincronizar produto");
        }

        return {
            stripeProductId: result.data.stripeProductId,
            stripePriceId: result.data.plans[0]?.stripePriceId // Assuming first plan for compatibility
        };
    } catch (error) {
        console.error("Stripe Product Creation Error:", error);
        throw error;
    }
};

/**
 * Creates a checkout session for credit recharge.
 */
export const createCreditRechargeSession = async (amount: number, credits: number) => {
    try {
        const { functions } = await import('./firebase');
        const { httpsCallable } = await import('firebase/functions');

        const sessionFn = httpsCallable(functions, 'createStripeCheckoutSession');
        const result: any = await sessionFn({
            amount,
            credits,
            currency: 'brl',
            productId: 'credits'
        });

        if (!result.data.success) {
            throw new Error(result.data.message || "Erro ao criar sessão de recarga");
        }

        return result.data.paymentUrl;
    } catch (error) {
        console.error("Recharge Session Error:", error);
        throw error;
    }
};

/**
 * Creates a checkout session for a product with operational cost deduction and commission splits.
 */
export const createProductCheckoutSession = async (
    amount: number,
    productId: string,
    operationalCostBRL: number = 0,
    affiliateUid?: string,
    affiliatePercent?: number,
    coProducerUid?: string,
    coProducerPercent?: number
) => {
    try {
        const { functions } = await import('./firebase');
        const { httpsCallable } = await import('firebase/functions');

        const sessionFn = httpsCallable(functions, 'createStripeCheckoutSession');
        const result: any = await sessionFn({
            amount,
            currency: 'brl',
            productId,
            operationalCostBRL,
            affiliateUid,
            affiliatePercent,
            coProducerUid,
            coProducerPercent
        });

        if (!result.data.success) {
            throw new Error(result.data.message || "Erro ao criar sessão de checkout");
        }

        return result.data.paymentUrl;
    } catch (error) {
        console.error("Product Checkout Error:", error);
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
