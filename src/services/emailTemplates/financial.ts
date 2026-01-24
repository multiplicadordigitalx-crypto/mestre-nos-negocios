/**
 * Email Templates - Transações Financeiras
 */

interface Order {
    id: string;
    date: string;
    productName: string;
    amount: number;
    paymentMethod: string;
    customerName: string;
    customerEmail: string;
}

/**
 * Recibo de compra completo
 */
export const purchaseReceiptTemplate = (order: Order) => `
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
        .receipt-box { background: #334155; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #475569; }
        .receipt-row:last-child { border-bottom: none; font-weight: bold; font-size: 18px; }
        .footer { background: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Compra Confirmada!</h1>
        </div>
        <div class="content">
            <p>Olá, <strong>${order.customerName}</strong>!</p>
            <p>Sua compra foi aprovada com sucesso. Confira os detalhes abaixo:</p>
            
            <div class="receipt-box">
                <h3 style="margin-top: 0; color: #10b981;">Recibo de Pagamento</h3>
                <div class="receipt-row">
                    <span>Pedido:</span>
                    <span><strong>${order.id}</strong></span>
                </div>
                <div class="receipt-row">
                    <span>Data:</span>
                    <span>${order.date}</span>
                </div>
                <div class="receipt-row">
                    <span>Produto:</span>
                    <span>${order.productName}</span>
                </div>
                <div class="receipt-row">
                    <span>Forma de Pagamento:</span>
                    <span>${order.paymentMethod}</span>
                </div>
                <div class="receipt-row" style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #10b981;">
                    <span>TOTAL PAGO:</span>
                    <span style="color: #10b981;">R$ ${order.amount.toFixed(2)}</span>
                </div>
            </div>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://mestrenosnegocios.com/painel" style="display: inline-block; background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Acessar Plataforma
                </a>
            </p>

            <p style="color: #94a3b8; font-size: 13px;">
                Este é um recibo eletrônico. Guarde para seus registros.
            </p>
        </div>
        <div class="footer">
            <p>Mestre nos Negócios © 2026 | CNPJ: 00.000.000/0001-00</p>
            <p style="margin-top: 10px;">
                <a href="https://mestrenosnegocios.com/termos" style="color: #3b82f6; text-decoration: none;">Termos de Uso</a> | 
                <a href="https://mestrenosnegocios.com/suporte" style="color: #3b82f6; text-decoration: none;">Suporte</a>
            </p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Falha no pagamento
 */
export const paymentFailedTemplate = (name: string, reason: string, retryLink: string) => `
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
            <h1>❌ Falha no Pagamento</h1>
        </div>
        <div class="content">
            <p>Olá, ${name}!</p>
            <p>Infelizmente, não conseguimos processar seu pagamento.</p>
            <p><strong>Motivo:</strong> ${reason}</p>
            
            <p style="margin-top: 30px;">O que fazer:</p>
            <ul style="line-height: 1.8;">
                <li>Verifique os dados do cartão</li>
                <li>Confirme se há saldo/limite disponível</li>
                <li>Tente outro método de pagamento</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${retryLink}" class="button">Tentar Novamente</a>
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
 * Reembolso processado
 */
export const refundProcessedTemplate = (name: string, amount: number, productName: string, refundId: string) => `
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
        .info-box { background: #334155; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 Reembolso Processado</h1>
        </div>
        <div class="content">
            <p>Olá, ${name}!</p>
            <p>Seu pedido de reembolso foi aprovado e processado.</p>
            
            <div class="info-box">
                <p style="margin: 5px 0;"><strong>Produto:</strong> ${productName}</p>
                <p style="margin: 5px 0;"><strong>Valor:</strong> R$ ${amount.toFixed(2)}</p>
                <p style="margin: 5px 0;"><strong>ID do Reembolso:</strong> ${refundId}</p>
            </div>

            <p style="color: #fbbf24;">
                ⏱ O valor será creditado em até 7 dias úteis, dependendo da operadora do cartão.
            </p>

            <p style="color: #94a3b8; font-size: 13px; margin-top: 30px;">
                Sentimos muito por não ter atendido suas expectativas. Se mudar de ideia, estamos aqui!
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
 * Reversão de reembolso
 */
export const refundReversedTemplate = (name: string, reason: string, productName: string, accessLink: string) => `
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
        .button { display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { background: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔄 Reembolso Revertido</h1>
        </div>
        <div class="content">
            <p>Olá, ${name}!</p>
            <p>Seu reembolso foi <strong>cancelado/revertido</strong> e seu acesso foi restaurado!</p>
            
            <p><strong>Motivo:</strong> ${reason}</p>
            <p><strong>Produto:</strong> ${productName}</p>

            <p style="margin-top: 30px;">Seu acesso está ativo novamente. Aproveite todo o conteúdo!</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${accessLink}" class="button">Acessar Agora</a>
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
 * Transferência Stripe recebida
 */
export const stripeTransferTemplate = (name: string, amount: number, date: string, bankAccount: string) => `
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
            <h1>💸 Transferência Recebida!</h1>
        </div>
        <div class="content">
            <p>Olá, ${name}!</p>
            <p>Você recebeu uma transferência Stripe em sua conta bancária.</p>
            
            <div class="highlight">
                <h2 style="color: #10b981; margin: 0; font-size: 32px;">R$ ${amount.toFixed(2)}</h2>
                <p style="margin: 10px 0 0; color: #86efac;">Transferido para ${bankAccount}</p>
            </div>

            <p style="color: #94a3b8; font-size: 13px;">
                <strong>Data:</strong> ${date}<br>
                O valor deve aparecer em sua conta em até 2 dias úteis.
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
 * Saque aprovado
 */
export const withdrawalApprovedTemplate = (name: string, amount: number, when: string) => `
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
            <h1>✅ Saque Aprovado!</h1>
        </div>
        <div class="content">
            <p>Olá, ${name}!</p>
            <p>Seu pedido de saque foi aprovado.</p>
            
            <p><strong>Valor:</strong> R$ ${amount.toFixed(2)}</p>
            <p><strong>Previsão de depósito:</strong> ${when}</p>

            <p style="color: #10b981; margin-top: 30px;">
                💰 O valor será depositado em sua conta cadastrada.
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
 * Comissão de afiliado paga
 */
export const affiliateCommissionTemplate = (name: string, amount: number, productName: string, saleDate: string) => `
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
        .highlight { background: #4c1d95; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .footer { background: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Comissão Recebida!</h1>
        </div>
        <div class="content">
            <p>Olá, ${name}!</p>
            <p>Parabéns! Você ganhou uma nova comissão.</p>
            
            <div class="highlight">
                <h2 style="color: #a78bfa; margin: 0; font-size: 32px;">R$ ${amount.toFixed(2)}</h2>
                <p style="margin: 10px 0 0; color: #c4b5fd;">Comissão creditada!</p>
            </div>

            <p><strong>Produto vendido:</strong> ${productName}</p>
            <p><strong>Data da venda:</strong> ${saleDate}</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="https://mestrenosnegocios.com/wallet" style="display: inline-block; background: #8b5cf6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Ver Minha Carteira
                </a>
            </p>
        </div>
        <div class="footer">
            <p>Mestre nos Negócios © 2026</p>
        </div>
    </div>
</body>
</html>
`;
