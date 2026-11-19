import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { MongoClient } from "mongodb";

const demoProducts = [
  { id: "headphones", slug: "soundmaster-pro-headphones", name: "SoundMaster Pro Wireless Noise-Cancelling Headphones", category: "Electronics", price: 49.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85", seller: "TechTrend Co.", sellerSlug: "techtrend", vendorId: "demo-techtrend", stock: 20 },
  { id: "speaker", slug: "portable-bluetooth-speaker", name: "Everyday Portable Bluetooth Speaker", category: "Electronics", price: 34.5, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85", seller: "TechTrend Co.", sellerSlug: "techtrend", vendorId: "demo-techtrend", stock: 20 },
  { id: "watch", slug: "minimalist-everyday-watch", name: "Minimalist Everyday Watch - Midnight", category: "Accessories", price: 62, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85", seller: "North & Pine", sellerSlug: "north-pine", vendorId: "demo-north-pine", stock: 20 },
  { id: "bag", slug: "weekend-crossbody-bag", name: "The Weekend Crossbody Bag", category: "Fashion", price: 38, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85", seller: "North & Pine", sellerSlug: "north-pine", vendorId: "demo-north-pine", stock: 20 },
  { id: "sofa", slug: "softline-accent-chair", name: "Softline Accent Chair in Natural Linen", category: "Home & Living", price: 219, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85", seller: "Haven House", sellerSlug: "haven-house", vendorId: "demo-haven-house", stock: 20 },
  { id: "skin", slug: "botanical-skin-care-set", name: "Botanical Glow Skin Care Set", category: "Beauty", price: 42, image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85", seller: "Sage & Bloom", sellerSlug: "sage-bloom", vendorId: "demo-sage-bloom", stock: 20 },
  { id: "hoodie", slug: "everyday-cotton-hoodie", name: "Everyday Cotton Hoodie - Warm Sand", category: "Fashion", price: 54, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85", seller: "North & Pine", sellerSlug: "north-pine", vendorId: "demo-north-pine", stock: 20 },
  { id: "lamp", slug: "studio-table-lamp", name: "Studio Table Lamp - Warm Brass", category: "Home & Living", price: 76, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85", seller: "Haven House", sellerSlug: "haven-house", vendorId: "demo-haven-house", stock: 20 },
];

export const newId = (prefix) => `${prefix}_${randomUUID()}`;

export function createInitialState() {
  return {
    users: [],
    products: demoProducts.map((product) => ({
      ...product,
      vendorStatus: "approved",
      status: "active",
      createdAt: new Date().toISOString(),
    })),
    orders: [],
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

export function createMongoStore(uri, { databaseName = "markethub" } = {}) {
  if (!uri) throw new Error("MONGODB_URI must be set before starting the MarketHub API.");
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  const collection = () => client.db(databaseName).collection("marketplace_state");
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
    if (!document) throw new Error("MongoDB marketplace state was not initialized.");
    return document.state;
  }

  function update(mutator) {
    const operation = writeQueue.then(async () => {
      await connect();
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const document = await collection().findOne({ _id: "primary" });
        if (!document) throw new Error("MongoDB marketplace state was not initialized.");
        const state = structuredClone(document.state);
        const result = await mutator(state);
        const saved = await collection().replaceOne(
          { _id: "primary", revision: document.revision },
          { _id: "primary", revision: document.revision + 1, state },
        );
        if (saved.matchedCount === 1) return result;
      }
      throw new Error("Marketplace data changed too often to save. Please retry.");
    });
    writeQueue = operation.then(() => undefined, () => undefined);
    return operation;
  }

  return { connect, read, update, close: () => client.close() };
}
