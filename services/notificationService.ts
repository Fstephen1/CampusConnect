import { Notification, NotificationSummary } from '@/types/notifications';

class NotificationService {
  private notifications: { [userId: string]: Notification[] } = {};

  // Initialize with some mock notifications for demonstration
  constructor() {
    this.initializeMockNotifications();
  }

  private initializeMockNotifications() {
    // Mock notifications for different users
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'New Announcement',
        message: 'Fall Semester Registration Opens - Check the details now!',
        type: 'announcement',
        relatedId: '1',
        userId: 'mock-user-id',
        isRead: false,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        category: 'Academic',
        authorName: 'Office of the Registrar',
        authorPhotoUrl: 'https://images.pexels.com/photos/3220360/pexels-photo-3220360.jpeg?auto=compress&cs=tinysrgb&w=500'
      },
      {
        id: '2',
        title: 'System Maintenance',
        message: 'Campus-Wide Internet Maintenance scheduled for this Saturday',
        type: 'announcement',
        relatedId: '2',
        userId: 'mock-user-id',
        isRead: false,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        category: 'Urgent',
        authorName: 'IT Department'
      },
      {
        id: '3',
        title: 'Upcoming Event',
        message: 'Machine Learning Workshop tomorrow at 2:00 PM',
        type: 'event',
        relatedId: '1',
        userId: 'mock-user-id',
        isRead: true,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        category: 'Academic',
        authorName: 'AI Student Association'
      },
      {
        id: '4',
        title: 'Welcome to CampusConnect!',
        message: 'Get started by exploring announcements and events',
        type: 'system',
        userId: 'mock-user-id',
        isRead: true,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        category: 'System'
      }
    ];

    // Add mock notifications for the mock user
    this.notifications['mock-user-id'] = mockNotifications;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!this.notifications[userId]) {
      this.notifications[userId] = [];
    }
    
    return [...this.notifications[userId]].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getNotificationSummary(userId: string): Promise<NotificationSummary> {
    const notifications = await this.getUserNotifications(userId);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const recentNotifications = notifications.slice(0, 5); // Get 5 most recent

    return {
      total: notifications.length,
      unread: unreadCount,
      recent: recentNotifications
    };
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (this.notifications[userId]) {
      const notification = this.notifications[userId].find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
      }
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (this.notifications[userId]) {
      this.notifications[userId].forEach(notification => {
        notification.isRead = true;
      });
    }
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (this.notifications[userId]) {
      this.notifications[userId] = this.notifications[userId].filter(n => n.id !== notificationId);
    }
  }

  // This would be called when new announcements or events are created
  async createNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString()
    };

    if (!this.notifications[notification.userId]) {
      this.notifications[notification.userId] = [];
    }

    this.notifications[notification.userId].unshift(newNotification);
  }
}

export const notificationService = new NotificationService();
