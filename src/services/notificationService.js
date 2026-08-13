import { db } from '../config/firebase';
import { collection, doc, setDoc, onSnapshot, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

const NOTIFS_COLLECTION = 'notifications';

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'New Like on your post ❤️',
    message: 'Tobi liked your post in UNILAG Campus feed.',
    time: '5m ago',
    type: 'like',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'n2',
    title: 'Marketplace Inquiry 🛍️',
    message: 'Chika sent you a message about "Engineering Textbook".',
    time: '1h ago',
    type: 'market',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'n3',
    title: 'Club Announcement 🚀',
    message: 'Google Developer Student Club posted a new workshop event.',
    time: '3h ago',
    type: 'club',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80'
  }
];

export function subscribeUserNotifications(userId, callback) {
  if (!userId) return () => {};
  try {
    const q = query(
      collection(db, NOTIFS_COLLECTION),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(notifs);
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

export async function createNotificationEvent({ userId, title, message, type = 'general', avatar }) {
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
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn("Error creating notification event:", err.message);
  }
}
