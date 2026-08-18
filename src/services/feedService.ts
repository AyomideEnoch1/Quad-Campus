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
  arrayRemove,
  Unsubscribe
} from 'firebase/firestore';
import { Post } from '../types';

export function subscribeFeedPosts(schoolId: string | null, callback: (posts: Post[]) => void): Unsubscribe {
  let q = query(
    collection(db, 'posts'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs
      .map(d => {
        const data = d.data() as any;
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate
            ? formatTimeAgo(data.createdAt.toDate())
            : 'Just now',
          _rawDate: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(0)
        };
      })
      .filter(p => {
        if (schoolId) {
          return p.authorSchoolId === schoolId || p.scope === 'all_schools';
        }
        return true;
      })
      .sort((a, b) => (b._rawDate?.getTime() || 0) - (a._rawDate?.getTime() || 0));

    callback(posts as Post[]);
  }, (err) => {
    console.warn("Feed subscription error:", err?.message || err);
    callback([]);
  });
}

export interface CreatePostParams {
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorSchoolId: string;
  authorSchoolName: string;
  isVerifiedAuthor?: boolean;
  content: string;
  mediaUrls?: string[];
  mediaType?: 'image' | 'video' | null;
  scope?: 'my_school' | 'all_schools' | string;
}

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
  mediaType = null,
  scope = 'my_school'
}: CreatePostParams): Promise<string> {
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
    mediaType,
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

import { createNotificationEvent } from './notificationService';
import { getDoc } from 'firebase/firestore';

export async function toggleLikePost(postId: string, userUid: string, isLiked?: boolean, currentUser?: any): Promise<void> {
  const postRef = doc(db, 'posts', postId);
  
  if (isLiked) {
    await updateDoc(postRef, {
      likesCount: increment(-1),
      likedBy: arrayRemove(userUid)
    });
  } else {
    await updateDoc(postRef, {
      likesCount: increment(1),
      likedBy: arrayUnion(userUid)
    });

    try {
      const snap = await getDoc(postRef);
      if (snap.exists()) {
        const postData = snap.data();
        if (postData.authorId && postData.authorId !== userUid) {
          await createNotificationEvent({
            userId: postData.authorId,
            title: 'New Like on your post ❤️',
            message: `${currentUser?.displayName || 'Someone'} liked your post.`,
            type: 'like',
            avatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80'
          });
        }
      }
    } catch (e) {
      console.warn("Like notification notice:", e);
    }
  }
}

export async function deletePost(postId: string): Promise<void> {
  await deleteDoc(doc(db, 'posts', postId));
}

export async function updatePostScope(postId: string, newScope: 'my_school' | 'all_schools'): Promise<void> {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    scope: newScope,
    updatedAt: serverTimestamp()
  });
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
