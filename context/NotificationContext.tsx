import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { pushNotificationService, PushNotificationData } from '@/services/pushNotificationService'; // Disabled
import { useAuth } from '@/hooks/useAuth';

// Mock PushNotificationData interface
export interface PushNotificationData {
  type: 'announcement' | 'event' | 'system';
  title: string;
  body: string;
  data?: {
    announcementId?: string;
    eventId?: string;
    authorName?: string;
    category?: string;
  };
}

interface NotificationContextType {
  pushToken: string | null;
  isNotificationEnabled: boolean;
  sendNotificationToUsers: (userIds: string[], notification: PushNotificationData) => Promise<boolean>;
  updateBadgeCount: (count: number) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  // Disabled push notification initialization to prevent errors
  useEffect(() => {
    console.log('Push notifications disabled to prevent errors');
    setIsNotificationEnabled(false);
    setPushToken(null);
  }, []);

  // Mock functions to prevent errors when push notifications are disabled
  const sendNotificationToUsers = async (userIds: string[], notification: PushNotificationData): Promise<boolean> => {
    console.log('Push notifications disabled - sendNotificationToUsers called but not executed');
    return false;
  };

  const updateBadgeCount = async (count: number) => {
    console.log('Push notifications disabled - updateBadgeCount called but not executed');
  };

  const clearAllNotifications = async () => {
    console.log('Push notifications disabled - clearAllNotifications called but not executed');
  };

  const value: NotificationContextType = {
    pushToken,
    isNotificationEnabled,
    sendNotificationToUsers,
    updateBadgeCount,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  // Return mock notification context when push notifications are disabled
  return {
    pushToken: null,
    isNotificationEnabled: false,
    sendNotificationToUsers: async () => false,
    updateBadgeCount: async () => {},
    clearAllNotifications: async () => {},
  };
}
