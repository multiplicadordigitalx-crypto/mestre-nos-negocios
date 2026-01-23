
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

const GATEWAYS_COLLECTION = 'payment_gateways';
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
