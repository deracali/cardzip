import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { Merriweather_400Regular, Merriweather_700Bold } from '@expo-google-fonts/merriweather';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './store';
import { restoreAuthSession } from './store/slices/authSlice';
import { loadPreferences } from './store/slices/preferencesSlice';
import CardzipLoader from '../components/CardzipLoader';

function AppNavigator() {
  const dispatch = useAppDispatch();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Merriweather_400Regular,
    Merriweather_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    void dispatch(loadPreferences());
    void dispatch(restoreAuthSession());
  }, [dispatch, fontsLoaded]);

  if (!fontsLoaded) return <CardzipLoader label="Preparing your Cardzip app…" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(main)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}