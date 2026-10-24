export interface ReferredUser {
  id: string;
  name: string;
  createdAt: string;
}

export type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

export interface KycSummary {
  status: KycStatus;
  legalName?: string;
  documentType?: 'nin' | 'passport' | 'drivers_license';
  documentLastFour?: string;
  submittedAt?: string;
}

export interface AccountSummary {
  user: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
    createdAt: string;
    bankAccount?: { bankName: string; accountName: string; accountNumber: string } | null;
  };
  referralCode: string;
  referralCount: number;
  referralRewardNgn: number;
  referralSuccessfulTrades: number;
  referrals: ReferredUser[];
  successfulTrades: number;
  pointsFromTrades: number;
  pointsFromReferrals: number;
  points: number;
  memberLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  currentThreshold: number;
  nextLevel: string | null;
  nextThreshold: number;
  pointsToNextLevel: number;
  progressPercent: number;
  kyc: KycSummary;
}

export interface KycSubmission {
  legalName: string;
  documentType: 'nin' | 'passport' | 'drivers_license';
  documentNumber: string;
}