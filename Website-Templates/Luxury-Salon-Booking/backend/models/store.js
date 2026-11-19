import { MongoClient } from "mongodb";

export function createMongoStore(uri, dbName = "lumiere_salon") {
  if (!uri) throw new Error("MONGODB_URI must be set before the Lumière API can start.");
  const client = new MongoClient(uri);
  let users;
  let appointments;

  return {
    async connect() {
      await client.connect();
      const database = client.db(dbName);
      users = database.collection("users");
      appointments = database.collection("appointments");
      await users.createIndex({ email: 1 }, { unique: true });
      await appointments.createIndex({ clientId: 1, createdAt: -1 });
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
  };
}
