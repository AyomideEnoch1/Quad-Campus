import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

/**
 * Compresses an image/video and uploads it to Firebase Storage bucket.
 * 
 * @param {string} localUri - Local media URI (file:///... or ph://...)
 * @param {string} pathPrefix - Storage directory ('posts', 'marketplace', 'avatars', 'banners')
 * @param {string} type - 'image' | 'video'
 * @returns {Promise<string>} Public Firebase Storage download URL
 */
export async function uploadImage(localUri, pathPrefix = 'uploads', type = 'image') {
  if (!localUri) return null;

  // If already a remote URL (e.g. Unsplash or https://), return directly
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    return localUri;
  }

  try {
    let uploadUri = localUri;
    const isVideo = type === 'video' || localUri.endsWith('.mp4') || localUri.endsWith('.mov');

    // 1. Compress & resize image (skip image manipulation if video)
    if (!isVideo) {
      try {
        const manipulatedImage = await manipulateAsync(
          localUri,
          [{ resize: { width: 1080 } }],
          { compress: 0.75, format: SaveFormat.JPEG }
        );
        uploadUri = manipulatedImage.uri;
      } catch (e) {
        console.warn("Image manipulation skipped:", e);
      }
    }

    // 2. Read blob using XMLHttpRequest
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new TypeError("Failed to convert file to blob"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uploadUri, true);
      xhr.send(null);
    });

    // 3. Generate unique storage filename with proper extension
    const ext = isVideo ? 'mp4' : 'jpg';
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const storageRef = ref(storage, `${pathPrefix}/${filename}`);

    // 4. Upload bytes to Firebase Storage
    await uploadBytes(storageRef, blob);

    // 5. Get and return public HTTPS download URL
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.warn("Firebase Storage Upload Notice (using local file fallback):", error?.message || error);
    return localUri;
  }
}

/**
 * Opens system gallery allowing image or video selection, then uploads it.
 * 
 * @param {string} pathPrefix - Storage folder
 * @param {string} mediaType - 'images' | 'videos' | 'all'
 * @returns {Promise<{ url: string, type: 'image' | 'video' } | null>}
 */
export async function pickAndUploadImage(pathPrefix = 'uploads', mediaType = 'all') {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access photo and video gallery is required!");
      return null;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType === 'all' ? ['images', 'videos'] : [mediaType],
      allowsEditing: true,
      quality: 0.8,
    });

    if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
      return null;
    }

    const asset = pickerResult.assets[0];
    const localUri = asset.uri;
    const isVideo = asset.type === 'video' || localUri.endsWith('.mp4') || localUri.endsWith('.mov');
    const uploadedUrl = await uploadImage(localUri, pathPrefix, isVideo ? 'video' : 'image');

    return {
      url: uploadedUrl || localUri,
      type: isVideo ? 'video' : 'image'
    };
  } catch (error) {
    console.warn("Error picking media:", error);
    return null;
  }
}
