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
  updateDoc,
  Unsubscribe
} from 'firebase/firestore';
import { PostComment } from '../types';

export function subscribeComments(postId: string, callback: (comments: PostComment[]) => void): Unsubscribe | undefined {
  if (!postId) return;

  const commentsRef = collection(db, 'posts', postId, 'comments');
  const q = query(commentsRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(d => ({
      id: d.id,
      ...(d.data() as any),
      createdAt: d.data().createdAt?.toDate
        ? formatTimeAgo(d.data().createdAt.toDate())
        : 'Just now'
    }));
    callback(comments as PostComment[]);
  }, (err) => {
    console.warn("Comments subscription error:", err);
  });
}

export interface AddCommentParams {
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
}

import { createNotificationEvent } from './notificationService';
import { getDoc } from 'firebase/firestore';

export async function addComment(postId: string, { authorId, authorName, authorAvatar, text }: AddCommentParams): Promise<void> {
  if (!postId || !text.trim()) return;

  const commentsRef = collection(db, 'posts', postId, 'comments');
  const postRef = doc(db, 'posts', postId);

  await addDoc(commentsRef, {
    authorId,
    authorName,
    authorAvatar,
    text: text.trim(),
    createdAt: serverTimestamp()
  });

  await updateDoc(postRef, {
    commentsCount: increment(1)
  });

  try {
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const postData = postSnap.data();
      if (postData.authorId && postData.authorId !== authorId) {
        await createNotificationEvent({
          userId: postData.authorId,
          title: 'New Comment 💬',
          message: `${authorName} commented: "${text.trim().slice(0, 35)}${text.length > 35 ? '...' : ''}"`,
          type: 'comment',
          avatar: authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80'
        });
      }
    }
  } catch (e) {
    console.warn("Comment notification notice:", e);
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
