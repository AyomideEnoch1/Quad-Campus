import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * Compresses an image and uploads it to Firebase Storage bucket.
 * 
 * @param {string} localUri - Local file/image URI (e.g. file:///... or ph://...)
 * @param {string} pathPrefix - Storage directory ('posts', 'marketplace', 'avatars', 'banners')
 * @returns {Promise<string>} Public Firebase Storage download URL
 */
export async function uploadImage(localUri, pathPrefix = 'uploads') {
  if (!localUri) return null;

  // If already a remote URL (e.g. Unsplash or https://), return directly
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    return localUri;
  }

  try {
    // 1. Compress & resize image to optimize storage and upload speed
    const manipulatedImage = await manipulateAsync(
      localUri,
      [{ resize: { width: 1080 } }],
      { compress: 0.75, format: SaveFormat.JPEG }
    );

    // 2. Fetch blob from compressed image URI
    const response = await fetch(manipulatedImage.uri);
    const blob = await response.blob();

    // 3. Generate unique storage filename
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
    const storageRef = ref(storage, `${pathPrefix}/${filename}`);

    // 4. Upload bytes to Firebase Storage
    await uploadBytes(storageRef, blob);

    // 5. Get and return public HTTPS download URL
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error("Firebase Storage Upload Error:", error);
    throw error;
  }
}
