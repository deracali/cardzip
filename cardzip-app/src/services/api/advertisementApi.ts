import { API_BASE_URL } from './config';

export interface AdPlacement {
  key: string;
  name: string;
  platform: 'website' | 'app';
  location: string;
  format: 'wide' | 'square' | 'side';
  description: string;
  active: boolean;
  bookable: boolean;
  checkoutAvailable: boolean;
  durationPrices: { months: 1 | 12; price: number }[];
  nextAvailableAt: string;
  checkoutAvailable: boolean;
}

export interface AdCampaign {
  _id: string;
  title: string;
  copy: string;
  imageUrl: string;
  destinationUrl: string;
  placementName: string;
  months: 1 | 12;
  startAt: string;
  endAt: string;
  status: string;
  reviewNote?: string;
  impressions?: number;
  clicks?: number;
  clickThroughRate?: number;
}

const request = async <T>(path: string, token?: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}/api/store${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body ? String(body.message) : `Request failed (${response.status}).`;
    throw new Error(message);
  }
  return body.data as T;
};

export const fetchAdPlacementsApi = async () => request<AdPlacement[]>('/ads/placements');
export const fetchCurrentAdApi = async (key: string) => request<AdCampaign | null>(`/ads/current/${encodeURIComponent(key)}`);
export const trackAdCampaignEventApi = (campaignId: string, eventType: 'impression' | 'click', visitorId: string) => request<void>(`/ads/campaigns/${encodeURIComponent(campaignId)}/events`, undefined, {
  method: 'POST',
  body: JSON.stringify({ eventType, visitorId }),
});
export const createAdCampaignApi = (token: string, body: {
  placementKey: string;
  months: number;
  title: string;
  copy: string;
  imageUrl: string;
  destinationUrl: string;
}) => request<{ campaignId: string; amount: number; startAt: string; endAt: string }>('/ads/campaigns', token, {
  method: 'POST',
  body: JSON.stringify(body),
});
export const uploadAdCreativeApi = (token: string, uri: string, fileName: string, mimeType: string) => {
  const body = new FormData();
  body.append('image', { uri, name: fileName, type: mimeType } as never);
  return request<{ url: string }>('/ads/images', token, { method: 'POST', body });
};
export const fetchMyAdCampaignsApi = (token: string) => request<AdCampaign[]>('/ads/my-campaigns?page=1&limit=20', token);
