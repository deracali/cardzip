import { MongoClient } from "mongodb";
import { defaultStylists, services as defaultServices } from "../services/salon-data.js";

export function createMongoStore(uri, dbName = "lumiere_salon") {
  if (!uri) throw new Error("MONGODB_URI must be set before the Lumière API can start.");
  const client = new MongoClient(uri);
  let users;
  let appointments;
  let services;
  let stylists;

  return {
    async connect() {
      await client.connect();
      const database = client.db(dbName);
      users = database.collection("users");
      appointments = database.collection("appointments");
      services = database.collection("services");
      stylists = database.collection("stylists");
      await users.createIndex({ email: 1 }, { unique: true });
      await appointments.createIndex({ clientId: 1, createdAt: -1 });
      await appointments.createIndex({ paymentReference: 1 }, { unique: true, sparse: true });
      await services.createIndex({ id: 1 }, { unique: true });
      await stylists.createIndex({ id: 1 }, { unique: true });
      await stylists.createIndex({ name: 1 }, { unique: true });
      await Promise.all(defaultServices.map((service) => services.updateOne(
        { id: service.id },
        { $setOnInsert: service },
        { upsert: true },
      )));
      await Promise.all(defaultStylists.map((stylist) => stylists.updateOne(
        { id: stylist.id },
        { $setOnInsert: stylist },
        { upsert: true },
      )));
    },
    async close() {
      await client.close();
    },
    async findUserByEmail(email) {
      return users.findOne({ email });
    },
    async findUserById(id) {
      return users.findOne({ id });
    },
    async createUser(user) {
      await users.insertOne(user);
      return user;
    },
    async countUsers(role) {
      return users.countDocuments(role ? { role } : {});
    },
    async listUsers(role) {
      return users.find(role ? { role } : {}, { projection: { passwordHash: 0, _id: 0 } }).sort({ name: 1 }).toArray();
    },
    async createAppointment(appointment) {
      await appointments.insertOne(appointment);
      return appointment;
    },
    async findAppointmentByPaymentReference(paymentReference) {
      return appointments.findOne({ paymentReference }, { projection: { _id: 0 } });
    },
    async listAppointments({ clientId, limit = 100 } = {}) {
      const filter = clientId ? { clientId } : {};
      return appointments.find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(limit).toArray();
    },
    async updateAppointment(id, changes) {
      const result = await appointments.updateOne(
        { id },
        { $set: { ...changes, updatedAt: new Date().toISOString() } },
      );
      if (!result.matchedCount) return null;
      return appointments.findOne({ id }, { projection: { _id: 0 } });
    },
    async countAppointments() {
      return appointments.countDocuments();
    },
    async countAppointmentsByStatus(status) {
      return appointments.countDocuments({ status });
    },
    async listServices({ includeInactive = true } = {}) {
      return services.find(includeInactive ? {} : { active: { $ne: false } }, { projection: { _id: 0 } }).sort({ name: 1 }).toArray();
    },
    async findServiceById(id) {
      return services.findOne({ id }, { projection: { _id: 0 } });
    },
    async createService(service) {
      await services.insertOne(service);
      return service;
    },
    async updateService(id, changes) {
      const result = await services.updateOne({ id }, { $set: { ...changes, updatedAt: new Date().toISOString() } });
      if (!result.matchedCount) return null;
      return services.findOne({ id }, { projection: { _id: 0 } });
    },
    async listStylists({ includeInactive = true } = {}) {
      return stylists.find(includeInactive ? {} : { active: { $ne: false } }, { projection: { _id: 0 } }).sort({ name: 1 }).toArray();
    },
    async findStylistByName(name) {
      return stylists.findOne({ name }, { projection: { _id: 0 } });
    },
    async findStylistById(id) {
      return stylists.findOne({ id }, { projection: { _id: 0 } });
    },
    async createStylist(stylist) {
      await stylists.insertOne(stylist);
      return stylist;
    },
    async updateStylist(id, changes) {
      const result = await stylists.updateOne({ id }, { $set: { ...changes, updatedAt: new Date().toISOString() } });
      if (!result.matchedCount) return null;
      return stylists.findOne({ id }, { projection: { _id: 0 } });
    },
  };
}
