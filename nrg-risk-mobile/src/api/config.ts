import { Platform } from 'react-native';

// Android Emulator เรียกเครื่องคอมพิวเตอร์ผ่าน 10.0.2.2
const DEFAULT_API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;

export const REQUEST_TIMEOUT_MS = 10000;