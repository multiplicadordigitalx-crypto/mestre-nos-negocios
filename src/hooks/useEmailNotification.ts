/**
 * Hook para facilitar envio de emails em toda aplicação
 */

import { sendEmail } from '../services/emailService';
import {
    welcomeEmail,
    passwordResetEmail,
    creditPurchaseEmail
} from '../services/emailTemplates';
import {
    confirmEmailTemplate,
    passwordChangedTemplate,
    newDeviceLoginTemplate
} from '../services/emailTemplates/auth';
import {
    purchaseReceiptTemplate,
    paymentFailedTemplate,
    refundProcessedTemplate,
    refundReversedTemplate,
    stripeTransferTemplate,
    withdrawalApprovedTemplate,
    affiliateCommissionTemplate
} from '../services/emailTemplates/financial';

import {
    affiliateInviteTemplate,
    coProducerInviteTemplate,
    teamMemberInviteTemplate,
    partnershipRequestTemplate
} from '../services/emailTemplates/invites';

export const useEmailNotification = () => {

    const sendWelcomeEmail = async (to: string, name: string, loginUrl: string) => {
        return await sendEmail({
            to,
            subject: '🚀 Bem-vindo ao Mestre nos Negócios!',
            html: welcomeEmail(name, loginUrl)
        });
    };

    const sendPasswordChanged = async (to: string, name: string) => {
        return await sendEmail({
            to,
            subject: '✅ Senha Alterada com Sucesso',
            html: passwordChangedTemplate(name)
        });
    };

    const sendPurchaseReceipt = async (to: string, order: any) => {
        return await sendEmail({
            to,
            subject: `✅ Recibo de Compra - ${order.productName}`,
            html: purchaseReceiptTemplate(order)
        });
    };

    const sendRefundNotification = async (to: string, name: string, amount: number, productName: string, refundId: string) => {
        return await sendEmail({
            to,
            subject: '💰 Reembolso Processado',
            html: refundProcessedTemplate(name, amount, productName, refundId)
        });
    };

    const sendRefundReversal = async (to: string, name: string, reason: string, productName: string, accessLink: string) => {
        return await sendEmail({
            to,
            subject: '🔄 Seu Acesso Foi Restaurado!',
            html: refundReversedTemplate(name, reason, productName, accessLink)
        });
    };

    const sendStripeTransfer = async (to: string, name: string, amount: number, date: string, bankAccount: string) => {
        return await sendEmail({
            to,
            subject: '💸 Transferência Recebida',
            html: stripeTransferTemplate(name, amount, date, bankAccount)
        });
    };

    const sendWithdrawalApproved = async (to: string, name: string, amount: number, when: string) => {
        return await sendEmail({
            to,
            subject: '✅ Saque Aprovado',
            html: withdrawalApprovedTemplate(name, amount, when)
        });
    };

    const sendAffiliateCommission = async (to: string, name: string, amount: number, productName: string, saleDate: string) => {
        return await sendEmail({
            to,
            subject: '🎉 Nova Comissão Recebida!',
            html: affiliateCommissionTemplate(name, amount, productName, saleDate)
        });
    };

    // Invite functions
    const sendAffiliateInvite = async (to: string, inviterName: string, productName: string, joinLink: string, commission: number) => {
        return await sendEmail({
            to,
            subject: `🤝 ${inviterName} convidou você para ser afiliado!`,
            html: affiliateInviteTemplate(inviterName, productName, joinLink, commission)
        });
    };

    const sendCoProducerInvite = async (to: string, inviterName: string, productName: string, joinLink: string) => {
        return await sendEmail({
            to,
            subject: `🎯 ${inviterName} quer criar um produto com você!`,
            html: coProducerInviteTemplate(inviterName, productName, joinLink)
        });
    };

    const sendTeamMemberInvite = async (to: string, inviterName: string, role: string, joinLink: string) => {
        return await sendEmail({
            to,
            subject: `👥 Convite para Equipe - ${role}`,
            html: teamMemberInviteTemplate(inviterName, role, joinLink)
        });
    };

    const sendPartnershipRequest = async (to: string, requesterName: string, productName: string, acceptLink: string, message?: string) => {
        return await sendEmail({
            to,
            subject: `🤝 Solicitação de Parceria - ${productName}`,
            html: partnershipRequestTemplate(requesterName, productName, acceptLink, message)
        });
    };

    return {
        sendWelcomeEmail,
        sendPasswordChanged,
        sendPurchaseReceipt,
        sendRefundNotification,
        sendRefundReversal,
        sendStripeTransfer,
        sendWithdrawalApproved,
        sendAffiliateCommission,
        // Invites
        sendAffiliateInvite,
        sendCoProducerInvite,
        sendTeamMemberInvite,
        sendPartnershipRequest,
    };
};
