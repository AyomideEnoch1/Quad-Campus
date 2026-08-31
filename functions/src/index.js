// =============================================================================
// QUAD Campus App — Cloud Functions Entry Point (index.js)
//
// Every function that exists in a module file MUST be explicitly re-exported
// here. A function that exists in a file but isn't re-exported silently does
// not deploy — this is the most common way to believe a fix shipped when it
// didn't. After deploying, run `firebase functions:list` and confirm every
// function name listed below actually appears in the output.
//
// Functions requiring Blaze (pay-as-you-go) plan:
//   - All of them. Cloud Functions cannot be deployed on the Spark free plan.
//   Upgrade at: https://console.firebase.google.com/project/quad-campus/usage/details
// =============================================================================

const admin = require('firebase-admin');
admin.initializeApp();

// ---------------------------------------------------------------------------
// Counter functions (counters.js)
// Handles sharded like/follow/impression counters and aggregation.
// ---------------------------------------------------------------------------
const counters = require('./counters');

exports.onPostLiked = counters.onPostLiked;
exports.onPostUnliked = counters.onPostUnliked;
exports.aggregateCountersEveryFiveMinutes = counters.aggregateCountersEveryFiveMinutes;
exports.markCounterDirtyOnShardWrite = counters.markCounterDirtyOnShardWrite;

// ---------------------------------------------------------------------------
// Media processing (mediaProcessing.js)
// Handles Google Cloud Vision SafeSearch + thumbnail generation pipeline.
// ---------------------------------------------------------------------------
const mediaProcessing = require('./mediaProcessing');

exports.processUploadedImage = mediaProcessing.processUploadedImage;

// ---------------------------------------------------------------------------
// Moderation (moderation.js)
// Handles content reporting with transactional auto-hide.
// ---------------------------------------------------------------------------
const moderation = require('./moderation');

exports.reportContent = moderation.reportContent;
