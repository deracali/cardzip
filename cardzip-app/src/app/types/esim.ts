export interface EsimPlan {
  id: string;
  country: string;
  code: string;
  dataAmountGB: number;
  durationDays: number;
  price: number;
  operator: string;
}

export interface CartItem extends Partial<EsimPlan> {
  id: string;
  name?: string;
  title?: string;
  price: number;
  quantity: number;
  image?: string;
}

export type EsimStatus = 'ACTIVE' | 'EXPIRED' | 'NOT_ACTIVATED';

export interface PurchasedEsim {
  iccid: string;
  planId: string;
  country: string;
  countryCode: string;
  totalDataGB: number;
  usedDataGB: number;
  status: EsimStatus;
  activationQrCodeUrl: string;
  purchaseDate: string;
  expiryDate: string;
}

export interface TopUpPayload {
  iccid: string;
  addGB: number;
}

export interface UpdateUsagePayload {
  iccid: string;
  usedGB: number;
}