export interface NotificationRole {
  id: string;
  name: string;
  description: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
  createdBy: string;
}

export interface UserNotificationPreferences {
  userId: string;
  subscribedRoles: string[];
  allowAllAnnouncements: boolean;
  updatedAt: string;
}

export const DEFAULT_NOTIFICATION_ROLES: NotificationRole[] = [
  {
    id: 'hnd',
    name: 'HND',
    description: 'Higher National Diploma students',
    color: '#3B82F6',
    isDefault: true,
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'bachelor',
    name: 'Bachelor Degree',
    description: 'Bachelor degree students',
    color: '#10B981',
    isDefault: true,
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'masters',
    name: 'Masters',
    description: 'Masters degree students',
    color: '#8B5CF6',
    isDefault: true,
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'polytech',
    name: 'Polytech',
    description: 'Polytechnic students',
    color: '#F59E0B',
    isDefault: true,
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'general',
    name: 'General',
    description: 'General announcements for all students',
    color: '#6B7280',
    isDefault: true,
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  }
];
