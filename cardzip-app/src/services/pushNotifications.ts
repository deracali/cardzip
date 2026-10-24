import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { API_BASE_URL } from './api/config';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const registeredTokens = new Map<string, string>();
const registrationsInFlight = new Map<string, Promise<string>>();

const createAndRegisterPushToken = async (userId: string): Promise<string> => {
  if (Platform.OS === 'web') {
    throw new Error('Push notifications are only supported on iOS and Android.');
  }
  if (!Device.isDevice) {
    throw new Error('Push notifications require a physical device.');
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    throw new Error('The Expo EAS project ID is missing from the app configuration.');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1DB954',
    });
  }

  let permission = await Notifications.getPermissionsAsync();
  if (permission.status !== 'granted') {
    permission = await Notifications.requestPermissionsAsync();
  }
  if (permission.status !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  const { data: pushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
  if (registeredTokens.get(userId) === pushToken) return pushToken;

  const response = await fetch(`${API_BASE_URL}/register-token`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, token: pushToken }),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error' in body
      ? String(body.error)
      : `Push token registration failed (${response.status}).`;
    throw new Error(message);
  }

  registeredTokens.set(userId, pushToken);
  return pushToken;
};

export const registerPushToken = (userId: string): Promise<string> => {
  const existingRegistration = registrationsInFlight.get(userId);
  if (existingRegistration) return existingRegistration;

  const registration = createAndRegisterPushToken(userId).finally(() => {
    registrationsInFlight.delete(userId);
  });
  registrationsInFlight.set(userId, registration);
  return registration;
};
