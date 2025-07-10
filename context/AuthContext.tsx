import React, { createContext, useState, useEffect, ReactNode } from 'react';
// import { auth } from '@/services/firebase';
// Temporarily disabled Firebase imports to fix initialization issues
/*
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser
} from 'firebase/auth';
*/
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
    // Temporarily disable Firebase Auth to test app loading
    setLoading(false);

    // TODO: Re-enable Firebase Auth once app loads properly
    /*
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
    */
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Temporarily use mock login for testing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user for testing
      const mockUser: User = {
        uid: 'mock-user-id',
        email: email,
        displayName: 'Test User',
        photoURL: null,
        role: 'student'
      };
      setUser(mockUser);

      // TODO: Re-enable Firebase Auth
      // await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to log in');
    } finally {
      setLoading(false);
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

      // Temporarily use mock registration
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUser: User = {
        uid: 'mock-user-id',
        email: email,
        displayName: name,
        photoURL: null,
        role: role
      };
      setUser(mockUser);

      // TODO: Re-enable Firebase Auth
      // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // await updateFirebaseProfile(userCredential.user, { displayName: name });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // Temporarily use mock logout
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null);

      // TODO: Re-enable Firebase Auth
      // await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to log out');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user) throw new Error('User not authenticated');

    // Temporarily use mock update
    await new Promise(resolve => setTimeout(resolve, 500));

    setUser(prevUser => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        ...updates,
      };
    });

    // TODO: Re-enable Firebase Auth
    // await updateFirebaseProfile(auth.currentUser, {
    //   displayName: updates.displayName,
    //   photoURL: updates.photoURL
    // });
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