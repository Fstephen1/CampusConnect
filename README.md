# CampusConnect

A React Native mobile application for campus communication and event management, built with Expo and Firebase.

## Features

- **Authentication System**: Secure login and registration
- **Role-based Access**: Different access levels for students, faculty, and administrators
- **Announcements**: Create and view campus announcements
- **Event Management**: Schedule and manage campus events
- **File Sharing**: Upload and share documents and files
- **Real-time Notifications**: Stay updated with push notifications
- **Calendar Integration**: View events in calendar format

## Tech Stack

- **Frontend**: React Native with Expo
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Navigation**: Expo Router
- **State Management**: React Context API
- **UI Components**: Custom components with Lucide React Native icons

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com/)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CampusConnect/project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore Database, and Storage
   - Download the configuration file and update `services/firebase.ts`

4. **Start the development server**
   ```bash
   npx expo start
   ```

## Project Structure

```
├── app/                    # App screens and navigation
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── constants/             # App constants and configurations
├── context/              # React Context providers
├── hooks/                # Custom React hooks
├── services/             # Firebase and API services
├── types/                # TypeScript type definitions
└── assets/               # Images and static assets
```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Access Codes

Check `ACCESS_CODES.md` for role-specific access codes and credentials.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.
