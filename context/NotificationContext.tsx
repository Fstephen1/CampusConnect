import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { pushNotificationService, PushNotificationData } from '@/services/pushNotificationService';
import { useAuth } from '@/hooks/useAuth';

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

  useEffect(() => {
    initializeNotifications();

    // Cleanup on unmount
    return () => {
      pushNotificationService.cleanup();
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      const token = await pushNotificationService.initialize();
      if (token) {
        setPushToken(token);
        setIsNotificationEnabled(true);
        console.log('Push notifications initialized successfully');
      } else {
        console.log('Push notifications not available');
        setIsNotificationEnabled(false);
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      setIsNotificationEnabled(false);
    }
  };

  const sendNotificationToUsers = async (userIds: string[], notification: PushNotificationData): Promise<boolean> => {
    try {
      // In a real app, you would send userIds to your backend
      // The backend would look up push tokens for these users and send notifications
      
      // For now, we'll simulate this by sending a local notification
      // This simulates receiving a notification from another user
      const userTokens = userIds.map(id => `mock-token-${id}`);
      
      const success = await pushNotificationService.sendPushNotificationToUsers(userTokens, notification);
      return success;
    } catch (error) {
      console.error('Error sending notification to users:', error);
      return false;
    }
  };

  const updateBadgeCount = async (count: number) => {
    try {
      await pushNotificationService.setBadgeCount(count);
    } catch (error) {
      console.error('Error updating badge count:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await pushNotificationService.clearAllNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
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
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
