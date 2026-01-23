
import { delay } from './mockFirebase';

// ==========================================
// VERCEL + FIREBASE ARCHITECTURE OVERVIEW
// ==========================================
// In the future production environment:
// 1. Sensitive Data (Secret Keys) -> Stored in Firebase Secret Manager via Cloud Functions.
// 2. Webhooks -> Handled by Vercel API Routes (/api/webhooks/stripe).
// 3. Transactions -> Synced to Firestore collection 'transactions' via Webhooks.
// 4. Accounts -> Synced to Firestore collection 'connected_accounts'.

export interface LucPayGatewayProfile {
    id: string; // Unique ID
    label: string; // Display Name
    isActive: boolean; // Only one profile can be active for NEW charges
    provider: 'stripe' | 'pix_external'; // Provider Type
    mode: 'test' | 'live';

    // Stripe Specific
    publishableKey?: string;
    secretKey?: string;
    webhookSecret?: string;
    connectClientId?: string;

    // Pix Specific
    pixProviderName?: string; // e.g. 'EFI', 'StarkBank', 'PagHiper'
    pixKey?: string;
    pixClientId?: string;
    pixClientSecret?: string;
    pixCertPath?: string;

    createdAt: number;
}

export interface LucPayAccount {
    id: string;
    email: string;
    businessName: string;
    type: 'standard' | 'express' | 'custom';
    country: string;
    currency: string;
    status: 'pending' | 'restricted' | 'enabled';
    payoutsEnabled: boolean;
    chargesEnabled: boolean;
    requirements: {
        currently_due: string[];
        past_due: string[];
        eventually_due: string[];
    };
    created: number;
}

export interface LucPayTransaction {
    id: string;
    amount: number;
    currency: string;
    status: 'succeeded' | 'pending' | 'failed' | 'refunded';
    type: 'charge' | 'transfer' | 'payout' | 'refund';
    created: number;
    customerEmail?: string;
    description?: string;
    fee: number;
    net: number;
    destinationAccount?: string;
    metadata?: Record<string, any>;
    configId?: string; // Tracks which gateway profile processed this
}

// ==========================================
// PROVIDER INTERFACE
// ==========================================
interface ILucPayProvider {
    getConfigs(): Promise<LucPayGatewayProfile[]>;
    saveConfig(profile: LucPayGatewayProfile): Promise<void>;
    deleteConfig(profileId: string): Promise<void>;
    setActiveConfig(profileId: string): Promise<void>;
    testConnection(config: LucPayGatewayProfile): Promise<{ success: boolean; message: string }>;
    getConnectedAccounts(): Promise<LucPayAccount[]>;
    getTransactions(): Promise<LucPayTransaction[]>;
    generateOnboardingLink(accountId: string): Promise<string>;
    completeConnect(code: string): Promise<{ success: boolean; stripeAccountId?: string }>;
    processPayment(amount: number, currency: string, method: string, configId: string, productId?: string): Promise<{ success: boolean; message: string; paymentUrl?: string }>;
}

// ==========================================
// MOCK PROVIDER (Local Development)
// ==========================================
const STORAGE_KEY = 'lucpay_profiles_v2';
const DEFAULT_PROFILE: LucPayGatewayProfile = {
    id: 'default_profile',
    label: 'Conta Principal (Stripe)',
    isActive: true,
    provider: 'stripe',
    mode: 'test',
    publishableKey: 'pk_test_51Mz...',
    secretKey: 'sk_test_51Mz...',
    webhookSecret: 'whsec_...',
    connectClientId: 'ca_test_...',
    createdAt: Date.now()
};

// Mock Data
const MOCK_ACCOUNTS: LucPayAccount[] = [
    {
        id: 'acct_1Mny4E2eZvKYlo2C',
        email: 'parceiro.top@example.com',
        businessName: 'Parceiro Top Ltda',
        type: 'express',
        country: 'BR',
        currency: 'brl',
        status: 'enabled',
        payoutsEnabled: true,
        chargesEnabled: true,
        requirements: { currently_due: [], past_due: [], eventually_due: [] },
        created: 1678900000
    },
    {
        id: 'acct_1Mny8G2eZvKYlo9X',
        email: 'novo.aluno@example.com',
        businessName: 'João Silva MEI',
        type: 'standard',
        country: 'BR',
        currency: 'brl',
        status: 'restricted',
        payoutsEnabled: false,
        chargesEnabled: true,
        requirements: { currently_due: ['identity_document'], past_due: [], eventually_due: [] },
        created: 1689900000
    },
    {
        id: 'acct_1Mny9I2eZvKYlo1Z',
        email: 'aluno.iniciante@example.com',
        businessName: 'Maria Souza',
        type: 'express',
        country: 'BR',
        currency: 'brl',
        status: 'pending',
        payoutsEnabled: false,
        chargesEnabled: false,
        requirements: { currently_due: ['tos_acceptance', 'external_account'], past_due: [], eventually_due: [] },
        created: 1699900000
    }
];

const MOCK_TRANSACTIONS: LucPayTransaction[] = Array.from({ length: 15 }).map((_, i) => ({
    id: i % 3 === 0 ? `tr_${i}x89sfd98` : `pi_${i}z76sfd12`,
    amount: (Math.random() * 500) + 50,
    currency: 'brl',
    status: i % 5 === 0 ? 'failed' : (i % 7 === 0 ? 'refunded' : 'succeeded'),
    type: i % 3 === 0 ? 'transfer' : 'charge',
    created: Date.now() - (i * 86400000), // Days ago
    customerEmail: `cliente${i}@gmail.com`,
    description: i % 3 === 0 ? 'Transferência de Comissão' : 'Compra de Curso - Mestre nos Negócios',
    fee: 2.99 + ((Math.random() * 500) + 50) * 0.0399,
    net: ((Math.random() * 500) + 50) * 0.9601 - 2.99,
    metadata: {
        gateway_ref: `pi_live_${Math.random().toString(36).substring(7)}`,
        product_id: `prod_${i}`
    },
    configId: 'default_profile'
}));


const MockLucPayProvider: ILucPayProvider = {
    getConfigs: async (): Promise<LucPayGatewayProfile[]> => {
        // Try to get from Admin Integrations first (Single Source of Truth)
        try {
            const adminIntegrations = await import('./mockFirebase').then(m => m.getAdminIntegrations('payment_gateways'));
            if (adminIntegrations && adminIntegrations.length > 0) {
                return adminIntegrations.map((gw: any) => ({
                    id: gw.id,
                    label: gw.name,
                    isActive: true, // Assuming active if in list
                    provider: gw.provider === 'stripe' ? 'stripe' : 'pix_external',
                    mode: gw.apiKey?.startsWith('sk_live') ? 'live' : 'test',
                    // Map generic fields to Stripe specific
                    publishableKey: gw.apiKey, // Assuming this is PK
                    secretKey: gw.secretKey,
                    webhookSecret: gw.webhookSecret,
                    createdAt: Date.now()
                }));
            }
        } catch (e) {
            console.warn("LucPayService: Failed to sync with AdminIntegrations", e);
        }

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);

        // Ensure default exists and save it
        localStorage.setItem(STORAGE_KEY, JSON.stringify([DEFAULT_PROFILE]));
        return [DEFAULT_PROFILE];
    },

    saveConfig: async (profile: LucPayGatewayProfile): Promise<void> => {
        await delay(800);
        let stored: LucPayGatewayProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

        // Update or Insert
        const index = stored.findIndex(p => p.id === profile.id);
        if (index >= 0) {
            stored[index] = profile;
        } else {
            stored.push(profile);
        }

        // Handle Active Toggle Logic
        if (profile.isActive) {
            stored = stored.map(p => p.id === profile.id ? p : { ...p, isActive: false });
        } else if (stored.length === 1) {
            // If it's the only one, force active
            stored[0].isActive = true;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    },

    deleteConfig: async (profileId: string): Promise<void> => {
        await delay(500);
        let stored: LucPayGatewayProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        stored = stored.filter(p => p.id !== profileId);

        // If we deleted the active one, activate the first available
        if (stored.length > 0 && !stored.some(p => p.isActive)) {
            stored[0].isActive = true;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    },

    setActiveConfig: async (profileId: string): Promise<void> => {
        await delay(300);
        let stored: LucPayGatewayProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        stored = stored.map(p => ({ ...p, isActive: p.id === profileId }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    },

    testConnection: async (config: LucPayGatewayProfile): Promise<{ success: boolean; message: string }> => {
        await delay(1500);
        if (config.secretKey.startsWith('sk_test_') && config.mode === 'test') {
            return { success: true, message: 'Conexão de TESTE estabelecida com sucesso! Latência: 45ms' };
        }
        if (config.secretKey.startsWith('sk_live_') && config.mode === 'live') {
            return { success: true, message: 'Conexão de PRODUÇÃO estabelecida com sucesso! Latência: 38ms' };
        }
        return { success: false, message: 'Erro: Chave secreta inválida para o modo selecionado.' };
    },

    getConnectedAccounts: async (): Promise<LucPayAccount[]> => {
        await delay(1000);
        return MOCK_ACCOUNTS;
    },

    getTransactions: async (): Promise<LucPayTransaction[]> => {
        await delay(800);
        return MOCK_TRANSACTIONS;
    },

    generateOnboardingLink: async (accountId: string): Promise<string> => {
        await delay(1200);
        return `https://connect.stripe.com/setup/s/${accountId}/...`;
    },

    completeConnect: async (code: string) => {
        await delay(1500);
        console.log("Mocking Connect completion for code:", code);
        return { success: true, stripeAccountId: 'acct_mock' };
    },

    processPayment: async (amount: number, currency: string, method: string, configId: string, productId?: string): Promise<{ success: boolean; message: string; paymentUrl?: string }> => {
        await delay(1500); // Simulate network latency

        // 1. Get the Config
        const configs = await MockLucPayProvider.getConfigs();
        const config = configs.find(c => c.id === configId);

        if (!config) {
            return { success: false, message: 'Configuração de pagamento não encontrada.' };
        }

        // 2. Handle Stripe Logic
        if (config.provider === 'stripe') {
            // [UPDATED] Check for Manual Link PRIORITY (Works in Test & Live)
            // If the admin defined an explicit checkout link, use it regardless of gateway mode.
            if (productId) {
                const storedLink = localStorage.getItem(`stripe_link_${productId}`);
                if (storedLink && storedLink.startsWith('http')) {
                    console.log(`[Stripe] Found Explicit Checkout Link for ${productId}: ${storedLink}`);
                    return {
                        success: true,
                        message: 'Redirecionando para o Checkout...',
                        paymentUrl: storedLink
                    };
                }
            }

            if (config.mode === 'live') {
                // FALLBACK: Since we don't have a backend to create a Checkout Session with the sk_live,
                // and no manual link was found, we simulate a failure or generic message.
                // The user wanted "Production Keys" usage.

                console.log(`[Stripe LIVE] Processing R$${amount} via ${method} using key ${config.publishableKey?.substring(0, 8)}...`);

                return {
                    success: true,
                    message: 'Redirecionando para o Checkout Seguro do Stripe (Padrão)...',
                    // In a real scenario without backend, this URL would be dynamic.
                    // For the purpose of the requirement "Use Stripe", we assume the Admin has generated links.
                    paymentUrl: `https://buy.stripe.com/test_...` // Fallback placeholder
                };
            } else {
                return { success: true, message: '[TESTE] Pagamento Aprovado Simulado!' };
            }
        }

        return { success: false, message: 'Provedor não suportado para processamento direto.' };
    }
};

// ==========================================
// FIREBASE PROVIDER (Real Implementation)
// ==========================================
import { functions } from './firebase';
import { httpsCallable } from "firebase/functions";

const FirebaseLucPayProvider: ILucPayProvider = {
    getConfigs: async (): Promise<LucPayGatewayProfile[]> => {
        const getConfigsFn = httpsCallable(functions, 'getStripeConfigs');
        const result: any = await getConfigsFn();
        return result.data as LucPayGatewayProfile[];
    },
    saveConfig: async (profile: LucPayGatewayProfile): Promise<void> => {
        const saveConfigFn = httpsCallable(functions, 'updateStripeConfig');
        await saveConfigFn({ profile });
    },
    deleteConfig: async (profileId: string): Promise<void> => {
        const deleteConfigFn = httpsCallable(functions, 'deleteStripeConfig');
        await deleteConfigFn({ profileId });
    },
    setActiveConfig: async (profileId: string): Promise<void> => {
        const setActiveFn = httpsCallable(functions, 'setActiveStripeConfig');
        await setActiveFn({ profileId });
    },
    testConnection: async (config: LucPayGatewayProfile): Promise<{ success: boolean; message: string }> => {
        const testConnFn = httpsCallable(functions, 'testStripeConnection');
        const result: any = await testConnFn({ config });
        return result.data;
    },
    getConnectedAccounts: async (): Promise<LucPayAccount[]> => {
        const getAccountsFn = httpsCallable(functions, 'getStripeConnectedAccounts');
        const result: any = await getAccountsFn();
        return result.data;
    },
    getTransactions: async (): Promise<LucPayTransaction[]> => {
        const getTransFn = httpsCallable(functions, 'getStripeTransactions');
        const result: any = await getTransFn();
        return result.data;
    },
    generateOnboardingLink: async (accountId: string): Promise<string> => {
        const genLinkFn = httpsCallable(functions, 'generateStripeOnboarding');
        const result: any = await genLinkFn({ accountId });
        return result.data.url;
    },
    completeConnect: async (code: string): Promise<{ success: boolean; stripeAccountId?: string }> => {
        const completeFn = httpsCallable(functions, 'completeStripeConnect');
        const result: any = await completeFn({ code });
        return result.data;
    },
    processPayment: async (amount: number, currency: string, method: string, configId: string, productId?: string): Promise<{ success: boolean; message: string; paymentUrl?: string }> => {
        const createSessionFn = httpsCallable(functions, 'createStripeCheckoutSession');
        const result: any = await createSessionFn({ amount, currency, configId, productId });
        return result.data;
    }
}

// ==========================================
// EXPORT SERVICE
// ==========================================
// Switch to 'FirebaseLucPayProvider' when deploying to Vercel/Production
const CURRENT_PROVIDER = FirebaseLucPayProvider;

export const LucPayService = {
    getConfigs: () => CURRENT_PROVIDER.getConfigs(),
    getConfigsSync: () => { // Legacy Sync for initial state
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored) as LucPayGatewayProfile[];
        return [DEFAULT_PROFILE];
    },
    saveConfig: (profile: LucPayGatewayProfile) => CURRENT_PROVIDER.saveConfig(profile),
    deleteConfig: (profileId: string) => CURRENT_PROVIDER.deleteConfig(profileId),
    setActiveConfig: (profileId: string) => CURRENT_PROVIDER.setActiveConfig(profileId),
    testConnection: (profile: LucPayGatewayProfile) => CURRENT_PROVIDER.testConnection(profile),
    getConnectedAccounts: () => CURRENT_PROVIDER.getConnectedAccounts(),
    getTransactions: () => CURRENT_PROVIDER.getTransactions(),
    generateOnboardingLink: (accountId: string) => CURRENT_PROVIDER.generateOnboardingLink(accountId),
    completeConnect: (code: string) => CURRENT_PROVIDER.completeConnect(code),
    processPayment: (amount: number, currency: string, method: string, configId: string, productId?: string) => CURRENT_PROVIDER.processPayment(amount, currency, method, configId, productId)
};
