
import { db } from './firebase';
import { doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { toast } from 'react-hot-toast';

export interface CreditConsumptionResult {
    success: boolean;
    message?: string;
    newBalance?: number;
    allowanceUsed?: number;
    walletUsed?: number;
}

class CreditService {
    /**
     * Consumes credits from a user's balance using a Firestore transaction.
     * Ensures balance never goes negative and handles race conditions.
     */
    public async consumeCredits(
        userId: string,
        amount: number,
        description: string
    ): Promise<CreditConsumptionResult> {
        if (!db) return { success: false, message: "Database not initialized" };

        const userRef = doc(db, 'students', userId);

        try {
            const result = await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userRef);

                if (!userDoc.exists()) {
                    throw new Error("Usuário não encontrado.");
                }

                const currentBalance = userDoc.data()?.creditBalance || 0;
                const accessDaysBank = userDoc.data()?.accessDaysBank || 0;
                const dailyMestreIALimit = userDoc.data()?.dailyMestreIALimit || 50;
                const lastAccessDate = userDoc.data()?.lastAccessDate || ''; // ISO Date string (YYYY-MM-DD)
                const dailyUsage = userDoc.data()?.dailyUsage || 0;

                const today = new Date().toISOString().split('T')[0];
                let effectiveDailyUsage = dailyUsage;
                let effectiveAccessDaysBank = accessDaysBank;

                // 1. Detect New Access Day
                if (lastAccessDate !== today) {
                    if (accessDaysBank > 0) {
                        // Consume 1 day from the bank and reset usage
                        effectiveAccessDaysBank = accessDaysBank - 1;
                        effectiveDailyUsage = 0;
                    } else {
                        // No access days left, so no daily allowance for the new day
                        effectiveDailyUsage = dailyMestreIALimit;
                    }
                }

                // 2. Hierarchy Check
                const availableAllowance = Math.max(0, dailyMestreIALimit - effectiveDailyUsage);
                let amountToDebitFromAllowance = 0;
                let amountToDebitFromWallet = 0;

                if (availableAllowance >= amount) {
                    amountToDebitFromAllowance = amount;
                } else {
                    amountToDebitFromAllowance = availableAllowance;
                    amountToDebitFromWallet = amount - availableAllowance;
                }

                // 3. Wallet Balance Check
                if (amountToDebitFromWallet > 0 && currentBalance < amountToDebitFromWallet) {
                    throw new Error(`Saldo insuficiente. Você usou sua franquia diária e precisa de mais ${amountToDebitFromWallet} créditos na carteira.`);
                }

                const newBalance = currentBalance - amountToDebitFromWallet;
                const newDailyUsage = effectiveDailyUsage + amountToDebitFromAllowance;

                // 4. Update Document
                transaction.update(userRef, {
                    creditBalance: newBalance,
                    dailyUsage: newDailyUsage,
                    accessDaysBank: effectiveAccessDaysBank,
                    lastAccessDate: today,
                    updatedAt: serverTimestamp()
                });

                // 5. Log the consumption
                const logRef = doc(db, `students/${userId}/credit_logs`, `log_${Date.now()}`);
                transaction.set(logRef, {
                    type: 'usage',
                    amount: -amount,
                    description,
                    breakdown: {
                        allowanceUsed: amountToDebitFromAllowance,
                        walletUsed: amountToDebitFromWallet
                    },
                    remainingDays: effectiveAccessDaysBank,
                    newBalance: newBalance,
                    timestamp: serverTimestamp()
                });

                return { newBalance, allowanceUsed: amountToDebitFromAllowance, walletUsed: amountToDebitFromWallet };
            });

            return {
                success: true,
                newBalance: result.newBalance,
                allowanceUsed: result.allowanceUsed,
                walletUsed: result.walletUsed
            };
        } catch (error: any) {
            console.error("Credit consumption failed:", error);
            // toast.error(error.message); // Usually handled by the caller UI
            return { success: false, message: error.message };
        }
    }

    /**
     * Gets the current real-time balance for a user.
     */
    public async getBalance(userId: string): Promise<number> {
        if (!db) return 0;
        const userDoc = await getDoc(doc(db, 'students', userId));
        return userDoc.data()?.creditBalance || 0;
    }
}

export const creditService = new CreditService();
