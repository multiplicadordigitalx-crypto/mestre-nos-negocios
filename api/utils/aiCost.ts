export const AI_COSTS = {
    gemini: {
        inputToken: 0.000001, // R$ per token (Mock/Approx)
        outputToken: 0.000002,
        perRequestBase: 0.10 // Custo base mestre IA (ex: 10 centavos / msg) - Ajustável
    },
    elevenlabs: {
        perCharacter: 0.005, // R$ 0.005 por caractere
        base: 0.50 // Taxa mínima
    }
};

export const calculateGeminiCost = (inputLength: number, outputLength: number) => {
    // Estimativa grosseira: 1 char ~= 0.25 token
    const inputTokens = inputLength * 0.25;
    const outputTokens = outputLength * 0.25;

    return (
        AI_COSTS.gemini.perRequestBase +
        (inputTokens * AI_COSTS.gemini.inputToken) +
        (outputTokens * AI_COSTS.gemini.outputToken)
    );
};
