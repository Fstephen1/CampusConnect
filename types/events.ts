import { FileAttachment } from './files';

export interface Event {
  id: string;
  title: string;
  description: string;
  startTime?: string;
  endTime?: string;
  location: string;
  type: string;
  organizer: string;
  attendees?: number;
  attachments?: FileAttachment[];
  targetRoles?: string[];
  isPublic?: boolean;
  createdBy?: string;
}