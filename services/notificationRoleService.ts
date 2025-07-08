import { NotificationRole, UserNotificationPreferences, DEFAULT_NOTIFICATION_ROLES } from '@/types/notificationRoles';

class NotificationRoleService {
  private roles: NotificationRole[] = [...DEFAULT_NOTIFICATION_ROLES];
  private userPreferences: { [userId: string]: UserNotificationPreferences } = {};

  async getAllRoles(): Promise<NotificationRole[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.roles];
  }

  async createRole(roleData: Omit<NotificationRole, 'id' | 'createdAt'>, createdBy: string): Promise<NotificationRole> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newRole: NotificationRole = {
      ...roleData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      createdBy
    };

    this.roles.push(newRole);
    return newRole;
  }

  async updateRole(roleId: string, updates: Partial<NotificationRole>): Promise<NotificationRole> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const roleIndex = this.roles.findIndex(role => role.id === roleId);
    if (roleIndex === -1) {
      throw new Error('Role not found');
    }

    if (this.roles[roleIndex].isDefault && updates.name) {
      throw new Error('Cannot modify default role names');
    }

    this.roles[roleIndex] = { ...this.roles[roleIndex], ...updates };
    return this.roles[roleIndex];
  }

  async deleteRole(roleId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const roleIndex = this.roles.findIndex(role => role.id === roleId);
    if (roleIndex === -1) {
      throw new Error('Role not found');
    }

    if (this.roles[roleIndex].isDefault) {
      throw new Error('Cannot delete default roles');
    }

    this.roles.splice(roleIndex, 1);

    Object.keys(this.userPreferences).forEach(userId => {
      const prefs = this.userPreferences[userId];
      prefs.subscribedRoles = prefs.subscribedRoles.filter(id => id !== roleId);
    });
  }

  async getUserPreferences(userId: string): Promise<UserNotificationPreferences> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!this.userPreferences[userId]) {
      this.userPreferences[userId] = {
        userId,
        subscribedRoles: ['general'],
        allowAllAnnouncements: true,
        updatedAt: new Date().toISOString()
      };
    }

    return { ...this.userPreferences[userId] };
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserNotificationPreferences>): Promise<UserNotificationPreferences> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (!this.userPreferences[userId]) {
      this.userPreferences[userId] = {
        userId,
        subscribedRoles: ['general'],
        allowAllAnnouncements: true,
        updatedAt: new Date().toISOString()
      };
    }

    this.userPreferences[userId] = {
      ...this.userPreferences[userId],
      ...preferences,
      updatedAt: new Date().toISOString()
    };

    return { ...this.userPreferences[userId] };
  }

  async getUsersForRoles(roleIds: string[]): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const userIds: string[] = [];
    
    Object.entries(this.userPreferences).forEach(([userId, prefs]) => {
      if (prefs.allowAllAnnouncements || roleIds.some(roleId => prefs.subscribedRoles.includes(roleId))) {
        userIds.push(userId);
      }
    });

    return userIds;
  }
}

export const notificationRoleService = new NotificationRoleService();
