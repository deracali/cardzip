import { NextRequest, NextResponse } from "next/server";

export const carewellApiUrl = (
  process.env.CAREWELL_API_URL
  || process.env.NEXT_PUBLIC_CAREWELL_API_URL
  || "http://localhost:5200/api"
).replace(/\/+$/, "");

export async function carewellRequest(request: NextRequest, path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("Cookie", cookie);

  try {
    return await fetch(`${carewellApiUrl}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown connection error";
    throw new Error(`Could not connect to Carewell API: ${message}`);
  }
}

export async function readJson(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON response";
    throw new Error(`Carewell API returned an invalid response: ${message}`);
  }
}

export async function requirePatient(request: NextRequest) {
  const response = await carewellRequest(request, "/auth/me");
  const result = await readJson(response);
  if (!response.ok) {
    return {
      user: null,
      error: NextResponse.json({ error: result.error || "Sign in to continue." }, { status: response.status }),
    };
  }
  if (result.user?.role !== "patient") {
    return {
      user: null,
      error: NextResponse.json({ error: "A patient account is required to book an appointment." }, { status: 403 }),
    };
  }
  return { user: result.user, error: null };
}

export function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "The payment request could not be completed.";
  return NextResponse.json({ error: message }, { status: 502 });
}
