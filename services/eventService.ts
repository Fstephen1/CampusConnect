import { Event } from '@/types/events';
const getDateWithOffset = (dayOffset: number, hourOffset = 0, minuteOffset = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(date.getHours() + hourOffset, minuteOffset, 0, 0);
  return date.toISOString();
};


const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Introduction to Machine Learning Workshop',
    description: 'A hands-on workshop covering the basics of machine learning algorithms and their applications.',
    startTime: getDateWithOffset(0, 2),
    endTime: getDateWithOffset(0, 4),
    location: 'Computer Science Building, Room 203',
    type: 'Academic',
    organizer: 'AI Student Association',
    attendees: 45,
    targetRoles: ['bachelor', 'masters'],
    isPublic: false,
    createdBy: 'teacher1',
  },
  {
    id: '2',
    title: 'Campus Sustainability Fair',
    description: 'Explore eco-friendly initiatives, sustainable products, and learn how to reduce your carbon footprint.',
    startTime: getDateWithOffset(1, 10),
    endTime: getDateWithOffset(1, 14),
    location: 'Main Quad',
    type: 'Social',
    organizer: 'Environmental Studies Department',
    attendees: 120,
    isPublic: true,
    createdBy: 'admin1',
  },
  {
    id: '3',
    title: 'Basketball: University vs. State College',
    description: 'Come support our team in this exciting rivalry game! Student ID required for free admission.',
    startTime: getDateWithOffset(2, 18),
    endTime: getDateWithOffset(2, 20),
    location: 'University Arena',
    type: 'Sports',
    organizer: 'Athletics Department',
    attendees: 350,
  },
  {
    id: '4',
    title: 'Career Networking Event',
    description: 'Meet recruiters from top companies in tech, finance, and healthcare. Bring your resume!',
    startTime: getDateWithOffset(3, 13),
    endTime: getDateWithOffset(3, 16),
    location: 'Business School Atrium',
    type: 'Academic',
    organizer: 'Career Services',
    attendees: 200,
  },
  {
    id: '5',
    title: 'Student Government Meeting',
    description: 'Open meeting discussing upcoming campus policies and student initiatives.',
    startTime: getDateWithOffset(4, 16),
    endTime: getDateWithOffset(4, 17, 30),
    location: 'Student Union, Room 302',
    type: 'Club',
    organizer: 'Student Government Association',
    attendees: 30,
  },
  {
    id: '6',
    title: 'Photography Club Exhibition',
    description: 'Annual showcase of student photography work with theme "Urban Perspectives".',
    startTime: getDateWithOffset(0, -2),
    endTime: getDateWithOffset(0, 2),
    location: 'Arts Building Gallery',
    type: 'Club',
    organizer: 'Photography Club',
    attendees: 75,
  },
  {
    id: '7',
    title: 'Finals Week Study Session',
    description: 'Group study session with tutors available for math, physics, and chemistry.',
    startTime: getDateWithOffset(7, 9),
    endTime: getDateWithOffset(7, 15),
    location: 'Library Learning Commons',
    type: 'Academic',
    organizer: 'Academic Success Center',
    attendees: 85,
    attachments: [
      {
        id: 'evt1',
        name: 'Study_Materials_Physics.pdf',
        type: 'document',
        url: 'https://example.com/physics-study.pdf',
        size: 3145728,
        uploadedAt: getDateWithOffset(6, 15),
        uploadedBy: 'tutor1',
      },
      {
        id: 'evt2',
        name: 'Math_Formula_Sheet.pdf',
        type: 'document',
        url: 'https://example.com/math-formulas.pdf',
        size: 1572864,
        uploadedAt: getDateWithOffset(6, 15),
        uploadedBy: 'tutor2',
      }
    ]
  },
  {
    id: '8',
    title: 'Final Exam - Computer Science 101',
    description: 'Comprehensive final examination covering all course materials from the semester.',
    startTime: getDateWithOffset(14, 9),
    endTime: getDateWithOffset(14, 12),
    location: 'Engineering Building, Room 101',
    type: 'Academic',
    organizer: 'Computer Science Department',
    attendees: 150,
    attachments: [
      {
        id: 'exam1',
        name: 'CS101_Final_Exam_Study_Guide.pdf',
        type: 'document',
        url: 'https://example.com/cs101-study-guide.pdf',
        size: 2097152,
        uploadedAt: getDateWithOffset(10, 14),
        uploadedBy: 'prof_smith',
      },
      {
        id: 'exam2',
        name: 'Sample_Questions.pdf',
        type: 'document',
        url: 'https://example.com/sample-questions.pdf',
        size: 1048576,
        uploadedAt: getDateWithOffset(10, 14),
        uploadedBy: 'prof_smith',
      }
    ]
  }
];

export const getEvents = async (): Promise<Event[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockEvents;
};

export const createEvent = async (event: Omit<Event, 'id'>): Promise<Event> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newEvent: Event = {
    ...event,
    id: Math.random().toString(36).substring(2, 9),
  };
  
  mockEvents.push(newEvent);
  
  return newEvent;
};

export const updateEvent = async (id: string, updates: Partial<Event>): Promise<Event> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const index = mockEvents.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error('Event not found');
  }
  
  const updatedEvent = {
    ...mockEvents[index],
    ...updates,
  };
  
  mockEvents[index] = updatedEvent;
  
  return updatedEvent;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockEvents.findIndex(e => e.id === id);
  if (index !== -1) {
    mockEvents.splice(index, 1);
  }
};