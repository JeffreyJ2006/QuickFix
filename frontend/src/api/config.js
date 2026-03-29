import Constants from 'expo-constants';

// IMPORTANT: Replace with your computer's IP address
// Find it by running: ipconfig (Windows) or ifconfig (Mac/Linux)
// Example: 192.168.1.5, 192.168.0.105, etc.
const LOCAL_IP = '192.168.137.1'; // ⚠️ CHANGE THIS TO YOUR IP ADDRESS

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
