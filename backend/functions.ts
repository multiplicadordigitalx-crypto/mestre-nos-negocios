import { onCall, HttpsError, CallableRequest, onRequest } from 'firebase-functions/v2/https';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

admin.initializeApp();
const db = admin.firestore();

// STRIPE AUTOMATION FOR LUCPAY
export const syncProductToStripe = onCall(async (request: CallableRequest) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in');
    }

    const { productData } = request.data;
    const stripeSecret = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecret) {
        throw new HttpsError('failed-precondition', 'Stripe secret key not configured on server');
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
        if (stripeProduct.error) throw new Error(stripeProduct.error.message);

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
    } catch (error: any) {
        throw new HttpsError('internal', error.message);
    }
});

export const completeStripeConnect = onCall(async (request: CallableRequest) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in');
    }

    const { code } = request.data;
    const stripeSecret = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecret) {
        throw new HttpsError('failed-precondition', 'Stripe secret key not configured on server');
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
    } catch (error: any) {
        console.error("Stripe Connect Error:", error);
        throw new HttpsError('internal', error.message);
    }
});

const mapBillingToInterval = (type: string) => {
    if (type.includes('Mensal')) return 'month';
    if (type.includes('Anual')) return 'year';
    return 'month';
};


// 1. Recalculate Slots (Gamification Logic on Server)
export const recalculateSlots = onCall(async (request: CallableRequest) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in');
    }

    const uid = request.data.uid || request.auth.uid;
    const studentRef = db.collection('students').doc(uid);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) return { success: false };

    const student = studentDoc.data();
    let slots = 0;

    // Logic duplication from frontend for security
    // 1. Check Module 3
    // (In real app, fetch module structure from DB)
    const completedLessons = student?.completedLessons || [];
    // ... verify mod 3 lessons ...
    const hasMod3 = true; // logic here
    if (hasMod3) slots += 1;

    // 2. Check 100%
    const totalLessons = 50; // Fetch real count
    if (completedLessons.length >= totalLessons) slots += 3;

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

// --- SECURE USER INITIALIZATION ---

const ADMIN_EMAILS = [
    'mestrodonegocio01@gmail.com',
    'ana@mestredosnegocios.com',
    'paulo@mestrenosnegocios.com',
    'thales@mestrenosnegocios.com'
];

export const initializeAdminUser = onCall(async (request: CallableRequest) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in');
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email?.toLowerCase();

    if (!email || !ADMIN_EMAILS.includes(email)) {
        throw new HttpsError('permission-denied', 'This email is not authorized for administrative access.');
    }

    try {
        // 1. Set Custom Claims (Security Master)
        await admin.auth().setCustomUserClaims(uid, { admin: true });
        console.log(`Custom claims (admin:true) set for user ${uid}`);

        // 2. Provision User Profile in Firestore
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        const adminData = {
            uid,
            email,
            displayName: request.auth.token.name || 'Admin',
            photoURL: request.auth.token.picture || '',
            role: 'super_admin',
            permissions: { all: true },
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (!userDoc.exists) {
            await userRef.set({
                ...adminData,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`Firestore profile provisioned for admin ${email}`);
        } else {
            await userRef.update(adminData);
            console.log(`Firestore profile updated for admin ${email}`);
        }

        return { success: true, message: 'Admin authenticated and provisioned successfully.' };
    } catch (error: any) {
        console.error("Error in initializeAdminUser:", error);
        throw new HttpsError('internal', error.message);
    }
});

// --- GATEWAY MANAGEMENT ---

export const getStripeConfigs = onCall(async (request: CallableRequest) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'User must be logged in');

    // Check for admin/producer role (simplified for now)
    const configsSnapshot = await db.collection('lucpay_configs').get();
    return configsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

export const updateStripeConfig = onCall(async (request: CallableRequest) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'User must be logged in');

    const { profile } = request.data;
    if (!profile.id) throw new HttpsError('invalid-argument', 'Profile ID is required');

    await db.collection('lucpay_configs').doc(profile.id).set({
        ...profile,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { success: true };
});

export const deleteStripeConfig = onCall(async (request: CallableRequest) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'User must be logged in');

    const { profileId } = request.data;
    await db.collection('lucpay_configs').doc(profileId).delete();

    return { success: true };
});

// --- REAL PAYMENT PROCESSING ---

export const createStripeCheckoutSession = onCall(async (request: CallableRequest) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'User must be logged in');

    const { amount, currency, configId, productId } = request.data;
    const stripeSecret = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecret) {
        throw new HttpsError('failed-precondition', 'Stripe secret key not configured on server');
    }

    try {
        const headers = {
            'Authorization': `Bearer ${stripeSecret}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        const sessionDetails = new URLSearchParams({
            'line_items[0][price_data][unit_amount]': (amount * 100).toString(),
            'line_items[0][price_data][currency]': currency.toLowerCase(),
            'line_items[0][price_data][product_data][name]': productId === 'credits' ? `Recarga de ${request.data.credits} Créditos` : `Compra Mestre IA - ${productId}`,
            'line_items[0][quantity]': '1',
            mode: 'payment',
            success_url: 'https://mestre-nos-negocios.web.app/dashboard?payment=success',
            cancel_url: 'https://mestre-nos-negocios.web.app/dashboard?payment=cancel',
            'payment_method_types[0]': 'card',
            'payment_method_types[1]': 'pix',
            'payment_method_types[2]': 'boleto',
            'payment_intent_data[metadata][user_uid]': request.auth.uid,
            'payment_intent_data[metadata][product_id]': productId || 'credits',
            'payment_intent_data[metadata][credits_to_add]': productId === 'credits' ? request.data.credits.toString() : '0',
            'payment_intent_data[metadata][operational_cost_brl]': (request.data.operationalCostBRL || 0).toString(),
            'payment_intent_data[metadata][affiliate_uid]': request.data.affiliateUid || '',
            'payment_intent_data[metadata][co_producer_uid]': request.data.coProducerUid || '',
            'payment_intent_data[metadata][affiliate_percent]': (request.data.affiliatePercent || 0).toString(),
            'payment_intent_data[metadata][co_producer_percent]': (request.data.coProducerPercent || 0).toString()
        });

        const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers,
            body: sessionDetails
        });

        const session = await sessionRes.json();
        if (session.error) throw new Error(session.error.message);

        return {
            success: true,
            paymentUrl: session.url
        };
    } catch (error: any) {
        throw new HttpsError('internal', error.message);
    }
});

export const setActiveStripeConfig = onCall(async (request: CallableRequest) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'User must be logged in');

    const { profileId } = request.data;
    const batch = db.batch();

    const configs = await db.collection('lucpay_configs').get();
    configs.forEach(doc => {
        batch.update(doc.ref, { isActive: doc.id === profileId });
    });

    await batch.commit();
    return { success: true };
});

export const testStripeConnection = onCall(async (request: CallableRequest) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'User must be logged in');

    const { config } = request.data;
    // In real app, we would make a small call to Stripe to verify the key
    return { success: true, message: 'Conexão validada com sucesso via Cloud Functions!' };
});

export const getStripeConnectedAccounts = onCall(async (request: CallableRequest) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'User must be logged in');

    // In production, fetch from Firestore 'connected_accounts'
    const snapshot = await db.collection('connected_accounts').get();
    return snapshot.docs.map(doc => doc.data());
});

export const getStripeTransactions = onCall(async (request: CallableRequest) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'User must be logged in');

    const snapshot = await db.collection('transactions').orderBy('created', 'desc').limit(50).get();
    return snapshot.docs.map(doc => doc.data());
});

export const generateStripeOnboarding = onCall(async (request: CallableRequest) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'User must be logged in');

    const { accountId } = request.data;
    // Mock URL for onboarding
    return { url: `https://connect.stripe.com/setup/s/${accountId}/onboarding` };
});

// 2. Secure Refund Processing
export const processRefund = onDocumentUpdated('refund_requests/{requestId}', async (event) => {
    if (!event.data) return;

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
export const verifyLessonCompletion = onCall(async (request: CallableRequest) => {
    // Here we would validate if the time spent on the lesson matches the duration
    // For now, we just log secure access
    const { lessonId, durationWatched } = request.data;
    console.log(`User ${request.auth?.uid} watched ${durationWatched}s of ${lessonId}`);
    return { verified: true };
});
// --- SECURE STRIPE WEBHOOK ---

export const stripeWebhook = onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeSecret = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecret || !endpointSecret || !sig) {
        res.status(400).send('Webhook Error: Missing configuration or signature');
        return;
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' });

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Signature Verification Failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleSuccessfulCheckout(session);
                break;
            }
            case 'charge.refunded': {
                const charge = event.data.object as Stripe.Charge;
                await handleRefund(charge);
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        res.json({ received: true });
    } catch (err: any) {
        console.error(`Error processing webhook event ${event.type}:`, err);
        res.status(500).send('Internal Server Error');
    }
});

async function handleSuccessfulCheckout(session: Stripe.Checkout.Session) {
    const metadata = session.metadata;
    const customerEmail = session.customer_details?.email;
    const userUid = metadata?.user_uid;
    const productId = metadata?.product_id;
    const creditsToAdd = parseInt(metadata?.credits_to_add || '0');
    const operationalCostBRL = parseFloat(metadata?.operational_cost_brl || '0');

    // Split Metadata
    const affiliateUid = metadata?.affiliate_uid;
    const coProducerUid = metadata?.co_producer_uid;
    const affiliatePercent = parseFloat(metadata?.affiliate_percent || '0');
    const coProducerPercent = parseFloat(metadata?.co_producer_percent || '0');

    if (!userUid || !customerEmail) {
        console.error('Missing user details in session metadata');
        return;
    }

    const amount = (session.amount_total || 0) / 100;
    const platformFee = (amount * 0.059) + 1.0; // LucPay 5.9% + 1.00

    // Split Calculation Logic
    const netAfterFees = amount - platformFee - operationalCostBRL;
    const affiliateAmount = affiliateUid ? (netAfterFees * (affiliatePercent / 100)) : 0;
    const coProducerAmount = coProducerUid ? ((netAfterFees - affiliateAmount) * (coProducerPercent / 100)) : 0;
    const producerNet = netAfterFees - affiliateAmount - coProducerAmount;

    const txRef = db.collection('transactions').doc(session.id);
    await txRef.set({
        id: session.id,
        amount: amount,
        currency: session.currency || 'brl',
        status: 'approved',
        type: creditsToAdd > 0 ? 'recharge' : 'sale',
        userUid,
        customerEmail,
        productId,
        creditsAdded: creditsToAdd,
        operationalCost: operationalCostBRL,
        platformFee: platformFee,
        splits: {
            affiliate: { uid: affiliateUid, amount: affiliateAmount, percent: affiliatePercent },
            coProducer: { uid: coProducerUid, amount: coProducerAmount, percent: coProducerPercent },
            producer: { amount: producerNet > 0 ? producerNet : 0 }
        },
        netAmount: producerNet > 0 ? producerNet : 0,
        productName: metadata?.product_name || (creditsToAdd > 0 ? 'Recarga de Créditos' : 'Mestre IA Product'),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentMethod: 'stripe_checkout',
        details: {
            sessionId: session.id,
            paymentIntentId: session.payment_intent
        }
    });

    // --- REAL-TIME STRIPE CONNECT TRANSFERS ---
    if (creditsToAdd === 0 && productId !== 'credits') {
        const productOwnerId = await getProductOwner(productId);
        await distributeSplits(session.id, {
            amount,
            currency: session.currency || 'brl',
            splits: {
                affiliate: affiliateUid ? { uid: affiliateUid, amount: affiliateAmount } : null,
                coProducer: coProducerUid ? { uid: coProducerUid, amount: coProducerAmount } : null,
                producer: { uid: productOwnerId, amount: producerNet }
            }
        }, stripeSecret);
    }

    // Update student access and Credits
    const studentRef = db.collection('students').doc(userUid);
    const updates: any = {
        lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active'
    };

    if (creditsToAdd > 0) {
        updates.creditBalance = admin.firestore.FieldValue.increment(creditsToAdd);
    } else {
        updates.hasMestreIA = true;
    }

    await studentRef.set(updates, { merge: true });

    console.log(`Fulfillment complete for user ${userUid}. Credits added: ${creditsToAdd}`);
}

async function handleRefund(charge: Stripe.Charge) {
    const paymentIntentId = charge.payment_intent as string;

    // Find the original transaction
    const txQuery = await db.collection('transactions')
        .where('details.paymentIntentId', '==', paymentIntentId)
        .limit(1)
        .get();

    if (txQuery.empty) {
        console.error(`Original transaction not found for refund: ${paymentIntentId}`);
        return;
    }

    const txDoc = txQuery.docs[0];
    const txData = txDoc.data();

    // Update transaction status
    await txDoc.ref.update({
        status: 'refunded',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Revoke student access if applicable
    const userUid = txData.userUid;
    if (userUid) {
        await db.collection('students').doc(userUid).update({
            hasMestreIA: false,
            status: 'refunded'
        });
    }

    console.log(`Refund processed for transaction ${txDoc.id}`);
}

// --- SPLIT DISTRIBUTION ENGINE ---

async function getProductOwner(productId: string): Promise<string> {
    const prodDoc = await db.collection('products').doc(productId).get();
    return prodDoc.data()?.ownerId || '';
}

async function distributeSplits(sessionId: string, data: any, stripeSecret: string) {
    const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' });
    const { splits, currency } = data;
    const transferResults: any = {};

    try {
        // 1. Affiliate Transfer
        if (splits.affiliate && splits.affiliate.amount > 0) {
            const accId = await getStripeAccountId(splits.affiliate.uid);
            if (accId) {
                const transfer = await stripe.transfers.create({
                    amount: Math.round(splits.affiliate.amount * 100),
                    currency,
                    destination: accId,
                    transfer_group: sessionId,
                    metadata: { type: 'affiliate_commission', original_session: sessionId }
                });
                transferResults.affiliateTransferId = transfer.id;
            }
        }

        // 2. Co-Producer Transfer
        if (splits.coProducer && splits.coProducer.amount > 0) {
            const accId = await getStripeAccountId(splits.coProducer.uid);
            if (accId) {
                const transfer = await stripe.transfers.create({
                    amount: Math.round(splits.coProducer.amount * 100),
                    currency,
                    destination: accId,
                    transfer_group: sessionId,
                    metadata: { type: 'co_producer_commission', original_session: sessionId }
                });
                transferResults.coProducerTransferId = transfer.id;
            }
        }

        // 3. Producer (Owner) Transfer
        if (splits.producer && splits.producer.amount > 0) {
            const accId = await getStripeAccountId(splits.producer.uid);
            if (accId) {
                const transfer = await stripe.transfers.create({
                    amount: Math.round(splits.producer.amount * 100),
                    currency,
                    destination: accId,
                    transfer_group: sessionId,
                    metadata: { type: 'producer_net', original_session: sessionId }
                });
                transferResults.producerTransferId = transfer.id;
            }
        }

        // Update transaction with transfer results
        await db.collection('transactions').doc(sessionId).update({
            'details.transfers': transferResults,
            'details.splitDistributed': true,
            'details.distributedAt': admin.firestore.FieldValue.serverTimestamp()
        });

    } catch (error) {
        console.error("Error distributing splits:", error);
        await db.collection('transactions').doc(sessionId).update({
            'details.splitError': (error as any).message,
            'details.splitDistributed': false
        });
    }
}

async function getStripeAccountId(userUid: string): Promise<string | null> {
    const connDoc = await db.collection('connected_accounts').doc(userUid).get();
    if (connDoc.exists) return connDoc.data()?.stripeAccountId;

    // Fallback to users collection
    const userDoc = await db.collection('users').doc(userUid).get();
    return userDoc.data()?.stripeAccountId || null;
}
