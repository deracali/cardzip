export interface GiftCardRate {
	country: string;
	rate: number;
	currency: string;
}

export interface GiftCard {
	id: string;
	name: string;
	category: string;
	discount?: string;
	logo?: string;
	color: string;
	popular: boolean;
	cardLimit: number;
	types: GiftCardRate[];
}

export type GiftCardTradeStatus = 'pending' | 'successful' | 'failed' | string;

export interface GiftCardTrade {
	id: string;
	type: string;
	amount: number;
	currency: string;
	ngnAmount?: number | null;
	exchangeRate?: number | null;
	status: GiftCardTradeStatus;
	createdAt: string;
}

export interface CreateGiftCardTradePayload {
	type: string;
	amount: number;
	currency: string;
	token: string;
	catalogCardId?: string;
	region?: string;
	ngnAmount?: number;
	exchangeRate?: number;
	tradeSpeed?: 'fast' | 'slow';
	images?: GiftCardTradeImage[];
}

export interface GiftCardTradeImage {
	uri: string;
	fileName?: string | null;
	mimeType?: string | null;
}

export interface FetchGiftCardTradesArgs {
	token: string;
	limit?: number;
	page?: number;
	append?: boolean;
}

export interface FetchGiftCardsArgs {
	limit?: number;
	page?: number;
	append?: boolean;
}
