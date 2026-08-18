import { db, auth } from '../config/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
  writeBatch,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { deleteUser, signOut } from 'firebase/auth';
import { UserProfile } from '../types';

export function subscribeUserProfile(uid: string, callback: (user: UserProfile | null) => void): Unsubscribe {
  if (!uid) return () => {};
  const userRef = doc(db, 'users', uid);
  return onSnapshot(userRef, (snap) => {
    if (snap.exists()) {
      callback({ uid: snap.id, ...(snap.data() as any) } as UserProfile);
    } else {
      callback(null);
    }
  }, (err) => {
    console.warn("User profile subscription error:", err);
  });
}

export async function getUser(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return { uid: snap.id, ...(snap.data() as any) } as UserProfile;
  }
  return null;
}

export async function updateUserProfile(uid: string, updateData: Partial<UserProfile>): Promise<void> {
  if (!uid) throw new Error('User ID is required');
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
}

export async function checkIfFollowing(currentUid: string, targetUid: string): Promise<boolean> {
  if (!currentUid || !targetUid || currentUid === targetUid) return false;
  try {
    const followRef = doc(db, 'users', currentUid, 'following', targetUid);
    const snap = await getDoc(followRef);
    return snap.exists();
  } catch (e) {
    console.error("Error checking follow status:", e);
    return false;
  }
}

export async function checkIfProfileLiked(currentUid: string, targetUid: string): Promise<boolean> {
  if (!currentUid || !targetUid || currentUid === targetUid) return false;
  try {
    const likeRef = doc(db, 'users', targetUid, 'profileLikes', currentUid);
    const snap = await getDoc(likeRef);
    return snap.exists();
  } catch (e) {
    console.error("Error checking profile like status:", e);
    return false;
  }
}

export async function toggleLikeUserProfile(currentUid: string, targetUid: string): Promise<boolean> {
  if (!currentUid || !targetUid || currentUid === targetUid) return false;

  const likeRef = doc(db, 'users', targetUid, 'profileLikes', currentUid);
  const targetUserRef = doc(db, 'users', targetUid);
  const snap = await getDoc(likeRef);
  
  if (snap.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(targetUserRef, { likesReceived: increment(-1) });
    return false;
  } else {
    await updateDoc(likeRef, { likedAt: serverTimestamp() }).catch(async () => {
      const batch = writeBatch(db);
      batch.set(likeRef, { likedAt: serverTimestamp() });
      await batch.commit();
    });
    await updateDoc(targetUserRef, { likesReceived: increment(1) });
    return true;
  }
}

export async function toggleFollowUser(currentUid: string, targetUid: string, isFollowing: boolean): Promise<void> {
  if (!currentUid || !targetUid) return;

  const batch = writeBatch(db);
  const myFollowingRef = doc(db, 'users', currentUid, 'following', targetUid);
  const targetFollowerRef = doc(db, 'users', targetUid, 'followers', currentUid);
  const myUserRef = doc(db, 'users', currentUid);
  const targetUserRef = doc(db, 'users', targetUid);

  if (isFollowing) {
    batch.delete(myFollowingRef);
    batch.delete(targetFollowerRef);
    batch.update(myUserRef, { followingCount: increment(-1) });
    batch.update(targetUserRef, { followersCount: increment(-1) });
  } else {
    batch.set(myFollowingRef, { followedAt: serverTimestamp() });
    batch.set(targetFollowerRef, { followerAt: serverTimestamp() });
    batch.update(myUserRef, { followingCount: increment(1) });
    batch.update(targetUserRef, { followersCount: increment(1) });
  }

  await batch.commit();
}

export async function searchUsers(searchTerm: string): Promise<UserProfile[]> {
  if (!searchTerm || searchTerm.trim().length === 0) return [];
  const term = searchTerm.trim().toLowerCase();
  
  const q = query(
    collection(db, 'users'),
    where('username', '>=', term),
    where('username', '<=', term + '\uf8ff')
  );
  
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...(d.data() as any) })) as UserProfile[];
}

export async function deleteUserAccount(uid: string): Promise<void> {
  if (!uid) return;

  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (err: any) {
    console.warn("Firestore user doc delete notice:", err?.message || err);
  }

  if (auth.currentUser) {
    try {
      await deleteUser(auth.currentUser);
    } catch (err: any) {
      if (err?.code === 'auth/requires-recent-login' || err?.message?.includes('requires-recent-login')) {
        await signOut(auth);
        throw new Error("For security, please log back in to verify ownership before completing account deletion.");
      }
      throw err;
    }
  }
}
