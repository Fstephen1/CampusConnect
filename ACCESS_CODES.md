# Campus Connect - Access Codes

## Role-Based Authentication System

This app now has a secure role-based authentication system that prevents unauthorized access to admin and teacher accounts.

### Account Types

1. **Student Account**
   - No access code required
   - Can view announcements, events, and basic features
   - Anyone can register as a student

2. **Teacher Account**
   - Requires access code (confidential)
   - Can create announcements, manage events, and access teacher features
   - Must have valid teacher access code to register

3. **Admin Account**
   - Requires access code (confidential)
   - Full access to all features including user management and system settings
   - Must have valid admin access code to register

### How It Works

1. **Registration**: Users select their role during registration
2. **Access Code Validation**: Teacher and Admin roles require valid access codes
3. **Secure Storage**: User credentials are stored securely with role information
4. **Login Validation**: System validates both email/password and role permissions

### ⚠️ CONFIDENTIAL ACCESS CODES

**These codes should only be shared with authorized personnel:**

- **Teacher Code**: `TEACH2025` (Share only with verified teachers)
- **Admin Code**: `ADMIN2025` (Share only with system administrators)

**Security Note**: Never display these codes publicly or in the app interface.

### Security Features

- ✅ Students cannot register as teachers or admins without codes
- ✅ Teachers cannot register as admins without admin code
- ✅ Access codes are validated during registration
- ✅ Role information is stored securely with user accounts
- ✅ Login system validates user credentials and role

### Access Code Management

To change access codes, update the values in:
`constants/RoleCredentials.ts`

```typescript
export const ROLE_ACCESS_CODES = {
  teacher: 'TEACH2024',  // Change this for new teacher code
  admin: 'ADMIN2024'     // Change this for new admin code
} as const;
```

## 🔔 Notification Roles System

### Discord-Style Role-Based Notifications

The app now includes a sophisticated notification system similar to Discord where students can choose which types of announcements they want to receive.

### Default Notification Roles

1. **HND** - Higher National Diploma students
2. **Bachelor Degree** - Bachelor degree students
3. **Masters** - Masters degree students
4. **Polytech** - Polytechnic students
5. **General** - General announcements for all students

### How It Works

#### For Students:
1. Go to **Profile** → **Notification Roles**
2. Select which academic levels/roles you want notifications for
3. Only receive announcements targeted to your selected roles

#### For Teachers/Admins:
1. When creating announcements or events, choose:
   - **Public Announcement/Event**: Visible to all students
   - **Targeted Announcement/Event**: Select specific roles to notify

#### For Admins:
1. Go to **Profile** → **Manage Notification Roles**
2. Create custom roles (e.g., "Computer Science", "Engineering", "Year 1")
3. Edit existing roles (except default ones)
4. Delete custom roles

### Benefits

- ✅ **Personalized Experience**: Students only get relevant notifications and events
- ✅ **Reduced Noise**: No more irrelevant announcements or events
- ✅ **Flexible Targeting**: Teachers can target specific groups for both announcements and events
- ✅ **Easy Management**: Admins can create roles as needed
- ✅ **Discord-Like UX**: Familiar role-based system
- ✅ **Calendar Integration**: Role targeting works for both announcements and calendar events

### **📝 Demo Note:**
In this demo version, all announcements and events are visible to everyone for testing purposes. In a production app, the server would filter content based on each user's subscribed notification roles.
