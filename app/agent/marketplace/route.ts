import { NextResponse } from "next/server";
import { z } from "zod";
import { extractBearerToken, getAgentApiBaseUrl, safeJson } from "@/lib/agent-proxy";

const searchSchema = z.object({
  city: z.string().trim().min(2),
  service: z.string().trim().min(2)
});

const agentItemSchema = z.object({
  name: z.string(),
  distance: z.number().optional(),
  distanceKm: z.number().optional(),
  source: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional()
});

const agentResponseSchema = z.object({
  service: z.string().optional(),
  city: z.string().optional(),
  results: z.array(agentItemSchema),
  reasoning: z.string().optional(),
  nextActions: z.array(z.string()).optional(),
  intent: z.string().optional()
});

const REQUEST_TIMEOUT_MS = 8000;

export async function POST(req: Request) {
  let body: z.infer<typeof searchSchema>;
  try {
    body = searchSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  let baseUrl: string;
  try {
    baseUrl = getAgentApiBaseUrl();
  } catch {
    return NextResponse.json(
      { error: "Server misconfiguration: set AGENT_API_BASE_URL=http://localhost:4000" },
      { status: 500 }
    );
  }

  // Prevent proxy loops when env points to this Next.js app.
  try {
    const selfOrigin = new URL(req.url).origin;
    if (new URL(baseUrl).origin === selfOrigin) {
      return NextResponse.json(
        { error: "Server misconfiguration: AGENT_API_BASE_URL must point to backend (:4000), not this app (:3000)" },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Server misconfiguration: invalid AGENT_API_BASE_URL" }, { status: 500 });
  }

  const token = extractBearerToken(req);
  const targetPath = token ? "/api/v1/agent/marketplace" : "/api/v1/public/agent/marketplace";
  const targetUrl = `${baseUrl}${targetPath}`;

  console.log(`Forwarding agent request to ${targetUrl} with intent="${body.service}" and city="${body.city}"`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store"
    });

    const json = await safeJson(response);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ error: "Unauthorized" }, { status: response.status });
      }
      return NextResponse.json({ error: "Agent service unavailable" }, { status: 502 });
    }

    const parsed = agentResponseSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid response from agent",
          ...(process.env.NODE_ENV !== "production" ? { details: parsed.error.flatten() } : {})
        },
        { status: 502 }
      );
    }

    if (!parsed.data.results.length) {
      return NextResponse.json({ error: "No providers found" }, { status: 404 });
    }

    const normalized = {
      service: parsed.data.service ?? body.service,
      city: parsed.data.city ?? body.city,
      results: parsed.data.results.map((item) => ({
        name: item.name,
        distance: item.distance ?? item.distanceKm ?? 0,
        source: item.source ?? "openstreetmap",
        ...(item.lat !== undefined ? { lat: item.lat } : {}),
        ...(item.lng !== undefined ? { lng: item.lng } : {})
      })),
      ...(parsed.data.reasoning ? { reasoning: parsed.data.reasoning } : {}),
      ...(parsed.data.nextActions ? { nextActions: parsed.data.nextActions } : {})
    };

    return NextResponse.json(normalized);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json({ error: "Agent request timed out" }, { status: 504 });
    }

    return NextResponse.json({ error: "Agent service unavailable" }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
