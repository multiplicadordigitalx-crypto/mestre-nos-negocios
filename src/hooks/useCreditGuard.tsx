import { getToolCosts } from '../services/mockFirebase';
import { creditService } from '../services/creditService';
import toast from 'react-hot-toast';

export const useCreditGuard = () => {
    const { user, refreshUser } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    const checkAndConsume = async (toolId: string, narrative: string = 'Uso de Ferramenta', overrideCost?: number): Promise<boolean> => {
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

            // 2. Consume Real Credits
            const result = await creditService.consumeCredits(userId, cost, narrative);

            if (result.success) {
                await refreshUser();

                if (result.walletUsed && result.walletUsed > 0) {
                    if (result.allowanceUsed && result.allowanceUsed > 0) {
                        toast.success(`Uso Misto: -${result.allowanceUsed} (Franquia) e -${result.walletUsed} (Carteira)`, { icon: '💳', duration: 3000 });
                    } else {
                        toast.success(`-${result.walletUsed} Créditos da Carteira`, { icon: '💳', duration: 2500 });
                    }
                } else {
                    toast.success(`-${result.allowanceUsed} Créditos da Franquia`, { icon: '🎁', duration: 2500 });
                }

                setIsProcessing(false);
                return true;
            }

            // 3. Handle Lack of Credits
            if (result.message?.includes("insuficiente")) {
                const wantsToRecharge = window.confirm(`⚠️ SALDO INSUFICIENTE!\n\nEsta ação custa ${cost} créditos.\n\nDeseja ir para a página de Recarga agora?`);
                if (wantsToRecharge) {
                    window.location.href = '/painel/recharge';
                }
            } else {
                toast.error(result.message || "Erro ao processar créditos.");
            }

            setIsProcessing(false);
            return false;

        } catch (error) {
            console.error("Credit Guard Error", error);
            toast.error("Erro ao processar créditos.");
            setIsProcessing(false);
            return false;
        }
    };

    return { checkAndConsume, isProcessing };
};
