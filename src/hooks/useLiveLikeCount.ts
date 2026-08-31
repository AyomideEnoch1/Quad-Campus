import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * useLiveLikeCount — subscribes to the sharded counter subcollection for a
 * single post and returns a real-time like count by summing shards client-side.
 *
 * Use this ONLY on a single post-detail screen (i.e. when a user taps into
 * a post). Do NOT use it on every item in a scrollable feed list — that would
 * open one Firestore listener per visible post simultaneously, which is both
 * expensive on reads and harmful to battery life.
 *
 * The feed list should continue reading `post.likesCount` (the 5-minute
 * aggregated field written by the Cloud Function), which is fine for ranking
 * and list display. This hook is for the "you're currently looking at this
 * post" scenario where stale counts feel broken.
 *
 * When Cloud Functions are NOT yet deployed (Spark plan), the shards
 * subcollection won't exist and this hook simply returns null — the caller
 * should fall back to the `post.likesCount` field in that case.
 *
 * @param postId  The Firestore document ID of the post to watch.
 * @returns       Live summed like count, or null if shards don't exist yet.
 */
export function useLiveLikeCount(postId: string | null): number | null {
  const [liveCount, setLiveCount] = useState<number | null>(null);

  useEffect(() => {
    if (!postId) return;

    const shardsRef = collection(db, `counters/posts/${postId}/shards`);

    const unsubscribe = onSnapshot(
      shardsRef,
      (snapshot) => {
        if (snapshot.empty) {
          // Shards don't exist yet (Cloud Functions not deployed or post
          // has never been liked via the sharded path). Return null so the
          // caller can fall back to post.likesCount.
          setLiveCount(null);
          return;
        }

        let total = 0;
        snapshot.forEach((doc) => {
          total += (doc.data().count as number) || 0;
        });
        setLiveCount(total);
      },
      (err) => {
        // Firestore permission denied or network error — fail silently and
        // let the caller fall back to the cached field.
        console.warn('useLiveLikeCount: shard listener error:', err.message);
        setLiveCount(null);
      }
    );

    return unsubscribe;
  }, [postId]);

  return liveCount;
}

/**
 * optimisticLikeDelta — returns an adjusted count for immediate UI feedback
 * on like/unlike tap, before the Firestore write round-trip resolves.
 *
 * Call this immediately on tap to avoid a perceived-latency gap. The live
 * count from useLiveLikeCount (or post.likesCount) is the source of truth
 * and will reconcile once the listener fires.
 *
 * @param currentCount  Current displayed like count.
 * @param isNowLiked    Whether the user is liking (true) or unliking (false).
 */
export function optimisticLikeDelta(currentCount: number, isNowLiked: boolean): number {
  return isNowLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
}
