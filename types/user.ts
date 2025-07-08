export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'student' | 'teacher' | 'admin';
  notificationRoles?: string[];
}

export interface UserAccount {
  uid: string;
  email: string;
  password: string;
  displayName: string;
  photoURL: string | null;
  role: 'student' | 'teacher' | 'admin';
  createdAt: string;
}

export interface ProfileUpdate {
  displayName?: string;
  photoURL?: string;
}

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  accessCode?: string;
}