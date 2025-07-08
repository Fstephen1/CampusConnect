import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { Plus, Edit2, Trash2, X } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { notificationRoleService } from '@/services/notificationRoleService';
import { NotificationRole } from '@/types/notificationRoles';
import { useAuth } from '@/hooks/useAuth';

interface RoleManagementProps {
  visible: boolean;
  onClose: () => void;
}

export default function RoleManagement({ visible, onClose }: RoleManagementProps) {
  const { user } = useAuth();
  const [roles, setRoles] = useState<NotificationRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<NotificationRole | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#3B82F6');

  const colorOptions = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', 
    '#EF4444', '#06B6D4', '#84CC16', '#F97316'
  ];

  useEffect(() => {
    if (visible) {
      loadRoles();
    }
  }, [visible]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const allRoles = await notificationRoleService.getAllRoles();
      setRoles(allRoles);
    } catch (error) {
      Alert.alert('Error', 'Failed to load roles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim() || !newRoleDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const newRole = await notificationRoleService.createRole({
        name: newRoleName.trim(),
        description: newRoleDescription.trim(),
        color: newRoleColor,
        isDefault: false,
        createdBy: user?.uid || 'admin'
      }, user?.uid || 'admin');

      setRoles([...roles, newRole]);
      setShowCreateModal(false);
      resetForm();
      Alert.alert('Success', 'Role created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create role');
      console.error(error);
    }
  };

  const handleEditRole = async () => {
    if (!editingRole || !newRoleName.trim() || !newRoleDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const updatedRole = await notificationRoleService.updateRole(editingRole.id, {
        name: newRoleName.trim(),
        description: newRoleDescription.trim(),
        color: newRoleColor
      });

      setRoles(roles.map(role => role.id === editingRole.id ? updatedRole : role));
      setEditingRole(null);
      resetForm();
      Alert.alert('Success', 'Role updated successfully');
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to update role');
      console.error(error);
    }
  };

  const handleDeleteRole = (role: NotificationRole) => {
    if (role.isDefault) {
      Alert.alert('Error', 'Cannot delete default roles');
      return;
    }

    Alert.alert(
      'Delete Role',
      `Are you sure you want to delete "${role.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationRoleService.deleteRole(role.id);
              setRoles(roles.filter(r => r.id !== role.id));
              Alert.alert('Success', 'Role deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete role');
              console.error(error);
            }
          }
        }
      ]
    );
  };

  const startEdit = (role: NotificationRole) => {
    setEditingRole(role);
    setNewRoleName(role.name);
    setNewRoleDescription(role.description);
    setNewRoleColor(role.color);
  };

  const resetForm = () => {
    setNewRoleName('');
    setNewRoleDescription('');
    setNewRoleColor('#3B82F6');
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingRole(null);
    resetForm();
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Notification Roles</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="white" />
            <Text style={styles.createButtonText}>Create Role</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading roles...</Text>
            </View>
          ) : (
            roles.map((role) => (
              <View key={role.id} style={styles.roleCard}>
                <View style={styles.roleHeader}>
                  <View style={styles.roleInfo}>
                    <View style={[styles.colorIndicator, { backgroundColor: role.color }]} />
                    <View style={styles.roleTextContainer}>
                      <Text style={styles.roleName}>{role.name}</Text>
                      <Text style={styles.roleDescription}>{role.description}</Text>
                      {role.isDefault && (
                        <Text style={styles.defaultLabel}>Default Role</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.roleActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => startEdit(role)}
                    >
                      <Edit2 size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                    {!role.isDefault && (
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleDeleteRole(role)}
                      >
                        <Trash2 size={16} color={COLORS.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <Modal
          visible={showCreateModal || editingRole !== null}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingRole ? 'Edit Role' : 'Create New Role'}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <X size={24} color={COLORS.textDark} />
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Role Name</Text>
                  <TextInput
                    style={styles.input}
                    value={newRoleName}
                    onChangeText={setNewRoleName}
                    placeholder="Enter role name"
                    editable={!editingRole?.isDefault}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={newRoleDescription}
                    onChangeText={setNewRoleDescription}
                    placeholder="Enter role description"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Color</Text>
                  <View style={styles.colorPicker}>
                    {colorOptions.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          newRoleColor === color && styles.selectedColor
                        ]}
                        onPress={() => setNewRoleColor(color)}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.saveButton} 
                    onPress={editingRole ? handleEditRole : handleCreateRole}
                  >
                    <Text style={styles.saveButtonText}>
                      {editingRole ? 'Update' : 'Create'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: COLORS.textDark,
  },
  closeButton: {
    padding: 4,
  },
  actionBar: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createButtonText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textMedium,
    marginTop: 12,
  },
  roleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  roleDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textMedium,
    marginBottom: 4,
  },
  defaultLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: COLORS.lightGrey,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.textDark,
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: COLORS.textDark,
    borderWidth: 3,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.textMedium,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
  },
});
