import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, UserCheck, UserX, Clock, Shield, GraduationCap, Crown } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { firebaseAuth } from '@/services/firebase';
import { UserAccount } from '@/types/user';

export default function PendingApprovalsScreen() {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check if user is head admin
    if (!user?.isHeadAdmin) {
      Alert.alert(
        'Access Denied',
        'Only the head administrator can access this page.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    loadPendingApprovals();
  }, [user]);

  const loadPendingApprovals = async () => {
    try {
      setLoading(true);
      const pending = await firebaseAuth.getPendingApprovals();
      setPendingUsers(pending);
    } catch (error) {
      console.error('Error loading pending approvals:', error);
      Alert.alert('Error', 'Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPendingApprovals();
    setRefreshing(false);
  };

  const handleApprove = async (email: string, name: string) => {
    Alert.alert(
      'Approve Account',
      `Are you sure you want to approve ${name}'s account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              await firebaseAuth.approveUser(email);
              Alert.alert('Success', `${name}'s account has been approved!`);
              loadPendingApprovals(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', 'Failed to approve user. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleReject = async (email: string, name: string) => {
    Alert.alert(
      'Reject Account',
      `Are you sure you want to reject ${name}'s account? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await firebaseAuth.rejectUser(email);
              Alert.alert('Account Rejected', `${name}'s account has been rejected.`);
              loadPendingApprovals(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', 'Failed to reject user. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleGoBack = () => {
    router.back();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'teacher':
        return <GraduationCap size={20} color={COLORS.primary} />;
      case 'admin':
        return <Shield size={20} color={COLORS.error} />;
      default:
        return <UserCheck size={20} color={COLORS.textMedium} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'teacher':
        return COLORS.primary;
      case 'admin':
        return COLORS.error;
      default:
        return COLORS.textMedium;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderPendingUser = (userAccount: UserAccount) => (
    <View key={userAccount.email} style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.roleContainer}>
            {getRoleIcon(userAccount.role)}
            <Text style={[styles.roleText, { color: getRoleColor(userAccount.role) }]}>
              {userAccount.role.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{userAccount.displayName}</Text>
          <Text style={styles.userEmail}>{userAccount.email}</Text>
          <View style={styles.timeContainer}>
            <Clock size={14} color={COLORS.textMedium} />
            <Text style={styles.timeText}>Registered {formatDate(userAccount.createdAt)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => handleApprove(userAccount.email, userAccount.displayName)}
        >
          <UserCheck size={16} color="white" />
          <Text style={styles.approveButtonText}>Approve</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleReject(userAccount.email, userAccount.displayName)}
        >
          <UserX size={16} color="white" />
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user?.isHeadAdmin) {
    return null; // Don't render anything if not head admin
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Approvals</Text>
        <View style={styles.adminBadge}>
          <Crown size={16} color={COLORS.warning} />
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Account Approval Queue</Text>
          <Text style={styles.statsText}>
            {pendingUsers.length} account{pendingUsers.length !== 1 ? 's' : ''} waiting for approval
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading pending approvals...</Text>
          </View>
        ) : pendingUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <UserCheck size={48} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>No Pending Approvals</Text>
            <Text style={styles.emptyText}>
              All teacher and admin registrations have been processed.
            </Text>
          </View>
        ) : (
          <>
            {pendingUsers.map(renderPendingUser)}
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            As head administrator, you can approve or reject teacher and admin account requests.
          </Text>
          <Text style={styles.footerNote}>
            Student accounts are automatically approved.
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
  adminBadge: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 20,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  userHeader: {
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  approveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 6,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  rejectButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 6,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
  footerNote: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
