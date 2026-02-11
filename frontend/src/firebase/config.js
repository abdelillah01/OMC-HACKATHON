import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDgq3_ScIau_0HxSBMJ47EZAnQxqc5omwo",
  authDomain: "pexilis.firebaseapp.com",
  projectId: "pexilis",
  storageBucket: "pexilis.firebasestorage.app",
  messagingSenderId: "810186574683",
  appId: "1:810186574683:web:1eff0acf77bbbea816e87e",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export default app;
