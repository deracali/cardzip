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

export function validateCatalogRecord(kind, input) {
  const slug = String(input.slug || "").trim().toLowerCase();
  const name = String(input.name || "").trim();
  const description = String(input.description || "").trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw badRequest("Use a lowercase catalog slug with letters, numbers, and hyphens.");
  if (!name || name.length > 120 || !description || description.length > 1000) {
    throw badRequest("Enter a name and a description of up to 1,000 characters.");
  }

  if (kind === "agents") {
    const team = String(input.team || "").trim();
    const mode = String(input.mode || "").trim();
    if (!team || team.length > 100 || !mode || mode.length > 100) throw badRequest("Enter an agent team and operating mode.");
    return { slug, name, description, team, mode };
  }
  if (kind === "workflows") {
    const trigger = String(input.trigger || "").trim();
    const steps = input.steps;
    if (!trigger || trigger.length > 200 || !Array.isArray(steps) || steps.length < 1 || steps.length > 12
      || steps.some((step) => typeof step !== "string" || !step.trim() || step.trim().length > 160)) {
      throw badRequest("Enter a workflow trigger and between 1 and 12 valid steps.");
    }
    return { slug, name, description, trigger, steps: steps.map((step) => step.trim()) };
  }
  if (kind === "integrations") {
    const category = String(input.category || "").trim();
    if (!category || category.length > 100) throw badRequest("Enter an integration category.");
    return { slug, name, description, category };
  }
  throw badRequest("Choose a supported catalog.");
}

export function validateDocument(input) {
  const slug = String(input.slug || "").trim().toLowerCase();
  const title = String(input.title || "").trim();
  const description = String(input.description || "").trim();
  const filename = String(input.filename || "").trim();
  const contentType = String(input.contentType || "").trim().toLowerCase();
  const contentBase64 = String(input.contentBase64 || "");
  const allowedTypes = new Map([
    [".pdf", "application/pdf"],
    [".txt", "text/plain"],
    [".md", "text/markdown"],
    [".markdown", "text/markdown"],
  ]);
  const extension = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw badRequest("Use a document slug with lowercase letters, numbers, and hyphens.");
  if (!title || title.length > 160 || description.length > 1000) throw badRequest("Enter a title and a description of up to 1,000 characters.");
  if (!filename || filename.length > 180 || /[\\/]/.test(filename) || allowedTypes.get(extension) !== contentType) {
    throw badRequest("Upload a PDF, TXT, or Markdown document with a matching file type.");
  }
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(contentBase64)) {
    throw badRequest("The uploaded document is not valid base64 data.");
  }
  const byteLength = Buffer.byteLength(contentBase64, "base64");
  if (!byteLength || byteLength > 2 * 1024 * 1024 || Buffer.from(contentBase64, "base64").toString("base64") !== contentBase64) {
    throw badRequest("Documents must be smaller than 2 MB and contain valid file data.");
  }
  if (contentType === "application/pdf" && !Buffer.from(contentBase64, "base64").subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw badRequest("The selected file is not a valid PDF.");
  }
  return { slug, title, description, filename, contentType, contentBase64 };
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

export function publicDocument({ contentBase64, ...document }, includeContent = false) {
  delete document._id;
  return includeContent ? { ...document, contentBase64 } : document;
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
