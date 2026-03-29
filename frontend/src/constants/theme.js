import { DefaultTheme } from 'react-native-paper';

export const COLORS = {
  primary: '#2196F3',
  secondary: '#FF5722',
  accent: '#FFC107',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',

  // Status colors
  registered: '#9E9E9E',
  assigned: '#2196F3',
  inProgress: '#FF9800',
  resolved: '#4CAF50',
  cancelled: '#F44336',

  // Priority colors
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
};

export const SIZES = {
  padding: 16,
  margin: 16,
  radius: 8,
  iconSize: 24,
};

export const USER_ROLES = {
  STUDENT: 'STUDENT',
  WORKER: 'WORKER',
  ADMIN: 'ADMIN',
};


export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors, // keep defaults
    primary: COLORS.primary,
    accent: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.surface,
    text: COLORS.text,
    error: COLORS.error,
  },
  roundness: 8,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
};

export const categories = [
  { label: 'Electrical', value: 'Electrical', icon: 'flash' },
  { label: 'Plumbing', value: 'Plumbing', icon: 'water' },
  { label: 'Cleaning', value: 'Cleaning', icon: 'broom' },
  { label: 'Carpentry', value: 'Carpentry', icon: 'hammer' },
  { label: 'IT', value: 'IT', icon: 'laptop' },
  { label: 'Other', value: 'Other', icon: 'help-circle' },
];

export const priorities = [
  { label: 'Low', value: 'Low', color: COLORS.low },
  { label: 'Medium', value: 'Medium', color: COLORS.medium },
  { label: 'High', value: 'High', color: COLORS.high },
];

export const statusList = [
  { label: 'Registered', value: 'Registered', color: COLORS.registered },
  { label: 'Assigned', value: 'Assigned', color: COLORS.assigned },
  { label: 'In Progress', value: 'In Progress', color: COLORS.inProgress },
  { label: 'Resolved', value: 'Resolved', color: COLORS.resolved },
  { label: 'Cancelled', value: 'Cancelled', color: COLORS.cancelled },
];
