import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { MongoClient } from "mongodb";

export function createInitialState() {
  return { users: [], appointments: [] };
}

export function createStore(filePath) {
  let writeQueue = Promise.resolve();
  const resolvedPath = path.resolve(filePath);

  async function readState() {
    try {
      return JSON.parse(await readFile(resolvedPath, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      const state = createInitialState();
      await persist(state);
      return state;
    }
  }

  async function persist(state) {
    await mkdir(path.dirname(resolvedPath), { recursive: true });
    const temporaryPath = `${resolvedPath}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
    await rename(temporaryPath, resolvedPath);
  }

  return {
    async read() {
      await writeQueue;
      return readState();
    },
    update(mutator) {
      const operation = writeQueue.then(async () => {
        const state = await readState();
        const result = await mutator(state);
        await persist(state);
        return result;
      });
      writeQueue = operation.then(() => undefined, () => undefined);
      return operation;
    },
  };
}

export function createMongoStore(uri, { databaseName = "fixflow_pro" } = {}) {
  if (!uri) throw new Error("MONGODB_URI must be set before starting the FixFlow API.");
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  const collection = () => client.db(databaseName).collection("home_service_state");
  let connectPromise;
  let writeQueue = Promise.resolve();

  async function connect() {
    if (!connectPromise) {
      connectPromise = client.connect().then(async () => {
        await collection().updateOne(
          { _id: "primary" },
          { $setOnInsert: { revision: 0, state: createInitialState() } },
          { upsert: true },
        );
      }).catch((error) => {
        connectPromise = undefined;
        throw error;
      });
    }
    return connectPromise;
  }

  async function read() {
    await connect();
    const document = await collection().findOne({ _id: "primary" });
    if (!document) throw new Error("MongoDB FixFlow state was not initialized.");
    return document.state;
  }

  function update(mutator) {
    const operation = writeQueue.then(async () => {
      await connect();
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const document = await collection().findOne({ _id: "primary" });
        if (!document) throw new Error("MongoDB FixFlow state was not initialized.");
        const state = structuredClone(document.state);
        const result = await mutator(state);
        const saved = await collection().replaceOne(
          { _id: "primary", revision: document.revision },
          { _id: "primary", revision: document.revision + 1, state },
        );
        if (saved.matchedCount === 1) return result;
      }
      throw new Error("FixFlow data changed too frequently to save the update.");
    });
    writeQueue = operation.then(() => undefined, () => undefined);
    return operation;
  }

  return { connect, close: () => client.close(), read, update };
}

export function newId(prefix) {
  return `${prefix}-${randomUUID()}`;
}
