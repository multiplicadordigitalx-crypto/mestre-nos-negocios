
import { db } from './firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';

export interface PaymentGateway {
    id: string;
    provider: string;
    name: string;
    apiKey: string;
    secretKey?: string;
    webhookSecret?: string;
    status: 'active' | 'inactive';
    volumeProcessed: number;
    updatedAt: any;
}

export interface RoutingRules {
    pix: string;
    creditCard: string;
    boleto: string;
    international: string;
}

export interface WhatsAppInstance {
    id: string;
    instanceName: string;
    status: 'connected' | 'disconnected';
    phone?: string;
    profilePic?: string;
    battery?: number;
    lastActivity?: any;
    engine: 'whatsmeow' | 'evolution';
    port?: number;
    ram?: string;
    goroutines?: number;
}

export interface DomainProvider {
    id: string;
    name: string;
    type: string;
    status: 'active' | 'inactive';
    domain: string;
    apiKey: string;
    zoneId?: string;
    dnsRecords: number;
    product: string;
    updatedAt: any;
}

export interface WebhookIntegration {
    id: string;
    name: string;
    platform: string;
    status: 'active' | 'inactive';
    eventsToday: number;
    lastEvent: string;
    url: string;
    action: string;
    product: string;
    updatedAt: any;
}

export interface SmtpConfig {
    id: string;
    host: string;
    port: string;
    user: string;
    password?: string;
    senderName: string;
    senderEmail: string;
    product: string;
    status: 'active' | 'inactive';
    updatedAt: any;
}

export interface AIConfig {
    id: string;
    name: string;
    status: 'connected' | 'missing';
    key: string;
    capabilities: string[];
    updatedAt: any;
}

export interface TrafficAccount {
    id: string;
    name: string;
    platform: string;
    accountId: string;
    pixelId?: string;
    status: 'active' | 'inactive';
    product: string;
    updatedAt: any;
}

export interface SocialApiIntegration {
    id: string;
    platform: 'YouTube' | 'TikTok' | 'Instagram' | 'Facebook' | 'LinkedIn' | 'Pinterest' | 'Twitter';
    name: string;
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    redirectUri?: string;
    status: 'active' | 'inactive';
    lastConnection?: string;
    scopes?: string[];
    updatedAt: any;
}

const GATEWAYS_COLLECTION = 'payment_gateways';
const WHATSAPP_COLLECTION = 'whatsapp_instances';
const DOMAINS_COLLECTION = 'domain_providers';
const WEBHOOKS_COLLECTION = 'webhooks';
const SMTP_COLLECTION = 'smtp_configs';
const AI_COLLECTION = 'ai_configs';
const TRAFFIC_COLLECTION = 'traffic_accounts';
const SOCIAL_COLLECTION = 'social_apis';
const CONFIGS_COLLECTION = 'lucpay_configs';

// Helper to check if current user should have silent fallback (no error UI)
const isSuperAdmin = () => {
    try {
        const stored = localStorage.getItem('user');
        if (!stored) return false;
        const u = JSON.parse(stored);
        return u.role === 'super_admin' || (u.permissions && u.permissions.all);
    } catch {
        return false;
    }
};



export const getPaymentGateways = async (): Promise<PaymentGateway[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, GATEWAYS_COLLECTION));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentGateway));
    } catch (error: any) {
        if (isSuperAdmin() && error.code === 'permission-denied') {
            console.info("Firestore: Acesso silenciado para admin (Gateways)");
            return [];
        }
        throw error;
    }
};



export const savePaymentGateway = async (gateway: PaymentGateway) => {
    const docRef = doc(db, GATEWAYS_COLLECTION, gateway.id);
    await setDoc(docRef, {
        ...gateway,
        updatedAt: new Date()
    }, { merge: true });
};

export const deletePaymentGateway = async (id: string) => {
    await deleteDoc(doc(db, GATEWAYS_COLLECTION, id));
};

export const getRoutingRules = async (): Promise<RoutingRules> => {
    try {
        const docRef = doc(db, CONFIGS_COLLECTION, 'routing_rules');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as RoutingRules;
        }
    } catch (error: any) {
        if (isSuperAdmin() && error.code === 'permission-denied') {
            console.info("Firestore: Acesso silenciado para admin (Routing Rules)");
        } else {
            throw error;
        }
    }

    // Default fallback
    return {
        pix: '',
        creditCard: '',
        boleto: '',
        international: ''
    };
};




export const saveRoutingRules = async (rules: RoutingRules) => {
    const docRef = doc(db, CONFIGS_COLLECTION, 'routing_rules');
    await setDoc(docRef, {
        ...rules,
        updatedAt: new Date()
    }, { merge: true });
};

export const getWhatsAppInstances = async (engine?: 'whatsmeow' | 'evolution'): Promise<WhatsAppInstance[]> => {
    try {
        let q = query(collection(db, WHATSAPP_COLLECTION));
        if (engine) {
            q = query(collection(db, WHATSAPP_COLLECTION), where('engine', '==', engine));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WhatsAppInstance));
    } catch (error: any) {
        if (isSuperAdmin() && error.code === 'permission-denied') {
            console.info("Firestore: Acesso silenciado para admin (WhatsApp)");
            return [];
        }
        throw error;
    }
};



export const saveWhatsAppInstance = async (instance: WhatsAppInstance) => {
    const docRef = doc(db, WHATSAPP_COLLECTION, instance.id);
    await setDoc(docRef, {
        ...instance,
        updatedAt: new Date()
    }, { merge: true });
};

export const deleteWhatsAppInstance = async (id: string) => {
    await deleteDoc(doc(db, WHATSAPP_COLLECTION, id));
};

export const getDomainProviders = async (): Promise<DomainProvider[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, DOMAINS_COLLECTION));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DomainProvider));
    } catch (error: any) {
        if (isSuperAdmin() && error.code === 'permission-denied') {
            console.info("Firestore: Acesso silenciado para admin (Domains)");
            return [];
        }
        throw error;
    }
};



export const saveDomainProvider = async (provider: DomainProvider) => {
    const docRef = doc(db, DOMAINS_COLLECTION, provider.id);
    await setDoc(docRef, {
        ...provider,
        updatedAt: new Date()
    }, { merge: true });
};

export const deleteDomainProvider = async (id: string) => {
    await deleteDoc(doc(db, DOMAINS_COLLECTION, id));
};

// Webhooks
export const getWebhooks = async (): Promise<WebhookIntegration[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, WEBHOOKS_COLLECTION));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WebhookIntegration));
    } catch (error: any) {
        if (isSuperAdmin() && error.code === 'permission-denied') {
            console.info("Firestore: Acesso silenciado para admin (Webhooks)");
            return [];
        }
        throw error;
    }
};



export const saveWebhook = async (webhook: WebhookIntegration) => {
    const docRef = doc(db, WEBHOOKS_COLLECTION, webhook.id);
    await setDoc(docRef, { ...webhook, updatedAt: new Date() }, { merge: true });
};

export const deleteWebhook = async (id: string) => {
    await deleteDoc(doc(db, WEBHOOKS_COLLECTION, id));
};

// SMTP
export const getSmtpConfigs = async (): Promise<SmtpConfig[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, SMTP_COLLECTION));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SmtpConfig));
    } catch (error: any) {
        if (isSuperAdmin() && error.code === 'permission-denied') {
            console.info("Firestore: Acesso silenciado para admin (SMTP)");
            return [];
        }
        throw error;
    }
};



export const saveSmtpConfig = async (config: SmtpConfig) => {
    const docRef = doc(db, SMTP_COLLECTION, config.id);
    await setDoc(docRef, { ...config, updatedAt: new Date() }, { merge: true });
};

export const deleteSmtpConfig = async (id: string) => {
    await deleteDoc(doc(db, SMTP_COLLECTION, id));
};

// AI Brains
export const getAIConfigs = async (): Promise<AIConfig[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, AI_COLLECTION));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AIConfig));
    } catch (error: any) {
        if (isSuperAdmin() && error.code === 'permission-denied') {
            console.info("Firestore: Acesso silenciado para admin (AI)");
            return [];
        }
        throw error;
    }
};



export const saveAIConfig = async (config: AIConfig) => {
    const docRef = doc(db, AI_COLLECTION, config.id);
    await setDoc(docRef, { ...config, updatedAt: new Date() }, { merge: true });
};

export const deleteAIConfig = async (id: string) => {
    await deleteDoc(doc(db, AI_COLLECTION, id));
};

// Traffic Accounts
export const getTrafficAccounts = async (): Promise<TrafficAccount[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, TRAFFIC_COLLECTION));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrafficAccount));
    } catch (error: any) {
        if (isSuperAdmin() && error.code === 'permission-denied') {
            console.info("Firestore: Acesso silenciado para admin (Traffic)");
            return [];
        }
        throw error;
    }
};



export const saveTrafficAccount = async (account: TrafficAccount) => {
    const docRef = doc(db, TRAFFIC_COLLECTION, account.id);
    await setDoc(docRef, { ...account, updatedAt: new Date() }, { merge: true });
};

export const deleteTrafficAccount = async (id: string) => {
    await deleteDoc(doc(db, TRAFFIC_COLLECTION, id));
};

// Social APIs
export const getSocialApis = async (): Promise<SocialApiIntegration[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, SOCIAL_COLLECTION));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialApiIntegration));
    } catch (error: any) {
        if (isSuperAdmin() && error.code === 'permission-denied') {
            console.info("Firestore: Acesso silenciado para admin (Social)");
            return [];
        }
        throw error;
    }
};



export const saveSocialApi = async (integration: SocialApiIntegration) => {
    const docRef = doc(db, SOCIAL_COLLECTION, integration.id);
    await setDoc(docRef, { ...integration, updatedAt: new Date() }, { merge: true });
};

export const deleteSocialApi = async (id: string) => {
    await deleteDoc(doc(db, SOCIAL_COLLECTION, id));
};
