import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

/**
 * Subscribe to feed posts in real-time
 * @param {string|null} schoolId - filter by school if 'my_school', null if 'all_schools'
 * @param {function} callback - receives array of post objects
 */
export function subscribeFeedPosts(schoolId, callback) {
  let q;
  if (schoolId) {
    q = query(
      collection(db, 'posts'),
      where('authorSchoolId', '==', schoolId),
      limit(50)
    );
  } else {
    q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs
      .map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate
          ? formatTimeAgo(d.data().createdAt.toDate())
          : 'Just now',
        _rawDate: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date()
      }))
      .filter(p => (!schoolId ? p.scope === 'all_schools' : true))
      .sort((a, b) => b._rawDate - a._rawDate);

    callback(posts);
  }, (err) => {
    console.warn("Feed subscription error:", err?.message || err);
  });
}

/**
 * Create a new post in Firestore
 */
export async function createPost({
  authorId,
  authorName,
  authorUsername,
  authorAvatar,
  authorSchoolId,
  authorSchoolName,
  isVerifiedAuthor,
  content,
  mediaUrls = [],
  scope = 'my_school'
}) {
  const postData = {
    authorId,
    authorName,
    authorUsername,
    authorAvatar,
    authorSchoolId,
    authorSchoolName,
    isVerifiedAuthor: !!isVerifiedAuthor,
    content,
    mediaUrls,
    scope,
    likesCount: 0,
    likedBy: [],
    repostsCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'posts'), postData);
  return docRef.id;
}

/**
 * Like or unlike a post atomically
 */
export async function toggleLikePost(postId, userUid, isLiked) {
  const postRef = doc(db, 'posts', postId);
  
  if (isLiked) {
    // Currently liked -> Unlike
    await updateDoc(postRef, {
      likesCount: increment(-1),
      likedBy: arrayRemove(userUid)
    });
  } else {
    // Currently unliked -> Like
    await updateDoc(postRef, {
      likesCount: increment(1),
      likedBy: arrayUnion(userUid)
    });
  }
}

/**
 * Delete a post (owner only)
 */
export async function deletePost(postId) {
  await deleteDoc(doc(db, 'posts', postId));
}

// Utility helper for relative time formatting
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
