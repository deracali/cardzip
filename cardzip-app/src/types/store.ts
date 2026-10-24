export interface StoreProduct {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  category?: string;
  productType?: 'product' | 'website' | 'app' | 'ios_app';
  description?: string;
  expectedDelivery?: string;
  keyHighlights?: string[];
  specifications?: Array<{ label: string; value: string }>;
  packagingDetails?: string;
  price: number;
  websiteUrl?: string;
  apkUrl?: string;
  iosAppUrl?: string;
  isSellerListing?: boolean;
  sellerListingStatus?: 'pending_review' | 'approved' | 'rejected';
  isPromoted?: boolean;
  sourceCodeUrl?: string;
  sellerContact?: string;
  screenshots?: string[];
  usageInstructions?: string;
  usePrice?: number;
  templatePrice?: number;
  compareAtPrice?: number;
  discountPercent?: number;
  condition?: 'brand_new' | 'used';
  isSold?: boolean;
  image?: string;
  images?: string[];
  colors?: string[];
  stock?: number;
  tags?: string[];
  isActive?: boolean;
  createdAt?: string;
}

export interface CommunityListing {
  _id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  condition: 'brand_new' | 'used';
  isSold: boolean;
  phone: string;
  sellerId: string;
  sellerImage?: string;
  imageUrl?: string;
  images?: string[];
  isPromoted?: boolean;
  isDigitalAsset?: boolean;
  productType?: 'website' | 'app' | 'ios_app';
  slug?: string;
  promotionExpiresAt?: string | null;
  sellerName: string;
  createdAt?: string;
}

export interface StoreOrderItem {
  product?: string;
  id?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedColor?: string;
}

export interface StoreShippingAddress {
  name: string;
  phone: string;
  address: string;
  state: string;
}

export interface CreateStoreOrderPayload {
  items: Array<{
    productId?: string;
    id?: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    selectedColor?: string;
  }>;
  shippingAddress: StoreShippingAddress;
  paymentMethod?: 'wallet' | 'card';
}

export interface StoreOrder {
  _id?: string;
  id?: string;
  orderNumber: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'wallet' | 'paystack';
  paymentStatus: 'pending' | 'paid' | 'failed';
  items: StoreOrderItem[];
  shippingAddress: StoreShippingAddress;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt?: string;
  cancellationReason?: string;
  courierService?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string | null;
}
