export interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
}

export const sendEmail = async (options: EmailOptions) => {
    const { to, subject, html } = options;
    const SERVER_URL = 'http://localhost:3001'; // Local Go Backend

    try {
        console.log('📨 Enviando via Backend Proxy:', { to, subject });

        const response = await fetch(`${SERVER_URL}/api/emails/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: Array.isArray(to) ? to[0] : to, // Simple handling for now
                subject,
                html
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Resend returns 'message', GoProxy returns 'error'
            throw new Error(data.message || data.error || 'Falha no Proxy de Email');
        }

        console.log('✅ Email enviado via Proxy:', data);

        return {
            success: true,
            messageId: data.id,
        };
    } catch (error: any) {
        console.error('❌ Erro no envio (Proxy):', error.message);

        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Envia email em lote (Via Proxy)
 */
export const sendBulkEmail = async (
    recipients: string[],
    subject: string,
    html: string
) => {
    try {
        // Envia UM POR UM via proxy (pode ser otimizado no futuro para batch no backend)
        const promises = recipients.map(recipient =>
            sendEmail({ to: recipient, subject, html })
        );

        const results = await Promise.allSettled(promises);
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

        console.log(`✅ Emails em lote enviados: ${successful}/${recipients.length}`);

        return { success: true, count: successful, total: recipients.length };
    } catch (error: any) {
        console.error('❌ Erro bulk email:', error.message);
        return { success: false, error: error.message };
    }
};
