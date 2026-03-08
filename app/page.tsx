import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-20">
      <div className="rounded-3xl border bg-card/80 p-10 shadow-xl backdrop-blur">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
          <Sparkles size={14} /> AI + Maps Marketplace
        </div>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
          Discover trusted local services with ranked AI recommendations.
        </h1>
        <p className="mt-4 max-w-2xl text-foreground/80">
          Search mechanics, plumbers, electricians, and more using location-aware maps and agent reasoning over official places API data.
        </p>
        <Link
          href="/marketplace"
          className="mt-8 inline-flex rounded-full bg-primary px-5 py-3 font-medium text-white transition hover:translate-y-[-1px]"
        >
          Open Marketplace
        </Link>
        <Link
          href="/agent-marketplace"
          className="mt-3 inline-flex rounded-full border px-5 py-3 font-medium transition hover:translate-y-[-1px]"
        >
          Open Agent Integration Demo
        </Link>
        <Link
          href="/admin/login"
          className="mt-3 ml-2 inline-flex rounded-full border px-5 py-3 font-medium transition hover:translate-y-[-1px]"
        >
          Admin Login
        </Link>
      </div>
    </main>
  );
}
