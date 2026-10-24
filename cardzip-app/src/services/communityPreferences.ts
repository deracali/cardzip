import { getStorefrontPreferences, recordStoreCategoryInterest } from './storePreferences';

export const recordCommunityCategoryInterest = recordStoreCategoryInterest;

export const getCommunityCategoryPreferences = async () => {
  return getStorefrontPreferences();
};
