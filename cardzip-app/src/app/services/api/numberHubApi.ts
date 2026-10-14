import { API_BASE_URL } from './config';

type ApiRecord = Record<string, unknown>;

export class NumberHubApiError extends Error {
	status: number;
	data: unknown;

	constructor(message: string, status: number, data: unknown) {
		super(message);
		this.name = 'NumberHubApiError';
		this.status = status;
		this.data = data;
	}
}

export interface NumberHubOption {
	value: string;
	label: string;
	code?: string;
	available?: number;
}

export interface RentalDuration {
	value: string;
	label: string;
	time: number;
	duration?: string;
	price?: number;
}

export interface RentalPricing {
	price: number;
	originalPrice?: number;
	currency?: string;
}

export interface RentalProfile {
	id: string;
	phoneNumber: string;
	appName: string;
	area: string;
	status: string;
	expiresAt: string;
	autoRenew: boolean;
}

export interface SmsMessage {
	id: string;
	appName: string;
	phoneNumber: string;
	message: string;
	receivedAt: string;
}

const RENTAL_API = `${API_BASE_URL}/api/rent/sms4`;

const isRecord = (value: unknown): value is ApiRecord =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const getString = (record: ApiRecord, keys: string[], fallback = ''): string => {
	for (const key of keys) {
		const value = record[key];
		if (typeof value === 'string' || typeof value === 'number') return String(value);
	}
	return fallback;
};

const getNumber = (record: ApiRecord, keys: string[]): number | undefined => {
	for (const key of keys) {
		const value = record[key];
		if (value === null || value === undefined || value === '') continue;
		const number = typeof value === 'number' ? value : Number(value);
		if (Number.isFinite(number)) return number;
	}
	return undefined;
};

const durationInMonths = (duration: string): number => {
	const amount = Number.parseFloat(duration);
	if (!Number.isFinite(amount) || amount <= 0) return 1;
	if (/year|yr|\by\b/i.test(duration)) return Math.min(12, Math.round(amount * 12));
	if (/day|\bd\b/i.test(duration)) return Math.max(1, Math.round(amount / 30));
	return Math.min(12, Math.max(1, Math.round(amount)));
};

const getBoolean = (record: ApiRecord, keys: string[]): boolean => {
	for (const key of keys) {
		const value = record[key];
		if (typeof value === 'boolean') return value;
		if (value === 1 || value === '1' || value === 'true') return true;
	}
	return false;
};

const recordsFrom = (payload: unknown, keys: string[]): ApiRecord[] => {
	if (Array.isArray(payload)) return payload.filter(isRecord);
	if (!isRecord(payload)) return [];
	for (const key of keys) {
		const value = payload[key];
		if (Array.isArray(value)) return value.filter(isRecord);
	}
	return recordsFrom(payload.data, keys);
};

const cleanServiceName = (name: string): string => {
	const cleaned = name.replace(/^\d+/, '').replace(/[_-]+/g, ' ').trim();
	const knownNames: Record<string, string> = {
		whatsapp: 'WhatsApp', telegram: 'Telegram', google: 'Google', razorpay: 'Razorpay',
		walmart: 'Walmart', woocommerce: 'WooCommerce', tiktok: 'TikTok', facebook: 'Facebook',
		instagram: 'Instagram', amazon: 'Amazon', apple: 'Apple', microsoft: 'Microsoft',
		discord: 'Discord', opay: 'OPay', palmpay: 'PalmPay', moniepoint: 'Moniepoint',
		paystack: 'Paystack', flutterwave: 'Flutterwave', jumia: 'Jumia', konga: 'Konga',
		bolt: 'Bolt', uber: 'Uber',
	};
	return knownNames[cleaned.toLowerCase().replace(/\s+/g, '')]
		?? cleaned.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const serviceEntriesFrom = (payload: unknown): string[] => {
	if (Array.isArray(payload)) {
		return payload.flatMap((entry) => {
			if (typeof entry === 'string' || typeof entry === 'number') return [String(entry)];
			if (!isRecord(entry)) return [];
			const name = getString(entry, ['appName', 'name', 'app', 'service', 'label']);
			return name ? [name] : Object.entries(entry).flatMap(([key, value]) =>
				/^\d+$/.test(key) && typeof value === 'string' ? [value] : serviceEntriesFrom(value));
		});
	}
	if (!isRecord(payload)) return [];
	for (const key of ['apps', 'services', 'allservices', 'data', 'items']) {
		if (payload[key] !== undefined) {
			const found = serviceEntriesFrom(payload[key]);
			if (found.length) return found;
		}
	}
	const directName = getString(payload, ['appName', 'name', 'app', 'service', 'label']);
	if (directName) return [directName];
	return Object.entries(payload).flatMap(([key, value]) =>
		/^\d+$/.test(key) && typeof value === 'string' ? [value] : serviceEntriesFrom(value));
};

const request = async <T>(path: string, init?: RequestInit, token?: string): Promise<T> => {
	const response = await fetch(`${RENTAL_API}${path}`, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...init?.headers,
		},
	});
	const payload: unknown = await response.json().catch(() => null);
	if (!response.ok) {
		const record = isRecord(payload) ? payload : {};
		throw new NumberHubApiError(
			getString(record, ['error', 'message'], `Request failed (${response.status})`),
			response.status,
			record.data,
		);
	}
	return payload as T;
};

const toOptions = (payload: unknown, keys: string[], nameKeys: string[], codeKeys: string[]): NumberHubOption[] =>
	recordsFrom(payload, keys).map((record, index) => {
		const value = getString(record, [...nameKeys, ...codeKeys, 'id'], String(index));
		return {
			value,
			label: getString(record, ['label', 'name', 'countryName', 'areaName', 'appName', 'service'], value),
			code: getString(record, codeKeys) || undefined,
			available: getNumber(record, ['available', 'stock', 'count', 'numbersAvailable']),
		};
	});

export const fetchRentalAreas = async (): Promise<NumberHubOption[]> =>
	toOptions(await request<unknown>('/areas'), ['areas', 'locations', 'data'], ['name', 'area', 'areaName', 'country'], ['code', 'countryCode', 'areaCode']);

export const fetchRentalApps = async (): Promise<NumberHubOption[]> => {
	const entries = serviceEntriesFrom(await request<unknown>('/apps'))
		.map((entry) => entry.trim())
		.filter((entry) => entry && !/^(allservices|\d+allservices)$/i.test(entry) && !/^\d{2,}/.test(entry));
	const uniqueEntries = [...new Map(entries.map((entry) => [entry.toLowerCase(), entry])).values()];
	const preferred = ['whatsapp', 'telegram', 'google', 'razorpay', 'opay', 'palmpay', 'moniepoint', 'paystack', 'flutterwave', 'walmart', 'woocommerce', 'jumia', 'konga', 'amazon', 'facebook', 'instagram', 'tiktok', 'bolt', 'uber'];
	uniqueEntries.sort((first, second) => {
		const firstIndex = preferred.indexOf(cleanServiceName(first).toLowerCase());
		const secondIndex = preferred.indexOf(cleanServiceName(second).toLowerCase());
		return (firstIndex < 0 ? Number.MAX_SAFE_INTEGER : firstIndex) - (secondIndex < 0 ? Number.MAX_SAFE_INTEGER : secondIndex);
	});
	return uniqueEntries.map((entry) => ({ value: entry.toLowerCase(), label: cleanServiceName(entry) }));
};

export const fetchRentalDurations = async (appName: string): Promise<RentalDuration[]> => {
	const payload = await request<unknown>(`/durations?appName=${encodeURIComponent(appName)}`);
	const records = recordsFrom(payload, ['durations', 'data', 'items']);
	const envelope = isRecord(payload) && isRecord(payload.data) ? payload.data : payload;
	if (records.length === 0 && isRecord(envelope) && getString(envelope, ['duration'])) records.push(envelope);
	return records.map((record, index) => {
		const durationValue = getString(record, ['duration', 'value', 'label', 'name'], String(index + 1));
		const parsedTime = getNumber(record, ['time', 'duration_months', 'months', 'durationMonths', 'value']);
		const time = parsedTime && parsedTime > 0 ? parsedTime : durationInMonths(durationValue);
		const label = durationValue === 'thirtyDay' ? '30 Days'
			: durationValue === 'ninetyDay' ? '90 Days'
				: durationValue === 'oneYear' ? '1 Year'
					: getString(record, ['label', 'name', 'durationName'], `${time} Month${time === 1 ? '' : 's'}`);
		return {
			value: durationValue,
			label,
			time,
			duration: getString(record, ['duration', 'value'], durationValue),
			price: getNumber(record, ['price_ngn', 'price', 'amount', 'cost']),
		};
	});
};

export const fetchRentalPricing = async (appName: string, duration?: string): Promise<RentalPricing> => {
	const query = new URLSearchParams({ appName });
	if (duration) query.set('duration', duration);
	const payload = await request<unknown>(`/pricing?${query.toString()}`);
	const envelope = isRecord(payload) && isRecord(payload.data) ? payload.data : payload;
	const durationRecords = recordsFrom(envelope, ['durations', 'items']);
	const record = durationRecords.find((item) => getString(item, ['duration', 'value']) === duration)
		?? (isRecord(envelope) ? envelope : {});
	return {
		price: getNumber(record, ['price_ngn', 'price', 'amount', 'cost', 'total']) ?? 0,
		originalPrice: getNumber(record, ['full_price_ngn', 'originalPrice', 'regularPrice', 'basePrice']),
		currency: getString(record, ['currency'], 'NGN'),
	};
};

export const purchaseRental = (payload: {
	appName: string;
	time: number;
	duration?: string;
	area?: string;
	auto_renew?: boolean;
	paymentMethod: 'wallet' | 'paystack';
	callbackUrl?: string;
}, token: string): Promise<{
	success: boolean;
	data: {
		status?: string;
		phoneNumber?: string;
		authorizationUrl?: string;
		reference?: string;
		failureReason?: string;
	};
}> => request('/buy', { method: 'POST', body: JSON.stringify(payload) }, token);

export const verifyVirtualNumberPayment = (reference: string, token: string): Promise<{
	success: boolean;
	data: {
		status: string;
		phoneNumber?: string;
		failureReason?: string;
	};
}> => request('/paystack/verify', {
	method: 'POST',
	body: JSON.stringify({ reference }),
}, token);

export const fetchActiveRentals = async (token: string): Promise<RentalProfile[]> => {
	const payload = await request<unknown>('/numbers?onlyActive=true', undefined, token);
	return recordsFrom(payload, ['numbers', 'rentals', 'data', 'items']).map((record, index) => ({
		id: getString(record, ['rentalId', 'id', 'rental_id'], String(index)),
		phoneNumber: getString(record, ['phoneNumber', 'number', 'phone', 'msisdn'], 'Number unavailable'),
		appName: getString(record, ['appName', 'app', 'service'], 'SMS service'),
		area: getString(record, ['area', 'country', 'location'], ''),
		status: getString(record, ['status', 'state'], 'ACTIVE').toUpperCase(),
		expiresAt: getString(record, ['expiresAt', 'expiryDate', 'expires', 'expiration'], ''),
		autoRenew: getBoolean(record, ['auto_renew', 'autoRenew']),
	}));
};

export const fetchRentalMessages = async (rentalId: string, token: string): Promise<SmsMessage[]> => {
	const payload = await request<unknown>(`/sms?rentalId=${encodeURIComponent(rentalId)}`, undefined, token);
	return recordsFrom(payload, ['messages', 'sms', 'data', 'items']).map((record, index) => ({
		id: getString(record, ['id', 'messageId'], String(index)),
		appName: getString(record, ['appName', 'app', 'service'], 'SMS'),
		phoneNumber: getString(record, ['phoneNumber', 'number', 'phone'], ''),
		message: getString(record, ['message', 'text', 'body', 'content'], ''),
		receivedAt: getString(record, ['receivedAt', 'timestamp', 'createdAt', 'date'], ''),
	}));
};

export const renewRental = (rentalId: string, token: string, time = 1, duration?: string): Promise<unknown> =>
	request('/renew', { method: 'POST', body: JSON.stringify({ rentalId, time, ...(duration ? { duration } : {}) }) }, token);

export const updateRentalAutoRenew = (rentalId: string, auto_renew: boolean, token: string): Promise<unknown> =>
	request('/auto-renew', { method: 'POST', body: JSON.stringify({ rentalId, auto_renew }) }, token);

export const cancelRental = (rentalId: string, token: string): Promise<unknown> =>
	request('/cancel', { method: 'POST', body: JSON.stringify({ rentalId }) }, token);
