import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'cardzip-community-interests';
const MAX_PRODUCTS = 30;
const MAX_CATEGORIES = 20;
const MAX_SEARCHES = 10;

interface ScoredEntry {
  score: number;
  updatedAt?: number;
}

interface ProductInterest extends ScoredEntry {
  id: string;
}

interface CategoryInterest extends ScoredEntry {
  name: string;
}

interface SearchInterest extends ScoredEntry {
  term: string;
}

export interface StorefrontPreferences {
  products: { id: string; score: number }[];
  categories: { name: string; score: number }[];
  searches: { term: string; score: number }[];
}

interface StoredPreferences {
  products: ProductInterest[];
  categories: CategoryInterest[];
  searches: SearchInterest[];
}

const emptyPreferences = (): StoredPreferences => ({ products: [], categories: [], searches: [] });

let updateQueue: Promise<void> = Promise.resolve();

const normalizeEntries = (
  entries: unknown,
  key: 'id' | 'name' | 'term',
  maxEntries: number,
): { value: string; score: number; updatedAt: number }[] => {
  if (!Array.isArray(entries)) return [];
  return entries.flatMap((entry: unknown) => {
    if (typeof entry !== 'object' || entry === null) return [];
    const record = entry as Record<string, unknown>;
    const value = typeof record[key] === 'string' ? record[key].trim().slice(0, key === 'id' ? 80 : 100) : '';
    const score = Number(record.score);
    if (!value || !Number.isFinite(score) || score <= 0) return [];
    return [{
      value,
      score: Math.min(score, 100),
      updatedAt: Number.isFinite(Number(record.updatedAt)) ? Number(record.updatedAt) : 0,
    }];
  }).slice(0, maxEntries);
};

const readPreferences = async (): Promise<StoredPreferences> => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) return emptyPreferences();
  const parsed: unknown = JSON.parse(stored);
  if (Array.isArray(parsed)) {
    return {
      ...emptyPreferences(),
      categories: normalizeEntries(parsed, 'name', MAX_CATEGORIES).map(({ value, ...entry }) => ({ name: value, ...entry })),
    };
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Saved storefront preferences are invalid.');
  }
  const record = parsed as Record<string, unknown>;
  return {
    products: normalizeEntries(record.products, 'id', MAX_PRODUCTS).map(({ value, ...entry }) => ({ id: value, ...entry })),
    categories: normalizeEntries(record.categories, 'name', MAX_CATEGORIES).map(({ value, ...entry }) => ({ name: value, ...entry })),
    searches: normalizeEntries(record.searches, 'term', MAX_SEARCHES).map(({ value, ...entry }) => ({ term: value, ...entry })),
  };
};

const updatePreferences = (mutate: (preferences: StoredPreferences) => void) => {
  updateQueue = updateQueue.then(async () => {
    const preferences = await readPreferences();
    mutate(preferences);
    preferences.products.sort((left, right) => right.score - left.score || (right.updatedAt || 0) - (left.updatedAt || 0));
    preferences.categories.sort((left, right) => right.score - left.score || (right.updatedAt || 0) - (left.updatedAt || 0));
    preferences.searches.sort((left, right) => right.score - left.score || (right.updatedAt || 0) - (left.updatedAt || 0));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      products: preferences.products.slice(0, MAX_PRODUCTS),
      categories: preferences.categories.slice(0, MAX_CATEGORIES),
      searches: preferences.searches.slice(0, MAX_SEARCHES),
    }));
  }).catch((error: unknown) => {
    console.error('Could not save storefront interests:', error);
  });
  return updateQueue;
};

export const recordStoreCategoryInterest = (category: string, strength = 1) => {
  const name = category.trim().slice(0, 80);
  if (!name || !Number.isFinite(strength) || strength <= 0) return Promise.resolve();
  return updatePreferences((preferences) => {
    const existing = preferences.categories.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.score = Math.min(100, existing.score + strength);
      existing.name = name;
      existing.updatedAt = Date.now();
    } else {
      preferences.categories.push({ name, score: Math.min(100, strength), updatedAt: Date.now() });
    }
  });
};

export const recordStoreProductInterest = (product: { _id?: string; id?: string; category?: string }, strength = 1) => {
  const id = String(product._id || product.id || '').trim();
  if (!id || !Number.isFinite(strength) || strength <= 0) return Promise.resolve();
  return updatePreferences((preferences) => {
    const existingProduct = preferences.products.find((entry) => entry.id === id);
    if (existingProduct) {
      existingProduct.score = Math.min(100, existingProduct.score + strength);
      existingProduct.updatedAt = Date.now();
    } else {
      preferences.products.push({ id, score: Math.min(100, strength), updatedAt: Date.now() });
    }
    const category = typeof product.category === 'string' ? product.category.trim().slice(0, 80) : '';
    if (category) {
      const existing = preferences.categories.find((entry) => entry.name.toLowerCase() === category.toLowerCase());
      if (existing) {
        existing.score = Math.min(100, existing.score + strength);
        existing.name = category;
        existing.updatedAt = Date.now();
      } else {
        preferences.categories.push({ name: category, score: Math.min(100, strength), updatedAt: Date.now() });
      }
    }
  });
};

export const recordStoreSearch = (search: string) => {
  const term = search.trim().slice(0, 100);
  if (term.length < 2) return Promise.resolve();
  return updatePreferences((preferences) => {
    const existing = preferences.searches.find((entry) => entry.term.toLowerCase() === term.toLowerCase());
    if (existing) {
      existing.score = Math.min(100, existing.score + 1);
      existing.term = term;
      existing.updatedAt = Date.now();
    } else {
      preferences.searches.push({ term, score: 1, updatedAt: Date.now() });
    }
  });
};

export const getStorefrontPreferences = async (): Promise<StorefrontPreferences> => {
  try {
    const preferences = await readPreferences();
    return {
      products: preferences.products.map(({ id, score }) => ({ id, score })),
      categories: preferences.categories.map(({ name, score }) => ({ name, score })),
      searches: preferences.searches.map(({ term, score }) => ({ term, score })),
    };
  } catch (error) {
    console.error('Could not read saved storefront interests:', error);
    return { products: [], categories: [], searches: [] };
  }
};
