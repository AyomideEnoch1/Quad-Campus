import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Get or create a 1-on-1 chat room between two users
 */
export async function getOrCreateChat(user1, user2) {
  const chatId = [user1.uid, user2.uid].sort().join('_');
  const chatRef = doc(db, 'chats', chatId);
  const snap = await getDoc(chatRef);

  if (!snap.exists()) {
    await setDoc(chatRef, {
      id: chatId,
      participants: [user1.uid, user2.uid],
      participantDetails: {
        [user1.uid]: {
          displayName: user1.displayName || user1.email.split('@')[0],
          avatarUrl: user1.avatarUrl || ''
        },
        [user2.uid]: {
          displayName: user2.displayName || user2.email?.split('@')[0] || user2.name || 'User',
          avatarUrl: user2.avatarUrl || ''
        }
      },
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp()
    });
  }

  return chatId;
}

/**
 * Subscribe to the list of chats for current user
 */
export function subscribeUserChats(userUid, callback) {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', userUid)
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs
      .map(d => {
        const data = d.data();
        const partnerUid = data.participants?.find(uid => uid !== userUid) || 'unknown';
        const partner = data.participantDetails?.[partnerUid] || { displayName: 'Student', avatarUrl: '' };

        return {
          id: d.id,
          partner,
          lastMessage: data.lastMessage || 'No messages yet',
          lastMessageTime: data.lastMessageTime?.toDate
            ? formatTimeAgo(data.lastMessageTime.toDate())
            : 'Recently',
          _rawDate: data.lastMessageTime?.toDate ? data.lastMessageTime.toDate() : new Date()
        };
      })
      .sort((a, b) => b._rawDate - a._rawDate);

    callback(chats);
  }, (err) => {
    console.warn("Chat list subscription notice:", err?.message || err);
  });
}

/**
 * Subscribe to messages in a specific chat room
 */
export function subscribeChatMessages(chatId, callback) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date()
    }));
    callback(messages);
  });
}

/**
 * Send a message into a chat room
 */
export async function sendMessage(chatId, senderUid, text) {
  if (!text || text.trim().length === 0) return;

  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const chatRef = doc(db, 'chats', chatId);

  await addDoc(messagesRef, {
    senderUid,
    text: text.trim(),
    createdAt: serverTimestamp()
  });

  await updateDoc(chatRef, {
    lastMessage: text.trim(),
    lastMessageTime: serverTimestamp()
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
