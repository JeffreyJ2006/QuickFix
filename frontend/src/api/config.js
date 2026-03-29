import Constants from 'expo-constants';
import { Platform } from 'react-native';


const MANUAL_IP = '192.168.137.1'; // Example: '192.168.1.15'

// Automatically detect your computer's IP address from Expo's host URI
const debuggerHost = Constants.expoConfig?.hostUri;
const detectedHost = debuggerHost?.split(':').shift();

// Selection logic
let LOCAL_IP = MANUAL_IP || detectedHost || 'localhost';

// Android Emulator specific (only if no manual IP and no detected host)
if (__DEV__ && Platform.OS === 'android' && !MANUAL_IP && (!detectedHost || detectedHost === 'localhost')) {
  LOCAL_IP = '10.0.2.2';
}

console.log('-----------------------------------------');
console.log('🚀 API CONFIGURATION');
console.log('📍 LOCAL_IP:', LOCAL_IP);
console.log('🔗 API_URL:', `http://${LOCAL_IP}:5000/api`);
console.log('📱 Platform:', Platform.OS);
console.log('💡 Tip: If Network Error, change MANUAL_IP in config.js');
console.log('-----------------------------------------');

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
