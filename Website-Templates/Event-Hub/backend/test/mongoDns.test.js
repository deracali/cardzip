import assert from 'node:assert/strict'
import test from 'node:test'
import { connectToMongo, isAtlasSrvResolverError } from '../src/utils/mongoConnection.js'
import { createFallbackLookup } from '../src/utils/mongoDns.js'

function runLookup(lookup, options = {}) {
  return new Promise((resolve, reject) => {
    lookup('ac-example-shard-00-00.mongodb.net', options, (error, address, family) => {
      if (error) reject(error)
      else resolve({ address, family })
    })
  })
}

test('resolves Atlas shard hostnames through configured DNS when system lookup fails', async () => {
  const configuredServers = []
  const resolverCalls = []
  const lookup = createFallbackLookup(['1.1.1.1', '8.8.8.8'], {
    lookup: (_hostname, _options, callback) => callback(Object.assign(new Error('temporary DNS failure'), { code: 'EAI_AGAIN' })),
    resolverFactory: () => ({
      setServers(servers) { configuredServers.push(...servers) },
      resolve4(hostname, callback) {
        resolverCalls.push(`A:${hostname}`)
        callback(null, ['192.0.2.10'])
      },
      resolve6(hostname, callback) {
        resolverCalls.push(`AAAA:${hostname}`)
        callback(null, ['2001:db8::10'])
      },
    }),
  })

  const result = await runLookup(lookup, { all: true })
  assert.deepEqual(configuredServers, ['1.1.1.1', '8.8.8.8'])
  assert.deepEqual(resolverCalls, [
    'A:ac-example-shard-00-00.mongodb.net',
    'AAAA:ac-example-shard-00-00.mongodb.net',
  ])
  assert.deepEqual(result.address, [
    { address: '192.0.2.10', family: 4 },
    { address: '2001:db8::10', family: 6 },
  ])
})

test('retries Atlas SRV failures using configured DNS servers', async () => {
  const srvError = Object.assign(new Error('querySrv ECONNREFUSED _mongodb._tcp.cluster.example'), {
    code: 'ECONNREFUSED',
    syscall: 'querySrv',
  })
  const dnsChanges = []
  const calls = []
  const mongoose = {
    async connect(uri, options) {
      calls.push({ uri, options })
      if (calls.length === 1) throw srvError
      return 'connected'
    },
  }
  let fallbackNoticeCount = 0
  const result = await connectToMongo(mongoose, 'mongodb+srv://cluster.example/db', ['1.1.1.1'], {
    setDnsServers: (servers) => dnsChanges.push(...servers),
    lookupFactory: (servers) => ({ dnsServers: servers }),
    onFallback: () => { fallbackNoticeCount += 1 },
  })

  assert.equal(result, 'connected')
  assert.equal(calls.length, 2)
  assert.deepEqual(dnsChanges, ['1.1.1.1'])
  assert.deepEqual(calls[0].options, calls[1].options)
  assert.deepEqual(calls[0].options.lookup, { dnsServers: ['1.1.1.1'] })
  assert.equal(fallbackNoticeCount, 1)
})

test('does not retry non-SRV MongoDB errors and reports failed DNS fallback clearly', async () => {
  const authError = Object.assign(new Error('authentication failed'), { code: 'EAUTH' })
  let retryCount = 0
  await assert.rejects(connectToMongo({
    async connect() { retryCount += 1; throw authError },
  }, 'mongodb+srv://cluster.example/db', ['1.1.1.1'], {
    setDnsServers() {},
    lookupFactory: () => () => {},
  }), authError)
  assert.equal(retryCount, 1)
  assert.equal(isAtlasSrvResolverError({ cause: Object.assign(new Error('querySrv ECONNREFUSED _mongodb._tcp.cluster.example'), { code: 'ECONNREFUSED', syscall: 'querySrv' }) }), true)

  const srvError = Object.assign(new Error('querySrv ECONNREFUSED _mongodb._tcp.cluster.example'), {
    code: 'ECONNREFUSED',
    syscall: 'querySrv',
  })
  const fallbackError = Object.assign(new Error('fallback DNS unreachable'), { code: 'ECONNREFUSED' })
  let failure
  try {
    await connectToMongo({
      async connect() {
        if (!this.retried) {
          this.retried = true
          throw srvError
        }
        throw fallbackError
      },
    }, 'mongodb+srv://cluster.example/db', ['1.1.1.1'], {
      setDnsServers() {},
      lookupFactory: () => () => {},
    })
  } catch (error) {
    failure = error
  }
  assert.ok(failure instanceof Error)
  assert.match(failure.message, /MONGODB_DNS_SERVERS/)
  assert.equal(failure.cause, fallbackError)
})
