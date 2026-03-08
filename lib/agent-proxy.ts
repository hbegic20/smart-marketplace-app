export function getAgentApiBaseUrl() {
  const baseUrl = process.env.AGENT_API_BASE_URL?.trim();
  if (baseUrl) return baseUrl.replace(/\/$/, "");

  // Backward compatibility with older env setup.
  const legacy = process.env.AGENT_API_URL?.trim();
  if (!legacy) {
    throw new Error("Missing AGENT_API_BASE_URL");
  }

  try {
    const parsed = new URL(legacy);
    return parsed.origin;
  } catch {
    throw new Error("Invalid AGENT_API_BASE_URL/AGENT_API_URL");
  }
}

export function extractBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth) {
    const [scheme, token] = auth.split(" ");
    if (scheme && token && scheme.toLowerCase() === "bearer") {
      return token.trim() || null;
    }
  }

  // Fallback to session cookie for authenticated requests from browser.
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)agent_access_token=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function safeJson(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
