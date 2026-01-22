import { useState } from 'react';
import { useAuth } from './useAuth';
import { getToolCosts, consumeCredits, checkDailyAccess } from '../services/mockFirebase';
import toast from 'react-hot-toast';

export const useCreditGuard = () => {
    const { user, refreshUser } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    const checkAndConsume = async (toolId: string, narrative: string = 'Uso de Ferramenta', overrideCost?: number | { cost?: number, dailyLimit?: number, contextId?: string, onInsufficientFunds?: () => void }): Promise<boolean> => {
        setIsProcessing(true);
        try {
            // 1. Get Cost
            let cost = 0;
            if (overrideCost !== undefined) {
                cost = overrideCost;
            } else {
                const tools = await getToolCosts();
                const tool = tools.find(t => t.toolId === toolId);
                cost = tool ? tool.costPerTask : 0;
            }

            if (cost === 0) {
                setIsProcessing(false);
                return true; // Free tool
            }

            const userId = user?.uid;
            if (!userId) {
                toast.error("Usuário não identificado.");
                setIsProcessing(false);
                return false;
            }

            let dailyLimit = 0;
            let contextId = 'global';

            if (overrideCost && typeof overrideCost === 'object') {
                // @ts-ignore
                cost = overrideCost.cost || cost;
                // @ts-ignore
                dailyLimit = overrideCost.dailyLimit || 0;
                // @ts-ignore
                contextId = overrideCost.contextId || 'global';
            } else if (typeof overrideCost === 'number') {
                cost = overrideCost;
            }

            // 2. Check Daily Limit (Local "Free Tier" Cache)
            // Options allow passing a specific daily limit for this user/course context
            // If explicitCost is provided, we use that.

            // New Interface: checkAndConsume(toolId, narrative, { cost?: number, dailyLimit?: number, contextId?: string })
            // To maintain compatibility, we inspect arguments or assume overloaded usage? 
            // Better to add optional params to the function signature or use the existing overrideCost as part of an options object?
            // Current signature: (toolId, narrative, overrideCost)
            // I will strictly implement the logic inside here, but I need access to 'dailyLimit'.
            // Since I cannot easily change the signature everywhere without breaking code, 
            // I'll stick to 'overrideCost' being the 3rd arg. 
            // Where do I get 'dailyLimit'? Ideally it should be passed.
            // PROPOSAL: Change 3rd arg to accept object OR number.

            // A. Try Free Tier (Daily Limit)
            if (dailyLimit > 0) {
                // --- ACCESS DAY CHECK (AI ONLY) ---
                // Before using the daily limit, we must ensure the user has a valid "AI Access Key" for today.
                // This does NOT affect their login or video watching capabilities, only the "Free AI Credits".
                const accessCheck = await checkDailyAccess(userId);

                if (!accessCheck.authorized) {
                    // Message clarified: "Franquia Grátis Expirada" instead of generic "Plano Expirado"
                    toast.error("Franquia Diária Gratuita Expirada!", { icon: '🚫' });
                    toast("Usando saldo da carteira pessoal...", { icon: '💳' });
                } else {
                    // Access Valid (Day Paid). Now check Minute/Token Limit.
                    if (accessCheck.message === 'Day Consumed') {
                        toast("Novo Dia de Acesso Iniciado! (-1 Dia)", { icon: '🗓️' });
                    }

                    const todayKey = `daily_usage_${userId}_${contextId}_${new Date().toDateString()}`;
                    const currentUsage = parseFloat(localStorage.getItem(todayKey) || '0');

                    if (currentUsage + cost <= dailyLimit) {
                        // Success: Consume from Daily Limit
                        localStorage.setItem(todayKey, (currentUsage + cost).toString());
                        toast.success(`Uso Diário: ${currentUsage + cost}/${dailyLimit}`, { icon: '🎁', duration: 2000 });
                        setIsProcessing(false);
                        return true;
                    }
                    // If failed, fall through to Wallet Check below
                    toast("Limite diário esgotado. Verificando carteira...", { icon: '💳' });
                }
            }

            // B. Attempt Consumption (Backend Wallet)
            const result = await consumeCredits(userId, toolId, cost, narrative, false);

            if (result.success) {
                await refreshUser();
                toast.success(result.message, { icon: '✅', duration: 2500 });
                setIsProcessing(false);
                return true;
            }

            // B. Handle Failures
            if (result.code === 'DAILY_LIMIT_EXCEEDED') {
                // --- TRIGGER CONFIRMATION ---
                // "Your daily limit is over. Do you want to use your Wallet Balance?"
                // Note: We are inside an async function. We can use window.confirm for simplicity or a custom Modal.
                // Given the request for "Pop-up de consumo", window.confirm is the robust native way, 
                // but a custom UI would be better. For now, we use confirm to ensure blocking flow works.

                const confirmWallet = window.confirm(
                    `⚠️ LIMITE DIÁRIO ATINGIDO!\n\nVocê consumiu todas as suas interações gratuitas de hoje.\n\nDeseja continuar usando seu SALDO DA CARTEIRA (-${cost} créditos)?`
                );

                if (confirmWallet) {
                    // Retry with forceWallet = true
                    const walletResult = await consumeCredits(userId, toolId, cost, narrative, true);

                    if (walletResult.success) {
                        await refreshUser();
                        toast.success(`-${cost} Créditos (Carteira)`, { icon: '💳' });
                        setIsProcessing(false);
                        return true;
                    } else {
                        // Wallet also failed
                        if (walletResult.code === 'INSUFFICIENT_FUNDS_WALLET') {
                            if (typeof overrideCost === 'object' && overrideCost.onInsufficientFunds) {
                                overrideCost.onInsufficientFunds();
                            } else if (window.confirm("Saldo insuficiente na carteira. Deseja Recarregar?")) {
                                window.location.href = '/painel/credits'; // Or use navigate if available in context
                            }
                        } else {
                            toast.error(walletResult.message);
                        }
                        setIsProcessing(false);
                        return false;
                    }
                } else {
                    setIsProcessing(false);
                    return false; // User cancelled
                }
            } else if (result.code === 'INSUFFICIENT_FUNDS_WALLET') {
                // Should likely not happen on first try if daily limit works, but just in case
                // Should likely not happen on first try if daily limit works, but just in case
                if (typeof overrideCost === 'object' && overrideCost.onInsufficientFunds) {
                    overrideCost.onInsufficientFunds();
                } else if (window.confirm("Saldo e Limite Insuficientes. Ir para Recarga?")) {
                    window.location.href = '/painel/credits';
                }
                setIsProcessing(false);
                return false;
            } else {
                toast.error(result.message);
                setIsProcessing(false);
                return false;
            }

        } catch (error) {
            console.error("Credit Guard Error", error);
            toast.error("Erro ao processar créditos.");
            setIsProcessing(false);
            return false;
        }
    };

    return { checkAndConsume, isProcessing };
};
