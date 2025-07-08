import { FileAttachment } from './files';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoUrl: string | null;
  timestamp: string;
  isPinned: boolean;
  category?: string;
  role: 'teacher' | 'admin';
  attachments?: FileAttachment[];
  targetRoles?: string[];
  isPublic?: boolean;
  startTime?: string;
  endTime?: string;
}