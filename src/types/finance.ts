export type TransactionStatus = 'approved' | 'refunded' | 'pending' | 'failed' | 'processing' | 'chargeback' | 'dispute';
export type TransactionType = 'sale' | 'refund' | 'withdrawal' | 'chargeback';

export interface AuditLog {
    id: string;
    action: string;
    timestamp: number;
    userId: string;
    userName: string;
    details: string;
    metadata?: any;
}

export interface Customer {
    name: string;
    email: string;
    cpf: string;
    ip?: string;
    phone?: string;
}

export interface PaymentDetails {
    method: 'credit_card' | 'pix' | 'boleto';
    provider: 'Stripe' | 'Hotmart' | 'Eduzz' | 'Kiwify' | 'Vindi';
    providerId: string; // The ID in Stripe/Hotmart/etc
    pixKey?: string;
    cardLast4?: string;
    cardBrand?: string;
    installments?: number;
}

export interface Transaction {
    id: string; // Internal system ID
    amount: number;
    platformFee: number;
    netAmount: number;
    status: TransactionStatus;
    type: TransactionType;
    productName: string;
    productId: string;
    customer: Customer;
    payment: PaymentDetails;
    createdAt: number;
    updatedAt: number;
    auditLogs: AuditLog[];
    refundReason?: string;
    unlockDate: number; // For withdrawals
}

export interface TransactionStats {
    totalGross: number;
    totalNet: number;
    totalRefunds: number;
    refundRate: number;
    avgTicket: number;
    count: number;
}
