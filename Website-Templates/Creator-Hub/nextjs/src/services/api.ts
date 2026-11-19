const apiBaseUrl = (process.env.NEXT_PUBLIC_CREATORHUB_API_URL || 'http://localhost:5100/api').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers,
      credentials: 'include',
      cache: 'no-store',
    })
  } catch (cause) {
    throw new Error('Unable to reach the Creator Hub API. Confirm the Express backend is running and NEXT_PUBLIC_CREATORHUB_API_URL is correct.', { cause })
  }
  const text = await response.text()
  let result: (T & { error?: string }) | undefined
  try {
    result = text ? JSON.parse(text) as T & { error?: string } : undefined
  } catch (cause) {
    throw new Error(`The Creator Hub API returned an invalid response (HTTP ${response.status}).`, { cause })
  }
  if (!response.ok) throw new ApiError(result?.error || `The Creator Hub API request failed (HTTP ${response.status}).`, response.status)
  if (!result) throw new Error('The Creator Hub API returned an empty response.')
  return result
}
