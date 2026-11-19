export function isValidVehicle(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false
  for (const [field, maximum] of [['name', 80], ['category', 40]]) {
    if (body[field] === undefined && partial) continue
    if (typeof body[field] !== 'string' || !body[field].trim() || body[field].trim().length > maximum) return false
  }
  for (const [field, minimum, maximum, integer] of [
    ['price', 1, 10000, false],
    ['seats', 1, 20, true],
  ]) {
    if (body[field] === undefined && partial) continue
    if (body[field] === null || body[field] === '' || !Number.isFinite(Number(body[field]))) return false
    const value = Number(body[field])
    if (value < minimum || value > maximum || (integer && !Number.isInteger(value))) return false
  }
  for (const [field, maximum] of [['fuel', 40], ['details', 180], ['label', 40]]) {
    if (body[field] !== undefined
      && (typeof body[field] !== 'string' || body[field].trim().length > maximum)) return false
  }
  return partial || ['name', 'category', 'price', 'seats'].every((field) => body[field] !== undefined)
}

export function parseReservationPeriod(startValue, endValue) {
  if (typeof startValue !== 'string' || typeof endValue !== 'string') return null
  const start = new Date(startValue)
  const end = new Date(endValue)
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) return null
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)))
  return { start, end, days }
}
