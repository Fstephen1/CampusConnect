import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize(): Promise<string | null> {
    try {
      // Check if device supports push notifications
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission not granted for push notifications');
        return null;
      }

      // Get push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      
      if (!projectId) {
        console.log('Project ID not found');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.expoPushToken = token.data;
      console.log('Push token obtained:', this.expoPushToken);

      // Set up notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'CampusConnect',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });

        // Create separate channels for different notification types
        await Notifications.setNotificationChannelAsync('announcements', {
          name: 'Announcements',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('events', {
          name: 'Events',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 500, 250, 500],
          sound: 'default',
        });
      }

      // Set up listeners
      this.setupListeners();

      return this.expoPushToken;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return null;
    }
  }

  private setupListeners() {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // You can handle foreground notifications here
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    
    if (data?.type === 'announcement' && data?.announcementId) {
      // Navigate to announcement details
      console.log('Navigate to announcement:', data.announcementId);
      // You can use router.push() here to navigate
    } else if (data?.type === 'event' && data?.eventId) {
      // Navigate to event details
      console.log('Navigate to event:', data.eventId);
      // You can use router.push() here to navigate
    }
  }

  async sendLocalNotification(notificationData: PushNotificationData) {
    try {
      const channelId = notificationData.type === 'announcement' ? 'announcements' : 
                       notificationData.type === 'event' ? 'events' : 'default';

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: 'default',
        },
        trigger: null, // Show immediately
        identifier: `${notificationData.type}_${Date.now()}`,
      });

      console.log('Local notification sent:', notificationData.title);
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Simulate sending push notification to other users
  async sendPushNotificationToUsers(userTokens: string[], notificationData: PushNotificationData) {
    try {
      // In a real app, this would be done by your backend server
      // For now, we'll simulate it with local notifications
      console.log('Simulating push notification to users:', userTokens.length);
      
      // Send local notification to simulate receiving from another user
      setTimeout(() => {
        this.sendLocalNotification(notificationData);
      }, 2000); // Delay to simulate network

      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  async setBadgeCount(count: number) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  async clearAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await this.setBadgeCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export const pushNotificationService = new PushNotificationService();
