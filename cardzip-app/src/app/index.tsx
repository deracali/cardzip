import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../store';

export default function IndexScreen() {
  const router = useRouter();
  const { sessionReady, isAuthenticated, sessionExpired } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!sessionReady) return;
    router.replace(
      isAuthenticated
        ? '/(main)/(tabs)/home'
        : sessionExpired
          ? '/(auth)/login'
          : '/(auth)/onboarding'
    );
  }, [isAuthenticated, router, sessionExpired, sessionReady]);

  return null;
}