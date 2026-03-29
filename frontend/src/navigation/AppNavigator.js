import React from 'react';
import { View, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext.js';
import { COLORS, SIZES, USER_ROLES } from '../constants/theme.js';

// Import Auth screens
import LoginScreen from '../screens/Auth/LoginScreen.js';
import RegisterScreen from '../screens/Auth/RegisterScreen.js';

// Import Student screens
import HomeScreen from '../screens/Student/HomeScreen.js';
import CreateComplaintScreen from '../screens/Student/CreateComplaintScreen.js';
import ComplaintDetailScreen from '../screens/Student/ComplaintDetailScreen.js';
import MyComplaintsScreen from '../screens/Student/MyComplaintsScreen.js';

// Import Worker screens
import AssignedTasksScreen from '../screens/Worker/AssignedTasksScreen.js';
import TaskDetailScreen from '../screens/Worker/TaskDetailScreen.js';

// Import Admin screens
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen.js';
import AdminComplaintsScreen from '../screens/Admin/AdminComplaintsScreen.js';
import AdminUsersScreen from '../screens/Admin/AdminUsersScreen.js';

// Import Common screens
import ChatScreen from '../screens/Common/ChatScreen.js';
import NotificationsScreen from '../screens/Common/NotificationsScreen.js';
import ProfileScreen from '../screens/Common/ProfileScreen.js';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Stack navigator for Student flows
const StudentStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
      }}
    >
      <Stack.Screen 
        name="StudentTabs" 
        component={StudentTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ComplaintDetail" 
        component={ComplaintDetailScreen}
        options={{ title: 'Complaint Details' }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
    </Stack.Navigator>
  );
};

// Stack navigator for Worker flows
const WorkerStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
      }}
    >
      <Stack.Screen 
        name="WorkerTabs" 
        component={WorkerTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen}
        options={{ title: 'Task Details' }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
    </Stack.Navigator>
  );
};

// Stack navigator for Admin flows
const AdminStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
      }}
    >
      <Stack.Screen 
        name="AdminTabs" 
        component={AdminTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
    </Stack.Navigator>
  );
};

// Student Tab Navigator
const StudentTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Create') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="MyComplaints" 
        component={MyComplaintsScreen}
        options={{ 
          tabBarLabel: 'My Complaints',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'document-text' : 'document-text-outline'} 
              size={size} 
              color={color} 
            />
          )
        }}
      />
      <Tab.Screen 
        name="Create" 
        component={CreateComplaintScreen}
        options={{ tabBarLabel: 'Create' }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ 
          tabBarLabel: 'Notifications',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'notifications' : 'notifications-outline'} 
              size={size} 
              color={color} 
            />
          )
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Worker Tab Navigator
const WorkerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Tasks') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Tasks" 
        component={AssignedTasksScreen}
        options={{ tabBarLabel: 'Tasks' }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ 
          tabBarLabel: 'Notifications',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'notifications' : 'notifications-outline'} 
              size={size} 
              color={color} 
            />
          )
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={size} 
              color={color} 
            />
          )
        }}
      />
    </Tab.Navigator>
  );
};

// Admin Tab Navigator
const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Complaints') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Users') {
            iconName = focused ? 'people' : 'people-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 5,
        },
        headerShown: false,
      })}
    >
            <Tab.Screen 
        name="Dashboard" 
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'analytics' : 'analytics-outline'} 
              size={size} 
              color={color} 
            />
          )
        }}
      />
      <Tab.Screen 
        name="Complaints" 
        component={AdminComplaintsScreen}
        options={{
          tabBarLabel: 'Complaints',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'list' : 'list-outline'} 
              size={size} 
              color={color} 
            />
          )
        }}
      />
      <Tab.Screen 
        name="Users" 
        component={AdminUsersScreen}
        options={{
          tabBarLabel: 'Users',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'people' : 'people-outline'} 
              size={size} 
              color={color} 
            />
          )
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surface }}>
        <Text style={{ marginTop: 20, color: COLORS.primary, fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth screens
        <Stack.Screen 
          name="Auth" 
          component={AuthStack} 
          options={{ headerShown: false }}
        />
      ) : (
        // Protected screens based on user role
        <>
          {user?.role === USER_ROLES.STUDENT && (
            <Stack.Screen name="StudentHome" component={StudentStackNavigator} />
          )}
          {user?.role === USER_ROLES.WORKER && (
            <Stack.Screen name="WorkerHome" component={WorkerStackNavigator} />
          )}
          {user?.role === USER_ROLES.ADMIN && (
            <Stack.Screen name="AdminHome" component={AdminStackNavigator} />  // ✅ Fixed: Use AdminStackNavigator
          )}
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;