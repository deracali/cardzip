import { randomUUID } from "node:crypto";
import { getServers, setServers } from "node:dns";
import { Resolver } from "node:dns/promises";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { MongoClient } from "mongodb";

export function createInitialState() {
  return {
    users: [],
    projects: [],
    clients: [],
    team: [],
    invoices: [],
    messages: [],
    inquiries: [],
    caseStudies: [],
    settings: {
      studioName: "NOVA Studio",
      email: "",
      website: "",
      description: "",
      notifications: { projectUpdates: true, clientActivity: true, weeklySummary: false },
    },
    activities: [],
  };
}

export function formatMongoConnectionError(error) {
  if (error?.code === "ECONNREFUSED" && error?.syscall === "querySrv") {
    return new Error(
      "MongoDB Atlas SRV DNS lookup was refused by the configured and fallback DNS resolvers. " +
      "Check that outbound DNS queries are allowed, temporarily disable any VPN or DNS filter, " +
      "set MONGODB_DNS_SERVERS to an allowed DNS resolver, or copy Atlas's standard mongodb:// connection string from Connect > Drivers. " +
      "Do not switch to JSON storage; the API requires MongoDB.",
      { cause: error },
    );
  }
  return error;
}

function createDnsLookup(servers) {
  const resolver = new Resolver();
  resolver.setServers(servers);

  return (hostname, options, callback) => {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }

    const family = typeof options === "number" ? options : options?.family || 0;
    const all = typeof options === "object" && options?.all === true;
    const resolve = family === 4
      ? resolver.resolve4(hostname).then((addresses) => addresses.map((address) => ({ address, family: 4 })))
      : family === 6
        ? resolver.resolve6(hostname).then((addresses) => addresses.map((address) => ({ address, family: 6 })))
        : Promise.allSettled([
          resolver.resolve4(hostname).then((addresses) => addresses.map((address) => ({ address, family: 4 }))),
          resolver.resolve6(hostname).then((addresses) => addresses.map((address) => ({ address, family: 6 }))),
        ]).then((results) => {
          const addresses = results.filter((result) => result.status === "fulfilled").flatMap((result) => result.value);
          if (addresses.length) return addresses;
          throw results.find((result) => result.status === "rejected")?.reason || new Error("DNS lookup returned no addresses.");
        });

    resolve.then((addresses) => {
      if (all) callback(null, addresses);
      else if (addresses[0]) callback(null, addresses[0].address, addresses[0].family);
      else callback(new Error(`DNS lookup returned no addresses for ${hostname}.`));
    }).catch((error) => callback(error));
  };
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

export function createMongoStore(uri, {
  databaseName = "nova_studio",
  dnsServers = ["1.1.1.1", "8.8.8.8"],
} = {}) {
  if (!uri) throw new Error("MONGODB_URI must be set before starting the agency API.");
  let useCustomLookup = false;
  const createClient = () => new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    ...(useCustomLookup ? { lookup: createDnsLookup(dnsServers) } : {}),
  });
  let client = createClient();
  const collection = () => client.db(databaseName).collection("agency_state");
  let connectPromise;
  let writeQueue = Promise.resolve();
  let originalDnsServers;

  function canRetryWithPublicDns(error) {
    return uri.startsWith("mongodb+srv://")
      && !originalDnsServers
      && error?.syscall === "querySrv"
      && ["ECONNREFUSED", "ETIMEOUT", "EAI_AGAIN"].includes(error.code);
  }

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
        if (canRetryWithPublicDns(error)) {
          originalDnsServers = getServers();
          setServers(dnsServers);
          useCustomLookup = true;
          client = createClient();
          return connect();
        }
        throw formatMongoConnectionError(error);
      });
    }
    return connectPromise;
  }

  async function read() {
    await connect();
    const document = await collection().findOne({ _id: "primary" });
    if (!document) throw new Error("MongoDB agency state was not initialized.");
    return document.state;
  }

  function update(mutator) {
    const operation = writeQueue.then(async () => {
      await connect();
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const document = await collection().findOne({ _id: "primary" });
        if (!document) throw new Error("MongoDB agency state was not initialized.");
        const state = structuredClone(document.state);
        const result = await mutator(state);
        const saved = await collection().replaceOne(
          { _id: "primary", revision: document.revision },
          { _id: "primary", revision: document.revision + 1, state },
        );
        if (saved.matchedCount === 1) return result;
      }
      throw new Error("MongoDB agency state changed too frequently to save the update.");
    });
    writeQueue = operation.then(() => undefined, () => undefined);
    return operation;
  }

  return {
    connect,
    async close() {
      try {
        await client.close();
      } finally {
        if (originalDnsServers) {
          setServers(originalDnsServers);
          originalDnsServers = undefined;
        }
      }
    },
    read,
    update,
  };
}

export function newId(prefix) {
  return `${prefix}-${randomUUID()}`;
}
