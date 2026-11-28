import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";
import { createMongoLookup } from "../utils/mongodb-dns.js";

export function createInitialState() {
  return { users: [], reservations: [], stays: [] };
}

export function createMemoryStore(initialState = createInitialState()) {
  let state = structuredClone(initialState);
  let queue = Promise.resolve();

  return {
    async read() {
      await queue;
      return structuredClone(state);
    },
    update(mutator) {
      const operation = queue.then(async () => {
        const draft = structuredClone(state);
        const result = await mutator(draft);
        state = draft;
        return result;
      });
      queue = operation.then(() => undefined, () => undefined);
      return operation;
    },
  };
}

export function createMongoStore(uri, { databaseName = "escapes_travel_stay" } = {}) {
  if (!uri) throw new Error("MONGODB_URI must be set before starting the Escapes API.");
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    lookup: createMongoLookup(),
  });
  const collection = () => client.db(databaseName).collection("application_state");
  let connected;
  let queue = Promise.resolve();

  async function connect() {
    if (!connected) {
      connected = client.connect().then(async () => {
        await collection().updateOne(
          { _id: "primary" },
          { $setOnInsert: { revision: 0, state: createInitialState() } },
          { upsert: true },
        );
      }).catch((error) => {
        connected = undefined;
        throw error;
      });
    }
    return connected;
  }

  async function read() {
    await connect();
    const record = await collection().findOne({ _id: "primary" });
    if (!record) throw new Error("Escapes application data was not initialized.");
    return { ...createInitialState(), ...record.state };
  }

  function update(mutator) {
    const operation = queue.then(async () => {
      await connect();
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const record = await collection().findOne({ _id: "primary" });
        if (!record) throw new Error("Escapes application data was not initialized.");
        const draft = { ...createInitialState(), ...structuredClone(record.state) };
        const result = await mutator(draft);
        const saved = await collection().replaceOne(
          { _id: "primary", revision: record.revision },
          { _id: "primary", revision: record.revision + 1, state: draft },
        );
        if (saved.matchedCount === 1) return result;
      }
      throw new Error("Escapes data changed too frequently to save the update.");
    });
    queue = operation.then(() => undefined, () => undefined);
    return operation;
  }

  return {
    connect,
    read,
    update,
    async close() {
      await client.close();
    },
  };
}

export const newId = (prefix) => `${prefix}_${randomUUID()}`;
