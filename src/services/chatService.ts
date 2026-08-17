import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { Chat, DirectChatMessage, ChatPartner } from '../types';

export async function getOrCreateChat(user1: any, user2: any): Promise<string> {
  const chatId = [user1.uid, user2.uid].sort().join('_');
  const chatRef = doc(db, 'chats', chatId);
  const snap = await getDoc(chatRef);

  if (!snap.exists()) {
    await setDoc(chatRef, {
      id: chatId,
      participants: [user1.uid, user2.uid],
      participantDetails: {
        [user1.uid]: {
          displayName: user1.displayName || user1.email?.split('@')[0] || 'User',
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

export function subscribeUserChats(userUid: string, callback: (chats: Chat[]) => void): Unsubscribe {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', userUid)
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs
      .map(d => {
        const data = d.data();
        const partnerUid = data.participants?.find((uid: string) => uid !== userUid) || 'unknown';
        const partner: ChatPartner = data.participantDetails?.[partnerUid] || { displayName: 'Student', avatarUrl: '' };

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
      .sort((a, b) => b._rawDate.getTime() - a._rawDate.getTime());

    callback(chats as Chat[]);
  }, (err) => {
    console.warn("Chat list subscription notice:", err?.message || err);
  });
}

export function subscribeChatMessages(chatId: string, callback: (messages: DirectChatMessage[]) => void): Unsubscribe {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(d => ({
      id: d.id,
      ...(d.data() as any),
      createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date()
    }));
    callback(messages as DirectChatMessage[]);
  });
}

import { createNotificationEvent } from './notificationService';

export async function sendMessage(chatId: string, senderUid: string, text: string): Promise<void> {
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

  try {
    const chatSnap = await getDoc(chatRef);
    if (chatSnap.exists()) {
      const data = chatSnap.data();
      const participants = data.participants || [];
      const partnerUid = participants.find((id: string) => id !== senderUid);
      if (partnerUid) {
        await createNotificationEvent({
          userId: partnerUid,
          title: 'New Direct Message 📩',
          message: text.trim(),
          type: 'message'
        });
      }
    }
  } catch (e) {
    console.warn("Message notification notice:", e);
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
