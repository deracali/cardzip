import { API_BASE_URL } from './config';

export interface FeatureSettings {
  esimEnabled: boolean;
  vtpassBillsEnabled: boolean;
}

export async function fetchFeatureSettingsApi(): Promise<FeatureSettings> {
  const response = await fetch(`${API_BASE_URL}/api/users/features`, {
    headers: { Accept: 'application/json' },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) {
    throw new Error(result.message || 'Could not load service availability.');
  }
  const settings = result.data;
  if (
    typeof settings?.esimEnabled !== 'boolean'
    || typeof settings?.vtpassBillsEnabled !== 'boolean'
  ) {
    throw new Error('The service availability response was invalid.');
  }
  return settings;
}
