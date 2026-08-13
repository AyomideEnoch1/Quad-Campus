import { db } from '../config/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';

/**
 * Fetch a single user profile doc by UID
 */
export async function getUser(uid) {
  if (!uid) return null;
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
}

/**
 * Update user profile fields (displayName, bio, username, major, etc.)
 */
export async function updateUserProfile(uid, updateData) {
  if (!uid) throw new Error('User ID is required');
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
}

/**
 * Follow / Unfollow user
 */
export async function toggleFollowUser(currentUid, targetUid, isFollowing) {
  if (!currentUid || !targetUid) return;

  const batch = writeBatch(db);
  const myFollowingRef = doc(db, 'users', currentUid, 'following', targetUid);
  const targetFollowerRef = doc(db, 'users', targetUid, 'followers', currentUid);
  const myUserRef = doc(db, 'users', currentUid);
  const targetUserRef = doc(db, 'users', targetUid);

  if (isFollowing) {
    // Unfollow
    batch.delete(myFollowingRef);
    batch.delete(targetFollowerRef);
    batch.update(myUserRef, { followingCount: increment(-1) });
    batch.update(targetUserRef, { followersCount: increment(-1) });
  } else {
    // Follow
    batch.set(myFollowingRef, { followedAt: serverTimestamp() });
    batch.set(targetFollowerRef, { followerAt: serverTimestamp() });
    batch.update(myUserRef, { followingCount: increment(1) });
    batch.update(targetUserRef, { followersCount: increment(1) });
  }

  await batch.commit();
}

/**
 * Search users by username or display name prefix
 */
export async function searchUsers(searchTerm) {
  if (!searchTerm || searchTerm.trim().length === 0) return [];
  const term = searchTerm.trim().toLowerCase();
  
  const q = query(
    collection(db, 'users'),
    where('username', '>=', term),
    where('username', '<=', term + '\uf8ff')
  );
  
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
