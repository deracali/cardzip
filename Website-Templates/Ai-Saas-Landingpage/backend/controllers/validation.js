export function requireObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw badRequest("Request body must be a JSON object.");
  return value;
}

export function validateLead(input, defaultType = "contact") {
  const type = String(input.type || defaultType);
  const name = String(input.name || "").trim();
  const email = String(input.email || "").trim().toLowerCase();
  const company = String(input.company || "").trim();
  const message = String(input.message || "").trim();
  if (!["contact", "signup", "checkout", "demo"].includes(type)) throw badRequest("Choose a valid inquiry type.");
  if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw badRequest("Enter a valid name and work email.");
  }
  if (company.length > 160 || message.length > 5000) throw badRequest("Company or message is too long.");
  if (type === "contact" && (!company || !message)) throw badRequest("Company and message are required for sales inquiries.");
  const billing = input.billing === "monthly" || input.billing === "annual" ? input.billing : "";
  return { type, name, email, company, message, plan: String(input.plan || "").slice(0, 80), billing };
}

export function validateLeadResponse(input) {
  if (typeof input.response !== "string" || input.response.trim().length > 5000) {
    throw badRequest("A response of up to 5,000 characters is required.");
  }
  return input.response.trim();
}

export function validatePage(input) {
  const slug = String(input.slug || "").trim().toLowerCase();
  const title = String(input.title || "").trim();
  if (!(slug === "/" || /^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) || slug === "/admin" || slug === "/api") {
    throw badRequest("Use a page path such as / or /features.");
  }
  if (!title || title.length > 160) throw badRequest("Page title is required and must be 160 characters or fewer.");
  const description = String(input.description || "").trim();
  const eyebrow = String(input.eyebrow || "").trim();
  const sections = input.sections === undefined ? [] : input.sections;
  if (description.length > 2000 || eyebrow.length > 120 || !Array.isArray(sections) || sections.length > 40) {
    throw badRequest("Page content is too large or has an invalid section list.");
  }
  if (Buffer.byteLength(JSON.stringify(sections), "utf8") > 48_000) throw badRequest("Page sections must be smaller than 48 KB.");
  for (const section of sections) {
    if (!section || typeof section !== "object" || Array.isArray(section)
      || (section.title !== undefined && (typeof section.title !== "string" || section.title.length > 200))
      || (section.body !== undefined && (typeof section.body !== "string" || section.body.length > 4000))
      || (section.items !== undefined && (!Array.isArray(section.items) || section.items.length > 40))) {
      throw badRequest("Page sections need valid titles, body text, and item lists.");
    }
    for (const item of section.items || []) {
      if (!item || typeof item !== "object" || Array.isArray(item)
        || (item.title !== undefined && (typeof item.title !== "string" || item.title.length > 200))
        || (item.body !== undefined && (typeof item.body !== "string" || item.body.length > 4000))
        || (item.href !== undefined && !validContentHref(item.href))) {
        throw badRequest("Page items need valid text and a relative or HTTPS link.");
      }
    }
  }
  return { slug, title, description, eyebrow, sections, showInNavigation: Boolean(input.showInNavigation) };
}

export function validatePlan(input) {
  const slug = String(input.slug || "").trim().toLowerCase();
  const name = String(input.name || "").trim();
  const description = String(input.description || "").trim();
  const features = input.features;
  const price = input.price;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !name || name.length > 100) throw badRequest("Plan name and a valid plan slug are required.");
  if (description.length > 1000 || !Array.isArray(features) || features.length > 40 || features.some((item) => typeof item !== "string" || item.length > 200)) {
    throw badRequest("Plan description or feature list is invalid.");
  }
  if (!price || !Number.isFinite(price.monthly) || !Number.isFinite(price.annual) || price.monthly < 0 || price.annual < 0) {
    throw badRequest("Enter valid monthly and annual plan prices.");
  }
  return { slug, name, description, features, price: { monthly: price.monthly, annual: price.annual }, cta: String(input.cta || "Choose plan").slice(0, 80), popular: Boolean(input.popular) };
}

export function badRequest(message) {
  return Object.assign(new Error(message), { status: 400 });
}

export function notFound(message) {
  return Object.assign(new Error(message), { status: 404 });
}

export function duplicateAsConflict(error) {
  if (error.code === 11000) error.status = 409;
  return error;
}

export function publicUser({ passwordHash, passwordSalt, ...user }) {
  delete user._id;
  return user;
}

export function publicLead({ userId, ...lead }) {
  delete lead._id;
  return lead;
}

function validContentHref(value) {
  if (typeof value !== "string" || value.length > 2048) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
