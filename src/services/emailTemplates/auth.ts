/**
 * Email Templates - Autenticação & Segurança
 */

/**
 * Email de confirmação de conta
 */
export const confirmEmailTemplate = (name: string, confirmLink: string) => `
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
        .button { display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Confirme seu Email</h1>
        </div>
        <div class="content">
            <p>Olá, ${name}!</p>
            <p>Clique no botão abaixo para confirmar seu email e ativar sua conta:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmLink}" class="button">Confirmar Email</a>
            </div>
            <p style="color: #fbbf24; font-size: 14px;">
                ⚠️ Este link expira em 24 horas.
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
 * Email de senha alterada com sucesso
 */
export const passwordChangedTemplate = (name: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #0f172a; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; }
        .header { background: #10b981; padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; }
        .content { padding: 40px 30px; color: #e2e8f0; }
        .footer { background: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Senha Alterada</h1>
        </div>
        <div class="content">
            <p>Olá, ${name}!</p>
            <p>Sua senha foi alterada com sucesso.</p>
            <p style="color: #fbbf24; margin-top: 30px;">
                ⚠️ Se você não fez esta alteração, <a href="https://mestrenosnegocios.com/suporte" style="color: #3b82f6;">entre em contato imediatamente</a>.
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
 * Email de alerta de novo dispositivo
 */
export const newDeviceLoginTemplate = (name: string, device: string, location: string, timestamp: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #0f172a; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; }
        .header { background: #f59e0b; padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; }
        .content { padding: 40px 30px; color: #e2e8f0; }
        .info-box { background: #334155; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 Novo Acesso Detectado</h1>
        </div>
        <div class="content">
            <p>Olá, ${name}!</p>
            <p>Detectamos um login na sua conta de um novo dispositivo:</p>
            <div class="info-box">
                <p style="margin: 5px 0;"><strong>Dispositivo:</strong> ${device}</p>
                <p style="margin: 5px 0;"><strong>Localização:</strong> ${location}</p>
                <p style="margin: 5px 0;"><strong>Data/Hora:</strong> ${timestamp}</p>
            </div>
            <p style="color: #fbbf24;">
                ⚠️ Se não foi você, <a href="https://mestrenosnegocios.com/security" style="color: #dc2626; font-weight: bold;">altere sua senha imediatamente</a>.
            </p>
        </div>
        <div class="footer">
            <p>Mestre nos Negócios © 2026</p>
        </div>
    </div>
</body>
</html>
`;
