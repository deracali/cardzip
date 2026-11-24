import dns from 'node:dns'
import { isIP } from 'node:net'

export function createFallbackLookup(dnsServers, {
  lookup = dns.lookup,
  resolverFactory = () => new dns.Resolver(),
} = {}) {
  if (!dnsServers.length) return lookup
  const resolver = resolverFactory()
  resolver.setServers(dnsServers)

  return function lookupWithFallback(hostname, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    } else if (typeof options === 'number') {
      options = { family: options }
    }

    const lookupOptions = options || {}
    const family = isIP(hostname)
    if (family) {
      if (lookupOptions.all) callback(null, [{ address: hostname, family }])
      else callback(null, hostname, family)
      return
    }

    lookup(hostname, lookupOptions, (systemError, address, addressFamily) => {
      if (!systemError) {
        callback(null, address, addressFamily)
        return
      }
      if (!['ENOTFOUND', 'EAI_AGAIN'].includes(systemError.code)) {
        callback(systemError)
        return
      }

      const queries = []
      if (lookupOptions.family !== 6) queries.push(['resolve4', 4])
      if (lookupOptions.family !== 4) queries.push(['resolve6', 6])

      Promise.all(queries.map(([method, resolvedFamily]) => new Promise((resolve) => {
        resolver[method](hostname, (error, addresses = []) => resolve({
          error,
          addresses: error ? [] : addresses.map((resolvedAddress) => ({
            address: resolvedAddress,
            family: resolvedFamily,
          })),
        }))
      }))).then((results) => {
        const addresses = results.flatMap((result) => result.addresses)
        if (addresses.length) {
          if (lookupOptions.all) callback(null, addresses)
          else callback(null, addresses[0].address, addresses[0].family)
          return
        }

        const resolverError = results.find((result) => result.error && !['ENODATA', 'ENOTFOUND'].includes(result.error.code))
        callback(resolverError?.error || systemError)
      }, (resolverError) => callback(resolverError))
    })
  }
}
