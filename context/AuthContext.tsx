import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { User, ProfileUpdate, RegistrationData } from '@/types/user';
import { validateAccessCode } from '@/constants/RoleCredentials';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (registrationData: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || null,
          role: 'student' // Default role, you might want to store this in Firestore
        };
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message || 'Failed to log in');
    }
  };

  const register = async (registrationData: RegistrationData) => {
    try {
      setLoading(true);
      const { name, email, password, role, accessCode } = registrationData;

      // Validate access code for role
      if (!validateAccessCode(role, accessCode)) {
        throw new Error(`Invalid ${role} access code. Please contact your administrator.`);
      }

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update user profile with display name
      await updateFirebaseProfile(userCredential.user, {
        displayName: name
      });

      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message || 'Failed to register');
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message || 'Failed to log out');
    }
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user || !auth.currentUser) throw new Error('User not authenticated');

    await updateFirebaseProfile(auth.currentUser, {
      displayName: updates.displayName,
      photoURL: updates.photoURL
    });

    setUser(prevUser => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        ...updates,
      };
    });
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}