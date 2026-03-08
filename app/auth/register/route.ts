import { NextResponse } from "next/server";
import { z } from "zod";
import { getAgentApiBaseUrl, safeJson } from "@/lib/agent-proxy";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional()
});

function readToken(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const queue: unknown[] = [payload];
  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;
    const obj = current as Record<string, unknown>;

    const direct =
      obj.accessToken ??
      obj.access_token ??
      obj.token ??
      obj.jwt ??
      obj.idToken ??
      obj.id_token;
    if (typeof direct === "string" && direct.trim()) {
      return direct.trim();
    }

    for (const value of Object.values(obj)) {
      if (value && typeof value === "object") queue.push(value);
    }
  }

  return null;
}

export async function POST(req: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid register payload" }, { status: 400 });
  }

  let baseUrl: string;
  try {
    baseUrl = getAgentApiBaseUrl();
  } catch {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const json = await safeJson(response);

  if (!response.ok) {
    const message = json && typeof json === "object" && "error" in json ? String((json as { error: string }).error) : "Registration failed";
    return NextResponse.json({ error: message }, { status: response.status });
  }

  const nextRes = NextResponse.json({ success: true });
  const token = readToken(json);
  if (token) {
    nextRes.cookies.set("agent_access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });
  }

  return nextRes;
}
