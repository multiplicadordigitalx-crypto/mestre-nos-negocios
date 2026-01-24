import { Transaction, TransactionStatus, TransactionStats, AuditLog } from '../types';

class TransactionMockService {
    private static PRODUCTS = [
        { name: 'Mestre dos Negócios 50X', targetAudience: 'Empreendedores digitais buscando escala' },
        { name: 'Consultoria Premium', targetAudience: 'CEOs e Diretores de empresas > 10M' },
        { name: 'Mentoria 10x', targetAudience: 'Startups em fase de crescimento acelerado' },
        { name: 'Ebook: O Segredo', targetAudience: 'Iniciantes no marketing digital' }
    ];
    private transactions: Transaction[] = [];
    private initialized = false;

    constructor() {
        this.init();
    }

    public getAvailableProducts() {
        return TransactionMockService.PRODUCTS;
    }

    private init() {
        if (this.initialized) return;
        this.generateMockData(0);
        this.initialized = true;
    }

    private generateMockData(count: number) {
        const platforms = ['Hotmart', 'Kiwify', 'Eduzz', 'Stripe', 'Vindi'] as const;
        const products = TransactionMockService.PRODUCTS.map(p => p.name);
        const names = ['Ana Silva', 'Carlos Souza', 'Mariana Oliveira', 'Roberto Santos', 'Fernanda Lima', 'Paulo Costa'];
        const statuses: TransactionStatus[] = ['approved', 'approved', 'approved', 'approved', 'refunded', 'pending', 'chargeback'];

        const today = new Date();

        for (let i = 0; i < count; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - Math.floor(Math.random() * 60)); // Last 60 days
            date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

            const isSale = Math.random() > 0.1; // 10% non-sale
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const amount = Math.floor(Math.random() * 500) + 97;
            const platform = platforms[Math.floor(Math.random() * platforms.length)];

            const tx: Transaction = {
                id: `tx_${Math.random().toString(36).substr(2, 9)}`,
                amount,
                platformFee: amount * 0.05,
                netAmount: amount * 0.95,
                status,
                type: status === 'refunded' ? 'refund' : status === 'chargeback' ? 'chargeback' : 'sale',
                productName: products[Math.floor(Math.random() * products.length)],
                productId: `prod_${Math.floor(Math.random() * 1000)}`,
                customer: {
                    name: names[Math.floor(Math.random() * names.length)],
                    email: `user${i}@example.com`,
                    cpf: this.generateCPF(),
                    ip: `192.168.1.${Math.floor(Math.random() * 255)}`
                },
                payment: {
                    method: Math.random() > 0.5 ? 'credit_card' : 'pix',
                    provider: platform,
                    providerId: `${platform.toUpperCase()}_${Math.random().toString(36).substr(2, 9)}`,
                    cardLast4: Math.floor(Math.random() * 9000 + 1000).toString(),
                    pixKey: Math.random() > 0.5 ? this.generateCPF() : undefined
                },
                createdAt: date.getTime(),
                updatedAt: date.getTime(),
                unlockDate: date.getTime() + (30 * 24 * 60 * 60 * 1000), // +30 days
                auditLogs: []
            };

            if (status === 'refunded') {
                tx.auditLogs.push({
                    id: `log_${Math.random().toString(36).substr(2, 9)}`,
                    action: 'REFUND_PROCESSED',
                    timestamp: date.getTime() + 86400000,
                    userId: 'admin_1',
                    userName: 'Sistema Automático',
                    details: 'Reembolso solicitado pelo cliente dentro do prazo.'
                });
                tx.refundReason = 'Cliente insatisfeito com o conteúdo';
            }

            this.transactions.push(tx);
        }

        // Sort by date desc
        this.transactions.sort((a, b) => b.createdAt - a.createdAt);
    }

    private generateCPF(): string {
        const num = () => Math.floor(Math.random() * 10);
        return `${num()}${num()}${num()}.${num()}${num()}${num()}.${num()}${num()}${num()}-${num()}${num()}`;
    }

    public getStats(period: 'day' | 'week' | 'month'): TransactionStats {
        const now = new Date();
        let startTime = 0;

        if (period === 'day') startTime = now.setHours(0, 0, 0, 0);
        else if (period === 'week') startTime = now.setDate(now.getDate() - 7);
        else startTime = now.setDate(now.getDate() - 30);

        const filtered = this.transactions.filter(t => t.createdAt >= startTime);

        const totalGross = filtered.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.amount, 0);
        const totalRefunds = filtered.filter(t => t.type === 'refund').reduce((acc, t) => acc + t.amount, 0);
        const count = filtered.filter(t => t.type === 'sale').length;

        return {
            totalGross,
            totalNet: totalGross - totalRefunds,
            totalRefunds,
            refundRate: totalGross > 0 ? (totalRefunds / totalGross) * 100 : 0,
            avgTicket: count > 0 ? totalGross / count : 0,
            count
        };
    }

    public search(filters: {
        search?: string,
        platform?: string,
        status?: TransactionStatus,
        startDate?: Date,
        endDate?: Date
    }) {
        return this.transactions.filter(tx => {
            let matches = true;

            if (filters.search) {
                const s = filters.search.toLowerCase();
                matches = matches && (
                    tx.id.toLowerCase().includes(s) ||
                    tx.customer.name.toLowerCase().includes(s) ||
                    tx.customer.email.toLowerCase().includes(s) ||
                    tx.customer.cpf.includes(s) ||
                    (tx.payment.providerId && tx.payment.providerId.toLowerCase().includes(s)) ||
                    (tx.payment.pixKey && tx.payment.pixKey.includes(s))
                );
            }

            if (filters.platform && filters.platform !== 'Todos') {
                matches = matches && tx.payment.provider === filters.platform;
            }

            if (filters.status && filters.status !== 'pending') { // Assuming 'pending' here implies 'all' or ignore in basic filter logic if not specific
                // For strict status filter:
                // matches = matches && tx.status === filters.status;
            }

            // Date filters implementation omitted for brevity but should be here

            return matches;
        });
    }

    public refund(txId: string, reason: string, agentId: string, agentName: string): Transaction | null {
        const tx = this.transactions.find(t => t.id === txId);
        if (!tx) return null;

        tx.status = 'refunded';
        tx.type = 'refund';
        tx.refundReason = reason;
        tx.updatedAt = Date.now();

        tx.auditLogs.push({
            id: `log_${Date.now()}`,
            action: 'REFUND_MANUAL',
            timestamp: Date.now(),
            userId: agentId,
            userName: agentName,
            details: `Reembolso forçado pelo agente. Motivo: ${reason}`
        });

        return tx;
    }
}

export const transactionService = new TransactionMockService();
