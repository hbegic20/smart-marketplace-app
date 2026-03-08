"use client";

import { FormEvent, useEffect, useState } from "react";

type Provider = {
  name: string;
  distance: number;
  source: string;
};

type AgentResponse = {
  service: string;
  city: string;
  results: Provider[];
};

const services = ["plumber", "car mechanic", "electrician", "locksmith", "hvac"];
const TOKEN_STORAGE_KEY = "marketplace_agent_jwt";

export function AgentSearchForm() {
  const [city, setCity] = useState("Bugojno");
  const [service, setService] = useState("car mechanic");
  const [jwtToken, setJwtToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AgentResponse | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (saved) setJwtToken(saved);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = jwtToken.trim();
      const response = await fetch("/agent/marketplace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ city, service })
      });

      const json = await response.json();

      if (!response.ok) {
        setResult(null);
        setError(json.error ?? "Search failed");
        return;
      }

      setResult(json);
    } catch {
      setResult(null);
      setError("Agent service unavailable");
    } finally {
      setLoading(false);
    }
  }

  function saveToken() {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, jwtToken.trim());
  }

  function clearToken() {
    setJwtToken("");
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  return (
    <section className="rounded-2xl border bg-card p-6">
      <h1 className="text-2xl font-semibold">Agent Provider Search</h1>
      <p className="mt-1 text-sm text-foreground/70">
        Anonymous mode uses public endpoint. Add JWT for authenticated search with history persistence.
      </p>

      <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1">
          <span className="text-sm">City</span>
          <input
            className="rounded-lg border bg-background px-3 py-2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Service</span>
          <select
            className="rounded-lg border bg-background px-3 py-2"
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            {services.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm">JWT token (optional)</span>
          <textarea
            rows={3}
            className="rounded-lg border bg-background px-3 py-2"
            value={jwtToken}
            onChange={(e) => setJwtToken(e.target.value)}
            placeholder="Paste user JWT for authenticated search"
          />
        </label>

        <div className="flex gap-2">
          <button type="button" onClick={saveToken} className="rounded-full border px-4 py-2 text-sm">
            Save Token
          </button>
          <button type="button" onClick={clearToken} className="rounded-full border px-4 py-2 text-sm">
            Clear Token
          </button>
          <button type="submit" disabled={loading} className="rounded-full bg-primary px-4 py-2 text-white disabled:opacity-60">
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

      {result ? (
        <div className="mt-6">
          <h2 className="font-medium">
            Results for {result.service} in {result.city}
          </h2>
          <ul className="mt-3 grid gap-2">
            {result.results.map((provider, index) => (
              <li key={`${provider.name}-${index}`} className="rounded-lg border p-3">
                <p className="font-medium">{provider.name}</p>
                <p className="text-sm text-foreground/70">Distance: {provider.distance.toFixed(2)} km</p>
                <p className="text-sm text-foreground/70">Source: {provider.source}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
