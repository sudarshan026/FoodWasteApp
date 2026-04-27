// ─── Firebase Configuration ──────────────────────────────────
import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// @ts-ignore – react-native async storage persistence
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDi0kek0c80-cVVAcGIeDqLOYqjudIzkrs",
  authDomain: "foodwasteapp-7404e.firebaseapp.com",
  projectId: "foodwasteapp-7404e",
  storageBucket: "foodwasteapp-7404e.firebasestorage.app",
  messagingSenderId: "302347631842",
  appId: "1:302347631842:web:f16dd9d717a50802ccb2bb",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence (keeps user logged in)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
