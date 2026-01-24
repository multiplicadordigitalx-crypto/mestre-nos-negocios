/**
 * Email Templates - Convites & Parcerias
 */

/**
 * Convite de afiliado
 */
export const affiliateInviteTemplate = (
    inviterName: string,
    productName: string,
    joinLink: string,
    commission: number
) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #0f172a; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; }
        .header { background: linear-gradient(135deg, #8b5cf6, #6d28d9); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; }
        .content { padding: 40px 30px; color: #e2e8f0; }
        .highlight { background: #4c1d95; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #8b5cf6; }
        .button { display: inline-block; background: #8b5cf6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { background: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤝 Convite para Parceria</h1>
        </div>
        <div class="content">
            <p>Você foi convidado por <strong>${inviterName}</strong> para se tornar afiliado!</p>
            
            <div class="highlight">
                <h2 style="color: #a78bfa; margin: 0; font-size: 28px;">${productName}</h2>
                <p style="margin: 15px 0 0; color: #c4b5fd; font-size: 24px; font-weight: bold;">${commission}% de Comissão</p>
            </div>

            <p><strong>Como funciona:</strong></p>
            <ul style="line-height: 1.8;">
                <li>Receba ${commission}% de comissão em cada venda</li>
                <li>Acesso a materiais promocionais exclusivos</li>
                <li>Dashboard completo com estatísticas</li>
                <li>Pagamentos automáticos via Stripe</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${joinLink}" class="button">ACEITAR CONVITE</a>
            </div>

            <p style="color: #fbbf24; font-size: 14px; text-align: center;">
                ⏱ Este convite expira em 7 dias
            </p>
        </div>
        <div class="footer">
            <p>Mestre nos Negócios © 2026</p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Convite de coprodutor
 */
export const coProducerInviteTemplate = (
    inviterName: string,
    productName: string,
    joinLink: string
) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #0f172a; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; }
        .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; }
        .content { padding: 40px 30px; color: #e2e8f0; }
        .highlight { background: #1e40af; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #3b82f6; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { background: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Convite de Coprodução</h1>
        </div>
        <div class="content">
            <p><strong>${inviterName}</strong> quer criar um produto com você!</p>
            
            <div class="highlight">
                <h2 style="color: #60a5fa; margin: 0; font-size: 24px;">${productName}</h2>
                <p style="margin: 10px 0 0; color: #93c5fd;">Coprodução Compartilhada</p>
            </div>

            <p><strong>Vantagens:</strong></p>
            <ul style="line-height: 1.8;">
                <li>Split automático de receitas</li>
                <li>Acesso total ao dashboard do produto</li>
                <li>Gestão compartilhada de conteúdo</li>
                <li>Estatísticas em tempo real</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${joinLink}" class="button">ACEITAR PARCERIA</a>
            </div>
        </div>
        <div class="footer">
            <p>Mestre nos Negócios © 2026</p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Convite para membro da equipe
 */
export const teamMemberInviteTemplate = (
    inviterName: string,
    role: string,
    joinLink: string
) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #0f172a; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; }
        .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; }
        .content { padding: 40px 30px; color: #e2e8f0; }
        .role-badge { background: #065f46; color: #86efac; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
        .button { display: inline-block; background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { background: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>👥 Convite para Equipe</h1>
        </div>
        <div class="content">
            <p><strong>${inviterName}</strong> convidou você para fazer parte da equipe!</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <div class="role-badge">${role}</div>
            </div>

            <p><strong>Suas responsabilidades:</strong></p>
            <ul style="line-height: 1.8;">
                ${getRoleResponsibilities(role)}
            </ul>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${joinLink}" class="button">ACEITAR CONVITE</a>
            </div>
        </div>
        <div class="footer">
            <p>Mestre nos Negócios © 2026</p>
        </div>
    </div>
</body>
</html>
`;

function getRoleResponsibilities(role: string): string {
    const responsibilities: Record<string, string[]> = {
        'Sales': [
            'Gerenciar leads e funil de vendas',
            'Fechar vendas e atingir metas',
            'Acesso ao CRM completo'
        ],
        'Support': [
            'Atender tickets de suporte',
            'Resolver dúvidas dos clientes',
            'Acesso ao sistema de chat'
        ],
        'Admin': [
            'Acesso total à plataforma',
            'Gerenciar usuários e produtos',
            'Relatórios financeiros completos'
        ],
        'Finance': [
            'Aprovar pagamentos e saques',
            'Auditoria financeira',
            'Gestão de comissões'
        ]
    };

    const tasks = responsibilities[role] || ['Acesso conforme definido'];
    return tasks.map(task => `<li>${task}</li>`).join('');
}

/**
 * Solicitação de parceria
 */
export const partnershipRequestTemplate = (
    requesterName: string,
    productName: string,
    acceptLink: string,
    message?: string
) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #0f172a; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; }
        .content { padding: 40px 30px; color: #e2e8f0; }
        .message-box { background: #334155; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 5px; }
        .button-secondary { background: #6b7280; }
        .footer { background: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤝 Solicitação de Parceria</h1>
        </div>
        <div class="content">
            <p><strong>${requesterName}</strong> quer fazer parceria com você!</p>
            <p><strong>Produto:</strong> ${productName}</p>
            
            ${message ? `
            <div class="message-box">
                <strong>Mensagem:</strong>
                <p style="margin: 10px 0 0;">${message}</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
                <a href="${acceptLink}?action=accept" class="button">ACEITAR</a>
                <a href="${acceptLink}?action=decline" class="button button-secondary">RECUSAR</a>
            </div>
        </div>
        <div class="footer">
            <p>Mestre nos Negócios © 2026</p>
        </div>
    </div>
</body>
</html>
`;
