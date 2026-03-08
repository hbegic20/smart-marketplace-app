"use client";

import { FormEvent, useState } from "react";

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

export function AgentSearchForm() {
  const [city, setCity] = useState("Bugojno");
  const [service, setService] = useState("car mechanic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AgentResponse | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/agent/marketplace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
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

  return (
    <section className="rounded-2xl border bg-card p-6">
      <h1 className="text-2xl font-semibold">Agent Provider Search</h1>
      <p className="mt-1 text-sm text-foreground/70">
        Anonymous mode uses public endpoint. Login on `/admin/login` enables authenticated search/history via cookie session.
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

        <div className="flex gap-2">
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
