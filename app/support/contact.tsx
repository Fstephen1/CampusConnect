import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Phone, Mail, Clock, MapPin, Send } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { supportService } from '@/services/supportService';

export default function ContactSupportScreen() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);

  const contactInfo = supportService.getContactInfo();

  const handleGoBack = () => {
    router.back();
  };

  const handleCall = async () => {
    const phoneUrl = `tel:${contactInfo.phone}`;
    const canOpen = await Linking.canOpenURL(phoneUrl);
    if (canOpen) {
      Linking.openURL(phoneUrl);
    } else {
      Alert.alert('Phone Not Available', 'Unable to open phone app on this device.');
    }
  };

  const handleEmail = async () => {
    const emailUrl = `mailto:${contactInfo.email}?subject=${encodeURIComponent(subject || 'CampusConnect Support Request')}&body=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(emailUrl);
    if (canOpen) {
      Linking.openURL(emailUrl);
    } else {
      Alert.alert('Email Not Available', 'Unable to open email app on this device.');
    }
  };

  const handleSendMessage = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Missing Information', 'Please fill in both subject and message fields.');
      return;
    }

    try {
      setLoading(true);
      const ticketId = await supportService.createSupportTicket(
        subject,
        message,
        'other',
        'medium',
        user?.email || 'unknown@example.com'
      );

      Alert.alert(
        'Message Sent!',
        `Your support request has been submitted. Ticket ID: ${ticketId}\n\nWe'll get back to you within 24 hours.`,
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );

      setSubject('');
      setMessage('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  const showContactInfo = (label: string, value: string) => {
    Alert.alert(label, value, [
      { text: 'OK' }
    ]);
  };

  const renderContactMethod = (
    icon: React.ReactNode,
    title: string,
    value: string,
    onPress: () => void,
    onInfo?: () => void
  ) => (
    <View style={styles.contactMethod}>
      <View style={styles.contactMethodHeader}>
        <View style={styles.contactMethodIcon}>{icon}</View>
        <View style={styles.contactMethodInfo}>
          <Text style={styles.contactMethodTitle}>{title}</Text>
          <Text style={styles.contactMethodValue}>{value}</Text>
        </View>
      </View>
      <View style={styles.contactMethodActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
          <Text style={styles.actionButtonText}>Contact</Text>
        </TouchableOpacity>
        {onInfo && (
          <TouchableOpacity style={styles.infoButton} onPress={onInfo}>
            <Text style={styles.infoButtonText}>Info</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          
          {renderContactMethod(
            <Phone size={20} color={COLORS.primary} />,
            'Phone Support',
            contactInfo.phone,
            handleCall,
            () => showContactInfo('Phone Number', contactInfo.phone)
          )}

          {renderContactMethod(
            <Mail size={20} color={COLORS.primary} />,
            'Email Support',
            contactInfo.email,
            handleEmail,
            () => showContactInfo('Email Address', contactInfo.email)
          )}

          <View style={styles.contactMethod}>
            <View style={styles.contactMethodHeader}>
              <View style={styles.contactMethodIcon}>
                <Clock size={20} color={COLORS.secondary} />
              </View>
              <View style={styles.contactMethodInfo}>
                <Text style={styles.contactMethodTitle}>Support Hours</Text>
                <Text style={styles.contactMethodValue}>{contactInfo.hours}</Text>
              </View>
            </View>
          </View>

          <View style={styles.contactMethod}>
            <View style={styles.contactMethodHeader}>
              <View style={styles.contactMethodIcon}>
                <MapPin size={20} color={COLORS.secondary} />
              </View>
              <View style={styles.contactMethodInfo}>
                <Text style={styles.contactMethodTitle}>Address</Text>
                <Text style={styles.contactMethodValue}>{contactInfo.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Message Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          <Text style={styles.sectionDescription}>
            Fill out the form below and we'll get back to you within 24 hours.
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Subject</Text>
            <TextInput
              style={styles.formInput}
              value={subject}
              onChangeText={setSubject}
              placeholder="Brief description of your issue"
              placeholderTextColor={COLORS.textMedium}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Message</Text>
            <TextInput
              style={[styles.formInput, styles.messageInput]}
              value={message}
              onChangeText={setMessage}
              placeholder="Please describe your issue in detail..."
              placeholderTextColor={COLORS.textMedium}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={loading}
          >
            <Send size={16} color="white" />
            <Text style={styles.sendButtonText}>
              {loading ? 'Sending...' : 'Send Message'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Response Time Info */}
        <View style={styles.responseInfo}>
          <Text style={styles.responseTitle}>Response Times</Text>
          <View style={styles.responseItem}>
            <Text style={styles.responseType}>• General Inquiries:</Text>
            <Text style={styles.responseTime}>Within 24 hours</Text>
          </View>
          <View style={styles.responseItem}>
            <Text style={styles.responseType}>• Technical Issues:</Text>
            <Text style={styles.responseTime}>Within 12 hours</Text>
          </View>
          <View style={styles.responseItem}>
            <Text style={styles.responseType}>• Urgent Issues:</Text>
            <Text style={styles.responseTime}>Within 4 hours</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For immediate assistance with urgent issues, please call our support line.
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
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    marginBottom: 16,
    lineHeight: 20,
  },
  contactMethod: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactMethodIcon: {
    marginRight: 12,
  },
  contactMethodInfo: {
    flex: 1,
  },
  contactMethodTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  contactMethodValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    lineHeight: 18,
  },
  contactMethodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  infoButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.textMedium,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.textDark,
    backgroundColor: 'white',
  },
  messageInput: {
    height: 120,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
  responseInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  responseTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  responseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  responseType: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textDark,
    flex: 1,
  },
  responseTime: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 16,
  },
});
