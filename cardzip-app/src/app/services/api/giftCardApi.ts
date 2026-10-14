import {
	CreateGiftCardTradePayload,
	FetchGiftCardTradesArgs,
	GiftCard,
	GiftCardRate,
	GiftCardTrade,
	FetchGiftCardsArgs,
} from '../../types/giftCard';
import { PaginatedList, PaginationInfo } from '../../types/pagination';
import { API_BASE_URL } from './config';

type ApiRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is ApiRecord =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const asNumber = (value: unknown): number | undefined => {
	const number = typeof value === 'number' ? value : Number(value);
	return Number.isFinite(number) ? number : undefined;
};

const request = async (path: string, init?: RequestInit): Promise<unknown> => {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		...init,
		headers: { 'Content-Type': 'application/json', ...init?.headers },
	});
	const body: unknown = await response.json().catch(() => null);
	if (!response.ok) {
		const record = isRecord(body) ? body : {};
		throw new Error(String(record.error ?? record.message ?? `Request failed (${response.status})`));
	}
	return body;
};

const listFrom = (payload: unknown): ApiRecord[] => {
	if (Array.isArray(payload)) return payload.filter(isRecord);
	if (!isRecord(payload)) return [];
	return Array.isArray(payload.data) ? payload.data.filter(isRecord) : [];
};

const paginationFrom = (payload: unknown, page: number, limit: number, totalItems: number): PaginationInfo => {
	const record = isRecord(payload) && isRecord(payload.pagination) ? payload.pagination : null;
	if (!record) {
		return { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit), hasNextPage: false, hasPreviousPage: page > 1 };
	}
	return {
		page: asNumber(record.page) ?? page,
		limit: asNumber(record.limit) ?? limit,
		totalItems: asNumber(record.totalItems) ?? totalItems,
		totalPages: asNumber(record.totalPages) ?? Math.ceil(totalItems / limit),
		hasNextPage: Boolean(record.hasNextPage),
		hasPreviousPage: Boolean(record.hasPreviousPage),
	};
};

const mapGiftCardRate = (value: unknown): GiftCardRate | null => {
	if (!isRecord(value)) return null;
	const rate = asNumber(value.rate);
	if (rate === undefined) return null;
	return {
		country: String(value.country ?? ''),
		rate,
		currency: String(value.currency ?? 'USD'),
	};
};

const mapGiftCard = (record: ApiRecord): GiftCard => ({
	id: String(record._id ?? record.id ?? ''),
	name: String(record.name ?? ''),
	category: String(record.category ?? 'Gift Card'),
	discount: typeof record.discount === 'string' ? record.discount : undefined,
	logo: typeof record.logo === 'string'
		? record.logo
		: typeof record.logoUrl === 'string'
			? record.logoUrl
			: typeof record.imageUrl === 'string' ? record.imageUrl : undefined,
	color: String(record.color ?? '#FF9900'),
	popular: Boolean(record.popular),
	cardLimit: asNumber(record.cardLimit) ?? 0,
	types: Array.isArray(record.types)
		? record.types.map(mapGiftCardRate).filter((rate): rate is GiftCardRate => rate !== null)
		: [],
});

const mapGiftCardTrade = (record: ApiRecord): GiftCardTrade => ({
	id: String(record._id ?? record.id ?? ''),
	type: String(record.type ?? 'Gift card'),
	amount: asNumber(record.amount) ?? 0,
	currency: String(record.currency ?? 'USD'),
	ngnAmount: asNumber(record.ngnAmount) ?? null,
	exchangeRate: asNumber(record.exchangeRate) ?? null,
	status: String(record.status ?? 'pending'),
	createdAt: String(record.createdAt ?? ''),
});

export const fetchGiftCardsApi = async ({ page = 1, limit = 15 }: FetchGiftCardsArgs = {}): Promise<PaginatedList<GiftCard>> => {
	const safeLimit = Math.min(50, Math.max(1, limit));
	const payload = await request(`/api/cards/get?page=${page}&limit=${safeLimit}`);
	const items = listFrom(payload).map(mapGiftCard);
	return { items, pagination: paginationFrom(payload, page, safeLimit, items.length) };
};

export const fetchGiftCardTradesApi = async ({ token, page = 1, limit = 15 }: FetchGiftCardTradesArgs): Promise<PaginatedList<GiftCardTrade>> => {
	if (!token) {
		const pagination = paginationFrom(null, page, limit, 0);
		return { items: [], pagination };
	}
	const query = new URLSearchParams({ page: String(page), limit: String(Math.min(50, Math.max(1, limit))) });
	const payload = await request(`/api/gift-cards/get?${query.toString()}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	const items = listFrom(payload).map(mapGiftCardTrade);
	return { items, pagination: paginationFrom(payload, page, limit, items.length) };
};

export const createGiftCardTradeApi = async (payload: CreateGiftCardTradePayload): Promise<GiftCardTrade> => {
	const formData = new FormData();
	formData.append('type', payload.type);
	formData.append('amount', String(payload.amount));
	formData.append('currency', payload.currency);
	if (payload.catalogCardId) formData.append('catalogCardId', payload.catalogCardId);
	if (payload.region) formData.append('region', payload.region);
	if (payload.ngnAmount !== undefined) formData.append('ngnAmount', String(payload.ngnAmount));
	if (payload.exchangeRate !== undefined) formData.append('exchangeRate', String(payload.exchangeRate));
	if (payload.tradeSpeed) formData.append('tradeSpeed', payload.tradeSpeed);
	(payload.images ?? []).forEach((image, index) => {
		const file = {
			uri: image.uri,
			name: image.fileName || `gift-card-${index + 1}.jpg`,
			type: image.mimeType || 'image/jpeg',
		} as unknown as Blob;
		formData.append('images', file);
	});

	const response = await fetch(`${API_BASE_URL}/api/gift-cards/submit`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${payload.token}` },
		body: formData,
	});
	const responseBody: unknown = await response.json().catch(() => null);
	if (!response.ok) {
		const record = isRecord(responseBody) ? responseBody : {};
		throw new Error(String(record.error ?? record.message ?? `Request failed (${response.status})`));
	}
	const record = isRecord(responseBody) && isRecord(responseBody.giftCard) ? responseBody.giftCard : {};
	return mapGiftCardTrade(record);
};
