import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { firebaseAuth } from '@/services/firebase';
import { User, ProfileUpdate, RegistrationData } from '@/types/user';

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
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const user = await firebaseAuth.login(email, password);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (registrationData: RegistrationData) => {
    try {
      setLoading(true);
      const user = await firebaseAuth.register(registrationData);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await firebaseAuth.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user) throw new Error('User not authenticated');
    
    await firebaseAuth.updateUserProfile(user.uid, updates);

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