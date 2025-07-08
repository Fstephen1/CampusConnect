import { Announcement } from '@/types/announcements';
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Fall Semester Registration Opens',
    content: 'Registration for the Fall 2025 semester will open on May 15th. Make sure to check your enrollment appointment time in the student portal. Priority registration will be available for seniors and honors students starting May 10th.',
    authorId: 'admin1',
    authorName: 'Office of the Registrar',
    authorPhotoUrl: 'https://images.pexels.com/photos/3220360/pexels-photo-3220360.jpeg?auto=compress&cs=tinysrgb&w=500',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isPinned: true,
    category: 'Academic',
    role: 'admin',
    targetRoles: ['general'],
    isPublic: true,
    attachments: [
      {
        id: 'att1',
        name: 'Registration_Guide_2025.pdf',
        type: 'document',
        url: 'https://example.com/registration-guide.pdf',
        size: 2048576,
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedBy: 'admin1',
      }
    ]
  },
  {
    id: '2',
    title: 'Campus-Wide Internet Maintenance',
    content: 'The IT department will be performing maintenance on the campus network infrastructure this Saturday from 1:00 AM to 5:00 AM. Internet service may be intermittent during this time. Plan accordingly if you have work that requires internet access.',
    authorId: 'admin2',
    authorName: 'IT Department',
    authorPhotoUrl: null,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isPinned: false,
    category: 'Urgent',
    role: 'admin',
    targetRoles: ['general'],
    isPublic: true
  },
  {
    id: '3',
    title: 'Important Update: Midterm Schedule Changes',
    content: 'Due to the upcoming faculty development day, some midterm exam schedules have been adjusted. Please check the updated schedule on the course portal.',
    authorId: 'teacher1',
    authorName: 'Dr. Sarah Martinez',
    authorPhotoUrl: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=500',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isPinned: false,
    category: 'Academic',
    role: 'teacher',
    targetRoles: ['bachelor'],
    isPublic: false,
    attachments: [
      {
        id: 'att2',
        name: 'Updated_Midterm_Schedule.pdf',
        type: 'document',
        url: 'https://example.com/midterm-schedule.pdf',
        size: 1024000,
        uploadedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        uploadedBy: 'teacher1',
      },
      {
        id: 'att3',
        name: 'classroom_map.jpg',
        type: 'image',
        url: 'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=500',
        size: 512000,
        uploadedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        uploadedBy: 'teacher1',
      }
    ]
  }
];

export const getAnnouncements = async (): Promise<Announcement[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [...mockAnnouncements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
};

export const createAnnouncement = async (announcement: Omit<Announcement, 'id' | 'timestamp'>): Promise<Announcement> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newAnnouncement: Announcement = {
    ...announcement,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
  };
  
  mockAnnouncements.unshift(newAnnouncement);
  
  return newAnnouncement;
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockAnnouncements.findIndex(a => a.id === id);
  if (index !== -1) {
    mockAnnouncements.splice(index, 1);
  }
};

export const updateAnnouncement = async (id: string, updates: Partial<Announcement>): Promise<Announcement> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const index = mockAnnouncements.findIndex(a => a.id === id);
  if (index === -1) {
    throw new Error('Announcement not found');
  }
  
  const updatedAnnouncement = {
    ...mockAnnouncements[index],
    ...updates,
  };
  
  mockAnnouncements[index] = updatedAnnouncement;
  
  return updatedAnnouncement;
};

export const toggleAnnouncementPin = async (id: string): Promise<Announcement> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockAnnouncements.findIndex(a => a.id === id);
  if (index === -1) {
    throw new Error('Announcement not found');
  }
  
  const announcement = mockAnnouncements[index];
  const updatedAnnouncement = {
    ...announcement,
    isPinned: !announcement.isPinned,
  };
  
  mockAnnouncements[index] = updatedAnnouncement;
  
  return updatedAnnouncement;
};