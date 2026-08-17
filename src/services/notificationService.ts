import { db } from '../config/firebase';
import { collection, doc, setDoc, onSnapshot, query, where, orderBy, limit, serverTimestamp, Unsubscribe } from 'firebase/firestore';
import { NotificationItem } from '../types';

const NOTIFS_COLLECTION = 'notifications';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'New Like on your post ❤️',
    message: 'Tobi liked your post in UNILAG Campus feed.',
    time: '5m ago',
    type: 'like',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80'
  },
  {
    id: 'n2',
    title: 'Marketplace Inquiry 🛍️',
    message: 'Chika sent you a message about "Engineering Textbook".',
    time: '1h ago',
    type: 'market',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fm=jpg&fit=crop&q=80'
  },
  {
    id: 'n3',
    title: 'Club Announcement 🚀',
    message: 'Google Developer Student Club posted a new workshop event.',
    time: '3h ago',
    type: 'club',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&fm=jpg&fit=crop&q=80'
  }
];

export function subscribeUserNotifications(
  userId: string | undefined,
  callback: (notifications: NotificationItem[]) => void
): Unsubscribe {
  if (!userId) return () => {};
  try {
    const q = query(
      collection(db, NOTIFS_COLLECTION),
      where('userId', '==', userId),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const notifs = snapshot.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            time: data.createdAt?.toDate
              ? formatTimeAgo(data.createdAt.toDate())
              : data.time || 'Just now',
            _rawDate: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
          };
        }).sort((a, b) => b._rawDate.getTime() - a._rawDate.getTime());

        callback(notifs as unknown as NotificationItem[]);
      } else {
        callback(INITIAL_NOTIFICATIONS);
      }
    }, (error) => {
      console.warn("Notifications Firestore listener notice:", error.message);
      callback(INITIAL_NOTIFICATIONS);
    });
  } catch (err) {
    console.warn("Failed to subscribe user notifications:", err);
    callback(INITIAL_NOTIFICATIONS);
    return () => {};
  }
}

export interface CreateNotifParams {
  userId: string;
  title: string;
  message: string;
  type?: 'like' | 'market' | 'club' | 'message' | 'verification' | 'comment' | string;
  avatar?: string;
}

export async function createNotificationEvent({ userId, title, message, type = 'like', avatar }: CreateNotifParams): Promise<void> {
  if (!userId) return;
  try {
    const notifRef = doc(collection(db, NOTIFS_COLLECTION));
    await setDoc(notifRef, {
      userId,
      title,
      message,
      type,
      read: false,
      time: 'Just now',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80',
      createdAt: serverTimestamp()
    });
  } catch (err: any) {
    console.warn("Error creating notification event:", err?.message || err);
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
