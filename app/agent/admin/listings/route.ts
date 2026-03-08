import { NextResponse } from "next/server";
import { extractBearerToken, getAgentApiBaseUrl, safeJson } from "@/lib/agent-proxy";

const REQUEST_TIMEOUT_MS = 8000;

async function forward(req: Request, method: "GET" | "POST") {
  const token = extractBearerToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let baseUrl: string;
  try {
    baseUrl = getAgentApiBaseUrl();
  } catch {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    let postBody: unknown;
    if (method === "POST") {
      try {
        postBody = await req.json();
      } catch {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      }
    }

    const response = await fetch(`${baseUrl}/api/v1/admin/listings`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: method === "POST" ? JSON.stringify(postBody) : undefined,
      signal: controller.signal,
      cache: "no-store"
    });

    const json = await safeJson(response);

    if (!response.ok) {
      const status = response.status === 401 || response.status === 403 ? response.status : 502;
      const message =
        response.status === 401
          ? "Unauthorized"
          : response.status === 403
            ? "Forbidden: admin access required"
            : json && typeof json === "object" && "error" in json
              ? String((json as { error: string }).error)
              : "Agent service unavailable";

      return NextResponse.json({ error: message }, { status });
    }

    return NextResponse.json(json);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json({ error: "Agent request timed out" }, { status: 504 });
    }
    return NextResponse.json({ error: "Agent service unavailable" }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(req: Request) {
  return forward(req, "GET");
}

export async function POST(req: Request) {
  return forward(req, "POST");
}
