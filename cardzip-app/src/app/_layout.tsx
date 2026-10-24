import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { Href, Stack, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, useAppDispatch, useAppSelector } from '../store';
import { restoreAuthSession } from '../store/slices/authSlice';
import { clearAccount, fetchMyAccount } from '../store/slices/accountSlice';
import { loadPreferences, setNotificationsEnabled } from '../store/slices/preferencesSlice';
import { loadCart } from '../store/slices/cartSlice';
import { registerPushToken } from '../services/pushNotifications';

const getNotificationHref = (data: Record<string, unknown>): Href => {
  const id = (value: unknown) => typeof value === 'string' && /^[\w-]+$/.test(value) ? value : '';
  const type = typeof data.type === 'string' ? data.type.toLowerCase() : '';
  if (['community_chat', 'community_chat_message'].includes(type)) {
    const conversationId = id(data.conversationId);
    if (conversationId) return `/(main)/market/community/chat/${conversationId}` as Href;
  }
  if (['community_listing', 'community_listing_update'].includes(type)) {
    const listingId = id(data.listingId);
    if (listingId) return `/(main)/market/community/${listingId}` as Href;
  }
  if (['shop_appointment_request', 'appointment_request'].includes(type)) {
    return '/(main)/market/business/manage' as Href;
  }
  if (['shop_appointment_update', 'shop_appointment', 'appointment'].includes(type)) {
    const slug = id(data.shopSlug || data.businessSlug);
    return (slug ? `/(main)/market/business/${slug}` : '/(main)/market/business') as Href;
  }
  if (['shop_approval', 'shop_approved'].includes(type)) {
    if (type === 'shop_approved' && data.shopType === 'business') return '/(main)/market/business/manage' as Href;
    if (type === 'shop_approved' && data.shopType === 'store') return '/(main)/(tabs)/store' as Href;
    const slug = id(data.shopSlug || data.businessSlug);
    return (slug ? `/(main)/market/business/${slug}` : '/(main)/market/business') as Href;
  }
  if (['store_order', 'order_update'].includes(type)) return '/(main)/market/orders' as Href;
  if (type === 'product' || type === 'store_product') {
    const slug = id(data.productSlug || data.slug);
    if (slug) return `/(main)/market/product/${slug}` as Href;
  }
  if (['wallet', 'wallet_transaction'].includes(type)) return '/(main)/wallet-history' as Href;

  const route = data.route;
  if (
    typeof route === 'string'
    && route.startsWith('/(main)/')
    && !route.includes('..')
    && !route.includes('\\')
    && !route.includes('://')
  ) return route as Href;

  return '/(main)/(tabs)/home' as Href;
};

function AppNavigator() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { sessionReady, token, user } = useAppSelector((state) => state.auth);
  const notificationsEnabled = useAppSelector((state) => state.preferences.notificationsEnabled);
  const cartLoaded = useAppSelector((state) => state.cart.loaded);
  const [startupDataReady, setStartupDataReady] = useState(false);
  const handledNotification = useRef('');
  const [fontsLoaded] = useFonts({
    Poppins: require('../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsMedium: require('../../assets/fonts/Poppins-Medium.ttf'),
    PoppinsSemiBold: require('../../assets/fonts/Poppins-SemiBold.ttf'),
    PoppinsBold: require('../../assets/fonts/Poppins-Bold.ttf'),
    PoppinsExtraBold: require('../../assets/fonts/Poppins-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    void dispatch(loadCart());
    void dispatch(loadPreferences());
    void dispatch(restoreAuthSession());
  }, [dispatch, fontsLoaded]);

  useEffect(() => {
    if (!fontsLoaded || !sessionReady) return;
    let active = true;
    const prepareAccount = async () => {
      if (token) {
        await dispatch(fetchMyAccount(token));
      } else {
        dispatch(clearAccount());
      }
      if (active) setStartupDataReady(true);
    };
    void prepareAccount();
    return () => {
      active = false;
    };
  }, [dispatch, fontsLoaded, sessionReady, token]);

  useEffect(() => {
    if (!sessionReady || !notificationsEnabled || !user?.id) return;
    let active = true;

    void registerPushToken(user.id).catch((error: unknown) => {
      console.error('Push notification registration failed:', error);
      if (!active) return;
      void dispatch(setNotificationsEnabled(false));
      Alert.alert(
        'Notifications unavailable',
        error instanceof Error ? error.message : 'Could not register this device for notifications.'
      );
    });

    return () => {
      active = false;
    };
  }, [dispatch, notificationsEnabled, sessionReady, user?.id]);

  useEffect(() => {
    if (!sessionReady || !startupDataReady) return;
    const openFromNotification = (response: Notifications.NotificationResponse) => {
      const notificationData = response.notification.request.content.data;
      const data = notificationData && typeof notificationData === 'object' ? notificationData : {};
      const responseId = `${response.notification.request.identifier}:${response.actionIdentifier}`;
      if (handledNotification.current === responseId) return;
      handledNotification.current = responseId;
      router.push(getNotificationHref(data));
      void Notifications.clearLastNotificationResponseAsync()
        .catch((error: unknown) => console.error('Could not clear the handled notification response:', error));
    };
    const subscription = Notifications.addNotificationResponseReceivedListener(openFromNotification);
    void Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) openFromNotification(response);
      })
      .catch((error: unknown) => console.error('Could not read the last notification response:', error));
    return () => subscription.remove();
  }, [router, sessionReady, startupDataReady]);

  if (!fontsLoaded || !sessionReady || !startupDataReady || !cartLoaded) {
    return (
      <View style={styles.startup}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(main)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  startup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}