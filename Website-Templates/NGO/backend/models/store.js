import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { MongoClient } from "mongodb";

const campaignSeed = [
  {
    id: "campaign_clean_water",
    slug: "clean-water-schools",
    category: "Clean Water",
    title: "Provide Clean Water to Rural Schools",
    location: "Kigali, Rwanda",
    raised: 45000,
    goal: 60000,
    image: "/clean-water.jpg",
    description: "Help install reliable water points at rural schools so children can learn, grow, and stay healthy without walking miles for clean water.",
    impact: "$25 provides safe water for one student for a year.",
    updates: ["Well #12 complete - 620 students served", "Solar pumps arrived in Kigali", "Community hygiene training begins next month"],
    active: true,
  },
  {
    id: "campaign_classrooms",
    slug: "classrooms-teachers",
    category: "Education",
    title: "Build Classrooms & Train 200 Teachers",
    location: "Northern Province, Rwanda",
    raised: 28600,
    goal: 40000,
    image: "/classroom.jpg",
    description: "Build welcoming classrooms and give local teachers the materials and training to help every child reach their potential.",
    impact: "$40 equips a classroom with books and learning materials.",
    updates: ["Two classrooms completed this term", "Teacher workshop welcomed 48 educators", "New books delivered to three schools"],
    active: true,
  },
  {
    id: "campaign_mobile_clinics",
    slug: "mobile-clinics",
    category: "Healthcare",
    title: "Mobile Clinics for Remote Villages",
    location: "Eastern Province, Rwanda",
    raised: 18300,
    goal: 30000,
    image: "/mobile-clinic.jpg",
    description: "Bring essential checkups, maternal care, and health education directly to families in rural communities.",
    impact: "$18 helps provide a checkup and essential care.",
    updates: ["Clinic visited 11 villages this month", "Maternal care kits delivered", "Community health workers trained"],
    active: true,
  },
];

export const newId = (prefix) => `${prefix}_${randomUUID()}`;

export function createInitialState() {
  return {
    users: [],
    campaigns: structuredClone(campaignSeed),
    donations: [],
  };
}

export function createStore(filePath) {
  let writeQueue = Promise.resolve();
  const resolvedPath = path.resolve(filePath);

  async function persist(state) {
    await mkdir(path.dirname(resolvedPath), { recursive: true });
    const temporaryPath = `${resolvedPath}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
    await rename(temporaryPath, resolvedPath);
  }

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

export function createMongoStore(uri, { databaseName = "kindred_ngo" } = {}) {
  if (!uri) throw new Error("MONGODB_URI must be set before starting the Kindred API.");
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  const collection = () => client.db(databaseName).collection("ngo_state");
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
    if (!document) throw new Error("Kindred NGO data was not initialized in MongoDB.");
    return document.state;
  }

  function update(mutator) {
    const operation = writeQueue.then(async () => {
      await connect();
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const document = await collection().findOne({ _id: "primary" });
        if (!document) throw new Error("Kindred NGO data was not initialized in MongoDB.");
        const state = structuredClone(document.state);
        const result = await mutator(state);
        const saved = await collection().replaceOne(
          { _id: "primary", revision: document.revision },
          { _id: "primary", revision: document.revision + 1, state },
        );
        if (saved.matchedCount === 1) return result;
      }
      throw new Error("Kindred NGO data changed too often to save. Please retry.");
    });
    writeQueue = operation.then(() => undefined, () => undefined);
    return operation;
  }

  return { connect, read, update, close: () => client.close() };
}
