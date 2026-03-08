"use client";

import { FormEvent, useState } from "react";

type Listing = Record<string, unknown>;

export function AdminListingsPanel() {
  const [payload, setPayload] = useState('{\n  "name": "Demo Listing",\n  "city": "Bugojno",\n  "service": "car mechanic",\n  "distance": 1.2,\n  "source": "manual"\n}');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchListings() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/agent/admin/listings", { method: "GET" });
      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Failed to fetch listings");
        setListings([]);
        return;
      }

      setListings(Array.isArray(json) ? json : json.listings ?? []);
    } catch {
      setError("Agent service unavailable");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }

  async function createListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body = JSON.parse(payload);

      const response = await fetch("/agent/admin/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Failed to create listing");
        return;
      }

      await fetchListings();
    } catch {
      setError("Invalid JSON payload");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border bg-card p-6">
      <h1 className="text-2xl font-semibold">Admin Manual Listings</h1>
      <p className="mt-1 text-sm text-foreground/70">Admin session is handled through login/register. No manual JWT input needed.</p>

      <div className="mt-5 flex gap-2">
        <button type="button" onClick={fetchListings} className="rounded-full border px-4 py-2 text-sm" disabled={loading}>
          {loading ? "Loading..." : "Refresh Listings"}
        </button>
      </div>

      <form className="mt-5 grid gap-2" onSubmit={createListing}>
        <span className="text-sm">New listing JSON payload</span>
        <textarea
          rows={8}
          className="rounded-lg border bg-background px-3 py-2 font-mono text-xs"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
        />
        <button type="submit" className="w-fit rounded-full bg-primary px-4 py-2 text-white" disabled={loading}>
          Create Listing
        </button>
      </form>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

      <div className="mt-6">
        <h2 className="font-medium">Current Listings</h2>
        {!listings.length ? <p className="mt-2 text-sm text-foreground/70">No listings loaded.</p> : null}
        <ul className="mt-3 grid gap-2">
          {listings.map((listing, index) => (
            <li key={index} className="rounded-lg border p-3">
              <pre className="whitespace-pre-wrap break-all text-xs">{JSON.stringify(listing, null, 2)}</pre>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
