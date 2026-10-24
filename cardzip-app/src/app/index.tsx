import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../store';

export default function IndexScreen() {
  const router = useRouter();
  const { sessionReady, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!sessionReady) return;
    router.replace(isAuthenticated ? '/(main)/(tabs)/home' : '/(auth)/onboarding');
  }, [isAuthenticated, router, sessionReady]);

  return null;
}