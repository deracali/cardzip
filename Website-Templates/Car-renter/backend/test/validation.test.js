import test from 'node:test'
import assert from 'node:assert/strict'
import { isValidVehicle, parseReservationPeriod } from '../src/validation/vehicles.js'

test('requires complete and bounded fleet listing details', () => {
  const vehicle = { name: 'Summit SUV', category: 'SUV', price: '89', seats: '5' }
  assert.equal(isValidVehicle(vehicle), true)
  assert.equal(isValidVehicle({ ...vehicle, price: '0' }), false)
  assert.equal(isValidVehicle({ ...vehicle, seats: '2.5' }), false)
  assert.equal(isValidVehicle({ ...vehicle, name: null }), false)
  assert.equal(isValidVehicle({ ...vehicle, extra: '<script>' }), true)
  assert.equal(isValidVehicle({ name: 'Summit SUV' }), false)
})

test('allows partial updates only for valid provided values', () => {
  assert.equal(isValidVehicle({ price: '125' }, true), true)
  assert.equal(isValidVehicle({ name: null }, true), false)
  assert.equal(isValidVehicle({ details: 'x'.repeat(181) }, true), false)
  assert.equal(isValidVehicle({}, true), true)
})

test('accepts increasing reservation dates and calculates rental days', () => {
  const period = parseReservationPeriod('2030-01-15T10:00:00.000Z', '2030-01-16T10:00:00.000Z')
  assert.equal(period.days, 1)
  assert.equal(parseReservationPeriod('invalid', '2030-01-16T10:00:00.000Z'), null)
  assert.equal(parseReservationPeriod('2030-01-16T10:00:00.000Z', '2030-01-15T10:00:00.000Z'), null)
})
