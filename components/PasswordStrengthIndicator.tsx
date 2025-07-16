import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/Colors';

interface PasswordStrengthIndicatorProps {
  password: string;
}

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  
  const calculateStrength = (password: string): { strength: PasswordStrength; score: number } => {
    if (password.length === 0) {
      return { strength: 'weak', score: 0 };
    }

    let score = 0;
    
    // Length check
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety
    if (/[a-z]/.test(password)) score += 1; // lowercase
    if (/[A-Z]/.test(password)) score += 1; // uppercase
    if (/[0-9]/.test(password)) score += 1; // numbers
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // special characters
    
    // Common patterns (reduce score)
    if (/^[0-9]+$/.test(password)) score -= 1; // only numbers
    if (/^[a-zA-Z]+$/.test(password)) score -= 1; // only letters
    if (/(.)\1{2,}/.test(password)) score -= 1; // repeated characters
    
    // Determine strength
    if (score <= 2) return { strength: 'weak', score };
    if (score <= 4) return { strength: 'fair', score };
    if (score <= 6) return { strength: 'good', score };
    return { strength: 'strong', score };
  };

  const getStrengthColor = (strength: PasswordStrength): string => {
    switch (strength) {
      case 'weak': return COLORS.error;
      case 'fair': return COLORS.warning;
      case 'good': return COLORS.secondary;
      case 'strong': return COLORS.success;
    }
  };

  const getStrengthText = (strength: PasswordStrength): string => {
    switch (strength) {
      case 'weak': return 'Weak';
      case 'fair': return 'Fair';
      case 'good': return 'Good';
      case 'strong': return 'Strong';
    }
  };

  const getStrengthProgress = (strength: PasswordStrength): number => {
    switch (strength) {
      case 'weak': return 0.25;
      case 'fair': return 0.5;
      case 'good': return 0.75;
      case 'strong': return 1;
    }
  };

  const { strength, score } = calculateStrength(password);
  const strengthColor = getStrengthColor(strength);
  const strengthText = getStrengthText(strength);
  const progress = getStrengthProgress(strength);

  if (password.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Password Strength:</Text>
        <Text style={[styles.strengthText, { color: strengthColor }]}>
          {strengthText}
        </Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progress * 100}%`, 
                backgroundColor: strengthColor 
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.tips}>
        {password.length < 8 && (
          <Text style={styles.tipText}>💡 Use at least 8 characters for better security</Text>
        )}
        {!/[A-Z]/.test(password) && password.length > 0 && (
          <Text style={styles.tipText}>💡 Add uppercase letters (A-Z)</Text>
        )}
        {!/[0-9]/.test(password) && password.length > 0 && (
          <Text style={styles.tipText}>💡 Add numbers (0-9)</Text>
        )}
        {!/[^A-Za-z0-9]/.test(password) && password.length > 0 && (
          <Text style={styles.tipText}>💡 Add special characters (!@#$%)</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.textMedium,
  },
  strengthText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBackground: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  tips: {
    gap: 2,
  },
  tipText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: COLORS.textLight,
  },
});
