import { MongoClient } from "mongodb";
import { randomUUID } from "node:crypto";

function clone(value) {
  return value == null ? value : structuredClone(value);
}

export function createMemoryStore() {
  const users = [];
  const jobs = [];
  const applications = [];

  return {
    async findUserByEmail(email) {
      return clone(users.find((user) => user.email === email));
    },
    async findUserById(id) {
      return clone(users.find((user) => user.id === id));
    },
    async insertUser(user) {
      const record = { id: randomUUID(), ...clone(user) };
      users.push(record);
      return clone(record);
    },
    async listUsers() {
      return clone(users);
    },
    async createJob(job) {
      const record = { id: randomUUID(), ...clone(job) };
      jobs.push(record);
      return clone(record);
    },
    async findJobById(id) {
      return clone(jobs.find((job) => job.id === id));
    },
    async listJobs(filter = {}) {
      return clone(jobs.filter((job) =>
        Object.entries(filter).every(([key, value]) => job[key] === value),
      ));
    },
    async updateJob(id, changes) {
      const job = jobs.find((item) => item.id === id);
      if (!job) return null;
      Object.assign(job, clone(changes));
      return clone(job);
    },
    async createApplication(application) {
      const record = { id: randomUUID(), ...clone(application) };
      applications.push(record);
      return clone(record);
    },
    async listApplications(filter = {}) {
      return clone(applications.filter((application) =>
        Object.entries(filter).every(([key, value]) => application[key] === value),
      ));
    },
    async updateApplication(id, filter, changes) {
      const application = applications.find((item) =>
        item.id === id && Object.entries(filter).every(([key, value]) => item[key] === value),
      );
      if (!application) return null;
      Object.assign(application, clone(changes));
      return clone(application);
    },
  };
}

export async function createMongoStore(uri, databaseName) {
  const client = new MongoClient(uri);
  await client.connect();
  const database = client.db(databaseName);
  const users = database.collection("users");
  const jobs = database.collection("jobs");
  const applications = database.collection("applications");

  await Promise.all([
    users.createIndex({ email: 1 }, { unique: true }),
    jobs.createIndex({ ownerId: 1, createdAt: -1 }),
    jobs.createIndex({ status: 1, createdAt: -1 }),
    applications.createIndex({ candidateId: 1, createdAt: -1 }),
  ]);

  return {
    client,
    async findUserByEmail(email) {
      const user = await users.findOne({ email });
      return user ? { ...user, id: user._id } : null;
    },
    async findUserById(id) {
      const user = await users.findOne({ _id: id });
      return user ? { ...user, id: user._id } : null;
    },
    async insertUser(user) {
      const record = { _id: randomUUID(), ...clone(user) };
      await users.insertOne(record);
      return { ...record, id: record._id };
    },
    async listUsers() {
      const records = await users.find({}).sort({ createdAt: -1 }).toArray();
      return records.map((record) => ({ ...record, id: record._id }));
    },
    async createJob(job) {
      const record = { _id: randomUUID(), ...clone(job) };
      await jobs.insertOne(record);
      return { ...record, id: record._id };
    },
    async findJobById(id) {
      const job = await jobs.findOne({ _id: id });
      return job ? { ...job, id: job._id } : null;
    },
    async listJobs(filter = {}) {
      const records = await jobs.find(filter).sort({ createdAt: -1 }).toArray();
      return records.map((record) => ({ ...record, id: record._id }));
    },
    async updateJob(id, changes) {
      const result = await jobs.findOneAndUpdate(
        { _id: id },
        { $set: clone(changes) },
        { returnDocument: "after" },
      );
      const job = result?.value ?? result;
      return job ? { ...job, id: job._id } : null;
    },
    async createApplication(application) {
      const record = { _id: randomUUID(), ...clone(application) };
      await applications.insertOne(record);
      return { ...record, id: record._id };
    },
    async listApplications(filter = {}) {
      const records = await applications.find(filter).sort({ createdAt: -1 }).toArray();
      return records.map((record) => ({ ...record, id: record._id }));
    },
    async updateApplication(id, filter, changes) {
      const result = await applications.findOneAndUpdate(
        { _id: id, ...filter },
        { $set: clone(changes) },
        { returnDocument: "after" },
      );
      const application = result?.value ?? result;
      return application ? { ...application, id: application._id } : null;
    },
  };
}
