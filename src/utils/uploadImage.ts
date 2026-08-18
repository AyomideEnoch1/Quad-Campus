import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export type MediaType = 'image' | 'video';

export async function uploadImage(
  localUri: string | null,
  pathPrefix: string = 'uploads',
  type: MediaType = 'image'
): Promise<string | null> {
  if (!localUri) return null;

  // Already a remote URL
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    return localUri;
  }

  try {
    let uploadUri = localUri;
    const isVideo = type === 'video' || localUri.endsWith('.mp4') || localUri.endsWith('.mov');

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

    // Convert local URI to Blob reliably using fetch or XHR
    let blob: Blob;
    try {
      const response = await fetch(uploadUri);
      blob = await response.blob();
    } catch {
      blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => resolve(xhr.response as Blob);
        xhr.onerror = () => reject(new TypeError("Failed to convert file to blob"));
        xhr.responseType = "blob";
        xhr.open("GET", uploadUri, true);
        xhr.send(null);
      });
    }

    const ext = isVideo ? 'mp4' : 'jpg';
    const contentType = isVideo ? 'video/mp4' : 'image/jpeg';
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const storageRef = ref(storage, `${pathPrefix}/${filename}`);

    // Upload with metadata
    await uploadBytes(storageRef, blob, { contentType });
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error: any) {
    console.error("Firebase Storage Upload Error:", error?.message || error);
    // Do not return local cache URI because it expires and breaks for other users
    throw new Error(error?.message || "Failed to upload image to cloud storage.");
  }
}

export async function pickAndUploadImage(
  pathPrefix: string = 'uploads',
  mediaType: 'images' | 'videos' | 'all' = 'all'
): Promise<{ url: string; type: MediaType } | null> {
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

    if (!uploadedUrl) {
      alert("Failed to upload image. Please try again.");
      return null;
    }

    return {
      url: uploadedUrl,
      type: isVideo ? 'video' : 'image'
    };
  } catch (error: any) {
    console.warn("Error picking/uploading media:", error);
    alert(error?.message || "Failed to upload image.");
    return null;
  }
}
