
import { Course, TrainingModule } from '../types/legacy';

export interface AICostEstimation {
    curriculumCredits: number;
    accessVoucherCredits: number;
    totalCredits: number;
    totalCostBRL: number; // For deduction calculation
    safetyMarginPercent: number;
}

class AICostEstimator {
    private CREDIT_VALUE_BRL = 0.15; // Standard value for internal calculation
    private COST_PER_MODULE = 10;
    private COST_PER_LESSON = 5;
    private DEFAULT_SAFETY_MARGIN = 1.25; // 25% safety margin

    /**
     * Estimates the total credit requirement for a course lifecycle.
     */
    public estimateCourseCost(
        modules: TrainingModule[],
        accessDays: number = 45,
        dailyAllowance: number = 50
    ): AICostEstimation {
        // 1. Calculate Curriculum Build Cost
        const modulesCount = modules.length;
        const totalLessonsCount = modules.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0);

        const curriculumCredits = (modulesCount * this.COST_PER_MODULE) + (totalLessonsCount * this.COST_PER_LESSON);

        // 2. Calculate Access Voucher Cost (The Daily Passes)
        const accessVoucherCredits = accessDays * dailyAllowance;

        // 3. Sum and Apply Margin
        const subtotal = curriculumCredits + accessVoucherCredits;
        const totalCredits = Math.ceil(subtotal * this.DEFAULT_SAFETY_MARGIN);

        // 4. Convert to BRL (The value to be deducted at checkout)
        const totalCostBRL = totalCredits * this.CREDIT_VALUE_BRL;

        return {
            curriculumCredits,
            accessVoucherCredits,
            totalCredits,
            totalCostBRL,
            safetyMarginPercent: (this.DEFAULT_SAFETY_MARGIN - 1) * 100
        };
    }

    /**
     * Formatting helper for reports
     */
    public formatEstimation(estimation: AICostEstimation) {
        return {
            title: "Planilha de Custos Operacionais (COGS)",
            breakdown: [
                { label: "Processamento de Grade (AI)", value: `${estimation.curriculumCredits} cr` },
                { label: "Passes Diários (Voucher)", value: `${estimation.accessVoucherCredits} cr` },
                { label: "Margem de Segurança", value: `${estimation.safetyMarginPercent}%` },
                { label: "Custo Total da Operação", value: `R$ ${estimation.totalCostBRL.toFixed(2)}` }
            ]
        };
    }
}

export const aiCostEstimator = new AICostEstimator();
