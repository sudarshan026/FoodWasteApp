import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthSession } from '../models/types';
import { AuthService } from '../services/authService';
import { InventoryService } from '../services/inventoryService';
import { auth, db } from '../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch profile from Firestore
          const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          const profileData = profileSnap.data();

          setUser({
            id: firebaseUser.uid,
            name: profileData?.name || firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            password: '',
            createdAt: profileData?.createdAt || new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            password: '',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await AuthService.login(email, password);
    setUser(session.user);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const session = await AuthService.signup(name, email, password);
    setUser(session.user);
    // Seed sample data for new users
    await InventoryService.seedData(session.user.id);
  }, []);

  const logout = useCallback(async () => {
    await AuthService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
