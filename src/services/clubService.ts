import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  limit,
  onSnapshot,
  getDoc,
  serverTimestamp,
  increment,
  Unsubscribe
} from 'firebase/firestore';
import { Club, ClubMessage } from '../types';

export function subscribeClubs(
  schoolId?: string,
  userUid?: string,
  callback?: (clubs: Club[]) => void
): Unsubscribe {
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
        ...(clubData as any),
        isJoined
      } as Club;
    }));

    if (callback) callback(clubs);
  }, (err) => {
    console.warn("Clubs subscription notice:", err?.message || err);
  });
}

export async function toggleJoinClub(clubId: string, userUid: string, isJoined: boolean): Promise<void> {
  const clubRef = doc(db, 'clubs', clubId);
  const memberRef = doc(db, 'clubs', clubId, 'members', userUid);

  if (isJoined) {
    await deleteDoc(memberRef);
    await updateDoc(clubRef, {
      memberCount: increment(-1)
    });
  } else {
    await setDoc(memberRef, {
      joinedAt: serverTimestamp()
    });
    await updateDoc(clubRef, {
      memberCount: increment(1)
    });
  }
}

export interface CreateClubParams {
  name: string;
  tagline: string;
  schoolId: string;
  schoolName: string;
  isInterSchool?: boolean;
  category: string;
  logoUrl: string;
  bannerUrl: string;
  leaderId: string;
  description?: string;
}

export async function createClub({
  name,
  tagline,
  schoolId,
  schoolName,
  isInterSchool = false,
  category,
  logoUrl,
  bannerUrl,
  leaderId,
  description
}: CreateClubParams): Promise<string> {
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
    description: description || '',
    memberCount: 1,
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'clubs'), clubData);
  
  await setDoc(doc(db, 'clubs', docRef.id, 'members', leaderId), {
    joinedAt: serverTimestamp(),
    role: 'leader'
  });

  return docRef.id;
}

export function subscribeClubMessages(clubId: string, callback: (messages: ClubMessage[]) => void): Unsubscribe | undefined {
  if (!clubId) return;

  const messagesRef = collection(db, 'clubs', clubId, 'messages');
  const q = query(messagesRef, limit(100));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(d => ({
      id: d.id,
      ...(d.data() as any),
      time: d.data().createdAt?.toDate
        ? d.data().createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now',
      _rawDate: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date()
    })).sort((a, b) => a._rawDate.getTime() - b._rawDate.getTime());

    callback(messages as ClubMessage[]);
  }, (err) => {
    console.warn("Club messages notice:", err?.message || err);
  });
}

export interface SendClubMessageParams {
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: string;
  text: string;
}

export async function sendClubMessage(clubId: string, { senderId, senderName, senderAvatar, text }: SendClubMessageParams): Promise<void> {
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
