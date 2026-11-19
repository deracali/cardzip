import { randomBytes } from "node:crypto";

const clone = (value) => structuredClone(value);
const makeId = () => randomBytes(16).toString("hex");

export function createMemoryStore() {
  const users = [];
  const leads = [];
  const pages = [];
  const plans = [];
  return {
    async createLead(input) {
      const lead = { id: makeId(), ...clone(input), status: "new", createdAt: new Date().toISOString() };
      leads.push(lead);
      return clone(lead);
    },
    async listLeads({ status, search } = {}) {
      return clone(leads.filter((lead) => (!status || status === "all" || lead.status === status)
        && (!search || `${lead.name} ${lead.email} ${lead.company} ${lead.message}`.toLowerCase().includes(search.toLowerCase())))
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)));
    },
    async listUserLeads(userId) {
      return clone(leads.filter((lead) => lead.userId === userId)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)));
    },
    async getLead(id) { return clone(leads.find((entry) => entry.id === id) || null); },
    async updateLead(id, changes) {
      const lead = leads.find((entry) => entry.id === id);
      if (!lead) return null;
      Object.assign(lead, clone(changes), { updatedAt: new Date().toISOString() });
      return clone(lead);
    },
    async deleteLead(id) { return removeById(leads, id); },
    async createUser(input) {
      if (users.some((user) => user.email === input.email)) throw duplicateError("Email already exists.");
      const user = { id: makeId(), ...clone(input), createdAt: new Date().toISOString() };
      users.push(user);
      return clone(user);
    },
    async findUserByEmail(email) { return clone(users.find((entry) => entry.email === email) || null); },
    async findUserById(id) { return clone(users.find((entry) => entry.id === id) || null); },
    async listUsers(search = "") {
      return clone(users.filter((user) => !search || `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase()))
        .map(({ passwordHash, passwordSalt, ...user }) => user));
    },
    async deleteUser(id) { return removeById(users, id); },
    async updateUser(id, changes) {
      const user = users.find((entry) => entry.id === id);
      if (!user) return null;
      if (users.some((entry) => entry.id !== id && entry.email === changes.email)) throw duplicateError("Email already exists.");
      Object.assign(user, clone(changes));
      return clone(user);
    },
    async listPages() { return clone(pages); },
    async getPage(slug) { return clone(pages.find((entry) => entry.slug === slug) || null); },
    async createPage(input) { return createUnique(pages, input, "slug"); },
    async updatePage(id, changes) { return updateUnique(pages, id, changes, "slug"); },
    async deletePage(id) { return removeById(pages, id); },
    async listPlans() { return clone(plans); },
    async getPlan(slug) { return clone(plans.find((entry) => entry.slug === slug) || null); },
    async createPlan(input) { return createUnique(plans, input, "slug"); },
    async updatePlan(id, changes) { return updateUnique(plans, id, changes, "slug"); },
    async deletePlan(id) { return removeById(plans, id); },
  };
}

function createUnique(collection, input, uniqueField) {
  if (collection.some((entry) => entry[uniqueField] === input[uniqueField])) throw duplicateError(`${uniqueField} already exists.`);
  const entry = { id: makeId(), ...clone(input), updatedAt: new Date().toISOString() };
  collection.push(entry);
  return Promise.resolve(clone(entry));
}

function updateUnique(collection, id, changes, uniqueField) {
  const entry = collection.find((item) => item.id === id);
  if (!entry) return Promise.resolve(null);
  if (collection.some((item) => item.id !== id && item[uniqueField] === changes[uniqueField])) throw duplicateError(`${uniqueField} already exists.`);
  Object.assign(entry, clone(changes), { updatedAt: new Date().toISOString() });
  return Promise.resolve(clone(entry));
}

function removeById(collection, id) {
  const index = collection.findIndex((entry) => entry.id === id);
  if (index < 0) return false;
  collection.splice(index, 1);
  return true;
}

function duplicateError(message) {
  return Object.assign(new Error(message), { code: 11000 });
}
