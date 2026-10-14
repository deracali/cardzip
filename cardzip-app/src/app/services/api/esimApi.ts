import { EsimPlan, CartItem, PurchasedEsim } from '../../types/esim';

const MOCK_PLANS: EsimPlan[] = [
  { id: 'plan-1', country: 'United States', code: 'US', dataAmountGB: 5, durationDays: 30, price: 15.00, operator: 'T-Mobile Partner' },
  { id: 'plan-2', country: 'United States', code: 'US', dataAmountGB: 10, durationDays: 30, price: 26.00, operator: 'AT&T Partner' },
  { id: 'plan-3', country: 'Japan', code: 'JP', dataAmountGB: 3, durationDays: 7, price: 10.00, operator: 'SoftBank' },
  { id: 'plan-4', country: 'Global Pass', code: 'GLOBAL', dataAmountGB: 20, durationDays: 365, price: 89.00, operator: 'Multi-Carrier' },
];

export const fetchAvailablePlansApi = async (): Promise<EsimPlan[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_PLANS), 500));
};

export const purchaseEsimApi = async (cartItems: CartItem[]): Promise<PurchasedEsim[]> => {
  const completeItems = cartItems.map((item) => {
    if (!item.country || !item.code || !item.durationDays || !item.dataAmountGB) {
      throw new Error('Select a complete eSIM plan before purchase.');
    }
    return {
      id: item.id,
      country: item.country,
      code: item.code,
      durationDays: item.durationDays,
      dataAmountGB: item.dataAmountGB,
    };
  });
  return new Promise((resolve) => {
    setTimeout(() => {
      const purchasedEsims: PurchasedEsim[] = completeItems.map((item, index) => ({
        iccid: `89000000000000${Math.floor(1000 + Math.random() * 9000)}`,
        planId: item.id,
        country: item.country,
        countryCode: item.code,
        totalDataGB: item.dataAmountGB,
        usedDataGB: 0,
        status: 'ACTIVE',
        activationQrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$rsp.esim.com$CONFIRMATION-${Date.now()}-${index}`,
        purchaseDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + item.durationDays * 86400000).toISOString(),
      }));
      resolve(purchasedEsims);
    }, 1200);
  });
};