import { randomBytes } from "node:crypto";
import { getServers, setServers } from "node:dns";
import { Resolver } from "node:dns/promises";
import { MongoClient } from "mongodb";

const makeId = () => randomBytes(16).toString("hex");

const retryableSrvDnsCodes = new Set(["ECONNREFUSED", "ETIMEOUT", "EAI_AGAIN"]);

export function formatMongoConnectionError(error) {
  if (error?.syscall === "querySrv" && retryableSrvDnsCodes.has(error.code)) {
    return new Error(
      "MongoDB Atlas SRV DNS lookup failed with the configured and fallback DNS resolvers. " +
      "Check that outbound DNS queries are allowed, temporarily disable any VPN or DNS filter, " +
      "set MONGODB_DNS_SERVERS to an allowed DNS resolver, or use Atlas's standard mongodb:// connection string.",
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

export async function connectMongoStore(uri, databaseName, { dnsServers } = {}) {
  if (!uri) throw new Error("Set MONGODB_URI to connect the backend to MongoDB.");
  const fallbackDnsServers = dnsServers
    || process.env.MONGODB_DNS_SERVERS?.split(",").map((server) => server.trim()).filter(Boolean)
    || ["1.1.1.1", "8.8.8.8"];
  let originalDnsServers;
  let client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

  try {
    await client.connect();
  } catch (error) {
    if (!uri.startsWith("mongodb+srv://") || error?.syscall !== "querySrv" || !retryableSrvDnsCodes.has(error.code)) {
      throw formatMongoConnectionError(error);
    }

    originalDnsServers = getServers();
    setServers(fallbackDnsServers);
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      lookup: createDnsLookup(fallbackDnsServers),
    });
    try {
      await client.connect();
    } catch (retryError) {
      setServers(originalDnsServers);
      throw formatMongoConnectionError(retryError);
    }
  }

  const database = client.db(databaseName || undefined);
  try {
    await Promise.all([
      database.collection("users").createIndex({ email: 1 }, { unique: true }),
      database.collection("pages").createIndex({ slug: 1 }, { unique: true }),
      database.collection("plans").createIndex({ slug: 1 }, { unique: true }),
      database.collection("leads").createIndex({ createdAt: -1 }),
    ]);
  } catch (error) {
    await client.close();
    if (originalDnsServers) setServers(originalDnsServers);
    throw error;
  }

  return {
    store: createMongoStore(database),
    close: async () => {
      try {
        await client.close();
      } finally {
        if (originalDnsServers) setServers(originalDnsServers);
      }
    },
  };
}

export function createMongoStore(database) {
  const users = database.collection("users");
  const leads = database.collection("leads");
  const pages = database.collection("pages");
  const plans = database.collection("plans");

  return {
    async createLead(input) {
      const lead = { id: makeId(), ...input, status: "new", createdAt: new Date().toISOString() };
      await leads.insertOne(lead);
      delete lead._id;
      return lead;
    },
    async listLeads({ status, search } = {}) {
      const query = {};
      if (status && status !== "all") query.status = status;
      if (search) {
        const expression = new RegExp(escapeRegex(search), "i");
        query.$or = ["name", "email", "company", "message"].map((field) => ({ [field]: expression }));
      }
      const cursor = leads.find(query).sort({ createdAt: -1 });
      return cursor.toArray();
    },
    async listUserLeads(userId) {
      return leads.find({ userId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    },
    async getLead(id) {
      return leads.findOne({ id });
    },
    async updateLead(id, changes) {
      const result = await leads.findOneAndUpdate({ id }, { $set: { ...changes, updatedAt: new Date().toISOString() } }, { returnDocument: "after" });
      return result;
    },
    async deleteLead(id) {
      return (await leads.deleteOne({ id })).deletedCount > 0;
    },
    async createUser(input) {
      const user = { id: makeId(), ...input, createdAt: new Date().toISOString() };
      await users.insertOne(user);
      delete user._id;
      return user;
    },
    findUserByEmail(email) {
      return users.findOne({ email });
    },
    findUserById(id) {
      return users.findOne({ id });
    },
    async listUsers(search = "") {
      const query = search ? { $or: [{ name: { $regex: escapeRegex(search), $options: "i" } }, { email: { $regex: escapeRegex(search), $options: "i" } }] } : {};
      return users.find(query, { projection: { passwordHash: 0, passwordSalt: 0 } }).sort({ createdAt: -1 }).toArray();
    },
    async deleteUser(id) {
      return (await users.deleteOne({ id })).deletedCount > 0;
    },
    async updateUser(id, changes) {
      return users.findOneAndUpdate({ id }, { $set: changes }, {
        returnDocument: "after",
        projection: { _id: 0, passwordHash: 0, passwordSalt: 0 },
      });
    },
    async listPages() {
      return pages.find({}, { projection: { _id: 0 } }).sort({ slug: 1 }).toArray();
    },
    async getPage(slug) {
      return pages.findOne({ slug }, { projection: { _id: 0 } });
    },
    async createPage(input) {
      const page = { id: makeId(), ...input, updatedAt: new Date().toISOString() };
      await pages.insertOne(page);
      delete page._id;
      return page;
    },
    async updatePage(id, changes) {
      const result = await pages.findOneAndUpdate({ id }, { $set: { ...changes, updatedAt: new Date().toISOString() } }, { returnDocument: "after", projection: { _id: 0 } });
      return result;
    },
    async deletePage(id) {
      return (await pages.deleteOne({ id })).deletedCount > 0;
    },
    async listPlans() {
      return plans.find({}, { projection: { _id: 0 } }).sort({ slug: 1 }).toArray();
    },
    async getPlan(slug) {
      return plans.findOne({ slug }, { projection: { _id: 0 } });
    },
    async createPlan(input) {
      const plan = { id: makeId(), ...input, updatedAt: new Date().toISOString() };
      await plans.insertOne(plan);
      delete plan._id;
      return plan;
    },
    async updatePlan(id, changes) {
      return plans.findOneAndUpdate({ id }, { $set: { ...changes, updatedAt: new Date().toISOString() } }, { returnDocument: "after", projection: { _id: 0 } });
    },
    async deletePlan(id) {
      return (await plans.deleteOne({ id })).deletedCount > 0;
    },
  };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
