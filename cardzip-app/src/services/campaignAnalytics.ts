import AsyncStorage from '@react-native-async-storage/async-storage';

const VISITOR_ID_KEY = 'cardzip.campaign-analytics-visitor';

export const getCampaignAnalyticsVisitorId = async (): Promise<string> => {
  const storedId = await AsyncStorage.getItem(VISITOR_ID_KEY);
  if (storedId) return storedId;
  const visitorId = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  await AsyncStorage.setItem(VISITOR_ID_KEY, visitorId);
  return visitorId;
};
