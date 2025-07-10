import { User, UserAccount, RegistrationData } from '@/types/user';
import { validateAccessCode } from '@/constants/RoleCredentials';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkZSoUw2K6g3ctLXJNu95nvq9CpA3EDK0",
  authDomain: "project-4e808.firebaseapp.com",
  projectId: "project-4e808",
  storageBucket: "project-4e808.firebasestorage.app",
  messagingSenderId: "886880828221",
  appId: "1:886880828221:web:98431cb1e7521091ce2354",
  measurementId: "G-Y078QWF2S3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);

// Initialize Firebase Auth with error handling
let auth: any;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  // If initializeAuth fails (e.g., already initialized), get the existing instance
  console.log('Auth already initialized, getting existing instance');
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
}

export { auth };
export const storage = getStorage(app);

class FirebaseAuth {
  private currentUser: User | null = null;
  private users: { [email: string]: UserAccount } = {};

  async login(email: string, password: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
    
    if (password.length < 6) {
      throw new Error('Password should be at least 6 characters');
    }

    const userAccount = this.users[email];
    if (!userAccount) {
      throw new Error('No account found with this email. Please register first.');
    }

    if (userAccount.password !== password) {
      throw new Error('Invalid password');
    }

    const user: User = {
      uid: userAccount.uid,
      email: userAccount.email,
      displayName: userAccount.displayName,
      photoURL: userAccount.photoURL,
      role: userAccount.role
    };

    this.currentUser = user;
    return this.currentUser;
  }
  
  async register(registrationData: RegistrationData): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { name, email, password, role, accessCode } = registrationData;

    if (!name) {
      throw new Error('Name is required');
    }

    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }

    if (password.length < 6) {
      throw new Error('Password should be at least 6 characters');
    }

    if (this.users[email]) {
      throw new Error('An account with this email already exists');
    }
    if (!validateAccessCode(role, accessCode)) {
      if (role === 'teacher') {
        throw new Error('Invalid teacher access code. Please contact your administrator.');
      }
      if (role === 'admin') {
        throw new Error('Invalid admin access code. Please contact your system administrator.');
      }
    }

    const uid = Math.random().toString(36).substring(2, 9);

    const userAccount: UserAccount = {
      uid,
      email,
      password,
      displayName: name,
      photoURL: null,
      role,
      createdAt: new Date().toISOString()
    };

    this.users[email] = userAccount;

    const user: User = {
      uid: userAccount.uid,
      email: userAccount.email,
      displayName: userAccount.displayName,
      photoURL: userAccount.photoURL,
      role: userAccount.role
    };

    this.currentUser = user;
    return user;
  }
  
  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.currentUser = null;
  }
  
  async updateUserProfile(uid: string, updates: { displayName?: string; photoURL?: string }): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (this.currentUser && this.currentUser.uid === uid) {
      this.currentUser = {
        ...this.currentUser,
        ...updates,
      };

      if (this.currentUser.email) {
        const userAccount = this.users[this.currentUser.email];
        if (userAccount) {
          userAccount.displayName = this.currentUser.displayName;
          userAccount.photoURL = this.currentUser.photoURL;
        }
      }
    } else {
      throw new Error('User not found');
    }
  }
  
  getCurrentUser(): User | null {
    return this.currentUser;
  }
  
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    callback(this.currentUser);

    return () => {};
  }
}
export const firebaseAuth = new FirebaseAuth();