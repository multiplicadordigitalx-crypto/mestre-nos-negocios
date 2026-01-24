/**
 * Templates de email para o sistema
 */

interface TemplateData {
    [key: string]: string | number;
}

/**
 * Email de boas-vindas
 */
export const welcomeEmail = (name: string, loginUrl: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao Mestre nos Negócios</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #0f172a; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; }
        .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; color: #e2e8f0; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Bem-vindo, ${name}!</h1>
        </div>
        <div class="content">
            <p style="font-size: 16px; line-height: 1.6;">
                Você agora faz parte do <strong>Mestre nos Negócios</strong>, a plataforma de IA para empreendedores de alto desempenho.
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
                Aqui você terá acesso a:
            </p>
            <ul style="font-size: 15px; line-height: 1.8;">
                <li>🤖 Mentor IA com voz (ElevenLabs)</li>
                <li>⚖️ Consultor Jurídico</li>
                <li>🎬 Nexus Studio (criação de vídeos)</li>
                <li>📊 Dashboard de gestão completo</li>
            </ul>
            <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Acessar Plataforma</a>
            </div>
        </div>
        <div class="footer">
            <p>Mestre nos Negócios © 2026 | Todos os direitos reservados</p>
            <p style="margin-top: 10px;">
                <a href="https://mestrenosnegocios.com/suporte" style="color: #3b82f6; text-decoration: none;">Suporte</a> | 
                <a href="https://mestrenosnegocios.com/termos" style="color: #3b82f6; text-decoration: none;">Termos</a>
            </p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Email de recuperação de senha
 */
export const passwordResetEmail = (name: string, resetLink: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #0f172a; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; }
        .header { background: #dc2626; padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; }
        .content { padding: 40px 30px; color: #e2e8f0; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { background: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Recuperação de Senha</h1>
        </div>
        <div class="content">
            <p>Olá, ${name}!</p>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" class="button">Redefinir Senha</a>
            </div>
            <p style="color: #fbbf24; font-size: 14px;">
                ⚠️ Este link expira em 1 hora.
            </p>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 30px;">
                Se você não solicitou esta alteração, ignore este email.
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
 * Email de compra de créditos
 */
export const creditPurchaseEmail = (name: string, credits: number, amount: number) => `
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
        .highlight { background: #065f46; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .footer { background: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Compra Confirmada!</h1>
        </div>
        <div class="content">
            <p>Olá, ${name}!</p>
            <p>Sua compra de créditos foi processada com sucesso.</p>
            <div class="highlight">
                <h2 style="color: #10b981; margin: 0; font-size: 32px;">${credits} Créditos</h2>
                <p style="margin: 10px 0 0; color: #86efac;">Valor: R$ ${amount.toFixed(2)}</p>
            </div>
            <p>Os créditos já estão disponíveis em sua conta e podem ser usados para:</p>
            <ul>
                <li>🤖 Mentor IA</li>
                <li>⚖️ Consultor Jurídico</li>
                <li>🎬 Criação de Vídeos</li>
                <li>📊 Ferramentas Premium</li>
            </ul>
        </div>
        <div class="footer">
            <p>Mestre nos Negócios © 2026</p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Email de campanha personalizado
 */
export const campaignEmail = (content: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #0f172a; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; }
        .content { padding: 40px 30px; color: #e2e8f0; }
        .footer { background: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>Mestre nos Negócios © 2026</p>
            <p><a href="{{unsubscribe}}" style="color: #64748b;">Cancelar inscrição</a></p>
        </div>
    </div>
</body>
</html>
`;
