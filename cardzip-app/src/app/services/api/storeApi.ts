import { CreateStoreOrderPayload, StoreOrder, StoreProduct } from '../../types/store';
import { PaginatedList, PaginationInfo } from '../../types/pagination';
import { API_BASE_URL } from './config';

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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body ? String(body.message) : `Request failed (${response.status})`;
    throw new Error(message);
  }

  const payload = (body && typeof body === 'object' && 'data' in body ? body.data : body) as T;
  return payload;
};

export const fetchStoreProductsApi = async (page = 1, limit = 20): Promise<PaginatedList<StoreProduct>> => {
  return requestList<StoreProduct>(`/api/store/products?page=${page}&limit=${limit}`, page, limit);
};

export const fetchStoreProductBySlugApi = async (slug: string): Promise<StoreProduct> => {
  return request<StoreProduct>(`/api/store/products/${encodeURIComponent(slug)}`);
};

export const fetchStoreOrdersApi = async (token: string, page = 1, limit = 20): Promise<PaginatedList<StoreOrder>> => {
  return requestList<StoreOrder>(`/api/store/orders?page=${page}&limit=${limit}`, page, limit, {
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
