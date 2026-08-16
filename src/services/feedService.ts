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
        ...(d.data() as any),
        createdAt: d.data().createdAt?.toDate
          ? formatTimeAgo(d.data().createdAt.toDate())
          : 'Just now',
        _rawDate: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date()
      }))
      .filter(p => (!schoolId ? p.scope === 'all_schools' : true))
      .sort((a, b) => b._rawDate.getTime() - a._rawDate.getTime());

    callback(posts as Post[]);
  }, (err) => {
    console.warn("Feed subscription error:", err?.message || err);
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
  scope?: 'my_school' | 'all_schools';
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

export async function toggleLikePost(postId: string, userUid: string, isLiked?: boolean): Promise<void> {
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
