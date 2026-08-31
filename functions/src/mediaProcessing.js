// =============================================================================
// QUAD Campus App — Corrected Media Processing Pipeline
//
// BUG FIXED: the previous version ran SafeSearch detection, computed
// `isSafe`, and then wrote `mediaUrls`/`isSafe` to the post document
// UNCONDITIONALLY — meaning an NSFW image was fully live in the feed the
// moment processing finished, with only a background boolean flag that no
// client UI ever checked. This directly contradicted the text-moderation
// path defined in the same spec (moderatePostText), which correctly hides
// flagged content pending human review. This version makes the two paths
// consistent: any post whose image fails SafeSearch is held out of public
// view and routed into the same moderationQueue used for text.
// =============================================================================

const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const vision = require('@google-cloud/vision');
const sharp = require('sharp');

const storage = new Storage();
const visionClient = new vision.ImageAnnotatorClient();

const SAFE_SEARCH_THRESHOLD = new Set(['VERY_UNLIKELY', 'UNLIKELY']);

function isSafeSearchResultAcceptable(detections) {
  return (
    SAFE_SEARCH_THRESHOLD.has(detections.adult) &&
    SAFE_SEARCH_THRESHOLD.has(detections.violence) &&
    SAFE_SEARCH_THRESHOLD.has(detections.racy)
  );
}

exports.processUploadedImage = functions.storage.onObjectFinalized(
  async (event) => {
    const file = event.data;
    const bucket = storage.bucket(file.bucket);
    const filePath = file.name;

    if (file.metadata && file.metadata.processed) return;

    const fileRef = bucket.file(filePath);
    const [originalBuffer] = await fileRef.download();

    // Step 1: content moderation FIRST, before anything is exposed
    const [visionResult] = await visionClient.safeSearchDetection(originalBuffer);
    const detections = visionResult.safeSearchAnnotation;
    const isSafe = isSafeSearchResultAcceptable(detections);

    // Step 2: generate thumbnails regardless (needed either for publishing
    // or for the moderator's review UI to actually see what was flagged)
    const sizes = [
      { width: 200, suffix: 'thumb' },
      { width: 600, suffix: 'medium' },
      { width: 1200, suffix: 'large' },
    ];

    const thumbnailUrls = {};
    for (const size of sizes) {
      const thumbnailBuffer = await sharp(originalBuffer)
        .resize(size.width, null, { withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      const thumbnailPath = filePath.replace(
        /\.(jpg|jpeg|png|gif)$/i,
        `_${size.suffix}.jpg`
      );
      const thumbnailRef = bucket.file(thumbnailPath);

      await thumbnailRef.save(thumbnailBuffer, {
        metadata: {
          contentType: 'image/jpeg',
          metadata: { processed: true, originalFile: filePath },
        },
      });

      thumbnailUrls[size.suffix] = `https://storage.googleapis.com/${bucket.name}/${thumbnailPath}`;
    }

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    // Step 3: resolve which Firestore document this upload belongs to
    const pathParts = filePath.split('/');
    const collection = pathParts[0];
    const docId = pathParts[1].replace(/\.[^/.]+$/, '');

    if (collection !== 'posts' && collection !== 'marketplace_items') {
      // Unknown upload target — log and stop rather than guessing.
      console.warn(`processUploadedImage: unrecognized collection "${collection}" for ${filePath}`);
      return;
    }

    const docRef = admin.firestore().collection(collection).doc(docId);

    if (isSafe) {
      // Safe: publish normally.
      await docRef.update({
        mediaUrls: admin.firestore.FieldValue.arrayUnion(publicUrl),
        thumbnailUrls: admin.firestore.FieldValue.arrayUnion(thumbnailUrls.thumb),
        isModerated: true,
        isSafe: true,
      });
    } else {
      // NOT safe: hold out of public view, mirroring moderatePostText's
      // behavior for flagged text content — never publish first and flag
      // second.
      await docRef.update({
        mediaUrls: admin.firestore.FieldValue.arrayUnion(publicUrl),
        thumbnailUrls: admin.firestore.FieldValue.arrayUnion(thumbnailUrls.thumb),
        isModerated: true,
        isSafe: false,
        moderationStatus: 'flagged',
        isHidden: true,
      });

      await admin.firestore().collection('moderationQueue').add({
        targetType: collection === 'posts' ? 'post' : 'marketplace_item',
        targetId: docId,
        reason: 'Image flagged by automated SafeSearch moderation',
        detections,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Step 4: always log the moderation decision, safe or not, for audit
    // and for tuning the threshold later.
    await admin.firestore().collection('moderation_log').add({
      filePath,
      targetType: collection,
      targetId: docId,
      isSafe,
      detections,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
);

module.exports = {
  isSafeSearchResultAcceptable,
};
