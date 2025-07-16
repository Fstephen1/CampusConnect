export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'event' | 'system';
  relatedId?: string; // ID of related announcement or event
  userId: string;
  isRead: boolean;
  timestamp: string;
  category?: string;
  authorName?: string;
  authorPhotoUrl?: string | null;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  recent: Notification[];
}
