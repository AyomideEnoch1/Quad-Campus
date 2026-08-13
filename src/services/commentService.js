import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  updateDoc
} from 'firebase/firestore';

/**
 * Subscribe to comments for a specific post in real-time
 */
export function subscribeComments(postId, callback) {
  if (!postId) return;

  const commentsRef = collection(db, 'posts', postId, 'comments');
  const q = query(commentsRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate
        ? formatTimeAgo(d.data().createdAt.toDate())
        : 'Just now'
    }));
    callback(comments);
  }, (err) => {
    console.warn("Comments subscription error:", err);
  });
}

/**
 * Add a comment to a post
 */
export async function addComment(postId, { authorId, authorName, authorAvatar, text }) {
  if (!postId || !text.trim()) return;

  const commentsRef = collection(db, 'posts', postId, 'comments');
  const postRef = doc(db, 'posts', postId);

  // 1. Add comment document
  await addDoc(commentsRef, {
    authorId,
    authorName,
    authorAvatar,
    text: text.trim(),
    createdAt: serverTimestamp()
  });

  // 2. Increment comments count on post
  await updateDoc(postRef, {
    commentsCount: increment(1)
  });
}

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
