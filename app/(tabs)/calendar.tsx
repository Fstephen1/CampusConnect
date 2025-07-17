import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { format, addDays, parseISO, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { COLORS } from '@/constants/Colors';
import { Event } from '@/types/events';
import { FileAttachment } from '@/types/files';
import { getEvents, createEvent, updateEvent, deleteEvent } from '@/services/eventService';
import { CalendarDays, MapPin, Clock, Users, ChevronLeft, ChevronRight, Plus, X, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import FileUploader from '@/components/FileUploader';
import AttachmentViewer from '@/components/AttachmentViewer';
import { notificationRoleService } from '@/services/notificationRoleService';
import { NotificationRole } from '@/types/notificationRoles';

export default function CalendarScreen() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    type: 'Academic',
    startTime: '',
    endTime: '',
  });
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [availableRoles, setAvailableRoles] = useState<NotificationRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['general']);
  const [isPublic, setIsPublic] = useState(true);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    loadEvents();
    if (user?.role === 'teacher' || user?.role === 'admin') {
      loadNotificationRoles();
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
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

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  // Go to today
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // Filter events for the selected date
  const filteredEvents = events.filter(event => {
    if (!event.startTime || event.startTime.trim() === '') {
      // For events without time, show them on the selected date
      return true;
    }
    return isSameDay(parseISO(event.startTime), selectedDate);
  });

  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'academic':
        return COLORS.primary;
      case 'social':
        return COLORS.secondary;
      case 'sports':
        return COLORS.success;
      case 'club':
        return COLORS.warning;
      default:
        return COLORS.primary;
    }
  };

  const handleCreateEvent = async () => {
    if (!user) return;

    if (!isPublic && selectedRoles.length === 0) {
      Alert.alert('Error', 'Please select at least one notification role for targeted events.');
      return;
    }

    try {
      // Only set times if user provided them
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      let startTime = '';
      let endTime = '';

      if (newEvent.startTime && newEvent.startTime.trim() !== '') {
        startTime = `${selectedDateStr}T${newEvent.startTime}:00.000Z`;
      }

      if (newEvent.endTime && newEvent.endTime.trim() !== '') {
        endTime = `${selectedDateStr}T${newEvent.endTime}:00.000Z`;
      }

      const event = await createEvent({
        ...newEvent,
        startTime,
        endTime,
        organizer: user.displayName || 'Anonymous',
        attachments,
        targetRoles: isPublic ? [] : selectedRoles,
        isPublic: isPublic,
        createdBy: user.uid,
      });

      setEvents(prev => [...prev, event]);
      setIsModalVisible(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create event:', err);
    }
  };

  const handleEditEvent = async () => {
    if (!editingEvent) return;

    try {
      const selectedDateStr = format(parseISO(editingEvent.startTime || new Date().toISOString()), 'yyyy-MM-dd');
      let startTime = '';
      let endTime = '';

      if (newEvent.startTime && newEvent.startTime.trim() !== '') {
        startTime = `${selectedDateStr}T${newEvent.startTime}:00.000Z`;
      }

      if (newEvent.endTime && newEvent.endTime.trim() !== '') {
        endTime = `${selectedDateStr}T${newEvent.endTime}:00.000Z`;
      }

      const updated = await updateEvent(editingEvent.id, {
        title: newEvent.title,
        description: newEvent.description,
        location: newEvent.location,
        type: newEvent.type,
        startTime,
        endTime,
        attachments,
      });

      setEvents(prev => 
        prev.map(e => e.id === updated.id ? updated : e)
      );
      setIsModalVisible(false);
      setEditingEvent(null);
      resetForm();
    } catch (err) {
      console.error('Failed to update event:', err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(id);
              setEvents(prev => prev.filter(e => e.id !== id));
            } catch (err) {
              console.error('Failed to delete event:', err);
            }
          },
        },
      ]
    );
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      location: event.location,
      type: event.type,
      startTime: (event.startTime && event.startTime.trim() !== '') ? format(parseISO(event.startTime), 'HH:mm') : '',
      endTime: (event.endTime && event.endTime.trim() !== '') ? format(parseISO(event.endTime), 'HH:mm') : '',
    });
    setAttachments(event.attachments || []);
    setIsModalVisible(true);
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    resetForm();
    setIsModalVisible(true);
  };

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      location: '',
      type: 'Academic',
      startTime: '',
      endTime: '',
    });
    setAttachments([]);
    setSelectedRoles(['general']);
    setIsPublic(true);
  };

  const renderDayItem = ({ item }: { item: Date }) => {
    const day = format(item, 'd');
    const weekday = format(item, 'EEE');
    const isSelected = isSameDay(item, selectedDate);
    const isToday = isSameDay(item, new Date());
    
    // Check if there are events on this day
    const hasEvents = events.some(event => isSameDay(parseISO(event.startTime), item));
    
    return (
      <TouchableOpacity
        style={[
          styles.dayItem,
          isSelected && styles.selectedDayItem,
          isToday && !isSelected && styles.todayDayItem
        ]}
        onPress={() => setSelectedDate(item)}
      >
        <Text style={[
          styles.weekdayText,
          isSelected && styles.selectedDayText,
          isToday && !isSelected && styles.todayDayText
        ]}>
          {weekday}
        </Text>
        <Text style={[
          styles.dayText,
          isSelected && styles.selectedDayText,
          isToday && !isSelected && styles.todayDayText
        ]}>
          {day}
        </Text>
        {hasEvents && <View style={[
          styles.eventIndicator,
          isSelected && styles.selectedEventIndicator,
          isToday && !isSelected && styles.todayEventIndicator
        ]} />}
      </TouchableOpacity>
    );
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={[
        styles.eventCard,
        { borderLeftColor: getEventTypeColor(item.type) }
      ]}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <View style={styles.eventActions}>
          <View style={[
            styles.eventTypeBadge,
            { backgroundColor: getEventTypeColor(item.type) + '20' }
          ]}>
            <Text style={[
              styles.eventTypeText,
              { color: getEventTypeColor(item.type) }
            ]}>
              {item.type}
            </Text>
          </View>
          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => openEditModal(item)}
              >
                <Edit size={16} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDeleteEvent(item.id)}
              >
                <Trash2 size={16} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      
      <Text style={styles.eventDescription} numberOfLines={3}>{item.description}</Text>
      
      <View style={styles.eventDetailsContainer}>
        {item.location && (
          <View style={styles.eventDetailItem}>
            <MapPin size={14} color={COLORS.textMedium} />
            <Text style={styles.eventDetailText}>{item.location}</Text>
          </View>
        )}
        
        {/* Only show time if both startTime and endTime are provided and not empty */}
        {item.startTime && item.endTime && item.startTime.trim() !== '' && item.endTime.trim() !== '' && (
          <View style={styles.eventDetailItem}>
            <Clock size={14} color={COLORS.textMedium} />
            <Text style={styles.eventDetailText}>
              {format(parseISO(item.startTime), 'h:mm a')} - {format(parseISO(item.endTime), 'h:mm a')}
            </Text>
          </View>
        )}
        
        {item.attendees && (
          <View style={styles.eventDetailItem}>
            <Users size={14} color={COLORS.textMedium} />
            <Text style={styles.eventDetailText}>{item.attendees} attendees</Text>
          </View>
        )}
      </View>

      {item.attachments && item.attachments.length > 0 && (
        <AttachmentViewer attachments={item.attachments} />
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

  return (
    <View style={styles.container}>
      <View style={styles.calendarContainer}>
        <View style={styles.monthHeaderContainer}>
          <TouchableOpacity style={styles.monthNavButton} onPress={goToPreviousMonth}>
            <ChevronLeft size={24} color={COLORS.primary} />
          </TouchableOpacity>
          
          <View style={styles.monthTitleContainer}>
            <Text style={styles.monthHeaderText}>
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.monthNavButton} onPress={goToNextMonth}>
            <ChevronRight size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.todayButtonContainer}>
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <CalendarDays size={16} color={COLORS.primary} />
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          horizontal
          data={daysInMonth}
          renderItem={renderDayItem}
          keyExtractor={(item) => item.toISOString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysContainer}
          getItemLayout={(data, index) => ({
            length: 68, // width + margin
            offset: 68 * index,
            index,
          })}
          initialScrollIndex={Math.max(0, daysInMonth.findIndex(day => isSameDay(day, selectedDate)))}
        />
      </View>
      
      <View style={styles.eventsContainer}>
        <View style={styles.eventsHeader}>
          <Text style={styles.sectionTitle}>
            Events for {format(selectedDate, 'MMMM d, yyyy')}
          </Text>
          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <TouchableOpacity style={styles.addEventButton} onPress={openCreateModal}>
              <Plus size={20} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadEvents}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events scheduled for this day</Text>
            {(user?.role === 'teacher' || user?.role === 'admin') && (
              <TouchableOpacity style={styles.createFirstEventButton} onPress={openCreateModal}>
                <Text style={styles.createFirstEventText}>Create Event</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredEvents}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.eventsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

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
                {editingEvent ? 'Edit Event' : 'Create Event'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setEditingEvent(null);
                  resetForm();
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
              placeholder="Event Title"
              value={newEvent.title}
              onChangeText={(text) => setNewEvent(prev => ({ ...prev, title: text }))}
            />

            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="Description"
              value={newEvent.description}
              onChangeText={(text) => setNewEvent(prev => ({ ...prev, description: text }))}
              multiline
              textAlignVertical="top"
            />

            <TextInput
              style={styles.input}
              placeholder="Location"
              value={newEvent.location}
              onChangeText={(text) => setNewEvent(prev => ({ ...prev, location: text }))}
            />

            <View style={styles.timeInputsContainer}>
              <Text style={styles.timeInputsLabel}>Event Time (Optional)</Text>
              <View style={styles.timeInputsRow}>
                <View style={styles.timeInputWrapper}>
                  <Text style={styles.timeInputLabel}>Start Time</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="HH:MM (Optional)"
                    value={newEvent.startTime}
                    onChangeText={(text) => setNewEvent(prev => ({ ...prev, startTime: text }))}
                  />
                </View>
                <View style={styles.timeInputWrapper}>
                  <Text style={styles.timeInputLabel}>End Time</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="HH:MM (Optional)"
                    value={newEvent.endTime}
                    onChangeText={(text) => setNewEvent(prev => ({ ...prev, endTime: text }))}
                  />
                </View>
              </View>
            </View>

            <FileUploader
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              uploadedBy={user?.uid || ''}
            />

            <View style={styles.typeSelector}>
              <Text style={styles.typeLabel}>Event Type:</Text>
              {['Academic', 'Social', 'Sports', 'Club'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor: newEvent.type === type
                        ? getEventTypeColor(type) + '20'
                        : 'transparent'
                    }
                  ]}
                  onPress={() => setNewEvent(prev => ({ ...prev, type }))}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      {
                        color: getEventTypeColor(type),
                        fontFamily: newEvent.type === type
                          ? 'Inter-Bold'
                          : 'Inter-Regular'
                      }
                    ]}
                  >
                    {type}
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
                    <Text style={styles.publicToggleLabel}>Public Event</Text>
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
                styles.createEventButton,
                (!newEvent.title || !newEvent.description) && styles.createButtonDisabled
              ]}
              onPress={editingEvent ? handleEditEvent : handleCreateEvent}
              disabled={!newEvent.title || !newEvent.description}
            >
              <Text style={styles.createButtonText}>
                {editingEvent ? 'Update Event' : 'Create Event'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  calendarContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  monthHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  monthNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthHeaderText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.textDark,
  },
  todayButtonContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  todayButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 4,
  },
  daysContainer: {
    paddingHorizontal: 8,
  },
  dayItem: {
    width: 60,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  selectedDayItem: {
    backgroundColor: COLORS.primary,
  },
  todayDayItem: {
    backgroundColor: COLORS.secondary + '20',
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  weekdayText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textMedium,
    marginBottom: 4,
  },
  dayText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.textDark,
  },
  selectedDayText: {
    color: 'white',
  },
  todayDayText: {
    color: COLORS.secondary,
  },
  eventIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  selectedEventIndicator: {
    backgroundColor: 'white',
  },
  todayEventIndicator: {
    backgroundColor: COLORS.secondary,
  },
  eventsContainer: {
    flex: 1,
    padding: 16,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.textDark,
    flex: 1,
  },
  addEventButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsList: {
    paddingBottom: 16,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.textDark,
    flex: 1,
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  eventTypeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  eventDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textMedium,
    marginBottom: 12,
  },
  eventDetailsContainer: {
    flexDirection: 'column',
    gap: 6,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDetailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.textMedium,
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textMedium,
    marginTop: 12,
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
  },
  retryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textMedium,
    marginBottom: 16,
  },
  createFirstEventButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createFirstEventText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: 'white',
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
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    marginBottom: 20,
  },
  typeLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  typeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  typeOptionText: {
    fontSize: 14,
  },
  createEventButton: {
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
});