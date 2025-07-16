import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Bell, Pin, Plus, X, CreditCard as Edit, Trash2, Users, Clock } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { getAnnouncements, createAnnouncement, deleteAnnouncement, updateAnnouncement, toggleAnnouncementPin } from '@/services/announcementService';
import { Announcement } from '@/types/announcements';
import { FileAttachment } from '@/types/files';
import { formatDistanceToNow } from 'date-fns';
import FileUploader from '@/components/FileUploader';
import AttachmentViewer from '@/components/AttachmentViewer';
import { notificationRoleService } from '@/services/notificationRoleService';
import { NotificationRole } from '@/types/notificationRoles';
import { notificationService } from '@/services/notificationService';
import { NotificationSummary } from '@/types/notifications';
import NotificationModal from '@/components/NotificationModal';

export default function HomeScreen() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'Academic',
    startTime: '',
    endTime: '',
  });
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [availableRoles, setAvailableRoles] = useState<NotificationRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['general']);
  const [isPublic, setIsPublic] = useState(true);

  // Notification states
  const [notificationSummary, setNotificationSummary] = useState<NotificationSummary | null>(null);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError('Failed to load announcements. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadNotificationRoles = async () => {
    try {
      const roles = await notificationRoleService.getAllRoles();
      setAvailableRoles(roles);
    } catch (err) {
      console.error('Failed to load notification roles:', err);
    }
  };

  const loadNotificationSummary = async () => {
    if (!user) return;

    try {
      const summary = await notificationService.getNotificationSummary(user.uid);
      setNotificationSummary(summary);
    } catch (err) {
      console.error('Failed to load notification summary:', err);
    }
  };

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    loadAnnouncements();
    loadNotificationSummary();
    if (user.role === 'teacher' || user.role === 'admin') {
      loadNotificationRoles();
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAnnouncements();
    loadNotificationSummary();
  };

  const handleCreateAnnouncement = async () => {
    if (!user) return;

    if (!isPublic && selectedRoles.length === 0) {
      Alert.alert('Error', 'Please select at least one notification role for targeted announcements.');
      return;
    }

    try {
      const announcement = await createAnnouncement({
        ...newAnnouncement,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoUrl: user.photoURL,
        isPinned: false,
        role: user.role as 'teacher' | 'admin',
        attachments,
        targetRoles: isPublic ? [] : selectedRoles,
        isPublic: isPublic,
      });

      setAnnouncements(prev => [announcement, ...prev]);
      setIsModalVisible(false);
      setNewAnnouncement({ title: '', content: '', category: 'Academic', startTime: '', endTime: '' });
      setAttachments([]);
      setSelectedRoles(['general']);
      setIsPublic(true);
    } catch (err) {
      console.error('Failed to create announcement:', err);
    }
  };

  const handleEditAnnouncement = async () => {
    if (!editingAnnouncement) return;

    try {
      const updated = await updateAnnouncement(editingAnnouncement.id, {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        category: newAnnouncement.category,
        attachments,
      });

      setAnnouncements(prev => 
        prev.map(a => a.id === updated.id ? updated : a)
      );
      setIsModalVisible(false);
      setEditingAnnouncement(null);
      setNewAnnouncement({ title: '', content: '', category: 'Academic', startTime: '', endTime: '' });
      setAttachments([]);
    } catch (err) {
      console.error('Failed to update announcement:', err);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    Alert.alert(
      'Delete Announcement',
      'Are you sure you want to delete this announcement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAnnouncement(id);
              setAnnouncements(prev => prev.filter(a => a.id !== id));
            } catch (err) {
              console.error('Failed to delete announcement:', err);
            }
          },
        },
      ]
    );
  };

  const handleTogglePin = async (id: string) => {
    try {
      const updated = await toggleAnnouncementPin(id);
      setAnnouncements(prev => {
        const newAnnouncements = prev.map(a => a.id === updated.id ? updated : a);
        return newAnnouncements.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
      });
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category || 'Academic',
      startTime: announcement.startTime || '',
      endTime: announcement.endTime || '',
    });
    setAttachments(announcement.attachments || []);
    setIsModalVisible(true);
  };

  const openCreateModal = () => {
    setEditingAnnouncement(null);
    setNewAnnouncement({ title: '', content: '', category: 'Academic', startTime: '', endTime: '' });
    setAttachments([]);
    setSelectedRoles(['general']);
    setIsPublic(true);
    setIsModalVisible(true);
  };

  const renderAnnouncementItem = ({ item }: { item: Announcement }) => (
    <TouchableOpacity style={styles.announcementCard}>
      {item.isPinned && (
        <View style={styles.pinnedBadge}>
          <Pin size={12} color="white" />
          <Text style={styles.pinnedText}>Pinned</Text>
        </View>
      )}
      
      <View style={styles.announcementHeader}>
        {item.authorPhotoUrl ? (
          <Image source={{ uri: item.authorPhotoUrl }} style={styles.authorPhoto} />
        ) : (
          <View style={[styles.authorPhoto, styles.authorPhotoPlaceholder]}>
            <Text style={styles.authorPhotoInitial}>{item.authorName.charAt(0)}</Text>
          </View>
        )}
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.authorName}>{item.authorName}</Text>
          <Text style={styles.timestamp}>
            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
          </Text>
        </View>

        {(user?.role === 'teacher' || user?.role === 'admin') && 
         (user?.uid === item.authorId || user?.role === 'admin') && (
          <View style={styles.actionButtons}>
            {user.role === 'admin' && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleTogglePin(item.id)}
              >
                <Pin size={16} color={item.isPinned ? COLORS.secondary : COLORS.textLight} />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => openEditModal(item)}
            >
              <Edit size={16} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteAnnouncement(item.id)}
            >
              <Trash2 size={16} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <Text style={styles.announcementTitle}>{item.title}</Text>
      <Text style={styles.announcementContent} numberOfLines={3}>{item.content}</Text>

      {(item.startTime && item.startTime.trim() !== '') || (item.endTime && item.endTime.trim() !== '') ? (
        <View style={styles.timeContainer}>
          <Clock size={14} color={COLORS.textMedium} />
          <Text style={styles.timeText}>
            {item.startTime && item.endTime && item.startTime.trim() !== '' && item.endTime.trim() !== ''
              ? `${item.startTime} - ${item.endTime}`
              : item.startTime && item.startTime.trim() !== ''
                ? `From ${item.startTime}`
                : item.endTime && item.endTime.trim() !== ''
                  ? `Until ${item.endTime}`
                  : ''
            }
          </Text>
        </View>
      ) : null}

      {item.attachments && item.attachments.length > 0 && (
        <AttachmentViewer attachments={item.attachments} />
      )}
      
      {item.category && (
        <View style={styles.categoryContainer}>
          <View style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(item.category) + '20' }
          ]}>
            <Text style={[
              styles.categoryText,
              { color: getCategoryColor(item.category) }
            ]}>
              {item.category}
            </Text>
          </View>
          {item.role && (
            <View style={[
              styles.roleBadge,
              { backgroundColor: getRoleColor(item.role) + '20' }
            ]}>
              <Text style={[
                styles.roleText,
                { color: getRoleColor(item.role) }
              ]}>
                {item.role === 'admin' ? 'Admin' : 'Teacher'}
              </Text>
            </View>
          )}
        </View>
      )}

      {!item.isPublic && item.targetRoles && item.targetRoles.length > 0 && (
        <View style={styles.targetRolesContainer}>
          <View style={styles.targetRolesHeader}>
            <Users size={12} color={COLORS.textMedium} />
            <Text style={styles.targetRolesLabel}>Targeted to:</Text>
          </View>
          <View style={styles.targetRolesList}>
            {item.targetRoles.map((roleId) => {
              const role = availableRoles.find(r => r.id === roleId);
              if (!role) return null;
              return (
                <View
                  key={roleId}
                  style={[
                    styles.targetRoleBadge,
                    { backgroundColor: role.color + '20' }
                  ]}
                >
                  <View style={[styles.targetRoleColorDot, { backgroundColor: role.color }]} />
                  <Text style={[
                    styles.targetRoleText,
                    { color: role.color }
                  ]}>
                    {role.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'academic':
        return COLORS.primary;
      case 'event':
        return COLORS.secondary;
      case 'urgent':
        return COLORS.error;
      case 'club':
        return COLORS.success;
      default:
        return COLORS.primary;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return COLORS.error;
      case 'teacher':
        return COLORS.secondary;
      default:
        return COLORS.primary;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={announcements}
        renderItem={renderAnnouncementItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.headerContainer}>
              <Text style={styles.welcomeText}>
                Hello, {user?.displayName || (user?.role === 'teacher' ? 'Teacher' : user?.role === 'admin' ? 'Admin' : 'Student')}
              </Text>
              <View style={styles.headerButtons}>
                {(user?.role === 'teacher' || user?.role === 'admin') && (
                  <TouchableOpacity 
                    style={styles.createButton}
                    onPress={openCreateModal}
                  >
                    <Plus size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.notificationButton}
                  onPress={() => setIsNotificationModalVisible(true)}
                >
                  <Bell size={24} color={COLORS.primary} />
                  {notificationSummary && notificationSummary.unread > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationCount}>
                        {notificationSummary.unread > 99 ? '99+' : notificationSummary.unread}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={loadAnnouncements}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : loading && announcements.length === 0 ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading announcements...</Text>
              </View>
            ) : (
              <Text style={styles.sectionTitle}>Latest Announcements</Text>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No announcements found</Text>
            </View>
          ) : null
        }
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setEditingAnnouncement(null);
                  setNewAnnouncement({ title: '', content: '', category: 'Academic', startTime: '', endTime: '' });
                  setAttachments([]);
                }}
                style={styles.closeButton}
              >
                <X size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalFormContent}>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.formScrollView}>
                <TextInput
              style={styles.input}
              placeholder="Title"
              value={newAnnouncement.title}
              onChangeText={(text) => setNewAnnouncement(prev => ({ ...prev, title: text }))}
            />

            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="Content"
              value={newAnnouncement.content}
              onChangeText={(text) => setNewAnnouncement(prev => ({ ...prev, content: text }))}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.timeInputsContainer}>
              <Text style={styles.timeInputsLabel}>Time (Optional)</Text>
              <View style={styles.timeInputsRow}>
                <View style={styles.timeInputWrapper}>
                  <Text style={styles.timeInputLabel}>Start Time</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="HH:MM"
                    value={newAnnouncement.startTime}
                    onChangeText={(text) => setNewAnnouncement(prev => ({ ...prev, startTime: text }))}
                  />
                </View>
                <View style={styles.timeInputWrapper}>
                  <Text style={styles.timeInputLabel}>End Time</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="HH:MM"
                    value={newAnnouncement.endTime}
                    onChangeText={(text) => setNewAnnouncement(prev => ({ ...prev, endTime: text }))}
                  />
                </View>
              </View>
            </View>

            <FileUploader
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              uploadedBy={user?.uid || ''}
            />

            <View style={styles.categorySelector}>
              <Text style={styles.categoryLabel}>Category:</Text>
              {['Academic', 'Event', 'Urgent', 'Club'].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryOption,
                    {
                      backgroundColor: newAnnouncement.category === category
                        ? getCategoryColor(category) + '20'
                        : 'transparent'
                    }
                  ]}
                  onPress={() => setNewAnnouncement(prev => ({ ...prev, category }))}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      {
                        color: getCategoryColor(category),
                        fontFamily: newAnnouncement.category === category
                          ? 'Inter-Bold'
                          : 'Inter-Regular'
                      }
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(user?.role === 'teacher' || user?.role === 'admin') && (
              <View style={styles.roleSelector}>
                <View style={styles.roleSelectorHeader}>
                  <Users size={20} color={COLORS.primary} />
                  <Text style={styles.roleSelectorTitle}>Target Audience</Text>
                </View>

                <View style={styles.publicToggle}>
                  <View style={styles.publicToggleContent}>
                    <Text style={styles.publicToggleLabel}>Public Announcement</Text>
                    <Text style={styles.publicToggleDescription}>
                      {isPublic ? 'Visible to all students' : 'Target specific roles'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggleButton, isPublic && styles.toggleButtonActive]}
                    onPress={() => setIsPublic(!isPublic)}
                  >
                    <Text style={[styles.toggleButtonText, isPublic && styles.toggleButtonTextActive]}>
                      {isPublic ? 'Yes' : 'No'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {!isPublic && (
                  <View style={styles.roleSelector}>
                    <View style={styles.roleListHeader}>
                      <Text style={styles.roleListTitle}>Select notification roles:</Text>
                      <Text style={styles.selectedCount}>
                        {selectedRoles.length} selected
                      </Text>
                    </View>
                    {availableRoles.length === 0 ? (
                      <View style={styles.emptyRolesContainer}>
                        <Text style={styles.emptyRolesText}>Loading roles...</Text>
                      </View>
                    ) : (
                      <View style={styles.roleOptionsContainer}>
                        {availableRoles.map((role) => (
                          <TouchableOpacity
                            key={role.id}
                            style={[
                              styles.roleChip,
                              selectedRoles.includes(role.id) && styles.roleChipSelected
                            ]}
                            onPress={() => {
                              const isSelected = selectedRoles.includes(role.id);
                              if (isSelected) {
                                setSelectedRoles(selectedRoles.filter(id => id !== role.id));
                              } else {
                                setSelectedRoles([...selectedRoles, role.id]);
                              }
                            }}
                          >
                            <View style={[styles.roleColorDot, { backgroundColor: role.color }]} />
                            <Text style={[
                              styles.roleChipText,
                              selectedRoles.includes(role.id) && styles.roleChipTextSelected
                            ]}>
                              {role.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[
                styles.createAnnouncementButton,
                (!newAnnouncement.title || !newAnnouncement.content) && styles.createButtonDisabled
              ]}
              onPress={editingAnnouncement ? handleEditAnnouncement : handleCreateAnnouncement}
              disabled={!newAnnouncement.title || !newAnnouncement.content}
            >
              <Text style={styles.createButtonText}>
                {editingAnnouncement ? 'Update Announcement' : 'Post Announcement'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <NotificationModal
        visible={isNotificationModalVisible}
        onClose={() => {
          setIsNotificationModalVisible(false);
          loadNotificationSummary(); // Refresh notification count when modal closes
        }}
        userId={user?.uid || 'mock-user-id'}
        onNotificationPress={(notification) => {
          // Handle notification press - could navigate to related announcement/event
          console.log('Notification pressed:', notification);
          setIsNotificationModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: COLORS.textDark,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  notificationCount: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 10,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 16,
    color: COLORS.textDark,
  },
  announcementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  pinnedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinnedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorPhotoPlaceholder: {
    backgroundColor: COLORS.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorPhotoInitial: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.primary,
  },
  headerTextContainer: {
    flex: 1,
  },
  authorName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.textDark,
  },
  timestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.textLight,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  announcementTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 8,
    color: COLORS.textDark,
  },
  announcementContent: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textMedium,
    marginBottom: 12,
    lineHeight: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  errorContainer: {
    backgroundColor: COLORS.error + '20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.error,
    flex: 1,
  },
  retryButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  retryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: 'white',
  },
  loadingContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textMedium,
  },
  emptyContainer: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textMedium,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingTop: '12.5%',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    height: '75%',
    marginHorizontal: 20,
  },
  modalFormContent: {
    flex: 1,
  },
  formScrollView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: COLORS.textDark,
  },
  closeButton: {
    padding: 4,
  },
  input: {
    fontFamily: 'Inter-Regular',
    backgroundColor: COLORS.lightGrey,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  contentInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  categorySelector: {
    marginBottom: 20,
  },
  categoryLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  categoryOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryOptionText: {
    fontSize: 14,
  },
  createAnnouncementButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonDisabled: {
    backgroundColor: COLORS.primary + '80',
  },
  createButtonText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 16,
  },
  roleSelector: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 8,
  },
  roleSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleSelectorTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.textDark,
    marginLeft: 8,
  },
  publicToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  publicToggleContent: {
    flex: 1,
    marginRight: 12,
  },
  publicToggleLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 2,
  },
  publicToggleDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.textMedium,
    fontStyle: 'italic',
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    minWidth: 50,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textMedium,
  },
  toggleButtonTextActive: {
    color: 'white',
  },
  roleListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleListTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textDark,
  },
  selectedCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGrey,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleChipSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  roleColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  roleChipText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: COLORS.textDark,
  },
  roleChipTextSelected: {
    color: COLORS.primary,
    fontFamily: 'Inter-Bold',
  },
  emptyRolesContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyRolesText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textMedium,
    fontStyle: 'italic',
  },
  targetRolesContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  targetRolesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  targetRolesLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: COLORS.textMedium,
    marginLeft: 4,
  },
  targetRolesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  targetRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  targetRoleColorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  targetRoleText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
  },
  timeInputsContainer: {
    marginVertical: 16,
  },
  timeInputsLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 12,
  },
  timeInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInputWrapper: {
    flex: 1,
  },
  timeInputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 6,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    backgroundColor: 'white',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  timeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textMedium,
    marginLeft: 6,
  },
});