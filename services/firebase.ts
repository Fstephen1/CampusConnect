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

// TEMPORARY: Disable Firebase Auth initialization to fix errors
// TODO: Re-enable once initialization issues are resolved
/*
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
*/
export const storage = getStorage(app);

// Head Admin Configuration
const HEAD_ADMIN_EMAIL = 'stephenmboudjika@gmail.com';

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

    // Check approval status for teacher/admin accounts
    if ((userAccount.role === 'teacher' || userAccount.role === 'admin') && userAccount.status === 'pending') {
      throw new Error('Your account is pending approval. Please wait for administrator approval.');
    }

    if (userAccount.status === 'rejected') {
      throw new Error('Your account has been rejected. Please contact the administrator.');
    }

    const user: User = {
      uid: userAccount.uid,
      email: userAccount.email,
      displayName: userAccount.displayName,
      photoURL: userAccount.photoURL,
      role: userAccount.role,
      status: userAccount.status,
      isHeadAdmin: userAccount.email === HEAD_ADMIN_EMAIL
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

    // Determine approval status based on role and head admin status
    let status: 'pending' | 'approved' = 'approved';
    if (role === 'teacher' || role === 'admin') {
      // Head admin is auto-approved, others need approval
      if (email === HEAD_ADMIN_EMAIL) {
        status = 'approved'; // Head admin auto-approved
      } else {
        status = 'pending'; // Other teacher/admin accounts need approval
      }
    }

    const userAccount: UserAccount = {
      uid,
      email,
      password,
      displayName: name,
      photoURL: null,
      role,
      status,
      isHeadAdmin: email === HEAD_ADMIN_EMAIL,
      createdAt: new Date().toISOString()
    };

    this.users[email] = userAccount;

    const user: User = {
      uid: userAccount.uid,
      email: userAccount.email,
      displayName: userAccount.displayName,
      photoURL: userAccount.photoURL,
      role: userAccount.role,
      status: userAccount.status,
      isHeadAdmin: userAccount.isHeadAdmin
    };

    // Only set as current user if approved (students are auto-approved)
    if (status === 'approved') {
      this.currentUser = user;
    } else {
      // For pending accounts, don't set as current user but still return for feedback
      this.currentUser = null;
    }

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

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!this.currentUser || !this.currentUser.email) {
      throw new Error('No authenticated user');
    }

    const userAccount = this.users[this.currentUser.email];
    if (!userAccount) {
      throw new Error('User account not found');
    }

    // Verify current password
    if (userAccount.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    // Update password
    userAccount.password = newPassword;
    console.log(`Password updated for user: ${this.currentUser.email}`);
  }
  
  getCurrentUser(): User | null {
    return this.currentUser;
  }
  
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    callback(this.currentUser);

    return () => {};
  }

  // Admin approval methods
  async getPendingApprovals(): Promise<UserAccount[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    return Object.values(this.users).filter(user =>
      user.status === 'pending' && (user.role === 'teacher' || user.role === 'admin')
    );
  }

  async approveUser(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const userAccount = this.users[email];
    if (!userAccount) {
      throw new Error('User not found');
    }

    if (userAccount.status !== 'pending') {
      throw new Error('User is not pending approval');
    }

    userAccount.status = 'approved';
    console.log(`User approved: ${email}`);
  }

  async rejectUser(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const userAccount = this.users[email];
    if (!userAccount) {
      throw new Error('User not found');
    }

    if (userAccount.status !== 'pending') {
      throw new Error('User is not pending approval');
    }

    userAccount.status = 'rejected';
    console.log(`User rejected: ${email}`);
  }

  // Check if current user is head admin
  isHeadAdmin(): boolean {
    return this.currentUser?.email === HEAD_ADMIN_EMAIL;
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<UserAccount[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!this.isHeadAdmin()) {
      throw new Error('Access denied. Head admin only.');
    }

    return Object.values(this.users);
  }
}
export const firebaseAuth = new FirebaseAuth();