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
  limit,
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
    limit(50)
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
    console.warn("Clubs subscription notice:", err?.message || err);
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

/**
 * Subscribe to club group chat messages in real-time
 */
export function subscribeClubMessages(clubId, callback) {
  if (!clubId) return;

  const messagesRef = collection(db, 'clubs', clubId, 'messages');
  const q = query(messagesRef, limit(100));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      time: d.data().createdAt?.toDate
        ? d.data().createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now',
      _rawDate: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date()
    })).sort((a, b) => a._rawDate - b._rawDate);

    callback(messages);
  }, (err) => {
    console.warn("Club messages notice:", err?.message || err);
  });
}

/**
 * Send a message to a club group chat
 */
export async function sendClubMessage(clubId, { senderId, senderName, senderAvatar, text }) {
  if (!clubId || !text.trim()) return;

  const messagesRef = collection(db, 'clubs', clubId, 'messages');
  await addDoc(messagesRef, {
    senderId,
    senderName,
    senderAvatar,
    text: text.trim(),
    createdAt: serverTimestamp()
  });
}
