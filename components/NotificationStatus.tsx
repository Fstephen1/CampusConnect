import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bell, BellOff, Smartphone } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useNotifications } from '@/context/NotificationContext';

export default function NotificationStatus() {
  const { isNotificationEnabled, pushToken } = useNotifications();

  if (!isNotificationEnabled) {
    return (
      <View style={styles.statusContainer}>
        <BellOff size={16} color={COLORS.textLight} />
        <Text style={styles.statusText}>Push notifications disabled</Text>
      </View>
    );
  }

  return (
    <View style={styles.statusContainer}>
      <Smartphone size={16} color={COLORS.success} />
      <Text style={[styles.statusText, { color: COLORS.success }]}>
        Push notifications enabled
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.textLight,
    marginLeft: 6,
  },
});
