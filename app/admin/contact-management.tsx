import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Save, Phone, Mail, Clock, MapPin, RefreshCw } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { supportService, ContactInfo } from '@/services/supportService';

export default function ContactManagementScreen() {
  const { user } = useAuth();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    phone: '',
    hours: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check if user is admin (you can implement proper admin check)
    if (user?.email !== 'stephenmboudjika@gmail.com') {
      Alert.alert(
        'Access Denied',
        'Only administrators can access this page.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    loadContactInfo();
  }, [user]);

  const loadContactInfo = async () => {
    try {
      setLoading(true);
      const info = await supportService.getContactInfo();
      setContactInfo(info);
    } catch (error) {
      console.error('Error loading contact info:', error);
      Alert.alert('Error', 'Failed to load contact information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!contactInfo.email.trim() || !contactInfo.phone.trim()) {
      Alert.alert('Validation Error', 'Email and phone are required fields.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    try {
      setSaving(true);
      await supportService.updateContactInfo(contactInfo);
      Alert.alert(
        'Success',
        'Contact information updated successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving contact info:', error);
      Alert.alert('Error', 'Failed to save contact information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset to Defaults',
      'This will reset all contact information to default values. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setContactInfo({
              email: 'stephenmboudjika@gmail.com',
              phone: '+(237)658144905',
              hours: 'Monday - Friday: 9:00 AM - 6:00 PM',
              address: 'CampusConnect',
            });
          }
        }
      ]
    );
  };

  const handleGoBack = () => {
    router.back();
  };

  const renderFormField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    icon: React.ReactNode,
    placeholder: string,
    multiline?: boolean
  ) => (
    <View style={styles.formGroup}>
      <View style={styles.labelContainer}>
        {icon}
        <Text style={styles.formLabel}>{label}</Text>
      </View>
      <TextInput
        style={[styles.formInput, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMedium}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading contact information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Management</Text>
        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <RefreshCw size={20} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Admin Contact Management</Text>
          <Text style={styles.infoDescription}>
            Update the contact information that users see in the Support Center. 
            This information will be displayed across all support screens.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {renderFormField(
            'Support Email',
            contactInfo.email,
            (text) => setContactInfo({ ...contactInfo, email: text }),
            <Mail size={16} color={COLORS.primary} />,
            'Enter support email address'
          )}

          {renderFormField(
            'Support Phone',
            contactInfo.phone,
            (text) => setContactInfo({ ...contactInfo, phone: text }),
            <Phone size={16} color={COLORS.primary} />,
            'Enter support phone number'
          )}

          {renderFormField(
            'Support Hours',
            contactInfo.hours,
            (text) => setContactInfo({ ...contactInfo, hours: text }),
            <Clock size={16} color={COLORS.secondary} />,
            'Enter support hours (e.g., Monday - Friday: 9:00 AM - 6:00 PM)'
          )}

          {renderFormField(
            'Address',
            contactInfo.address,
            (text) => setContactInfo({ ...contactInfo, address: text }),
            <MapPin size={16} color={COLORS.secondary} />,
            'Enter support address or organization name',
            true
          )}
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Preview</Text>
          <Text style={styles.previewDescription}>
            This is how the contact information will appear to users:
          </Text>
          
          <View style={styles.previewItem}>
            <Mail size={16} color={COLORS.primary} />
            <Text style={styles.previewText}>{contactInfo.email || 'No email set'}</Text>
          </View>
          
          <View style={styles.previewItem}>
            <Phone size={16} color={COLORS.primary} />
            <Text style={styles.previewText}>{contactInfo.phone || 'No phone set'}</Text>
          </View>
          
          <View style={styles.previewItem}>
            <Clock size={16} color={COLORS.secondary} />
            <Text style={styles.previewText}>{contactInfo.hours || 'No hours set'}</Text>
          </View>
          
          <View style={styles.previewItem}>
            <MapPin size={16} color={COLORS.secondary} />
            <Text style={styles.previewText}>{contactInfo.address || 'No address set'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Save size={16} color="white" />
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Contact Information'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Changes will be immediately visible to all users in the Support Center.
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  resetButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formGroup: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.textDark,
    marginLeft: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.textDark,
    backgroundColor: COLORS.background,
  },
  multilineInput: {
    height: 80,
  },
  previewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    marginBottom: 16,
    lineHeight: 20,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textDark,
    marginLeft: 12,
    flex: 1,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
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
