
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

const GATEWAYS_COLLECTION = 'payment_gateways';
const WHATSAPP_COLLECTION = 'whatsapp_instances';
const DOMAINS_COLLECTION = 'domain_providers';
const CONFIGS_COLLECTION = 'lucpay_configs';

export const getPaymentGateways = async (): Promise<PaymentGateway[]> => {
    const querySnapshot = await getDocs(collection(db, GATEWAYS_COLLECTION));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentGateway));
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
    const docRef = doc(db, CONFIGS_COLLECTION, 'routing_rules');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as RoutingRules;
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
    let q = query(collection(db, WHATSAPP_COLLECTION));
    if (engine) {
        q = query(collection(db, WHATSAPP_COLLECTION), where('engine', '==', engine));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WhatsAppInstance));
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
    const querySnapshot = await getDocs(collection(db, DOMAINS_COLLECTION));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DomainProvider));
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
