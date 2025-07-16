import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';

interface PasswordRequirement {
  text: string;
  met: boolean;
}

interface PasswordRequirementsProps {
  password: string;
  confirmPassword?: string;
  showConfirmation?: boolean;
}

export default function PasswordRequirements({ 
  password, 
  confirmPassword = '', 
  showConfirmation = false 
}: PasswordRequirementsProps) {
  
  const getRequirements = (): PasswordRequirement[] => {
    const requirements: PasswordRequirement[] = [
      {
        text: 'At least 6 characters',
        met: password.length >= 6
      },
      {
        text: 'Contains at least one letter',
        met: /[a-zA-Z]/.test(password)
      },
      {
        text: 'Not empty or just spaces',
        met: password.trim().length > 0
      }
    ];

    if (showConfirmation && confirmPassword.length > 0) {
      requirements.push({
        text: 'Passwords match',
        met: password === confirmPassword && password.length > 0
      });
    }

    return requirements;
  };

  const requirements = getRequirements();
  const allMet = requirements.every(req => req.met);

  const renderRequirement = (requirement: PasswordRequirement, index: number) => (
    <View key={index} style={styles.requirementItem}>
      <View style={[
        styles.requirementIcon,
        requirement.met ? styles.requirementIconMet : styles.requirementIconUnmet
      ]}>
        {requirement.met ? (
          <Check size={12} color="white" />
        ) : (
          <X size={12} color="white" />
        )}
      </View>
      <Text style={[
        styles.requirementText,
        requirement.met ? styles.requirementTextMet : styles.requirementTextUnmet
      ]}>
        {requirement.text}
      </Text>
    </View>
  );

  // Don't show anything if password is empty
  if (password.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.hintText}>
          💡 Password must be at least 6 characters long
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Password Requirements</Text>
        {allMet && (
          <View style={styles.allMetBadge}>
            <Check size={14} color="white" />
            <Text style={styles.allMetText}>All Good!</Text>
          </View>
        )}
      </View>
      
      <View style={styles.requirementsList}>
        {requirements.map(renderRequirement)}
      </View>

      {password.length > 0 && password.length < 6 && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ Password is too short ({password.length}/6 characters)
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hintText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.textDark,
  },
  allMetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  allMetText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 4,
  },
  requirementsList: {
    gap: 6,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  requirementIconMet: {
    backgroundColor: COLORS.success,
  },
  requirementIconUnmet: {
    backgroundColor: COLORS.textLight,
  },
  requirementText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  requirementTextMet: {
    color: COLORS.success,
    textDecorationLine: 'line-through',
  },
  requirementTextUnmet: {
    color: COLORS.textMedium,
  },
  warningContainer: {
    backgroundColor: COLORS.warning + '20',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: COLORS.warning,
    textAlign: 'center',
  },
});
