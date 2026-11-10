const MAX_PRODUCTS = 30
const MAX_CATEGORIES = 20
const MAX_SEARCHES = 10
const STORAGE_KEY = 'cardzip-store-preferences'

const getLegacyStorageKey = (user) => {
  const userId = user?._id || user?.id || user?.email || 'guest'
  return `cardzip-store-preferences:${encodeURIComponent(String(userId))}`
}

const readPreferences = (user) => {
  try {
    const globalValue = localStorage.getItem(STORAGE_KEY)
    const keys = globalValue ? [STORAGE_KEY] : [getLegacyStorageKey(user), getLegacyStorageKey(null)]
    const stored = keys.map((key) => {
      const value = key === STORAGE_KEY ? globalValue : localStorage.getItem(key)
      if (!value) return {}
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
    })
    const mergeEntries = (key, identity) => {
      const entries = new Map()
      stored.forEach((preferences) => {
        if (!Array.isArray(preferences[key])) return
        preferences[key].forEach((entry) => {
          const value = typeof entry?.[identity] === 'string' ? entry[identity].trim() : ''
          const score = Number(entry?.score)
          if (!value || !Number.isFinite(score) || score <= 0) return
          const entryKey = value.toLowerCase()
          const current = entries.get(entryKey)
          entries.set(entryKey, {
            ...entry,
            [identity]: value,
            score: Math.min(100, (current?.score || 0) + score),
            updatedAt: Math.max(Number(entry.updatedAt || 0), current?.updatedAt || 0),
          })
        })
      })
      return [...entries.values()]
        .sort((left, right) => right.score - left.score || right.updatedAt - left.updatedAt)
    }
    return {
      products: mergeEntries('products', 'id').slice(0, MAX_PRODUCTS),
      categories: mergeEntries('categories', 'name').slice(0, MAX_CATEGORIES),
      searches: mergeEntries('searches', 'term').slice(0, MAX_SEARCHES),
    }
  } catch (error) {
    console.error('Could not read saved product preferences:', error)
    return { products: [], categories: [], searches: [] }
  }
}

const savePreferences = (user, preferences) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch (error) {
    console.error('Could not save product preferences:', error)
  }
}

export const recordProductInteraction = (product, action, user) => {
  if (!product?._id || !['view', 'cart'].includes(action)) return
  const preferences = readPreferences(user)
  const productId = String(product._id)
  const score = action === 'cart' ? 4 : 1
  const existingProduct = preferences.products.find((entry) => entry.id === productId)
  if (existingProduct) {
    existingProduct.score = Math.min(100, Number(existingProduct.score || 0) + score)
    existingProduct.updatedAt = Date.now()
  } else {
    preferences.products.push({ id: productId, score, updatedAt: Date.now() })
  }
  preferences.products.sort((a, b) => b.score - a.score || b.updatedAt - a.updatedAt)
  preferences.products = preferences.products.slice(0, MAX_PRODUCTS)

  const category = typeof product.category === 'string' ? product.category.trim() : ''
  if (category) {
    const existingCategory = preferences.categories.find(
      (entry) => entry.name.toLowerCase() === category.toLowerCase(),
    )
    if (existingCategory) {
      existingCategory.score = Math.min(100, Number(existingCategory.score || 0) + score)
      existingCategory.name = category
    } else {
      preferences.categories.push({ name: category, score })
    }
    preferences.categories.sort((a, b) => b.score - a.score)
    preferences.categories = preferences.categories.slice(0, MAX_CATEGORIES)
  }

  savePreferences(user, preferences)
}

export const recordStoreCategoryInterest = (category, user, strength = 1) => {
  const name = typeof category === 'string' ? category.trim().slice(0, 80) : ''
  if (!name || !Number.isFinite(strength) || strength <= 0) return
  const preferences = readPreferences(user)
  const existingCategory = preferences.categories.find(
    (entry) => entry.name.toLowerCase() === name.toLowerCase(),
  )
  if (existingCategory) {
    existingCategory.score = Math.min(100, Number(existingCategory.score || 0) + strength)
    existingCategory.name = name
  } else {
    preferences.categories.push({ name, score: Math.min(100, strength), updatedAt: Date.now() })
  }
  preferences.categories.sort((a, b) => b.score - a.score || Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
  preferences.categories = preferences.categories.slice(0, MAX_CATEGORIES)
  savePreferences(user, preferences)
}

export const recordStoreSearch = (search, user) => {
  const term = typeof search === 'string' ? search.trim().slice(0, 100) : ''
  if (term.length < 2) return
  const preferences = readPreferences(user)
  const normalizedTerm = term.toLowerCase()
  const existingSearch = preferences.searches.find(
    (entry) => entry.term.toLowerCase() === normalizedTerm,
  )
  if (existingSearch) {
    existingSearch.score = Math.min(100, Number(existingSearch.score || 0) + 1)
    existingSearch.term = term
    existingSearch.updatedAt = Date.now()
  } else {
    preferences.searches.push({ term, score: 1, updatedAt: Date.now() })
  }
  preferences.searches.sort((a, b) => b.score - a.score || b.updatedAt - a.updatedAt)
  preferences.searches = preferences.searches.slice(0, MAX_SEARCHES)
  savePreferences(user, preferences)
}

export const getStorefrontPreferences = (user) => {
  const preferences = readPreferences(user)
  return {
    products: preferences.products.slice(0, MAX_PRODUCTS).map(({ id, score }) => ({ id, score })),
    categories: preferences.categories.slice(0, MAX_CATEGORIES).map(({ name, score }) => ({ name, score })),
    searches: preferences.searches.slice(0, MAX_SEARCHES).map(({ term, score }) => ({ term, score })),
  }
}
