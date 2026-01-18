
export interface SecurityAnalysis {
    riskLevel: 'low' | 'medium' | 'high';
    warning?: string;
    details?: string;
}

export const analyzeAgentMessage = (message: string): SecurityAnalysis => {
    const lowerMsg = message.toLowerCase();

    // High Risk: Credit Card patterns, CVV, Passwords
    const creditCardRegex = /\b(?:\d[ -]*?){13,16}\b/;
    const cvvRegex = /\b\d{3,4}\b/;
    const passwordKeywords = ['senha', 'password', 'pin', 'código de segurança', 'token'];

    if (creditCardRegex.test(message)) {
        return {
            riskLevel: 'high',
            warning: 'ALERTA CRÍTICO: Detecção de possível número de cartão de crédito. Esta ação é estritamente proibida.',
            details: 'Credit Card Pattern Detected'
        };
    }

    // Check for password requests context
    if (passwordKeywords.some(kw => lowerMsg.includes(kw))) {
        // Refine context: "resetar senha" is okay, "me passa sua senha" is not.
        if (lowerMsg.includes('me passa') || lowerMsg.includes('qual é') || lowerMsg.includes('informe')) {
            return {
                riskLevel: 'high',
                warning: 'ALERTA DE SEGURANÇA: Nunca solicite senhas ou tokens de acesso aos usuários.',
                details: 'Password Solicitation Detected'
            };
        }
    }

    // Medium Risk: PII that might be sensitive but sometimes necessary
    const cpfRegex = /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/;
    if (cpfRegex.test(message)) {
        return {
            riskLevel: 'medium',
            warning: 'ATENÇÃO: Você está manipulando um CPF. Confirme se é estritamente necessário para o atendimento.',
            details: 'CPF Detected'
        };
    }

    return { riskLevel: 'low' };
};
