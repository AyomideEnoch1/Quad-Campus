import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDkGBu193wpCYnC8GpHQBgrBfpGTy8cncQ",
  authDomain: "quad-campus.firebaseapp.com",
  projectId: "quad-campus",
  storageBucket: "quad-campus.firebasestorage.app",
  messagingSenderId: "948016001653",
  appId: "1:948016001653:android:398336f14c3818cbd6fe3c"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
