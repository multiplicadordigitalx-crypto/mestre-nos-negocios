import { sendEmail } from '../src/services/emailService';
import { welcomeEmail } from '../src/services/emailTemplates';

async function testResend() {
    console.log('🚀 Testando Resend Email...\n');

    const result = await sendEmail({
        to: 'multiplicadordigitalx@gmail.com',
        subject: '✅ Teste Resend - Mestre nos Negócios',
        html: welcomeEmail(
            'Equipe Mestre',
            'https://mestrenosnegocios.com/login'
        )
    });

    if (result.success) {
        console.log('✅ Email enviado com sucesso!');
        console.log(`📧 Message ID: ${result.messageId}`);
        console.log('\n📬 Verifique a caixa de entrada de multiplicadordigitalx@gmail.com');
    } else {
        console.error('❌ Erro ao enviar email:', result.error);
    }
}

testResend();
