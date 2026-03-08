"use client";

import { FormEvent, useState } from "react";

const TOKEN_STORAGE_KEY = "marketplace_admin_jwt";

type Listing = Record<string, unknown>;

export function AdminListingsPanel() {
  const [token, setToken] = useState("");
  const [payload, setPayload] = useState('{\n  "name": "Demo Listing",\n  "city": "Bugojno",\n  "service": "car mechanic",\n  "distance": 1.2,\n  "source": "manual"\n}');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function saveToken() {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token.trim());
  }

  function loadToken() {
    const saved = window.localStorage.getItem(TOKEN_STORAGE_KEY) || "";
    setToken(saved);
  }

  function clearToken() {
    setToken("");
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  async function fetchListings() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/agent/admin/listings", {
        method: "GET",
        headers: {
          ...(token.trim() ? { Authorization: `Bearer ${token.trim()}` } : {})
        }
      });
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
          "Content-Type": "application/json",
          ...(token.trim() ? { Authorization: `Bearer ${token.trim()}` } : {})
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
      <p className="mt-1 text-sm text-foreground/70">Uses JWT + backend email allowlist checks.</p>

      <div className="mt-5 grid gap-2">
        <label className="grid gap-1">
          <span className="text-sm">Admin JWT</span>
          <textarea
            rows={3}
            className="rounded-lg border bg-background px-3 py-2"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste admin JWT"
          />
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={loadToken} className="rounded-full border px-4 py-2 text-sm">
            Load Saved
          </button>
          <button type="button" onClick={saveToken} className="rounded-full border px-4 py-2 text-sm">
            Save Token
          </button>
          <button type="button" onClick={clearToken} className="rounded-full border px-4 py-2 text-sm">
            Clear Token
          </button>
          <button type="button" onClick={fetchListings} className="rounded-full border px-4 py-2 text-sm" disabled={loading}>
            {loading ? "Loading..." : "Refresh Listings"}
          </button>
        </div>
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
