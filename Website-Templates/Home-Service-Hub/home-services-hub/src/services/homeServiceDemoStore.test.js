import assert from "node:assert/strict"
import { test } from "node:test"
import {
  getHomeServiceSession,
  homeServiceDemoStore,
  saveHomeServiceSession,
} from "./homeServiceDemoStore.js"

class MemoryStorage {
  values = new Map()

  getItem(key) {
    return this.values.get(key) ?? null
  }

  setItem(key, value) {
    this.values.set(key, String(value))
  }

  removeItem(key) {
    this.values.delete(key)
  }
}

test("Vite demo dashboards read and persist the bundled data locally", async () => {
  const storage = new MemoryStorage()
  storage.setItem("fixflow-demo-data", JSON.stringify({ users: [], appointments: [] }))
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage })

  const adminSession = await homeServiceDemoStore.login(null, {
    email: "admin@fixflow.demo",
    password: "FixFlowDemo2026!",
    expectedRole: "admin",
  })
  saveHomeServiceSession(adminSession)
  const adminData = await homeServiceDemoStore.adminDashboard()
  assert.equal(adminData.appointments.length, 3)
  assert.equal(adminData.metrics.clients, 2)

  const clientSession = await homeServiceDemoStore.login(null, {
    email: "client@fixflow.demo",
    password: "FixFlowDemo2026!",
    expectedRole: "client",
  })
  saveHomeServiceSession(clientSession)
  assert.equal((await homeServiceDemoStore.clientDashboard()).appointments.length, 2)

  await homeServiceDemoStore.createAppointment(null, {
    serviceId: "drain",
    urgency: "weekend",
    preferredDate: "2027-01-15",
    address: "100 Demo Avenue",
    phone: "303-555-0100",
    description: "Slow drain.",
  })
  const localData = await homeServiceDemoStore.clientDashboard()
  assert.equal(localData.appointments.length, 3)
  assert.equal(localData.appointments[0].quote, 129)
  assert.equal(getHomeServiceSession().user.email, "client@fixflow.demo")

  const newClient = await homeServiceDemoStore.signup(null, {
    name: "New Demo Client",
    email: "new-client@fixflow.demo",
    phone: "303-555-0111",
    password: "new-client-password",
  })
  saveHomeServiceSession(newClient)
  const newClientDashboard = await homeServiceDemoStore.clientDashboard()
  assert.equal(newClientDashboard.appointments.length, 2)
  assert.equal(newClientDashboard.appointments.every((appointment) => appointment.isDemo), true)
  assert.equal(newClientDashboard.appointments.every((appointment) => appointment.clientId === newClient.user.id), true)
})
