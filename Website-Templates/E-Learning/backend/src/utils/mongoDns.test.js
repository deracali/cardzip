import test from 'node:test'
import assert from 'node:assert/strict'
import { createFallbackLookup } from './mongoDns.js'

function runLookup(lookup, options = {}) {
  return new Promise((resolve, reject) => {
    lookup('ac-example-shard-00-00.aryyobw.mongodb.net', options, (error, address, family) => {
      if (error) reject(error)
      else resolve({ address, family })
    })
  })
}

test('uses configured DNS servers to resolve shard hosts when system lookup fails', async () => {
  const configuredServers = []
  const resolverCalls = []
  const lookup = createFallbackLookup(['1.1.1.1', '8.8.8.8'], {
    lookup: (_hostname, _options, callback) => callback(Object.assign(new Error('host not found'), { code: 'ENOTFOUND' })),
    resolverFactory: () => ({
      setServers: (servers) => configuredServers.push(...servers),
      resolve4: (hostname, callback) => {
        resolverCalls.push(`A:${hostname}`)
        callback(null, ['192.0.2.10'])
      },
      resolve6: (hostname, callback) => {
        resolverCalls.push(`AAAA:${hostname}`)
        callback(null, ['2001:db8::10'])
      },
    }),
  })

  const result = await runLookup(lookup, { all: true })

  assert.deepEqual(configuredServers, ['1.1.1.1', '8.8.8.8'])
  assert.deepEqual(resolverCalls, [
    'A:ac-example-shard-00-00.aryyobw.mongodb.net',
    'AAAA:ac-example-shard-00-00.aryyobw.mongodb.net',
  ])
  assert.deepEqual(result.address, [
    { address: '192.0.2.10', family: 4 },
    { address: '2001:db8::10', family: 6 },
  ])
})

test('keeps using the system lookup when it succeeds', async () => {
  let queriedFallback = false
  const lookup = createFallbackLookup(['1.1.1.1'], {
    lookup: (_hostname, _options, callback) => callback(null, '192.0.2.11', 4),
    resolverFactory: () => ({
      setServers: () => {},
      resolve4: () => { queriedFallback = true },
      resolve6: () => { queriedFallback = true },
    }),
  })

  assert.deepEqual(await runLookup(lookup), { address: '192.0.2.11', family: 4 })
  assert.equal(queriedFallback, false)
})

test('reports fallback resolver failures instead of returning an empty address', async () => {
  const lookup = createFallbackLookup(['1.1.1.1'], {
    lookup: (_hostname, _options, callback) => callback(Object.assign(new Error('host not found'), { code: 'ENOTFOUND' })),
    resolverFactory: () => ({
      setServers: () => {},
      resolve4: (_hostname, callback) => callback(Object.assign(new Error('DNS server unreachable'), { code: 'ECONNREFUSED' })),
      resolve6: (_hostname, callback) => callback(Object.assign(new Error('no IPv6 record'), { code: 'ENODATA' })),
    }),
  })

  await assert.rejects(runLookup(lookup), { code: 'ECONNREFUSED', message: 'DNS server unreachable' })
})
