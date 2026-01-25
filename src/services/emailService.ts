import { Resend } from 'resend';

// Inicializar Resend com API Key
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

if (!RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY não configurada');
}

export interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
}

/**
 * Envia email via Resend
 */
export const sendEmail = async (options: EmailOptions) => {
    const { to, subject, html, from, replyTo } = options;

    if (!resend) {
        console.error('Resend não configurado');
        return { success: false, error: 'Resend API key missing' };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: from || process.env.RESEND_FROM_EMAIL || 'Mestre nos Negócios <noreply@mestrenosnegocios.com>',
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            replyTo,
        });

        if (error) {
            console.error('❌ Erro Resend:', error);
            return { success: false, error };
        }

        console.log('✅ Email enviado via Resend:', { to, subject, id: data?.id });

        return {
            success: true,
            messageId: data?.id,
        };
    } catch (error: any) {
        console.error('❌ Erro ao enviar email:', error.message);

        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Envia email em lote
 */
export const sendBulkEmail = async (
    recipients: string[],
    subject: string,
    html: string
) => {
    if (!resend) {
        return { success: false, error: 'Resend not configured' };
    }

    try {
        const promises = recipients.map(recipient =>
            resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'Mestre nos Negócios <noreply@mestrenosnegocios.com>',
                to: recipient,
                subject,
                html,
            })
        );

        const results = await Promise.allSettled(promises);
        const successful = results.filter(r => r.status === 'fulfilled').length;

        console.log(`✅ Emails enviados: ${successful}/${recipients.length}`);

        return { success: true, count: successful, total: recipients.length };
    } catch (error: any) {
        console.error('❌ Erro bulk email:', error.message);
        return { success: false, error: error.message };
    }
};
