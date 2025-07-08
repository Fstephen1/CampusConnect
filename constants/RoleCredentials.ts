export const ROLE_ACCESS_CODES = {
  teacher: 'TEACH2025',
  admin: 'ADMIN2025'
} as const;

export const ROLE_DESCRIPTIONS = {
  student: 'Access to view announcements, events, and basic features',
  teacher: 'Can create announcements, manage events, and access teacher features',
  admin: 'Full access to all features including user management and system settings'
} as const;

export function validateAccessCode(role: 'student' | 'teacher' | 'admin', accessCode?: string): boolean {
  if (role === 'student') {
    return true;
  }
  
  if (role === 'teacher') {
    return accessCode === ROLE_ACCESS_CODES.teacher;
  }
  
  if (role === 'admin') {
    return accessCode === ROLE_ACCESS_CODES.admin;
  }
  
  return false;
}

export function getRequiredAccessCode(role: 'student' | 'teacher' | 'admin'): string | null {
  if (role === 'student') return null;
  if (role === 'teacher') return ROLE_ACCESS_CODES.teacher;
  if (role === 'admin') return ROLE_ACCESS_CODES.admin;
  return null;
}
