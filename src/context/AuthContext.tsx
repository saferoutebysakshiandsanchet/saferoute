import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';

export const ADMIN_EMAIL = 'saferoutetyproject@gmail.com';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  authError: null,
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const adminStatus = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        setIsAdmin(adminStatus);

        // Sync or register user profile document in Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (!snap.exists()) {
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'SafeRoute Citizen',
              photoURL: user.photoURL || '',
              role: adminStatus ? 'admin' : 'citizen',
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error('Error syncing user profile to Firestore:', err);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('SafeRoute Google Sign-In error:', err);
      setAuthError(err?.message || 'Failed to authenticate with Google');
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('SafeRoute Logout error:', err);
      setAuthError(err?.message || 'Failed to sign out');
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin,
      loading,
      signInWithGoogle,
      logout,
      authError,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
