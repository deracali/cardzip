import dns from 'node:dns'

function resolveRecords(resolver, method, hostname) {
  return new Promise((resolve, reject) => {
    resolver[method](hostname, (error, records) => {
      if (error) reject(error)
      else resolve(records)
    })
  })
}

export function createMongoHostLookup(
  servers,
  { createResolver = () => new dns.Resolver(), fallbackLookup = dns.lookup } = {},
) {
  if (!servers.length) return fallbackLookup

  const resolver = createResolver()
  resolver.setServers(servers)

  return function mongoHostLookup(hostname, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    } else if (typeof options === 'number') {
      options = { family: options }
    }

    const family = options?.family || 0
    const records = family === 4
      ? [['resolve4', 4]]
      : family === 6
        ? [['resolve6', 6]]
        : [['resolve4', 4], ['resolve6', 6]]

    Promise.all(records.map(async ([method, recordFamily]) => {
      try {
        const addresses = await resolveRecords(resolver, method, hostname)
        return addresses.map((address) => ({ address, family: recordFamily }))
      } catch {
        return []
      }
    })).then((resolved) => {
      const addresses = resolved.flat()
      if (!addresses.length) {
        return fallbackLookup(hostname, options, callback)
      }
      if (options?.all) return callback(null, addresses)
      const address = addresses.find((record) => record.family === 4) || addresses[0]
      return callback(null, address.address, address.family)
    }).catch((error) => callback(error))
  }
}
