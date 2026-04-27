import { User, AuthSession } from '../models/types';
import { auth, db } from '../config/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export class AuthService {
  /**
   * Register a new user with Firebase Auth + store profile in Firestore
   */
  static async signup(name: string, email: string, password: string): Promise<AuthSession> {
    // Create user in Firebase Auth
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = credential.user;

    // Update display name
    await updateProfile(firebaseUser, { displayName: name });

    // Store profile in Firestore
    const userProfile: User = {
      id: firebaseUser.uid,
      name,
      email: email.toLowerCase(),
      password: '', // Not stored — Firebase Auth handles this
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      name: userProfile.name,
      email: userProfile.email,
      createdAt: userProfile.createdAt,
    });

    return {
      user: userProfile,
      token: await firebaseUser.getIdToken(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Login with Firebase Auth
   */
  static async login(email: string, password: string): Promise<AuthSession> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = credential.user;

    // Fetch profile from Firestore
    const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
    const profileData = profileSnap.data();

    const user: User = {
      id: firebaseUser.uid,
      name: profileData?.name || firebaseUser.displayName || 'User',
      email: firebaseUser.email || email,
      password: '',
      createdAt: profileData?.createdAt || new Date().toISOString(),
    };

    return {
      user,
      token: await firebaseUser.getIdToken(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Get the current session from Firebase Auth state
   */
  static async getSession(): Promise<AuthSession | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
    const profileData = profileSnap.data();

    return {
      user: {
        id: firebaseUser.uid,
        name: profileData?.name || firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        password: '',
        createdAt: profileData?.createdAt || new Date().toISOString(),
      },
      token: await firebaseUser.getIdToken(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Logout — sign out from Firebase
   */
  static async logout(): Promise<void> {
    await signOut(auth);
  }
}
