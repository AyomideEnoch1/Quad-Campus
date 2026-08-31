// =============================================================================
// QUAD Campus App — Corrected Distributed Counter Implementation
//
// BUG FIXED: the previous version only aggregated shard counts into the
// visible `likesCount` field once a day (`aggregateAllCounters`, cron
// '0 2 * * *'). Between runs, every like a user gave was invisible in the
// feed UI — a platform whose entire pitch is "real-time reactivity" would
// have shown stale like counts for up to 24 hours. The root cause of the
// original array-based counter (write contention on one hot document) was
// real and the sharding fix for THAT problem is correct — but the fix must
// not reintroduce staleness as a side effect.
//
// THE FIX HAS TWO PARTS, used together:
//   1. Client-side: listen to the shard subcollection directly with
//      onSnapshot and sum client-side for instant, genuinely real-time
//      counts. Reads scale independently of writes in Firestore, so this
//      does not reintroduce the contention problem — many clients reading
//      is not the same failure mode as many clients writing to one doc.
//   2. Server-side: aggregate into the persisted `likesCount` field on the
//      post document every 5 minutes (not once daily), so that: (a) feed
//      *ranking* queries (which must sort by a persisted field, and cannot
//      sort by a client-computed live sum) stay reasonably fresh, and
//      (b) analytics/exports have a sane value even for posts nobody has
//      open in real time. The live UI number and the ranking number are
//      allowed to disagree briefly — that's an acceptable, explicit
//      tradeoff, not a silent bug.
// =============================================================================

const functions = require('firebase-functions/v2');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
const crypto = require('crypto');

const SHARD_COUNT = 10;

// ---------------------------------------------------------------------------
// Server-side: increment a shard on like/unlike (unchanged from prior design
// — this part was correct; the bug was purely in how the aggregate was
// surfaced, not in how writes were distributed).
// ---------------------------------------------------------------------------

async function incrementShardedCounter(entityPath, amount = 1) {
  const shardId = crypto.randomInt(0, SHARD_COUNT);
  const shardRef = admin.firestore().doc(`${entityPath}/shards/${shardId}`);

  await shardRef.set(
    {
      count: admin.firestore.FieldValue.increment(amount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

exports.onPostLiked = functions.firestore.onDocumentCreated(
  'posts/{postId}/likes/{uid}',
  async (event) => {
    const { postId } = event.params;
    await incrementShardedCounter(`counters/posts/${postId}`, 1);
  }
);

exports.onPostUnliked = functions.firestore.onDocumentDeleted(
  'posts/{postId}/likes/{uid}',
  async (event) => {
    const { postId } = event.params;
    await incrementShardedCounter(`counters/posts/${postId}`, -1);
  }
);

// Same pattern reused for followers, ad impressions, and ad clicks —
// call incrementShardedCounter with the appropriate counter path from
// wherever those events are triggered (follow/unfollow handlers, ad
// impression/click logging endpoints).

// ---------------------------------------------------------------------------
// Server-side: aggregate shards into the persisted, ranking-facing field.
// Runs every 5 minutes instead of once daily. This is a deliberate,
// bounded staleness window for the RANKING field only — the live UI count
// (below) does not depend on this function at all.
// ---------------------------------------------------------------------------

async function aggregateCounterToField(collection, docId, targetField) {
  const shardsSnap = await admin
    .firestore()
    .collection(`counters/${collection}/${docId}/shards`)
    .get();

  let total = 0;
  shardsSnap.forEach((doc) => {
    total += doc.data().count || 0;
  });

  await admin
    .firestore()
    .doc(`${collection}/${docId}`)
    .update({ [targetField]: total });

  return total;
}

exports.aggregateCountersEveryFiveMinutes = onSchedule(
  {
    schedule: 'every 5 minutes',
    timeZone: 'Africa/Lagos',
  },
  async () => {
    // Only walk counters that have been touched recently, to keep this
    // cheap at scale — track a `dirty: true` flag on the parent counter
    // doc, set whenever a shard write happens, cleared here after
    // aggregation, so quiet posts aren't re-summed every 5 minutes forever.
    const dirtyCounters = await admin
      .firestore()
      .collectionGroup('counters')
      .where('dirty', '==', true)
      .get();

    const updates = dirtyCounters.docs.map(async (counterDoc) => {
      const pathParts = counterDoc.ref.path.split('/'); // counters/{collection}/{docId}
      const collection = pathParts[1];
      const docId = pathParts[2];

      await aggregateCounterToField(collection, docId, 'likesCount');
      await counterDoc.ref.update({ dirty: false });
    });

    await Promise.all(updates);
  }
);

// Mark the counter doc dirty whenever a shard changes, so the scheduled
// job above only does work on counters that actually moved.
exports.markCounterDirtyOnShardWrite = functions.firestore.onDocumentWritten(
  'counters/{collection}/{docId}/shards/{shardId}',
  async (event) => {
    const { collection, docId } = event.params;
    await admin
      .firestore()
      .doc(`counters/${collection}/${docId}`)
      .set({ dirty: true, shardCount: SHARD_COUNT }, { merge: true });
  }
);

// =============================================================================
// CLIENT-SIDE (React Native) — the actual real-time fix.
// Ship this alongside the server-side code above; without it, the UI is
// still reading only the 5-minutes-stale `likesCount` field, which is
// acceptable for feed ORDER but not for what a user sees on the post
// they're currently looking at.
// =============================================================================

/*
import { collection, onSnapshot } from 'firebase/firestore';

// Subscribes to live like count for a single post the user currently has
// open — call this only for posts on-screen, not for an entire feed at
// once, to avoid opening hundreds of listeners simultaneously.
export function subscribeToLiveLikeCount(firestore, postId, onCount) {
  const shardsRef = collection(firestore, `counters/posts/${postId}/shards`);

  return onSnapshot(shardsRef, (snapshot) => {
    let total = 0;
    snapshot.forEach((doc) => {
      total += doc.data().count || 0;
    });
    onCount(total);
  });
}

// Optimistic local update: call this immediately on tap, before the
// network round-trip resolves, so the UI never has a dead moment between
// tap and visible feedback. Reconcile with the live listener above once
// it fires (the listener is the source of truth; this is just to avoid a
// perceived-latency gap).
export function optimisticLikeDelta(currentCount, isNowLiked) {
  return isNowLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
}
*/

module.exports = {
  incrementShardedCounter,
  aggregateCounterToField,
};
