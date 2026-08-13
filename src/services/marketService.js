import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Subscribe to marketplace items in real-time
 */
export function subscribeMarketplaceItems(category, callback) {
  let q;
  if (category && category !== 'All') {
    q = query(
      collection(db, 'marketplace_items'),
      where('category', '==', category),
      where('status', '==', 'available'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  } else {
    q = query(
      collection(db, 'marketplace_items'),
      where('status', '==', 'available'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate
        ? formatTimeAgo(d.data().createdAt.toDate())
        : 'Just now'
    }));
    callback(items);
  }, (err) => {
    console.error("Marketplace subscription error:", err);
  });
}

/**
 * Create a new item listing
 */
export async function createListing({
  sellerId,
  sellerName,
  sellerAvatar,
  sellerSchoolId,
  sellerSchoolName,
  isVerifiedSeller,
  title,
  price,
  category,
  condition,
  description,
  imageUrl,
  location
}) {
  const itemData = {
    sellerId,
    sellerName,
    sellerAvatar,
    sellerSchoolId,
    sellerSchoolName,
    isVerifiedSeller: !!isVerifiedSeller,
    title,
    price: parseFloat(price) || 0,
    category,
    condition,
    description,
    imageUrl,
    location,
    status: 'available',
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'marketplace_items'), itemData);
  return docRef.id;
}

/**
 * Mark item as sold
 */
export async function markItemSold(itemId) {
  await updateDoc(doc(db, 'marketplace_items', itemId), {
    status: 'sold',
    updatedAt: serverTimestamp()
  });
}

/**
 * Delete listing
 */
export async function deleteListing(itemId) {
  await deleteDoc(doc(db, 'marketplace_items', itemId));
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
