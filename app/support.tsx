import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { 
  ArrowLeft, HelpCircle, MessageSquare, Phone, Mail, 
  FileText, Bug, Lightbulb, Star, ExternalLink,
  Clock, CheckCircle, AlertCircle
} from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { supportService, SupportTicket } from '@/services/supportService';

export default function SupportScreen() {
  const { user } = useAuth();
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    try {
      const tickets = await supportService.getSupportTickets();
      setSupportTickets(tickets.filter(ticket => ticket.userEmail === user?.email));
    } catch (error) {
      console.error('Error loading support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleFAQ = () => {
    router.push('/support/faq');
  };

  const handleContactSupport = () => {
    router.push('/support/contact');
  };

  const handleReportBug = () => {
    router.push('/support/report-bug');
  };

  const handleFeatureRequest = () => {
    router.push('/support/feature-request');
  };

  const handleMyTickets = () => {
    router.push('/support/my-tickets');
  };

  const handleFeedback = () => {
    router.push('/support/feedback');
  };

  const handleCallSupport = async () => {
    try {
      const contactInfo = await supportService.getContactInfo();
      const phoneUrl = `tel:${contactInfo.phone}`;

      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Phone Not Available', 'Unable to open phone app on this device.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to load contact information.');
    }
  };

  const handleEmailSupport = async () => {
    try {
      const contactInfo = await supportService.getContactInfo();
      const emailUrl = `mailto:${contactInfo.email}?subject=CampusConnect Support Request`;

      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        Linking.openURL(emailUrl);
      } else {
        Alert.alert('Email Not Available', 'Unable to open email app on this device.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to load contact information.');
    }
  };

  const renderSectionHeader = (title: string, icon: React.ReactNode) => (
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderSupportItem = (
    title: string,
    description: string,
    onPress: () => void,
    icon: React.ReactNode,
    badge?: string
  ) => (
    <TouchableOpacity style={styles.supportItem} onPress={onPress}>
      <View style={styles.supportLeft}>
        <View style={styles.supportIcon}>{icon}</View>
        <View style={styles.supportText}>
          <Text style={styles.supportTitle}>{title}</Text>
          <Text style={styles.supportDescription}>{description}</Text>
        </View>
      </View>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.quickActionsTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.quickActionButton} onPress={handleCallSupport}>
          <Phone size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton} onPress={handleEmailSupport}>
          <Mail size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Email</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton} onPress={handleFAQ}>
          <HelpCircle size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>FAQ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton} onPress={handleReportBug}>
          <Bug size={24} color={COLORS.error} />
          <Text style={styles.quickActionText}>Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getTicketStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock size={16} color={COLORS.warning} />;
      case 'in-progress':
        return <AlertCircle size={16} color={COLORS.secondary} />;
      case 'resolved':
        return <CheckCircle size={16} color={COLORS.success} />;
      default:
        return <Clock size={16} color={COLORS.textLight} />;
    }
  };

  const openTicketCount = supportTickets.filter(ticket => 
    ticket.status === 'open' || ticket.status === 'in-progress'
  ).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Center</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderQuickActions()}

        {/* Help & Resources */}
        {renderSectionHeader('Help & Resources', <HelpCircle size={20} color={COLORS.primary} />)}
        
        {renderSupportItem(
          'Help & FAQ',
          'Find answers to frequently asked questions',
          handleFAQ,
          <HelpCircle size={16} color={COLORS.primary} />
        )}

        {renderSupportItem(
          'Contact Support',
          'Get in touch with our support team',
          handleContactSupport,
          <MessageSquare size={16} color={COLORS.primary} />
        )}

        {/* Support Requests */}
        {renderSectionHeader('Support Requests', <FileText size={20} color={COLORS.secondary} />)}
        
        {renderSupportItem(
          'My Support Tickets',
          'View and manage your support requests',
          handleMyTickets,
          <FileText size={16} color={COLORS.secondary} />,
          openTicketCount > 0 ? openTicketCount.toString() : undefined
        )}

        {renderSupportItem(
          'Report a Bug',
          'Report technical issues or bugs',
          handleReportBug,
          <Bug size={16} color={COLORS.error} />
        )}

        {renderSupportItem(
          'Feature Request',
          'Suggest new features or improvements',
          handleFeatureRequest,
          <Lightbulb size={16} color={COLORS.warning} />
        )}

        {/* Feedback */}
        {renderSectionHeader('Feedback', <Star size={20} color={COLORS.warning} />)}
        
        {renderSupportItem(
          'Send Feedback',
          'Share your thoughts and suggestions',
          handleFeedback,
          <Star size={16} color={COLORS.warning} />
        )}

        {/* Recent Tickets Preview */}
        {supportTickets.length > 0 && (
          <>
            {renderSectionHeader('Recent Tickets', <Clock size={20} color={COLORS.textMedium} />)}
            {supportTickets.slice(0, 3).map((ticket) => (
              <View key={ticket.id} style={styles.ticketPreview}>
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketSubject} numberOfLines={1}>
                    {ticket.subject}
                  </Text>
                  <View style={styles.ticketStatus}>
                    {getTicketStatusIcon(ticket.status)}
                    <Text style={styles.ticketStatusText}>
                      {ticket.status.replace('-', ' ')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.ticketDate}>
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
            
            {supportTickets.length > 3 && (
              <TouchableOpacity style={styles.viewAllButton} onPress={handleMyTickets}>
                <Text style={styles.viewAllText}>View All Tickets</Text>
                <ExternalLink size={14} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need immediate assistance? Call our support line
          </Text>
          <TouchableOpacity onPress={handleCallSupport}>
            <Text style={styles.phoneNumber}>
              +(237)658144905
            </Text>
          </TouchableOpacity>
          <Text style={styles.hoursText}>
            Monday - Friday: 9:00 AM - 6:00 PM
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.textDark,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickActionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    minWidth: 70,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.textDark,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: COLORS.textDark,
    marginLeft: 10,
  },
  supportItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  supportIcon: {
    marginRight: 12,
  },
  supportText: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
  },
  badge: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  ticketPreview: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketSubject: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.textDark,
    flex: 1,
    marginRight: 8,
  },
  ticketStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.textMedium,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  ticketDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.textLight,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary,
    marginRight: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  hoursText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
