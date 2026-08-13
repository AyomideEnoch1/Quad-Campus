import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';

/**
 * Subscribe to clubs in real-time
 */
export function subscribeClubs(schoolId, userUid, callback) {
  const q = query(
    collection(db, 'clubs'),
    orderBy('memberCount', 'desc')
  );

  return onSnapshot(q, async (snapshot) => {
    const clubs = await Promise.all(snapshot.docs.map(async d => {
      const clubData = d.data();
      let isJoined = false;

      if (userUid) {
        const memberRef = doc(db, 'clubs', d.id, 'members', userUid);
        const memberSnap = await getDoc(memberRef);
        isJoined = memberSnap.exists();
      }

      return {
        id: d.id,
        ...clubData,
        isJoined
      };
    }));

    callback(clubs);
  }, (err) => {
    console.error("Clubs subscription error:", err);
  });
}

/**
 * Join or leave a club
 */
export async function toggleJoinClub(clubId, userUid, isJoined) {
  const clubRef = doc(db, 'clubs', clubId);
  const memberRef = doc(db, 'clubs', clubId, 'members', userUid);

  if (isJoined) {
    // Currently joined -> Leave
    await deleteDoc(memberRef);
    await updateDoc(clubRef, {
      memberCount: increment(-1)
    });
  } else {
    // Currently not joined -> Join
    await setDoc(memberRef, {
      joinedAt: serverTimestamp()
    });
    await updateDoc(clubRef, {
      memberCount: increment(1)
    });
  }
}

/**
 * Create a new campus club
 */
export async function createClub({
  name,
  tagline,
  schoolId,
  schoolName,
  isInterSchool = false,
  category,
  logoUrl,
  bannerUrl,
  leaderId
}) {
  const clubData = {
    name,
    tagline,
    schoolId,
    schoolName,
    isInterSchool: !!isInterSchool,
    category,
    logoUrl,
    bannerUrl,
    leaderId,
    memberCount: 1,
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'clubs'), clubData);
  
  // Add leader as initial member
  await setDoc(doc(db, 'clubs', docRef.id, 'members', leaderId), {
    joinedAt: serverTimestamp(),
    role: 'leader'
  });

  return docRef.id;
}
