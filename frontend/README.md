# QuickFix Mobile App

A React Native mobile application for college maintenance complaint management system.

## Features

### For Students
- **Authentication**: Register and login with student credentials
- **Create Complaints**: Submit maintenance requests with images and detailed descriptions
- **Track Status**: Monitor complaint status in real-time
- **Feedback System**: Rate and provide feedback for resolved complaints
- **Location Services**: Specify exact location of issues

### For Workers
- **Task Management**: View assigned maintenance tasks
- **Status Updates**: Update task status (In Progress, Resolved)
- **Student Communication**: Access student contact information
- **Category-based Assignment**: Tasks assigned based on worker expertise

### For Admins
- **Dashboard**: Overview of system statistics and recent activity
- **User Management**: Verify worker accounts and manage users
- **Complaint Oversight**: Monitor all complaints and their status
- **Analytics**: View system performance metrics

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Navigation**: Navigation library
- **React Native Paper**: Material Design components
- **Axios**: HTTP client for API communication
- **AsyncStorage**: Local data persistence
- **Socket.IO**: Real-time communication
- **Expo Notifications**: Push notifications
- **Formik & Yup**: Form handling and validation
- **Date-fns**: Date manipulation

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── axios.js          # HTTP client configuration
│   │   ├── config.js         # API configuration
│   │   └── endpoints.js      # API endpoints
│   ├── components/
│   │   ├── ComplaintCard.js  # Reusable complaint display component
│   │   ├── StatusBadge.js    # Status indicator component
│   │   └── ImagePicker.js    # Image selection component
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── Student/
│   │   │   ├── HomeScreen.js
│   │   │   ├── CreateComplaintScreen.js
│   │   │   └── ComplaintDetailScreen.js
│   │   ├── Worker/
│   │   │   ├── AssignedTasksScreen.js
│   │   │   └── TaskDetailScreen.js
│   │   └── Admin/
│   │       └── DashboardScreen.js
│   ├── navigation/
│   │   ├── AppNavigator.js   # Main navigation logic
│   │   └── AuthNavigator.js  # Authentication navigation
│   ├── context/
│   │   └── AuthContext.js    # Authentication state management
│   ├── utils/
│   │   ├── storage.js        # Local storage utilities
│   │   └── notifications.js  # Push notification utilities
│   └── constants/
│       └── theme.js          # App theme and styling constants
├── App.js                    # Main app component
└── package.json
```

## Installation

1. **Prerequisites**
   - Node.js (v16 or higher)
   - npm or yarn
   - Expo CLI
   - Android Studio (for Android development)
   - Xcode (for iOS development, macOS only)

2. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Run on Device/Emulator**
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   
   # Web
   npm run web
   ```

## Configuration

### API Configuration
Update the API base URL in `src/api/config.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:5000/api'  // Development
    : 'https://your-production-api.com/api', // Production
  // ...
};
```

### Environment Variables
Create a `.env` file in the frontend directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Key Features Implementation

### Authentication Flow
- JWT-based authentication
- Role-based access control (Student, Worker, Admin)
- Automatic token refresh
- Secure storage of credentials

### Real-time Updates
- Socket.IO integration for live status updates
- Push notifications for important events
- Automatic data refresh on screen focus

### Image Handling
- Camera and gallery integration
- Image compression and optimization
- Cloudinary integration for image storage

### Form Validation
- Comprehensive form validation using Yup
- Real-time validation feedback
- Error handling and user-friendly messages

## Backend Integration

The app connects to a Node.js/Express backend with the following endpoints:

- **Authentication**: `/api/auth/*`
- **Complaints**: `/api/complaints/*`
- **Users**: `/api/users/*`
- **Messages**: `/api/messages/*`
- **Admin**: `/api/admin/*`

## Development Guidelines

### Code Style
- Use functional components with hooks
- Follow React Native best practices
- Implement proper error handling
- Use TypeScript for better type safety (optional)

### State Management
- Context API for global state (authentication)
- Local state for component-specific data
- AsyncStorage for persistent data

### Navigation
- Stack navigation for screen transitions
- Tab navigation for main app sections
- Role-based navigation structure

## Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Type checking (if using TypeScript)
npm run type-check
```

## Building for Production

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **Android build issues**
   - Ensure Android SDK is properly configured
   - Check Java version compatibility

3. **iOS build issues**
   - Ensure Xcode is up to date
   - Check iOS deployment target

### Debug Mode
Enable debug mode by shaking the device or pressing `Cmd+D` (iOS) / `Cmd+M` (Android) in the simulator.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.