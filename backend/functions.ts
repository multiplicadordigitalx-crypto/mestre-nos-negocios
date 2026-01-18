import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

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
