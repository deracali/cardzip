const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, options?: ErrorOptions) {
    super(message, options);
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch (error) {
    throw new Error("Unable to reach the Voltigo Express API. Confirm the backend is running and NEXT_PUBLIC_API_URL is correct.", { cause: error });
  }

  const text = await response.text();
  let result: (T & { error?: string }) | undefined;
  try {
    result = text ? JSON.parse(text) as T & { error?: string } : undefined;
  } catch (error) {
    throw new Error(`The Voltigo API returned an invalid response (HTTP ${response.status}).`, { cause: error });
  }
  if (!response.ok) {
    throw new ApiError(result?.error || `The Voltigo API request failed (HTTP ${response.status}).`, response.status);
  }
  if (!result) {
    throw new Error("The Voltigo API returned an empty response.");
  }
  return result;
}
