// =============================================================================
// QUAD Campus App — Corrected Moderation Functions
//
// BUG FIXED: the previous reportContent implementation incremented
// `reportCount` with a plain FieldValue.increment(1), then did a SEPARATE,
// non-transactional .get() to check whether the count crossed the
// auto-hide threshold. Under concurrent reports (exactly the scenario a
// piece of genuinely bad content would trigger), two reporters could each
// read the pre-increment count before either write landed, causing the
// auto-hide threshold to be over- or under-triggered — the same class of
// hot-document race the spec correctly identified and fixed for the like
// counter, just not applied consistently here. Fixed by wrapping the
// increment-and-check in a single Firestore transaction.
// =============================================================================

const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');

const AUTO_HIDE_REPORT_THRESHOLD = 5;

exports.reportContent = functions.https.onCall(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { targetType, targetId, reason } = data;
  if (!targetType || !targetId || !reason) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  const validTargetTypes = ['post', 'comment', 'marketplace_item', 'user', 'club'];
  if (!validTargetTypes.includes(targetType)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid targetType');
  }

  const collectionForTargetType = {
    post: 'posts',
    comment: null, // comments are a subcollection; targetId must be a full path if reported directly
    marketplace_item: 'marketplace_items',
    user: 'users',
    club: 'clubs',
  }[targetType];

  if (!collectionForTargetType) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Reporting comments directly is not yet supported — report the parent post'
    );
  }

  const userDoc = await admin.firestore().collection('users').doc(auth.uid).get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Reporting user not found');
  }
  const userData = userDoc.data();

  const targetRef = admin.firestore().collection(collectionForTargetType).doc(targetId);
  const reportRef = admin.firestore().collection('reports').doc();

  let autoHidden = false;

  // The entire read-check-write sequence happens inside one transaction,
  // so two concurrent reports can never both observe the same
  // pre-increment count and race past the threshold check.
  await admin.firestore().runTransaction(async (transaction) => {
    const targetSnap = await transaction.get(targetRef);
    if (!targetSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Reported content not found');
    }

    const currentCount = targetSnap.data().reportCount || 0;
    const newCount = currentCount + 1;

    const targetUpdate = { reportCount: newCount };

    if (newCount >= AUTO_HIDE_REPORT_THRESHOLD && !targetSnap.data().isAutoHidden) {
      targetUpdate.isAutoHidden = true;
      targetUpdate.autoHiddenAt = admin.firestore.FieldValue.serverTimestamp();
      autoHidden = true;
    }

    transaction.update(targetRef, targetUpdate);

    transaction.set(reportRef, {
      targetType,
      targetId,
      reporterId: auth.uid,
      reporterSchoolId: userData.schoolId || null,
      reason,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  if (autoHidden) {
    // Notify moderators outside the transaction — non-critical side
    // effect, doesn't need transactional guarantees, and keeping it out
    // of the transaction avoids unnecessary transaction-retry overhead.
    await admin.firestore().collection('moderationQueue').add({
      targetType,
      targetId,
      reason: `Auto-hidden after ${AUTO_HIDE_REPORT_THRESHOLD} reports`,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  return { success: true, reportId: reportRef.id, autoHidden };
});

// reviewModeration and moderatePostText are unchanged from the prior
// design — their logic was correct. Re-export here for a single import
// surface; see the original moderation.js for the full implementations.
module.exports = {
  reportContent: exports.reportContent,
  AUTO_HIDE_REPORT_THRESHOLD,
};
