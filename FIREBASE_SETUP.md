# Firebase Setup Guide for CampusConnect

## Current Issue
Your events are not persisting because the app is using mock data instead of real Firebase Firestore database.

## Quick Fix (Temporary)
I've updated your code to use Firebase, but you need to configure it properly. For now, the app will fall back to mock data if Firebase isn't configured.

## Steps to Set Up Firebase

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Name your project (e.g., "CampusConnect")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Set Up Firestore Database
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

### 3. Get Firebase Configuration
1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon (</>) to add a web app
4. Register your app with name "CampusConnect"
5. Copy the configuration object

### 4. Update Firebase Configuration
Replace the placeholder config in `services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

### 5. Set Up Firestore Security Rules (Optional)
In Firestore Database > Rules, you can use these basic rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Testing the Fix

1. After configuring Firebase, restart your app
2. Try creating an event for September 17, 2025
3. The event should now persist in Firebase Firestore
4. You can view the data in Firebase Console > Firestore Database

## Current Behavior

- **With Firebase configured**: Events save to Firestore and persist
- **Without Firebase configured**: Falls back to mock data (events disappear on restart)

## Need Help?

If you need help with Firebase setup, let me know and I can guide you through the specific steps!
