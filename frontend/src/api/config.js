import Constants from 'expo-constants';

// Automatically detect your computer's IP address from Expo's host URI
const debuggerHost = Constants.expoConfig?.hostUri;
const host = debuggerHost?.split(':').shift() || 'localhost';

// Falls back to localhost if not available
const LOCAL_IP = host; 

console.log('🔗 API connected to:', LOCAL_IP);

export const API_URL = __DEV__ 
  ? `http://${LOCAL_IP}:5000/api`
  : 'https://your-production-api.com/api';

export const SOCKET_URL = __DEV__
  ? `http://${LOCAL_IP}:5000`
  : 'https://your-production-api.com';

export const config = {
  apiUrl: API_URL,
  socketUrl: SOCKET_URL,
  timeout: 10000,
};
