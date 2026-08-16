import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { MarketplaceItem } from '../types';

export function subscribeMarketplaceItems(category: string, callback: (items: MarketplaceItem[]) => void): Unsubscribe {
  let q;
  if (category && category !== 'All') {
    q = query(
      collection(db, 'marketplace_items'),
      where('category', '==', category),
      limit(50)
    );
  } else {
    q = query(
      collection(db, 'marketplace_items'),
      limit(50)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs
      .map(d => ({
        id: d.id,
        ...(d.data() as any),
        createdAt: d.data().createdAt?.toDate
          ? formatTimeAgo(d.data().createdAt.toDate())
          : 'Just now',
        _rawDate: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date()
      }))
      .filter(item => item.status !== 'sold')
      .sort((a, b) => b._rawDate.getTime() - a._rawDate.getTime());

    callback(items as MarketplaceItem[]);
  }, (err) => {
    console.warn("Marketplace subscription notice:", err?.message || err);
  });
}

export interface CreateListingParams {
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerSchoolId?: string;
  sellerSchoolName?: string;
  isVerifiedSeller?: boolean;
  title: string;
  price: number | string;
  category: string;
  condition: string;
  description: string;
  imageUrl: string;
  location?: string;
}

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
}: CreateListingParams): Promise<string> {
  const itemData = {
    sellerId,
    sellerName,
    sellerAvatar,
    sellerSchoolId,
    sellerSchoolName,
    isVerifiedSeller: !!isVerifiedSeller,
    title,
    price: typeof price === 'number' ? price : (parseFloat(price) || 0),
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

export async function markItemSold(itemId: string): Promise<void> {
  await updateDoc(doc(db, 'marketplace_items', itemId), {
    status: 'sold',
    updatedAt: serverTimestamp()
  });
}

export async function updateListing(itemId: string, updateData: Partial<MarketplaceItem>): Promise<void> {
  const itemRef = doc(db, 'marketplace_items', itemId);
  await updateDoc(itemRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
}

export async function deleteListing(itemId: string): Promise<void> {
  await deleteDoc(doc(db, 'marketplace_items', itemId));
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
