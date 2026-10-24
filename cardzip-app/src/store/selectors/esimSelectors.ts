import { RootState } from '../index';
import { EsimPlan, PurchasedEsim } from '../../types/esim';

export const selectFilteredPlans = (state: RootState): EsimPlan[] => {
  const { plans, selectedCountry, searchQuery } = state.esimCatalog;
  return plans.filter((plan) => {
    const matchesCountry = selectedCountry === 'ALL' || plan.code === selectedCountry;
    const matchesQuery =
      plan.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.operator.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesQuery;
  });
};

export const selectCartTotalCount = (state: RootState): number =>
  state.cart.items.reduce((acc, item) => acc + item.quantity, 0);

export const selectActiveEsims = (state: RootState): PurchasedEsim[] =>
  state.myEsims.activeProfiles;