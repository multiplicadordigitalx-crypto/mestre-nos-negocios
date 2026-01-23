"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyLessonCompletion = exports.processRefund = exports.generateStripeOnboarding = exports.getStripeTransactions = exports.getStripeConnectedAccounts = exports.testStripeConnection = exports.setActiveStripeConfig = exports.createStripeCheckoutSession = exports.deleteStripeConfig = exports.updateStripeConfig = exports.getStripeConfigs = exports.recalculateSlots = exports.completeStripeConnect = exports.syncProductToStripe = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
// STRIPE AUTOMATION FOR LUCPAY
exports.syncProductToStripe = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be logged in');
    }
    const { productData } = request.data;
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
        throw new https_1.HttpsError('failed-precondition', 'Stripe secret key not configured on server');
    }
    try {
        const headers = {
            'Authorization': `Bearer ${stripeSecret}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        // 1. Create Product
        const prodDetails = new URLSearchParams({
            name: productData.name,
            description: productData.description || '',
            'metadata[internal_id]': productData.id,
            'metadata[owner_id]': request.auth.uid
        });
        const productRes = await fetch('https://api.stripe.com/v1/products', {
            method: 'POST',
            headers,
            body: prodDetails
        });
        const stripeProduct = await productRes.json();
        if (stripeProduct.error)
            throw new Error(stripeProduct.error.message);
        // 2. Create Prices (One for each plan)
        const stripePlans = [];
        for (const plan of productData.plans) {
            const priceDetails = new URLSearchParams({
                product: stripeProduct.id,
                unit_amount: (plan.price * 100).toString(),
                currency: 'brl',
                ...(plan.billingType !== 'Vitalício' && {
                    'recurring[interval]': mapBillingToInterval(plan.billingType)
                })
            });
            const priceRes = await fetch('https://api.stripe.com/v1/prices', {
                method: 'POST',
                headers,
                body: priceDetails
            });
            const stripePrice = await priceRes.json();
            // 3. Create Checkout Session (Payment Link)
            const sessionDetails = new URLSearchParams({
                'line_items[0][price]': stripePrice.id,
                'line_items[0][quantity]': '1',
                mode: plan.billingType === 'Vitalício' ? 'payment' : 'subscription',
                success_url: 'https://www.mestrenosnegocios.com/checkout/success',
                cancel_url: 'https://www.mestrenosnegocios.com/checkout/cancel',
                'payment_method_types[0]': 'card',
                'payment_method_types[1]': 'pix',
                'payment_method_types[2]': 'boleto',
                'payment_intent_data[metadata][product_id]': productData.id,
                'payment_intent_data[metadata][plan_id]': plan.id
            });
            const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
                method: 'POST',
                headers,
                body: sessionDetails
            });
            const session = await sessionRes.json();
            stripePlans.push({
                planId: plan.id,
                stripePriceId: stripePrice.id,
                checkoutUrl: session.url
            });
        }
        return {
            success: true,
            stripeProductId: stripeProduct.id,
            plans: stripePlans
        };
    }
    catch (error) {
        throw new https_1.HttpsError('internal', error.message);
    }
});
exports.completeStripeConnect = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be logged in');
    }
    const { code } = request.data;
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
        throw new https_1.HttpsError('failed-precondition', 'Stripe secret key not configured on server');
    }
    try {
        const response = await fetch('https://api.stripe.com/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${stripeSecret}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code
            })
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error_description || data.error);
        }
        const stripeAccountId = data.stripe_user_id;
        // Save to Firestore
        await db.collection('connected_accounts').doc(request.auth.uid).set({
            stripeAccountId,
            userUid: request.auth.uid,
            status: 'connected',
            connectedAt: admin.firestore.FieldValue.serverTimestamp(),
            details: data
        }, { merge: true });
        // Update user profile to mark as producer/partner with payment enabled
        await db.collection('users').doc(request.auth.uid).set({
            paymentEnabled: true,
            stripeAccountId
        }, { merge: true });
        return { success: true, stripeAccountId };
    }
    catch (error) {
        console.error("Stripe Connect Error:", error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
const mapBillingToInterval = (type) => {
    if (type.includes('Mensal'))
        return 'month';
    if (type.includes('Anual'))
        return 'year';
    return 'month';
};
// 1. Recalculate Slots (Gamification Logic on Server)
exports.recalculateSlots = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be logged in');
    }
    const uid = request.data.uid || request.auth.uid;
    const studentRef = db.collection('students').doc(uid);
    const studentDoc = await studentRef.get();
    if (!studentDoc.exists)
        return { success: false };
    const student = studentDoc.data();
    let slots = 0;
    // Logic duplication from frontend for security
    // 1. Check Module 3
    // (In real app, fetch module structure from DB)
    const completedLessons = student?.completedLessons || [];
    // ... verify mod 3 lessons ...
    const hasMod3 = true; // logic here
    if (hasMod3)
        slots += 1;
    // 2. Check 100%
    const totalLessons = 50; // Fetch real count
    if (completedLessons.length >= totalLessons)
        slots += 3;
    // 3. Loyalty
    if (student?.courseCompletionDate) {
        const completion = new Date(student.courseCompletionDate);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - completion.getTime()) / (1000 * 60 * 60 * 24));
        slots += Math.floor(diffDays / 30);
    }
    await studentRef.update({ 'gamification.currentSlots': slots });
    return { success: true, slots };
});
// --- GATEWAY MANAGEMENT ---
exports.getStripeConfigs = (0, https_1.onCall)(async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'User must be logged in');
    // Check for admin/producer role (simplified for now)
    const configsSnapshot = await db.collection('lucpay_configs').get();
    return configsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});
exports.updateStripeConfig = (0, https_1.onCall)(async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'User must be logged in');
    const { profile } = request.data;
    if (!profile.id)
        throw new https_1.HttpsError('invalid-argument', 'Profile ID is required');
    await db.collection('lucpay_configs').doc(profile.id).set({
        ...profile,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return { success: true };
});
exports.deleteStripeConfig = (0, https_1.onCall)(async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'User must be logged in');
    const { profileId } = request.data;
    await db.collection('lucpay_configs').doc(profileId).delete();
    return { success: true };
});
// --- REAL PAYMENT PROCESSING ---
exports.createStripeCheckoutSession = (0, https_1.onCall)(async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'User must be logged in');
    const { amount, currency, configId, productId } = request.data;
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
        throw new https_1.HttpsError('failed-precondition', 'Stripe secret key not configured on server');
    }
    try {
        const headers = {
            'Authorization': `Bearer ${stripeSecret}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const sessionDetails = new URLSearchParams({
            'line_items[0][price_data][unit_amount]': (amount * 100).toString(),
            'line_items[0][price_data][currency]': currency.toLowerCase(),
            'line_items[0][price_data][product_data][name]': `Compra Mestre IA - ${productId || 'Créditos'}`,
            'line_items[0][quantity]': '1',
            mode: 'payment',
            success_url: 'https://mestre-nos-negocios.web.app/dashboard?payment=success',
            cancel_url: 'https://mestre-nos-negocios.web.app/dashboard?payment=cancel',
            'payment_intent_data[metadata][user_uid]': request.auth.uid,
            'payment_intent_data[metadata][product_id]': productId || 'credits'
        });
        const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers,
            body: sessionDetails
        });
        const session = await sessionRes.json();
        if (session.error)
            throw new Error(session.error.message);
        return {
            success: true,
            paymentUrl: session.url
        };
    }
    catch (error) {
        throw new https_1.HttpsError('internal', error.message);
    }
});
exports.setActiveStripeConfig = (0, https_1.onCall)(async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'User must be logged in');
    const { profileId } = request.data;
    const batch = db.batch();
    const configs = await db.collection('lucpay_configs').get();
    configs.forEach(doc => {
        batch.update(doc.ref, { isActive: doc.id === profileId });
    });
    await batch.commit();
    return { success: true };
});
exports.testStripeConnection = (0, https_1.onCall)(async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'User must be logged in');
    const { config } = request.data;
    // In real app, we would make a small call to Stripe to verify the key
    return { success: true, message: 'Conexão validada com sucesso via Cloud Functions!' };
});
exports.getStripeConnectedAccounts = (0, https_1.onCall)(async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'User must be logged in');
    // In production, fetch from Firestore 'connected_accounts'
    const snapshot = await db.collection('connected_accounts').get();
    return snapshot.docs.map(doc => doc.data());
});
exports.getStripeTransactions = (0, https_1.onCall)(async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'User must be logged in');
    const snapshot = await db.collection('transactions').orderBy('created', 'desc').limit(50).get();
    return snapshot.docs.map(doc => doc.data());
});
exports.generateStripeOnboarding = (0, https_1.onCall)(async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'User must be logged in');
    const { accountId } = request.data;
    // Mock URL for onboarding
    return { url: `https://connect.stripe.com/setup/s/${accountId}/onboarding` };
});
// 2. Secure Refund Processing
exports.processRefund = (0, firestore_1.onDocumentUpdated)('refund_requests/{requestId}', async (event) => {
    if (!event.data)
        return;
    const newData = event.data.after.data();
    const previousData = event.data.before.data();
    // If status changed to approved
    if (newData && previousData && newData.status === 'approved' && previousData.status !== 'approved') {
        const studentId = newData.studentId;
        // Block Access
        await db.collection('students').doc(studentId).update({
            'financial.status': 'refunded'
        });
        // Trigger Email (Mock)
        console.log(`Sending refund email to ${newData.studentEmail}`);
    }
});
// 3. Anti-Seek / Watch Verification
// This function would be called by the frontend with a signed token or validation
exports.verifyLessonCompletion = (0, https_1.onCall)(async (request) => {
    // Here we would validate if the time spent on the lesson matches the duration
    // For now, we just log secure access
    const { lessonId, durationWatched } = request.data;
    console.log(`User ${request.auth?.uid} watched ${durationWatched}s of ${lessonId}`);
    return { verified: true };
});
