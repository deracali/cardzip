import { CommunityListing, CreateStoreOrderPayload, StoreOrder, StoreProduct } from '../../types/store';
import { Platform } from 'react-native';
import { PaginatedList, PaginationInfo } from '../../types/pagination';
import { API_BASE_URL } from './config';
import type { StorefrontPreferences } from '../../services/storePreferences';
import type {
  CreateShopAppointmentPayload,
  OwnerShopResponse,
  ShopAppointment,
  ShopAppointmentStatus,
  ShopApplicationPayload,
  ShopProfile,
} from '../../types/shop';

const defaultPagination = (page: number, limit: number, totalItems: number): PaginationInfo => ({
  page,
  limit,
  totalItems,
  totalPages: Math.ceil(totalItems / limit),
  hasNextPage: false,
  hasPreviousPage: page > 1,
});

const requestList = async <T>(path: string, page: number, limit: number, init?: RequestInit): Promise<PaginatedList<T>> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body
      ? String(body.message)
      : `Request failed (${response.status})`;
    throw new Error(message);
  }

  const items = body && typeof body === 'object' && 'data' in body ? body.data : body;
  const rows = Array.isArray(items) ? items as T[] : [];
  const pagination = body?.pagination as PaginationInfo | undefined;
  return { items: rows, pagination: pagination ?? defaultPagination(page, limit, rows.length) };
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  const headers = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers ?? {}),
  };
  const response = isFormData
    ? await new Promise<Response>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(init?.method ?? 'POST', `${API_BASE_URL}${path}`);
      Object.entries(headers).forEach(([name, value]) => xhr.setRequestHeader(name, String(value)));
      xhr.onload = () => resolve(new Response(xhr.responseText, { status: xhr.status, statusText: xhr.statusText }));
      xhr.onerror = () => reject(new Error('Network error while uploading files.'));
      xhr.ontimeout = () => reject(new Error('File upload timed out.'));
      xhr.timeout = 60000;
      xhr.send(init?.body as XMLHttpRequestBodyInit);
    })
    : await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body ? String(body.message) : `Request failed (${response.status})`;
    throw new Error(message);
  }

  const payload = (body && typeof body === 'object' && 'data' in body ? body.data : body) as T;
  return payload;
};

export const fetchStoreProductsApi = async (
  page = 1,
  limit = 20,
  category = '',
  preferences?: StorefrontPreferences,
  search = '',
): Promise<PaginatedList<StoreProduct>> => {
  const query = new URLSearchParams({ page: String(page), limit: String(limit), sort: 'featured' });
  if (category.trim()) query.set('category', category.trim());
  if (search.trim()) query.set('search', search.trim().slice(0, 100));
  if (preferences) query.set('preferences', JSON.stringify(preferences));
  return requestList<StoreProduct>(`/api/store/products?${query.toString()}`, page, limit);
};

export const fetchDigitalProductsApi = async (
  productType: 'website' | 'app' | 'ios_app' | 'all' = 'all',
  search = '',
  preferences?: StorefrontPreferences,
): Promise<StoreProduct[]> => {
  const types = productType === 'all' ? ['website', 'app', 'ios_app'] : [productType];
  const results = await Promise.all(types.map((type) => {
    const query = new URLSearchParams({ productType: type, page: '1', limit: '50', sort: 'featured' });
    if (search.trim()) query.set('search', search.trim().slice(0, 100));
    if (preferences) query.set('preferences', JSON.stringify(preferences));
    return requestList<StoreProduct>(`/api/store/products?${query.toString()}`, 1, 50);
  }));
  return results.flatMap((result) => result.items).sort(
    (left, right) => Number(Boolean(right.isPromoted)) - Number(Boolean(left.isPromoted))
      || new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime(),
  );
};

export const fetchStoreProductBySlugApi = async (slug: string): Promise<StoreProduct> => {
  return request<StoreProduct>(`/api/store/products/${encodeURIComponent(slug)}`);
};

export interface CreateSellerDigitalAssetPayload {
  name: string;
  productType: 'website' | 'app' | 'ios_app';
  category: string;
  description: string;
  price: number;
  sellerContact: string;
  sourceCodeUrl: string;
  websiteUrl?: string;
  apkUrl?: string;
  iosAppUrl?: string;
  screenshots: string[];
}

export interface SellerDigitalAssetSubmission {
  _id: string;
  name: string;
  productType: 'website' | 'app' | 'ios_app';
  price: number;
  sellerListingStatus: 'pending_review' | 'approved' | 'rejected';
  sellerReviewNote?: string;
  createdAt?: string;
}

export const uploadSellerDigitalAssetImageApi = async (
  token: string,
  photo: { uri: string; fileName?: string | null; mimeType?: string | null },
): Promise<string> => {
  const body = new FormData();
  const type = photo.mimeType || 'image/jpeg';
  body.append('image', {
    uri: photo.uri,
    name: photo.fileName || `digital-asset.${type.split('/')[1] || 'jpg'}`,
    type,
  } as never);
  const result = await request<{ url: string }>('/api/store/digital-assets/images', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  return result.url;
};

export const uploadSellerDigitalAssetSourceCodeApi = async (
  token: string,
  file: { uri: string; name: string; mimeType?: string | null },
): Promise<string> => {
  const body = new FormData();
  body.append('sourceCode', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'application/zip',
  } as never);
  const result = await request<{ sourceCodeUrl: string }>('/api/store/digital-assets/source-code', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  return result.sourceCodeUrl;
};

export const createSellerDigitalAssetApi = async (
  token: string,
  payload: CreateSellerDigitalAssetPayload,
): Promise<SellerDigitalAssetSubmission> => request<SellerDigitalAssetSubmission>('/api/store/digital-assets', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify(payload),
});

export const fetchMyDigitalAssetsApi = async (token: string): Promise<SellerDigitalAssetSubmission[]> => request<SellerDigitalAssetSubmission[]>('/api/store/digital-assets/mine', {
  headers: { Authorization: `Bearer ${token}` },
});

export const fetchCommunityListingsApi = async (
  page = 1,
  limit = 40,
  preferences?: StorefrontPreferences,
): Promise<PaginatedList<CommunityListing>> => {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (preferences) query.set('preferences', JSON.stringify(preferences));
  return requestList<CommunityListing>(`/api/community-market/listings?${query.toString()}`, page, limit);
};

export interface CommunityPromotionPerformance {
  _id: string;
  targetName: string;
  status: string;
  startsAt?: string;
  endsAt?: string;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
}

export const fetchMyCommunityPromotionsApi = async (token: string): Promise<CommunityPromotionPerformance[]> => request<CommunityPromotionPerformance[]>('/api/community-market/promotions/mine', {
  headers: { Authorization: `Bearer ${token}` },
});

export const fetchMyCommunityListingsApi = async (token: string, page = 1, limit = 50): Promise<PaginatedList<CommunityListing>> => {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  return requestList<CommunityListing>(`/api/community-market/listings/mine?${query.toString()}`, page, limit, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export interface CommunityConversation {
  _id: string;
  listing: CommunityListing | null;
  buyer: { _id: string; name: string; profileImage?: string } | null;
  seller: { _id: string; name: string; profileImage?: string } | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount?: number;
}

export interface CommunityMessage {
  _id: string;
  conversation: string;
  sender: { _id: string; name: string; profileImage?: string } | null;
  body: string;
  createdAt: string;
}

export const fetchCommunityConversationsApi = async (token: string): Promise<CommunityConversation[]> => request<CommunityConversation[]>('/api/community-market/conversations', {
  headers: { Authorization: `Bearer ${token}` },
});

export const markCommunityConversationReadApi = async (token: string, conversationId: string): Promise<void> => request<void>(`/api/community-market/conversations/${encodeURIComponent(conversationId)}/read`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
});

export const startCommunityConversationApi = async (token: string, listingId: string): Promise<CommunityConversation> => request<CommunityConversation>('/api/community-market/conversations', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ listingId }),
});

export const fetchCommunityMessagesApi = async (token: string, conversationId: string): Promise<{ conversation: CommunityConversation; messages: CommunityMessage[] }> => request<{ conversation: CommunityConversation; messages: CommunityMessage[] }>(`/api/community-market/conversations/${encodeURIComponent(conversationId)}/messages`, {
  headers: { Authorization: `Bearer ${token}` },
});

export const sendCommunityMessageApi = async (token: string, conversationId: string, body: string): Promise<CommunityMessage> => request<CommunityMessage>(`/api/community-market/conversations/${encodeURIComponent(conversationId)}/messages`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ body }),
});

export const trackCommunityPromotionEventApi = (targetId: string, targetType: 'community_listing' | 'digital_asset', eventType: 'impression' | 'click', visitorId: string) => request<void>('/api/community-market/promotions/events', {
  method: 'POST',
  body: JSON.stringify({ targetId, targetType, eventType, visitorId }),
});

export const fetchCommunityListingApi = async (id: string): Promise<CommunityListing> => {
  return request<CommunityListing>(`/api/community-market/listings/${encodeURIComponent(id)}`);
};

export const fetchRelatedCommunityListingsApi = async (id: string): Promise<CommunityListing[]> => {
  return request<CommunityListing[]>(`/api/community-market/listings/${encodeURIComponent(id)}/related`);
};

export const fetchShopsApi = async (page = 1, limit = 50): Promise<PaginatedList<ShopProfile>> => {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  return requestList<ShopProfile>(`/api/store/shops?${query.toString()}`, page, limit);
};

export const fetchShopApi = async (slug: string): Promise<ShopProfile> =>
  request<ShopProfile>(`/api/store/shops/${encodeURIComponent(slug)}`);

export const fetchMyShopApi = async (token: string): Promise<OwnerShopResponse | null> =>
  request<OwnerShopResponse | null>('/api/store/my-shop', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createShopApi = async (
  token: string,
  payload: ShopApplicationPayload,
  banner?: { uri: string; fileName?: string | null; mimeType?: string | null },
): Promise<OwnerShopResponse> => {
  const body = new FormData();
  body.append('shopType', payload.shopType);
  body.append('businessName', payload.businessName);
  body.append('address', payload.address);
  body.append('contactPhone', payload.contactPhone);
  body.append('description', payload.description || '');
  if (banner) {
    const mimeType = banner.mimeType || 'image/jpeg';
    body.append('banner', {
      uri: banner.uri,
      name: banner.fileName || `shop-banner.${mimeType.split('/')[1] || 'jpg'}`,
      type: mimeType,
    } as never);
  }
  return request<OwnerShopResponse>('/api/store/shops', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
};

export const fetchShopAppointmentsApi = async (slug: string): Promise<ShopAppointment[]> =>
  request<ShopAppointment[]>(`/api/store/shops/${encodeURIComponent(slug)}/appointments`);

export const fetchMyShopAppointmentsApi = async (token: string): Promise<ShopAppointment[]> =>
  request<ShopAppointment[]>('/api/store/my-shop/appointments', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchMyBookedShopAppointmentsApi = async (token: string): Promise<ShopAppointment[]> =>
  request<ShopAppointment[]>('/api/store/my-shop/bookings', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createShopAppointmentApi = async (
  token: string,
  payload: CreateShopAppointmentPayload,
): Promise<ShopAppointment> => request<ShopAppointment>('/api/store/my-shop/appointments', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify(payload),
});

export const bookShopAppointmentApi = async (
  token: string,
  slug: string,
  appointmentId: string,
): Promise<ShopAppointment> => request<ShopAppointment>(
  `/api/store/shops/${encodeURIComponent(slug)}/appointments/${encodeURIComponent(appointmentId)}/book`,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  },
);

export const updateShopAppointmentApi = async (
  token: string,
  appointmentId: string,
  status: Extract<ShopAppointmentStatus, 'confirmed' | 'rejected' | 'cancelled'>,
  cancellationReason = '',
): Promise<ShopAppointment> => request<ShopAppointment>(
  `/api/store/my-shop/appointments/${encodeURIComponent(appointmentId)}`,
  {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status, cancellationReason }),
  },
);

export const deleteShopAppointmentApi = async (token: string, appointmentId: string): Promise<void> =>
  request<void>(`/api/store/my-shop/appointments/${encodeURIComponent(appointmentId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

export interface CommunityPromotionDuration {
  key: 'day' | 'week' | 'month';
  label: string;
  days: 1 | 7 | 30;
  price: number;
}

export const fetchCommunityPromotionPricingApi = async (): Promise<CommunityPromotionDuration[]> => {
  return request<CommunityPromotionDuration[]>('/api/community-market/promotions/pricing');
};

type NativeFilePart = { uri: string; name: string; type: string };
type NativeMultipartFormData = FormData & {
  append(name: string, value: string | Blob | NativeFilePart, fileName?: string): void;
};

const createCommunityListingFormData = async (
  payload: Pick<CommunityListing, 'title' | 'category' | 'description' | 'price' | 'condition' | 'isSold' | 'phone'>,
  photos: { uri: string; fileName?: string | null; mimeType?: string | null }[],
): Promise<FormData> => {
  const body = new FormData() as NativeMultipartFormData;
  body.append('title', payload.title);
  body.append('category', payload.category);
  body.append('description', payload.description);
  body.append('price', String(payload.price));
  body.append('condition', payload.condition);
  body.append('isSold', String(payload.isSold));
  body.append('phone', payload.phone);
  for (const [index, photo] of photos.entries()) {
    const type = photo.mimeType || 'image/jpeg';
    const name = photo.fileName || `community-${index + 1}.${type.split('/')[1] || 'jpg'}`;
    if (Platform.OS === 'web') {
      const imageResponse = await fetch(photo.uri);
      if (!imageResponse.ok) throw new Error(`Could not read selected photo ${index + 1}.`);
      body.append('images', await imageResponse.blob(), name);
    } else {
      body.append('images', { uri: photo.uri, name, type });
    }
  }
  return body;
};

export const createCommunityListingApi = async (
  token: string,
  payload: Pick<CommunityListing, 'title' | 'category' | 'description' | 'price' | 'condition' | 'isSold' | 'phone'>,
  photos: { uri: string; fileName?: string | null; mimeType?: string | null }[],
): Promise<CommunityListing> => {
  const body = await createCommunityListingFormData(payload, photos);
  return request<CommunityListing>('/api/community-market/listings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
};

export const updateCommunityListingApi = async (
  token: string,
  id: string,
  payload: Pick<CommunityListing, 'title' | 'category' | 'description' | 'price' | 'condition' | 'isSold' | 'phone'>,
  photos: { uri: string; fileName?: string | null; mimeType?: string | null }[],
): Promise<CommunityListing> => {
  const body = await createCommunityListingFormData(payload, photos);
  return request<CommunityListing>(`/api/community-market/listings/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
};

export const deleteCommunityListingApi = async (token: string, id: string): Promise<{ refundedAmount: number }> => {
  return request<{ refundedAmount: number }>(`/api/community-market/listings/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateCommunityListingSoldApi = async (token: string, id: string, isSold: boolean): Promise<CommunityListing> => {
  return request<CommunityListing>(`/api/community-market/listings/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ isSold }),
  });
};

export const fetchStoreOrdersApi = async (token: string, page = 1, limit = 20): Promise<PaginatedList<StoreOrder>> => {
  return requestList<StoreOrder>(`/api/store/orders?page=${page}&limit=${limit}`, page, limit, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchStoreOrderApi = async (token: string, orderNumber: string): Promise<StoreOrder> => {
  return request<StoreOrder>(`/api/store/orders/${encodeURIComponent(orderNumber)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createStoreOrderApi = async (token: string, payload: CreateStoreOrderPayload): Promise<StoreOrder> => {
  return request<StoreOrder>(`/api/store/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
};
