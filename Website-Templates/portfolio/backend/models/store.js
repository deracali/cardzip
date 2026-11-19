import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";

export const newId = () => randomUUID();

export function createInitialState() {
  return { users: [], reviewRequests: [] };
}

export function createMemoryStore(initialState = createInitialState()) {
  let state = structuredClone(initialState);
  let writeQueue = Promise.resolve();
  return {
    async read() {
      await writeQueue;
      return structuredClone(state);
    },
    update(mutator) {
      const operation = writeQueue.then(async () => {
        const draft = structuredClone(state);
        const result = await mutator(draft);
        state = draft;
        return result;
      });
      writeQueue = operation.then(() => undefined, () => undefined);
      return operation;
    },
  };
}

export function createMongoStore(uri, { databaseName = "creatorhub_portfolio" } = {}) {
  if (!uri) throw new Error("MONGODB_URI must be set before starting the Portfolio API.");
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  const collection = () => client.db(databaseName).collection("portfolio_state");
  let connectPromise;
  let writeQueue = Promise.resolve();

  async function connect() {
    if (!connectPromise) {
      connectPromise = client.connect().then(() => collection().updateOne(
        { _id: "primary" },
        { $setOnInsert: { revision: 0, state: createInitialState() } },
        { upsert: true },
      )).catch((error) => {
        connectPromise = undefined;
        throw error;
      });
    }
    await connectPromise;
  }

  async function read() {
    await connect();
    const document = await collection().findOne({ _id: "primary" });
    if (!document) throw new Error("Portfolio data was not initialized in MongoDB.");
    return document.state;
  }

  function update(mutator) {
    const operation = writeQueue.then(async () => {
      await connect();
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const document = await collection().findOne({ _id: "primary" });
        if (!document) throw new Error("Portfolio data was not initialized in MongoDB.");
        const draft = structuredClone(document.state);
        const result = await mutator(draft);
        const saved = await collection().replaceOne(
          { _id: "primary", revision: document.revision },
          { _id: "primary", revision: document.revision + 1, state: draft },
        );
        if (saved.matchedCount === 1) return result;
      }
      throw new Error("Portfolio data changed too often to save. Please retry.");
    });
    writeQueue = operation.then(() => undefined, () => undefined);
    return operation;
  }

  return { connect, read, update, close: () => client.close() };
}
