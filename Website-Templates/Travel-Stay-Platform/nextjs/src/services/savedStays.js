const savedStaysKey = 'escapes-saved-stays-v1'

function readSavedStays() {
  const raw = window.localStorage.getItem(savedStaysKey)
  if (!raw) return {}
  const value = JSON.parse(raw)
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Saved stays data has an invalid format. Clear this site’s local storage and try again.')
  }
  return value
}

export function getSavedStaySlugs(userId) {
  if (typeof window === 'undefined' || !userId) return []
  const stays = readSavedStays()[userId]
  return Array.isArray(stays) ? stays : []
}

export function toggleSavedStay(userId, slug) {
  if (!userId) throw new Error('Sign in to save stays.')
  const savedStays = readSavedStays()
  const slugs = new Set(Array.isArray(savedStays[userId]) ? savedStays[userId] : [])
  if (slugs.has(slug)) slugs.delete(slug)
  else slugs.add(slug)
  savedStays[userId] = [...slugs]
  window.localStorage.setItem(savedStaysKey, JSON.stringify(savedStays))
  return savedStays[userId]
}
