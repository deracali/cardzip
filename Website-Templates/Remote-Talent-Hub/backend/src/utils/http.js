export function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

export function requiredText(value, label, min = 1, max = 5000) {
  if (typeof value !== "string") throw httpError(400, `${label} is required.`);
  const text = value.trim();
  if (text.length < min || text.length > max) {
    throw httpError(400, `${label} must be ${min}-${max} characters.`);
  }
  return text;
}

export function safeJob(job) {
  const { ownerId, ...publicFields } = job;
  return publicFields;
}

export function safeApplication(application) {
  const { candidateId, employerId, ...publicFields } = application;
  return publicFields;
}
