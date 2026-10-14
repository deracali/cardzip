export interface StoreProduct {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  category?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  images?: string[];
  stock?: number;
  tags?: string[];
  isActive?: boolean;
  createdAt?: string;
}

export interface StoreOrderItem {
  product?: string;
  id?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
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
  }>;
  shippingAddress: StoreShippingAddress;
  paymentMethod?: 'wallet' | 'card';
}

export interface StoreOrder {
  _id?: string;
  id?: string;
  orderNumber: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'wallet' | 'card';
  items: StoreOrderItem[];
  shippingAddress: StoreShippingAddress;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt?: string;
}
