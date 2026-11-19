const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const TOKEN_KEY = "remote-talent-hub-token";

export function getToken() {
  return typeof window === "undefined" ? "" : window.localStorage.getItem(TOKEN_KEY) || "";
}

export function saveToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest(path, { method = "GET", body, token = getToken() } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error(`Could not connect to the Remote Talent Hub API at ${API_BASE_URL}.`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The API returned an unreadable response.");
  }
  if (!response.ok) throw new Error(data.message || `The API request failed (${response.status}).`);
  return data;
}
