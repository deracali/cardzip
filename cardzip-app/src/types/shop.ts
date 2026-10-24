export type ShopType = 'store' | 'business';
export type ShopStatus = 'pending' | 'approved' | 'rejected';
export type ShopAppointmentStatus = 'available' | 'pending' | 'confirmed' | 'rejected' | 'cancelled';

export interface ShopProfile {
  _id: string;
  shopType: ShopType;
  businessName: string;
  slug: string;
  address: string;
  contactPhone: string;
  description: string;
  bannerImage?: string;
  status?: ShopStatus;
  reviewNote?: string;
}

export interface ShopAppointment {
  _id: string;
  shop: string | Pick<ShopProfile, '_id' | 'businessName' | 'slug' | 'bannerImage'>;
  serviceName: string;
  startsAt: string;
  durationMinutes: number;
  status: ShopAppointmentStatus;
  cancellationReason?: string;
  customer?: { _id: string; name: string; email: string } | null;
}

export interface ShopApplicationPayload {
  shopType: ShopType;
  businessName: string;
  address: string;
  contactPhone: string;
  description?: string;
}

export interface CreateShopAppointmentPayload {
  serviceName: string;
  startsAt: string;
  durationMinutes: number;
}

export interface OwnerShopResponse {
  shop: ShopProfile;
  products: unknown[];
}
