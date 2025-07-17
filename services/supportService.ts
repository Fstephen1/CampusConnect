import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'account' | 'notifications' | 'technical' | 'privacy';
  helpful: number;
  notHelpful: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: 'bug' | 'feature' | 'account' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  responses: SupportResponse[];
}

export interface SupportResponse {
  id: string;
  message: string;
  isFromSupport: boolean;
  timestamp: string;
  attachments?: string[];
}

export interface ContactInfo {
  email: string;
  phone: string;
  hours: string;
  address: string;
}

class SupportService {
  private readonly STORAGE_KEYS = {
    FAQ_FEEDBACK: 'support_faq_feedback',
    SUPPORT_TICKETS: 'support_tickets',
    USER_FEEDBACK: 'user_feedback',
  };

  // FAQ Data
  private faqData: FAQItem[] = [
    {
      id: '1',
      question: 'How do I reset my password?',
      answer: 'Go to Profile → Privacy & Security → Change Password. You\'ll need to enter your current password and create a new one (minimum 6 characters).',
      category: 'account',
      helpful: 45,
      notHelpful: 3,
    },
    {
      id: '2',
      question: 'How do I turn off notifications?',
      answer: 'Go to Profile → Settings → Notifications. You can customize which types of notifications you receive or turn them off completely.',
      category: 'notifications',
      helpful: 32,
      notHelpful: 1,
    },
    {
      id: '3',
      question: 'How do I update my profile information?',
      answer: 'Tap on your profile picture or name in the Profile tab, then tap "Edit Profile" to update your information.',
      category: 'account',
      helpful: 28,
      notHelpful: 2,
    },
    {
      id: '4',
      question: 'What should I do if the app crashes?',
      answer: 'Try closing and reopening the app. If the problem persists, restart your device. You can also report the issue through the "Report a Bug" option.',
      category: 'technical',
      helpful: 19,
      notHelpful: 5,
    },
    {
      id: '5',
      question: 'How do I delete my account?',
      answer: 'Go to Profile → Privacy & Security → Delete Account. This action cannot be undone and will permanently remove all your data.',
      category: 'privacy',
      helpful: 15,
      notHelpful: 8,
    },
    {
      id: '6',
      question: 'Can I use CampusConnect on multiple devices?',
      answer: 'Yes! You can log in to your account on multiple devices. Your data will sync across all devices.',
      category: 'general',
      helpful: 41,
      notHelpful: 2,
    },
    {
      id: '7',
      question: 'How do I report inappropriate content?',
      answer: 'Tap and hold on any announcement or content, then select "Report" from the menu. Our team will review it promptly.',
      category: 'general',
      helpful: 23,
      notHelpful: 1,
    },
    {
      id: '8',
      question: 'Why am I not receiving notifications?',
      answer: 'Check your notification settings in Profile → Settings → Notifications. Also ensure notifications are enabled in your device settings for CampusConnect.',
      category: 'technical',
      helpful: 37,
      notHelpful: 4,
    },
  ];

  // Get FAQ items by category
  async getFAQByCategory(category?: string): Promise<FAQItem[]> {
    if (category) {
      return this.faqData.filter(item => item.category === category);
    }
    return this.faqData;
  }

  // Search FAQ
  async searchFAQ(query: string): Promise<FAQItem[]> {
    const lowercaseQuery = query.toLowerCase();
    return this.faqData.filter(item => 
      item.question.toLowerCase().includes(lowercaseQuery) ||
      item.answer.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Submit FAQ feedback
  async submitFAQFeedback(faqId: string, helpful: boolean): Promise<void> {
    try {
      const feedback = await AsyncStorage.getItem(this.STORAGE_KEYS.FAQ_FEEDBACK);
      const feedbackData = feedback ? JSON.parse(feedback) : {};
      
      feedbackData[faqId] = helpful;
      await AsyncStorage.setItem(this.STORAGE_KEYS.FAQ_FEEDBACK, JSON.stringify(feedbackData));
      
      // Update local FAQ data
      const faqItem = this.faqData.find(item => item.id === faqId);
      if (faqItem) {
        if (helpful) {
          faqItem.helpful++;
        } else {
          faqItem.notHelpful++;
        }
      }
    } catch (error) {
      console.error('Error submitting FAQ feedback:', error);
    }
  }

  // Create support ticket
  async createSupportTicket(
    subject: string,
    description: string,
    category: SupportTicket['category'],
    priority: SupportTicket['priority'],
    userEmail: string
  ): Promise<string> {
    try {
      const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const ticket: SupportTicket = {
        id: ticketId,
        subject,
        description,
        category,
        priority,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userEmail,
        responses: [],
      };

      const tickets = await this.getSupportTickets();
      tickets.push(ticket);
      await AsyncStorage.setItem(this.STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(tickets));

      return ticketId;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw new Error('Failed to create support ticket');
    }
  }

  // Get user's support tickets
  async getSupportTickets(): Promise<SupportTicket[]> {
    try {
      const tickets = await AsyncStorage.getItem(this.STORAGE_KEYS.SUPPORT_TICKETS);
      return tickets ? JSON.parse(tickets) : [];
    } catch (error) {
      console.error('Error getting support tickets:', error);
      return [];
    }
  }

  // Get contact information (now loads from storage with defaults)
  async getContactInfo(): Promise<ContactInfo> {
    try {
      const stored = await AsyncStorage.getItem('support_contact_info');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading contact info:', error);
    }

    // Default contact information
    return {
      email: 'stephenmboudjika@gmail.com',
      phone: '+(237)658144905',
      hours: 'Monday - Friday: 9:00 AM - 6:00 PM',
      address: 'CampusConnect',
    };
  }

  // Update contact information (admin only)
  async updateContactInfo(contactInfo: ContactInfo): Promise<void> {
    try {
      await AsyncStorage.setItem('support_contact_info', JSON.stringify(contactInfo));
    } catch (error) {
      console.error('Error updating contact info:', error);
      throw new Error('Failed to update contact information');
    }
  }

  // Submit general feedback
  async submitFeedback(
    type: 'bug' | 'feature' | 'general',
    message: string,
    userEmail: string,
    rating?: number
  ): Promise<void> {
    try {
      const feedback = {
        id: `feedback_${Date.now()}`,
        type,
        message,
        userEmail,
        rating,
        timestamp: new Date().toISOString(),
      };

      const existingFeedback = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_FEEDBACK);
      const feedbackList = existingFeedback ? JSON.parse(existingFeedback) : [];
      feedbackList.push(feedback);
      
      await AsyncStorage.setItem(this.STORAGE_KEYS.USER_FEEDBACK, JSON.stringify(feedbackList));
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw new Error('Failed to submit feedback');
    }
  }

  // Get app version and system info
  getSystemInfo(): { appVersion: string; platform: string; buildNumber: string } {
    return {
      appVersion: '1.0.0',
      platform: 'React Native',
      buildNumber: '2024.01.15',
    };
  }

  // Clear all support data (for testing)
  async clearSupportData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.FAQ_FEEDBACK,
        this.STORAGE_KEYS.SUPPORT_TICKETS,
        this.STORAGE_KEYS.USER_FEEDBACK,
      ]);
    } catch (error) {
      console.error('Error clearing support data:', error);
    }
  }
}

export const supportService = new SupportService();
