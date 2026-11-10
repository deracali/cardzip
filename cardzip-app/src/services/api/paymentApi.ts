import { API_BASE_URL } from './config';
import * as FileSystem from 'expo-file-system/legacy';
import { CreateStoreOrderPayload, StoreOrder } from '../../types/store';
import type { AdCampaign } from './advertisementApi';

interface PaystackInitialization {
  reference: string;
  authorizationUrl: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
}

interface PaystackVerification {
  status: 'completed';
  balance?: number;
  currency?: string;
}

interface StorePaystackVerification {
  status: 'completed';
  order: StoreOrder;
}

interface BannerAdPaystackVerification {
  status: 'completed';
  campaign: AdCampaign;
}

export interface CommunityPromotionPaystackVerification {
  status: 'completed';
  promotion: {
    _id: string;
    targetType?: 'community_listing' | 'digital_asset';
    listing?: string | null;
    digitalAsset?: string | null;
    status: 'pending_review' | 'active' | 'rejected';
    duration: 'day' | 'week' | 'month';
    durationDays: number;
  };
}

export interface DigitalProductPaystackVerification {
  status: 'completed';
  digitalProduct: {
    productId: string;
    productName: string;
    productType: 'website' | 'app' | 'ios_app' | 'full_stack' | 'admin';
    purchaseType: 'use' | 'template';
    accessUrl?: string;
    sourceCodeAvailable?: boolean;
    templateSourceCodeAvailable?: boolean;
    sourceCodeUrl?: string;
    documents: { name: string; mimeType: string }[];
    templateDocuments?: { name: string; mimeType: string }[];
  };
}

export interface SellerDigitalAssetPaystackVerification {
  status: 'completed';
  sellerDigitalAsset: {
    productId: string;
    productName: string;
    productType: 'website' | 'app' | 'ios_app' | 'full_stack' | 'admin';
    purchaseType: 'use' | 'template';
    amount: number;
    sellerShare: number;
    companyShare: number;
    screenshots: string[];
    websiteUrl?: string;
    apkUrl?: string;
    iosAppUrl?: string;
    accessUrl?: string;
    sourceCodeAvailable: boolean;
    documents?: { name: string; mimeType: string }[];
    templateDocuments?: { name: string; mimeType: string }[];
  };
}

export interface DigitalProductPaymentHistoryItem {
  reference: string;
  status: 'pending' | 'completed';
  purpose: 'digital_product' | 'seller_digital_asset';
  purchaseType: 'use' | 'template';
}

const paymentRequest = async <T>(token: string, path: string, body: Record<string, unknown>): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}/api/payments/paystack/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'message' in result
      ? String(result.message)
      : `Paystack request failed (${response.status}).`;
    throw new Error(message);
  }
  if (result && typeof result === 'object' && 'data' in result) return result.data as T;
  throw new Error('The payment server returned an invalid response.');
};

export const initializeWalletFundingApi = (
  token: string,
  amount: number,
  callbackUrl: string,
): Promise<PaystackInitialization> => paymentRequest(token, 'initialize', {
  amount,
  purpose: 'wallet_funding',
  callbackUrl,
});

export const verifyWalletFundingApi = (token: string, reference: string): Promise<PaystackVerification> => (
  paymentRequest(token, 'verify', { reference })
);

export const initializeStorePaymentApi = (
  token: string,
  payload: CreateStoreOrderPayload,
  callbackUrl: string,
): Promise<PaystackInitialization> => paymentRequest(token, 'initialize', {
  items: payload.items,
  shippingAddress: payload.shippingAddress,
  purpose: 'store_order',
  callbackUrl,
});

export const verifyStorePaymentApi = (token: string, reference: string): Promise<StorePaystackVerification> => (
  paymentRequest(token, 'verify', { reference })
);

export const initializeBannerAdPaymentApi = (
  token: string,
  campaignId: string,
  callbackUrl: string,
): Promise<PaystackInitialization> => paymentRequest(token, 'initialize', {
  purpose: 'banner_ad',
  campaignId,
  callbackUrl,
});

export const verifyBannerAdPaymentApi = (token: string, reference: string): Promise<BannerAdPaystackVerification> => (
  paymentRequest(token, 'verify', { reference })
);

export const initializeCommunityPromotionPaymentApi = (
  token: string,
  listingId: string,
  duration: 'day' | 'week' | 'month',
  callbackUrl: string,
): Promise<PaystackInitialization> => paymentRequest(token, 'initialize', {
  purpose: 'community_promotion',
  listingId,
  duration,
  callbackUrl,
});

export const initializeDigitalAssetPromotionPaymentApi = (
  token: string,
  digitalAssetId: string,
  duration: 'day' | 'week' | 'month',
  callbackUrl: string,
): Promise<PaystackInitialization> => paymentRequest(token, 'initialize', {
  purpose: 'community_promotion',
  digitalAssetId,
  duration,
  callbackUrl,
});

export const verifyCommunityPromotionPaymentApi = (
  token: string,
  reference: string,
): Promise<CommunityPromotionPaystackVerification> => paymentRequest(token, 'verify', { reference });

export const initializeDigitalProductPaymentApi = (
  token: string,
  productId: string,
  purchaseType: 'use' | 'template',
  callbackUrl: string,
): Promise<PaystackInitialization> => paymentRequest(token, 'initialize', {
  purpose: 'digital_product',
  productId,
  purchaseType,
  callbackUrl,
});

export const verifyDigitalProductPaymentApi = (
  token: string,
  reference: string,
): Promise<DigitalProductPaystackVerification> => paymentRequest(token, 'verify', { reference });

export const initializeSellerDigitalAssetPaymentApi = (
  token: string,
  productId: string,
  purchaseType: 'use' | 'template',
  callbackUrl: string,
): Promise<PaystackInitialization> => paymentRequest(token, 'initialize', {
  purpose: 'seller_digital_asset',
  productId,
  purchaseType,
  callbackUrl,
});

export const verifySellerDigitalAssetPaymentApi = (
  token: string,
  reference: string,
): Promise<SellerDigitalAssetPaystackVerification> => paymentRequest(token, 'verify', { reference });

export const fetchMyDigitalProductPaymentsApi = async (
  token: string,
  productId: string,
): Promise<DigitalProductPaymentHistoryItem[]> => {
  const response = await fetch(`${API_BASE_URL}/api/payments/digital-products/${encodeURIComponent(productId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'message' in result
      ? String(result.message)
      : `Could not load purchases (${response.status}).`;
    throw new Error(message);
  }
  return result && typeof result === 'object' && Array.isArray(result.data)
    ? result.data as DigitalProductPaymentHistoryItem[]
    : [];
};

export const downloadDigitalProductFileApi = async (
  token: string,
  productId: string,
  fileType: 'rental-source-code' | 'template-source-code' | 'document' | 'template-document',
  documentIndex: number,
  reference: string,
  filename: string,
): Promise<string> => {
  if (!reference) throw new Error('The verified payment reference is missing. Return to this product and check your purchase.');
  if (!FileSystem.cacheDirectory) throw new Error('Device file storage is unavailable.');
  const safeFilename = filename.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').slice(0, 180) || 'cardzip-download';
  const url = `${API_BASE_URL}/payments/digital-products/${encodeURIComponent(productId)}/download/${encodeURIComponent(fileType)}/${documentIndex}`;
  const result = await FileSystem.downloadAsync(url, `${FileSystem.cacheDirectory}${Date.now()}-${safeFilename}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Payment-Reference': reference,
    },
  });
  if (result.status !== 200) {
    let message = `Could not download this file (${result.status}).`;
    try {
      const body = await FileSystem.readAsStringAsync(result.uri);
      const payload = JSON.parse(body);
      if (typeof payload?.message === 'string') message = payload.message;
    } catch {
      // The response body may not be JSON.
    } finally {
      await FileSystem.deleteAsync(result.uri, { idempotent: true });
    }
    throw new Error(message);
  }
  return result.uri;
};
