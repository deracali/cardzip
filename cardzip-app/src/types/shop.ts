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

export interface ShopProduct {
  _id: string;
  shop: string;
  name: string;
  slug: string;
  category?: string;
  description: string;
  price: number;
  images: string[];
  imageUrl?: string;
  condition: 'brand_new' | 'used';
  stock: number;
  isActive: boolean;
}

export interface CreateShopProductPayload {
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  condition: 'brand_new' | 'used';
  images: string[];
}

export interface ShopAppointment {
  _id: string;
  shop: string | Pick<ShopProfile, '_id' | 'businessName' | 'slug' | 'bannerImage' | 'address' | 'contactPhone'>;
  serviceName: string;
  startsAt: string;
  durationMinutes: number;
  status: ShopAppointmentStatus;
  requestedAt?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
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
  products: ShopProduct[];
}
