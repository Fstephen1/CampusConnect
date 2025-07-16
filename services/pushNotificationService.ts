// PUSH NOTIFICATIONS COMPLETELY DISABLED TO PREVENT ERRORS

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

// MOCK PUSH NOTIFICATION SERVICE - ALL METHODS DISABLED
class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize(): Promise<string | null> {
    console.log('Push notifications disabled - initialize() called but not executed');
    return null;
  }

  private setupListeners() {
    console.log('Push notifications disabled - setupListeners() called but not executed');
  }

  private handleNotificationResponse(response: any) {
    console.log('Push notifications disabled - handleNotificationResponse() called but not executed');
  }

  async sendLocalNotification(notificationData: PushNotificationData) {
    console.log('Push notifications disabled - sendLocalNotification() called but not executed');
  }

  async sendPushNotificationToUsers(userTokens: string[], notificationData: PushNotificationData) {
    console.log('Push notifications disabled - sendPushNotificationToUsers() called but not executed');
    return false;
  }

  async setBadgeCount(count: number) {
    console.log('Push notifications disabled - setBadgeCount() called but not executed');
  }

  async clearAllNotifications() {
    console.log('Push notifications disabled - clearAllNotifications() called but not executed');
  }

  getExpoPushToken(): string | null {
    return null;
  }

  cleanup() {
    console.log('Push notifications disabled - cleanup() called but not executed');
  }
}

export const pushNotificationService = new PushNotificationService();
