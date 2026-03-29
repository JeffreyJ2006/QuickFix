# QuickFix - Maintenance Management System

A mobile application built with React Native/Expo for managing maintenance requests and complaints in an institutional setting.

## Features

- **User Roles**:
  - Students: Can create and track complaints
  - Workers: Can manage assigned tasks
  - Admins: Can oversee all complaints and manage workers

- **Key Functionalities**:
  - Real-time complaint tracking
  - Image upload support
  - In-app messaging
  - Push notifications
  - Worker assignment system
  - Admin dashboard

## Tech Stack

- **Frontend**:
  - React Native / Expo
  - React Navigation
  - React Native Paper
  - Context API for state management

- **Backend**:
  - Node.js
  - Express.js
  - MongoDB
  - JWT Authentication

## Project Structure

```
├── backend/                # Backend server code
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/       # Database models
│   │   └── routes/       # API routes
│   └── server.js         # Server entry point
│
└── frontend/              # React Native app
    ├── src/
    │   ├── api/          # API integration
    │   ├── constants/    # App constants
    │   ├── context/      # React Context
    │   ├── navigation/   # Navigation setup
    │   └── screens/      # App screens
    └── App.js            # App entry point
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/quickfix.git
   cd quickfix
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start Expo development server
   cd frontend
   npx expo start
   ```

