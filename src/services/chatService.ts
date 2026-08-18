import { db, auth } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  limit,
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
    limit(100)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(d => {
      const data = d.data() as any;
      return {
        id: d.id,
        ...data,
        time: data.createdAt?.toDate
          ? data.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Just now',
        _rawDate: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
      };
    }).sort((a, b) => a._rawDate.getTime() - b._rawDate.getTime());
    callback(messages as unknown as DirectChatMessage[]);
  }, (err) => {
    console.warn("Direct chat messages subscription error:", err);
  });
}

import { createNotificationEvent } from './notificationService';

export async function sendMessage(chatId: string, senderUid: string, text: string, mediaUrl?: string): Promise<void> {
  if ((!text || text.trim().length === 0) && !mediaUrl) return;

  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const chatRef = doc(db, 'chats', chatId);

  const messageDoc: any = {
    senderUid: senderUid || auth.currentUser?.uid || 'usr_me',
    text: text ? text.trim() : (mediaUrl ? '📷 Photo attachment' : ''),
    createdAt: serverTimestamp()
  };

  if (mediaUrl) {
    messageDoc.mediaUrl = mediaUrl;
  }

  await addDoc(messagesRef, messageDoc);

  await setDoc(chatRef, {
    lastMessage: text && text.trim().length > 0 ? text.trim() : '📷 Photo attachment',
    lastMessageTime: serverTimestamp()
  }, { merge: true });

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
          message: text && text.trim().length > 0 ? text.trim() : '📷 Sent a photo',
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
