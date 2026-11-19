import test from 'node:test'
import assert from 'node:assert/strict'
import { createMongoHostLookup } from '../src/services/mongoDns.js'

function createResolver(records) {
  return {
    setServers(servers) {
      this.servers = servers
    },
    resolve4(hostname, callback) {
      queueMicrotask(() => records.resolve4 instanceof Error
        ? callback(records.resolve4)
        : callback(null, records.resolve4 || []))
    },
    resolve6(hostname, callback) {
      queueMicrotask(() => records.resolve6 instanceof Error
        ? callback(records.resolve6)
        : callback(null, records.resolve6 || []))
    },
  }
}

test('resolves MongoDB hosts through the configured DNS servers', async () => {
  let configuredServers
  const lookup = createMongoHostLookup(['1.1.1.1', '8.8.8.8'], {
    createResolver: () => {
      const resolver = createResolver({ resolve4: ['203.0.113.9'] })
      const setServers = resolver.setServers
      resolver.setServers = (servers) => {
        configuredServers = servers
        setServers.call(resolver, servers)
      }
      return resolver
    },
    fallbackLookup: () => assert.fail('System DNS should not be used when the configured DNS lookup succeeds'),
  })

  const result = await new Promise((resolve, reject) => {
    lookup('atlas-node.example', { family: 4 }, (error, address, family) => {
      if (error) reject(error)
      else resolve({ address, family })
    })
  })

  assert.deepEqual(configuredServers, ['1.1.1.1', '8.8.8.8'])
  assert.deepEqual(result, { address: '203.0.113.9', family: 4 })
})

test('returns all resolved address families in Node lookup format', async () => {
  const lookup = createMongoHostLookup(['1.1.1.1'], {
    createResolver: () => createResolver({ resolve4: ['203.0.113.9'], resolve6: ['2001:db8::9'] }),
    fallbackLookup: () => assert.fail('System DNS should not be used when the configured DNS lookup succeeds'),
  })

  const result = await new Promise((resolve, reject) => {
    lookup('atlas-node.example', { all: true }, (error, addresses) => {
      if (error) reject(error)
      else resolve(addresses)
    })
  })

  assert.deepEqual(result, [
    { address: '203.0.113.9', family: 4 },
    { address: '2001:db8::9', family: 6 },
  ])
})

test('falls back to the system resolver when configured DNS has no records', async () => {
  const lookup = createMongoHostLookup(['1.1.1.1'], {
    createResolver: () => createResolver({
      resolve4: Object.assign(new Error('No IPv4 record'), { code: 'ENODATA' }),
      resolve6: Object.assign(new Error('No IPv6 record'), { code: 'ENODATA' }),
    }),
    fallbackLookup: (hostname, options, callback) => callback(null, '192.0.2.1', 4),
  })

  const result = await new Promise((resolve, reject) => {
    lookup('local-node.example', { family: 4 }, (error, address, family) => {
      if (error) reject(error)
      else resolve({ address, family })
    })
  })

  assert.deepEqual(result, { address: '192.0.2.1', family: 4 })
})
