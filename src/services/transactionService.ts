
import { Transaction, TransactionStats, TransactionStatus } from '../types/finance';
import { functions } from './firebase';
import { httpsCallable } from "firebase/functions";

class TransactionService {
    public async getTransactions(filters: {
        search?: string,
        platform?: string,
        period?: 'day' | 'week' | 'month'
    }): Promise<Transaction[]> {
        try {
            const getTransFn = httpsCallable(functions, 'getStripeTransactions');
            const result: any = await getTransFn(filters);

            // The Cloud Function should return an array of objects matching the Transaction interface
            // or we map it here if the format is different.
            return result.data as Transaction[];
        } catch (error) {
            console.error("Error fetching transactions from Stripe:", error);
            return [];
        }
    }

    public async getStats(period: 'day' | 'week' | 'month'): Promise<TransactionStats> {
        try {
            const getStatsFn = httpsCallable(functions, 'getStripeStats');
            const result: any = await getStatsFn({ period });
            return result.data as TransactionStats;
        } catch (error) {
            console.error("Error fetching financial stats:", error);
            return {
                totalGross: 0,
                totalNet: 0,
                totalRefunds: 0,
                refundRate: 0,
                avgTicket: 0,
                count: 0
            };
        }
    }

    public async refund(txId: string, reason: string): Promise<boolean> {
        try {
            const refundFn = httpsCallable(functions, 'processStripeRefund');
            const result: any = await refundFn({ txId, reason });
            return result.data.success;
        } catch (error) {
            console.error("Error processing refund:", error);
            return false;
        }
    }

    public async getBalances(): Promise<{ available: number, pending: number, canceled: number }> {
        try {
            const getBalancesFn = httpsCallable(functions, 'getStripeBalances');
            const result: any = await getBalancesFn();
            return result.data;
        } catch (error) {
            console.error("Error fetching balances:", error);
            return { available: 0, pending: 0, canceled: 0 };
        }
    }
}

export const transactionService = new TransactionService();
