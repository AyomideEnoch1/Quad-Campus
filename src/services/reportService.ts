/**
 * reportService.ts — Client-side content reporting for QUAD.
 *
 * Writes report documents to the /reports collection in Firestore.
 * This is the client counterpart to the reportContent Cloud Function in
 * functions/src/moderation.js.
 *
 * When the Cloud Function IS deployed (Blaze plan), it intercepts these
 * writes via a Firestore trigger and handles transactional reportCount
 * increment + auto-hide logic. Until then, reports accumulate in Firestore
 * and can be reviewed by moderators manually.
 *
 * Auto-hide on the client side: if reportCount >= AUTO_HIDE_THRESHOLD and
 * the current user is the one who tipped it over, the content is hidden
 * locally in the UI (optimistic). The authoritative auto-hide is done
 * server-side by the Cloud Function transaction.
 */

import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  increment,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';

export type ReportTargetType =
  | 'post'
  | 'marketplace_item'
  | 'user'
  | 'club';

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'misinformation'
  | 'violence'
  | 'other';

export interface ReportParams {
  /** The type of content being reported. */
  targetType: ReportTargetType;
  /** The Firestore document ID of the reported content. */
  targetId: string;
  /** The UID of the user submitting the report. */
  reporterId: string;
  /** The schoolId of the reporting user, for moderation routing. */
  reporterSchoolId?: string;
  /** A human-readable reason for the report. */
  reason: ReportReason | string;
}

/** Auto-hide threshold — mirrors the server-side constant in moderation.js. */
export const AUTO_HIDE_REPORT_THRESHOLD = 5;

const COLLECTION_MAP: Record<ReportTargetType, string> = {
  post: 'posts',
  marketplace_item: 'marketplace_items',
  user: 'users',
  club: 'clubs',
};

export interface ReportResult {
  /** The Firestore ID of the newly created report document. */
  reportId: string;
  /**
   * Whether the content was optimistically auto-hidden on the client
   * (i.e. reportCount crossed AUTO_HIDE_REPORT_THRESHOLD). This is an
   * optimistic signal only — the authoritative value comes from the
   * Cloud Function transaction.
   */
  autoHiddenOptimistic: boolean;
}

/**
 * submitReport — writes a pending report to /reports and increments
 * the reportCount on the target document.
 *
 * NOTE: The increment is NOT transactional here (no Cloud Functions).
 * Under concurrent reports this can race — the Cloud Function version
 * (moderation.js reportContent) wraps this in a transaction and is the
 * correct, authoritative path. This client-side version is the fallback
 * for the Spark plan period.
 */
export async function submitReport(params: ReportParams): Promise<ReportResult> {
  const { targetType, targetId, reporterId, reporterSchoolId, reason } = params;

  const targetCollection = COLLECTION_MAP[targetType];
  const targetRef = doc(db, targetCollection, targetId);

  // Write the report document first.
  const reportRef = await addDoc(collection(db, 'reports'), {
    targetType,
    targetId,
    reporterId,
    reporterSchoolId: reporterSchoolId || null,
    reason,
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  // Increment the reportCount on the target document (non-transactional
  // fallback — see note above).
  let autoHiddenOptimistic = false;
  try {
    await updateDoc(targetRef, {
      reportCount: increment(1),
    });

    // Optimistic auto-hide check: read back the count to see if we crossed
    // the threshold. This is eventually consistent — the Cloud Function
    // transaction is authoritative.
    const targetSnap = await getDoc(targetRef);
    if (targetSnap.exists()) {
      const currentCount = (targetSnap.data().reportCount as number) || 0;
      if (currentCount >= AUTO_HIDE_REPORT_THRESHOLD && !targetSnap.data().isAutoHidden) {
        autoHiddenOptimistic = true;
      }
    }
  } catch (err: any) {
    // Don't throw — the report document was already written.
    console.warn('reportService: failed to increment reportCount:', err?.message || err);
  }

  return { reportId: reportRef.id, autoHiddenOptimistic };
}

/**
 * REPORT_REASONS — human-readable labels for each report reason.
 * Use these to build a reason picker in the report modal UI.
 */
export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate_content', label: 'Inappropriate or adult content' },
  { value: 'misinformation', label: 'False information' },
  { value: 'violence', label: 'Violence or dangerous content' },
  { value: 'other', label: 'Other' },
];
