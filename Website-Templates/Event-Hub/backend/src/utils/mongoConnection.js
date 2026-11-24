import dns from 'node:dns'
import { createFallbackLookup } from './mongoDns.js'

const retryableSrvDnsCodes = new Set(['ECONNREFUSED', 'EAI_AGAIN', 'ENOTFOUND', 'ETIMEDOUT'])

export function isAtlasSrvResolverError(error) {
  const seen = new Set()
  let current = error
  while (current && !seen.has(current)) {
    if ((current.syscall === 'querySrv' && retryableSrvDnsCodes.has(current.code))
      || /querySrv (?:ECONNREFUSED|EAI_AGAIN|ENOTFOUND|ETIMEDOUT) _mongodb\._tcp\./i.test(current.message || '')) return true
    seen.add(current)
    current = current.cause
  }
  return false
}

export async function connectToMongo(mongoose, uri, dnsServers, {
  setDnsServers = dns.setServers,
  lookupFactory = createFallbackLookup,
  onFallback = () => {},
} = {}) {
  const lookup = lookupFactory(dnsServers)
  try {
    return await mongoose.connect(uri, { lookup })
  } catch (error) {
    if (!isAtlasSrvResolverError(error)) throw error
    onFallback()
    try {
      setDnsServers(dnsServers)
      return await mongoose.connect(uri, { lookup })
    } catch (fallbackError) {
      throw new Error(
        `MongoDB Atlas SRV lookup failed with system DNS and fallback DNS (${dnsServers.join(', ')}). Check network DNS access, set MONGODB_DNS_SERVERS to resolvers allowed by your network, or use the standard mongodb:// connection string.`,
        { cause: fallbackError },
      )
    }
  }
}
