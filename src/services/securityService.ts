
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const securityService = {
  /**
   * Valida a senha com base em regras de segurança corporativa reforçadas.
   * Regras:
   * 1. Mínimo 8 caracteres
   * 2. Pelo menos uma maiúscula
   * 3. Pelo menos uma minúscula
   * 4. Pelo menos um número
   * 5. Pelo menos um caractere especial (!@#$%^&*...)
   * 6. Não conter partes do nome ou email
   * 7. Não ser uma senha comum (lista negra)
   */
  validatePassword(password: string, context?: { email?: string; name?: string }): ValidationResult {
    const errors: string[] = [];

    if (!password) return { isValid: false, errors: ['Senha é obrigatória.'] };

    // Regra 1: Tamanho mínimo
    if (password.length < 8) {
      errors.push("A senha deve ter no mínimo 8 caracteres.");
    }

    // Regra 2: Complexidade
    if (!/[A-Z]/.test(password)) {
      errors.push("Falta uma letra maiúscula.");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Falta uma letra minúscula.");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Falta um número.");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Falta um caractere especial (ex: ! @ # $).");
    }

    // Regra 3: Bloqueio de termos óbvios e contexto
    const blockedTerms = ['123456', '12345678', 'password', 'senha', 'admin', 'mestre', 'trocar123', 'suporte', 'teste'];
    
    if (context?.email) {
      const emailUser = context.email.split('@')[0];
      const emailParts = emailUser.split(/[._-]/);
      blockedTerms.push(emailUser);
      blockedTerms.push(...emailParts.filter(p => p.length >= 4));
    }
    
    if (context?.name) {
        const nameParts = context.name.toLowerCase().split(' ');
        blockedTerms.push(...nameParts.filter(p => p.length >= 4));
    }

    const lowerPass = password.toLowerCase();
    const foundBlockedTerm = blockedTerms.find(term => lowerPass.includes(term.toLowerCase()));
    
    if (foundBlockedTerm) {
      errors.push("A senha contém termos muito previsíveis (nome, e-mail ou sequências comuns).");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
